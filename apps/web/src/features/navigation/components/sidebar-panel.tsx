'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUIStore } from '@/stores/ui-store';
import { getWorkspaceById, type WorkspaceId } from '../workspaces';
import { cn } from '@/design-system/utils/cn';
import { ScrollArea } from '@/design-system/primitives/scroll-area';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const WORKSPACE_NAV: Record<WorkspaceId, { title: string; items: NavItem[] }> = {
  home: {
    title: 'Home',
    items: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'Recent', href: '/dashboard?tab=recent' },
      { label: 'Quick Actions', href: '/dashboard?tab=actions' },
    ],
  },
  collections: {
    title: 'Collections',
    items: [
      { label: 'Documents', href: '/documents' },
      { label: 'Decks', href: '/decks' },
      { label: 'Upload', href: '/upload' },
    ],
  },
  knowledge: {
    title: 'Knowledge',
    items: [
      { label: 'Chat', href: '/knowledge' },
      { label: 'Q&A', href: '/knowledge?tab=qa' },
      { label: 'Browse', href: '/knowledge?tab=browse' },
    ],
  },
  review: {
    title: 'Review',
    items: [
      { label: 'Due Cards', href: '/decks' },
      { label: 'All Decks', href: '/decks' },
      { label: 'History', href: '/decks?tab=history' },
    ],
  },
  insights: {
    title: 'Insights',
    items: [
      { label: 'Overview', href: '/analytics' },
      { label: 'Activity', href: '/analytics?tab=activity' },
      { label: 'Trends', href: '/analytics?tab=trends' },
    ],
  },
  settings: {
    title: 'Settings',
    items: [
      { label: 'General', href: '/settings' },
      { label: 'Billing', href: '/billing' },
    ],
  },
};

export function SidebarPanel() {
  const pathname = usePathname();
  const { sidebarState, sidebarWorkspace, closeSidebar } = useUIStore();

  const isOpen = sidebarState === 'open';
  const workspace = sidebarWorkspace ? getWorkspaceById(sidebarWorkspace) : null;
  const nav = sidebarWorkspace ? WORKSPACE_NAV[sidebarWorkspace] : null;

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-background-surface transition-all duration-fast overflow-hidden',
        isOpen ? 'w-56 min-w-0' : 'w-0 min-w-0',
      )}
      aria-hidden={!isOpen}
    >
      {workspace && nav && isOpen && (
        <>
          <div className="flex h-12 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-semibold text-foreground">{nav.title}</span>
            <button
              onClick={closeSidebar}
              className="flex h-6 w-6 items-center justify-center rounded text-foreground-muted hover:text-foreground hover:bg-background-overlay transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <ScrollArea className="flex-1 px-2 py-3">
            <nav className="flex flex-col gap-0.5">
              {nav.items.map((item) => {
                const baseHref = item.href.split('?')[0] ?? item.href;
                const active = pathname === item.href || pathname.startsWith(baseHref);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-fast',
                      active
                        ? 'bg-background-overlay text-foreground font-medium'
                        : 'text-foreground-muted hover:text-foreground hover:bg-background-overlay',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </>
      )}
    </aside>
  );
}
