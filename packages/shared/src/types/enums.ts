/**
 * Enum literals mirroring the Prisma schema (PROMPT §5). String-literal unions
 * are used (not TS `enum`) so the values survive JSON serialization across the
 * API boundary and tree-shake cleanly in the web bundle.
 */

/** User subscription tier (§5 enum Tier). */
export type Tier = 'FREE' | 'PRO';
export const TIERS: readonly Tier[] = ['FREE', 'PRO'];

/** Data residency region (§5 enum DataRegion; GDPR §9). */
export type DataRegion = 'US' | 'EU';
export const DATA_REGIONS: readonly DataRegion[] = ['US', 'EU'];

/** Source document content type (§5 enum DocumentType). */
export type DocumentType = 'PDF' | 'YOUTUBE';
export const DOCUMENT_TYPES: readonly DocumentType[] = ['PDF', 'YOUTUBE'];

/** Document processing lifecycle (§5 enum DocumentStatus). */
export type DocumentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';
export const DOCUMENT_STATUSES: readonly DocumentStatus[] = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
];

/** Flashcard format (§5 enum CardType). */
export type CardType = 'BASIC' | 'CLOZE' | 'DEFINITION';
export const CARD_TYPES: readonly CardType[] = [
  'BASIC',
  'CLOZE',
  'DEFINITION',
];

/** Bloom's Taxonomy level (§5 enum BloomLevel, §7.3 prompt). */
export type BloomLevel = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE';
export const BLOOM_LEVELS: readonly BloomLevel[] = [
  'REMEMBER',
  'UNDERSTAND',
  'APPLY',
  'ANALYZE',
];

/** Provenance of a card's source (§5 enum ProvenanceStatus). */
export type ProvenanceStatus = 'LINKED' | 'SOURCE_DELETED' | 'USER_CREATED';
export const PROVENANCE_STATUSES: readonly ProvenanceStatus[] = [
  'LINKED',
  'SOURCE_DELETED',
  'USER_CREATED',
];

/** Who authored a card version (§5 enum VersionEditor). */
export type VersionEditor = 'USER' | 'AI';

/** Export file format (§5 enum ExportFormat). */
export type ExportFormat = 'JSON' | 'CSV' | 'ANKI_JSON';
export const EXPORT_FORMATS: readonly ExportFormat[] = [
  'JSON',
  'CSV',
  'ANKI_JSON',
];

/** Async job lifecycle (§5 enum JobStatus). */
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export const JOB_STATUSES: readonly JobStatus[] = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
];
