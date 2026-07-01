import type { Flashcard } from '@/features/flashcards/types';
import type { CardReview, ReviewStatus } from '../types';

interface ReviewQueueListProps {
  cards: Flashcard[];
  reviews: Map<string, CardReview>;
  selectedIds: Set<string>;
  onToggleSelect: (cardId: string) => void;
  onSelectCard: (cardId: string) => void;
  filters: { status: ReviewStatus[]; flagged: boolean | null };
  onFilterChange: (filters: { status: ReviewStatus[]; flagged: boolean | null }) => void;
}

const STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'edited', label: 'Edited' },
  { value: 'regenerated', label: 'Regenerated' },
  { value: 'flagged', label: 'Flagged' },
];

export function ReviewQueueList({
  cards,
  reviews,
  selectedIds,
  onToggleSelect,
  onSelectCard,
  filters,
  onFilterChange,
}: ReviewQueueListProps) {
  const toggleStatusFilter = (status: ReviewStatus) => {
    const current = filters.status;
    const next = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFilterChange({ ...filters, status: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => toggleStatusFilter(value)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              filters.status.includes(value)
                ? 'bg-brand text-white'
                : 'bg-bg-overlay text-foreground-muted hover:bg-bg-elevated'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() =>
            onFilterChange({
              flagged: filters.flagged === true ? null : true,
              status: filters.status,
            })
          }
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            filters.flagged === true
              ? 'bg-semantic-error/10 text-semantic-error'
              : 'bg-bg-overlay text-foreground-muted hover:bg-bg-elevated'
          }`}
        >
          Flagged
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="py-8 text-center text-sm text-foreground-muted">
          No cards match the selected filters.
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map((card) => {
            const review = reviews.get(card.id);
            const selected = selectedIds.has(card.id);
            return (
              <div
                key={card.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  selected
                    ? 'border-brand bg-brand/5'
                    : 'border-border-default bg-bg-base hover:bg-bg-elevated'
                }`}
                onClick={() => onSelectCard(card.id)}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleSelect(card.id);
                  }}
                  className="h-4 w-4 rounded border-border-default"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {card.question}
                  </div>
                  <div className="flex items-center gap-2">
                    {review && (
                      <>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          review.status === 'approved' ? 'bg-semantic-success/10 text-semantic-success' :
                          review.status === 'rejected' ? 'bg-semantic-error/10 text-semantic-error' :
                          review.status === 'edited' ? 'bg-brand/10 text-brand' :
                          review.status === 'regenerated' ? 'bg-semantic-warning/10 text-semantic-warning' :
                          review.flagged ? 'bg-semantic-error/10 text-semantic-error' :
                          'bg-bg-overlay text-foreground-muted'
                        }`}>
                          {review.status === 'pending' && !review.flagged ? 'Pending' :
                           review.status === 'approved' ? 'Approved' :
                           review.status === 'rejected' ? 'Rejected' :
                           review.status === 'edited' ? 'Edited' :
                           review.status === 'regenerated' ? 'Regenerated' :
                           review.flagged ? 'Flagged' : 'Pending'}
                        </span>
                        {review.score && (
                          <span className={`text-xs font-medium ${
                            review.score.overall >= 0.8 ? 'text-semantic-success' :
                            review.score.overall >= 0.6 ? 'text-semantic-warning' :
                            'text-semantic-error'
                          }`}>
                            {Math.round(review.score.overall * 100)}%
                          </span>
                        )}
                      </>
                    )}
                    <span className="text-xs text-foreground-muted">{card.cardType}</span>
                    <span className="text-xs text-foreground-muted">{card.bloomLevel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
