import type {
  CardReview,
  ReviewAction,
  BatchSelection,
  BatchActionResult,
} from '../types';
import { reviewService } from './review-service';
import { logger } from '@/lib/logger';

class BatchService {
  applyToSelection(
    reviews: Map<string, CardReview>,
    selection: BatchSelection,
    action: ReviewAction,
  ): { updated: Map<string, CardReview>; result: BatchActionResult } {
    const updated = new Map(reviews);
    const result: BatchActionResult = { succeeded: 0, failed: 0, errors: [] };

    for (const cardId of selection.cardIds) {
      const review = updated.get(cardId);
      if (!review) {
        result.failed++;
        result.errors.push(`Review not found for card ${cardId}`);
        continue;
      }

      try {
        updated.set(cardId, reviewService.applyAction(review, action, `Batch ${action}`));
        result.succeeded++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to ${action} card ${cardId}: ${error}`);
      }
    }

    logger.debug('Batch action applied', {
      action,
      succeeded: result.succeeded,
      failed: result.failed,
    });

    return { updated, result };
  }

  approveAll(reviews: Map<string, CardReview>): { updated: Map<string, CardReview>; result: BatchActionResult } {
    return this.applyToAllMatching(
      reviews,
      'approve',
      (r) => reviewService.canApprove(r),
    );
  }

  rejectAll(reviews: Map<string, CardReview>): { updated: Map<string, CardReview>; result: BatchActionResult } {
    return this.applyToAllMatching(
      reviews,
      'reject',
      (r) => reviewService.canReject(r),
    );
  }

  private applyToAllMatching(
    reviews: Map<string, CardReview>,
    action: ReviewAction,
    predicate: (review: CardReview) => boolean,
  ): { updated: Map<string, CardReview>; result: BatchActionResult } {
    const selection: BatchSelection = {
      cardIds: new Set(
        [...reviews.values()]
          .filter(predicate)
          .map((r) => r.cardId),
      ),
      selectAll: true,
    };

    return this.applyToSelection(reviews, selection, action);
  }
}

export const batchService = new BatchService();
