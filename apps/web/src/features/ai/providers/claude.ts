import { logger } from '@/lib/logger';
import type { AiProvider, AiGenerationRequest, AiGenerationResponse, AiProviderType } from '../types';

export class ClaudeProvider implements AiProvider {
  readonly type: AiProviderType = 'claude';
  readonly model: string;

  constructor(
    private apiKey: string,
    model: string = 'claude-3-haiku',
    private baseUrl: string = 'https://api.anthropic.com/v1',
  ) {
    this.model = model;
  }

  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    const start = Date.now();
    logger.info('Claude generate', { model: this.model });

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: request.maxTokens ?? 2048,
      temperature: request.temperature ?? 0.7,
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.userPrompt }],
    };

    const res = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Claude API error ${res.status}: ${text}`);
    }

    const data = await res.json() as {
      content: { text: string }[];
      usage: { input_tokens: number; output_tokens: number };
    };

    const content = data.content.map((c) => c.text).join('');

    return {
      content,
      model: this.model,
      provider: 'claude',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
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
