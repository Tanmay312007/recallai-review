'use client';

import { useDocumentStore } from '../store/document-store';
import type { UploadingFile } from '../types';

interface UseUploadReturn {
  files: UploadingFile[];
  errors: string[];
  addFiles: (incoming: File[]) => void;
  clearErrors: () => void;
  uploadFile: (item: UploadingFile) => Promise<void>;
  uploadAll: () => Promise<void>;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  removeFile: (id: string) => void;
  reset: () => void;
}

export function useUpload(): UseUploadReturn {
  const uploadQueue = useDocumentStore((s) => s.uploadQueue);
  const uploadErrors = useDocumentStore((s) => s.uploadErrors);
  const addFiles = useDocumentStore((s) => s.addFiles);
  const clearUploadErrors = useDocumentStore((s) => s.clearUploadErrors);
  const uploadAll = useDocumentStore((s) => s.uploadAll);
  const cancelUpload = useDocumentStore((s) => s.cancelUpload);
  const retryUpload = useDocumentStore((s) => s.retryUpload);
  const removeFile = useDocumentStore((s) => s.removeFile);
  const resetUpload = useDocumentStore((s) => s.resetUpload);

  return {
    files: uploadQueue,
    errors: uploadErrors,
    addFiles,
    clearErrors: clearUploadErrors,
    uploadFile: async () => {},
    uploadAll,
    cancelUpload,
    retryUpload,
    removeFile,
    reset: resetUpload,
  };
}
