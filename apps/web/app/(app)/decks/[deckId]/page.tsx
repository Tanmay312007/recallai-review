'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useFlashcards } from '@/features/flashcards/hooks/use-flashcards';
import { useDocumentStore } from '@/features/documents/store/document-store';
import { FlashcardList } from '@/features/flashcards/components/flashcard-list';
import { exportAsJson, exportAsCsv, exportAsAnki } from '@/features/flashcards/utilities/export';
import { useFlashcardStore } from '@/features/flashcards/store/flashcard-store';

export default function DeckDetailPage({
  params,
}: {
  params: { deckId: string };
}) {
  const documentId = params.deckId;

  const doc = useDocumentStore((s) => s.currentDocument);
  const docLoading = useDocumentStore((s) => s.currentDocumentLoading);
  const fetchDocument = useDocumentStore((s) => s.fetchDocument);

  const {
    filteredCards,
    filters,
    loading,
    error,
    updateCard,
    deleteCard,
    setSearch,
    setCardTypeFilter,
    setDifficultyFilter,
    setValidationFilter,
    totalCards,
  } = useFlashcards(documentId);

  const allCards = useFlashcardStore((s) =>
    s.cards.filter((c) => c.documentId === documentId),
  );

  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    fetchDocument(documentId);
  }, [documentId, fetchDocument]);

  const handleExport = useCallback(
    (format: 'json' | 'csv' | 'anki') => {
      setShowExport(false);
      const filename = (doc?.title ?? 'deck').replace(/[^a-zA-Z0-9_-]/g, '_');
      if (format === 'json') exportAsJson(allCards, filename);
      else if (format === 'csv') exportAsCsv(allCards, filename);
      else exportAsAnki(allCards, filename);
    },
    [allCards, doc],
  );

  if (docLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-bg-overlay" />
        <div className="h-64 animate-pulse rounded-lg bg-bg-overlay" />
      </div>
    );
  }

  const title = doc?.title ?? 'Deck';

  return (
    <div className="space-y-6">
      <Link
        href="/decks"
        className="inline-flex items-center text-sm text-foreground-muted hover:text-foreground"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to decks
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {totalCards} card{totalCards !== 1 ? 's' : ''}
          </p>
        </div>
        {totalCards > 0 && (
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowExport((s) => !s)}
                className="rounded-lg border border-bg-overlay px-4 py-2.5 text-sm font-medium text-foreground hover:bg-bg-overlay"
              >
                Export
              </button>
              {showExport && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-bg-overlay bg-background-elevated shadow-lg">
                    <button onClick={() => handleExport('json')} className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-bg-overlay first:rounded-t-lg">
                      JSON
                    </button>
                    <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-bg-overlay">
                      CSV
                    </button>
                    <button onClick={() => handleExport('anki')} className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-bg-overlay last:rounded-b-lg">
                      Anki CSV
                    </button>
                  </div>
                </>
              )}
            </div>
            <Link
              href={`/decks/${documentId}/review`}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
            >
              Start Review
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-semantic-error bg-background-surface px-4 py-3">
          <p className="text-sm text-semantic-error">{error}</p>
        </div>
      )}

      {!loading && totalCards === 0 ? (
        <div className="rounded-lg border border-bg-overlay bg-background-elevated p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground">No cards in this deck</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Go to the document page to generate flashcards, then come back to review.
          </p>
          <Link
            href={`/documents/${documentId}`}
            className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            View Document
          </Link>
        </div>
      ) : (
        <FlashcardList
          cards={filteredCards}
          onUpdate={updateCard}
          onDelete={deleteCard}
          search={filters.search ?? ''}
          onSearch={setSearch}
          cardTypeFilter={filters.cardType}
          onCardTypeFilter={setCardTypeFilter}
          difficultyFilter={filters.difficulty}
          onDifficultyFilter={setDifficultyFilter}
          validationFilter={filters.validationStatus}
          onValidationFilter={setValidationFilter}
          totalCards={totalCards}
        />
      )}
    </div>
  );
}
