'use client';

import { useCallback, useRef, useState } from 'react';
import type { UploadingFile } from '../types';
import { DOCUMENT_STATUS_LABELS } from '../types';
import { formatFileSize } from '../utilities/validation';

interface UploadZoneProps {
  files: UploadingFile[];
  errors: string[];
  onFilesSelected: (files: File[]) => void;
  onCancelUpload: (id: string) => void;
  onRetryUpload: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onUploadAll: () => void;
  onClearErrors: () => void;
}

export function UploadZone({
  files,
  errors,
  onFilesSelected,
  onCancelUpload,
  onRetryUpload,
  onRemoveFile,
  onUploadAll,
  onClearErrors,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = Array.from(e.dataTransfer.files);
      onFilesSelected(dropped);
    },
    [onFilesSelected],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = Array.from(e.target.files ?? []);
      onFilesSelected(picked);
      if (inputRef.current) inputRef.current.value = '';
    },
    [onFilesSelected],
  );

  const handleDropZoneKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [],
  );

  const hasFiles = files.length > 0;
  const canUpload = files.some((f) => f.status === 'pending');
  const doneCount = files.filter((f) => f.status === 'done').length;

  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-semantic-error bg-background-surface px-4 py-3"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {errors.map((msg, i) => (
                <p key={i} className="text-sm text-semantic-error">
                  {msg}
                </p>
              ))}
            </div>
            <button
              onClick={onClearErrors}
              className="text-sm text-foreground-muted hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {doneCount > 0 && (
        <div
          role="status"
          className="rounded-lg border border-semantic-success bg-semantic-success/10 px-4 py-3"
        >
          <p className="text-sm font-medium text-semantic-success">
            {doneCount} file{doneCount > 1 ? 's' : ''} uploaded
          </p>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleDropZoneKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Upload files. Click or drag and drop to add files."
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragOver
            ? 'border-brand bg-brand-subtle'
            : 'border-bg-overlay hover:border-brand-subtle'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.ppt,.pptx,.txt,.md"
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="space-y-2">
          <div className="text-3xl text-foreground-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="text-sm text-foreground-secondary">
            <span className="font-medium text-brand">Click to upload</span> or
            drag and drop
          </p>
          <p className="text-xs text-foreground-muted">
            PDF, DOCX, PPT, PPTX, TXT, MD &mdash; up to 50 MB
          </p>
        </div>
      </div>

      {hasFiles && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </h3>
            {canUpload && (
              <button
                onClick={onUploadAll}
                className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-hover"
              >
                Upload all
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((item) => (
              <FileRow
                key={item.id}
                item={item}
                onCancel={() => onCancelUpload(item.id)}
                onRetry={() => onRetryUpload(item.id)}
                onRemove={() => onRemoveFile(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FileRow({
  item,
  onCancel,
  onRetry,
  onRemove,
}: {
  item: UploadingFile;
  onCancel: () => void;
  onRetry: () => void;
  onRemove: () => void;
}) {
  const isPending = item.status === 'pending';
  const isUploading = item.status === 'uploading';
  const isDone = item.status === 'done';
  const isError = item.status === 'error';

  return (
    <div className="flex items-center gap-3 rounded-lg border border-bg-overlay bg-background-surface px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {item.file.name}
        </p>
        <p className="text-xs text-foreground-muted">
          {formatFileSize(item.file.size)}
          {isUploading && ` \u2022 ${item.progress}%`}
          {isError && item.error && ` \u2022 ${item.error}`}
        </p>
        {isUploading && (
          <div
            className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-overlay"
            role="progressbar"
            aria-valuenow={item.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {isDone && (
          <span className="text-xs font-medium text-semantic-success">
            {DOCUMENT_STATUS_LABELS.COMPLETED}
          </span>
        )}

        {(isPending || isUploading) && (
          <button
            onClick={onCancel}
            className="rounded px-2 py-1 text-xs text-foreground-muted hover:text-semantic-error"
          >
            Cancel
          </button>
        )}

        {isError && (
          <>
            <button
              onClick={onRetry}
              className="rounded px-2 py-1 text-xs font-medium text-brand hover:text-brand-hover"
            >
              Retry
            </button>
            <button
              onClick={onRemove}
              className="rounded px-2 py-1 text-xs text-foreground-muted hover:text-foreground"
            >
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
}
