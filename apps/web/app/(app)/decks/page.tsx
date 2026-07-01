'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useDocumentStore } from '@/features/documents/store/document-store';
import { useFlashcardStore } from '@/features/flashcards/store/flashcard-store';

export default function DecksPage() {
  const documents = useDocumentStore((s) => s.documents);
  const docsLoading = useDocumentStore((s) => s.loading);
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments);

  const cards = useFlashcardStore((s) => s.cards);

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
        originalName: d.originalName,
        cardCount: cardCounts.get(d.id) ?? 0,
        createdAt: d.createdAt,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [documents, cards]);

  if (docsLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Decks</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-bg-overlay" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Decks</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          {decks.length} deck{decks.length !== 1 ? 's' : ''} with flashcards
        </p>
      </div>

      {decks.length === 0 ? (
        <div className="rounded-lg border border-bg-overlay bg-background-elevated p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground">No decks yet</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Upload and process a document, then generate flashcards to create your first deck.
          </p>
          <Link
            href="/documents"
            className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Go to Documents
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/decks/${deck.id}`}
              className="group rounded-lg border border-bg-overlay bg-background-elevated p-5 transition-colors hover:border-brand/50"
            >
              <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
                {deck.title}
              </h3>
              {deck.originalName && deck.originalName !== deck.title && (
                <p className="mt-1 text-xs text-foreground-muted truncate">
                  {deck.originalName}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-xs text-foreground-muted">
                <span>{deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
