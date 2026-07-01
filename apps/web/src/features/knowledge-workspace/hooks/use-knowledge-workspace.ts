'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useKnowledgeWorkspaceStore } from '../store/knowledge-workspace-store';

export function useKnowledgeWorkspace() {
  const router = useRouter();
  const store = useKnowledgeWorkspaceStore();

  const openDocument = useCallback(
    (id: string, title: string) => {
      store.openTab({ id, title, type: 'document' });
      router.push(`/knowledge/${id}`, { scroll: false });
    },
    [store, router],
  );

  const closeCurrentDocument = useCallback(() => {
    if (store.activeTabId) {
      store.closeTab(store.activeTabId);
    }
  }, [store]);

  return {
    ...store,
    openDocument,
    closeCurrentDocument,
  };
}
