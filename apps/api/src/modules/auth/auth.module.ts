/**
 * AuthModule — authentication, token management, and rate limiting.
 *
 * Provides:
 * - CryptoService  — bcrypt hashing (cost 12) for passwords and refresh tokens
 * - TokenService   — RS256 JWT access tokens + opaque UUID refresh tokens with family tracking
 * - RedisService   — Redis client for sliding-window rate limiting (5/15min/IP)
 * - AuthService    — registration, login, refresh, logout, forgot/reset password
 * - JwtStrategy    — verifies RS256 access tokens on protected routes
 * - AuthController — all /auth/* endpoints per §6
 *
 * Registers JwtAuthGuard as a global APP_GUARD so every route is protected by
 * default; @Public() opts a route out (secure-by-default, PROMPT §9).
 */
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { CryptoService } from './services/crypto.service.js';
import { TokenService } from './services/token.service.js';
import { RedisService } from './services/redis.service.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Module({
  imports: [PassportModule],
  providers: [
    CryptoService,
    TokenService,
    RedisService,
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [CryptoService, TokenService, RedisService, AuthService],
})
export class AuthModule {}
