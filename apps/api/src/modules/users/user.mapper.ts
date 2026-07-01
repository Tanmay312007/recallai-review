/**
 * toUserDto — maps the private Prisma `User` model to the public `UserDto`
 * wire format (PROMPT §5: Prisma models stay internal; DTOs are the contract).
 *
 * SECURITY (PROMPT §15): the mapper deliberately omits `passwordHash`,
 * `stripeCustomerId`, `stripeSubId`, and `generationSuspended` so they can
 * never leak through an API response. Timestamps are serialized to ISO 8601.
 *
 * Shared by AuthService (register/login/refresh responses) and the future
 * UsersModule (GET /users/me) — one mapper, no duplication.
 */
import type { User } from '@prisma/client';
import type { UserDto } from '@lumora/shared';

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    avatarUrl: user.avatarUrl,
    tier: user.tier,
    dataRegion: user.dataRegion,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastActiveAt: user.lastActiveAt ? user.lastActiveAt.toISOString() : null,
    deletionRequestedAt: user.deletionRequestedAt
      ? user.deletionRequestedAt.toISOString()
      : null,
  };
}
