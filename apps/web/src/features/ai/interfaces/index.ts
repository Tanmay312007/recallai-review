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
import type { KnowledgeChunk, CompletionRequest, CompletionResponse } from '@lumora/shared';

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

/** Low-level AI provider — wraps a concrete API (OpenAI, Gemini, Claude, Local). */
export interface AiProvider {
  readonly type: import('../types').AiProviderType;
  readonly model: string;
  generate(request: CompletionRequest): Promise<CompletionResponse>;
  generateStream(
    request: CompletionRequest,
    onToken: (token: string) => void,
  ): Promise<CompletionResponse>;
  estimateTokens(text: string): number;
}
