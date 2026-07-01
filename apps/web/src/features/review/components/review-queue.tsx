'use client';

import type { ReviewQueue } from '../types';

interface ReviewQueueViewProps {
  queue: ReviewQueue;
  onStartSession: () => void;
}

export function ReviewQueueView({ queue, onStartSession }: ReviewQueueViewProps) {
  const hasCards = queue.totalDue > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Review Queue</h3>
        {hasCards && (
          <button
            onClick={onStartSession}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Start Review
          </button>
        )}
      </div>

      {!hasCards ? (
        <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6 text-center">
          <p className="text-sm text-foreground-muted">
            No cards due for review. Generate flashcards first, or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QueueStat label="New" count={queue.newCards.length} color="text-brand" />
          <QueueStat
            label="Learning"
            count={queue.learningCards.length}
            color="text-semantic-warning"
          />
          <QueueStat
            label="Review"
            count={queue.reviewCards.length}
            color="text-semantic-success"
          />
          <QueueStat
            label="Relearning"
            count={queue.relearningCards.length}
            color="text-semantic-error"
          />
        </div>
      )}

      <p className="text-xs text-foreground-muted">
        {queue.totalDue} card{queue.totalDue !== 1 ? 's' : ''} due
      </p>
    </div>
  );
}

function QueueStat({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-bg-overlay bg-background-elevated p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{count}</p>
      <p className="mt-1 text-xs text-foreground-muted">{label}</p>
    </div>
  );
}
