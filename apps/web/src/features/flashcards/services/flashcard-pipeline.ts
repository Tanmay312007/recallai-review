import type { KnowledgeChunk } from '@recallai/shared';
import { logger } from '@/lib/logger';
import type { LearningUnit } from '../pipeline';
import { detectLearningUnits } from './learning-unit-detector';
import type { Flashcard, FlashcardCardType, FlashcardGenerationMetadata } from '../types';
import { validateFlashcard } from '../validators';

export interface FlashcardPipelineResult {
  flashcards: Flashcard[];
  learningUnits: LearningUnit[];
  totalUnits: number;
  totalCards: number;
  errors: string[];
}

export function runFlashcardPipeline(
  chunks: KnowledgeChunk[],
  documentId: string,
  options?: {
    maxCardsPerUnit?: number;
    minConfidence?: number;
  },
): FlashcardPipelineResult {
  const opts = { maxCardsPerUnit: 3, minConfidence: 0.5, ...options };
  const errors: string[] = [];

  logger.info('Starting flashcard pipeline', {
    documentId,
    chunkCount: chunks.length,
  });

  const learningUnits = detectLearningUnits(chunks, documentId);
  logger.info(`Detected ${learningUnits.length} learning units`);

  const flashcards: Flashcard[] = [];

  for (const unit of learningUnits) {
    const candidates = generateCandidates(unit, documentId);
    const unitCards = candidates.slice(0, opts.maxCardsPerUnit);

    for (const candidate of unitCards) {
      const validation = validateFlashcard(candidate);
      if (!validation.valid) {
        errors.push(...validation.errors);
        continue;
      }

      flashcards.push(candidate);
    }
  }

  logger.info(`Pipeline complete: ${flashcards.length} cards from ${learningUnits.length} units`, {
    documentId,
    errors: errors.length,
  });

  return {
    flashcards,
    learningUnits,
    totalUnits: learningUnits.length,
    totalCards: flashcards.length,
    errors,
  };
}

function generateCandidates(
  unit: LearningUnit,
  documentId: string,
): Flashcard[] {
  const candidates: Flashcard[] = [];

  for (const chunk of unit.chunks) {
    const cards = generateCardsForChunk(chunk, documentId, unit);
    candidates.push(...cards);
  }

  return candidates;
}

function generateCardsForChunk(
  chunk: KnowledgeChunk,
  documentId: string,
  unit: LearningUnit,
): Flashcard[] {
  const cards: Flashcard[] = [];
  const content = chunk.content;

  if (unit.definitions.length > 0) {
    cards.push(createCard(chunk, documentId, unit, 'definition'));
  }

  if (unit.type === 'process') {
    cards.push(createCard(chunk, documentId, unit, 'process_recall'));
  }

  if (unit.type === 'comparison') {
    cards.push(createCard(chunk, documentId, unit, 'comparison'));
  }

  if (unit.type === 'list') {
    cards.push(createCard(chunk, documentId, unit, 'list_recall'));
  }

  if (unit.type === 'cause_effect') {
    cards.push(createCard(chunk, documentId, unit, 'basic_qa'));
  }

  if (content.includes('=') || content.match(/formula|equation/i)) {
    cards.push(createCard(chunk, documentId, unit, 'fill_blank'));
  }

  if (cards.length === 0) {
    cards.push(createCard(chunk, documentId, unit, 'basic_qa'));
  }

  return cards.slice(0, 2);
}

function createCard(
  chunk: KnowledgeChunk,
  documentId: string,
  unit: LearningUnit,
  cardType: FlashcardCardType,
): Flashcard {
  const now = new Date().toISOString();
  const metadata: FlashcardGenerationMetadata = {
    generatedAt: now,
    sourceChunkIds: [chunk.id],
    wordCount: chunk.metadata.wordCount,
    validationStatus: 'pending',
    validationErrors: [],
    aiGenerated: false,
    modelVersion: null,
  };

  const lines = chunk.content.split('\n').filter(Boolean);
  const firstLine = lines[0] ?? '';

  let question = '';
  let answer = '';

  switch (cardType) {
    case 'definition':
      question = `What is ${extractTerm(firstLine)}?`;
      answer = firstLine;
      break;
    case 'process_recall':
      question = `Describe the process of ${unit.title.replace('process: ', '')}.`;
      answer = chunk.content;
      break;
    case 'comparison':
      question = `Compare and contrast the concepts described in this section.`;
      answer = chunk.content;
      break;
    case 'list_recall':
      question = `List the key items described in this section.`;
      answer = formatList(chunk.content);
      break;
    case 'fill_blank':
      question = `Complete the following: "${generateFillBlank(chunk.content)}"`;
      answer = chunk.content;
      break;
    default:
      question = `What is described in this section?`;
      answer = chunk.content.length > 200
        ? chunk.content.slice(0, 200) + '...'
        : chunk.content;
  }

  return {
    id: generateCardId(),
    documentId,
    chunkId: chunk.id,
    question,
    answer,
    cardType,
    difficulty: inferDifficulty(chunk),
    bloomLevel: inferBloomLevel(chunk),
    tags: [unit.type, cardType, ...unit.keyConcepts.slice(0, 3)],
    sourcePage: chunk.metadata.sourcePage,
    confidence: calculateConfidence(chunk, unit, cardType),
    metadata,
    edited: false,
    createdAt: now,
    updatedAt: now,
  };
}

function extractTerm(text: string): string {
  const match = text.match(/^(the |a |an )?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  return match?.[2] ?? 'this concept';
}

function formatList(content: string): string {
  return content
    .split('\n')
    .filter((l) => l.match(/^\s*[-*•\d.]/))
    .join('\n');
}

function generateFillBlank(content: string): string {
  const words = content.split(/\s+/);
  if (words.length < 5) return content;
  const keyIndex = Math.floor(words.length / 2);
  words[keyIndex] = '______';
  return words.join(' ');
}

function inferDifficulty(chunk: KnowledgeChunk): 'easy' | 'medium' | 'hard' {
  const wc = chunk.metadata.wordCount;
  if (wc < 50) return 'easy';
  if (wc < 150) return 'medium';
  return 'hard';
}

function inferBloomLevel(
  chunk: KnowledgeChunk,
): 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' {
  const content = chunk.content;

  if (content.match(/compare|contrast|distinguish|differentiate/i)) return 'ANALYZE';
  if (content.match(/apply|implement|use|demonstrate|solve/i)) return 'APPLY';
  if (content.match(/explain|describe|summarize|interpret/i)) return 'UNDERSTAND';

  return 'REMEMBER';
}

function calculateConfidence(
  chunk: KnowledgeChunk,
  unit: LearningUnit,
  _cardType: FlashcardCardType,
): number {
  let score = 0.5;

  if (unit.keyConcepts.length > 0) score += 0.15;
  if (unit.definitions.length > 0) score += 0.15;
  if (chunk.metadata.wordCount > 30 && chunk.metadata.wordCount < 300) score += 0.1;
  if (unit.type !== 'concept') score += 0.1;

  return Math.min(1, Math.round(score * 100) / 100);
}

let cardCounter = 0;
function generateCardId(): string {
  return `fc_${Date.now()}_${++cardCounter}`;
}
