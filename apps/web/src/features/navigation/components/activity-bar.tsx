'use client';

import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcut';
import { WORKSPACES, getWorkspaceByHref } from '../workspaces';
import { Tooltip } from '@/design-system/primitives/tooltip';

export function ActivityBar() {
  const pathname = usePathname();
  const { sidebarState, sidebarWorkspace, openSidebar, toggleCommandPalette, toggleContextPanel, contextPanelOpen } =
    useUIStore();

  const activeWorkspace = getWorkspaceByHref(pathname);

  useKeyboardShortcuts([
    ...WORKSPACES.map((w) => ({
      key: w.shortcut,
      modifiers: ['meta' as const],
      handler: () => openSidebar(w.id),
      preventDefault: true,
    })),
    {
      key: 'k',
      modifiers: ['meta' as const],
      handler: toggleCommandPalette,
      preventDefault: true,
    },
    {
      key: 'i',
      modifiers: ['meta' as const, 'shift' as const],
      handler: toggleContextPanel,
      preventDefault: true,
    },
  ]);

  return (
    <aside className="flex w-12 shrink-0 flex-col items-center border-r border-border bg-background-surface py-2">
      {WORKSPACES.map((workspace) => {
        const isActive = activeWorkspace?.id === workspace.id;
        const sidebarIsForThis =
          sidebarWorkspace === workspace.id && sidebarState === 'open';
        const Icon = workspace.icon;

        return (
          <Tooltip key={workspace.id} content={workspace.label} side="right">
            <button
              onClick={() => openSidebar(workspace.id)}
              className={`
                relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-fast
                ${sidebarIsForThis
                  ? 'bg-background-overlay text-foreground'
                  : isActive
                    ? 'text-foreground hover:bg-background-overlay'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-overlay'
                }
              `}
              aria-label={workspace.label}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
              )}
              <Icon className="h-5 w-5" />
            </button>
          </Tooltip>
        );
      })}

      <div className="mt-auto flex flex-col items-center gap-1">
        <Tooltip content={contextPanelOpen ? 'Close panel' : 'Context panel'} side="right">
          <button
            onClick={toggleContextPanel}
            className={`
              flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-fast
              ${contextPanelOpen
                ? 'bg-background-overlay text-foreground'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-overlay'
              }
            `}
            aria-label="Toggle context panel"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 3v14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
