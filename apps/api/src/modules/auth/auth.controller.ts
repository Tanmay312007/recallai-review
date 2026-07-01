/**
 * AuthController — all /auth/* endpoints (PROMPT §6 Authentication).
 *
 *   POST /auth/register         create account + issue session
 *   POST /auth/login            authenticate + issue session  (rate-limited)
 *   POST /auth/refresh          rotate refresh token
 *   POST /auth/logout           revoke current session
 *   POST /auth/forgot-password  begin reset                   (rate-limited)
 *   POST /auth/reset-password   complete reset
 *
 * The refresh token is transported ONLY as an HttpOnly, Secure, SameSite=Strict
 * cookie (PROMPT §15: never in localStorage). The access token is returned in
 * the JSON body for the client to hold in memory. All bodies are validated by
 * the shared Zod schemas via ZodValidationPipe (rejects unknown fields, §9).
 */
import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ErrorCode } from '@lumora/shared';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type LoginRequest,
  type RegisterRequest,
} from '@lumora/shared';
import type { EnvConfig } from '../../config/env.validation.js';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe.js';
import { Public } from './decorators/public.decorator.js';
import {
  AuthService,
  type AuthSessionResult,
  type SessionContext,
} from './auth.service.js';
import { RedisService } from './services/redis.service.js';

/** Name of the HttpOnly refresh-token cookie. */
const REFRESH_COOKIE = 'recallai_rt';
/** Rate limit: 5 attempts / 15 min / IP for sensitive auth endpoints (§9). */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

interface ForgotPasswordBody {
  email: string;
}
interface ResetPasswordBody {
  token: string;
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
@Public() // every auth endpoint is reachable without an access token
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly redis: RedisService,
    configService: ConfigService<EnvConfig>,
  ) {
    this.isProduction =
      configService.get<string>('NODE_ENV', { infer: true }) === 'production';
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new account' })
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(
    @Body() dto: RegisterRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: AuthSessionResult['user']; accessToken: string }> {
    const result = await this.authService.register(dto, this.contextOf(req));
    return this.respondWithSession(res, result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and start a session' })
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() dto: LoginRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: AuthSessionResult['user']; accessToken: string }> {
    await this.enforceRateLimit('login', req);
    const result = await this.authService.login(dto, this.contextOf(req));
    return this.respondWithSession(res, result);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: AuthSessionResult['user']; accessToken: string }> {
    const token = this.readRefreshCookie(req);
    const result = await this.authService.refresh(token, this.contextOf(req));
    return this.respondWithSession(res, result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current session' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = this.readRefreshCookie(req);
    await this.authService.logout(token);
    this.clearRefreshCookie(res);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request a password-reset link' })
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  async forgotPassword(
    @Body() dto: ForgotPasswordBody,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    await this.enforceRateLimit('forgot', req);
    // Token is created only when the email exists; the response never reveals
    // which case occurred (enumeration resistance, §9). Email delivery of the
    // token is wired in Phase 9 (ResendMailer); for now the service returns it.
    await this.authService.createPasswordResetToken(dto.email);
    return {
      message:
        'If an account exists for that email, a reset link has been sent.',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a password reset' })
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  async resetPassword(
    @Body() dto: ResetPasswordBody,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(dto.token, dto.password);
    // Reset revokes all sessions server-side; clear the cookie too.
    this.clearRefreshCookie(res);
    return { message: 'Password updated. Please sign in again.' };
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  /** Sets the refresh cookie and returns the public session payload. */
  private respondWithSession(
    res: Response,
    result: AuthSessionResult,
  ): { user: AuthSessionResult['user']; accessToken: string } {
    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    return { user: result.user, accessToken: result.accessToken };
  }

  private setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth',
      expires: expiresAt,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
  }

  /**
   * Read the refresh token from the HttpOnly cookie. We parse the Cookie header
   * directly so no cookie-parser dependency is required (PROMPT: no unnecessary
   * libraries). Returns '' when absent (refresh() then throws AUTH_004).
   */
  private readRefreshCookie(req: Request): string {
    const header = req.headers.cookie;
    if (!header) {
      return '';
    }
    for (const part of header.split(';')) {
      const eq = part.indexOf('=');
      if (eq === -1) {
        continue;
      }
      const name = part.slice(0, eq).trim();
      if (name === REFRESH_COOKIE) {
        return decodeURIComponent(part.slice(eq + 1).trim());
      }
    }
    return '';
  }

  private contextOf(req: Request): SessionContext {
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress =
      (typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : undefined) ??
      req.ip;
    const context: SessionContext = {};
    const userAgent = req.headers['user-agent'];
    if (typeof userAgent === 'string') {
      context.userAgent = userAgent;
    }
    if (ipAddress) {
      context.ipAddress = ipAddress;
    }
    return context;
  }

  /**
   * Sliding-window rate limit keyed by endpoint + client IP. Fails open if
   * Redis is unavailable (logged at startup) so dev is unblocked; production
   * runs with Redis. Throws RATE_LIMIT_001 (429) when exceeded.
   */
  private async enforceRateLimit(scope: string, req: Request): Promise<void> {
    const ip = this.contextOf(req).ipAddress ?? 'unknown';
    const key = `ratelimit:auth:${scope}:${ip}`;
    const result = await this.redis.slidingWindowRateLimit(
      key,
      RATE_LIMIT,
      RATE_WINDOW_MS,
    );
    if (!result.allowed) {
      throw new HttpException(
        {
          code: ErrorCode.RATE_LIMIT_001,
          message: 'Too many attempts. Please try again later.',
          retryAfterMs: result.retryAfterMs,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
