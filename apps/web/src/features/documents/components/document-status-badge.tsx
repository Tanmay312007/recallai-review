import type { DocumentStatus } from '../types';
import { DOCUMENT_STATUS_LABELS } from '../types';

const statusStyles: Record<DocumentStatus, string> = {
  UPLOADING: 'bg-brand-subtle text-brand',
  UPLOADED: 'bg-bg-overlay text-foreground-secondary',
  QUEUED: 'bg-bg-overlay text-foreground-secondary',
  PROCESSING: 'bg-brand-subtle text-brand',
  COMPLETED: 'bg-semantic-success/10 text-semantic-success',
  FAILED: 'bg-semantic-error/10 text-semantic-error',
  CANCELED: 'bg-bg-overlay text-foreground-disabled',
  RETRYING: 'bg-semantic-warning/10 text-semantic-warning',
};

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {DOCUMENT_STATUS_LABELS[status]}
    </span>
  );
}
