import type { Flashcard } from '@/features/flashcards/types';
import type { CardReview, ReviewAction, ReviewRecord, ReviewStatus } from '../types';
import { logger } from '@/lib/logger';

class ReviewService {
  private generateId(): string {
    return `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  createReview(card: Flashcard): CardReview {
    const review: CardReview = {
      cardId: card.id,
      status: 'pending',
      score: null,
      duplicates: [],
      difficulty: 'medium',
      notes: [],
      flagged: false,
      reviewedAt: null,
      reviewedBy: null,
    };

    logger.debug('Created review record', { cardId: card.id });
    return review;
  }

  addNote(review: CardReview, action: ReviewAction, note: string): ReviewRecord {
    const record: ReviewRecord = {
      id: this.generateId(),
      cardId: review.cardId,
      action,
      timestamp: new Date().toISOString(),
      note,
      previousStatus: review.status,
    };

    return record;
  }

  applyAction(
    review: CardReview,
    action: ReviewAction,
    note: string,
  ): CardReview {
    const record = this.addNote(review, action, note);
    const updated = { ...review };

    switch (action) {
      case 'approve':
        updated.status = 'approved';
        break;
      case 'reject':
        updated.status = 'rejected';
        break;
      case 'edit':
        updated.status = 'edited';
        break;
      case 'regenerate':
        updated.status = 'regenerated';
        break;
      case 'flag':
        updated.flagged = true;
        if (updated.status === 'pending') {
          updated.status = 'flagged';
        }
        break;
      case 'unflag':
        updated.flagged = false;
        if (updated.status === 'flagged') {
          updated.status = 'pending';
        }
        break;
    }

    updated.notes = [...review.notes, record];
    updated.reviewedAt = new Date().toISOString();

    logger.debug('Review action applied', {
      cardId: review.cardId,
      action,
      newStatus: updated.status,
    });

    return updated;
  }

  canApprove(review: CardReview): boolean {
    return review.status === 'pending' || review.status === 'flagged';
  }

  canReject(review: CardReview): boolean {
    return review.status === 'pending' || review.status === 'flagged';
  }

  getFilterableCards(
    reviews: Map<string, CardReview>,
    filters: { status?: ReviewStatus[]; flagged?: boolean | null },
  ): string[] {
    return [...reviews.values()]
      .filter((r) => {
        if (filters.status && filters.status.length > 0) {
          if (!filters.status.includes(r.status)) return false;
        }
        if (filters.flagged != null && r.flagged !== filters.flagged) return false;
        return true;
      })
      .map((r) => r.cardId);
  }
}

export const reviewService = new ReviewService();
