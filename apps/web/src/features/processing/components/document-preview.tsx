import type { NormalizedDocument } from '../types';

interface DocumentPreviewProps {
  document: NormalizedDocument;
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
  const firstPage = document.pages[0];

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

      <MetadataPreview metadata={document.metadata} />

      <ContentPreview pages={document.pages} />

      <StatsFooter metadata={document.metadata} />
    </div>
  );
}

function MetadataPreview({
  metadata,
}: {
  metadata: NormalizedDocument['metadata'];
}) {
  return (
    <div className="rounded-lg border border-bg-overlay bg-background-surface p-4">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
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

function ContentPreview({ pages }: { pages: NormalizedDocument['pages'] }) {
  const previewPages = pages.slice(0, 3);
  const textBlocks = previewPages.flatMap((p) =>
    p.blocks.filter((b) => b.type === 'paragraph' || b.type === 'heading'),
  );
  const previewText = textBlocks
    .map((b) => b.content)
    .join(' ')
    .slice(0, 1000);

  return (
    <div className="rounded-lg border border-bg-overlay bg-background-surface p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
        Text preview
      </h4>
      <p className="mt-2 text-sm text-foreground-secondary leading-relaxed whitespace-pre-wrap">
        {previewText || 'No text content available for preview.'}
      </p>
      {pages.length > 3 && (
        <p className="mt-2 text-xs text-foreground-muted">
          Showing first 3 of {pages.length} pages
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}
