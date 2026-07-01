import { logger } from '@/lib/logger';
import type { CompletionRequest, CompletionResponse } from '@lumora/shared';
import type { AiProviderType, AiProviderConfig } from '../types';
import { PROVIDER_CAPABILITIES, estimateCost } from './capabilities';

export interface ProviderStats {
  totalRequests: number;
  totalTokens: number;
  totalLatencyMs: number;
  failures: number;
  totalCostUsd: number;
}

export abstract class BaseProvider {
  readonly type: AiProviderType;
  readonly model: string;
  protected readonly config: AiProviderConfig;
  protected stats: ProviderStats = {
    totalRequests: 0,
    totalTokens: 0,
    totalLatencyMs: 0,
    failures: 0,
    totalCostUsd: 0,
  };

  constructor(config: AiProviderConfig) {
    this.type = config.type;
    this.model = config.model;
    this.config = {
      maxTokens: 4096,
      temperature: 0.2,
      timeoutMs: 60000,
      maxRetries: 2,
      ...config,
    };
  }

  abstract generate(request: CompletionRequest): Promise<CompletionResponse>;

  abstract generateStream(
    request: CompletionRequest,
    onToken: (token: string) => void,
  ): Promise<CompletionResponse>;

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  getStats(): ProviderStats {
    return { ...this.stats };
  }

  protected async withTimeout<T>(promise: Promise<T>, timeoutMs?: number): Promise<T> {
    const ms = timeoutMs ?? this.config.timeoutMs ?? 60000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);

    try {
      const result = await Promise.race([
        promise,
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error(`Provider request timed out after ${ms}ms`));
          });
        }),
      ]);
      clearTimeout(timer);
      return result;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  protected async withRetry<T>(
    fn: () => Promise<T>,
    retries?: number,
  ): Promise<T> {
    const maxRetries = retries ?? this.config.maxRetries ?? 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          logger.warn(`Provider request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms`, {
            provider: this.type,
            error: lastError.message,
          });
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError ?? new Error('Retry failed');
  }

  protected recordSuccess(inputTokens: number, outputTokens: number, latencyMs: number): void {
    const cost = estimateCost(this.type, inputTokens, outputTokens);
    this.stats.totalRequests++;
    this.stats.totalTokens += inputTokens + outputTokens;
    this.stats.totalLatencyMs += latencyMs;
    this.stats.totalCostUsd += cost;
    logger.info('Provider request completed', {
      provider: this.type,
      model: this.model,
      inputTokens,
      outputTokens,
      latencyMs,
      costUsd: cost,
    });
  }

  getCapabilities() {
    return PROVIDER_CAPABILITIES[this.type];
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    return estimateCost(this.type, inputTokens, outputTokens);
  }

  protected recordFailure(): void {
    this.stats.failures++;
  }

  protected buildRequestBody(
    request: CompletionRequest,
  ): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages: request.messages,
      max_tokens: request.maxTokens,
      temperature: request.temperature ?? this.config.temperature ?? 0.2,
    };

    if (request.responseFormat?.type === 'json_object') {
      body.response_format = { type: 'json_object' };
    }

    return body;
  }
}
