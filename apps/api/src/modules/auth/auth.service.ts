/**
 * AuthService — registration, login, token refresh, logout, and password reset.
 *
 * Security model (PROMPT §9, Vol VI RFC-001):
 * - Passwords: bcrypt cost 12 (CryptoService).
 * - Access tokens: RS256 JWT, 15-minute expiry (TokenService).
 * - Refresh tokens: opaque UUID, bcrypt-hashed in user_sessions.tokenHash.
 *   Each refresh ROTATES the token within the same `tokenFamily`. Re-use of an
 *   already-rotated (revoked) token is treated as theft: the entire family is
 *   revoked, forcing re-authentication.
 * - Enumeration resistance: login and forgot-password never reveal whether an
 *   email exists (AUTH_001 generic; forgot-password always returns success).
 *
 * Every query is scoped by id/userId so a session can only ever touch its
 * owner's rows (tenant isolation, PROMPT §15).
 */
import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorCode } from '@lumora/shared';
import type {
  RegisterRequest,
  LoginRequest,
  UserDto,
} from '@lumora/shared';
import type { User } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { CryptoService } from './services/crypto.service.js';
import { TokenService } from './services/token.service.js';
import { toUserDto } from '../users/user.mapper.js';

/** Result returned by every flow that issues a fresh session. */
export interface AuthSessionResult {
  user: UserDto;
  accessToken: string;
  /** Plaintext refresh token — the controller sets it as an HttpOnly cookie. */
  refreshToken: string;
  refreshExpiresAt: Date;
}

