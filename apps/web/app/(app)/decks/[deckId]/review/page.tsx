'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFlashcardStore } from '@/features/flashcards/store/flashcard-store';
import { useReviewStore } from '@/features/review/store/review-store';
import { ReviewSessionView } from '@/features/review/components/review-session';
import { ReviewStatsView } from '@/features/review/components/review-stats';

export default function ReviewSessionPage({
  params,
}: {
  params: { deckId: string };
}) {
  const documentId = params.deckId;
  const router = useRouter();

  const cards = useFlashcardStore((s) => s.cards);
  const documentCards = useMemo(
    () => cards.filter((c) => c.documentId === documentId),
    [cards, documentId],
  );

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

  useEffect(() => {
    if (documentCards.length > 0 && queue.totalDue === 0 && !sessionState) {
      buildQueue(documentCards);
    }
  }, [documentCards, queue.totalDue, sessionState, buildQueue]);

  useEffect(() => {
    if (queue.totalDue > 0 && !sessionState) {
      startSession();
    }
  }, [queue.totalDue, sessionState, startSession]);

  useEffect(() => {
    return () => {
      resetSession();
    };
  }, [resetSession]);

  const currentCard = useMemo(() => {
    if (!sessionState || sessionState.status === 'completed') return undefined;
    return sessionState.cards[sessionState.currentCardIndex];
  }, [sessionState]);

  const handleFinish = useCallback(() => {
    finishSession();
  }, [finishSession]);

  const handleBack = useCallback(() => {
    router.push(`/decks/${documentId}`);
  }, [router, documentId]);

  if (documentCards.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="rounded-xl border border-bg-overlay bg-background-elevated p-8">
          <h2 className="text-lg font-semibold text-foreground">No cards to review</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            This deck has no flashcards. Generate flashcards for the document first.
          </p>
          <Link
            href={`/documents/${documentId}`}
            className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Generate Flashcards
          </Link>
        </div>
      </div>
    );
  }

  if (sessionState?.status === 'completed') {
    return (
      <div className="mx-auto max-w-2xl py-4">
        <div className="rounded-xl border border-bg-overlay bg-background-elevated p-6">
          <ReviewStatsView stats={stats} upcomingReviews={queue.totalDue} />
        </div>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={handleBack}
            className="rounded-lg border border-bg-overlay px-4 py-2 text-sm font-medium text-foreground hover:bg-bg-overlay"
          >
            Back to Deck
          </button>
          <button
            onClick={() => {
              buildQueue(documentCards);
              startSession();
            }}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Review Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ReviewSessionView
        currentCard={currentCard}
        sessionState={sessionState ?? { status: 'idle', reviewedCards: 0, totalCards: 0 }}
        progress={progress}
        onRate={rateCard}
        onPause={pauseSession}
        onFinish={handleFinish}
        onResume={resumeSession}
      />
    </div>
  );
}
