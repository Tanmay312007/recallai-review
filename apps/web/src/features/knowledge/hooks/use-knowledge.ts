'use client';

import { useCallback } from 'react';
import { useKnowledgeStore } from '../store/knowledge-store';
import { knowledgeService } from '../services/knowledge-service';
import type { NormalizedDocument } from '@/features/processing/types';
import type { ChunkingOptions } from '../types';
import type { KnowledgeChunk } from '@recallai/shared';

interface UseKnowledgeReturn {
  chunks: KnowledgeChunk[];
  selectedChunkId: string | null;
  selectChunk: (chunkId: string | null) => void;
  processDocument: (
    documentId: string,
    normalized: NormalizedDocument,
    options?: ChunkingOptions,
  ) => void;
  getChunk: (chunkId: string) => KnowledgeChunk | undefined;
  totalChunks: number;
  totalWords: number;
  totalTokens: number;
}

export function useKnowledge(documentId: string): UseKnowledgeReturn {
  const knowledge = useKnowledgeStore((s) => s.knowledge[documentId]);
  const selectedChunkId = useKnowledgeStore((s) => s.selectedChunkId);
  const selectChunk = useKnowledgeStore((s) => s.selectChunk);
  const setKnowledge = useKnowledgeStore((s) => s.setKnowledge);
  const getChunk = useKnowledgeStore((s) => s.getChunk);

  const processDocument = useCallback(
    (
      id: string,
      normalized: NormalizedDocument,
      options?: ChunkingOptions,
    ) => {
      const result = knowledgeService.process(id, normalized, options);
      setKnowledge(id, result);
    },
    [setKnowledge],
  );

  return {
    chunks: knowledge?.chunks ?? [],
    selectedChunkId,
    selectChunk,
    processDocument,
    getChunk,
    totalChunks: knowledge?.chunks.length ?? 0,
    totalWords: knowledge?.totalWords ?? 0,
    totalTokens: knowledge?.totalTokens ?? 0,
  };
}
