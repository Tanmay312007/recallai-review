'use client';

import { useCallback } from 'react';
import { useAiGenerationStore } from '../store/ai-generation-store';
import type { KnowledgeChunk } from '@recallai/shared';
import type { AiProviderType } from '../types';
import type { Flashcard } from '@/features/flashcards/types';

interface UseAiGenerationReturn {
  status: string;
  progress: string;
  error: string | null;
  generatedCards: Flashcard[];
  validationResults: { valid: boolean; errors: string[]; warnings: string[] }[];
  provider: string;
  model: string;
  totalTokens: number;
  durationMs: number;
  generate: (
    chunks: KnowledgeChunk[],
    documentId: string,
    options?: { count?: number; providerType?: AiProviderType },
  ) => Promise<void>;
  reset: () => void;
}

export function useAiGeneration(): UseAiGenerationReturn {
  const status = useAiGenerationStore((s) => s.status);
  const progress = useAiGenerationStore((s) => s.progress);
  const error = useAiGenerationStore((s) => s.error);
  const result = useAiGenerationStore((s) => s.result);
  const generatedCards = useAiGenerationStore((s) => s.generatedCards);
  const validationResults = useAiGenerationStore((s) => s.validationResults);
  const generate = useAiGenerationStore((s) => s.generate);
  const reset = useAiGenerationStore((s) => s.reset);

  return {
    status,
    progress,
    error,
    generatedCards,
    validationResults,
    provider: result?.provider ?? '',
    model: result?.model ?? '',
    totalTokens: result?.usage.totalTokens ?? 0,
    durationMs: result?.durationMs ?? 0,
    generate: useCallback(
      (chunks, documentId, options) => generate(chunks, documentId, options),
      [generate],
    ),
    reset: useCallback(() => reset(), [reset]),
  };
}
