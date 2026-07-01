'use client';

import { ReviewCardView } from './review-card';
import type { ReviewRating, SessionProgress } from '../types';
import type { ReviewCard } from '../types';

interface ReviewSessionViewProps {
  currentCard: ReviewCard | undefined;
  sessionState: {
    status: string;
    reviewedCards: number;
    totalCards: number;
  };
  progress: SessionProgress | null;
  onRate: (rating: ReviewRating) => void;
  onPause: () => void;
  onFinish: () => void;
  onResume: () => void;
}

export function ReviewSessionView({
  currentCard,
  sessionState,
  progress,
  onRate,
  onPause,
  onFinish,
  onResume,
}: ReviewSessionViewProps) {
  if (!currentCard) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="rounded-xl border border-bg-overlay bg-background-elevated p-8">
          <h3 className="text-lg font-semibold text-foreground">Session Complete</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            You reviewed {sessionState.reviewedCards} cards.
          </p>
          {progress && (
            <p className="mt-1 text-xs text-foreground-muted">
              Time spent: ~{Math.round(progress.averageTimePerCard / 1000)}s per card
            </p>
          )}
          <button
            onClick={onFinish}
            className="mt-6 rounded-lg bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Finish Session
          </button>
        </div>
      </div>
    );
  }

  const p = progress ?? { reviewed: sessionState.reviewedCards, total: sessionState.totalCards, percentage: 0 };

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Review Session</h2>
        <div className="flex gap-2">
          {sessionState.status === 'active' ? (
            <button
              onClick={onPause}
              className="rounded border border-bg-overlay px-3 py-1 text-xs text-foreground hover:bg-bg-overlay"
            >
              Pause
            </button>
          ) : sessionState.status === 'paused' ? (
            <button
              onClick={onResume}
              className="rounded border border-bg-overlay px-3 py-1 text-xs text-foreground hover:bg-bg-overlay"
            >
              Resume
            </button>
          ) : null}
          <button
            onClick={onFinish}
            className="rounded border border-semantic-error/30 px-3 py-1 text-xs text-semantic-error hover:bg-semantic-error/10"
          >
            End
          </button>
        </div>
      </div>

      <ReviewCardView
        card={currentCard}
        onRate={onRate}
        progress={p}
      />
    </div>
  );
}
