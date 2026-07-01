'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { SourceDocumentDto } from '@recallai/shared';
import { useDocumentStore } from '../store/document-store';
import { DocumentStatusBadge } from './document-status-badge';
import { formatFileSize } from '../utilities/validation';
import { MIME_TYPES } from '../types';
import { useProcessing } from '@/features/processing/hooks/use-processing';
import { ProcessingStatus } from '@/features/processing/components/processing-status';
import { DocumentPreview } from '@/features/processing/components/document-preview';
import { KnowledgePipeline } from '@/features/knowledge/components/knowledge-pipeline';

interface DocumentDetailProps {
  documentId: string;
}

export function DocumentDetail({ documentId }: DocumentDetailProps) {
  const doc = useDocumentStore((s) => s.currentDocument);
  const loading = useDocumentStore((s) => s.currentDocumentLoading);
  const error = useDocumentStore((s) => s.currentDocumentError);
  const fetchDocument = useDocumentStore((s) => s.fetchDocument);

  const {
    job,
    startProcessing,
    cancelProcessing,
    retryProcessing,
    isProcessing,
  } = useProcessing(documentId);

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    fetchDocument(documentId);
  }, [documentId, fetchDocument]);

  useEffect(() => {
    if (doc && !hasStarted && !isProcessing && !job) {
      const ext = getExtension(doc);
      const mime = getMimeType(doc);
      if (ext && mime) {
        setHasStarted(true);
        startProcessing(
          documentId,
          doc.originalName ?? doc.title,
          doc.fileSizeBytes ?? 0,
          mime,
        );
      }
    }
  }, [doc, documentId, hasStarted, isProcessing, job, startProcessing]);

  const handleStart = useCallback(() => {
    if (!doc) return;
    setHasStarted(true);
    const mime = getMimeType(doc);
    startProcessing(
      documentId,
      doc.originalName ?? doc.title,
      doc.fileSizeBytes ?? 0,
      mime ?? 'application/octet-stream',
    );
  }, [doc, documentId, startProcessing]);

  const handleRetry = useCallback(() => {
    if (!doc) return;
    setHasStarted(true);
    const mime = getMimeType(doc);
    retryProcessing(
      documentId,
      doc.originalName ?? doc.title,
      doc.fileSizeBytes ?? 0,
      mime ?? 'application/octet-stream',
    );
  }, [doc, documentId, retryProcessing]);

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

      <ProcessingStatus
        job={job}
        onStart={handleStart}
        onCancel={() => cancelProcessing(documentId)}
        onRetry={handleRetry}
        hasStarted={hasStarted}
      />

      {job?.stage === 'COMPLETED' && job.normalizedDocument && (
        <>
          <DocumentPreview document={job.normalizedDocument} />
          <KnowledgePipeline
            documentId={documentId}
            normalizedDocument={job.normalizedDocument}
            processingComplete={true}
          />
        </>
      )}

      <AiPipelinePlaceholder
        status={doc.status}
        processingComplete={job?.stage === 'COMPLETED'}
      />
    </div>
  );
}

function AiPipelinePlaceholder({
  status,
  processingComplete,
}: {
  status: string;
  processingComplete?: boolean;
}) {
  const isFailed = status === 'FAILED';

  if (isFailed) {
    return (
      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
        <h3 className="text-sm font-semibold text-foreground">AI Processing</h3>
        <p className="mt-4 text-sm text-foreground-muted">
          Processing failed. AI features are unavailable for this document.
        </p>
      </div>
    );
  }

  if (!processingComplete) {
    return (
      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
        <h3 className="text-sm font-semibold text-foreground">AI Processing</h3>
        <p className="mt-4 text-sm text-foreground-muted">
          AI processing will begin once document content has been extracted and
          normalized.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
      <h3 className="text-sm font-semibold text-foreground">
        AI Processing Pipeline
      </h3>
      <p className="mt-1 text-sm text-foreground-muted">
        Document content is ready for AI processing.
      </p>

      <div className="mt-4 space-y-3">
        <AiStep
          label="Semantic chunking"
          description="Split document into semantic chunks for processing"
          status="pending"
        />
        <AiStep
          label="Flashcard generation"
          description="Create flashcards from document content"
          status="pending"
        />
        <AiStep
          label="Embeddings"
          description="Generate vector embeddings for semantic search"
          status="pending"
        />
      </div>
    </div>
  );
}

function AiStep({
  label,
  description,
  status,
}: {
  label: string;
  description: string;
  status: 'pending' | 'active' | 'done' | 'error';
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-bg-overlay bg-background-surface px-4 py-3 ${
        status === 'pending' ? 'opacity-50' : ''
      }`}
    >
      <div
        className={`h-4 w-4 rounded-full border-2 ${
          status === 'done'
            ? 'border-semantic-success bg-semantic-success'
            : status === 'error'
              ? 'border-semantic-error bg-semantic-error'
              : status === 'active'
                ? 'border-brand'
                : 'border-foreground-disabled'
        }`}
      />
      <div className="flex-1">
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-foreground-muted">{description}</p>
      </div>
      <span
        className={`text-xs font-medium ${
          status === 'done'
            ? 'text-semantic-success'
            : status === 'error'
              ? 'text-semantic-error'
              : status === 'active'
                ? 'text-brand'
                : 'text-foreground-disabled'
        }`}
      >
        {status === 'done'
          ? 'Complete'
          : status === 'error'
            ? 'Failed'
            : status === 'active'
              ? 'Processing'
              : 'Pending'}
      </span>
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

function getExtension(
  doc: SourceDocumentDto,
): string | null {
  const name = doc.originalName ?? doc.title;
  const match = name.match(/\.([a-z0-9]+)$/i);
  return match ? match[0].toLowerCase() : null;
}

function getMimeType(doc: SourceDocumentDto): string | null {
  const ext = getExtension(doc);
  if (!ext) return null;
  for (const [key, mimes] of Object.entries(MIME_TYPES)) {
    if (key === ext && mimes.length > 0) {
      return mimes[0] ?? null;
    }
  }
  return null;
}
