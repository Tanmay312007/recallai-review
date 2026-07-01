import type { KnowledgeChunk } from '@recallai/shared';
import type { AiProvider, AiGenerationRequest } from '../types';
import type { Flashcard, FlashcardCardType, FlashcardGenerationMetadata } from '@/features/flashcards/types';
import { getTemplate, renderPrompt } from '../prompts';
import { registerFlashcardTemplates } from '../prompts/flashcard-templates';
import { aiProviderRegistry } from '../providers/registry';
import { logger } from '@/lib/logger';

registerFlashcardTemplates();

interface AiFlashcardResponse {
  flashcards: Array<{
    question: string;
    answer: string;
    cardType: string;
    difficulty: string;
    bloomLevel: string;
    tags: string[];
    sourcePage: number | null;
  }>;
}

export interface AiFlashcardResult {
  flashcards: Flashcard[];
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  durationMs: number;
  provider: string;
  model: string;
}

export async function generateFlashcardsWithAI(
  chunks: KnowledgeChunk[],
  documentId: string,
  options?: {
    count?: number;
    provider?: AiProvider;
    onProgress?: (stage: string) => void;
  },
): Promise<AiFlashcardResult> {
  const provider = options?.provider ?? aiProviderRegistry.getDefault();
  const count = options?.count ?? 10;

  logger.info('AI flashcard generation started', {
    documentId,
    chunks: chunks.length,
    provider: `${provider.type}/${provider.model}`,
  });

  options?.onProgress?.('Building prompt');

  const template = getTemplate('flashcard-generation', '1.0');
  if (!template) throw new Error('Flashcard generation template not found');

  const content = chunks.map((c) => {
    const pageInfo = c.metadata.sourcePage != null ? `[Page ${c.metadata.sourcePage}] ` : '';
    return `${pageInfo}${c.content}`;
  }).join('\n\n---\n\n');

  const { systemPrompt, userPrompt } = renderPrompt(template, {
    documentTitle: documentId,
    totalChunks: String(chunks.length),
    content,
    count: String(count),
  });

  options?.onProgress?.('Calling AI provider');

  const generationStart = Date.now();

  const request: AiGenerationRequest = {
    providerType: provider.type,
    model: provider.model,
    systemPrompt,
    userPrompt,
    temperature: template.temperature,
    maxTokens: template.maxTokens,
    responseFormat: 'json',
  };

  const response = await provider.generate(request);

  options?.onProgress?.('Parsing response');

  const parsed = parseAiResponse(response.content);

  options?.onProgress?.('Creating flashcards');

  const now = new Date().toISOString();
  let cardCounter = 0;

  const flashcards: Flashcard[] = parsed.flashcards.map((item, index) => {
    const chunk = chunks[index % chunks.length] ?? chunks[0]!;
    const metadata: FlashcardGenerationMetadata = {
      generatedAt: now,
      sourceChunkIds: [chunk.id],
      wordCount: item.answer.split(/\s+/).length,
      validationStatus: 'pending',
      validationErrors: [],
      aiGenerated: true,
      modelVersion: `${provider.type}/${provider.model}`,
    };

    return {
      id: `ai_fc_${Date.now()}_${++cardCounter}`,
      documentId,
      chunkId: chunk.id,
      question: item.question,
      answer: item.answer,
      cardType: normalizeCardType(item.cardType),
      difficulty: normalizeDifficulty(item.difficulty),
      bloomLevel: normalizeBloomLevel(item.bloomLevel),
      tags: item.tags ?? [],
      sourcePage: item.sourcePage,
      confidence: 0.8,
      metadata,
      edited: false,
      createdAt: now,
      updatedAt: now,
    };
  });

  const durationMs = Date.now() - generationStart;

  logger.info('AI flashcard generation complete', {
    count: flashcards.length,
    tokens: response.usage.totalTokens,
    durationMs,
  });

  return {
    flashcards,
    usage: response.usage,
    durationMs,
    provider: response.provider,
    model: response.model,
  };
}

function parseAiResponse(content: string): AiFlashcardResponse {
  try {
    const parsed = JSON.parse(content) as AiFlashcardResponse;
    if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
      throw new Error('Response missing flashcards array');
    }
    return parsed;
  } catch (err) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as AiFlashcardResponse;
      if (parsed.flashcards) return parsed;
    }
    throw new Error(`Failed to parse AI response: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
  }
}

function normalizeCardType(type: string): FlashcardCardType {
  const valid: FlashcardCardType[] = [
    'basic_qa', 'definition', 'fill_blank', 'true_false',
    'list_recall', 'process_recall', 'comparison', 'concept_mapping',
  ];
  if (valid.includes(type as FlashcardCardType)) {
    return type as FlashcardCardType;
  }
  return 'basic_qa';
}

function normalizeDifficulty(difficulty: string): 'easy' | 'medium' | 'hard' {
  if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
    return difficulty;
  }
  return 'medium';
}

function normalizeBloomLevel(level: string): 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' {
  const valid = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE'];
  if (valid.includes(level)) return level as 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE';
  return 'REMEMBER';
}
