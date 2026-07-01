import { create } from 'zustand';
import type { Flashcard } from '@/features/flashcards/types';
import type {
  CardReview,
  ReviewAction,
  ReviewStatus,
  QualityScore,
  DuplicateInfo,
  DifficultyLevel,
  BatchSelection,
  BatchActionResult,
  GenerationAnalytics,
} from '../types';
import { calculateQualityScore, detectAllDuplicates } from '../scoring';
import { estimateDifficulty } from '../services/difficulty-estimation';
import { reviewService } from '../services/review-service';
import { batchService } from '../services/batch-service';
import { analyticsService } from '../services/analytics-service';
import { logger } from '@/lib/logger';

interface QualityStoreState {
  reviews: Map<string, CardReview>;
  selection: BatchSelection;
  filters: { status: ReviewStatus[]; flagged: boolean | null };
  analytics: GenerationAnalytics | null;
  isAnalyzing: boolean;

  setCards: (cards: Flashcard[]) => void;
  addCards: (cards: Flashcard[]) => void;
  analyzeCard: (card: Flashcard, existingCards: Flashcard[]) => void;
  reviewCard: (cardId: string, action: ReviewAction, note?: string) => void;
  updateScore: (cardId: string, score: QualityScore) => void;
  updateDuplicates: (cardId: string, duplicates: DuplicateInfo[]) => void;
  updateDifficulty: (cardId: string, difficulty: DifficultyLevel) => void;
  toggleSelection: (cardId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  batchAction: (action: ReviewAction) => BatchActionResult | null;
  approveAll: () => BatchActionResult | null;
  rejectAll: () => BatchActionResult | null;
  setFilters: (filters: Partial<QualityStoreState['filters']>) => void;
  getFilteredCardIds: () => string[];
  setAnalytics: (analytics: GenerationAnalytics) => void;
  getReviewStats: () => ReturnType<typeof analyticsService.computeReviewAnalytics>;
  reset: () => void;
}

export const useQualityStore = create<QualityStoreState>((set, get) => ({
  reviews: new Map(),
  selection: { cardIds: new Set(), selectAll: false },
  filters: { status: [], flagged: null },
  analytics: null,
  isAnalyzing: false,

  setCards: (cards: Flashcard[]) => {
    const reviews = new Map<string, CardReview>();
    for (const card of cards) {
      reviews.set(card.id, reviewService.createReview(card));
    }
    set({ reviews, selection: { cardIds: new Set(), selectAll: false } });
    logger.info(`Quality store initialized with ${cards.length} cards`);
  },

  addCards: (cards: Flashcard[]) => {
    const reviews = new Map(get().reviews);
    for (const card of cards) {
      if (!reviews.has(card.id)) {
        reviews.set(card.id, reviewService.createReview(card));
      }
    }
    set({ reviews });
  },

  analyzeCard: (card: Flashcard, existingCards: Flashcard[]) => {
    const reviews = new Map(get().reviews);
    const review = reviews.get(card.id);
    if (!review) return;

    const score = calculateQualityScore(card);
    const duplicates = detectAllDuplicates(card, existingCards);
    const difficulty = estimateDifficulty(card);

    reviews.set(card.id, {
      ...review,
      score,
      duplicates,
      difficulty,
    });

    set({ reviews });
  },

  reviewCard: (cardId: string, action: ReviewAction, note = '') => {
    const reviews = new Map(get().reviews);
    const review = reviews.get(cardId);
    if (!review) {
      logger.warn('Review not found for card', { cardId });
      return;
    }

    reviews.set(cardId, reviewService.applyAction(review, action, note));
    set({ reviews });
  },

  updateScore: (cardId: string, score: QualityScore) => {
    const reviews = new Map(get().reviews);
    const review = reviews.get(cardId);
    if (review) {
      reviews.set(cardId, { ...review, score });
      set({ reviews });
    }
  },

  updateDuplicates: (cardId: string, duplicates: DuplicateInfo[]) => {
    const reviews = new Map(get().reviews);
    const review = reviews.get(cardId);
    if (review) {
      reviews.set(cardId, { ...review, duplicates });
      set({ reviews });
    }
  },

  updateDifficulty: (cardId: string, difficulty: DifficultyLevel) => {
    const reviews = new Map(get().reviews);
    const review = reviews.get(cardId);
    if (review) {
      reviews.set(cardId, { ...review, difficulty });
      set({ reviews });
    }
  },

  toggleSelection: (cardId: string) => {
    const selection = { ...get().selection };
    const cardIds = new Set(selection.cardIds);
    if (cardIds.has(cardId)) {
      cardIds.delete(cardId);
    } else {
      cardIds.add(cardId);
    }
    set({ selection: { ...selection, cardIds, selectAll: false } });
  },

  selectAll: () => {
    const cardIds = new Set(get().reviews.keys());
    set({ selection: { cardIds, selectAll: true } });
  },

  clearSelection: () => {
    set({ selection: { cardIds: new Set(), selectAll: false } });
  },

  batchAction: (action: ReviewAction) => {
    const { reviews, selection } = get();
    if (selection.cardIds.size === 0) return null;

    const result = batchService.applyToSelection(reviews, selection, action);
    set({ reviews: result.updated, selection: { cardIds: new Set(), selectAll: false } });
    return result.result;
  },

  approveAll: () => {
    const result = batchService.approveAll(get().reviews);
    set({ reviews: result.updated });
    return result.result;
  },

  rejectAll: () => {
    const result = batchService.rejectAll(get().reviews);
    set({ reviews: result.updated });
    return result.result;
  },

  setFilters: (filters: Partial<QualityStoreState['filters']>) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  getFilteredCardIds: () => {
    const { reviews, filters } = get();
    return reviewService.getFilterableCards(reviews, filters);
  },

  setAnalytics: (analytics: GenerationAnalytics) => {
    set({ analytics });
  },

  getReviewStats: () => {
    return analyticsService.computeReviewAnalytics([...get().reviews.values()]);
  },

  reset: () => {
    set({
      reviews: new Map(),
      selection: { cardIds: new Set(), selectAll: false },
      filters: { status: [], flagged: null },
      analytics: null,
    });
  },
}));
