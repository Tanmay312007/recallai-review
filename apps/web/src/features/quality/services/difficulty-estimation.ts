import type { Flashcard } from '@/features/flashcards/types';
import type { DifficultyLevel } from '../types';

export interface DifficultyFactors {
  answerLength: number;
  conceptComplexity: number;
  prerequisiteCount: number;
  bloomLevelWeight: number;
  cardTypeWeight: number;
}

export function estimateDifficulty(card: Flashcard): DifficultyLevel {
  const raw = computeRawDifficulty(card);

  if (raw >= 0.7) return 'expert';
  if (raw >= 0.45) return 'hard';
  if (raw >= 0.2) return 'medium';
  return 'easy';
}

export function computeRawDifficulty(card: Flashcard): number {
  let score = 0.3;

  const answerWords = card.answer.split(/\s+/).length;

  if (answerWords > 100) score += 0.2;
  else if (answerWords > 50) score += 0.15;
  else if (answerWords > 20) score += 0.1;
  else if (answerWords < 10) score -= 0.1;

  const bloomWeights: Record<string, number> = {
    REMEMBER: 0,
    UNDERSTAND: 0.15,
    APPLY: 0.25,
    ANALYZE: 0.35,
  };
  score += bloomWeights[card.bloomLevel] ?? 0;

  const cardTypeWeights: Record<string, number> = {
    comparison: 0.2,
    process_recall: 0.15,
    concept_mapping: 0.2,
    definition: 0.1,
    fill_blank: 0.05,
    list_recall: 0.05,
    true_false: -0.1,
    basic_qa: 0,
  };
  score += cardTypeWeights[card.cardType] ?? 0;

  if (card.tags.length >= 4) score += 0.1;
  else if (card.tags.length >= 2) score += 0.05;

  if (card.confidence >= 0.8) score += 0.05;
  else if (card.confidence < 0.4) score -= 0.05;

  const questionWords = card.question.split(/\s+/).length;
  if (questionWords > 20) score += 0.05;
  else if (questionWords < 5) score -= 0.05;

  if (/compare|contrast|analyze|evaluate|synthesize|differentiate/i.test(card.question)) {
    score += 0.1;
  }

  if (/define|what is|list|name/i.test(card.question)) {
    score -= 0.05;
  }

  return Math.max(0, Math.min(1, score));
}

export function getDifficultyFactors(card: Flashcard): DifficultyFactors {
  return {
    answerLength: card.answer.split(/\s+/).length,
    conceptComplexity: computeRawDifficulty(card),
    prerequisiteCount: card.tags.length,
    bloomLevelWeight: card.bloomLevel === 'ANALYZE' ? 0.35 : card.bloomLevel === 'APPLY' ? 0.25 : card.bloomLevel === 'UNDERSTAND' ? 0.15 : 0,
    cardTypeWeight: card.cardType === 'comparison' || card.cardType === 'concept_mapping' ? 0.2 : card.cardType === 'process_recall' ? 0.15 : 0,
  };
}
