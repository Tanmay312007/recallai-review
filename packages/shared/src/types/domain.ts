/**
 * Domain model DTOs (the wire format for §6 endpoints). These are the shapes
 * returned by the API and consumed by the web app. Prisma models stay private
 * to the API; these are the public contract.
 *
 * All ids are UUID v4 strings. All timestamps are ISO 8601 strings.
 */
import type {
  BloomLevel,
  CardType,
  DataRegion,
  DocumentStatus,
  DocumentType,
  ExportFormat,
  JobStatus,
  ProvenanceStatus,
  Tier,
  VersionEditor,
} from './enums.js';

export type ISODateString = string;
export type UUID = string;

/** Public user profile (never includes passwordHash). */
export interface UserDto {
  id: UUID;
  email: string;
  emailVerified: boolean;
  name: string | null;
  avatarUrl: string | null;
  tier: Tier;
  dataRegion: DataRegion;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastActiveAt: ISODateString | null;
  deletionRequestedAt: ISODateString | null;
}

/** Compact user for embedding inside other responses (e.g. review session). */
export interface UserRef {
  id: UUID;
  name: string | null;
  avatarUrl: string | null;
  tier: Tier;
}

/** Source document (PDF or YouTube) ingested by the user. */
export interface SourceDocumentDto {
  id: UUID;
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  originalName: string | null;
  youtubeUrl: string | null;
  youtubeVideoId: string | null;
  fileSizeBytes: number | null;
  pageCount: number | null;
  durationSeconds: number | null;
  language: string;
  cardCount: number | null;
  processingError: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** A document chunk used for provenance + semantic grounding. */
export interface DocumentChunkDto {
  id: UUID;
  documentId: UUID;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  pageNumber: number | null;
}

/** Deck (collection of cards). */
export interface DeckDto {
  id: UUID;
  documentId: UUID | null;
  folderId: UUID | null;
  name: string;
  description: string | null;
  colorTag: string | null;
  cardCount: number;
  newCardLimit: number;
  dueCount: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Folder grouping decks together (Pro tier). */
export interface DeckFolderDto {
  id: UUID;
  name: string;
  sortOrder: number;
}

/** The core flashcard. */
export interface CardDto {
  id: UUID;
  deckId: UUID;
  chunkId: UUID | null;
  front: string;
  back: string;
  cardType: CardType;
  bloomLevel: BloomLevel;
  isAiGenerated: boolean;
  isUserModified: boolean;
  isFlagged: boolean;
  provenanceStatus: ProvenanceStatus;
  fsrsState: FsrsStateSnapshot;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Read-only FSRS scheduling state attached to a card. */
export interface FsrsStateSnapshot {
  state: number;
  due: ISODateString;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
}

/** A historical version of a card (front/back snapshot on edit). */
export interface CardVersionDto {
  id: UUID;
  cardId: UUID;
  front: string;
  back: string;
  editedBy: VersionEditor;
  createdAt: ISODateString;
}

/** A single rating event inside a review session. */
export interface ReviewLogDto {
  id: UUID;
  cardId: UUID;
  rating: number;
  elapsedDays: number;
  scheduledDays: number;
  stabilityBefore: number;
  stabilityAfter: number;
  difficultyBefore: number;
  difficultyAfter: number;
  reviewedAt: ISODateString;
}

/** Async export job status. */
export interface ExportJobDto {
  id: UUID;
  format: ExportFormat;
  status: JobStatus;
  error: string | null;
  expiresAt: ISODateString | null;
  createdAt: ISODateString;
}

/** Card provenance: card → chunk → source text (§6 GET /cards/:id/provenance). */
export interface CardProvenanceDto {
  cardId: UUID;
  provenanceStatus: ProvenanceStatus;
  document: SourceDocumentDto | null;
  chunk: DocumentChunkDto | null;
  /** The exact source quote the card was generated from. */
  sourceQuote: string | null;
}

/** Notification preferences (§5 NotificationPrefs). */
export interface NotificationPrefsDto {
  emailReminders: boolean;
  reminderTime: string;
  timezone: string;
  marketingEmails: boolean;
}

/** ─── Knowledge Pipeline Domain ─── */

/** Heading level for section hierarchy. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** A single section within a normalized document. */
export interface KnowledgeSection {
  id: string;
  title: string;
  headingLevel: HeadingLevel;
  paragraphIndices: number[];
  characterOffsetStart: number;
  characterOffsetEnd: number;
}

/** A single paragraph within a section. */
export interface KnowledgeParagraph {
  id: string;
  sectionId: string;
  index: number;
  content: string;
  characterOffsetStart: number;
  characterOffsetEnd: number;
  wordCount: number;
}

/** Metadata attached to each knowledge chunk. */
export interface ChunkMetadata {
  documentId: string;
  chunkId: string;
  sourcePage: number | null;
  sectionTitle: string;
  headingLevel: HeadingLevel;
  paragraphIndex: number;
  characterOffsetStart: number;
  characterOffsetEnd: number;
  wordCount: number;
  estimatedTokens: number;
  readingTimeSeconds: number;
  embeddingId: string | null;
  vectorId: string | null;
}

/** A single knowledge chunk — the atomic unit for AI processing. */
export interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  sectionId: string;
  paragraphId: string;
  metadata: ChunkMetadata;
  createdAt: string;
}

/** The complete knowledge representation of a document. */
export interface KnowledgeDocument {
  documentId: string;
  sections: KnowledgeSection[];
  paragraphs: KnowledgeParagraph[];
  chunks: KnowledgeChunk[];
  totalWords: number;
  totalTokens: number;
  createdAt: string;
}

/** Preview-specific data (separate from full metadata). */
export interface DocumentPreviewData {
  documentId: string;
  textSnippet: string;
  firstPageContent: string | null;
  pageCount: number;
  thumbnailUrl: string | null;
  hasImages: boolean;
}
