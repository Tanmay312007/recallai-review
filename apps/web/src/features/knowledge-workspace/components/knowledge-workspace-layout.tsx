'use client';

import { useKnowledgeWorkspaceStore } from '../store/knowledge-workspace-store';
import { WorkspaceHeader } from './workspace-header';
import { DocumentTabs } from './document-tabs';
import { DocumentReader } from './document-reader';
import { AIPanel } from './ai-panel';
import { NotesSection } from './notes-section';
import { RelatedKnowledge } from './related-knowledge';
import { cn } from '@/design-system/utils/cn';

interface KnowledgeWorkspaceLayoutProps {
  children?: React.ReactNode;
  activeDocument?: {
    id: string;
    title: string;
    content?: string;
  } | null;
}

export function KnowledgeWorkspaceLayout({
  children,
  activeDocument,
}: KnowledgeWorkspaceLayoutProps) {
  const { rightPanelOpen, rightPanelSection, setRightPanelSection } =
    useKnowledgeWorkspaceStore();

  return (
    <div className="flex h-full flex-col bg-background">
      <WorkspaceHeader />
      <DocumentTabs />

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          {activeDocument ? (
            <DocumentReader title={activeDocument.title} content={activeDocument.content} />
          ) : children ? (
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-background-overlay">
                  <svg className="h-7 w-7 text-foreground-muted" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 4h16v16H4V4z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 8h8M8 12h6M8 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="text-title text-foreground mb-1">No document open</h2>
                <p className="text-sm text-foreground-muted">
                  Select a document from the list or use Ctrl+K to search your knowledge.
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setRightPanelSection(rightPanelOpen ? null : 'ai')}
          className={cn(
            'flex w-6 shrink-0 items-center justify-center border-l border-border bg-background-surface transition-colors',
            rightPanelOpen ? 'hover:bg-background-overlay' : 'hover:bg-background-overlay',
          )}
          aria-label={rightPanelOpen ? 'Close panel' : 'Open AI panel'}
        >
          <svg
            className={cn('h-4 w-4 text-foreground-muted transition-transform', rightPanelOpen && 'rotate-180')}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <aside
          className={cn(
            'flex flex-col border-l border-border bg-background-surface transition-all duration-fast overflow-hidden',
            rightPanelOpen ? 'w-80 min-w-0' : 'w-0 min-w-0',
          )}
        >
          <div className="flex border-b border-border">
            {(['ai', 'notes', 'related'] as const).map((section) => (
              <button
                key={section}
                onClick={() => setRightPanelSection(rightPanelSection === section ? null : section)}
                className={cn(
                  'flex-1 px-3 py-2 text-caption font-medium transition-colors border-b-2',
                  rightPanelSection === section
                    ? 'text-foreground border-brand'
                    : 'text-foreground-muted border-transparent hover:text-foreground',
                )}
              >
                {section === 'ai' && 'AI'}
                {section === 'notes' && 'Notes'}
                {section === 'related' && 'Related'}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0">
            {rightPanelSection === 'ai' && <AIPanel />}
            {rightPanelSection === 'notes' && <NotesSection />}
            {rightPanelSection === 'related' && <RelatedKnowledge />}
          </div>
        </aside>
      </div>
    </div>
  );
}
