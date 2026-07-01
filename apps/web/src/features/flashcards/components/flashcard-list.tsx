'use client';

import type { Flashcard, FlashcardCardType, FlashcardDifficulty, FlashcardValidationStatus } from '../types';
import { FLASHCARD_CARD_TYPES, FLASHCARD_CARD_TYPE_LABELS } from '../types';
import { FlashcardCard } from './flashcard-card';

interface FlashcardListProps {
  cards: Flashcard[];
  onUpdate: (cardId: string, updates: Partial<Flashcard>) => void;
  onDelete: (cardId: string) => void;
  search: string;
  onSearch: (query: string) => void;
  cardTypeFilter: FlashcardCardType | undefined;
  onCardTypeFilter: (type: FlashcardCardType | undefined) => void;
  difficultyFilter: FlashcardDifficulty | undefined;
  onDifficultyFilter: (difficulty: FlashcardDifficulty | undefined) => void;
  validationFilter: FlashcardValidationStatus | undefined;
  onValidationFilter: (status: FlashcardValidationStatus | undefined) => void;
  totalCards: number;
}

export function FlashcardList({
  cards,
  onUpdate,
  onDelete,
  search,
  onSearch,
  cardTypeFilter,
  onCardTypeFilter,
  difficultyFilter,
  onDifficultyFilter,
  validationFilter,
  onValidationFilter,
  totalCards,
}: FlashcardListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search flashcards..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-lg border border-bg-overlay bg-background-surface px-3 py-2 pl-9 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <FilterSelect
          value={cardTypeFilter ?? ''}
          onChange={(v) => onCardTypeFilter((v || undefined) as FlashcardCardType | undefined)}
          options={[
            { value: '', label: 'All types' },
            ...FLASHCARD_CARD_TYPES.map((t) => ({ value: t, label: FLASHCARD_CARD_TYPE_LABELS[t] })),
          ]}
          label="Card type"
        />

        <FilterSelect
          value={difficultyFilter ?? ''}
          onChange={(v) => onDifficultyFilter((v || undefined) as FlashcardDifficulty | undefined)}
          options={[
            { value: '', label: 'All difficulties' },
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' },
          ]}
          label="Difficulty"
        />

        <FilterSelect
          value={validationFilter ?? ''}
          onChange={(v) => onValidationFilter((v || undefined) as FlashcardValidationStatus | undefined)}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'passed', label: 'Valid' },
            { value: 'failed', label: 'Failed' },
            { value: 'pending', label: 'Pending' },
          ]}
          label="Validation"
        />
      </div>

      <p className="text-xs text-foreground-muted">
        {totalCards} cards, showing {cards.length}
      </p>

      {cards.length === 0 ? (
        <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6 text-center">
          <p className="text-sm text-foreground-muted">
            {totalCards === 0
              ? 'No flashcards generated yet. Process the document to generate flashcards.'
              : 'No flashcards match the current filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <FlashcardCard
              key={card.id}
              card={card}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
  label: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="rounded-lg border border-bg-overlay bg-background-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
