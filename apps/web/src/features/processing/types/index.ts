import type { ProcessingStage } from '@recallai/shared';

export type { ProcessingStage };

export interface ProcessingTimestamps {
  queuedAt?: string;
  preparingAt?: string;
  extractingAt?: string;
  normalizingAt?: string;
  completedAt?: string;
  failedAt?: string;
  canceledAt?: string;
}

export interface ProcessingJob {
  documentId: string;
  stage: ProcessingStage;
  progress: number;
  timestamps: ProcessingTimestamps;
  error?: string;
  normalizedDocument?: NormalizedDocument;
  /** Queue-compatible fields for future async workers */
  jobId?: string;
  queueStatus?: 'pending' | 'active' | 'completed' | 'failed';
  retryCount?: number;
  maxRetries?: number;
}

export interface DocumentMetadata {
  fileName: string;
  extension: string;
  fileSize: number;
  pageCount: number | null;
  wordCount: number;
  estimatedReadingTimeMinutes: number;
  language: string;
  uploadedAt: string;
  processingTimestamps: ProcessingTimestamps;
}

export interface NormalizedBlock {
  type: 'paragraph' | 'heading' | 'list' | 'table' | 'code' | 'image';
  content: string;
  level?: number;
  metadata?: Record<string, unknown>;
}

export interface NormalizedPage {
  pageNumber: number;
  blocks: NormalizedBlock[];
}

export interface NormalizedDocument {
  metadata: DocumentMetadata;
  pages: NormalizedPage[];
  createdAt: string;
  updatedAt: string;
}

export const PROCESSING_STAGE_LABELS: Record<ProcessingStage, string> = {
  QUEUED: 'Queued',
  PREPARING: 'Preparing',
  EXTRACTING: 'Extracting',
  NORMALIZING: 'Normalizing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELED: 'Canceled',
};

export const PROCESSING_STAGE_ORDER: ProcessingStage[] = [
  'QUEUED',
  'PREPARING',
  'EXTRACTING',
  'NORMALIZING',
  'COMPLETED',
];

export function getStageIndex(stage: ProcessingStage): number {
  return PROCESSING_STAGE_ORDER.indexOf(stage);
}

export function isTerminal(stage: ProcessingStage): boolean {
  return stage === 'COMPLETED' || stage === 'FAILED' || stage === 'CANCELED';
}
