'use client';

import { useDesktop } from '../hooks/use-desktop';

export function TitleBar() {
  const { isDesktop } = useDesktop();

  if (!isDesktop) return null;

  return (
    <div
      data-tauri-drag-region
      className="flex h-10 items-center justify-between border-b border-bg-overlay bg-bg-surface px-3 select-none"
    >
      <span className="text-xs font-semibold text-foreground-muted">Lumora</span>
      <WindowControls />
    </div>
  );
}

function WindowControls() {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => {
          import('@tauri-apps/api/window').then(({ getCurrentWindow }) =>
            getCurrentWindow().minimize(),
          );
        }}
        className="flex h-6 w-6 items-center justify-center rounded text-foreground-muted hover:bg-bg-overlay"
        aria-label="Minimize"
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <rect x="1" y="4.5" width="8" height="1" fill="currentColor" />
        </svg>
      </button>
      <button
        onClick={() => {
          import('@tauri-apps/api/window').then(({ getCurrentWindow }) =>
            getCurrentWindow().toggleMaximize(),
          );
        }}
        className="flex h-6 w-6 items-center justify-center rounded text-foreground-muted hover:bg-bg-overlay"
        aria-label="Maximize"
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <rect x="1.5" y="1.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
      <button
        onClick={() => {
          import('@tauri-apps/api/window').then(({ getCurrentWindow }) =>
            getCurrentWindow().close(),
          );
        }}
        className="flex h-6 w-6 items-center justify-center rounded text-foreground-muted hover:bg-destructive hover:text-white"
        aria-label="Close"
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" strokeWidth="1.2" />
          <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
    </div>
  );
}
