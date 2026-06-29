/**
 * FSRS v4 constants shared by the SchedulingService (worker) and the client
 * review store (web). Per PROMPT §7.5, ts-fsrs is wrapped in a single
 * SchedulingService; these are the only scheduling values that need to be
 * shared cross-process.
 */

/** RecallAI rating scale (PROMPT §5 ReviewLog.rating, §7.5). */
export const Rating = {
  /** 1 — forgot, reset to relearning. */
  AGAIN: 1,
  /** 2 — recalled with significant effort. */
  HARD: 2,
  /** 3 — recalled (default interval applied). */
  GOOD: 3,
  /** 4 — trivially recalled, interval lengthened. */
  EASY: 4,
} as const;
export type Rating = (typeof Rating)[keyof typeof Rating];

/** All valid Rating values, for runtime validation. */
export const RATING_VALUES: readonly Rating[] = [
  Rating.AGAIN,
  Rating.HARD,
  Rating.GOOD,
  Rating.EASY,
];

/** FSRS card state stored on every card (PROMPT §5 Card.fsrsState). */
export const FsrsState = {
  /** 0 — never reviewed. */
  NEW: 0,
  /** 1 — first/short-interval learning step. */
  LEARNING: 1,
  /** 2 — graduated to spaced review. */
  REVIEW: 2,
  /** 3 — lapsed back into relearning. */
  RELEARNING: 3,
} as const;
export type FsrsState = (typeof FsrsState)[keyof typeof FsrsState];

/** Number of weights in the FSRS v4 parameter vector (w0..w16). */
export const FSRS_WEIGHT_COUNT = 17;

/**
 * FSRS v4 research default weight vector (w0..w16), matching the value baked
 * into ts-fsrs `generatorParameters()` and Vol VII §7.2. Used to seed
 * UserFsrsParams until per-user optimization has enough reviews.
 */
export const FSRS_DEFAULT_WEIGHTS: readonly number[] = [
  0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0589, 1.4679,
  0.1559, 0.9698, 1.9884, 0.0967, 0.2975, 2.2042, 0.2407, 2.9466,
];

/** Default desired retention (probability of recall at due time). */
export const DEFAULT_DESIRED_RETENTION = 0.9;
/** Default maximum interval, in days (PROMPT §5 UserFsrsParams.maximumInterval). */
export const DEFAULT_MAXIMUM_INTERVAL_DAYS = 36500;

/** Number of reviews before per-user FSRS optimization is eligible to run. */
export const FSRS_OPTIMIZATION_MIN_REVIEWS = 1000;

/** Default max new cards introduced per deck per day (PROMPT §5 Deck.newCardLimit). */
export const DEFAULT_NEW_CARD_LIMIT = 10;
