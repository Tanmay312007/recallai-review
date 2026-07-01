import type { ProviderType } from '@lumora/shared';
import type { KnowledgeChunk } from '@lumora/shared';

export type AiProviderType = ProviderType;

export type FlashcardStyle = 'basic' | 'cloze' | 'definition';

export type SummaryStyle = 'concise' | 'detailed' | 'bullet-points';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface AiProviderConfig {
  type: AiProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  maxRetries?: number;
}

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

export const AI_PROVIDER_LABELS: Record<AiProviderType, string> = {
  openai: 'OpenAI',
  anthropic: 'Claude',
  google: 'Gemini',
  custom: 'Local Model',
};

export const AI_PROVIDER_DEFAULT_MODELS: Record<AiProviderType, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-haiku-20240307',
  google: 'gemini-2.0-flash',
  custom: 'llama-3.2',
};

export const AI_PROVIDER_ENV_KEYS: Record<AiProviderType, string> = {
  openai: 'NEXT_PUBLIC_OPENAI_API_KEY',
  anthropic: 'NEXT_PUBLIC_ANTHROPIC_API_KEY',
  google: 'NEXT_PUBLIC_GEMINI_API_KEY',
  custom: 'NEXT_PUBLIC_LOCAL_API_KEY',
};

export const AI_PROVIDER_BASE_URLS: Record<AiProviderType, string | undefined> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  google: undefined,
  custom: undefined,
};
