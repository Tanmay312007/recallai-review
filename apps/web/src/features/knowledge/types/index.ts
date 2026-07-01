import type {
  ChunkMetadata,
  HeadingLevel,
  KnowledgeChunk,
  KnowledgeDocument,
  KnowledgeParagraph,
  KnowledgeSection,
} from '@recallai/shared';

export type {
  ChunkMetadata,
  HeadingLevel,
  KnowledgeChunk,
  KnowledgeDocument,
  KnowledgeParagraph,
  KnowledgeSection,
};

export interface ChunkingOptions {
  minChunkWords?: number;
  maxChunkWords?: number;
  respectHeadings?: boolean;
  respectParagraphs?: boolean;
}

export const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  minChunkWords: 50,
  maxChunkWords: 500,
  respectHeadings: true,
  respectParagraphs: true,
};

export const ESTIMATED_TOKENS_PER_WORD = 1.35;

export function estimateTokens(wordCount: number): number {
  return Math.ceil(wordCount * ESTIMATED_TOKENS_PER_WORD);
}

export function estimateReadingTimeSeconds(wordCount: number): number {
  const WORDS_PER_MINUTE = 238;
  return Math.ceil((wordCount / WORDS_PER_MINUTE) * 60);
}
