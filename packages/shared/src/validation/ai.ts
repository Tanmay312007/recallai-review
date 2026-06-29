/**
 * AI output validation (PROMPT §7.3 / §7.4). The generation prompt is
 * instructed to return JSON matching a schema; this is the trust boundary that
 * turns that untrusted LLM output into typed CardCandidate[].
 *
 * Cards with score < VALIDATION_SCORE_FLAG are discarded before ever reaching
 * this schema, so every candidate parsed here has already passed checks 1–3.
 */
import { z } from 'zod';
import {
  MAX_CARD_BACK_LENGTH,
  MAX_CARD_FRONT_LENGTH,
} from '../constants/limits.js';

const cardCandidateSchema = z.object({
  front: z
    .string()
    .min(1)
    .max(MAX_CARD_FRONT_LENGTH, `front must be ≤ ${MAX_CARD_FRONT_LENGTH} chars`),
  back: z
    .string()
    .min(1)
    .max(MAX_CARD_BACK_LENGTH, `back must be ≤ ${MAX_CARD_BACK_LENGTH} chars`),
  bloom_level: z.enum(['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE']),
  card_type: z.enum(['BASIC', 'CLOZE', 'DEFINITION']),
  key_concept: z.string().min(1).max(100),
});

export const generationOutputSchema = z.object({
  cards: z.array(cardCandidateSchema).min(1).max(20),
});

export type ParsedGenerationOutput = z.infer<typeof generationOutputSchema>;

export const validationScoreSchema = z
  .number()
  .int()
  .min(0)
  .max(100);
