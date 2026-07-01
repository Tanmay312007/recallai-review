import { z } from 'zod';

const envSchema = z.object({
  API_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_API_URL is required')
    .url('NEXT_PUBLIC_API_URL must be a valid URL'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse({
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
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
