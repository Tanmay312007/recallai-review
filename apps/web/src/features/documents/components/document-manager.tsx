'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SourceDocumentDto } from '@lumora/shared';
import { useDocuments } from '../hooks/use-documents';
import { useUpload } from '../hooks/use-upload';
import { useDocumentStore } from '../store/document-store';
import { UploadZone } from './upload-zone';
import { DocumentTable } from './document-table';
import { RenameDialog } from './rename-dialog';
import { DeleteDialog } from './delete-dialog';
import { MetadataPanel } from './metadata-panel';
import { SkeletonTable } from './skeleton-table';

export function DocumentManager() {
  const {
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
    refresh: _refresh,
  } = useDocuments();

  const {
    files,
    errors: uploadErrors,
    addFiles,
    clearErrors,
    cancelUpload,
    retryUpload,
    removeFile,
    uploadAll,
  } = useUpload();

  const renameDocument = useDocumentStore((s) => s.renameDocument);
  const deleteDocument = useDocumentStore((s) => s.deleteDocument);

  const [showUpload, setShowUpload] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] =
    useState<SourceDocumentDto | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<SourceDocumentDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [metadataTarget, setMetadataTarget] =
    useState<SourceDocumentDto | null>(null);

  const doneCount = files.filter((f) => f.status === 'done').length;
  const hadSuccess = doneCount > 0;

  useEffect(() => {
    if (!hadSuccess) return;
    setSuccessMsg(`${doneCount} file${doneCount > 1 ? 's' : ''} uploaded successfully`);
    const timer = setTimeout(() => setSuccessMsg(null), 5000);
    return () => { clearTimeout(timer); };
  }, [doneCount, hadSuccess]);

  const handleRename = useCallback(
    async (id: string, title: string) => {
      try {
        await renameDocument(id, title);
        setRenameTarget(null);
      } catch {
        // handled by store
      }
    },
    [renameDocument],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeleting(true);
      try {
        await deleteDocument(id);
        setDeleteTarget(null);
      } catch {
        // handled by store
      } finally {
        setDeleting(false);
      }
    },
    [deleteDocument],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Documents</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Upload and manage your source documents
          </p>
        </div>
        <button
          onClick={() => setShowUpload((p) => !p)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          {showUpload ? 'View documents' : 'Upload'}
        </button>
      </div>

      {successMsg && (
        <div
          role="alert"
          className="rounded-lg border border-semantic-success bg-semantic-success/10 px-4 py-3"
        >
          <p className="text-sm font-medium text-semantic-success">
            {successMsg}
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-semantic-error bg-background-surface px-4 py-3"
        >
          <p className="text-sm text-semantic-error">{error}</p>
        </div>
      )}

      {showUpload && (
        <UploadZone
          files={files}
          errors={uploadErrors}
          onFilesSelected={addFiles}
          onCancelUpload={cancelUpload}
          onRetryUpload={retryUpload}
          onRemoveFile={removeFile}
          onUploadAll={uploadAll}
          onClearErrors={clearErrors}
        />
      )}

      {loading ? (
        <SkeletonTable />
      ) : (
        <DocumentTable
          documents={documents}
          meta={meta}
          filters={filters}
          loading={false}
          onSearch={setSearch}
          onStatusFilter={setStatusFilter}
          onTypeFilter={setTypeFilter}
          onSort={setSort}
          onOrder={setOrder}
          onPage={setPage}
          onRename={(id, _title) => {
            const doc = documents.find((d) => d.id === id);
            if (doc) setRenameTarget(doc);
          }}
          onDelete={(id) => {
            const doc = documents.find((d) => d.id === id);
            if (doc) setDeleteTarget(doc);
          }}
          onViewMetadata={(doc) => setMetadataTarget(doc)}
        />
      )}

      {renameTarget && (
        <RenameDialog
          document={renameTarget}
          onConfirm={handleRename}
          onCancel={() => setRenameTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          document={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {metadataTarget && (
        <MetadataPanel
          document={metadataTarget}
          onClose={() => setMetadataTarget(null)}
        />
      )}
    </div>
  );
}
