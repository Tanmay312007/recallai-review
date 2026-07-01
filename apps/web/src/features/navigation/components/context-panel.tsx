'use client';

import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/design-system/utils/cn';
import { ScrollArea } from '@/design-system/primitives/scroll-area';
import { Divider } from '@/design-system/primitives/divider';

export function ContextPanel() {
  const { contextPanelOpen, contextPanelContent, closeContextPanel } = useUIStore();

  return (
    <aside
      className={cn(
        'flex flex-col border-l border-border bg-background-surface transition-all duration-fast overflow-hidden',
        contextPanelOpen ? 'w-72 min-w-0' : 'w-0 min-w-0',
      )}
      aria-hidden={!contextPanelOpen}
    >
      {contextPanelOpen && (
        <>
          <div className="flex h-12 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-semibold text-foreground">
              {contextPanelContent ?? 'Properties'}
            </span>
            <button
              onClick={closeContextPanel}
              className="flex h-6 w-6 items-center justify-center rounded text-foreground-muted hover:text-foreground hover:bg-background-overlay transition-colors"
              aria-label="Close panel"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <ScrollArea className="flex-1 p-4">
            {contextPanelContent ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-section text-foreground-muted mb-2">Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Created</span>
                      <span className="text-foreground">—</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Modified</span>
                      <span className="text-foreground">—</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Status</span>
                      <span className="text-foreground">—</span>
                    </div>
                  </div>
                </div>
                <Divider />
                <div>
                  <h4 className="text-section text-foreground-muted mb-2">AI Assistant</h4>
                  <p className="text-sm text-foreground-muted">
                    Select a document or card to see AI insights.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-foreground-muted text-center">
                  Select an item to view its properties and AI insights.
                </p>
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </aside>
  );
}
