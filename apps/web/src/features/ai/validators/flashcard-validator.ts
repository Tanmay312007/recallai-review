import { logger } from '@/lib/logger';
import type { Flashcard } from '@/features/flashcards/types';

export interface AiFlashcardValidationResult {
  card: Flashcard;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const seenQuestions = new Set<string>();

export function validateAiFlashcard(
  card: Flashcard,
  existingCards?: Flashcard[],
): AiFlashcardValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!card.question || card.question.trim().length < 10) {
    errors.push('Question too short (min 10 chars)');
  }

  if (card.question.length > 500) {
    errors.push('Question too long (max 500 chars)');
  }

  if (!card.answer || card.answer.trim().length < 5) {
    errors.push('Answer too short (min 5 chars)');
  }

  if (card.answer.length > 2000) {
    errors.push('Answer too long (max 2000 chars)');
  }

  if (card.question === card.answer) {
    errors.push('Question and answer must be different');
  }

  if (card.confidence < 0.3) {
    warnings.push(`Low confidence: ${card.confidence}`);
  }

  if (!card.documentId) {
    errors.push('Missing document reference');
  }

  if (!card.chunkId) {
    errors.push('Missing source chunk reference');
  }

  const contentKey = `${card.question.toLowerCase()}|${card.answer.toLowerCase()}`;
  if (seenQuestions.has(contentKey)) {
    errors.push('Duplicate card content within this generation batch');
  }
  seenQuestions.add(contentKey);

  if (existingCards) {
    for (const existing of existingCards) {
      const existingKey = `${existing.question.toLowerCase()}|${existing.answer.toLowerCase()}`;
      if (existingKey === contentKey) {
        errors.push('Duplicate card content matches an existing card');
        break;
      }
    }
  }

  if (card.metadata.sourceChunkIds.length === 0) {
    warnings.push('No source chunk references');
  }

  if (!card.cardType) {
    errors.push('Missing card type');
  }

  if (errors.length === 0) {
    card.metadata.validationStatus = 'passed';
    logger.info(`AI card ${card.id} passed validation`);
  } else {
    card.metadata.validationStatus = 'failed';
    card.metadata.validationErrors = errors;
    logger.warn(`AI card ${card.id} failed validation`, { errors });
  }

  return { card, valid: errors.length === 0, errors, warnings };
}

export function validateAiFlashcards(
  cards: Flashcard[],
  existingCards?: Flashcard[],
): AiFlashcardValidationResult[] {
  seenQuestions.clear();
  return cards.map((card) => validateAiFlashcard(card, existingCards));
}

export function resetAiValidationState(): void {
  seenQuestions.clear();
}
