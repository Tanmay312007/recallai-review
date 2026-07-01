import type { ChunkMetadata } from '@recallai/shared';

interface ChunkMetadataPanelProps {
  metadata: ChunkMetadata;
}

export function ChunkMetadataPanel({ metadata }: ChunkMetadataPanelProps) {
  const rows: [string, string][] = [
    ['Document ID', metadata.documentId],
    ['Chunk ID', metadata.chunkId],
    ['Section', metadata.sectionTitle],
    ['Heading Level', `H${metadata.headingLevel}`],
    ['Paragraph Index', String(metadata.paragraphIndex)],
    ['Source Page', metadata.sourcePage != null ? String(metadata.sourcePage) : '\u2014'],
    ['Word Count', String(metadata.wordCount)],
    ['Est. Tokens', String(metadata.estimatedTokens)],
    ['Reading Time', `${metadata.readingTimeSeconds}s`],
    ['Char Offset', `${metadata.characterOffsetStart}\u2013${metadata.characterOffsetEnd}`],
    ['Embedding ID', metadata.embeddingId ?? '\u2014'],
    ['Vector ID', metadata.vectorId ?? '\u2014'],
  ];

  return (
    <div className="rounded-lg border border-bg-overlay bg-background-elevated p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
        Chunk Metadata
      </h4>
      <dl className="mt-3 divide-y divide-bg-overlay">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-2">
            <dt className="text-xs text-foreground-muted">{label}</dt>
            <dd className="max-w-[60%] truncate text-xs font-medium text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
