import { useCallback } from 'react';
import type { Flashcard } from '@/features/flashcards/types';
import { useQualityStore } from '../store/quality-store';

export function useQualityReview() {
  const store = useQualityStore();

  const analyzeCards = useCallback((cards: Flashcard[], existingCards?: Flashcard[]) => {
    store.setCards(cards);
    for (const card of cards) {
      store.analyzeCard(card, existingCards ?? cards);
    }
  }, [store]);

  const addAndAnalyze = useCallback((cards: Flashcard[], existingCards?: Flashcard[]) => {
    store.addCards(cards);
    for (const card of cards) {
      store.analyzeCard(card, existingCards ?? cards);
    }
  }, [store]);

  return {
    reviews: store.reviews,
    selection: store.selection,
    filters: store.filters,
    analytics: store.analytics,
    isAnalyzing: store.isAnalyzing,
    analyzeCards,
    addAndAnalyze,
    reviewCard: store.reviewCard,
    toggleSelection: store.toggleSelection,
    selectAll: store.selectAll,
    clearSelection: store.clearSelection,
    batchAction: store.batchAction,
    approveAll: store.approveAll,
    rejectAll: store.rejectAll,
    setFilters: store.setFilters,
    getFilteredCardIds: store.getFilteredCardIds,
    getReviewStats: store.getReviewStats,
    reset: store.reset,
  };
}

export function useQualityAnalytics() {
  const store = useQualityStore();

  const reviewStats = store.getReviewStats();
  const analytics = store.analytics;

  return {
    reviewStats,
    generationAnalytics: analytics,
    setAnalytics: store.setAnalytics,
  };
}
