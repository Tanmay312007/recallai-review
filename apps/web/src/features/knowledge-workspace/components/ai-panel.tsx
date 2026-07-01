'use client';

import { useState } from 'react';
import { ScrollArea } from '@/design-system/primitives/scroll-area';
import { Divider } from '@/design-system/primitives/divider';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'summarize',
    label: 'Summarize',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 4h10M3 8h7M3 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7v4M8 5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'questions',
    label: 'Generate Questions',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 12l8-8M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'flashcards',
    label: 'Create Flashcards',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 6h4M6 9h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'compare',
    label: 'Compare',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="3" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="3" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'translate',
    label: 'Translate',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 2v12M12 2v12M2 4h12M2 12h12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 2v12" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export function AIPanel() {
  const [input, setInput] = useState('');

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 items-center border-b border-border px-3">
        <svg className="mr-2 h-4 w-4 text-brand" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 1l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z"
            fill="currentColor"
            opacity="0.4"
          />
          <circle cx="8" cy="8" r="3" fill="currentColor" />
        </svg>
        <span className="text-caption font-medium text-foreground">AI Assistant</span>
      </div>

      <ScrollArea className="flex-1 p-3">
        <p className="text-caption text-foreground-muted mb-3">
          Ask questions about this document or use quick actions below.
        </p>

        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              className="flex items-center gap-1.5 rounded-md border border-border bg-background-surface px-2.5 py-2 text-caption text-foreground-muted hover:text-foreground hover:bg-background-overlay hover:border-border-hover transition-colors text-left"
            >
              <span className="shrink-0 text-foreground-muted">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        <Divider className="my-4" />

        <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-border bg-background-surface">
          <p className="text-caption text-foreground-muted">
            AI responses will appear here.
          </p>
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background-surface px-3 py-2 focus-within:border-border-hover focus-within:ring-1 focus-within:ring-[var(--focus-ring)] transition-colors">
          <input
            type="text"
            placeholder="Ask AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-caption text-foreground placeholder:text-foreground-muted outline-none"
          />
          <button
            disabled={!input.trim()}
            className="flex h-6 w-6 items-center justify-center rounded text-foreground-muted hover:text-foreground disabled:opacity-30 transition-colors"
            aria-label="Send"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8l10-5-5 10-1-4-4-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
