'use client';

import { useEffect } from 'react';

type Modifier = 'ctrl' | 'meta' | 'shift' | 'alt';

interface Shortcut {
  key: string;
  modifiers?: Modifier[];
  handler: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
  enabled?: boolean;
}

function modifierMatch(e: KeyboardEvent, modifiers: Modifier[] = []): boolean {
  const pressed = {
    ctrl: e.ctrlKey,
    meta: e.metaKey,
    shift: e.shiftKey,
    alt: e.altKey,
  };
  return modifiers.every((m) => pressed[m]) && !modifiers.length === !(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey);
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;
        if (e.key.toLowerCase() !== shortcut.key.toLowerCase()) continue;
        if (!modifierMatch(e, shortcut.modifiers)) continue;
        if (shortcut.preventDefault) e.preventDefault();
        shortcut.handler(e);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
