/**
 * JwtStrategy — validates RS256 access tokens on protected routes.
 *
 * PROMPT §9: access tokens are RS256-signed JWTs verified with the public key.
 * The bearer token is read from the Authorization header. The decoded payload
 * (sub/email/tier) becomes `request.user` via validate(), consumed by the
 * @CurrentUser() decorator.
 *
 * We never trust the tier claim for entitlement decisions on its own — the
 * EntitlementGuard (later phase) re-reads tier from the DB. The claim is only a
 * convenience for logging/UX hints (PROMPT §15).
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, type StrategyOptions } from 'passport-jwt';
import type { EnvConfig } from '../../../config/env.validation.js';
import type { AuthenticatedUser } from '../decorators/current-user.decorator.js';
import type { JwtPayload } from '../services/token.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService<EnvConfig>) {
    const publicKey = configService.get<string>('JWT_PUBLIC_KEY', {
      infer: true,
    });
    if (!publicKey) {
      // Fail fast — env.validation already guarantees this, but the type is
      // optional after get(), so we assert it here for safety.
      throw new Error('JWT_PUBLIC_KEY is not configured');
    }

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    };
    super(options);
  }

  /**
   * Runs only after the signature + expiry are verified. The returned value is
   * attached to `request.user`.
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Malformed access token');
    }
    return {
      id: payload.sub,
      email: payload.email,
      tier: payload.tier,
    };
  }
}
