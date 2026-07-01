'use client';

import { useCallback } from 'react';
import { useReviewStore } from '../store/review-store';
import type { Flashcard } from '@/features/flashcards/types';
import type { ReviewCard, ReviewRating, ReviewSessionState, SessionProgress, DailyStats } from '../types';

interface UseReviewReturn {
  queue: {
    newCards: ReviewCard[];
    learningCards: ReviewCard[];
    reviewCards: ReviewCard[];
    relearningCards: ReviewCard[];
    totalDue: number;
  };
  session: {
    state: ReviewSessionState | null;
    progress: SessionProgress | null;
    start: () => void;
    rate: (rating: ReviewRating) => void;
    pause: () => void;
    resume: () => void;
    finish: () => void;
    reset: () => void;
  };
  stats: DailyStats | null;
  buildQueue: (flashcards: Flashcard[]) => void;
  getNextCard: () => ReviewCard | undefined;
}

export function useReview(): UseReviewReturn {
  const queue = useReviewStore((s) => s.queue);
  const sessionState = useReviewStore((s) => s.sessionState);
  const progress = useReviewStore((s) => s.progress);
  const stats = useReviewStore((s) => s.stats);
  const buildQueue = useReviewStore((s) => s.buildQueue);
  const startSession = useReviewStore((s) => s.startSession);
  const rateCard = useReviewStore((s) => s.rateCard);
  const pauseSession = useReviewStore((s) => s.pauseSession);
  const resumeSession = useReviewStore((s) => s.resumeSession);
  const finishSession = useReviewStore((s) => s.finishSession);
  const resetSession = useReviewStore((s) => s.resetSession);
  const getNextCard = useReviewStore((s) => s.getNextCard);

  return {
    queue,
    session: {
      state: sessionState,
      progress,
      start: useCallback(() => startSession(), [startSession]),
      rate: useCallback((r: ReviewRating) => rateCard(r), [rateCard]),
      pause: useCallback(() => pauseSession(), [pauseSession]),
      resume: useCallback(() => resumeSession(), [resumeSession]),
      finish: useCallback(() => finishSession(), [finishSession]),
      reset: useCallback(() => resetSession(), [resetSession]),
    },
    stats,
    buildQueue: useCallback((f: Flashcard[]) => buildQueue(f), [buildQueue]),
    getNextCard: useCallback(() => getNextCard(), [getNextCard]),
  };
}
