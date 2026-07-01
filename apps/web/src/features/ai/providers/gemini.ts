import type { CompletionRequest, CompletionResponse } from '@lumora/shared';
import type { AiProviderConfig } from '../types';
import { BaseProvider } from './base';

export class GeminiProvider extends BaseProvider {
  private readonly baseUrl: string;

  constructor(config: AiProviderConfig) {
    super({ ...config, type: 'google' });
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async generate(request: CompletionRequest): Promise<CompletionResponse> {
    return this.withRetry(async () => {
      const start = Date.now();
      const contents = this.buildGeminiContents(request);
      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.config.apiKey}`;

      const generationConfig: Record<string, unknown> = {
        maxOutputTokens: request.maxTokens,
        temperature: request.temperature ?? this.config.temperature ?? 0.2,
      };

      if (request.responseFormat?.type === 'json_object') {
        generationConfig.responseMimeType = 'application/json';
      }

      const body: Record<string, unknown> = {
        contents,
        generationConfig,
      };

      const res = await this.withTimeout(
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        this.recordFailure();
        throw new Error(`Gemini API error ${res.status}: ${errBody}`);
      }

      const json = await res.json();
      const latencyMs = Date.now() - start;
      const candidate = json.candidates?.[0];
      const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text).join('') ?? '';

      const usage = json.usageMetadata ?? {};
      const response: CompletionResponse = {
        content: text,
        provider: 'google',
        model: this.model,
        inputTokens: usage.promptTokenCount ?? 0,
        outputTokens: usage.candidatesTokenCount ?? 0,
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
    const contents = this.buildGeminiContents(request);
    const url = `${this.baseUrl}/models/${this.model}:streamGenerateContent?key=${this.config.apiKey}`;

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        maxOutputTokens: request.maxTokens,
        temperature: request.temperature ?? this.config.temperature ?? 0.2,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      this.recordFailure();
      throw new Error(`Gemini API error ${res.status}: ${errBody}`);
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
        const lines = chunk.split('\n').filter((l) => l.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line.replace(/^data:\s*/, ''));
            const parts = parsed.candidates?.[0]?.content?.parts ?? [];
            for (const part of parts) {
              if (part.text) {
                fullContent += part.text;
                onToken(part.text);
              }
            }
            if (parsed.usageMetadata) {
              inputTokens = parsed.usageMetadata.promptTokenCount ?? 0;
              outputTokens = parsed.usageMetadata.candidatesTokenCount ?? 0;
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
      provider: 'google',
      model: this.model,
      inputTokens,
      outputTokens,
      costUsd: 0,
      latencyMs,
    };

    this.recordSuccess(inputTokens, outputTokens, latencyMs);
    return response;
  }

  private buildGeminiContents(request: CompletionRequest): Record<string, unknown>[] {
    const contents: Record<string, unknown>[] = [];

    if (request.systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: `[System Instruction]\n${request.systemPrompt}\n\n[Begin User Message]\n` }],
      });
    }

    for (const msg of request.messages ?? []) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      contents.push({ role, parts: [{ text: msg.content }] });
    }

    return contents;
  }
}
