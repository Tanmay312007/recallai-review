import type { CompletionRequest, CompletionResponse } from '@recallai/shared';
import type { AiProviderConfig } from '../types';
import { BaseProvider } from './base';

export class OpenAIProvider extends BaseProvider {
  private readonly baseUrl: string;

  constructor(config: AiProviderConfig) {
    super({ ...config, type: 'openai' });
    this.baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
  }

  async generate(request: CompletionRequest): Promise<CompletionResponse> {
    return this.withRetry(async () => {
      const start = Date.now();
      const body = this.buildRequestBody(request);

      if (request.systemPrompt) {
        body.messages = [
          { role: 'system', content: request.systemPrompt },
          ...(request.messages ?? []),
        ];
      }

      const res = await this.withTimeout(
        fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify(body),
        }),
      );

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        this.recordFailure();
        throw new Error(`OpenAI API error ${res.status}: ${errBody}`);
      }

      const json = await res.json();
      const latencyMs = Date.now() - start;
      const choice = json.choices?.[0];
      const usage = json.usage ?? { prompt_tokens: 0, completion_tokens: 0 };

      const response: CompletionResponse = {
        content: choice?.message?.content ?? '',
        provider: 'openai',
        model: json.model ?? this.model,
        inputTokens: usage.prompt_tokens ?? 0,
        outputTokens: usage.completion_tokens ?? 0,
        costUsd: 0,
        latencyMs,
      };

      this.recordSuccess(response.inputTokens, response.outputTokens, latencyMs);
      return response;
    });
  }

  async generateStream(
    request: CompletionRequest,
    onToken: (token: string) => void,
  ): Promise<CompletionResponse> {
    const start = Date.now();
    const body = this.buildRequestBody(request);
    body.stream = true;

    if (request.systemPrompt) {
      body.messages = [
        { role: 'system', content: request.systemPrompt },
        ...(request.messages ?? []),
      ];
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      this.recordFailure();
      throw new Error(`OpenAI API error ${res.status}: ${errBody}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              onToken(delta);
            }
            if (parsed.usage) {
              inputTokens = parsed.usage.prompt_tokens ?? 0;
              outputTokens = parsed.usage.completion_tokens ?? 0;
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    const latencyMs = Date.now() - start;
    const response: CompletionResponse = {
      content: fullContent,
      provider: 'openai',
      model: this.model,
      inputTokens,
      outputTokens,
      costUsd: 0,
      latencyMs,
    };

    this.recordSuccess(inputTokens, outputTokens, latencyMs);
    return response;
  }
}