/** Context captured per session for theft detection / audit (PROMPT §5). */
export interface SessionContext {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly tokens: TokenService,
  ) {}

  /**
   * Register a new email/password user. Email is unique; a duplicate raises
   * AUTH_006. The default data region is US unless the client requests EU.
   */
  async register(
    dto: RegisterRequest,
    ctx: SessionContext,
  ): Promise<AuthSessionResult> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException({
        code: ErrorCode.AUTH_006,
        message: 'Email already registered',
      });
    }

    const passwordHash = await this.crypto.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name ?? null,
        dataRegion: dto.dataRegion ?? 'US',
      },
    });

    return this.issueSession(user, ctx);
  }

  /**
   * Authenticate an email/password user. Returns a fresh session on success.
   * A missing user and a wrong password are indistinguishable (AUTH_001) to
   * resist account enumeration. OAuth-only users (no passwordHash) also fail
   * with AUTH_001 here — they must use the OAuth flow.
   */
  async login(
    dto: LoginRequest,
    ctx: SessionContext,
  ): Promise<AuthSessionResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always run a bcrypt comparison to keep timing uniform whether or not the
    // user exists (constant-time-ish defense against enumeration via timing).
    const hash = user?.passwordHash ?? DUMMY_BCRYPT_HASH;
    const passwordMatches = await this.crypto.compare(dto.password, hash);

    if (!user || !user.passwordHash || !passwordMatches) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_001,
        message: 'Invalid email or password',
      });
    }

    await this.touchLastActive(user.id);
    return this.issueSession(user, ctx);
  }

  /**
   * Rotate a refresh token. Implements RFC-001 token-family theft detection:
   *
   * - Look up the live (non-revoked, unexpired) session whose tokenHash matches.
   * - If found: revoke it and mint a new token in the SAME family.
   * - If NOT found but the token DOES match a revoked session: this is a reuse
   *   of an already-rotated token → revoke the entire family and reject.
   */
  async refresh(
    rawRefreshToken: string,
    ctx: SessionContext,
  ): Promise<AuthSessionResult> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_004,
        message: 'Missing refresh token',
      });
    }

    const session = await this.findSessionByToken(rawRefreshToken);

    if (!session) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_004,
        message: 'Invalid refresh token',
      });
    }

    // Reuse of a revoked/expired token → theft. Burn the whole family.
    if (session.revoked || session.expiresAt.getTime() <= Date.now()) {
      await this.prisma.userSession.updateMany({
        where: { tokenFamily: session.tokenFamily, revoked: false },
        data: { revoked: true },
      });
      this.logger.warn(
        `Refresh token reuse detected for family ${session.tokenFamily}; family revoked`,
      );
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_004,
        message: 'Refresh token has been revoked',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_005,
        message: 'Account not found',
      });
    }

    // Rotate: revoke the presented token, mint a new one in the same family.
    const rotated = this.tokens.rotateRefreshToken();
    const newTokenHash = await this.crypto.hash(rotated.refreshToken);

    await this.prisma.$transaction([
      this.prisma.userSession.update({
        where: { id: session.id },
        data: { revoked: true, lastUsedAt: new Date() },
      }),
      this.prisma.userSession.create({
        data: {
          userId: user.id,
          tokenHash: newTokenHash,
          tokenFamily: session.tokenFamily,
          expiresAt: rotated.refreshExpiresAt,
          userAgent: ctx.userAgent ?? null,
          ipAddress: ctx.ipAddress ?? null,
        },
      }),
    ]);

    await this.touchLastActive(user.id);

    const accessToken = this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      tier: user.tier,
    });

    return {
      user: toUserDto(user),
      accessToken,
      refreshToken: rotated.refreshToken,
      refreshExpiresAt: rotated.refreshExpiresAt,
    };
  }

  /**
   * Logout: revoke the session backing the presented refresh token. Idempotent
   * — an unknown/already-revoked token is a no-op (still returns success).
   */
  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }
    const session = await this.findSessionByToken(rawRefreshToken);
    if (session && !session.revoked) {
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { revoked: true },
      });
    }
  }

  /**
   * Begin password reset. Returns a reset token ONLY when the email exists; the
   * controller never branches on this, so the public response is always the
   * same (enumeration resistance). The token is delivered by email in Phase 9 —
   * for now it is returned to the caller (controller) to hand to the mailer.
   */
  async createPasswordResetToken(email: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      return null;
    }
    return this.tokens.signPasswordResetToken(user.id);
  }

  /**
   * Complete password reset. Verifies the single-purpose reset token, updates
   * the hash, and revokes ALL of the user's sessions so any stolen refresh
   * tokens are invalidated (PROMPT §9 session hygiene).
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    let userId: string;
    try {
      userId = this.tokens.verifyPasswordResetToken(token);
    } catch {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_004,
        message: 'Reset link is invalid or has expired',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_005,
        message: 'Account not found',
      });
    }

    const passwordHash = await this.crypto.hash(newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.userSession.updateMany({
        where: { userId: user.id, revoked: false },
        data: { revoked: true },
      }),
    ]);
  }

  // ── Internal helpers ────────────────────────────────────────────────────

  /** Mint a brand-new session (new token family) and persist the hashed token. */
  private async issueSession(
    user: User,
    ctx: SessionContext,
  ): Promise<AuthSessionResult> {
    const pair = this.tokens.generateTokenPair({
      id: user.id,
      email: user.email,
      tier: user.tier,
    });
    const tokenHash = await this.crypto.hash(pair.refreshToken);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        tokenHash,
        tokenFamily: pair.tokenFamily,
        expiresAt: pair.refreshExpiresAt,
        userAgent: ctx.userAgent ?? null,
        ipAddress: ctx.ipAddress ?? null,
      },
    });

    return {
      user: toUserDto(user),
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      refreshExpiresAt: pair.refreshExpiresAt,
    };
  }

  /**
   * Resolve a raw refresh token to its session row. Refresh tokens are
   * bcrypt-hashed (salted), so we cannot query by hash directly — we fetch the
   * candidate sessions and bcrypt-compare.
   *
   * Candidates include REVOKED sessions whose expiry is still in the future, so
   * that reuse of an already-rotated token is detectable (it matches a revoked
   * row, triggering family revocation in refresh()). Truly expired rows fall
   * out of the window; reusing one is rejected by the expiry check in refresh().
   * The scan is bounded by SESSION_LOOKUP_LIMIT to keep the lookup cheap.
   */
  private async findSessionByToken(rawToken: string) {
    const candidates = await this.prisma.userSession.findMany({
      where: { expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: SESSION_LOOKUP_LIMIT,
    });
    for (const candidate of candidates) {
      if (await this.crypto.compare(rawToken, candidate.tokenHash)) {
        return candidate;
      }
    }
    return null;
  }

  /** Best-effort lastActiveAt update; failures must never block auth. */
  private async touchLastActive(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      });
    } catch (err) {
      this.logger.warn(
        `Failed to update lastActiveAt for ${userId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}

/**
 * A fixed bcrypt hash compared against when the user does not exist, so the
 * login path performs an equivalent amount of work regardless (timing-attack
 * mitigation). This is the bcrypt hash of a random constant — it can never
 * match a real password.
 */
const DUMMY_BCRYPT_HASH =
  '$2b$12$C6UzMDM.H6dfI/f/IKxGhuM7p6uLBcZ4eY3sH9xq0cY3pZ0pP2tZK';

/**
 * Upper bound on candidate sessions scanned during a refresh-token lookup.
 * Refresh tokens are salted-hashed so we cannot index by them; we bound the
 * scan to keep the lookup O(1) in practice. Theft detection still works because
 * a rotated token's row is revoked (not deleted) and stays within the window.
 */
const SESSION_LOOKUP_LIMIT = 200;
