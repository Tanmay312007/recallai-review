'use client';

import { useEffect } from 'react';
import { useDocumentStore } from '@/features/documents/store/document-store';
import { KnowledgeWorkspaceLayout } from '@/features/knowledge-workspace';
import { useKnowledgeWorkspaceStore } from '@/features/knowledge-workspace';

export default function KnowledgeDocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const doc = useDocumentStore((s) => s.currentDocument);
  const loading = useDocumentStore((s) => s.currentDocumentLoading);
  const error = useDocumentStore((s) => s.currentDocumentError);
  const fetchDocument = useDocumentStore((s) => s.fetchDocument);
  const openTab = useKnowledgeWorkspaceStore((s) => s.openTab);
  const tabs = useKnowledgeWorkspaceStore((s) => s.tabs);

  useEffect(() => {
    fetchDocument(params.id);
  }, [params.id, fetchDocument]);

  useEffect(() => {
    if (doc && !tabs.find((t) => t.id === doc.id)) {
      openTab({ id: doc.id, title: doc.title, type: 'document' });
    }
  }, [doc, params.id, openTab, tabs]);

  if (loading) {
    return (
      <KnowledgeWorkspaceLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="space-y-4 w-full max-w-lg px-8">
            <div className="h-6 w-48 animate-pulse rounded bg-background-overlay" />
            <div className="h-4 w-64 animate-pulse rounded bg-background-overlay" />
            <div className="h-64 animate-pulse rounded-lg bg-background-overlay" />
          </div>
        </div>
      </KnowledgeWorkspaceLayout>
    );
  }

  if (error) {
    return (
      <KnowledgeWorkspaceLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-semantic-error/10">
              <svg className="h-7 w-7 text-semantic-error" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v4M12 16v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-title text-foreground mb-1">Failed to load document</h2>
            <p className="text-sm text-foreground-muted">{error}</p>
          </div>
        </div>
      </KnowledgeWorkspaceLayout>
    );
  }

  if (!doc) return null;

  return (
    <KnowledgeWorkspaceLayout
      activeDocument={{
        id: doc.id,
        title: doc.title,
        content: `Type: ${doc.type}\nStatus: ${doc.status}\nCreated: ${new Date(doc.createdAt).toLocaleString()}\n\nThis document is loaded in the Knowledge Workspace. AI analysis, notes, and related knowledge panels are available on the right.`,
      }}
    />
  );
}
