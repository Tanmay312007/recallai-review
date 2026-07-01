'use client';

import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useUIStore } from '@/stores/ui-store';
import { WORKSPACES } from '../workspaces';
import { useTheme } from '@/design-system/theme';

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { setTheme, resolved } = useTheme();

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="fixed left-1/2 top-[15vh] w-full max-w-xl -translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="rounded-xl border border-border bg-background-elevated shadow-overlay overflow-hidden">
          <div className="flex items-center border-b border-border px-4">
            <svg
              className="mr-3 h-4 w-4 shrink-0 text-foreground-muted"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <Command.Input
              placeholder="Search or jump to..."
              className="flex h-12 w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted outline-none"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border bg-background-surface px-1.5 py-0.5 text-caption text-foreground-muted">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-foreground-muted">
              No results found.
            </Command.Empty>

            <Command.Group heading="Workspaces">
              {WORKSPACES.map((w) => {
                const Icon = w.icon;
                return (
                  <Command.Item
                    key={w.id}
                    value={w.label}
                    onSelect={() => {
                      router.push(w.href);
                      setCommandPaletteOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground data-[selected]:bg-background-overlay transition-colors"
                  >
                    <Icon className="h-4 w-4 text-foreground-muted" />
                    <span>{w.label}</span>
                    <span className="ml-auto text-caption text-foreground-muted">
                      ⌘{w.shortcut}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Group heading="Appearance">
              <Command.Item
                value="Toggle theme"
                onSelect={() => {
                  setTheme(resolved === 'dark' ? 'light' : 'dark');
                  setCommandPaletteOpen(false);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground data-[selected]:bg-background-overlay transition-colors"
              >
                <svg className="h-4 w-4 text-foreground-muted" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 0v2M8 14v2M0 8h2M14 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Toggle theme</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions">
              <Command.Item
                value="Upload document"
                onSelect={() => {
                  router.push('/upload');
                  setCommandPaletteOpen(false);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground data-[selected]:bg-background-overlay transition-colors"
              >
                <svg className="h-4 w-4 text-foreground-muted" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 10V3M5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>Upload document</span>
              </Command.Item>
              <Command.Item
                value="Create deck"
                onSelect={() => {
                  router.push('/decks');
                  setCommandPaletteOpen(false);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground data-[selected]:bg-background-overlay transition-colors"
              >
                <svg className="h-4 w-4 text-foreground-muted" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Create deck</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
