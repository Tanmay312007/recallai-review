import type { ProcessingStage } from '../types';
import { PROCESSING_STAGE_LABELS, PROCESSING_STAGE_ORDER, getStageIndex, isTerminal } from '../types';

interface ProcessingProgressProps {
  stage: ProcessingStage;
  progress: number;
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
  showActions?: boolean;
}

export function ProcessingProgress({
  stage,
  progress,
  error,
  onCancel,
  onRetry,
  showActions = true,
}: ProcessingProgressProps) {
  const currentIdx = getStageIndex(stage);
  const terminal = isTerminal(stage);
  const isFailed = stage === 'FAILED';
  const isCanceled = stage === 'CANCELED';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {PROCESSING_STAGE_LABELS[stage]}
          </span>
          <span className="text-xs text-foreground-muted">{progress}%</span>
        </div>

        <div
          className="h-2 w-full overflow-hidden rounded-full bg-bg-overlay"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all ${
              isFailed
                ? 'bg-semantic-error'
                : isCanceled
                  ? 'bg-foreground-disabled'
                  : terminal
                    ? 'bg-semantic-success'
                    : 'bg-brand'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PROCESSING_STAGE_ORDER.map((s) => {
          const idx = getStageIndex(s);
          const isActive = s === stage;
          const isDone = !terminal && idx < currentIdx;

          return (
            <span
              key={s}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isActive && !isFailed && !isCanceled
                  ? 'bg-brand text-white'
                  : isDone
                    ? 'bg-semantic-success/10 text-semantic-success'
                    : isFailed && isActive
                      ? 'bg-semantic-error/10 text-semantic-error'
                      : isCanceled && isActive
                        ? 'bg-bg-overlay text-foreground-disabled'
                        : 'bg-bg-overlay text-foreground-muted'
              }`}
            >
              {PROCESSING_STAGE_LABELS[s]}
            </span>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-semantic-error">{error}</p>
      )}

      {showActions && (
        <div className="flex gap-2">
          {!terminal && onCancel && (
            <button
              onClick={onCancel}
              className="rounded-lg border border-bg-overlay px-3 py-1.5 text-xs font-medium text-foreground-muted hover:bg-bg-overlay"
            >
              Cancel
            </button>
          )}
          {isFailed && onRetry && (
            <button
              onClick={onRetry}
              className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
