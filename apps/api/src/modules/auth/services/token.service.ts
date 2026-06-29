/**
 * TokenService — RS256 JWT signing/verification + refresh token lifecycle.
 *
 * PROMPT §9 security requirements:
 * - Access tokens: JWT signed with RS256 (asymmetric), 15-minute expiry.
 * - Refresh tokens: opaque UUID v4, bcrypt-hashed in DB, HttpOnly+Secure+SameSite=Strict cookie.
 * - Token families: each refresh creates a new token in the same family;
 *   if a previously-rotated token is reused, the entire family is invalidated
 *   (RFC-001 token-family theft detection, Vol VI).
 *
 * The RS256 private key is read from JWT_PRIVATE_KEY env var.
 * The RS256 public key is read from JWT_PUBLIC_KEY env var.
 * Both are injected via ConfigModule and must be PEM-formatted.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '../../../config/env.validation.js';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

/** Shape of the data we embed in the access-token payload. */
export interface JwtPayload {
  sub: string; // user UUID
  email: string;
  tier: string;
  iat?: number;
  exp?: number;
}

/** Shape returned after a successful token-pair generation. */
export interface TokenPairResult {
  accessToken: string;
  refreshToken: string; // plaintext — caller sets the HttpOnly cookie
  /** Expiry timestamp (ISO string) for the refresh token session. */
  refreshExpiresAt: Date;
  /** The UUID family this refresh token belongs to. */
  tokenFamily: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly accessExpiry: string;
  private readonly refreshExpiryMs: number;

  constructor(private readonly configService: ConfigService<EnvConfig>) {
    this.privateKey = this.configService.get<string>('JWT_PRIVATE_KEY', { infer: true })!;
    this.publicKey = this.configService.get<string>('JWT_PUBLIC_KEY', { infer: true })!;
    this.accessExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRY', { infer: true })!;
    const refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY', { infer: true })!;
    // Parse "30d", "7d", etc. into milliseconds
    this.refreshExpiryMs = this.parseDuration(refreshExpiry);
  }

  /**
   * Verify an access token using the RS256 public key.
   * Returns the decoded payload if valid; throws JwtError on expiry/invalid.
   */
  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.publicKey, {
      algorithms: ['RS256'],
    }) as JwtPayload;
  }

  /**
   * Generate a new access token for the given user.
   */
  signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: this.accessExpiry,
      subject: payload.sub,
    });
  }

  /**
   * Generate a complete token pair (access + refresh) for a new or refreshed session.
   *
   * The refresh token is a raw UUID v4. It MUST be bcrypt-hashed by the caller
   * before storing in user_sessions.tokenHash.
   */
  generateTokenPair(user: {
    id: string;
    email: string;
    tier: string;
  }): TokenPairResult {
    const accessToken = this.signAccessToken({
      sub: user.id,
      email: user.email,
      tier: user.tier,
    });

    // Refresh token: opaque random UUID — verifiable only via DB lookup
    const refreshToken = randomUUID();
    const tokenFamily = randomUUID();
    const refreshExpiresAt = new Date(Date.now() + this.refreshExpiryMs);

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt,
      tokenFamily,
    };
  }

  /**
   * Generate a new refresh token within an EXISTING token family.
   * Used during token refresh — the family stays the same so we can detect reuse.
   */
  rotateRefreshToken(): {
    refreshToken: string;
    refreshExpiresAt: Date;
  } {
    return {
      refreshToken: randomUUID(),
      refreshExpiresAt: new Date(Date.now() + this.refreshExpiryMs),
    };
  }

  /**
   * Parse a human-friendly duration string like "15m", "30d", "1h" into milliseconds.
   * Supports: s (seconds), m (minutes), h (hours), d (days).
   */
  private parseDuration(str: string): number {
    const match = /^(\d+)([smhd])$/.exec(str);
    if (!match) {
      this.logger.warn(`Invalid duration "${str}", falling back to 7d`);
      return 7 * 24 * 60 * 60 * 1000;
    }
    const value = parseInt(match[1]!, 10);
    switch (match[2]) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
