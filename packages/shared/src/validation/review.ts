/**
 * Review session validation (PROMPT §6 Review endpoints, §7.5 FSRS).
 * Rating is constrained to 1–4 (the RecallAI scale); timeSpentMs is bounded
 * to reject absurd values from offline buffers.
 */
import { z } from 'zod';
import { uuidSchema } from './common.js';

export const startReviewSessionSchema = z
  .object({
    deckId: uuidSchema.optional(),
    limit: z.coerce.number().int().positive().max(200).optional(),
  })
  .strict();

export type StartReviewSessionRequest = z.infer<
  typeof startReviewSessionSchema
>;

export const ratingSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const rateCardSchema = z
  .object({
    sessionId: uuidSchema,
    cardId: uuidSchema,
    rating: ratingSchema,
    // 0 (instant) to 10 min; anything beyond is almost certainly a client bug.
    timeSpentMs: z.number().int().min(0).max(10 * 60 * 1000),
    reviewedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export type RateCardRequest = z.infer<typeof rateCardSchema>;

export const batchSyncSchema = z
  .object({
    sessionId: uuidSchema,
    ratings: z
      .array(
        z.object({
          cardId: uuidSchema,
          rating: ratingSchema,
          timeSpentMs: z.number().int().min(0).max(10 * 60 * 1000),
          reviewedAt: z.string().datetime({ offset: true }).optional(),
        }),
      )
      .min(1, 'At least one rating is required')
      .max(500, 'A batch may contain at most 500 ratings'),
  })
  .strict();

export type BatchSyncRequest = z.infer<typeof batchSyncSchema>;
