import type { Flashcard } from '@/features/flashcards/types';
import { logger } from '@/lib/logger';

export interface AiValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const seenQuestions = new Set<string>();

export function validateAiFlashcards(
  flashcards: Flashcard[],
): AiValidationResult[] {
  const results: AiValidationResult[] = [];
  seenQuestions.clear();

  for (const card of flashcards) {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!card.question || card.question.trim().length < 10) {
      errors.push('Question too short (min 10 characters)');
    }

    if (!card.answer || card.answer.trim().length < 5) {
      errors.push('Answer too short (min 5 characters)');
    }

    if (card.question.length > 500) {
      errors.push('Question exceeds maximum length of 500 characters');
    }

    if (card.answer.length > 2000) {
      errors.push('Answer exceeds maximum length of 2000 characters');
    }

    if (card.question.toLowerCase() === card.answer.toLowerCase()) {
      errors.push('Question and answer must be different');
    }

    if (card.question.includes('{') || card.question.includes('{{')) {
      warnings.push('Question may contain unresolved template variables');
    }

    if (!card.chunkId) {
      errors.push('Missing source chunk reference');
    }

    const normalized = card.question.toLowerCase().trim();
    if (seenQuestions.has(normalized)) {
      errors.push('Duplicate question detected');
    }
    seenQuestions.add(normalized);

    if (card.tags.length === 0) {
      warnings.push('No tags assigned');
    }

    if (card.confidence < 0.3) {
      warnings.push('Low confidence score');
    }

    if (errors.length === 0) {
      card.metadata.validationStatus = 'passed';
    } else {
      card.metadata.validationStatus = 'failed';
      card.metadata.validationErrors = errors;
    }

    results.push({ valid: errors.length === 0, errors, warnings });
  }

  const validCount = results.filter((r) => r.valid).length;
  logger.info(`AI validation: ${validCount}/${flashcards.length} cards valid`);

  return results;
}

export function resetAiValidationState(): void {
  seenQuestions.clear();
}
