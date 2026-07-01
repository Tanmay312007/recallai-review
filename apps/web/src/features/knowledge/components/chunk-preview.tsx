import type { KnowledgeChunk } from '@recallai/shared';

interface ChunkPreviewProps {
  chunk: KnowledgeChunk;
  highlighted?: boolean;
  onSelect?: (chunkId: string) => void;
}

export function ChunkPreview({ chunk, highlighted, onSelect }: ChunkPreviewProps) {
  const { metadata, content } = chunk;

  return (
    <div
      className={`rounded-lg border bg-background-elevated p-4 transition-colors ${
        highlighted
          ? 'border-brand ring-1 ring-brand'
          : 'border-bg-overlay hover:border-bg-overlay/80'
      }`}
      onClick={() => onSelect?.(chunk.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onSelect) onSelect(chunk.id);
      }}
      tabIndex={0}
      role="button"
      aria-label={`Chunk from section "${metadata.sectionTitle}"`}
      aria-pressed={highlighted}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SectionBadge title={metadata.sectionTitle} level={metadata.headingLevel} />
        <span className="text-xs text-foreground-muted">
          {metadata.wordCount} words
        </span>
        <span className="text-xs text-foreground-muted">
          ~{metadata.estimatedTokens} tokens
        </span>
        {metadata.sourcePage != null && (
          <span className="text-xs text-foreground-muted">
            p. {metadata.sourcePage}
          </span>
        )}
      </div>

      <p className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-wrap line-clamp-6">
        {content}
      </p>

      {metadata.readingTimeSeconds > 0 && (
        <p className="mt-2 text-xs text-foreground-muted">
          Reading time: ~{metadata.readingTimeSeconds}s
        </p>
      )}
    </div>
  );
}

function SectionBadge({
  title,
  level,
}: {
  title: string;
  level: number;
}) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
      H{level}: {title}
    </span>
  );
}

export function ChunkList({
  chunks,
  selectedId,
  onSelect,
}: {
  chunks: KnowledgeChunk[];
  selectedId: string | null;
  onSelect?: (chunkId: string) => void;
}) {
  if (chunks.length === 0) {
    return (
      <div className="rounded-lg border border-bg-overlay bg-background-elevated p-6 text-center">
        <p className="text-sm text-foreground-muted">
          No chunks generated yet. Process the document to generate chunks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chunks.map((chunk) => (
        <ChunkPreview
          key={chunk.id}
          chunk={chunk}
          highlighted={chunk.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
