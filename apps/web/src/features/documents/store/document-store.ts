import { create } from 'zustand';
import type { SourceDocumentDto } from '@recallai/shared';
import { documentService } from '../services/document-service';
import { validateFile } from '../utilities/validation';
import type {
  DocumentFilters,
  DocumentListMeta,
  UploadingFile,
} from '../types';

interface DocumentState {
  documents: SourceDocumentDto[];
  meta: DocumentListMeta;
  filters: DocumentFilters;
  loading: boolean;
  error: string | null;

  currentDocument: SourceDocumentDto | null;
  currentDocumentLoading: boolean;
  currentDocumentError: string | null;

  uploadQueue: UploadingFile[];
  uploadErrors: string[];

  fetchDocuments: () => Promise<void>;
  setSearch: (search: string) => void;
  setSort: (sort: DocumentFilters['sort']) => void;
  setOrder: (order: DocumentFilters['order']) => void;
  setPage: (page: number) => void;

  fetchDocument: (id: string) => Promise<void>;

  addFiles: (incoming: File[]) => void;
  uploadAll: () => Promise<void>;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  removeFile: (id: string) => void;
  clearUploadErrors: () => void;
  resetUpload: () => void;

  renameDocument: (id: string, title: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

let abortRefs = new Map<string, () => void>();

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  meta: { page: 1, perPage: 20, total: 0, totalPages: 0 },
  filters: {
    search: '',
    sort: 'createdAt',
    order: 'desc',
    page: 1,
    perPage: 20,
  },
  loading: true,
  error: null,

  currentDocument: null,
  currentDocumentLoading: false,
  currentDocumentError: null,

  uploadQueue: [],
  uploadErrors: [],

  fetchDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const result = await documentService.list(filters);
      set({ documents: result.data, meta: result.meta, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load documents';
      set({ error: message, loading: false });
    }
  },

  setSearch: (search) => {
    const { filters } = get();
    set({ filters: { ...filters, search, page: 1 } });
  },

  setSort: (sort) => {
    const { filters } = get();
    set({ filters: { ...filters, sort, page: 1 } });
  },

  setOrder: (order) => {
    const { filters } = get();
    set({ filters: { ...filters, order, page: 1 } });
  },

  setPage: (page) => {
    const { filters } = get();
    set({ filters: { ...filters, page } });
  },

  fetchDocument: async (id: string) => {
    set({ currentDocumentLoading: true, currentDocumentError: null });
    try {
      const doc = await documentService.get(id);
      set({ currentDocument: doc, currentDocumentLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load document';
      set({ currentDocumentError: message, currentDocumentLoading: false });
    }
  },

  addFiles: (incoming: File[]) => {
    const validationErrors: string[] = [];
    const valid: UploadingFile[] = [];

    for (const file of incoming) {
      const err = validateFile(file);
      if (err) {
        validationErrors.push(err.message);
      } else {
        valid.push({
          id: crypto.randomUUID(),
          file,
          progress: 0,
          status: 'pending',
        });
      }
    }

    if (validationErrors.length > 0) {
      const { uploadErrors } = get();
      set({ uploadErrors: [...uploadErrors, ...validationErrors] });
    }

    if (valid.length > 0) {
      const { uploadQueue } = get();
      set({ uploadQueue: [...uploadQueue, ...valid] });
    }
  },

  uploadAll: async () => {
    const { uploadQueue } = get();
    const pending = uploadQueue.filter((f) => f.status === 'pending');

    await Promise.all(
      pending.map(async (item) => {
        set((state) => ({
          uploadQueue: state.uploadQueue.map((f) =>
            f.id === item.id ? { ...f, status: 'uploading' as const } : f,
          ),
        }));

        try {
          const { uploadUrl, storageKey } =
            await documentService.getUploadUrl(
              item.file.name,
              item.file.size,
              item.file.type,
            );

          abortRefs.set(item.id, () => {});

          await documentService.uploadFile(uploadUrl, item.file, (pct) => {
            set((state) => ({
              uploadQueue: state.uploadQueue.map((f) =>
                f.id === item.id ? { ...f, progress: pct } : f,
              ),
            }));
          });

          await documentService.create({
            originalName: item.file.name,
            storageKey,
            fileSizeBytes: item.file.size,
          });

          set((state) => ({
            uploadQueue: state.uploadQueue.map((f) =>
              f.id === item.id
                ? { ...f, status: 'done' as const, progress: 100 }
                : f,
            ),
          }));

          abortRefs.delete(item.id);
          get().fetchDocuments();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Upload failed';
          set((state) => ({
            uploadQueue: state.uploadQueue.map((f) =>
              f.id === item.id
                ? { ...f, status: 'error' as const, error: message }
                : f,
            ),
          }));
          abortRefs.delete(item.id);
        }
      }),
    );
  },

  cancelUpload: (id: string) => {
    const abort = abortRefs.get(id);
    if (abort) {
      abort();
      abortRefs.delete(id);
    }
    set((state) => ({
      uploadQueue: state.uploadQueue.map((f) =>
        f.id === id
          ? { ...f, status: 'error' as const, error: 'Canceled' }
          : f,
      ),
    }));
  },

  retryUpload: (id: string) => {
    const { uploadQueue } = get();
    const item = uploadQueue.find((f) => f.id === id);
    if (!item) return;

    set((state) => ({
      uploadQueue: state.uploadQueue.map((f) =>
        f.id === id
          ? { ...f, status: 'pending' as const, progress: 0, error: undefined }
          : f,
      ),
    }));

    const { uploadAll } = get();
    uploadAll();
  },

  removeFile: (id: string) => {
    abortRefs.delete(id);
    set((state) => ({
      uploadQueue: state.uploadQueue.filter((f) => f.id !== id),
    }));
  },

  clearUploadErrors: () => set({ uploadErrors: [] }),

  resetUpload: () => {
    abortRefs.forEach((abort) => abort());
    abortRefs.clear();
    set({ uploadQueue: [], uploadErrors: [] });
  },

  renameDocument: async (id: string, title: string) => {
    await documentService.rename(id, title);
    get().fetchDocuments();
  },

  deleteDocument: async (id: string) => {
    await documentService.delete(id);
    get().fetchDocuments();
  },
}));
