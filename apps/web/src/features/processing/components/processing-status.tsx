import type { NormalizedDocument, ProcessingJob } from '../types';
import { ProcessingProgress } from './processing-progress';

interface ProcessingStatusProps {
  job: ProcessingJob | undefined;
  onStart: () => void;
  onCancel: () => void;
  onRetry: () => void;
  hasStarted: boolean;
}

export function ProcessingStatus({
  job,
  onStart,
  onCancel,
  onRetry,
  hasStarted,
}: ProcessingStatusProps) {
  if (!hasStarted) {
    return (
      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Document Processing
            </h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Extract metadata and prepare content structure.
            </p>
          </div>
          <button
            onClick={onStart}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Start processing
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-bg-overlay" />
          <div className="h-2 w-full rounded bg-bg-overlay" />
        </div>
      </div>
    );
  }

  const isCompleted = job.stage === 'COMPLETED';

  return (
    <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Document Processing
          </h3>
          {isCompleted && (
            <span className="rounded-full bg-semantic-success/10 px-2.5 py-0.5 text-xs font-medium text-semantic-success">
              Complete
            </span>
          )}
        </div>

        <ProcessingProgress
          stage={job.stage}
          progress={job.progress}
          error={job.error}
          onCancel={onCancel}
          onRetry={onRetry}
        />

        {isCompleted && job.normalizedDocument && (
          <ProcessingSummary metadata={job.normalizedDocument.metadata} />
        )}
      </div>
    </div>
  );
}

function ProcessingSummary({
  metadata,
}: {
  metadata: NormalizedDocument['metadata'];
}) {
  const rows: [string, string][] = [
    ['Word count', String(metadata.wordCount)],
    ['Est. reading time', `${metadata.estimatedReadingTimeMinutes} min`],
    ['Pages', metadata.pageCount != null ? String(metadata.pageCount) : '\u2014'],
    ['Language', metadata.language.toUpperCase()],
  ];

  return (
    <div className="rounded-lg border border-bg-overlay bg-background-surface p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
        Document summary
      </h4>
      <dl className="mt-2 divide-y divide-bg-overlay">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-2">
            <dt className="text-sm text-foreground-muted">{label}</dt>
            <dd className="text-sm font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
