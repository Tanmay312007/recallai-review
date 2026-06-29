/**
 * Shared building-block schemas reused across request validators.
 */
import { z } from 'zod';

/** UUID v4. Used as the type for every primary key in the system. */
export const uuidSchema = z
  .string()
  .uuid('Must be a valid UUID v4')
  .min(1, 'Required');

/** ISO 8601 datetime string. */
export const isoDateSchema = z.string().datetime({ offset: true });

/** Email address (RFC 5322 via Zod's built-in). */
export const emailSchema = z
  .string()
  .email('Must be a valid email address')
  .max(255, 'Email must be 255 characters or fewer')
  .toLowerCase()
  .trim();

/** Non-empty trimmed string. */
export const nonEmptyString = z
  .string()
  .trim()
  .min(1, 'Must not be empty');

/** Pagination query params shared by all list endpoints (§6, 50/page default). */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  perPage: z.coerce
    .number()
    .int()
    .positive()
    .max(100, 'per page must be 100 or fewer')
    .default(50),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * PROMPT §9 requires "Reject unknown fields" on every endpoint. This is
 * enforced by calling `.strict()` directly on each request body schema (see
 * validation/auth.ts, cards.ts, etc.). `.strict()` on a Zod object causes any
 * unrecognized key to produce a validation error.
 */
