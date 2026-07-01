import { create } from 'zustand';
import type { KnowledgeChunk } from '@recallai/shared';
import type { Flashcard } from '@/features/flashcards/types';
import { useFlashcardStore } from '@/features/flashcards/store/flashcard-store';

interface AiOrchestrationState {
  isGenerating: boolean;
  progress: string;
  error: string | null;
  generatedCards: Flashcard[];

  runAIPipeline: (
    chunks: KnowledgeChunk[],
    documentId: string,
    onCards: (cards: Flashcard[]) => void,
  ) => Promise<void>;
}

export const useAiOrchestrationStore = create<AiOrchestrationState>((set) => ({
  isGenerating: false,
  progress: '',
  error: null,
  generatedCards: [],

  runAIPipeline: async (chunks, documentId, onCards) => {
    set({ isGenerating: true, progress: 'Generating flashcards with AI...', error: null });

    try {
      const { generateFlashcardsWithAI } = await import('../services/flashcard-generation');
      const result = await generateFlashcardsWithAI(chunks, documentId);

      const { validateAiFlashcards } = await import('../validators');
      const validation = validateAiFlashcards(result.flashcards);
      const validCards = result.flashcards.filter((_, i) => validation[i]?.valid);

      const flashcardStore = useFlashcardStore.getState();
      for (const card of validCards) {
        flashcardStore.updateCard(card.id, card);
      }

      set({
        isGenerating: false,
        progress: 'Complete',
        generatedCards: validCards,
      });

      onCards(validCards);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI pipeline failed';
      set({ isGenerating: false, error: message });
    }
  },
}));
