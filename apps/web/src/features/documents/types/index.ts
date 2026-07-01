import type { SourceDocumentDto } from '@recallai/shared';

export type DocumentStatus =
  | 'UPLOADING'
  | 'UPLOADED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELED'
  | 'RETRYING';

export interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export interface DocumentListMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface DocumentFilters {
  search?: string;
  sort?: 'createdAt' | 'title' | 'fileSizeBytes' | 'status';
  order?: 'asc' | 'desc';
  page: number;
  perPage: number;
}

export type DocumentDto = SourceDocumentDto;

export const SUPPORTED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.ppt',
  '.pptx',
  '.txt',
  '.md',
] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export const MIME_TYPES: Record<SupportedExtension, string[]> = {
  '.pdf': ['application/pdf'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  '.txt': ['text/plain'],
  '.md': ['text/markdown', 'text/plain'],
};

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  UPLOADING: 'Uploading',
  UPLOADED: 'Uploaded',
  QUEUED: 'Queued',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELED: 'Canceled',
  RETRYING: 'Retrying',
};
