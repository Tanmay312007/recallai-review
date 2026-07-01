'use client';

import type { SourceDocumentDto } from '@recallai/shared';
import { formatFileSize } from '../utilities/validation';
import { DocumentStatusBadge } from './document-status-badge';

interface MetadataPanelProps {
  document: SourceDocumentDto;
  onClose: () => void;
}

export function MetadataPanel({ document, onClose }: MetadataPanelProps) {
  const rows: [string, string | React.ReactNode][] = [
    ['Title', document.title],
    ['Original name', document.originalName ?? '\u2014'],
    ['Type', document.type],
    [
      'Status',
      <DocumentStatusBadge
        key="status"
        status={backendToClientStatus(document.status)}
      />,
    ],
    [
      'Size',
      document.fileSizeBytes != null
        ? formatFileSize(document.fileSizeBytes)
        : '\u2014',
    ],
    [
      'Pages',
      document.pageCount != null ? String(document.pageCount) : '\u2014',
    ],
    ['Created', new Date(document.createdAt).toLocaleString()],
    ['Updated', new Date(document.updatedAt).toLocaleString()],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className="mx-4 w-full max-w-lg rounded-xl bg-background-elevated p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Document metadata"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Document metadata
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-foreground-muted hover:text-foreground"
            aria-label="Close metadata"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <dl className="mt-4 divide-y divide-bg-overlay">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between py-3">
              <dt className="text-sm text-foreground-muted">{label}</dt>
              <dd className="max-w-[60%] truncate text-sm font-medium text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {document.processingError && (
          <div className="mt-4 rounded-lg bg-semantic-error/10 px-4 py-3">
            <p className="text-sm font-medium text-semantic-error">Error</p>
            <p className="mt-1 text-sm text-semantic-error">
              {document.processingError}
            </p>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-bg-overlay bg-background-surface p-4">
          <h3 className="text-sm font-semibold text-foreground">
            AI Processing
          </h3>
          <p className="mt-1 text-xs text-foreground-muted">
            Flashcard generation, chunking, and embeddings will appear here
            once available.
          </p>
        </div>
      </div>
    </div>
  );
}

function backendToClientStatus(
  backend: SourceDocumentDto['status'],
): import('../types').DocumentStatus {
  const map: Record<string, import('../types').DocumentStatus> = {
    PENDING: 'QUEUED',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  };
  return map[backend] ?? 'UPLOADED';
}
