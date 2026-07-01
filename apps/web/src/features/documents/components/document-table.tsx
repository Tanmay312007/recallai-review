'use client';

import Link from 'next/link';
import type { SourceDocumentDto } from '@lumora/shared';
import type { DocumentFilters, DocumentListMeta } from '../types';
import { STATUS_OPTIONS, TYPE_OPTIONS } from '../types';
import { formatFileSize } from '../utilities/validation';
import { DocumentStatusBadge } from './document-status-badge';
import { DocumentActions } from './document-actions';
import { DocumentEmptyState } from './document-empty-state';

interface DocumentTableProps {
  documents: SourceDocumentDto[];
  meta: DocumentListMeta;
  filters: DocumentFilters;
  loading: boolean;
  onSearch: (search: string) => void;
  onStatusFilter: (status: string | undefined) => void;
  onTypeFilter: (type: string | undefined) => void;
  onSort: (sort: DocumentFilters['sort']) => void;
  onOrder: (order: DocumentFilters['order']) => void;
  onPage: (page: number) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onViewMetadata: (doc: SourceDocumentDto) => void;
}

export function DocumentTable({
  documents,
  meta,
  filters,
  loading,
  onSearch,
  onStatusFilter,
  onTypeFilter,
  onSort,
  onOrder,
  onPage,
  onRename,
  onDelete,
  onViewMetadata,
}: DocumentTableProps) {
  const toggleSort = (field: DocumentFilters['sort']) => {
    if (filters.sort === field) {
      onOrder(filters.order === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field);
      onOrder('desc');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const sortArrow = (field: DocumentFilters['sort']) => {
    if (filters.sort !== field) return '';
    return filters.order === 'asc' ? ' \u25B2' : ' \u25BC';
  };

  const hasSearch = Boolean(filters.search);

  if (!loading && documents.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={filters.search ?? ''}
            onChange={onSearch}
            onKeyDown={handleSearchKeyDown}
          />
          <FilterSelect
            value={filters.status ?? ''}
            onChange={onStatusFilter}
            options={STATUS_OPTIONS}
            label="Status"
          />
          <FilterSelect
            value={filters.type ?? ''}
            onChange={onTypeFilter}
            options={TYPE_OPTIONS}
            label="Type"
          />
        </div>
        <DocumentEmptyState hasSearch={hasSearch || Boolean(filters.status || filters.type)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={filters.search ?? ''}
          onChange={onSearch}
          onKeyDown={handleSearchKeyDown}
        />
        <FilterSelect
          value={filters.status ?? ''}
          onChange={onStatusFilter}
          options={STATUS_OPTIONS}
          label="Status"
        />
        <FilterSelect
          value={filters.type ?? ''}
          onChange={onTypeFilter}
          options={TYPE_OPTIONS}
          label="Type"
        />
      </div>

      <div className="-mx-4 overflow-x-auto sm:mx-0 sm:rounded-lg sm:border sm:border-bg-overlay">
        <table className="min-w-full divide-y divide-bg-overlay">
          <thead className="bg-background-surface">
            <tr>
              <SortableHeader
                label="Name"
                field="title"
                currentSort={filters.sort}
                sortArrow={sortArrow('title')}
                onClick={() => toggleSort('title')}
                order={filters.order}
              />
              <SortableHeader
                label="Status"
                field="status"
                currentSort={filters.sort}
                sortArrow={sortArrow('status')}
                onClick={() => toggleSort('status')}
                order={filters.order}
              />
              <SortableHeader
                label="Size"
                field="fileSizeBytes"
                currentSort={filters.sort}
                sortArrow={sortArrow('fileSizeBytes')}
                onClick={() => toggleSort('fileSizeBytes')}
                order={filters.order}
              />
              <SortableHeader
                label="Uploaded"
                field="createdAt"
                currentSort={filters.sort}
                sortArrow={sortArrow('createdAt')}
                onClick={() => toggleSort('createdAt')}
                order={filters.order}
              />
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-overlay bg-background-elevated">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-bg-surface">
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="flex items-center gap-2 text-foreground hover:text-brand"
                  >
                    <FileIcon type={doc.type} />
                    <span className="truncate max-w-[180px] sm:max-w-[240px]">
                      {doc.title}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <DocumentStatusBadge
                    status={backendToClientStatus(doc.status)}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-foreground-muted">
                  {doc.fileSizeBytes != null
                    ? formatFileSize(doc.fileSizeBytes)
                    : '\u2014'}
                </td>
                <td className="px-4 py-3 text-sm text-foreground-muted">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <DocumentActions
                    document={doc}
                    onRename={onRename}
                    onDelete={onDelete}
                    onViewMetadata={onViewMetadata}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPage={onPage} />
    </div>
  );
}

function SearchBar({
  value,
  onChange,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative flex-1">
      <label htmlFor="doc-search" className="sr-only">
        Search documents
      </label>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        id="doc-search"
        type="text"
        placeholder="Search documents..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full rounded-lg border border-bg-overlay bg-background-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string | undefined) => void;
  options: readonly { value: string; label: string }[];
  label: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value || undefined)}
      aria-label={label}
      className="rounded-lg border border-bg-overlay bg-background-surface px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function SortableHeader({
  label,
  field,
  currentSort,
  sortArrow,
  onClick,
  order,
}: {
  label: string;
  field: DocumentFilters['sort'];
  currentSort?: DocumentFilters['sort'];
  sortArrow: string;
  onClick: () => void;
  order?: DocumentFilters['order'];
}) {
  const isActive = currentSort === field;
  return (
    <th
      scope="col"
      className={`cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
        isActive ? 'text-brand' : 'text-foreground-muted'
      }`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="columnheader"
      aria-sort={
        isActive
          ? order === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
    >
      {label}
      {sortArrow}
    </th>
  );
}

function Pagination({
  meta,
  onPage,
}: {
  meta: DocumentListMeta;
  onPage: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= meta.totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between"
      aria-label="Pagination"
    >
      <p className="text-sm text-foreground-muted">
        Page {meta.page} of {meta.totalPages} ({meta.total} total)
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPage(meta.page - 1)}
          disabled={meta.page <= 1}
          aria-label="Previous page"
          className="rounded border border-bg-overlay px-3 py-1 text-sm text-foreground hover:bg-bg-overlay disabled:opacity-50"
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            aria-current={p === meta.page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={`rounded border px-3 py-1 text-sm ${
              p === meta.page
                ? 'border-brand bg-brand text-white'
                : 'border-bg-overlay text-foreground hover:bg-bg-overlay'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPage(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
          aria-label="Next page"
          className="rounded border border-bg-overlay px-3 py-1 text-sm text-foreground hover:bg-bg-overlay disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </nav>
  );
}

function FileIcon({ type }: { type: string }) {
  const color =
    type === 'PDF'
      ? 'text-semantic-error'
      : type === 'YOUTUBE'
        ? 'text-semantic-info'
        : 'text-foreground-muted';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-4 w-4 shrink-0 ${color}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function backendToClientStatus(
  backend: SourceDocumentDto['status'],
): import('../types').DocumentStatus {
  const map: Record<string, import('../types').DocumentStatus> = {
    PENDING: 'QUEUED',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  };
  return map[backend] ?? 'UPLOADED';
}
