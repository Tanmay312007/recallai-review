'use client';

import { ActivityBar } from './activity-bar';
import { SidebarPanel } from './sidebar-panel';
import { ContextPanel } from './context-panel';

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1">
      <ActivityBar />
      <SidebarPanel />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          {children}
        </div>
      </main>
      <ContextPanel />
    </div>
  );
}
