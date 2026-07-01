import { create } from 'zustand';
import type { ProcessingJob } from '../types';
import { processDocument, canProcessFile } from '../services/processing-service';

interface ProcessingState {
  jobs: Record<string, ProcessingJob>;
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
  getJob: (documentId: string) => ProcessingJob | undefined;
}

const cancelTokens = new Map<string, boolean>();

export const useProcessingStore = create<ProcessingState>((set, get) => ({
  jobs: {},

  startProcessing: async (
    documentId,
    fileName,
    fileSize,
    mimeType,
  ) => {
    const extension = fileName.match(/\.([a-z0-9]+)$/i)?.[0]?.toLowerCase() ?? '';
    if (!canProcessFile(extension, mimeType)) {
      set((state) => ({
        jobs: {
          ...state.jobs,
          [documentId]: {
            documentId,
            stage: 'FAILED',
            progress: 0,
            timestamps: { failedAt: new Date().toISOString() },
            error: `Unsupported file type: ${extension}`,
          },
        },
      }));
      return;
    }

    cancelTokens.set(documentId, false);

    const timestamps = { queuedAt: new Date().toISOString() };
    set((state) => ({
      jobs: {
        ...state.jobs,
        [documentId]: {
          documentId,
          stage: 'QUEUED',
          progress: 0,
          timestamps,
        },
      },
    }));

    try {
      const result = await processDocument(
        fileName,
        fileSize,
        mimeType,
        (progress) => {
          if (cancelTokens.get(documentId)) return;

          const ts = { ...get().jobs[documentId]?.timestamps };
          const stageKey = progress.stage.toLowerCase() + 'At' as keyof typeof ts;
          (ts as Record<string, string | undefined>)[stageKey] =
            new Date().toISOString();

          set((state) => ({
            jobs: {
              ...state.jobs,
              [documentId]: {
                ...state.jobs[documentId],
                stage: progress.stage,
                progress: progress.progress,
                timestamps: ts,
              } as ProcessingJob,
            },
          }));
        },
      );

      if (cancelTokens.get(documentId)) {
        set((state) => ({
          jobs: {
            ...state.jobs,
            [documentId]: {
              documentId,
              stage: 'CANCELED',
              progress: 0,
              timestamps: {
                ...state.jobs[documentId]?.timestamps,
                canceledAt: new Date().toISOString(),
              },
            },
          },
        }));
        return;
      }

      if (result.success) {
        set((state) => ({
          jobs: {
            ...state.jobs,
            [documentId]: {
              documentId,
              stage: 'COMPLETED',
              progress: 100,
              timestamps: {
                ...state.jobs[documentId]?.timestamps,
                completedAt: new Date().toISOString(),
              },
              normalizedDocument: result.document,
            },
          },
        }));
      } else {
        set((state) => ({
          jobs: {
            ...state.jobs,
            [documentId]: {
              documentId,
              stage: 'FAILED',
              progress: 0,
              timestamps: {
                ...state.jobs[documentId]?.timestamps,
                failedAt: new Date().toISOString(),
              },
              error: result.error,
            },
          },
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed';
      set((state) => ({
        jobs: {
          ...state.jobs,
          [documentId]: {
            documentId,
            stage: 'FAILED',
            progress: 0,
            timestamps: {
              ...state.jobs[documentId]?.timestamps,
              failedAt: new Date().toISOString(),
            },
            error: message,
          },
        },
      }));
    } finally {
      cancelTokens.delete(documentId);
    }
  },

  cancelProcessing: (documentId) => {
    cancelTokens.set(documentId, true);
  },

  retryProcessing: async (documentId, fileName, fileSize, mimeType) => {
    const state = get();
    await state.startProcessing(documentId, fileName, fileSize, mimeType);
  },

  getJob: (documentId) => {
    return get().jobs[documentId];
  },
}));
