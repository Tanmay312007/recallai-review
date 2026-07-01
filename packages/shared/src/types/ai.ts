/**
 * AI pipeline types (PROMPT §7). These describe the *contract* between the
 * AIGateway, the card-generation worker, and the validation pipeline. The
 * actual provider SDKs (OpenAI/Anthropic) stay hidden behind the gateway — no
 * provider types leak here (Principle 8: AI providers remain replaceable).
 */

/** Cost/latency hint that routes to a model class (§7.1). */
export type ModelHint = 'fast' | 'balanced' | 'powerful';

/** Request the gateway understands — provider-agnostic. */
export interface CompletionRequest {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  systemPrompt?: string;
  modelHint: ModelHint;
  maxTokens: number;
  /** Default 0.2 for generation, 0 for validation. */
  temperature?: number;
  /** Force structured JSON output when set. */
  responseFormat?: { type: 'json_object' };
  /** Correlates AI calls back to the BullMQ job for tracing. */
  jobId?: string;
}

/** Supported AI provider identifiers. */
export type ProviderType = 'openai' | 'anthropic' | 'google' | 'custom';

/** Normalized completion result returned by the gateway. */
export interface CompletionResponse {
  content: string;
  provider: ProviderType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
}

/** A single card candidate produced by the generation prompt (§7.3 schema). */
export interface CardCandidate {
  front: string;
  back: string;
  bloom_level: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE';
  card_type: 'BASIC' | 'CLOZE' | 'DEFINITION';
  key_concept: string;
}

/** The generation prompt's required JSON envelope. */
export interface GenerationPromptOutput {
  cards: CardCandidate[];
}

/** Outcome of the 4-check validation pipeline (§7.4). */
export interface ValidationResult {
  passed: boolean;
  /** 0–100 confidence score. */
  score: number;
  /** Human-readable reasons for any failed check. */
  failures: string[];
}

/** Final disposition of a candidate after validation (§7.4 Check 4 bands). */
export type CardDisposition = 'PERSISTED' | 'FLAGGED' | 'DISCARDED';
