import { logger } from '@/lib/logger';
import type { AiProvider, AiGenerationRequest, AiGenerationResponse, AiProviderType } from '../types';

export class LocalProvider implements AiProvider {
  readonly type: AiProviderType = 'local';
  readonly model: string;

  constructor(
    model: string = 'llama-3.2',
    private baseUrl: string = 'http://localhost:11434/v1',
  ) {
    this.model = model;
  }

  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    const start = Date.now();
    logger.info('Local model generate', { model: this.model });

    const body: Record<string, unknown> = {
      model: this.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
      stream: false,
    };

    if (request.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Local API error ${res.status}: ${text}`);
    }

    const data = await res.json() as {
      choices: { message: { content: string } }[];
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    return {
      content: data.choices[0]?.message?.content ?? '',
      model: this.model,
      provider: 'local',
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
      durationMs: Date.now() - start,
    };
  }

  async generateStream(
    request: AiGenerationRequest,
    onToken: (token: string) => void,
  ): Promise<AiGenerationResponse> {
    const result = await this.generate(request);
    for (const char of result.content) {
      onToken(char);
    }
    return result;
  }
}
