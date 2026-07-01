import { create } from 'zustand';
import type { Flashcard, FlashcardCardType, FlashcardDifficulty, FlashcardFilters, FlashcardValidationStatus } from '../types';
import { runFlashcardPipeline } from '../services/flashcard-pipeline';
import { resetValidationState } from '../validators';
import type { KnowledgeChunk } from '@recallai/shared';

interface FlashcardState {
  cards: Flashcard[];
  selectedCardId: string | null;
  filters: FlashcardFilters;
  loading: boolean;
  error: string | null;
  pipelineErrors: string[];

  generateCards: (chunks: KnowledgeChunk[], documentId: string) => void;
  selectCard: (cardId: string | null) => void;
  updateCard: (cardId: string, updates: Partial<Flashcard>) => void;
  deleteCard: (cardId: string) => void;
  clearCards: (documentId?: string) => void;

  setSearch: (search: string) => void;
  setCardTypeFilter: (cardType: FlashcardCardType | undefined) => void;
  setDifficultyFilter: (difficulty: FlashcardDifficulty | undefined) => void;
  setValidationFilter: (status: FlashcardValidationStatus | undefined) => void;
  setPage: (page: number) => void;

  getFilteredCards: () => Flashcard[];
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  cards: [],
  selectedCardId: null,
  filters: {
    page: 1,
    perPage: 50,
  },
  loading: false,
  error: null,
  pipelineErrors: [],

  generateCards: (chunks, documentId) => {
    set({ loading: true, error: null, pipelineErrors: [] });
    resetValidationState();

    try {
      const result = runFlashcardPipeline(chunks, documentId);

      set((state) => ({
        cards: [...state.cards, ...result.flashcards],
        loading: false,
        pipelineErrors: result.errors,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Flashcard generation failed';
      set({
        loading: false,
        error: message,
      });
    }
  },

  selectCard: (cardId) => {
    set({ selectedCardId: cardId });
  },

  updateCard: (cardId, updates) => {
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId
          ? { ...c, ...updates, edited: true, updatedAt: new Date().toISOString() }
          : c,
      ),
    }));
  },

  deleteCard: (cardId) => {
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== cardId),
      selectedCardId: state.selectedCardId === cardId ? null : state.selectedCardId,
    }));
  },

  clearCards: (documentId) => {
    if (documentId) {
      set((state) => ({
        cards: state.cards.filter((c) => c.documentId !== documentId),
      }));
    } else {
      set({ cards: [], selectedCardId: null });
    }
  },

  setSearch: (search) => {
    set((state) => ({ filters: { ...state.filters, search, page: 1 } }));
  },

  setCardTypeFilter: (cardType) => {
    set((state) => ({ filters: { ...state.filters, cardType, page: 1 } }));
  },

  setDifficultyFilter: (difficulty) => {
    set((state) => ({ filters: { ...state.filters, difficulty, page: 1 } }));
  },

  setValidationFilter: (validationStatus) => {
    set((state) => ({ filters: { ...state.filters, validationStatus, page: 1 } }));
  },

  setPage: (page) => {
    set((state) => ({ filters: { ...state.filters, page } }));
  },

  getFilteredCards: () => {
    const { cards, filters } = get();

    return cards.filter((c) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!c.question.toLowerCase().includes(q) && !c.answer.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filters.cardType && c.cardType !== filters.cardType) return false;
      if (filters.difficulty && c.difficulty !== filters.difficulty) return false;
      if (filters.validationStatus && c.metadata.validationStatus !== filters.validationStatus) return false;
      return true;
    });
  },
}));
