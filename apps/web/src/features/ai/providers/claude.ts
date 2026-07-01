import type { CompletionRequest, CompletionResponse } from '@recallai/shared';
import type { AiProviderConfig } from '../types';
import { BaseProvider } from './base';

export class ClaudeProvider extends BaseProvider {
  private readonly baseUrl: string;
  private readonly apiVersion: string;

  constructor(config: AiProviderConfig) {
    super({ ...config, type: 'anthropic' });
    this.baseUrl = config.baseUrl ?? 'https://api.anthropic.com/v1';
    this.apiVersion = '2023-06-01';
  }

  async generate(request: CompletionRequest): Promise<CompletionResponse> {
    return this.withRetry(async () => {
      const start = Date.now();
      const body = this.buildClaudeBody(request);

      const res = await this.withTimeout(
        fetch(`${this.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey ?? '',
            'anthropic-version': this.apiVersion,
          },
          body: JSON.stringify(body),
        }),
      );

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        this.recordFailure();
        throw new Error(`Claude API error ${res.status}: ${errBody}`);
      }

      const json = await res.json();
      const latencyMs = Date.now() - start;

      const text = json.content
        ?.map((block: { text?: string }) => block.text ?? '')
        .join('') ?? '';

      const usage = json.usage ?? {};
      const response: CompletionResponse = {
        content: text,
        provider: 'anthropic',
        model: json.model ?? this.model,
        inputTokens: usage.input_tokens ?? 0,
        outputTokens: usage.output_tokens ?? 0,
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
    const body = this.buildClaudeBody(request);
    body.stream = true;

    const res = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey ?? '',
        'anthropic-version': this.apiVersion,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      this.recordFailure();
      throw new Error(`Claude API error ${res.status}: ${errBody}`);
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
          if (!data || data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.delta?.text;
            if (delta) {
              fullContent += delta;
              onToken(delta);
            }
            if (parsed.message?.usage) {
              inputTokens = parsed.message.usage.input_tokens ?? 0;
              outputTokens = parsed.message.usage.output_tokens ?? 0;
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
      provider: 'anthropic',
      model: this.model,
      inputTokens,
      outputTokens,
      costUsd: 0,
      latencyMs,
    };

    this.recordSuccess(inputTokens, outputTokens, latencyMs);
    return response;
  }

  private buildClaudeBody(request: CompletionRequest): Record<string, unknown> {
    const messages: Record<string, unknown>[] = [...(request.messages ?? [])];

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: request.maxTokens,
      temperature: request.temperature ?? this.config.temperature ?? 0.2,
      messages,
    };

    if (request.systemPrompt) {
      body.system = request.systemPrompt;
    }

    if (request.responseFormat?.type === 'json_object') {
      // Claude doesn't support native JSON mode; prompt must request JSON
    }

    return body;
  }
}
