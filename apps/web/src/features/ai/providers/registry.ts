import type { AiProvider, AiProviderType, AiProviderConfig } from '../types';
import { AI_PROVIDER_DEFAULT_MODELS } from '../types';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { ClaudeProvider } from './claude';
import { LocalProvider } from './local';
import { logger } from '@/lib/logger';

class AiProviderRegistry {
  private providers = new Map<AiProviderType, AiProvider>();

  register(config: AiProviderConfig): void {
    const provider = this.createProvider(config);
    this.providers.set(config.type, provider);
    logger.info(`AI provider registered: ${config.type} (${config.model})`);
  }

  get(type: AiProviderType): AiProvider | undefined {
    return this.providers.get(type);
  }

  getAll(): AiProvider[] {
    return Array.from(this.providers.values());
  }

  getDefault(): AiProvider {
    return this.providers.get('openai') ?? this.providers.values().next().value as AiProvider;
  }

  private createProvider(config: AiProviderConfig): AiProvider {
    const model = config.model ?? AI_PROVIDER_DEFAULT_MODELS[config.type];

    switch (config.type) {
      case 'openai':
        return new OpenAIProvider(config.apiKey ?? '', model, config.baseUrl);
      case 'gemini':
        return new GeminiProvider(config.apiKey ?? '', model, config.baseUrl);
      case 'claude':
        return new ClaudeProvider(config.apiKey ?? '', model, config.baseUrl);
      case 'local':
        return new LocalProvider(model, config.baseUrl);
    }
  }
}

export const aiProviderRegistry = new AiProviderRegistry();

export function initializeProviders(): void {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (apiKey) {
    aiProviderRegistry.register({
      type: 'openai',
      apiKey,
      model: process.env.NEXT_PUBLIC_OPENAI_MODEL ?? 'gpt-4o-mini',
    });
  }

  const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (geminiKey) {
    aiProviderRegistry.register({
      type: 'gemini',
      apiKey: geminiKey,
      model: process.env.NEXT_PUBLIC_GEMINI_MODEL ?? 'gemini-2.0-flash',
    });
  }

  const claudeKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY;
  if (claudeKey) {
    aiProviderRegistry.register({
      type: 'claude',
      apiKey: claudeKey,
      model: process.env.NEXT_PUBLIC_CLAUDE_MODEL ?? 'claude-3-haiku',
    });
  }

  aiProviderRegistry.register({
    type: 'local',
    model: process.env.NEXT_PUBLIC_LOCAL_MODEL ?? 'llama-3.2',
    baseUrl: process.env.NEXT_PUBLIC_LOCAL_BASE_URL ?? 'http://localhost:11434/v1',
  });
}
