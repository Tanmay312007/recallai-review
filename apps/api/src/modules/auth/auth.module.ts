/**
 * AuthModule — authentication, token management, and rate limiting.
 *
 * Provides:
 * - CryptoService  — bcrypt hashing (cost 12) for passwords and refresh tokens
 * - TokenService   — RS256 JWT access tokens + opaque UUID refresh tokens with family tracking
 * - RedisService   — Redis client for sliding-window rate limiting (5/15min/IP)
 * - AuthService    — registration, login, refresh, logout, forgot/reset password
 * - AuthController — all /auth/* endpoints per §6
 */
import { Module } from '@nestjs/common';
import { CryptoService } from './services/crypto.service.js';
import { TokenService } from './services/token.service.js';
import { RedisService } from './services/redis.service.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

@Module({
  providers: [
    CryptoService,
    TokenService,
    RedisService,
    AuthService,
  ],
  controllers: [AuthController],
  exports: [
    CryptoService,
    TokenService,
    RedisService,
    AuthService,
  ],
})
export class AuthModule {}
