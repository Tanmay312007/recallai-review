/**
 * Hard product limits enforced server-side (PROMPT §9 API Security, §13 env).
 *
 * These mirror the values referenced in the error code table (PROMPT §10):
 * DOC_002 "File too large", DOC_003 "Page limit exceeded", DECK_002/CARD_002
 * "limit reached (Free tier)". Keep them in one place so API, worker, and web
 * validate against identical thresholds.
 */

/** Maximum accepted PDF size, in megabytes. Used for S3 presigned conditions. */
export const MAX_PDF_SIZE_MB = 50;
/** Maximum accepted PDF size, in bytes (50 MiB). */
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

/** Maximum number of pages a single PDF may contain (DOC_003). */
export const MAX_PDF_PAGES = 500;

/** Maximum length of a card front (question). Mirrors Prisma CHECK + §7.2. */
export const MAX_CARD_FRONT_LENGTH = 500;
/** Maximum length of a card back (answer). Mirrors Prisma CHECK + §7.2. */
export const MAX_CARD_BACK_LENGTH = 2000;
/** Minimum length of a card front (quality heuristic, §7.4 Check 2). */
export const MIN_CARD_FRONT_LENGTH = 10;
/** Minimum length of a card back (quality heuristic, §7.4 Check 2). */
export const MIN_CARD_BACK_LENGTH = 15;

/** Min/max flashcards the generator may emit per text chunk (§7.3 prompt). */
export const CARDS_PER_CHUNK_MIN = 3;
export const CARDS_PER_CHUNK_MAX = 8;

/** Default page size for paginated card lists ("50/page", PROMPT §6). */
export const DEFAULT_CARD_PAGE_SIZE = 50;
/** Max page size a client may request for any paginated endpoint. */
export const MAX_PAGE_SIZE = 100;

/** Chunking parameters (PROMPT §7.2 Step 2: 400–800 tokens, 100 overlap). */
export const CHUNK_TARGET_TOKENS = 600;
export const CHUNK_MIN_TOKENS = 400;
export const CHUNK_MAX_TOKENS = 800;
export const CHUNK_OVERLAP_TOKENS = 100;

/** OpenAI embedding dimension for text-embedding-3-small (pgvector 1536). */
export const EMBEDDING_DIMENSIONS = 1536;

/** Source-grounding similarity floor below which a candidate is rejected. */
export const GROUNDING_SIMILARITY_MIN = 0.3;

/** Token-overlap threshold (Check 3): at least one key term from back in chunk. */
export const GROUNDING_TERM_HITS_MIN = 1;

/** Validation score thresholds (§7.4 Check 4). */
export const VALIDATION_SCORE_PERSIST = 70; // ≥ → persisted
export const VALIDATION_SCORE_FLAG = 50; // 50–69 → flagged for review
// < FLAG → discarded (logged for analytics)

/** Presigned S3 URL max lifetime for uploads (§9 Data Security: ≤ 15 min). */
export const MAX_PRESIGNED_UPLOAD_TTL_SECONDS = 300; // 5 minutes
/** Presigned download URL TTL for exports (PROMPT §6: 24hr download window). */
export const EXPORT_DOWNLOAD_TTL_SECONDS = 60 * 60 * 24; // 24 hours
