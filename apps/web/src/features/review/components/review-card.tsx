'use client';

import { useState } from 'react';
import type { ReviewCard, ReviewRating } from '../types';
import { REVIEW_RATING_LABELS, REVIEW_RATING_COLORS } from '../types';
import { FLASHCARD_CARD_TYPE_LABELS } from '@/features/flashcards/types';

interface ReviewCardViewProps {
  card: ReviewCard;
  onRate: (rating: ReviewRating) => void;
  progress: {
    reviewed: number;
    total: number;
    percentage: number;
  };
}

export function ReviewCardView({ card, onRate, progress }: ReviewCardViewProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleRate = (rating: ReviewRating) => {
    setShowAnswer(false);
    onRate(rating);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground-muted">
          {FLASHCARD_CARD_TYPE_LABELS[card.cardType]}
        </span>
        <span className="text-xs text-foreground-muted">
          {progress.reviewed} / {progress.total}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-overlay">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="rounded-xl border border-bg-overlay bg-background-elevated p-8">
        <p className="text-xs font-medium text-foreground-muted mb-2">Question</p>
        <p className="text-lg text-foreground leading-relaxed">{card.question}</p>

        {card.sourcePage != null && (
          <p className="mt-4 text-xs text-foreground-muted">
            Source: page {card.sourcePage}
          </p>
        )}
      </div>

      {!showAnswer ? (
        <button
          onClick={() => setShowAnswer(true)}
          className="w-full rounded-xl bg-brand py-4 text-base font-medium text-white hover:bg-brand-hover transition-colors"
        >
          Show Answer
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-bg-overlay bg-background-elevated p-8">
            <p className="text-xs font-medium text-foreground-muted mb-2">Answer</p>
            <p className="text-lg text-foreground-secondary leading-relaxed whitespace-pre-wrap">
              {card.answer}
            </p>
          </div>

          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <span key={tag} className="rounded bg-bg-overlay px-2 py-0.5 text-[11px] text-foreground-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {(['again', 'hard', 'good', 'easy'] as ReviewRating[]).map((rating) => (
              <button
                key={rating}
                onClick={() => handleRate(rating)}
                className={`rounded-xl py-3 text-sm font-medium transition-colors ${REVIEW_RATING_COLORS[rating]}`}
              >
                {REVIEW_RATING_LABELS[rating]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 text-xs text-foreground-muted">
        {card.fsrsState.state > 0 && (
          <>
            <span>Stability: {card.fsrsState.stability.toFixed(1)}d</span>
            <span>Difficulty: {card.fsrsState.difficulty.toFixed(1)}</span>
            <span>Reps: {card.fsrsState.reps}</span>
            {card.fsrsState.lapses > 0 && (
              <span>Lapses: {card.fsrsState.lapses}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
