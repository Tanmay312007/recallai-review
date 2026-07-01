import type { FsrsStateSnapshot } from '@recallai/shared';
import type { Flashcard } from '@/features/flashcards/types';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export type ReviewQueueType = 'new' | 'learning' | 'review' | 'relearning';

export interface ReviewCard extends Flashcard {
  fsrsState: FsrsStateSnapshot;
  queueType: ReviewQueueType;
}

export interface ReviewQueue {
  newCards: ReviewCard[];
  learningCards: ReviewCard[];
  reviewCards: ReviewCard[];
  relearningCards: ReviewCard[];
  totalDue: number;
}

export interface ReviewSessionState {
  id: string;
  status: 'idle' | 'active' | 'paused' | 'completed';
  currentCardIndex: number;
  cards: ReviewCard[];
  startedAt: string | null;
  pausedAt: string | null;
  resumedAt: string | null;
  completedAt: string | null;
  totalCards: number;
  reviewedCards: number;
  ratings: ReviewRating[];
  timeSpentMs: number;
}

export interface ReviewRatingRecord {
  cardId: string;
  rating: ReviewRating;
  timestamp: string;
  elapsedMs: number;
}

export interface SessionProgress {
  reviewed: number;
  total: number;
  percentage: number;
  remaining: number;
  averageTimePerCard: number;
}

export interface DailyStats {
  date: string;
  cardsReviewed: number;
  accuracy: number;
  averageDifficulty: number;
  timeSpentMinutes: number;
  streak: number;
  newCardsLearned: number;
  reviewsCompleted: number;
}

export const REVIEW_RATING_LABELS: Record<ReviewRating, string> = {
  again: 'Again',
  hard: 'Hard',
  good: 'Good',
  easy: 'Easy',
};

export const REVIEW_RATING_COLORS: Record<ReviewRating, string> = {
  again: 'bg-semantic-error text-white hover:bg-semantic-error/90',
  hard: 'bg-semantic-warning text-white hover:bg-semantic-warning/90',
  good: 'bg-brand text-white hover:bg-brand-hover',
  easy: 'bg-semantic-success text-white hover:bg-semantic-success/90',
};
