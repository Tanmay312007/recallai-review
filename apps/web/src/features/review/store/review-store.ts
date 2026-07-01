import { create } from 'zustand';
import { logger } from '@/lib/logger';
import type { Flashcard } from '@/features/flashcards/types';
import type {
  ReviewCard,
  ReviewQueue,
  ReviewRating,
  ReviewSessionState,
  SessionProgress,
  DailyStats,
} from '../types';
import { buildReviewQueue, getNextCardFromQueue } from '../services/review-queue';
import { createSession, type SessionActions } from '../session/review-session';
import { calculateDailyStats } from '../statistics/review-stats';
import type { FsrsStateSnapshot } from '@recallai/shared';

interface ReviewState {
  queue: ReviewQueue;
  session: SessionActions | null;
  sessionState: ReviewSessionState | null;
  progress: SessionProgress | null;
  stats: DailyStats | null;
  flashcardStates: Map<string, FsrsStateSnapshot>;
  loading: boolean;

  buildQueue: (flashcards: Flashcard[]) => void;
  startSession: () => void;
  rateCard: (rating: ReviewRating) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  finishSession: () => void;
  resetSession: () => void;
  getNextCard: () => ReviewCard | undefined;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  queue: {
    newCards: [],
    learningCards: [],
    reviewCards: [],
    relearningCards: [],
    totalDue: 0,
  },
  session: null,
  sessionState: null,
  progress: null,
  stats: null,
  flashcardStates: new Map(),
  loading: false,

  buildQueue: (flashcards) => {
    const { flashcardStates } = get();
    const queue = buildReviewQueue(flashcards, flashcardStates);
    set({ queue, loading: false });
    logger.info('Review queue rebuilt', { totalDue: queue.totalDue });
  },

  startSession: () => {
    const { queue } = get();
    const allCards: ReviewCard[] = [
      ...queue.relearningCards,
      ...queue.learningCards,
      ...queue.reviewCards,
      ...queue.newCards,
    ];

    if (allCards.length === 0) return;

    const session = createSession(
      allCards,
      (sessionState) => {
        const progress: SessionProgress = {
          reviewed: sessionState.reviewedCards,
          total: sessionState.totalCards,
          percentage: sessionState.totalCards > 0
            ? Math.round((sessionState.reviewedCards / sessionState.totalCards) * 100)
            : 0,
          remaining: sessionState.totalCards - sessionState.reviewedCards,
          averageTimePerCard: sessionState.reviewedCards > 0
            ? Math.round(sessionState.timeSpentMs / sessionState.reviewedCards)
            : 0,
        };
        set({ sessionState, progress });

        if (sessionState.status === 'completed') {
          const stats = calculateDailyStats(
            sessionState.ratings,
            sessionState.timeSpentMs,
            1,
            sessionState.totalCards,
          );
          set({ stats });
        }
      },
      (record, newState) => {
        const { flashcardStates } = get();
        const next = new Map(flashcardStates);
        next.set(record.cardId, newState);
        set({ flashcardStates: next });
      },
    );

    session.start();
    set({ session });
  },

  rateCard: (rating) => {
    const { session } = get();
    if (!session) return;
    session.rate(rating);
  },

  pauseSession: () => {
    const { session } = get();
    session?.pause();
  },

  resumeSession: () => {
    const { session } = get();
    session?.resume();
  },

  finishSession: () => {
    const { session } = get();
    session?.finish();
  },

  resetSession: () => {
    set({
      session: null,
      sessionState: null,
      progress: null,
      stats: null,
    });
  },

  getNextCard: () => {
    const { queue } = get();
    return getNextCardFromQueue(queue);
  },
}));
