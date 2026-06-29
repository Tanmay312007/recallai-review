/**
 * @Public() — marks a route handler (or controller) as exempt from the global
 * JwtAuthGuard. Used on /auth/* endpoints (register, login, refresh, …) that
 * must be reachable without an access token.
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
