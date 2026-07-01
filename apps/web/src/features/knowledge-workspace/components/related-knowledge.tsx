'use client';

import { ScrollArea } from '@/design-system/primitives/scroll-area';
import { cn } from '@/design-system/utils/cn';

interface RelatedItem {
  id: string;
  title: string;
  type: 'document' | 'note' | 'conversation' | 'flashcard';
  snippet?: string;
  relevance: number;
}

interface RelatedKnowledgeProps {
  items?: RelatedItem[];
  className?: string;
}

const SAMPLE_RELATED: RelatedItem[] = [
  { id: 'r1', title: 'Research Methodology Overview', type: 'document', snippet: 'This document covers the methodology used in the study...', relevance: 0.94 },
  { id: 'r2', title: 'Data Analysis Notes', type: 'note', snippet: 'Key findings from the regression analysis...', relevance: 0.87 },
  { id: 'r3', title: 'AI Chat: Statistical Methods', type: 'conversation', snippet: 'Discussion about statistical approaches...', relevance: 0.72 },
  { id: 'r4', title: 'Key Terms Flashcards', type: 'flashcard', snippet: 'Set of 15 flashcards covering methodology terms...', relevance: 0.65 },
];

const TYPE_COLORS: Record<string, string> = {
  document: 'bg-brand',
  note: 'bg-semantic-warning',
  conversation: 'bg-semantic-info',
  flashcard: 'bg-semantic-success',
};

export function RelatedKnowledge({ items = SAMPLE_RELATED, className }: RelatedKnowledgeProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <svg className="h-4 w-4 text-foreground-muted" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4l4 4-4 4M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-caption font-medium text-foreground">Related Knowledge</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-3">
          {items.map((item) => (
            <button
              key={item.id}
              className="w-full rounded-lg border border-border bg-background-surface p-3 text-left hover:bg-background-overlay hover:border-border-hover transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn('h-2 w-2 rounded-full shrink-0', TYPE_COLORS[item.type])} />
                <span className="text-caption font-medium text-foreground truncate flex-1">
                  {item.title}
                </span>
                <span className="text-caption text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  {Math.round(item.relevance * 100)}%
                </span>
              </div>
              {item.snippet && (
                <p className="text-caption text-foreground-muted leading-relaxed line-clamp-2">
                  {item.snippet}
                </p>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
