import { api } from '@/lib/api';
import type { ApiResponse, SourceDocumentDto } from '@recallai/shared';
import type { DocumentFilters, DocumentListMeta } from '../types';

export interface CreateDocumentPayload {
  originalName: string;
  storageKey: string;
  fileSizeBytes: number;
  contentHash?: string;
}

export const documentService = {
  async list(
    filters: DocumentFilters,
  ): Promise<{ data: SourceDocumentDto[]; meta: DocumentListMeta }> {
    const params: Record<string, unknown> = {
      page: filters.page,
      perPage: filters.perPage,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.sort ? { sort: filters.sort } : {}),
      ...(filters.order ? { order: filters.order } : {}),
    };
    const res = await api.get<ApiResponse<SourceDocumentDto[]>>(
      '/documents',
      params,
    );
    return {
      data: res.data,
      meta: {
        page: res.meta?.page ?? 1,
        perPage: res.meta?.perPage ?? 20,
        total: res.meta?.total ?? 0,
        totalPages: res.meta?.totalPages ?? 0,
      },
    };
  },

  async get(id: string): Promise<SourceDocumentDto> {
    const res = await api.get<ApiResponse<SourceDocumentDto>>(
      `/documents/${id}`,
    );
    return res.data;
  },

  async rename(id: string, title: string): Promise<SourceDocumentDto> {
    const res = await api.patch<ApiResponse<SourceDocumentDto>>(
      `/documents/${id}`,
      { title },
    );
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  async create(
    payload: CreateDocumentPayload,
  ): Promise<SourceDocumentDto> {
    const res = await api.post<ApiResponse<SourceDocumentDto>>(
      '/documents',
      payload,
    );
    return res.data;
  },

  async getUploadUrl(
    filename: string,
    fileSize: number,
    mimeType: string,
  ): Promise<{ uploadUrl: string; storageKey: string }> {
    const res = await api.post<{
      uploadUrl: string;
      storageKey: string;
    }>('/documents/upload-url', {
      originalName: filename,
      fileSizeBytes: fileSize,
      mimeType,
    });
    return res;
  },

  async uploadFile(
    uploadUrl: string,
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.onabort = () => reject(new Error('Upload cancelled'));

      xhr.send(file);
    });
  },
};
