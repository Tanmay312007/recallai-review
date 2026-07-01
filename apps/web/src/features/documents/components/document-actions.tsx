'use client';

import { useState, useRef, useEffect } from 'react';
import type { SourceDocumentDto } from '@recallai/shared';

interface DocumentActionsProps {
  document: SourceDocumentDto;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onViewMetadata: (doc: SourceDocumentDto) => void;
}

export function DocumentActions({
  document: doc,
  onRename,
  onDelete,
  onViewMetadata,
}: DocumentActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      globalThis.document.addEventListener('mousedown', handleClickOutside);
      globalThis.document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      globalThis.document.removeEventListener('mousedown', handleClickOutside);
      globalThis.document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen((p) => !p);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="rounded p-1 text-foreground-muted hover:bg-bg-overlay hover:text-foreground"
        aria-label={`Actions for ${doc.title}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-bg-overlay bg-background-elevated py-1 shadow-lg"
          role="menu"
        >
          <button
            onClick={() => {
              setOpen(false);
              onRename(doc.id, doc.title);
            }}
            className="flex w-full items-center px-3 py-2 text-left text-sm text-foreground hover:bg-bg-overlay"
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Rename
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onViewMetadata(doc);
            }}
            className="flex w-full items-center px-3 py-2 text-left text-sm text-foreground hover:bg-bg-overlay"
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            View metadata
          </button>

          <hr className="my-1 border-bg-overlay" />

          <button
            onClick={() => {
              setOpen(false);
              onDelete(doc.id);
            }}
            className="flex w-full items-center px-3 py-2 text-left text-sm text-semantic-error hover:bg-bg-overlay"
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
