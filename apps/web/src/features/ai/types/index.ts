export type AiProviderType = 'openai' | 'gemini' | 'claude' | 'local';

export interface AiProviderConfig {
  type: AiProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiGenerationRequest {
  providerType: AiProviderType;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface AiGenerationResponse {
  content: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
}

export interface AiProvider {
  readonly type: AiProviderType;
  readonly model: string;
  generate(request: AiGenerationRequest): Promise<AiGenerationResponse>;
  generateStream(
    request: AiGenerationRequest,
    onToken: (token: string) => void,
  ): Promise<AiGenerationResponse>;
}

export const AI_PROVIDER_LABELS: Record<AiProviderType, string> = {
  openai: 'OpenAI',
  gemini: 'Gemini',
  claude: 'Claude',
  local: 'Local Model',
};

export const AI_PROVIDER_DEFAULT_MODELS: Record<AiProviderType, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
  claude: 'claude-3-haiku',
  local: 'llama-3.2',
};

/* ── Future interface types ── */

export interface FlashcardCandidate {
  id: string;
  documentId: string;
  question: string;
  answer: string;
  cardType: import('@/features/flashcards/types').FlashcardCardType;
  difficulty: import('@/features/flashcards/types').FlashcardDifficulty;
  bloomLevel: string;
  tags: string[];
  sourcePage: number | null;
  confidence: number;
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  wordCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface EmbeddingVector {
  chunkId: string;
  vector: number[];
}

export interface VectorSearchResult {
  chunkId: string;
  score: number;
  content: string;
}

export type FlashcardStyle = 'basic' | 'detailed' | 'mnemonic';
export type SummaryStyle = 'concise' | 'detailed' | 'bullet';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';
