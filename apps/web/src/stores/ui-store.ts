import { create } from 'zustand';
import type { WorkspaceId } from '@/features/navigation/workspaces';

type SidebarState = 'open' | 'closed' | 'icon-only';

interface UIState {
  /* ── Sidebar ─────────────────────────────────── */
  sidebarState: SidebarState;
  sidebarWorkspace: WorkspaceId | null;
  setSidebarState: (state: SidebarState) => void;
  toggleSidebar: () => void;
  openSidebar: (workspace: WorkspaceId) => void;
  closeSidebar: () => void;

  /* ── Context Panel ───────────────────────────── */
  contextPanelOpen: boolean;
  contextPanelContent: string | null;
  openContextPanel: (content?: string) => void;
  closeContextPanel: () => void;
  toggleContextPanel: () => void;

  /* ── Command Palette ─────────────────────────── */
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;

  /* ── Search ──────────────────────────────────── */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarState: 'open',
  sidebarWorkspace: null,

  setSidebarState: (sidebarState) => set({ sidebarState }),

  toggleSidebar: () =>
    set((s) => ({
      sidebarState: s.sidebarState === 'open' ? 'closed' : 'open',
    })),

  openSidebar: (workspace) =>
    set((s) => ({
      sidebarWorkspace: workspace,
      sidebarState:
        s.sidebarWorkspace === workspace && s.sidebarState === 'open'
          ? 'closed'
          : 'open',
    })),

  closeSidebar: () => set({ sidebarState: 'closed' }),

  contextPanelOpen: false,
  contextPanelContent: null,

  openContextPanel: (content) =>
    set({ contextPanelOpen: true, contextPanelContent: content ?? null }),

  closeContextPanel: () => set({ contextPanelOpen: false }),

  toggleContextPanel: () =>
    set((s) => ({ contextPanelOpen: !s.contextPanelOpen })),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
}));
