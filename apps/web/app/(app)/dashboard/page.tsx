'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useDocumentStore } from '@/features/documents/store/document-store';
import { useFlashcardStore } from '@/features/flashcards/store/flashcard-store';
import { useReviewStore } from '@/features/review/store/review-store';
import { ReviewStatsView } from '@/features/review/components/review-stats';

export default function DashboardPage() {
  const documents = useDocumentStore((s) => s.documents);
  const docsLoading = useDocumentStore((s) => s.loading);
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments);

  const cards = useFlashcardStore((s) => s.cards);
  const stats = useReviewStore((s) => s.stats);
  const queue = useReviewStore((s) => s.queue);

  useEffect(() => {
    if (documents.length === 0 && !docsLoading) {
      fetchDocuments();
    }
  }, [documents.length, docsLoading, fetchDocuments]);

  const decks = useMemo(() => {
    const cardCounts = new Map<string, number>();
    for (const c of cards) {
      cardCounts.set(c.documentId, (cardCounts.get(c.documentId) ?? 0) + 1);
    }
    return documents
      .filter((d) => (cardCounts.get(d.id) ?? 0) > 0)
      .map((d) => ({
        id: d.id,
        title: d.title,
        cardCount: cardCounts.get(d.id) ?? 0,
      }))
      .sort((a, b) => b.cardCount - a.cardCount)
      .slice(0, 6);
  }, [documents, cards]);

  const totalCards = cards.length;
  const cardsDueToday = queue.totalDue;

  if (docsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-bg-overlay" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-bg-overlay" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          {decks.length} deck{decks.length !== 1 ? 's' : ''} &middot; {totalCards} card{totalCards !== 1 ? 's' : ''} &middot; {cardsDueToday} due today
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Cards"
          value={String(totalCards)}
          href="/decks"
        />
        <StatCard
          label="Due Today"
          value={String(cardsDueToday)}
          href={cardsDueToday > 0 && decks.length > 0 ? `/decks/${decks[0]?.id}/review` : '/decks'}
          accent={cardsDueToday > 0}
        />
        <StatCard
          label="Decks"
          value={String(decks.length)}
          href="/decks"
        />
      </div>

      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
        <ReviewStatsView stats={stats} upcomingReviews={cardsDueToday} />
      </div>

      {decks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Your Decks</h2>
            <Link href="/decks" className="text-xs text-foreground-muted hover:text-foreground">
              View all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                className="rounded-lg border border-bg-overlay bg-background-elevated p-4 transition-colors hover:border-brand/50"
              >
                <h3 className="font-medium text-foreground truncate">{deck.title}</h3>
                <p className="mt-1 text-xs text-foreground-muted">
                  {deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/documents"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Upload Document
        </Link>
        <Link
          href="/decks"
          className="rounded-lg border border-bg-overlay px-4 py-2 text-sm font-medium text-foreground hover:bg-bg-overlay"
        >
          Browse Decks
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg border bg-background-elevated p-4 transition-colors hover:border-brand/50 ${
        accent ? 'border-brand/30' : 'border-bg-overlay'
      }`}
    >
      <p className={`text-2xl font-bold ${accent ? 'text-brand' : 'text-foreground'}`}>
        {value}
      </p>
      <p className="text-xs text-foreground-muted">{label}</p>
    </Link>
  );
}
