'use client';

import { useKnowledgeWorkspaceStore } from '../store/knowledge-workspace-store';

export function WorkspaceHeader() {
  const { searchQuery, setSearchQuery, activeCollection, setActiveCollection } =
    useKnowledgeWorkspaceStore();

  return (
    <header className="flex h-12 items-center gap-3 border-b border-border bg-background-surface px-4">
      <h1 className="text-title text-foreground font-semibold shrink-0">Knowledge</h1>

      <div className="flex h-7 items-center rounded-md border border-border bg-background-surface px-2 text-caption text-foreground-muted">
        <svg className="mr-1.5 h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <select
          value={activeCollection ?? ''}
          onChange={(e) => setActiveCollection(e.target.value || null)}
          className="bg-transparent border-none outline-none text-caption text-foreground-muted cursor-pointer"
          aria-label="Filter by collection"
        >
          <option value="">All knowledge</option>
          <option value="documents">Documents</option>
          <option value="notes">Notes</option>
          <option value="conversations">AI Conversations</option>
          <option value="flashcards">Flashcards</option>
        </select>
      </div>

      <div className="relative flex-1 max-w-md">
        <svg
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search knowledge..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-7 w-full rounded-md border border-border bg-background-surface pl-8 pr-3 text-caption text-foreground placeholder:text-foreground-muted outline-none focus:border-border-hover focus:ring-1 focus:ring-[var(--focus-ring)] transition-colors"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button className="flex h-7 items-center gap-1 rounded-md bg-brand px-2.5 text-caption font-medium text-white hover:bg-brand-hover transition-colors">
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New
        </button>
      </div>
    </header>
  );
}
