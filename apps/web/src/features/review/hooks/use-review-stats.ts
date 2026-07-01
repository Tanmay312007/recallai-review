'use client';

import { useReviewStore } from '../store/review-store';
import type { DailyStats } from '../types';

interface UseReviewStatsReturn {
  stats: DailyStats | null;
  totalCards: number;
  cardsDueToday: number;
  cardsInQueue: number;
}

export function useReviewStats(): UseReviewStatsReturn {
  const stats = useReviewStore((s) => s.stats);
  const queue = useReviewStore((s) => s.queue);

  return {
    stats,
    totalCards: stats?.cardsReviewed ?? 0,
    cardsDueToday: queue.totalDue,
    cardsInQueue:
      queue.learningCards.length +
      queue.reviewCards.length +
      queue.relearningCards.length,
  };
}
