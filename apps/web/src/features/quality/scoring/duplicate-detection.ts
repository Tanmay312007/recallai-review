import type { Flashcard } from '@/features/flashcards/types';
import type { DuplicateInfo } from '../types';
import { logger } from '@/lib/logger';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordOverlap(a: string, b: string): number {
  const wordsA = new Set(normalize(a).split(' '));
  const wordsB = new Set(normalize(b).split(' '));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  return intersection.size / Math.max(wordsA.size, wordsB.size);
}

export function detectExactDuplicate(
  card: Flashcard,
  existingCards: Flashcard[],
): DuplicateInfo | null {
  const normalizedNew = `${normalize(card.question)}|${normalize(card.answer)}`;

  for (const existing of existingCards) {
    if (existing.id === card.id) continue;
    const normalizedExisting = `${normalize(existing.question)}|${normalize(existing.answer)}`;
    if (normalizedNew === normalizedExisting) {
      return {
        type: 'exact',
        matchCardId: existing.id,
        matchQuestion: existing.question,
        similarity: 1,
      };
    }
  }

  return null;
}

export function detectNearDuplicates(
  card: Flashcard,
  existingCards: Flashcard[],
  threshold = 0.8,
): DuplicateInfo[] {
  const results: DuplicateInfo[] = [];

  for (const existing of existingCards) {
    if (existing.id === card.id) continue;

    const questionOverlap = wordOverlap(card.question, existing.question);
    const answerOverlap = wordOverlap(card.answer, existing.answer);
    const combinedOverlap = (questionOverlap + answerOverlap) / 2;

    if (combinedOverlap >= threshold) {
      results.push({
        type: 'near',
        matchCardId: existing.id,
        matchQuestion: existing.question,
        similarity: Math.round(combinedOverlap * 100) / 100,
      });
    }
  }

  return results;
}

export function detectConceptDuplicates(
  card: Flashcard,
  existingCards: Flashcard[],
): DuplicateInfo[] {
  const results: DuplicateInfo[] = [];
  const cardConcepts = new Set(card.tags.map((t) => t.toLowerCase()));

  for (const existing of existingCards) {
    if (existing.id === card.id) continue;

    const existingConcepts = new Set(existing.tags.map((t) => t.toLowerCase()));
    const intersection = new Set(
      [...cardConcepts].filter((c) => existingConcepts.has(c)),
    );

    if (intersection.size > 0 && cardConcepts.size > 0) {
      const similarity = intersection.size / Math.max(cardConcepts.size, existingConcepts.size);
      if (similarity >= 0.5) {
        results.push({
          type: 'concept',
          matchCardId: existing.id,
          matchQuestion: existing.question,
          similarity: Math.round(similarity * 100) / 100,
        });
      }
    }
  }

  return results;
}

export function detectAllDuplicates(
  card: Flashcard,
  existingCards: Flashcard[],
): DuplicateInfo[] {
  const duplicates: DuplicateInfo[] = [];
  const seen = new Set<string>();

  const exact = detectExactDuplicate(card, existingCards);
  if (exact) {
    duplicates.push(exact);
    seen.add(exact.matchCardId);
  }

  const near = detectNearDuplicates(card, existingCards);
  for (const d of near) {
    if (!seen.has(d.matchCardId)) {
      duplicates.push(d);
      seen.add(d.matchCardId);
    }
  }

  const concept = detectConceptDuplicates(card, existingCards);
  for (const d of concept) {
    if (!seen.has(d.matchCardId)) {
      duplicates.push(d);
      seen.add(d.matchCardId);
    }
  }

  if (duplicates.length > 0) {
    logger.debug(`Detected ${duplicates.length} duplicates for card ${card.id}`);
  }

  return duplicates;
}
