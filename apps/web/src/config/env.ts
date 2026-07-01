import { z } from 'zod';

const envSchema = z.object({
  API_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_API_URL is required')
    .url('NEXT_PUBLIC_API_URL must be a valid URL'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  LOCAL_API_KEY: z.string().optional(),
  LOCAL_BASE_URL: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  LOCAL_MODEL: z.string().optional(),
  AI_TIMEOUT_MS: z.coerce.number().positive().optional().default(60000),
  AI_MAX_RETRIES: z.coerce.number().int().nonnegative().optional().default(2),
});

const parsed = envSchema.safeParse({
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  LOCAL_API_KEY: process.env.NEXT_PUBLIC_LOCAL_API_KEY,
  LOCAL_BASE_URL: process.env.NEXT_PUBLIC_LOCAL_BASE_URL,
  OPENAI_MODEL: process.env.NEXT_PUBLIC_OPENAI_MODEL,
  ANTHROPIC_MODEL: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL,
  GEMINI_MODEL: process.env.NEXT_PUBLIC_GEMINI_MODEL,
  LOCAL_MODEL: process.env.NEXT_PUBLIC_LOCAL_MODEL,
  AI_TIMEOUT_MS: process.env.NEXT_PUBLIC_AI_TIMEOUT_MS,
  AI_MAX_RETRIES: process.env.NEXT_PUBLIC_AI_MAX_RETRIES,
});

if (!parsed.success) {
  const messages = parsed.error.errors.map(
    (e) => `  ${e.path.join('.')}: ${e.message}`,
  );
  throw new Error(
    `Invalid environment variables:\n${messages.join('\n')}`,
  );
}

export const env = Object.freeze({
  ...parsed.data,
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
});
