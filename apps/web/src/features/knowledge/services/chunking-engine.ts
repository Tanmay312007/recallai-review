import type {
  NormalizedDocument,
  NormalizedPage,
  NormalizedBlock,
} from '@/features/processing/types';
import type {
  KnowledgeSection,
  KnowledgeParagraph,
  KnowledgeChunk,
  ChunkMetadata,
  KnowledgeDocument,
} from '@lumora/shared';
import type { ChunkingOptions } from '../types';
import { DEFAULT_CHUNKING_OPTIONS, estimateTokens, estimateReadingTimeSeconds } from '../types';

interface HeadingMatch {
  level: number;
  text: string;
  blockIndex: number;
  pageNumber: number;
  charOffset: number;
}

export function chunkDocument(
  documentId: string,
  normalized: NormalizedDocument,
  options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS,
): KnowledgeDocument {
  const opts = { ...DEFAULT_CHUNKING_OPTIONS, ...options };
  const sections = buildSections(normalized.pages);
  const paragraphs = buildParagraphs(normalized.pages, sections);
  const chunks = buildChunks(documentId, paragraphs, sections, opts);

  const totalWords = paragraphs.reduce((sum, p) => sum + p.wordCount, 0);
  const totalTokens = estimateTokens(totalWords);

  return {
    documentId,
    sections,
    paragraphs,
    chunks,
    totalWords,
    totalTokens,
    createdAt: new Date().toISOString(),
  };
}

function buildSections(pages: NormalizedPage[]): KnowledgeSection[] {
  const sections: KnowledgeSection[] = [];
  const headings = extractHeadings(pages);

  if (headings.length === 0) {
    sections.push({
      id: generateId(),
      title: 'Document',
      headingLevel: 1 as const,
      paragraphIndices: [],
      characterOffsetStart: 0,
      characterOffsetEnd: getTotalLength(pages),
    });
    return sections;
  }

  for (let i = 0; i < headings.length; i++) {
    const current = headings[i]!;
    const next = headings[i + 1] ?? undefined;
    const startOffset = current.charOffset;
    const endOffset = next ? next.charOffset : getTotalLength(pages);
    const startBlock = current.blockIndex;
    const endBlock = next ? next.blockIndex : countBlocks(pages);

    const paraIndices: number[] = [];
    for (let j = startBlock; j < endBlock; j++) {
      paraIndices.push(j);
    }

    sections.push({
      id: generateId(),
      title: current.text,
      headingLevel: current.level as KnowledgeSection['headingLevel'],
      paragraphIndices: paraIndices,
      characterOffsetStart: startOffset,
      characterOffsetEnd: endOffset,
    });
  }

  return sections;
}

function buildParagraphs(
  pages: NormalizedPage[],
  sections: KnowledgeSection[],
): KnowledgeParagraph[] {
  const paragraphs: KnowledgeParagraph[] = [];
  const allBlocks = flattenBlocks(pages);
  let globalOffset = 0;

  for (let i = 0; i < allBlocks.length; i++) {
    const block = allBlocks[i]!;
    const section = sections.find((s) => s.paragraphIndices.includes(i));

    paragraphs.push({
      id: generateId(),
      sectionId: section?.id ?? sections[0]?.id ?? '',
      index: i,
      content: block.content,
      characterOffsetStart: globalOffset,
      characterOffsetEnd: globalOffset + block.content.length,
      wordCount: countWords(block.content),
    });

    globalOffset += block.content.length + 1;
  }

  return paragraphs;
}

function buildChunks(
  documentId: string,
  paragraphs: KnowledgeParagraph[],
  sections: KnowledgeSection[],
  opts: ChunkingOptions,
): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  let currentParagraphs: KnowledgeParagraph[] = [];
  let currentWordCount = 0;

  for (const paragraph of paragraphs) {
    const section = sections.find((s) => s.id === paragraph.sectionId);

    if (
      currentParagraphs.length > 0 &&
      currentWordCount + paragraph.wordCount > (opts.maxChunkWords ?? 500)
    ) {
      chunks.push(createChunk(documentId, currentParagraphs, section));
      currentParagraphs = [];
      currentWordCount = 0;
    }

    currentParagraphs.push(paragraph);
    currentWordCount += paragraph.wordCount;
  }

  if (currentParagraphs.length > 0) {
    const section = sections.find((s) => s.id === currentParagraphs[0]?.sectionId);
    chunks.push(createChunk(documentId, currentParagraphs, section));
  }

  return chunks;
}

function createChunk(
  documentId: string,
  paragraphs: KnowledgeParagraph[],
  section: KnowledgeSection | undefined,
): KnowledgeChunk {
  const content = paragraphs.map((p) => p.content).join('\n\n');
  const first = paragraphs[0]!;
  const last = paragraphs[paragraphs.length - 1]!;
  const wordCount = paragraphs.reduce((s, p) => s + p.wordCount, 0);

  const chunkId = generateId();

  const metadata: ChunkMetadata = {
    documentId,
    chunkId,
    sourcePage: null,
    sectionTitle: section?.title ?? 'Document',
    headingLevel: section?.headingLevel ?? 1,
    paragraphIndex: first.index,
    characterOffsetStart: first.characterOffsetStart,
    characterOffsetEnd: last.characterOffsetEnd,
    wordCount,
    estimatedTokens: estimateTokens(wordCount),
    readingTimeSeconds: estimateReadingTimeSeconds(wordCount),
    embeddingId: null,
    vectorId: null,
  };

  return {
    id: chunkId,
    documentId,
    content,
    sectionId: section?.id ?? '',
    paragraphId: first.id,
    metadata,
    createdAt: new Date().toISOString(),
  };
}

function extractHeadings(pages: NormalizedPage[]): HeadingMatch[] {
  const headings: HeadingMatch[] = [];
  let globalOffset = 0;

  for (const page of pages) {
    for (let bi = 0; bi < page.blocks.length; bi++) {
      const block = page.blocks[bi]!;
      if (block.type === 'heading' && block.level) {
        headings.push({
          level: block.level,
          text: block.content,
          blockIndex: bi + headings.length,
          pageNumber: page.pageNumber,
          charOffset: globalOffset,
        });
      }
      globalOffset += block.content.length + 1;
    }
  }

  return headings;
}

function flattenBlocks(pages: NormalizedPage[]): NormalizedBlock[] {
  return pages.flatMap((p) => p.blocks);
}

function countBlocks(pages: NormalizedPage[]): number {
  return pages.reduce((sum, p) => sum + p.blocks.length, 0);
}

function getTotalLength(pages: NormalizedPage[]): number {
  return pages.reduce(
    (sum, p) => sum + p.blocks.reduce((s, b) => s + b.content.length + 1, 0),
    0,
  );
}

function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

let counter = 0;
function generateId(): string {
  return `chk_${Date.now()}_${++counter}`;
}
