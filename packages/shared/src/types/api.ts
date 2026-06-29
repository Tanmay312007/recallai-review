/**
 * API envelope shapes (PROMPT §6 response envelope). Used by the web client
 * and validated by the API's response interceptor.
 */

/** Standard success envelope: `{ data, meta? }`. */
export interface ApiResponse<TData> {
  data: TData;
  meta?: PaginationMeta;
}

/** Pagination metadata returned on list endpoints. */
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/** Standard error envelope: `{ error: { code, message, details? } }`. */
export interface ApiErrorResponse {
  error: {
    /** Machine-readable code from the §10 taxonomy (e.g. `AUTH_001`). */
    code: string;
    /** Human-readable message, safe to display to users. */
    message: string;
    /** Optional structured details (never a stack trace — PROMPT §15). */
    details?: unknown;
    /** Request correlation ID (Vol V §5.2). */
    requestId?: string;
  };
}

/**
 * RecallAI error codes (PROMPT §10). Declared as a const record so every
 * error thrown anywhere in the codebase uses a known, documented code.
 */
export const ErrorCode = {
  // Auth
  AUTH_001: 'AUTH_001', // Invalid credentials
  AUTH_002: 'AUTH_002', // Email not verified
  AUTH_003: 'AUTH_003', // Token expired
  AUTH_004: 'AUTH_004', // Token invalid
  AUTH_005: 'AUTH_005', // Account not found
  AUTH_006: 'AUTH_006', // Email already registered
  AUTH_007: 'AUTH_007', // OAuth error
  // User
  USER_001: 'USER_001', // Profile update failed
  USER_002: 'USER_002', // Account deletion in progress
  USER_003: 'USER_003', // Invalid password
  // Document
  DOC_001: 'DOC_001', // File type not supported
  DOC_002: 'DOC_002', // File too large
  DOC_003: 'DOC_003', // Page limit exceeded
  DOC_004: 'DOC_004', // Corrupt or unreadable PDF
  DOC_005: 'DOC_005', // Password-protected PDF
  DOC_006: 'DOC_006', // No captions available (YouTube)
  DOC_007: 'DOC_007', // Video not found or private (YouTube)
  DOC_008: 'DOC_008', // Processing failed
  DOC_009: 'DOC_009', // Duplicate document
  // Deck / Card
  DECK_001: 'DECK_001', // Deck not found
  DECK_002: 'DECK_002', // Deck limit reached (Free tier)
  CARD_001: 'CARD_001', // Card not found
  CARD_002: 'CARD_002', // Card limit reached (Free tier)
  // Review
  REVIEW_001: 'REVIEW_001', // No due cards
  REVIEW_002: 'REVIEW_002', // Session not found
  // Billing
  BILLING_001: 'BILLING_001', // Subscription required
  BILLING_002: 'BILLING_002', // Payment failed
  BILLING_003: 'BILLING_003', // Feature requires Pro tier
  // Generation / Export
  GEN_001: 'GEN_001', // Generation failed
  GEN_002: 'GEN_002', // Insufficient content for cards
  GEN_003: 'GEN_003', // Generation suspended (abuse flag)
  EXPORT_001: 'EXPORT_001', // Export job not found
  EXPORT_002: 'EXPORT_002', // Export link expired
  EXPORT_003: 'EXPORT_003', // Export requires Pro tier
  // Catch-all
  INTERNAL_001: 'INTERNAL_001', // Unexpected server error
  RATE_LIMIT_001: 'RATE_LIMIT_001', // Rate limit exceeded
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
