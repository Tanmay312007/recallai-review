import { logger } from '@/lib/logger';
import type { ReviewCard, ReviewRating, ReviewSessionState, SessionProgress, ReviewRatingRecord } from '../types';
import { ratingToNumber, scheduleCard } from '../scheduler/fsrs';
import type { FsrsStateSnapshot } from '@lumora/shared';

export interface SessionActions {
  start: () => void;
  rate: (rating: ReviewRating) => ReviewCard | undefined;
  pause: () => void;
  resume: () => void;
  finish: () => ReviewSessionState;
  goToCard: (index: number) => void;
  getProgress: () => SessionProgress;
  getCurrentCard: () => ReviewCard | undefined;
}

export function createSession(
  cards: ReviewCard[],
  onStateChange?: (state: ReviewSessionState) => void,
  onRating?: (record: ReviewRatingRecord, newState: FsrsStateSnapshot) => void,
): SessionActions {
  let state: ReviewSessionState = {
    id: generateSessionId(),
    status: 'idle',
    currentCardIndex: 0,
    cards,
    startedAt: null,
    pausedAt: null,
    resumedAt: null,
    completedAt: null,
    totalCards: cards.length,
    reviewedCards: 0,
    ratings: [],
    timeSpentMs: 0,
  };

  let sessionStartTime: number | null = null;
  let cardStartTime: number | null = null;

  function emitChange(): void {
    onStateChange?.({ ...state });
  }

  function getCurrentCard(): ReviewCard | undefined {
    return state.cards[state.currentCardIndex];
  }

  function start(): void {
    if (state.status !== 'idle') return;

    sessionStartTime = Date.now();
    cardStartTime = Date.now();
    state.startedAt = new Date().toISOString();
    state.status = 'active';
    logger.info('Review session started', { cardCount: state.totalCards });
    emitChange();
  }

  function rate(rating: ReviewRating): ReviewCard | undefined {
    if (state.status !== 'active') return undefined;

    const card = getCurrentCard();
    if (!card) return undefined;

    const elapsedMs = cardStartTime ? Date.now() - cardStartTime : 0;

    const ratingNum = ratingToNumber(rating);
    const newState = scheduleCard(card.fsrsState, ratingNum);

    const record: ReviewRatingRecord = {
      cardId: card.id,
      rating,
      timestamp: new Date().toISOString(),
      elapsedMs,
    };

    state.ratings.push(rating);
    state.reviewedCards += 1;
    state.timeSpentMs += elapsedMs;

    onRating?.(record, newState);

    card.fsrsState = newState;
    card.queueType = determinePostRatingQueue(newState, rating);

    const nextIndex = state.currentCardIndex + 1;
    if (nextIndex < state.cards.length) {
      state.currentCardIndex = nextIndex;
      cardStartTime = Date.now();
    } else {
      finish();
      return undefined;
    }

    logger.info(`Card rated: ${rating}`, {
      cardId: card.id,
      elapsedMs,
      newState,
    });

    emitChange();
    return getCurrentCard();
  }

  function pause(): void {
    if (state.status !== 'active') return;
    state.status = 'paused';
    state.pausedAt = new Date().toISOString();
    logger.info('Review session paused');
    emitChange();
  }

  function resume(): void {
    if (state.status !== 'paused') return;
    state.status = 'active';
    state.resumedAt = new Date().toISOString();
    cardStartTime = Date.now();
    logger.info('Review session resumed');
    emitChange();
  }

  function finish(): ReviewSessionState {
    if (state.status === 'completed') return state;
    state.status = 'completed';
    state.completedAt = new Date().toISOString();

    if (sessionStartTime) {
      state.timeSpentMs = Date.now() - sessionStartTime;
    }

    logger.info('Review session completed', {
      totalCards: state.totalCards,
      reviewed: state.reviewedCards,
      timeMs: state.timeSpentMs,
    });

    emitChange();
    return { ...state };
  }

  function goToCard(index: number): void {
    if (index < 0 || index >= state.cards.length) return;
    state.currentCardIndex = index;
    cardStartTime = Date.now();
    emitChange();
  }

  function getProgress(): SessionProgress {
    return {
      reviewed: state.reviewedCards,
      total: state.totalCards,
      percentage: state.totalCards > 0
        ? Math.round((state.reviewedCards / state.totalCards) * 100)
        : 0,
      remaining: state.totalCards - state.reviewedCards,
      averageTimePerCard: state.reviewedCards > 0
        ? Math.round(state.timeSpentMs / state.reviewedCards)
        : 0,
    };
  }

  return { start, rate, pause, resume, finish, goToCard, getProgress, getCurrentCard };
}

function determinePostRatingQueue(
  state: FsrsStateSnapshot,
  _rating: ReviewRating,
): ReviewCard['queueType'] {
  if (state.state === 0) return 'new';
  if (state.state === 1) return 'learning';
  if (state.state === 2) return 'review';
  return 'review';
}

let sessionCounter = 0;
function generateSessionId(): string {
  return `session_${Date.now()}_${++sessionCounter}`;
}
