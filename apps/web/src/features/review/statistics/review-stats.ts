import type { DailyStats, ReviewRating } from '../types';

export interface ReviewStatistics {
  daily: DailyStats;
  totalCardsReviewed: number;
  totalSessions: number;
  totalTimeSpentMinutes: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  upcomingReviews: number;
  cardsByDifficulty: Record<string, number>;
  cardsByRating: Record<string, number>;
}

export function calculateDailyStats(
  todayRatings: ReviewRating[],
  todayTimeMs: number,
  streak: number,
  newCardsToday: number,
): DailyStats {
  const total = todayRatings.length;
  const correct = todayRatings.filter((r) => r !== 'again').length;

  return {
    date: new Date().toISOString().slice(0, 10),
    cardsReviewed: total,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    averageDifficulty: total > 0 ? calculateAverageDifficulty(todayRatings) : 0,
    timeSpentMinutes: Math.round(todayTimeMs / 60000),
    streak,
    newCardsLearned: newCardsToday,
    reviewsCompleted: correct,
  };
}

export function calculateStreak(
  reviewHistory: { date: string; cardsReviewed: number }[],
): { current: number; longest: number } {
  const sorted = [...reviewHistory]
    .filter((d) => d.cardsReviewed > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return { current: 0, longest: 0 };

  let current = 1;
  let longest = 1;

  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = daysBetween(sorted[i]!.date, sorted[i + 1]!.date);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const mostRecent = sorted[0]!.date;
  const daysSince = daysBetween(today, mostRecent);

  if (daysSince > 1) {
    current = 0;
  }

  return { current, longest };
}

function calculateAverageDifficulty(ratings: ReviewRating[]): number {
  if (ratings.length === 0) return 0;
  const map: Record<ReviewRating, number> = { again: 1, hard: 2, good: 3, easy: 4 };
  const sum = ratings.reduce((s, r) => s + map[r], 0);
  return Math.round((sum / ratings.length) * 100) / 100;
}

function daysBetween(a: string, b: string): number {
  const dateA = new Date(a);
  const dateB = new Date(b);
  const diff = dateA.getTime() - dateB.getTime();
  return Math.round(diff / 86400000);
}
