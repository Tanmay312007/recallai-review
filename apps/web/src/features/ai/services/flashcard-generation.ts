import type { KnowledgeChunk } from '@recallai/shared';
import { logger } from '@/lib/logger';
import { aiProviderRegistry } from '../providers/registry';
import { buildFlashcardPrompt, type BuiltPrompt } from './prompt-builder';
import { validateJsonResponse } from '../validators/json-schema';
import { validateAiFlashcards, resetAiValidationState } from '../validators/flashcard-validator';
import type { Flashcard, FlashcardCardType, FlashcardGenerationMetadata } from '@/features/flashcards/types';
import type { AiProviderType } from '../types';
import type { CompletionRequest } from '@recallai/shared';
import { useFlashcardStore } from '@/features/flashcards/store/flashcard-store';

export interface AiFlashcardGenerationResult {
  flashcards: Flashcard[];
  prompt: BuiltPrompt;
  provider: string;
  model: string;
  totalTokens: number;
  latencyMs: number;
  errors: string[];
  validationResults: { cardId: string; valid: boolean; errors: string[]; warnings: string[] }[];
}

export async function generateFlashcardsWithAI(
  chunks: KnowledgeChunk[],
  documentId: string,
  options?: {
    provider?: AiProviderType;
    count?: number;
    title?: string;
  },
): Promise<AiFlashcardGenerationResult> {
  const providerType = options?.provider ?? 'openai';
  const provider = aiProviderRegistry.get(providerType);

  if (!provider) {
    throw new Error(`AI provider "${providerType}" is not initialized. Call initializeProviders() first.`);
  }

  const errors: string[] = [];
  const count = options?.count ?? 10;

  const prompt = buildFlashcardPrompt(
    { chunks, documentId, title: options?.title, count },
    (text) => provider.estimateTokens(text),
  );

  const request: CompletionRequest = {
    messages: [],
    systemPrompt: prompt.system,
    modelHint: 'balanced',
    maxTokens: 4096,
    temperature: 0.2,
    responseFormat: { type: 'json_object' },
  };

  request.messages.push({ role: 'user', content: prompt.user });

  logger.info('Calling AI provider for flashcard generation', {
    provider: providerType,
    model: provider.model,
    estimatedTokens: prompt.estimatedTokens,
  });

  const response = await provider.generate(request);

  logger.info('AI response received', {
    provider: providerType,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    latencyMs: response.latencyMs,
  });

  const jsonValidation = validateJsonResponse(response.content);

  if (!jsonValidation.valid) {
    errors.push(...jsonValidation.errors);
    if (jsonValidation.errors.length === 0) {
      errors.push('Failed to parse AI response as valid JSON');
    }
  }

  const data = jsonValidation.data as { cards?: unknown[] } | null;
  const rawCards = data?.cards ?? [];

  const flashcardCandidates = parseCards(rawCards, chunks, documentId);

  resetAiValidationState();
  const existingCards = useFlashcardStore.getState().cards;
  const validationResults = validateAiFlashcards(flashcardCandidates, existingCards);

  const validCards = flashcardCandidates.filter((_, i) => validationResults[i]?.valid);
  const failedCards = validationResults.filter((r) => !r.valid);

  if (failedCards.length > 0) {
    logger.warn(`${failedCards.length} AI-generated cards failed validation`);
    for (const r of failedCards) {
      errors.push(...r.errors);
    }
  }

  return {
    flashcards: validCards,
    prompt,
    provider: provider.type,
    model: provider.model,
    totalTokens: response.inputTokens + response.outputTokens,
    latencyMs: response.latencyMs,
    errors,
    validationResults: validationResults.map((r) => ({
      cardId: r.card.id,
      valid: r.valid,
      errors: r.errors,
      warnings: r.warnings,
    })),
  };
}

function parseCards(
  rawCards: unknown[],
  chunks: KnowledgeChunk[],
  documentId: string,
): Flashcard[] {
  const chunkMap = new Map(chunks.map((c) => [c.id, c]));
  const now = new Date().toISOString();
  let cardCounter = 0;

  return rawCards.map((raw) => {
    const card = raw as Record<string, unknown>;
    const sourceChunkId = chunks[0]?.id ?? '';
    const sourceChunk = chunkMap.get(sourceChunkId);
    const keyConcept = String(card.key_concept ?? '');

    const metadata: FlashcardGenerationMetadata = {
      generatedAt: now,
      sourceChunkIds: [sourceChunkId],
      wordCount: String(card.back ?? '').split(/\s+/).length,
      validationStatus: 'pending',
      validationErrors: [],
      aiGenerated: true,
      modelVersion: 'ai-v1',
    };

    const bloomLevel = mapBloomLevel(String(card.bloom_level ?? 'REMEMBER'));

    return {
      id: `ai_fc_${Date.now()}_${++cardCounter}`,
      documentId,
      chunkId: sourceChunkId,
      question: String(card.front ?? ''),
      answer: String(card.back ?? ''),
      cardType: mapCardType(String(card.card_type ?? 'BASIC')),
      difficulty: inferDifficulty(sourceChunk),
      bloomLevel,
      tags: [keyConcept, 'ai-generated', ...(sourceChunk?.metadata?.sectionTitle ? [sourceChunk.metadata.sectionTitle] : [])],
      sourcePage: sourceChunk?.metadata?.sourcePage ?? null,
      confidence: 0.7,
      metadata,
      edited: false,
      createdAt: now,
      updatedAt: now,
    };
  });
}

function mapCardType(cardType: string): FlashcardCardType {
  const mapping: Record<string, FlashcardCardType> = {
    BASIC: 'basic_qa',
    CLOZE: 'fill_blank',
    DEFINITION: 'definition',
  };
  return mapping[cardType] ?? 'basic_qa';
}

function mapBloomLevel(level: string): 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' {
  const valid = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE'] as const;
  return valid.includes(level as typeof valid[number]) ? (level as typeof valid[number]) : 'REMEMBER';
}

function inferDifficulty(chunk: import('@recallai/shared').KnowledgeChunk | undefined): 'easy' | 'medium' | 'hard' {
  if (!chunk) return 'medium';
  const wc = chunk.metadata.wordCount;
  if (wc < 50) return 'easy';
  if (wc < 150) return 'medium';
  return 'hard';
}
