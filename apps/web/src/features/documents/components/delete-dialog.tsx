'use client';

import type { SourceDocumentDto } from '@recallai/shared';

interface DeleteDialogProps {
  document: SourceDocumentDto;
  onConfirm: (id: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteDialog({
  document,
  onConfirm,
  onCancel,
  loading,
}: DeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !loading) onCancel();
      }}
    >
      <div
        className="mx-4 w-full max-w-md rounded-xl bg-background-elevated p-6 shadow-xl"
        role="alertdialog"
        aria-modal="true"
        aria-label="Delete document"
      >
        <h2 className="text-lg font-semibold text-foreground">
          Delete document
        </h2>
        <p className="mt-2 text-sm text-foreground-secondary">
          Are you sure you want to delete &ldquo;{document.title}&rdquo;?
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-bg-overlay px-4 py-2 text-sm font-medium text-foreground hover:bg-bg-overlay disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(document.id)}
            disabled={loading}
            className="rounded-lg bg-semantic-error px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
