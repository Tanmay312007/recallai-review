import { logger } from '@/lib/logger';
import type { Flashcard } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const MAX_QUESTION_LENGTH = 500;
const MAX_ANSWER_LENGTH = 2000;
const MIN_QUESTION_LENGTH = 10;
const MIN_ANSWER_LENGTH = 5;
const MIN_CONFIDENCE = 0.3;

const seenContents = new Set<string>();

export function validateFlashcard(card: Flashcard): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!card.question || card.question.trim().length < MIN_QUESTION_LENGTH) {
    errors.push(`Question too short (min ${MIN_QUESTION_LENGTH} chars)`);
  }

  if (card.question.length > MAX_QUESTION_LENGTH) {
    errors.push(`Question too long (max ${MAX_QUESTION_LENGTH} chars)`);
  }

  if (!card.answer || card.answer.trim().length < MIN_ANSWER_LENGTH) {
    errors.push(`Answer too short (min ${MIN_ANSWER_LENGTH} chars)`);
  }

  if (card.answer.length > MAX_ANSWER_LENGTH) {
    errors.push(`Answer too long (max ${MAX_ANSWER_LENGTH} chars)`);
  }

  if (card.confidence < MIN_CONFIDENCE) {
    warnings.push(`Low confidence score: ${card.confidence}`);
  }

  if (!card.documentId) {
    errors.push('Missing document ID');
  }

  if (!card.chunkId) {
    errors.push('Missing source chunk reference');
  }

  if (!card.cardType) {
    errors.push('Missing card type');
  }

  if (card.question === card.answer) {
    errors.push('Question and answer must be different');
  }

  const contentKey = `${card.question}|${card.answer}`.toLowerCase();
  if (seenContents.has(contentKey)) {
    errors.push('Duplicate card content detected');
  }
  seenContents.add(contentKey);

  if (errors.length === 0) {
    card.metadata.validationStatus = 'passed';
    logger.info(`Card ${card.id} passed validation`);
  } else {
    card.metadata.validationStatus = 'failed';
    card.metadata.validationErrors = errors;
    logger.warn(`Card ${card.id} failed validation`, { errors });
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function resetValidationState(): void {
  seenContents.clear();
}

export function validateCardEdit(_card: Flashcard): ValidationResult {
  return {
    valid: true,
    errors: [],
    warnings: [],
  };
}
