'use client';

import { useState } from 'react';
import type { Flashcard } from '../types';
import { FLASHCARD_CARD_TYPE_LABELS } from '../types';

interface FlashcardEditorProps {
  card: Flashcard;
  onSave: (updates: Partial<Flashcard>) => void;
  onCancel: () => void;
}

export function FlashcardEditor({ card, onSave, onCancel }: FlashcardEditorProps) {
  const [question, setQuestion] = useState(card.question);
  const [answer, setAnswer] = useState(card.answer);
  const [difficulty, setDifficulty] = useState(card.difficulty);

  return (
    <div className="rounded-lg border border-brand bg-background-elevated p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
        Edit Flashcard
      </h4>

      <div className="mt-3 space-y-3">
        <div>
          <label className="text-xs font-medium text-foreground-muted">Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-bg-overlay bg-background-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground-muted">Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-bg-overlay bg-background-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs font-medium text-foreground-muted">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Flashcard['difficulty'])}
              className="ml-2 rounded border border-bg-overlay bg-background-surface px-2 py-1 text-sm text-foreground"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <span className="text-xs text-foreground-muted">
            Type: {FLASHCARD_CARD_TYPE_LABELS[card.cardType]}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onSave({ question, answer, difficulty })}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-bg-overlay px-4 py-2 text-sm font-medium text-foreground hover:bg-bg-overlay"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
