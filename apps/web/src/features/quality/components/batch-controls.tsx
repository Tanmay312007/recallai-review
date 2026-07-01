import type { BatchSelection } from '../types';

interface BatchControlsProps {
  selection: BatchSelection;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onApproveAll: () => void;
  onRejectAll: () => void;
  disabled?: boolean;
}

export function BatchControls({
  selection,
  totalCount,
  onSelectAll,
  onClearSelection,
  onApproveAll,
  onRejectAll,
  disabled,
}: BatchControlsProps) {
  const count = selection.cardIds.size;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border-default bg-bg-base p-3">
      <div className="flex items-center gap-3">
        {count > 0 ? (
          <span className="text-sm font-medium text-foreground">
            {count} of {totalCount} selected
          </span>
        ) : (
          <span className="text-sm text-foreground-muted">
            Select cards to batch review
          </span>
        )}
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            disabled={disabled}
            className="rounded-md bg-bg-overlay px-3 py-1 text-xs font-medium text-foreground-muted hover:bg-bg-elevated disabled:opacity-50"
          >
            Select All
          </button>
          {count > 0 && (
            <button
              onClick={onClearSelection}
              disabled={disabled}
              className="rounded-md bg-bg-overlay px-3 py-1 text-xs font-medium text-foreground-muted hover:bg-bg-elevated disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {count > 0 && (
        <div className="flex gap-2">
          <button
            onClick={onApproveAll}
            disabled={disabled}
            className="rounded-md bg-semantic-success/10 px-4 py-1 text-xs font-medium text-semantic-success hover:bg-semantic-success/20 disabled:opacity-50"
          >
            Approve All
          </button>
          <button
            onClick={onRejectAll}
            disabled={disabled}
            className="rounded-md bg-semantic-error/10 px-4 py-1 text-xs font-medium text-semantic-error hover:bg-semantic-error/20 disabled:opacity-50"
          >
            Reject All
          </button>
        </div>
      )}
    </div>
  );
}
