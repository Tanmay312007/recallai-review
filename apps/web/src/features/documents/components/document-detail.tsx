'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { SourceDocumentDto } from '@recallai/shared';
import { useDocumentStore } from '../store/document-store';
import { DocumentStatusBadge } from './document-status-badge';
import { formatFileSize } from '../utilities/validation';

interface DocumentDetailProps {
  documentId: string;
}

export function DocumentDetail({ documentId }: DocumentDetailProps) {
  const doc = useDocumentStore((s) => s.currentDocument);
  const loading = useDocumentStore((s) => s.currentDocumentLoading);
  const error = useDocumentStore((s) => s.currentDocumentError);
  const fetchDocument = useDocumentStore((s) => s.fetchDocument);

  useEffect(() => {
    fetchDocument(documentId);
  }, [documentId, fetchDocument]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-bg-overlay" />
        <div className="h-4 w-64 animate-pulse rounded bg-bg-overlay" />
        <div className="h-64 animate-pulse rounded-lg bg-bg-overlay" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          href="/documents"
          className="text-sm text-foreground-muted hover:text-foreground"
        >
          &larr; Back to documents
        </Link>
        <div className="rounded-lg border border-semantic-error bg-background-surface px-4 py-6 text-center">
          <p className="text-sm text-semantic-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!doc) return null;

  const metadata: [string, string | React.ReactNode][] = [
    ['Title', doc.title],
    ['Original name', doc.originalName ?? '\u2014'],
    ['Type', doc.type],
    ['Status', <DocumentStatusBadge key="status" status={backendToClientStatus(doc.status)} />],
    ['Size', doc.fileSizeBytes != null ? formatFileSize(doc.fileSizeBytes) : '\u2014'],
    ['Pages', doc.pageCount != null ? String(doc.pageCount) : '\u2014'],
    ['Created', new Date(doc.createdAt).toLocaleString()],
    ['Updated', new Date(doc.updatedAt).toLocaleString()],
    ['Document ID', doc.id],
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/documents"
        className="inline-flex items-center text-sm text-foreground-muted hover:text-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mr-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to documents
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{doc.title}</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          {doc.originalName ?? doc.title}
        </p>
      </div>

      <div className="rounded-lg border border-bg-overlay bg-background-elevated">
        <dl className="divide-y divide-bg-overlay">
          {metadata.map(([label, value]) => (
            <div key={label} className="flex justify-between px-6 py-4">
              <dt className="text-sm text-foreground-muted">{label}</dt>
              <dd className="max-w-[60%] truncate text-sm font-medium text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {doc.processingError && (
        <div className="rounded-lg border border-semantic-error bg-semantic-error/5 px-6 py-4">
          <h3 className="text-sm font-medium text-semantic-error">Processing error</h3>
          <p className="mt-1 text-sm text-semantic-error">{doc.processingError}</p>
        </div>
      )}

      <AiPipelinePlaceholder status={doc.status} />
    </div>
  );
}

function AiPipelinePlaceholder({ status }: { status: string }) {
  const isComplete = status === 'COMPLETED';
  const isFailed = status === 'FAILED';

  return (
    <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
      <h3 className="text-sm font-semibold text-foreground">AI Processing</h3>

      {isComplete && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-bg-overlay bg-background-surface px-4 py-3 opacity-50">
            <div className="h-4 w-4 rounded-full border-2 border-foreground-disabled" />
            <div className="flex-1">
              <p className="text-sm text-foreground-disabled">Chunking</p>
              <p className="text-xs text-foreground-disabled">
                Splitting document into semantic chunks
              </p>
            </div>
            <span className="text-xs font-medium text-foreground-disabled">
              Pending
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-bg-overlay bg-background-surface px-4 py-3 opacity-50">
            <div className="h-4 w-4 rounded-full border-2 border-foreground-disabled" />
            <div className="flex-1">
              <p className="text-sm text-foreground-disabled">Flashcard generation</p>
              <p className="text-xs text-foreground-disabled">
                Creating flashcards from document content
              </p>
            </div>
            <span className="text-xs font-medium text-foreground-disabled">
              Pending
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-bg-overlay bg-background-surface px-4 py-3 opacity-50">
            <div className="h-4 w-4 rounded-full border-2 border-foreground-disabled" />
            <div className="flex-1">
              <p className="text-sm text-foreground-disabled">Embeddings</p>
              <p className="text-xs text-foreground-disabled">
                Generating vector embeddings for semantic search
              </p>
            </div>
            <span className="text-xs font-medium text-foreground-disabled">
              Pending
            </span>
          </div>
        </div>
      )}

      {isFailed && (
        <p className="mt-4 text-sm text-foreground-muted">
          Processing failed. AI features are unavailable for this document.
        </p>
      )}

      {!isComplete && !isFailed && (
        <p className="mt-4 text-sm text-foreground-muted">
          AI processing will begin once the document has finished uploading and
          queuing.
        </p>
      )}
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
