import type { ReviewAction, ReviewStatus } from '../types';
import { REVIEW_STATUS_LABELS } from '../types';

interface ReviewActionsProps {
  status: ReviewStatus;
  flagged: boolean;
  onAction: (action: ReviewAction) => void;
  disabled?: boolean;
}

const ACTIONS: { action: ReviewAction; label: string; variant: string }[] = [
  { action: 'approve', label: 'Approve', variant: 'bg-semantic-success/10 text-semantic-success hover:bg-semantic-success/20' },
  { action: 'reject', label: 'Reject', variant: 'bg-semantic-error/10 text-semantic-error hover:bg-semantic-error/20' },
  { action: 'edit', label: 'Edit', variant: 'bg-brand/10 text-brand hover:bg-brand/20' },
  { action: 'regenerate', label: 'Regenerate', variant: 'bg-semantic-warning/10 text-semantic-warning hover:bg-semantic-warning/20' },
];

export function ReviewActions({ status, flagged, onAction, disabled }: ReviewActionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          status === 'approved' ? 'bg-semantic-success/10 text-semantic-success' :
          status === 'rejected' ? 'bg-semantic-error/10 text-semantic-error' :
          status === 'edited' ? 'bg-brand/10 text-brand' :
          status === 'regenerated' ? 'bg-semantic-warning/10 text-semantic-warning' :
          status === 'flagged' ? 'bg-semantic-error/10 text-semantic-error' :
          'bg-bg-overlay text-foreground-muted'
        }`}>
          {REVIEW_STATUS_LABELS[status]}
        </span>
        <button
          onClick={() => onAction(flagged ? 'unflag' : 'flag')}
          disabled={disabled}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            flagged
              ? 'bg-semantic-error/10 text-semantic-error hover:bg-semantic-error/20'
              : 'bg-bg-overlay text-foreground-muted hover:bg-bg-elevated'
          } disabled:opacity-50`}
        >
          {flagged ? 'Unflag' : 'Flag'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(({ action, label, variant }) => (
          <button
            key={action}
            onClick={() => onAction(action)}
            disabled={disabled}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${variant} disabled:opacity-30`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
