'use client';

import { useCallback } from 'react';
import type { NormalizedDocument } from '@/features/processing/types';
import { useKnowledge } from '../hooks/use-knowledge';
import { ChunkList } from './chunk-preview';
import type { ChunkingOptions } from '../types';

interface KnowledgePipelineProps {
  documentId: string;
  normalizedDocument: NormalizedDocument | undefined;
  processingComplete: boolean;
}

export function KnowledgePipeline({
  documentId,
  normalizedDocument,
  processingComplete,
}: KnowledgePipelineProps) {
  const {
    chunks,
    selectedChunkId,
    selectChunk,
    processDocument,
    totalChunks,
    totalWords,
    totalTokens,
  } = useKnowledge(documentId);

  const needsProcessing = processingComplete && normalizedDocument && chunks.length === 0;

  const handleProcess = useCallback(() => {
    if (!normalizedDocument) return;
    const options: ChunkingOptions = {
      minChunkWords: 50,
      maxChunkWords: 500,
      respectHeadings: true,
      respectParagraphs: true,
    };
    processDocument(documentId, normalizedDocument, options);
  }, [documentId, normalizedDocument, processDocument]);

  if (!processingComplete) {
    return (
      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
        <h3 className="text-sm font-semibold text-foreground">Knowledge Pipeline</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          Document processing must complete before knowledge chunking can begin.
        </p>
      </div>
    );
  }

  if (!normalizedDocument) {
    return (
      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
        <h3 className="text-sm font-semibold text-foreground">Knowledge Pipeline</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          No normalized document available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Knowledge Pipeline
          </h3>
          {chunks.length > 0 && (
            <p className="mt-1 text-xs text-foreground-muted">
              {totalChunks} chunks \u00B7 {totalWords} words \u00B7 ~{totalTokens} tokens
            </p>
          )}
        </div>
        {needsProcessing && (
          <button
            onClick={handleProcess}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Generate chunks
          </button>
        )}
      </div>

      <ChunkList
        chunks={chunks}
        selectedId={selectedChunkId}
        onSelect={selectChunk}
      />
    </div>
  );
}
