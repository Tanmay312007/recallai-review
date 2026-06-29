/**
 * Auth request validation (PROMPT §6 Authentication endpoints, §9 Security).
 *
 * Password rules are deliberately conservative — bcrypt cost 12 on the server
 * means we still want a reasonable minimum complexity to resist online
 * guessing (5 attempts / 15 min is rate-limited, but not a substitute).
 */
import { z } from 'zod';
import { emailSchema } from './common.js';

/**
 * Password policy. Enforced identically at register and reset-password so the
 * two flows cannot diverge. NOT a security boundary on its own — the rate
 * limiter (5/15min/IP) and bcrypt(12) are — but it stops trivial passwords.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be 128 characters or fewer')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    name: z.string().trim().max(255).optional(),
    // GDPR data residency (§9). Defaults to US server-side if omitted.
    dataRegion: z.enum(['US', 'EU']).optional(),
  })
  .strict();

export type RegisterRequest = z.infer<typeof registerSchema>;

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, 'Required'),
    // reCAPTCHA v3 token — required only after the 3rd failed attempt (§9).
    recaptchaToken: z.string().optional(),
  })
  .strict();

export type LoginRequest = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z
  .object({
    token: z.string().min(1, 'Required'),
  })
  .strict();

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Required'),
    password: passwordSchema,
  })
  .strict();

export const refreshTokenSchema = z.object({}).strict();
