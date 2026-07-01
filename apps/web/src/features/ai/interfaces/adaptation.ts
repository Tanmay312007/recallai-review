import type { KnowledgeChunk } from '@lumora/shared';

export interface HintGenerator {
  generate(chunk: KnowledgeChunk, question: string): Promise<string[]>;
}

export interface AdaptiveScheduler {
  calculateOptimalSessionSize(
    availableCards: number,
    averageRetention: number,
  ): number;
  prioritizeCards(
    cardIds: string[],
    reviewHistory: Record<string, { correct: boolean; timestamp: string }[]>,
  ): string[];
}
