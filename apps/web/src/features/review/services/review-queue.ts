import type { Flashcard } from '@/features/flashcards/types';
import type { FsrsStateSnapshot } from '@lumora/shared';
import { logger } from '@/lib/logger';
import type { ReviewCard, ReviewQueue, ReviewQueueType } from '../types';
import { createInitialState } from '../scheduler/fsrs';

export function buildReviewQueue(
  flashcards: Flashcard[],
  existingStates?: Map<string, FsrsStateSnapshot>,
): ReviewQueue {
  const newCards: ReviewCard[] = [];
  const learningCards: ReviewCard[] = [];
  const reviewCards: ReviewCard[] = [];
  const relearningCards: ReviewCard[] = [];

  const now = new Date();

  for (const card of flashcards) {
    const fsrsState = existingStates?.get(card.id) ?? createInitialState();
    const queueType = determineQueueType(fsrsState, now);

    const reviewCard: ReviewCard = {
      ...card,
      fsrsState,
      queueType,
    };

    switch (queueType) {
      case 'new':
        newCards.push(reviewCard);
        break;
      case 'learning':
        learningCards.push(reviewCard);
        break;
      case 'review':
        reviewCards.push(reviewCard);
        break;
      case 'relearning':
        relearningCards.push(reviewCard);
        break;
    }
  }

  const queue: ReviewQueue = {
    newCards,
    learningCards,
    reviewCards,
    relearningCards,
    totalDue: newCards.length + learningCards.length + reviewCards.length + relearningCards.length,
  };

  logger.info('Review queue built', {
    new: newCards.length,
    learning: learningCards.length,
    review: reviewCards.length,
    relearning: relearningCards.length,
  });

  return queue;
}

export function getNextCardFromQueue(queue: ReviewQueue): ReviewCard | undefined {
  const pools: { cards: ReviewCard[]; priority: number }[] = [
    { cards: queue.relearningCards, priority: 0 },
    { cards: queue.learningCards, priority: 1 },
    { cards: queue.reviewCards, priority: 2 },
    { cards: queue.newCards, priority: 3 },
  ];

  pools.sort((a, b) => a.priority - b.priority);

  for (const pool of pools) {
    if (pool.cards.length > 0) {
      return pool.cards[0];
    }
  }

  return undefined;
}

function determineQueueType(
  state: FsrsStateSnapshot,
  now: Date,
): ReviewQueueType {
  if (state.state === 0) return 'new';

  const dueDate = new Date(state.due);
  const isDue = dueDate <= now;

  if (state.state === 1) {
    if (isDue) return 'learning';
    return 'learning';
  }

  if (state.state === 2) {
    if (isDue) return 'review';
    return 'review';
  }

  if (state.state === 3) {
    if (isDue) return 'review';
    return 'review';
  }

  return 'new';
}
