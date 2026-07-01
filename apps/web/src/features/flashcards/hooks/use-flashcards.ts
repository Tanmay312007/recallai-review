'use client';

import { useCallback } from 'react';
import { useFlashcardStore } from '../store/flashcard-store';
import type { Flashcard, FlashcardCardType, FlashcardDifficulty, FlashcardFilters, FlashcardValidationStatus } from '../types';
import type { KnowledgeChunk } from '@lumora/shared';

interface UseFlashcardsReturn {
  cards: Flashcard[];
  filteredCards: Flashcard[];
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
  totalCards: number;
}

export function useFlashcards(documentId?: string): UseFlashcardsReturn {
  const cards = useFlashcardStore((s) => s.cards);
  const filteredCards = useFlashcardStore((s) => s.getFilteredCards());
  const selectedCardId = useFlashcardStore((s) => s.selectedCardId);
  const filters = useFlashcardStore((s) => s.filters);
  const loading = useFlashcardStore((s) => s.loading);
  const error = useFlashcardStore((s) => s.error);
  const pipelineErrors = useFlashcardStore((s) => s.pipelineErrors);
  const generateCards = useFlashcardStore((s) => s.generateCards);
  const selectCard = useFlashcardStore((s) => s.selectCard);
  const updateCard = useFlashcardStore((s) => s.updateCard);
  const deleteCard = useFlashcardStore((s) => s.deleteCard);
  const clearCards = useFlashcardStore((s) => s.clearCards);
  const setSearch = useFlashcardStore((s) => s.setSearch);
  const setCardTypeFilter = useFlashcardStore((s) => s.setCardTypeFilter);
  const setDifficultyFilter = useFlashcardStore((s) => s.setDifficultyFilter);
  const setValidationFilter = useFlashcardStore((s) => s.setValidationFilter);
  const setPage = useFlashcardStore((s) => s.setPage);

  const documentCards = documentId
    ? cards.filter((c) => c.documentId === documentId)
    : cards;

  return {
    cards: documentCards,
    filteredCards: documentId
      ? filteredCards.filter((c) => c.documentId === documentId)
      : filteredCards,
    selectedCardId,
    filters,
    loading,
    error,
    pipelineErrors,
    generateCards: useCallback(
      (chunks, id) => generateCards(chunks, id),
      [generateCards],
    ),
    selectCard,
    updateCard: useCallback(
      (cardId, updates) => updateCard(cardId, updates),
      [updateCard],
    ),
    deleteCard: useCallback((cardId) => deleteCard(cardId), [deleteCard]),
    clearCards: useCallback((id) => clearCards(id), [clearCards]),
    setSearch,
    setCardTypeFilter,
    setDifficultyFilter,
    setValidationFilter,
    setPage,
    totalCards: documentCards.length,
  };
}
