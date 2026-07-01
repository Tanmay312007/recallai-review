import { create } from 'zustand';

interface OpenTab {
  id: string;
  title: string;
  type: 'document' | 'note' | 'conversation';
}

type PanelSection = 'ai' | 'notes' | 'related' | null;

interface KnowledgeWorkspaceState {
  /* ── Tabs ──────────────────────────────────── */
  tabs: OpenTab[];
  activeTabId: string | null;
  openTab: (tab: OpenTab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  reorderTabs: (tabs: OpenTab[]) => void;

  /* ── Panels ────────────────────────────────── */
  rightPanelSection: PanelSection;
  setRightPanelSection: (section: PanelSection) => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: (open: boolean) => void;
  toggleRightPanel: () => void;

  /* ── Reader State ──────────────────────────── */
  zoom: number;
  setZoom: (zoom: number) => void;
  showToc: boolean;
  setShowToc: (show: boolean) => void;

  /* ── Collection/Filter ─────────────────────── */
  activeCollection: string | null;
  setActiveCollection: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useKnowledgeWorkspaceStore = create<KnowledgeWorkspaceState>((set) => ({
  tabs: [],
  activeTabId: null,

  openTab: (tab) =>
    set((s) => {
      const exists = s.tabs.find((t) => t.id === tab.id);
      if (exists) return { activeTabId: tab.id };
      return { tabs: [...s.tabs, tab], activeTabId: tab.id };
    }),

  closeTab: (id) =>
    set((s) => {
      const remaining = s.tabs.filter((t) => t.id !== id);
      let nextActive = s.activeTabId;
      if (s.activeTabId === id) {
        const idx = s.tabs.findIndex((t) => t.id === id);
        nextActive = remaining[Math.min(idx, remaining.length - 1)]?.id ?? null;
      }
      return { tabs: remaining, activeTabId: nextActive };
    }),

  setActiveTab: (activeTabId) => set({ activeTabId }),

  reorderTabs: (tabs) => set({ tabs }),

  rightPanelSection: 'ai',
  rightPanelOpen: false,

  setRightPanelSection: (rightPanelSection) =>
    set({ rightPanelSection, rightPanelOpen: true }),

  setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),

  toggleRightPanel: () =>
    set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),

  zoom: 100,
  setZoom: (zoom) => set({ zoom: Math.max(50, Math.min(200, zoom)) }),

  showToc: false,
  setShowToc: (showToc) => set({ showToc }),

  activeCollection: null,
  setActiveCollection: (activeCollection) => set({ activeCollection }),

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
