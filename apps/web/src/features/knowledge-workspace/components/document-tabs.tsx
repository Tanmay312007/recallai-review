'use client';

import { useRouter } from 'next/navigation';
import { useKnowledgeWorkspaceStore } from '../store/knowledge-workspace-store';
import { cn } from '@/design-system/utils/cn';
import { ScrollArea } from '@/design-system/primitives/scroll-area';

export function DocumentTabs() {
  const router = useRouter();
  const { tabs, activeTabId, setActiveTab, closeTab } =
    useKnowledgeWorkspaceStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex h-9 shrink-0 items-center border-b border-border bg-background-surface">
      <ScrollArea orientation="horizontal" className="flex-1">
        <div className="flex" role="tablist">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'group relative flex shrink-0 cursor-pointer items-center gap-1.5 px-3 text-caption transition-colors duration-fast select-none h-9',
                  isActive
                    ? 'text-foreground bg-background'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-overlay',
                )}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.type === 'document') {
                    router.push(`/knowledge/${tab.id}`, { scroll: false });
                  }
                }}
              >
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    tab.type === 'document' && 'bg-brand',
                    tab.type === 'note' && 'bg-semantic-warning',
                    tab.type === 'conversation' && 'bg-semantic-info',
                  )}
                />
                <span className="max-w-[120px] truncate">{tab.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="ml-1 flex h-4 w-4 items-center justify-center rounded text-foreground-muted opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-background-overlay transition-all"
                  aria-label={`Close ${tab.title}`}
                >
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
