'use client';

import type { DailyStats } from '../types';

interface ReviewStatsViewProps {
  stats: DailyStats | null;
  upcomingReviews: number;
}

export function ReviewStatsView({ stats, upcomingReviews }: ReviewStatsViewProps) {
  if (!stats) {
    return (
      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6 text-center">
        <p className="text-sm text-foreground-muted">
          Complete a review session to see statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Today&apos;s Statistics</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Reviewed" value={String(stats.cardsReviewed)} />
        <StatCard label="Accuracy" value={`${stats.accuracy}%`} />
        <StatCard label="Time" value={`${stats.timeSpentMinutes}m`} />
        <StatCard label="Streak" value={`${stats.streak} days`} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Avg Difficulty" value={stats.averageDifficulty.toFixed(1)} />
        <StatCard label="New Cards" value={String(stats.newCardsLearned)} />
        <StatCard label="Upcoming" value={String(upcomingReviews)} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-bg-overlay bg-background-elevated p-3">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-foreground-muted">{label}</p>
    </div>
  );
}
