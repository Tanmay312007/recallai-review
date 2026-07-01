'use client';

import { useState, useEffect, useRef } from 'react';
import type { SourceDocumentDto } from '@lumora/shared';

interface RenameDialogProps {
  document: SourceDocumentDto;
  onConfirm: (id: string, title: string) => void;
  onCancel: () => void;
}

export function RenameDialog({
  document,
  onConfirm,
  onCancel,
}: RenameDialogProps) {
  const [title, setTitle] = useState(document.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
    >
      <div
        className="mx-4 w-full max-w-md rounded-xl bg-background-elevated p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Rename document"
      >
        <h2 className="text-lg font-semibold text-foreground">
          Rename document
        </h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Enter a new name for &ldquo;{document.title}&rdquo;
        </p>

        <label htmlFor="rename-input" className="sr-only">
          New document name
        </label>
        <input
          ref={inputRef}
          id="rename-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && title.trim()) {
              onConfirm(document.id, title.trim());
            }
          }}
          className="mt-4 w-full rounded-lg border border-bg-overlay bg-background-surface px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-brand"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-bg-overlay px-4 py-2 text-sm font-medium text-foreground hover:bg-bg-overlay"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(document.id, title.trim())}
            disabled={!title.trim()}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
}
