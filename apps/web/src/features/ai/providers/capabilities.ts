import type { AiProviderType } from '../types';

export interface ProviderCapabilities {
  supportsJsonMode: boolean;
  supportsStreaming: boolean;
  supportsSystemPrompt: boolean;
  maxTokens: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  rateLimitRpm: number;
  rateLimitTpm: number;
}

export const PROVIDER_CAPABILITIES: Record<AiProviderType, ProviderCapabilities> = {
  openai: {
    supportsJsonMode: true,
    supportsStreaming: true,
    supportsSystemPrompt: true,
    maxTokens: 16384,
    costPer1kInputTokens: 0.00015,
    costPer1kOutputTokens: 0.0006,
    rateLimitRpm: 500,
    rateLimitTpm: 200000,
  },
  anthropic: {
    supportsJsonMode: false,
    supportsStreaming: true,
    supportsSystemPrompt: true,
    maxTokens: 8192,
    costPer1kInputTokens: 0.00025,
    costPer1kOutputTokens: 0.00125,
    rateLimitRpm: 50,
    rateLimitTpm: 50000,
  },
  google: {
    supportsJsonMode: true,
    supportsStreaming: true,
    supportsSystemPrompt: true,
    maxTokens: 8192,
    costPer1kInputTokens: 0.0001,
    costPer1kOutputTokens: 0.0004,
    rateLimitRpm: 360,
    rateLimitTpm: 150000,
  },
  custom: {
    supportsJsonMode: true,
    supportsStreaming: true,
    supportsSystemPrompt: true,
    maxTokens: 4096,
    costPer1kInputTokens: 0,
    costPer1kOutputTokens: 0,
    rateLimitRpm: 9999,
    rateLimitTpm: 999999,
  },
};

export function estimateCost(
  provider: AiProviderType,
  inputTokens: number,
  outputTokens: number,
): number {
  const caps = PROVIDER_CAPABILITIES[provider];
  if (!caps) return 0;
  const inputCost = (inputTokens / 1000) * caps.costPer1kInputTokens;
  const outputCost = (outputTokens / 1000) * caps.costPer1kOutputTokens;
  return Math.round((inputCost + outputCost) * 1000000) / 1000000;
}
