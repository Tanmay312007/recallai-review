import { create } from 'zustand';
import { logger } from '@/lib/logger';
import type { Flashcard } from '@/features/flashcards/types';
import type { AiProviderType, AiGenerationResponse } from '../types';
import { generateFlashcardsWithAI } from '../services/flashcard-generation';
import { validateAiFlashcards, resetAiValidationState } from '../validators';
import type { KnowledgeChunk } from '@recallai/shared';

export type GenerationStatus = 'idle' | 'building_prompt' | 'calling_provider' | 'parsing' | 'validating' | 'completed' | 'failed';

interface AiGenerationState {
  status: GenerationStatus;
  progress: string;
  error: string | null;
  result: AiGenerationResponse | null;
  generatedCards: Flashcard[];
  validationResults: { valid: boolean; errors: string[]; warnings: string[] }[];

  generate: (
    chunks: KnowledgeChunk[],
    documentId: string,
    options?: { count?: number; providerType?: AiProviderType },
  ) => Promise<void>;
  reset: () => void;
}

export const useAiGenerationStore = create<AiGenerationState>((set) => ({
  status: 'idle',
  progress: '',
  error: null,
  result: null,
  generatedCards: [],
  validationResults: [],

  generate: async (chunks, documentId, options) => {
    set({ status: 'building_prompt', progress: 'Preparing content...', error: null });
    resetAiValidationState();

    try {
      const result = await generateFlashcardsWithAI(chunks, documentId, {
        count: options?.count,
        onProgress: (stage) => {
          const statusMap: Record<string, GenerationStatus> = {
            'Building prompt': 'building_prompt',
            'Calling AI provider': 'calling_provider',
            'Parsing response': 'parsing',
            'Creating flashcards': 'validating',
          };
          set({ status: statusMap[stage] ?? 'parsing', progress: stage });
        },
      });

      set({ status: 'validating', progress: 'Validating flashcards...' });

      const validationResults = validateAiFlashcards(result.flashcards);
      const validCards = result.flashcards.filter((_, i) => validationResults[i]?.valid);

      set({
        status: 'completed',
        progress: 'Generation complete',
        result: {
          content: '',
          model: result.model,
          provider: result.provider,
          usage: result.usage,
          durationMs: result.durationMs,
        },
        generatedCards: validCards,
        validationResults,
      });

      logger.info('AI generation store: completed', {
        total: result.flashcards.length,
        valid: validCards.length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI generation failed';
      set({
        status: 'failed',
        progress: '',
        error: message,
      });
      logger.error('AI generation failed', { error: message });
    }
  },

  reset: () => {
    set({
      status: 'idle',
      progress: '',
      error: null,
      result: null,
      generatedCards: [],
      validationResults: [],
    });
  },
}));
