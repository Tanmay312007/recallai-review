import { logger } from '@/lib/logger';
import type { AiProviderType } from '../types';
import { AI_PROVIDER_DEFAULT_MODELS, AI_PROVIDER_ENV_KEYS, AI_PROVIDER_BASE_URLS } from '../types';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { ClaudeProvider } from './claude';
import { LocalProvider } from './local';
import type { BaseProvider } from './base';

type ProviderConstructor = new (config: {
  type: AiProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  maxRetries?: number;
}) => BaseProvider;

const providerConstructors: Record<AiProviderType, ProviderConstructor | null> = {
  openai: OpenAIProvider,
  anthropic: ClaudeProvider,
  google: GeminiProvider,
  custom: LocalProvider,
};

class ProviderRegistry {
  private providers = new Map<AiProviderType, BaseProvider>();
  private initialized = false;

  get(type: AiProviderType): BaseProvider | undefined {
    return this.providers.get(type);
  }

  getAll(): BaseProvider[] {
    return Array.from(this.providers.values());
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  register(type: AiProviderType, provider: BaseProvider): void {
    this.providers.set(type, provider);
    logger.info(`Provider registered: ${type} (${provider.model})`);
  }

  initializeProviders(configs?: Partial<Record<AiProviderType, { apiKey?: string; baseUrl?: string; model?: string }>>): void {
    const types: AiProviderType[] = ['openai', 'anthropic', 'google', 'custom'];

    for (const type of types) {
      const Constructor = providerConstructors[type];
      if (!Constructor) continue;

      const envKey = AI_PROVIDER_ENV_KEYS[type];
      const apiKey = configs?.[type]?.apiKey ?? (typeof process !== 'undefined' ? process.env[envKey] : undefined);
      const baseUrl = configs?.[type]?.baseUrl ?? AI_PROVIDER_BASE_URLS[type];
      const model = configs?.[type]?.model ?? AI_PROVIDER_DEFAULT_MODELS[type];

      if (!apiKey && type !== 'custom') continue;

      const provider = new Constructor({
        type,
        apiKey,
        baseUrl,
        model,
      });

      this.providers.set(type, provider);
      logger.info(`Provider initialized: ${type} (${model})`);
    }

    this.initialized = true;
  }

  reset(): void {
    this.providers.clear();
    this.initialized = false;
  }
}

export const aiProviderRegistry = new ProviderRegistry();

export function initializeProviders(
  configs?: Partial<Record<AiProviderType, { apiKey?: string; baseUrl?: string; model?: string }>>,
): void {
  aiProviderRegistry.initializeProviders(configs);
}
