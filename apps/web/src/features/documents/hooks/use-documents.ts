'use client';

import { useEffect } from 'react';
import type { SourceDocumentDto } from '@lumora/shared';
import { useDocumentStore } from '../store/document-store';
import type { DocumentFilters, DocumentListMeta } from '../types';

interface UseDocumentsReturn {
  documents: SourceDocumentDto[];
  meta: DocumentListMeta;
  filters: DocumentFilters;
  loading: boolean;
  error: string | null;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string | undefined) => void;
  setTypeFilter: (type: string | undefined) => void;
  setSort: (sort: DocumentFilters['sort']) => void;
  setOrder: (order: DocumentFilters['order']) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export function useDocuments(): UseDocumentsReturn {
  const documents = useDocumentStore((s) => s.documents);
  const meta = useDocumentStore((s) => s.meta);
  const filters = useDocumentStore((s) => s.filters);
  const loading = useDocumentStore((s) => s.loading);
  const error = useDocumentStore((s) => s.error);
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments);
  const setSearch = useDocumentStore((s) => s.setSearch);
  const setStatusFilter = useDocumentStore((s) => s.setStatusFilter);
  const setTypeFilter = useDocumentStore((s) => s.setTypeFilter);
  const setSort = useDocumentStore((s) => s.setSort);
  const setOrder = useDocumentStore((s) => s.setOrder);
  const setPage = useDocumentStore((s) => s.setPage);

  useEffect(() => {
    fetchDocuments();
  }, [filters, fetchDocuments]);

  return {
    documents,
    meta,
    filters,
    loading,
    error,
    setSearch,
    setStatusFilter,
    setTypeFilter,
    setSort,
    setOrder,
    setPage,
    refresh: fetchDocuments,
  };
}
