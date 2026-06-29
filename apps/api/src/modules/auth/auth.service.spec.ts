/**
 * AuthService unit tests — focus on the security-critical behaviors:
 *   - register rejects duplicate emails (AUTH_006)
 *   - login is enumeration-resistant (same error for unknown user / bad password)
 *   - login succeeds with a valid password and issues a session
 *   - refresh rotates a live token and revokes the presented one
 *   - refresh detects reuse of a revoked token and burns the whole family
 *
 * Prisma, Crypto, and Token services are mocked so the suite is fast and has no
 * external dependencies.
 */
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { User, UserSession } from '@prisma/client';
import { AuthService, type SessionContext } from './auth.service.js';
import { CryptoService } from './services/crypto.service.js';
import { TokenService } from './services/token.service.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';

const CTX: SessionContext = { userAgent: 'jest', ipAddress: '127.0.0.1' };

function makeUser(overrides: Partial<User> = {}): User {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: 'user-1',
    email: 'alice@example.com',
    emailVerified: false,
    passwordHash: '$2b$12$hash',
    name: 'Alice',
    avatarUrl: null,
    tier: 'FREE',
    dataRegion: 'US',
    stripeCustomerId: null,
    stripeSubId: null,
    generationSuspended: false,
    deletionRequestedAt: null,
    createdAt: now,
    updatedAt: now,
    lastActiveAt: null,
    ...overrides,
  };
}

function makeSession(overrides: Partial<UserSession> = {}): UserSession {
  return {
    id: 'session-1',
    userId: 'user-1',
    tokenHash: '$2b$12$sessionhash',
    tokenFamily: 'family-1',
    expiresAt: new Date(Date.now() + 60_000),
    lastUsedAt: null,
    userAgent: 'jest',
    ipAddress: '127.0.0.1',
    revoked: false,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    userSession: {
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let crypto: { hash: jest.Mock; compare: jest.Mock };
  let tokens: {
    generateTokenPair: jest.Mock;
    rotateRefreshToken: jest.Mock;
    signAccessToken: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue(makeUser()),
      },
      userSession: {
        create: jest.fn().mockResolvedValue(makeSession()),
        update: jest.fn().mockResolvedValue(makeSession()),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn().mockImplementation((ops: unknown[]) => Promise.resolve(ops)),
    };
    crypto = {
      hash: jest.fn().mockResolvedValue('$2b$12$newhash'),
      compare: jest.fn().mockResolvedValue(false),
    };
    tokens = {
      generateTokenPair: jest.fn().mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        refreshExpiresAt: new Date(Date.now() + 86_400_000),
        tokenFamily: 'family-1',
      }),
      rotateRefreshToken: jest.fn().mockReturnValue({
        refreshToken: 'rotated-token',
        refreshExpiresAt: new Date(Date.now() + 86_400_000),
      }),
      signAccessToken: jest.fn().mockReturnValue('new-access-token'),
    };

    service = new AuthService(
      prisma as unknown as PrismaService,
      crypto as unknown as CryptoService,
      tokens as unknown as TokenService,
    );
  });

  describe('register', () => {
    it('rejects a duplicate email with AUTH_006', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.register(
        { email: 'alice@example.com', password: 'Password1' },
        CTX,
      )).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates the user and issues a session', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(makeUser());

      const result = await service.register(
        { email: 'alice@example.com', password: 'Password1', dataRegion: 'EU' },
        CTX,
      );

      expect(crypto.hash).toHaveBeenCalledWith('Password1');
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ dataRegion: 'EU' }),
        }),
      );
      expect(prisma.userSession.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('access-token');
      expect(result.user.email).toBe('alice@example.com');
    });
  });

  describe('login', () => {
    it('throws AUTH_001 when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@example.com', password: 'Password1' }, CTX),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      // A bcrypt comparison still ran against the dummy hash (timing parity).
      expect(crypto.compare).toHaveBeenCalled();
    });

    it('throws AUTH_001 on a wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      crypto.compare.mockResolvedValue(false);
      await expect(
        service.login({ email: 'alice@example.com', password: 'wrong' }, CTX),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('issues a session on a correct password', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      crypto.compare.mockResolvedValue(true);

      const result = await service.login(
        { email: 'alice@example.com', password: 'Password1' },
        CTX,
      );

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(prisma.userSession.create).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('throws AUTH_004 when no matching session is found', async () => {
      prisma.userSession.findMany.mockResolvedValue([makeSession()]);
      crypto.compare.mockResolvedValue(false); // no candidate matches
      await expect(service.refresh('some-token', CTX)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rotates a live token within the same family', async () => {
      const live = makeSession();
      prisma.userSession.findMany.mockResolvedValue([live]);
      crypto.compare.mockResolvedValue(true);
      prisma.user.findUnique.mockResolvedValue(makeUser());

      const result = await service.refresh('refresh-token', CTX);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(tokens.rotateRefreshToken).toHaveBeenCalled();
      expect(result.refreshToken).toBe('rotated-token');
      expect(result.accessToken).toBe('new-access-token');
    });

    it('burns the family when a revoked token is reused', async () => {
      const revoked = makeSession({ revoked: true });
      prisma.userSession.findMany.mockResolvedValue([revoked]);
      crypto.compare.mockResolvedValue(true);

      await expect(service.refresh('refresh-token', CTX)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.userSession.updateMany).toHaveBeenCalledWith({
        where: { tokenFamily: 'family-1', revoked: false },
        data: { revoked: true },
      });
    });
  });
});
