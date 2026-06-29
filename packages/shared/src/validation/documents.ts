/**
 * Document ingestion validation (PROMPT §6 Document endpoints, §9 file
 * uploads). PDF size/page limits are enforced again server-side, but
 * validating here gives the user immediate feedback and matches §10 errors.
 */
import { z } from 'zod';
import {
  MAX_PDF_SIZE_BYTES,
  MAX_PDF_SIZE_MB,
} from '../constants/limits.js';
import { nonEmptyString } from './common.js';

export const createDocumentSchema = z
  .object({
    originalName: nonEmptyString.max(500),
    storageKey: nonEmptyString.max(1024),
    fileSizeBytes: z
      .number()
      .int()
      .positive()
      .max(MAX_PDF_SIZE_BYTES, `File must be ${MAX_PDF_SIZE_MB} MB or fewer`),
    contentHash: z.string().length(64).optional(), // SHA-256 hex
  })
  .strict();

export type CreateDocumentRequest = z.infer<typeof createDocumentSchema>;

/**
 * YouTube URL acceptance. Matches the three common host shapes the upload flow
 * validates against (§8.3). The worker re-validates and extracts the video id.
 */
const youtubeUrlRegex =
  /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)[A-Za-z0-9_-]{11}([?&].*)?$/;

export const youtubeDocumentSchema = z
  .object({
    url: z
      .string()
      .trim()
      .regex(youtubeUrlRegex, 'Must be a valid YouTube watch or share URL')
      .max(2048),
    title: nonEmptyString.max(500).optional(),
  })
  .strict();

export type YoutubeDocumentRequest = z.infer<typeof youtubeDocumentSchema>;

export const exportRequestSchema = z
  .object({
    format: z.enum(['JSON', 'CSV', 'ANKI_JSON']),
    // Omit deckIds (or pass null) for a full-library export (GDPR Art. 20).
    deckIds: z.array(z.string().uuid()).optional(),
  })
  .strict();

export type ExportRequest = z.infer<typeof exportRequestSchema>;
