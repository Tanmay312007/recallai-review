'use client';

import { useKnowledgeWorkspaceStore } from '../store/knowledge-workspace-store';
import { cn } from '@/design-system/utils/cn';

interface DocumentReaderProps {
  title: string;
  content?: string;
  children?: React.ReactNode;
}

export function DocumentReader({ title, content, children }: DocumentReaderProps) {
  const { zoom, showToc, setZoom, setShowToc } = useKnowledgeWorkspaceStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-border bg-background-surface px-2">
        <button
          onClick={() => setZoom(Math.max(50, zoom - 10))}
          className="flex h-6 w-6 items-center justify-center rounded text-foreground-muted hover:text-foreground hover:bg-background-overlay transition-colors"
          aria-label="Zoom out"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-caption text-foreground-muted w-8 text-center tabular-nums">{zoom}%</span>
        <button
          onClick={() => setZoom(Math.min(200, zoom + 10))}
          className="flex h-6 w-6 items-center justify-center rounded text-foreground-muted hover:text-foreground hover:bg-background-overlay transition-colors"
          aria-label="Zoom in"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mx-2 h-4 w-px bg-border" />

        <button
          onClick={() => setShowToc(!showToc)}
          className={cn(
            'flex h-6 items-center gap-1 rounded px-1.5 text-caption transition-colors',
            showToc
              ? 'text-foreground bg-background-overlay'
              : 'text-foreground-muted hover:text-foreground hover:bg-background-overlay',
          )}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Contents
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <button className="flex h-6 items-center gap-1 rounded px-1.5 text-caption text-foreground-muted hover:text-foreground hover:bg-background-overlay transition-colors">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Annotate
          </button>
          <button className="flex h-6 items-center gap-1 rounded px-1.5 text-caption text-foreground-muted hover:text-foreground hover:bg-background-overlay transition-colors">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 12l8-8M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Compare
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {showToc && (
          <aside className="w-48 shrink-0 border-r border-border bg-background-surface p-3 overflow-y-auto">
            <h3 className="text-caption font-medium text-foreground-muted mb-2">Contents</h3>
            <nav className="space-y-0.5">
              {['Introduction', 'Background', 'Analysis', 'Results', 'Discussion', 'Conclusion'].map(
                (item) => (
                  <button
                    key={item}
                    className="block w-full rounded px-2 py-1 text-left text-caption text-foreground-muted hover:text-foreground hover:bg-background-overlay transition-colors"
                  >
                    {item}
                  </button>
                ),
              )}
            </nav>
          </aside>
        )}

        <div className="min-w-0 flex-1 overflow-y-auto">
          <div
            className="mx-auto py-8 px-8 transition-all duration-fast"
            style={{ maxWidth: `${Math.max(40, zoom * 0.6)}rem` }}
          >
            {content ? (
              <article className="prose-custom">
                <h1 className="text-h1 text-foreground mb-2">{title}</h1>
                <div className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-wrap">
                  {content}
                </div>
              </article>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
