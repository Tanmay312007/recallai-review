/**
 * @CurrentUser() — extracts the authenticated principal that JwtStrategy
 * attached to `request.user`. Reused by every protected controller so handlers
 * never reach into the raw request object.
 *
 * Usage:
 *   @Get('me')
 *   getMe(@CurrentUser() user: AuthenticatedUser) { ... }
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * The principal placed on `request.user` by JwtStrategy.validate(). Derived
 * solely from the verified RS256 access-token payload — never from the client.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  tier: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as AuthenticatedUser;
  },
);
