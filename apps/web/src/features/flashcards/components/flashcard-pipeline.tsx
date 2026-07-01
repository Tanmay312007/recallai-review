'use client';

import { useCallback } from 'react';
import type { KnowledgeChunk } from '@recallai/shared';
import { useFlashcards } from '../hooks/use-flashcards';
import { FlashcardList } from './flashcard-list';

interface FlashcardPipelineProps {
  documentId: string;
  chunks: KnowledgeChunk[];
  knowledgeReady: boolean;
}

export function FlashcardPipeline({
  documentId,
  chunks,
  knowledgeReady,
}: FlashcardPipelineProps) {
  const {
    filteredCards,
    filters,
    loading,
    error,
    pipelineErrors,
    generateCards,
    updateCard,
    deleteCard,
    setSearch,
    setCardTypeFilter,
    setDifficultyFilter,
    setValidationFilter,
    totalCards,
  } = useFlashcards(documentId);

  const hasCards = totalCards > 0;
  const needsGeneration = knowledgeReady && chunks.length > 0 && !hasCards && !loading;

  const handleGenerate = useCallback(() => {
    generateCards(chunks, documentId);
  }, [chunks, documentId, generateCards]);

  if (!knowledgeReady) {
    return (
      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
        <h3 className="text-sm font-semibold text-foreground">Flashcard Generation</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          Knowledge chunking must complete before flashcard generation can begin.
        </p>
      </div>
    );
  }

  if (chunks.length === 0) {
    return (
      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
        <h3 className="text-sm font-semibold text-foreground">Flashcard Generation</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          No knowledge chunks available. Generate chunks first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Flashcard Generation
          </h3>
          {hasCards && (
            <p className="mt-1 text-xs text-foreground-muted">
              {totalCards} cards generated
            </p>
          )}
        </div>
        {needsGeneration && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate flashcards'}
          </button>
        )}
        {hasCards && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-lg border border-bg-overlay px-4 py-2 text-sm font-medium text-foreground hover:bg-bg-overlay disabled:opacity-50"
          >
            Regenerate
          </button>
        )}
      </div>

      {loading && (
        <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-48 rounded bg-bg-overlay" />
            <div className="h-20 w-full rounded bg-bg-overlay" />
            <div className="h-20 w-full rounded bg-bg-overlay" />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-semantic-error bg-background-surface px-4 py-3">
          <p className="text-sm text-semantic-error">{error}</p>
        </div>
      )}

      {pipelineErrors.length > 0 && (
        <div className="rounded-lg border border-semantic-warning/30 bg-background-surface px-4 py-3">
          <p className="text-xs font-medium text-semantic-warning">Pipeline warnings</p>
          <ul className="mt-1 list-inside list-disc text-xs text-foreground-muted">
            {pipelineErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {hasCards && !loading && (
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
