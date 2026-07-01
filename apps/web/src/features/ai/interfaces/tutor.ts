import type { FlashcardCandidate } from '@/features/flashcards/pipeline';

export interface Tutor {
  getHint(cardId: string, question: string): Promise<string>;
  getExplanation(cardId: string, answer: string, userResponse: string): Promise<string>;
  detectWeakTopics(cardHistory: { cardId: string; correct: boolean }[]): Promise<string[]>;
  suggestNextCards(
    mastered: string[],
    struggling: string[],
    available: FlashcardCandidate[],
  ): Promise<string[]>;
}

export interface AdaptiveLearningProfile {
  userId: string;
  strengths: string[];
  weaknesses: string[];
  preferredCardTypes: string[];
  averageRetention: number;
  suggestedSessionSize: number;
}
