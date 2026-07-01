import { create } from 'zustand';
import type { KnowledgeChunk, KnowledgeDocument } from '@recallai/shared';

interface KnowledgeState {
  knowledge: Record<string, KnowledgeDocument>;
  selectedChunkId: string | null;
  loading: boolean;
  error: string | null;
  setKnowledge: (documentId: string, doc: KnowledgeDocument) => void;
  selectChunk: (chunkId: string | null) => void;
  clear: (documentId: string) => void;
  clearAll: () => void;
  getChunksForDocument: (documentId: string) => KnowledgeChunk[];
  getChunk: (chunkId: string) => KnowledgeChunk | undefined;
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  knowledge: {},
  selectedChunkId: null,
  loading: false,
  error: null,

  setKnowledge: (documentId, doc) => {
    set((state) => ({
      knowledge: { ...state.knowledge, [documentId]: doc },
      loading: false,
      error: null,
    }));
  },

  selectChunk: (chunkId) => {
    set({ selectedChunkId: chunkId });
  },

  clear: (documentId) => {
    set((state) => {
      const next = { ...state.knowledge };
      delete next[documentId];
      return { knowledge: next };
    });
  },

  clearAll: () => {
    set({ knowledge: {}, selectedChunkId: null });
  },

  getChunksForDocument: (documentId) => {
    const doc = get().knowledge[documentId];
    return doc?.chunks ?? [];
  },

  getChunk: (chunkId) => {
    const all = get().knowledge;
    for (const doc of Object.values(all)) {
      const found = doc.chunks.find((c) => c.id === chunkId);
      if (found) return found;
    }
    return undefined;
  },
}));
