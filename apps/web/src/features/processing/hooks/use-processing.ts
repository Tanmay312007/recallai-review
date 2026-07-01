'use client';

import { useCallback } from 'react';
import { useProcessingStore } from '../store/processing-store';
import type { ProcessingJob } from '../types';

interface UseProcessingReturn {
  job: ProcessingJob | undefined;
  startProcessing: (
    documentId: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
  ) => Promise<void>;
  cancelProcessing: (documentId: string) => void;
  retryProcessing: (
    documentId: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
  ) => Promise<void>;
  isProcessing: boolean;
}

export function useProcessing(documentId: string): UseProcessingReturn {
  const job = useProcessingStore((s) => s.jobs[documentId]);
  const startProcessing = useProcessingStore((s) => s.startProcessing);
  const cancelProcessing = useProcessingStore((s) => s.cancelProcessing);
  const retryProcessing = useProcessingStore((s) => s.retryProcessing);

  const isProcessing =
    job !== undefined &&
    job.stage !== 'COMPLETED' &&
    job.stage !== 'FAILED' &&
    job.stage !== 'CANCELED';

  return {
    job,
    startProcessing: useCallback(
      (id, name, size, mime) => startProcessing(id, name, size, mime),
      [startProcessing],
    ),
    cancelProcessing: useCallback(
      (id) => cancelProcessing(id),
      [cancelProcessing],
    ),
    retryProcessing: useCallback(
      (id, name, size, mime) => retryProcessing(id, name, size, mime),
      [retryProcessing],
    ),
    isProcessing,
  };
}
