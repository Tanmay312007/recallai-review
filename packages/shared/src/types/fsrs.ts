/**
 * FSRS-related response types for the review API (§6 Review endpoints, §7.5).
 *
 * Request *body* types are intentionally NOT declared here — they are derived
 * from the Zod schemas in validation/review.ts so a request can never drift
 * from the rules that validate it. Only response shapes (which have no schema)
 * live in this module.
 */
import type { UUID } from './domain.js';

/** Response of POST /review/rate — next due date + interval labels for the UI. */
export interface RateCardResponse {
  cardId: UUID;
  nextDue: string;
  scheduledDays: number;
  state: number;
}
