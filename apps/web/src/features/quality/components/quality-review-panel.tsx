import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQualityStore } from '../store/quality-store';
import { QualityScoreCard } from './quality-score-card';
import { ReviewActions } from './review-actions';
import { ReviewQueueList } from './review-queue-list';
import { BatchControls } from './batch-controls';
import { ReviewNoteInput } from './review-note-input';
import type { ReviewAction } from '../types';

interface QualityReviewPanelProps {
  cards: { id: string; question: string; answer: string }[];
}

export function QualityReviewPanel({ cards }: QualityReviewPanelProps) {
  const {
    reviews,
    selection,
    filters,
    setCards,
    reviewCard,
    toggleSelection,
    selectAll,
    clearSelection,
    approveAll,
    rejectAll,
    setFilters,
    getFilteredCardIds,
    getReviewStats,
  } = useQualityStore();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);
  const selectedCardIdRef = useRef(selectedCardId);
  const pendingActionRef = useRef(pendingAction);
  selectedCardIdRef.current = selectedCardId;
  pendingActionRef.current = pendingAction;

  useEffect(() => {
    setCards(cards as any);
  }, [cards.length]);

  const stats = useMemo(() => getReviewStats(), [reviews]);

  const filteredCardIds = getFilteredCardIds();
  const selectedCard = selectedCardId ? reviews.get(selectedCardId) : null;
  const selectedCardData = selectedCardId
    ? cards.find((c) => c.id === selectedCardId)
    : null;

  const handleAction = useCallback((action: ReviewAction) => {
    if (action === 'edit' || action === 'reject') {
      setPendingAction(action);
      setShowNoteInput(true);
    } else {
      const id = selectedCardIdRef.current;
      if (id) {
        reviewCard(id, action);
        setShowNoteInput(false);
        setPendingAction(null);
      }
    }
  }, [reviewCard]);

  const handleNoteSubmit = useCallback((note: string) => {
    const id = selectedCardIdRef.current;
    const act = pendingActionRef.current;
    if (id && act) {
      reviewCard(id, act, note);
      setShowNoteInput(false);
      setPendingAction(null);
    }
  }, [reviewCard]);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Quality Review</h3>
          <p className="text-sm text-foreground-muted">
            {stats.total} cards · {stats.approvalRate * 100}% approved · Avg quality: {Math.round(stats.avgQuality * 100)}%
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-foreground-muted">
          <span>{stats.pending} pending</span>
          <span>{stats.approved} approved</span>
          <span>{stats.rejected} rejected</span>
          <span>{stats.flagged} flagged</span>
        </div>
      </div>

      <BatchControls
        selection={selection}
        totalCount={cards.length}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onApproveAll={() => approveAll()}
        onRejectAll={() => rejectAll()}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReviewQueueList
            cards={cards.filter((c) => filteredCardIds.includes(c.id)) as any}
            reviews={reviews}
            selectedIds={selection.cardIds}
            onToggleSelect={toggleSelection}
            onSelectCard={setSelectedCardId}
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>

        {selectedCard && selectedCardData && (
          <div className="space-y-4">
            {selectedCard.score && (
              <QualityScoreCard score={selectedCard.score} />
            )}

            <div className="rounded-lg border border-border-default bg-bg-base p-4">
              <h4 className="mb-2 text-sm font-medium text-foreground">Card</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-foreground-muted">Q: </span>
                  <span className="text-foreground">{selectedCardData.question}</span>
                </div>
                <div>
                  <span className="text-foreground-muted">A: </span>
                  <span className="text-foreground">{selectedCardData.answer}</span>
                </div>
              </div>
            </div>

            {selectedCard.duplicates.length > 0 && (
              <div className="rounded-lg border border-border-default bg-bg-base p-4">
                <h4 className="mb-2 text-sm font-medium text-semantic-warning">
                  Duplicates ({selectedCard.duplicates.length})
                </h4>
                <ul className="space-y-1">
                  {selectedCard.duplicates.map((d, i) => (
                    <li key={i} className="text-xs text-foreground-muted">
                      {d.type} match: {d.matchQuestion} ({Math.round(d.similarity * 100)}%)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-lg border border-border-default bg-bg-base p-4">
              <ReviewActions
                status={selectedCard.status}
                flagged={selectedCard.flagged}
                onAction={handleAction}
              />
              {showNoteInput && (
                <div className="mt-3 border-t border-border-default pt-3">
                  <ReviewNoteInput
                    onSubmit={handleNoteSubmit}
                    onCancel={() => {
                      setShowNoteInput(false);
                      setPendingAction(null);
                    }}
                  />
                </div>
              )}
            </div>

            {selectedCard.notes.length > 0 && (
              <div className="rounded-lg border border-border-default bg-bg-base p-4">
                <h4 className="mb-2 text-sm font-medium text-foreground">History</h4>
                <div className="space-y-2">
                  {selectedCard.notes.map((note) => (
                    <div key={note.id} className="text-xs text-foreground-muted">
                      <span className="font-medium text-foreground">{note.action}</span>
                      {' — '}
                      {new Date(note.timestamp).toLocaleString()}
                      {note.note && <p className="mt-0.5">{note.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
