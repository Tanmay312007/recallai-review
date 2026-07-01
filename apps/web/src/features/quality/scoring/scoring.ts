import type { Flashcard } from '@/features/flashcards/types';
import type { QualityScore, CategoryScore, QualityCategory } from '../types';
import { logger } from '@/lib/logger';

const CATEGORY_WEIGHTS: Record<QualityCategory, number> = {
  question_clarity: 0.25,
  answer_quality: 0.25,
  answer_completeness: 0.15,
  educational_usefulness: 0.2,
  source_grounding: 0.1,
  metadata_completeness: 0.05,
};

export function calculateQualityScore(card: Flashcard): QualityScore {
  const categories: CategoryScore[] = [
    scoreQuestionClarity(card),
    scoreAnswerQuality(card),
    scoreAnswerCompleteness(card),
    scoreEducationalUsefulness(card),
    scoreSourceGrounding(card),
    scoreMetadataCompleteness(card),
  ];

  const overall = categories.reduce(
    (sum, c) => sum + c.score * c.weight,
    0,
  );

  const score: QualityScore = {
    overall: Math.round(overall * 100) / 100,
    categories,
    calculatedAt: new Date().toISOString(),
  };

  logger.debug('Quality score calculated', {
    cardId: card.id,
    overall: score.overall,
  });

  return score;
}

function scoreQuestionClarity(card: Flashcard): CategoryScore {
  const details: string[] = [];
  let score = 1;

  const q = card.question.trim();

  if (q.length < 15) {
    score -= 0.3;
    details.push('Question is very short');
  } else if (q.length < 30) {
    score -= 0.1;
  }

  if (q.length > 300) {
    score -= 0.2;
    details.push('Question is overly long');
  }

  if (!q.endsWith('?')) {
    score -= 0.15;
    details.push('Question does not end with a question mark');
  }

  if (/^(what|who|when|where) is/i.test(q)) {
    score += 0.05;
  }
  if (/^(why|how|explain|compare|contrast|analyze)/i.test(q)) {
    score += 0.1;
    details.push('Higher-order question');
  }

  if (q.includes('  ')) {
    score -= 0.05;
    details.push('Contains extra whitespace');
  }

  return {
    category: 'question_clarity',
    score: clamp(score),
    weight: CATEGORY_WEIGHTS.question_clarity,
    label: 'Question Clarity',
    details,
  };
}

function scoreAnswerQuality(card: Flashcard): CategoryScore {
  const details: string[] = [];
  let score = 1;

  const a = card.answer.trim();
  const q = card.question.trim();

  if (a.length < 20) {
    score -= 0.3;
    details.push('Answer is very short');
  } else if (a.length < 50) {
    score -= 0.1;
    details.push('Answer could be more detailed');
  }

  if (a.length > 1000) {
    score -= 0.15;
    details.push('Answer is overly long');
  }

  if (a === q) {
    score -= 0.5;
    details.push('Answer identical to question');
  }

  if (a.toLowerCase().includes(q.toLowerCase().slice(0, 10))) {
    score -= 0.1;
    details.push('Answer repeats question text');
  }

  if (card.confidence >= 0.7) {
    score += 0.1;
  }

  const wordCount = a.split(/\s+/).length;
  if (wordCount >= 10 && wordCount <= 80) {
    score += 0.1;
    details.push('Good answer length');
  }

  return {
    category: 'answer_quality',
    score: clamp(score),
    weight: CATEGORY_WEIGHTS.answer_quality,
    label: 'Answer Quality',
    details,
  };
}

function scoreAnswerCompleteness(card: Flashcard): CategoryScore {
  const details: string[] = [];
  let score = 1;

  const a = card.answer.trim();

  if (a.endsWith('...') || a.endsWith('…')) {
    score -= 0.2;
    details.push('Answer appears truncated');
  }

  if (/^(maybe|perhaps|it depends|might be|could be|sometimes)/i.test(a)) {
    score -= 0.2;
    details.push('Answer is speculative');
  }

  if (card.metadata.sourceChunkIds.length === 0) {
    score -= 0.15;
    details.push('No source chunk references');
  }

  if (a.includes('.')) {
    score += 0.1;
    details.push('Complete sentences');
  }

  const wordCount = a.split(/\s+/).length;
  if (wordCount < 5) {
    score -= 0.3;
    details.push('Incomplete answer');
  }

  return {
    category: 'answer_completeness',
    score: clamp(score),
    weight: CATEGORY_WEIGHTS.answer_completeness,
    label: 'Answer Completeness',
    details,
  };
}

function scoreEducationalUsefulness(card: Flashcard): CategoryScore {
  const details: string[] = [];
  let score = 0.7;

  const bloomBonus: Record<string, number> = {
    REMEMBER: 0,
    UNDERSTAND: 0.1,
    APPLY: 0.15,
    ANALYZE: 0.2,
  };

  score += bloomBonus[card.bloomLevel] ?? 0;
  if (card.bloomLevel !== 'REMEMBER') {
    details.push(`${card.bloomLevel} level`);
  }

  if (card.difficulty === 'hard') {
    score += 0.1;
    details.push('Challenging difficulty');
  }

  if (card.tags.length >= 2) {
    score += 0.05;
  }

  const cardTypeBonus: Record<string, number> = {
    comparison: 0.1,
    process_recall: 0.1,
    concept_mapping: 0.1,
    fill_blank: -0.05,
  };
  score += cardTypeBonus[card.cardType] ?? 0;

  return {
    category: 'educational_usefulness',
    score: clamp(score),
    weight: CATEGORY_WEIGHTS.educational_usefulness,
    label: 'Educational Usefulness',
    details,
  };
}

function scoreSourceGrounding(card: Flashcard): CategoryScore {
  const details: string[] = [];
  let score = 0.5;

  if (card.chunkId) {
    score += 0.3;
    details.push('Linked to source chunk');
  }

  if (card.metadata.sourceChunkIds.length > 0) {
    score += 0.1;
  }

  if (card.sourcePage != null) {
    score += 0.1;
    details.push(`Source page ${card.sourcePage}`);
  }

  if (card.metadata.aiGenerated) {
    score -= 0.05;
  }

  return {
    category: 'source_grounding',
    score: clamp(score),
    weight: CATEGORY_WEIGHTS.source_grounding,
    label: 'Source Grounding',
    details,
  };
}

function scoreMetadataCompleteness(card: Flashcard): CategoryScore {
  const details: string[] = [];
  let score = 1;

  if (!card.metadata.generatedAt) {
    score -= 0.2;
    details.push('Missing generation timestamp');
  }

  if (card.metadata.sourceChunkIds.length === 0) {
    score -= 0.2;
    details.push('Missing source chunk references');
  }

  if (!card.metadata.modelVersion && card.metadata.aiGenerated) {
    score -= 0.15;
    details.push('Missing model version');
  }

  if (card.tags.length === 0) {
    score -= 0.1;
    details.push('No tags');
  }

  if (card.metadata.wordCount <= 0) {
    score -= 0.1;
    details.push('Missing word count');
  }

  if (card.edited) {
    score += 0.1;
    details.push('Reviewed by user');
  }

  return {
    category: 'metadata_completeness',
    score: clamp(score),
    weight: CATEGORY_WEIGHTS.metadata_completeness,
    label: 'Metadata Completeness',
    details,
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Math.round(value * 100) / 100));
}
