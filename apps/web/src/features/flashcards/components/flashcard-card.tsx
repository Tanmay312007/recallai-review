'use client';

import { useState } from 'react';
import type { Flashcard } from '../types';
import { FLASHCARD_CARD_TYPE_LABELS, DIFFICULTY_LABELS } from '../types';
import { FlashcardEditor } from './flashcard-editor';

interface FlashcardCardProps {
  card: Flashcard;
  onUpdate: (cardId: string, updates: Partial<Flashcard>) => void;
  onDelete: (cardId: string) => void;
}

export function FlashcardCard({ card, onUpdate, onDelete }: FlashcardCardProps) {
  const [editing, setEditing] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  if (editing) {
    return (
      <FlashcardEditor
        card={card}
        onSave={(updates) => {
          onUpdate(card.id, updates);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const isValid = card.metadata.validationStatus === 'passed';

  return (
    <div
      className={`rounded-lg border bg-background-elevated p-4 transition-colors ${
        !isValid ? 'border-semantic-warning/50' : 'border-bg-overlay'
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
          {FLASHCARD_CARD_TYPE_LABELS[card.cardType]}
        </span>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          card.difficulty === 'easy'
            ? 'bg-semantic-success/10 text-semantic-success'
            : card.difficulty === 'hard'
              ? 'bg-semantic-error/10 text-semantic-error'
              : 'bg-semantic-warning/10 text-semantic-warning'
        }`}>
          {DIFFICULTY_LABELS[card.difficulty]}
        </span>
        {!isValid && (
          <span className="inline-flex items-center rounded-full bg-semantic-warning/10 px-2 py-0.5 text-xs font-medium text-semantic-warning">
            Needs review
          </span>
        )}
        <span className="ml-auto text-xs text-foreground-muted">
          {Math.round(card.confidence * 100)}% confidence
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-foreground-muted">Question</p>
          <p className="mt-1 text-sm text-foreground">{card.question}</p>
        </div>

        {showAnswer && (
          <div>
            <p className="text-xs font-medium text-foreground-muted">Answer</p>
            <p className="mt-1 text-sm text-foreground-secondary whitespace-pre-wrap">
              {card.answer}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => setShowAnswer((s) => !s)}
          className="rounded border border-bg-overlay px-3 py-1 text-xs font-medium text-foreground hover:bg-bg-overlay"
        >
          {showAnswer ? 'Hide answer' : 'Show answer'}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="rounded border border-bg-overlay px-3 py-1 text-xs font-medium text-foreground hover:bg-bg-overlay"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(card.id)}
          className="rounded border border-semantic-error/30 px-3 py-1 text-xs font-medium text-semantic-error hover:bg-semantic-error/10"
        >
          Delete
        </button>
      </div>

      {card.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded bg-bg-overlay px-1.5 py-0.5 text-[10px] text-foreground-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {card.metadata.validationErrors.length > 0 && (
        <div className="mt-2 rounded bg-semantic-error/5 p-2">
          <p className="text-xs text-semantic-error">
            {card.metadata.validationErrors.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
