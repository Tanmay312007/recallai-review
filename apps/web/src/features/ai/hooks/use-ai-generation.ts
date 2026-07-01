'use client';

import { useCallback } from 'react';
import { useAiGenerationStore } from '../store/ai-generation-store';
import type { Flashcard } from '@/features/flashcards/types';
import type { KnowledgeChunk } from '@lumora/shared';
import type { AiProviderType } from '../types';
import type { BuiltPrompt } from '../services/prompt-builder';
import type { GenerationStatus } from '../store/ai-generation-store';

interface UseAiGenerationReturn {
  status: GenerationStatus;
  progress: string;
  error: string | null;
  generatedCards: Flashcard[];
  validationResults: { cardId: string; valid: boolean; errors: string[]; warnings: string[] }[];
  prompt: BuiltPrompt | null;
  provider: string;
  model: string;
  totalTokens: number;
  durationMs: number;
  errors: string[];
  generate: (chunks: KnowledgeChunk[], documentId: string, options?: { provider?: AiProviderType; count?: number; title?: string }) => Promise<void>;
  reset: () => void;
}

export function useAiGeneration(): UseAiGenerationReturn {
  const status = useAiGenerationStore((s) => s.status);
  const progress = useAiGenerationStore((s) => s.progress);
  const error = useAiGenerationStore((s) => s.error);
  const generatedCards = useAiGenerationStore((s) => s.generatedCards);
  const validationResults = useAiGenerationStore((s) => s.validationResults);
  const prompt = useAiGenerationStore((s) => s.prompt);
  const provider = useAiGenerationStore((s) => s.provider);
  const model = useAiGenerationStore((s) => s.model);
  const totalTokens = useAiGenerationStore((s) => s.totalTokens);
  const durationMs = useAiGenerationStore((s) => s.durationMs);
  const errors = useAiGenerationStore((s) => s.errors);
  const generate = useAiGenerationStore((s) => s.generate);
  const reset = useAiGenerationStore((s) => s.reset);

  return {
    status,
    progress,
    error,
    generatedCards,
    validationResults,
    prompt,
    provider,
    model,
    totalTokens,
    durationMs,
    errors,
    generate: useCallback(
      (chunks, documentId, options) => generate(chunks, documentId, options),
      [generate],
    ),
    reset: useCallback(() => reset(), [reset]),
  };
}
