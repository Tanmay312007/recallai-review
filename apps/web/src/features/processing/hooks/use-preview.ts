'use client';

import { useMemo } from 'react';
import { useProcessingStore } from '../store/processing-store';
import type { NormalizedBlock } from '../types';

interface UsePreviewReturn {
  blocks: NormalizedBlock[];
  firstPageContent: string;
  hasContent: boolean;
}

export function usePreview(documentId: string): UsePreviewReturn {
  const job = useProcessingStore((s) => s.jobs[documentId]);

  return useMemo(() => {
    const doc = job?.normalizedDocument;
    if (!doc) {
      return { blocks: [], firstPageContent: '', hasContent: false };
    }

    const allBlocks = doc.pages.flatMap((p) => p.blocks);
    const firstPageContent =
      doc.pages[0]?.blocks
        .filter((b) => b.type === 'paragraph' || b.type === 'heading')
        .map((b) => b.content)
        .join(' ')
        .slice(0, 500) ?? '';

    return {
      blocks: allBlocks,
      firstPageContent,
      hasContent: allBlocks.length > 0,
    };
  }, [job]);
}
