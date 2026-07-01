'use client';

import { useState } from 'react';
import { cn } from '@/design-system/utils/cn';

interface Note {
  id: string;
  text: string;
  created: string;
  pinned?: boolean;
}

interface NotesSectionProps {
  notes?: Note[];
  className?: string;
}

const SAMPLE_NOTES: Note[] = [
  { id: '1', text: 'Key insight from the methodology section about sample selection.', created: '2h ago' },
  { id: '2', text: 'Follow up on the data normalization approach — compare with alternative methods.', created: '1d ago', pinned: true },
];

export function NotesSection({ notes = SAMPLE_NOTES, className }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');

  return (
    <div className={cn('border-t border-border bg-background-surface', className)}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <svg className="h-4 w-4 text-foreground-muted" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 2h8v12l-4-2-4 2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <span className="text-caption font-medium text-foreground">Notes</span>
        <span className="text-caption text-foreground-muted">{notes.length}</span>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background-surface px-3 py-1.5 focus-within:border-border-hover transition-colors">
          <input
            type="text"
            placeholder="Add a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-caption text-foreground placeholder:text-foreground-muted outline-none"
          />
          <button
            disabled={!newNote.trim()}
            className="text-caption text-brand hover:text-brand-hover disabled:opacity-30 font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <div className="space-y-1 px-4 pb-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="group rounded-md px-3 py-2 text-caption text-foreground-secondary hover:bg-background-overlay transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="flex-1 leading-relaxed">{note.text}</p>
              {note.pinned && (
                <svg className="h-3 w-3 shrink-0 text-foreground-muted mt-0.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M6 1l1.5 3 3 .5-2 2.5.5 3.5L6 9l-3 1.5.5-3.5-2-2.5 3-.5L6 1z" fill="currentColor" />
                </svg>
              )}
            </div>
            <p className="text-caption text-foreground-muted mt-0.5">{note.created}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
