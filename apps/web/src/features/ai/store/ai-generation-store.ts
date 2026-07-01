import { create } from 'zustand';
import { logger } from '@/lib/logger';
import type { Flashcard } from '@/features/flashcards/types';
import type { KnowledgeChunk } from '@recallai/shared';
import type { AiProviderType } from '../types';
import { generateFlashcardsWithAI } from '../services/flashcard-generation';
import type { BuiltPrompt } from '../services/prompt-builder';
import { aiProviderRegistry } from '../providers/registry';

export type GenerationStatus =
  | 'idle'
  | 'building_prompt'
  | 'calling_provider'
  | 'parsing'
  | 'validating'
  | 'completed'
  | 'failed';

interface ValidationInfo {
  cardId: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface AiGenerationState {
  status: GenerationStatus;
  progress: string;
  error: string | null;
  generatedCards: Flashcard[];
  validationResults: ValidationInfo[];
  prompt: BuiltPrompt | null;
  provider: string;
  model: string;
  totalTokens: number;
  durationMs: number;
  errors: string[];

  generate: (chunks: KnowledgeChunk[], documentId: string, options?: { provider?: AiProviderType; count?: number; title?: string }) => Promise<void>;
  reset: () => void;
}

export const useAiGenerationStore = create<AiGenerationState>((set) => ({
  status: 'idle',
  progress: '',
  error: null,
  generatedCards: [],
  validationResults: [],
  prompt: null,
  provider: '',
  model: '',
  totalTokens: 0,
  durationMs: 0,
  errors: [],

  generate: async (chunks, documentId, options) => {
    const startTime = Date.now();

    try {
      set({ status: 'building_prompt', progress: 'Building generation prompt...', error: null, errors: [] });

      const provider = options?.provider ?? 'openai';
      const providerObj = aiProviderRegistry.get(provider);
      const providerName = providerObj?.type ?? provider;
      const modelName = providerObj?.model ?? '';

      set({ provider: providerName, model: modelName });

      set({ status: 'calling_provider', progress: `Calling ${providerName}...` });

      const result = await generateFlashcardsWithAI(chunks, documentId, options);

      set({ status: 'parsing', progress: 'Parsing AI response...' });

      set({ status: 'validating', progress: `Validating ${result.flashcards.length} flashcards...` });

      const durationMs = Date.now() - startTime;

      set({
        status: result.errors.length > 0 ? 'failed' : 'completed',
        progress: result.errors.length > 0 ? 'Generation completed with errors' : 'Generation complete',
        generatedCards: result.flashcards,
        validationResults: result.validationResults,
        prompt: result.prompt,
        totalTokens: result.totalTokens,
        durationMs,
        errors: result.errors,
      });

      logger.info('AI flashcard generation completed', {
        provider: result.provider,
        cardsGenerated: result.flashcards.length,
        totalTokens: result.totalTokens,
        latencyMs: result.latencyMs,
        errors: result.errors.length,
      });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const message = err instanceof Error ? err.message : 'Flashcard generation failed';

      set({
        status: 'failed',
        progress: 'Generation failed',
        error: message,
        durationMs,
      });

      logger.error('AI flashcard generation failed', { error: message });
    }
  },

  reset: () => {
    set({
      status: 'idle',
      progress: '',
      error: null,
      generatedCards: [],
      validationResults: [],
      prompt: null,
      provider: '',
      model: '',
      totalTokens: 0,
      durationMs: 0,
      errors: [],
    });
  },
}));
