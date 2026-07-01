import type { CardReview, GenerationAnalytics } from '../types';
import type { Flashcard } from '@/features/flashcards/types';
import { calculateQualityScore } from '../scoring/scoring';

class AnalyticsService {
  computeGenerationAnalytics(params: {
    provider: string;
    model: string;
    promptVersion: string;
    durationMs: number;
    tokens: number;
    costUsd: number;
    cards: Flashcard[];
    validations: { passed: number; failed: number };
  }): GenerationAnalytics {
    const scores = params.cards.map((c) => calculateQualityScore(c));
    const avgQuality = scores.length > 0
      ? scores.reduce((s, q) => s + q.overall, 0) / scores.length
      : 0;

    return {
      provider: params.provider,
      model: params.model,
      promptVersion: params.promptVersion,
      generationDurationMs: params.durationMs,
      totalTokens: params.tokens,
      estimatedCostUsd: params.costUsd,
      validationPassed: params.validations.passed,
      validationFailed: params.validations.failed,
      approvalRate: 0,
      averageQualityScore: Math.round(avgQuality * 100) / 100,
      totalCards: params.cards.length,
    };
  }

  computeReviewAnalytics(reviews: CardReview[]): {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    edited: number;
    flagged: number;
    approvalRate: number;
    avgQuality: number;
  } {
    const total = reviews.length;
    const approved = reviews.filter((r) => r.status === 'approved').length;
    const rejected = reviews.filter((r) => r.status === 'rejected').length;
    const pending = reviews.filter((r) => r.status === 'pending').length;
    const edited = reviews.filter((r) => r.status === 'edited').length;
    const flagged = reviews.filter((r) => r.flagged).length;

    const scored = reviews.filter((r) => r.score !== null);
    const avgQuality = scored.length > 0
      ? scored.reduce((s, r) => s + (r.score?.overall ?? 0), 0) / scored.length
      : 0;

    return {
      total: reviews.length,
      approved,
      rejected,
      pending,
      edited,
      flagged,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) / 100 : 0,
      avgQuality: Math.round(avgQuality * 100) / 100,
    };
  }
}

export const analyticsService = new AnalyticsService();
