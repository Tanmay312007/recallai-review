import type {
  FlashcardCandidate,
  SummaryResult,
  QuizQuestion,
  EmbeddingVector,
  VectorSearchResult,
  FlashcardStyle,
  SummaryStyle,
  QuizDifficulty,
} from '../types';
import type { KnowledgeChunk } from '@recallai/shared';

export interface FlashcardGenerator {
  generate(
    chunks: KnowledgeChunk[],
    options?: { style?: FlashcardStyle; count?: number },
  ): Promise<FlashcardCandidate[]>;
}

export interface SummaryGenerator {
  summarize(
    chunks: KnowledgeChunk[],
    options?: { style?: SummaryStyle; maxWords?: number },
  ): Promise<SummaryResult>;
}

export interface QuizGenerator {
  generate(
    chunks: KnowledgeChunk[],
    options?: { difficulty?: QuizDifficulty; count?: number },
  ): Promise<QuizQuestion[]>;
}

export interface EmbeddingProvider {
  embed(chunks: KnowledgeChunk[]): Promise<EmbeddingVector[]>;
  embedText(text: string): Promise<number[]>;
  readonly model: string;
  readonly dimensions: number;
}

export interface VectorStore {
  store(vectors: EmbeddingVector[]): Promise<void>;
  search(vector: number[], topK?: number): Promise<VectorSearchResult[]>;
  delete(chunkIds: string[]): Promise<void>;
  clear(documentId: string): Promise<void>;
}

export interface LLMProvider {
  generate(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<string>;
  generateStream(
    prompt: string,
    onToken: (token: string) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    },
  ): Promise<void>;
  readonly model: string;
  readonly provider: string;
}
