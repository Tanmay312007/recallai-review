/**
 * CryptoService — bcrypt wrapper for password hashing and refresh-token hashing.
 *
 * PROMPT §9 mandates bcrypt cost factor 12 for all password operations.
 * Refresh tokens are also bcrypt-hashed before storage in user_sessions.tokenHash
 * so that a DB leak does not expose usable tokens (same principle as passwords).
 *
 * SECURITY: passwords are never logged, never stored in plaintext, never returned
 * in any API response.
 */
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/** bcrypt cost factor — deliberately hardcoded per PROMPT §9. */
const BCRYPT_ROUNDS = 12;

@Injectable()
export class CryptoService {
  /**
   * Hash a plaintext password (or refresh token) using bcrypt with cost 12.
   * Returns the full salt+hash string suitable for storage.
   */
  async hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, BCRYPT_ROUNDS);
  }

  /**
   * Compare a plaintext value against a stored bcrypt hash.
   * Returns true on match, false on mismatch.
   *
   * Timing-safe — bcrypt.compare has constant-time comparison internally.
   */
  async compare(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }
}
