import type { KnowledgeChunk } from '@recallai/shared';

export type AiProvider = 'openai' | 'anthropic' | 'google' | 'custom';

export type FlashcardStyle = 'basic' | 'cloze' | 'definition';

export type SummaryStyle = 'concise' | 'detailed' | 'bullet-points';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface FlashcardCandidate {
  front: string;
  back: string;
  style: FlashcardStyle;
  sourceChunkId: string;
  bloomLevel: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE';
}

export interface SummaryResult {
  content: string;
  style: SummaryStyle;
  wordCount: number;
  sourceChunkIds: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: QuizDifficulty;
  sourceChunkId: string;
}

export interface EmbeddingVector {
  chunkId: string;
  vector: number[];
  model: string;
  dimensions: number;
}

export interface VectorSearchResult {
  chunk: KnowledgeChunk;
  score: number;
}
