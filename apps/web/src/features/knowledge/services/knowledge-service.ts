import type { NormalizedDocument } from '@/features/processing/types';
import type { KnowledgeDocument } from '@lumora/shared';
import { chunkDocument } from './chunking-engine';
import type { ChunkingOptions } from '../types';

export const knowledgeService = {
  process(
    documentId: string,
    normalized: NormalizedDocument,
    options?: ChunkingOptions,
  ): KnowledgeDocument {
    return chunkDocument(documentId, normalized, options);
  },

  getChunksForPage(
    knowledge: KnowledgeDocument,
    pageNumber: number,
  ) {
    return knowledge.chunks.filter((c) => c.metadata.sourcePage === pageNumber);
  },

  searchChunks(
    knowledge: KnowledgeDocument,
    query: string,
  ) {
    const lower = query.toLowerCase();
    return knowledge.chunks.filter(
      (c) =>
        c.content.toLowerCase().includes(lower) ||
        c.metadata.sectionTitle.toLowerCase().includes(lower),
    );
  },
};
