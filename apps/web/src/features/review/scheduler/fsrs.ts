import type { FsrsStateSnapshot } from '@lumora/shared';
import { logger } from '@/lib/logger';

export type FsrsState = 0 | 1 | 2 | 3;

const W = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61] as const;

const DECAY = -0.5;
const FACTOR = 0.9;

export function createInitialState(): FsrsStateSnapshot {
  return {
    state: 0,
    due: new Date().toISOString(),
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
  };
}

export function scheduleCard(
  current: FsrsStateSnapshot,
  rating: number,
  now: Date = new Date(),
): FsrsStateSnapshot {
  let { state, stability, difficulty } = current;
  let { reps, lapses } = current;

  difficulty = calculateDifficulty(difficulty, rating);
  stability = calculateStability(stability, difficulty, rating, state);

  reps += 1;
  if (rating === 1) lapses += 1;

  state = determineNextState(state, rating, lapses);

  const scheduledDays = calculateScheduledDays(stability);
  const due = new Date(now.getTime() + scheduledDays * 86400000);
  const elapsedDays = state === 0 ? 0 : Math.round(
    (now.getTime() - new Date(current.due).getTime()) / 86400000,
  );

  const snapshot: FsrsStateSnapshot = {
    state,
    due: due.toISOString(),
    stability,
    difficulty,
    elapsedDays,
    scheduledDays,
    reps,
    lapses,
  };

  logger.info(`FSRS schedule: rating=${rating}, state=${state}, stability=${stability.toFixed(1)}, difficulty=${difficulty.toFixed(2)}`);

  return snapshot;
}

export function getRetrievability(
  stability: number,
  elapsedDays: number,
): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + FACTOR * elapsedDays / stability, DECAY);
}

export function ratingToNumber(rating: 'again' | 'hard' | 'good' | 'easy'): number {
  switch (rating) {
    case 'again': return 1;
    case 'hard': return 2;
    case 'good': return 3;
    case 'easy': return 4;
  }
}

function calculateDifficulty(difficulty: number, rating: number): number {
  const initialDifficulty = W[2]!;
  const delta = rating - 3;

  if (difficulty === 0) {
    return Math.max(1, Math.min(10, initialDifficulty + delta * W[3]!));
  }

  const newDifficulty = difficulty + delta * W[3]!;
  return Math.max(1, Math.min(10, newDifficulty));
}

function calculateStability(
  stability: number,
  difficulty: number,
  rating: number,
  state: number,
): number {
  if (state === 0) {
    return Math.max(0.1, W[0]! + W[1]! * (rating - 1));
  }

  if (state === 1) {
    const s = stability * Math.exp(
      W[8]! * (rating - 3) + W[9]! * (Math.exp(W[10]! * (1 - 3)) - 1),
    );
    return Math.max(0.1, s);
  }

  const retrievability = getRetrievability(stability, 1);
  const easeFactor = Math.exp(W[6]! * (1 - retrievability));

  if (rating === 1) {
    const decay = Math.pow(difficulty, W[7]!);
    const s = W[4]! * Math.pow(stability, W[5]!) * Math.exp(W[6]! * (1 - 3)) * decay;
    return Math.max(0.1, s);
  }

  const s = stability * (1 + easeFactor * (rating - 3) * W[11]!);
  return Math.max(0.1, Math.max(stability, s));
}

function determineNextState(state: number, rating: number, lapses: number): FsrsState {
  if (state === 0) {
    if (rating === 1) return 0;
    return 2;
  }

  if (state === 1) {
    if (rating === 1) return 0;
    if (rating === 2) return 1;
    return 2;
  }

  if (rating === 1) {
    return lapses > 0 ? 1 : 2;
  }

  return 3;
}

function calculateScheduledDays(stability: number): number {
  return Math.max(0, Math.round(stability));
}
