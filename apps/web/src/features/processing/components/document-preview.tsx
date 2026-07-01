import type { DocumentPreviewData } from '@recallai/shared';
import type { NormalizedDocument } from '../types';

interface DocumentPreviewProps {
  document: NormalizedDocument;
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
  const firstPage = document.pages[0];
  const previewData: DocumentPreviewData = {
    documentId: document.metadata.fileName,
    textSnippet: extractSnippet(document.pages, 1000),
    firstPageContent: firstPage
      ? firstPage.blocks.map((b) => b.content).join(' ').slice(0, 500)
      : null,
    pageCount: document.pages.length,
    thumbnailUrl: null,
    hasImages: document.pages.some((p) =>
      p.blocks.some((b) => b.type === 'image'),
    ),
  };

  if (!firstPage) {
    return (
      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6 text-center">
        <p className="text-sm text-foreground-muted">No preview available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Document preview</h3>
      <MetadataPanel metadata={document.metadata} />
      <ContentPreview snippet={previewData.textSnippet} pageCount={previewData.pageCount} />
      <StatsFooter metadata={document.metadata} />
    </div>
  );
}

function MetadataPanel({
  metadata,
}: {
  metadata: NormalizedDocument['metadata'];
}) {
  return (
    <div className="rounded-lg border border-bg-overlay bg-background-surface p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
        Metadata
      </h4>
      <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {[
          ['File', metadata.fileName],
          ['Type', metadata.extension.toUpperCase()],
          ['Size', formatBytes(metadata.fileSize)],
          ['Pages', metadata.pageCount != null ? String(metadata.pageCount) : '\u2014'],
          ['Words', String(metadata.wordCount)],
          ['Reading time', `${metadata.estimatedReadingTimeMinutes} min`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-foreground-muted">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground truncate">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ContentPreview({
  snippet,
  pageCount,
}: {
  snippet: string;
  pageCount: number;
}) {
  return (
    <div className="rounded-lg border border-bg-overlay bg-background-surface p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
        Text preview
      </h4>
      <p className="mt-2 text-sm text-foreground-secondary leading-relaxed whitespace-pre-wrap">
        {snippet || 'No text content available for preview.'}
      </p>
      {pageCount > 3 && (
        <p className="mt-2 text-xs text-foreground-muted">
          Showing first 3 of {pageCount} pages
        </p>
      )}
    </div>
  );
}

function StatsFooter({
  metadata,
}: {
  metadata: NormalizedDocument['metadata'];
}) {
  return (
    <div className="text-xs text-foreground-muted">
      <p>
        Processed at{' '}
        {metadata.processingTimestamps.completedAt
          ? new Date(metadata.processingTimestamps.completedAt).toLocaleString()
          : '\u2014'}
      </p>
    </div>
  );
}

function extractSnippet(
  pages: NormalizedDocument['pages'],
  maxChars: number,
): string {
  const textBlocks = pages
    .slice(0, 3)
    .flatMap((p) => p.blocks.filter((b) => b.type === 'paragraph' || b.type === 'heading'))
    .map((b) => b.content);

  return textBlocks.join(' ').slice(0, maxChars);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}
