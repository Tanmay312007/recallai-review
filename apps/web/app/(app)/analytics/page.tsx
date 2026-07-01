'use client';

import { useMemo } from 'react';
import { useFlashcardStore } from '@/features/flashcards/store/flashcard-store';
import { useReviewStore } from '@/features/review/store/review-store';
import { ReviewStatsView } from '@/features/review/components/review-stats';
import { FLASHCARD_CARD_TYPE_LABELS } from '@/features/flashcards/types';
import type { FlashcardCardType } from '@/features/flashcards/types';

export default function AnalyticsPage() {
  const cards = useFlashcardStore((s) => s.cards);
  const stats = useReviewStore((s) => s.stats);
  const queue = useReviewStore((s) => s.queue);

  const typeDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cards) {
      counts.set(c.cardType, (counts.get(c.cardType) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1]);
  }, [cards]);

  const difficultyDistribution = useMemo(() => {
    const counts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    for (const c of cards) {
      counts[c.difficulty] = (counts[c.difficulty] ?? 0) + 1;
    }
    return counts;
  }, [cards]);

  const totalByDocument = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cards) {
      counts.set(c.documentId, (counts.get(c.documentId) ?? 0) + 1);
    }
    return counts.size;
  }, [cards]);

  const validationStats = useMemo(() => {
    let passed = 0;
    let failed = 0;
    let pending = 0;
    for (const c of cards) {
      if (c.metadata.validationStatus === 'passed') passed++;
      else if (c.metadata.validationStatus === 'failed') failed++;
      else pending++;
    }
    return { passed, failed, pending };
  }, [cards]);

  const upcomingByState = {
    new: queue.newCards.length,
    learning: queue.learningCards.length,
    review: queue.reviewCards.length,
    relearning: queue.relearningCards.length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Study statistics and card insights
        </p>
      </div>

      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
        <ReviewStatsView stats={stats} upcomingReviews={queue.totalDue} />
      </div>

      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Cards Overview</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Cards" value={String(cards.length)} />
          <MetricCard label="Decks" value={String(totalByDocument)} />
          <MetricCard label="Valid" value={String(validationStats.passed)} />
          <MetricCard label="Needs Review" value={String(validationStats.failed + validationStats.pending)} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">By Card Type</h2>
          {typeDistribution.length === 0 ? (
            <p className="text-sm text-foreground-muted">No cards generated yet.</p>
          ) : (
            <div className="space-y-2">
              {typeDistribution.map(([type, count]) => {
                const pct = Math.round((count / cards.length) * 100);
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground">{FLASHCARD_CARD_TYPE_LABELS[type as FlashcardCardType]}</span>
                      <span className="text-foreground-muted">{count} ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-bg-overlay">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">By Difficulty</h2>
          {cards.length === 0 ? (
            <p className="text-sm text-foreground-muted">No cards generated yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(difficultyDistribution).map(([difficulty, count]) => {
                const pct = Math.round((count / cards.length) * 100);
                const barColor = difficulty === 'easy' ? 'bg-semantic-success' : difficulty === 'hard' ? 'bg-semantic-error' : 'bg-semantic-warning';
                return (
                  <div key={difficulty}>
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground capitalize">{difficulty}</span>
                      <span className="text-foreground-muted">{count} ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-bg-overlay">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {queue.totalDue > 0 && (
        <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Upcoming Reviews</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard label="New" value={String(upcomingByState.new)} color="text-brand" />
            <MetricCard label="Learning" value={String(upcomingByState.learning)} color="text-semantic-warning" />
            <MetricCard label="Review" value={String(upcomingByState.review)} color="text-semantic-success" />
            <MetricCard label="Relearning" value={String(upcomingByState.relearning)} color="text-semantic-error" />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-bg-overlay bg-background-surface p-3">
      <p className={`text-lg font-bold ${color ?? 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-foreground-muted">{label}</p>
    </div>
  );
}
