import { logger } from '@/lib/logger';
import type { AiProvider, AiGenerationRequest, AiGenerationResponse, AiProviderType } from '../types';

export class GeminiProvider implements AiProvider {
  readonly type: AiProviderType = 'gemini';
  readonly model: string;

  constructor(
    private apiKey: string,
    model: string = 'gemini-2.0-flash',
    private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta',
  ) {
    this.model = model;
  }

  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    const start = Date.now();
    logger.info('Gemini generate', { model: this.model });

    const contents = [
      { role: 'user', parts: [{ text: `${request.systemPrompt}\n\n${request.userPrompt}` }] },
    ];

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 2048,
      },
    };

    const res = await fetch(
      `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${text}`);
    }

    const data = await res.json() as {
      candidates: { content: { parts: { text: string }[] } }[];
      usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number };
    };

    const text = data.candidates[0]?.content?.parts?.map((p) => p.text).join('') ?? '';

    return {
      content: text,
      model: this.model,
      provider: 'gemini',
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
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
