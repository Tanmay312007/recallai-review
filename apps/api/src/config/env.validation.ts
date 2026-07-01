/**
 * Environment variable validation (PROMPT §13). Runs at NestJS startup so
 * the service fails fast with a clear message if any required variable is
 * missing. Uses Zod for validation — the same Zod already in @lumora/shared.
 *
 * The `validatedData` return type gives ConfigService.get<T>() full type
 * safety without casts.
 */
import { z } from 'zod';

const envSchema = z
  .object({
    // ── Application ──────────────────────────────────────────────────
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),

    // ── Database (required — service cannot start without it) ───────────
    DATABASE_URL: z.string().url(),

    // ── JWT (RS256 key pair) ──────────────────────────────────────────
    JWT_PRIVATE_KEY: z.string().min(1, 'JWT_PRIVATE_KEY is required'),
    JWT_PUBLIC_KEY: z.string().min(1, 'JWT_PUBLIC_KEY is required'),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('30d'),

    // ── Redis (required for BullMQ queues) ────────────────────────────
    REDIS_URL: z.string().url().default('redis://localhost:6379'),

    // ── Google OAuth (optional in Phase 1, required by Phase 2) ───────
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().url().optional(),

    // ── AWS S3 (optional until Phase 3) ────────────────────────────────
    AWS_REGION: z.string().default('us-east-1'),
    AWS_S3_UPLOADS_BUCKET: z.string().optional(),
    AWS_S3_EXPORTS_BUCKET: z.string().optional(),
    AWS_S3_MEDIA_BUCKET: z.string().optional(),

    // ── Stripe (optional until Phase 8) ────────────────────────────────
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PRO_PRICE_ID: z.string().optional(),

    // ── Email (optional until Phase 9) ──────────────────────────────────
    RESEND_API_KEY: z.string().optional(),
    FROM_EMAIL: z.string().email().optional(),
  })
  ;

/** Type-safe shape of the validated environment. */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * ConfigModule validation function (PROMPT §13).
 * Called at startup by ConfigModule.forRoot({ validate }).
 * Throws a ZodError with all missing/invalid variables if validation fails.
 */
export function validate(config: Record<string, unknown>): EnvConfig {
  return envSchema.parse(config);
}
