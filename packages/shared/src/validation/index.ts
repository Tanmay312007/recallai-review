/**
 * @lumora/shared/validation — barrel export for Zod schemas.
 *
 * These schemas are the single source of truth for request validation. The
 * NestJS API uses them via a ZodValidationPipe; the web app uses them in
 * React Hook Form. Same schema ⇒ same rules ⇒ no validation drift.
 */
export * from './common.js';
export * from './auth.js';
export * from './cards.js';
export * from './review.js';
export * from './documents.js';
export * from './ai.js';
