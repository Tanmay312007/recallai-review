import type { KnowledgeChunk } from '@lumora/shared';
import { logger } from '@/lib/logger';
import { renderPrompt } from '../prompts/template-engine';
import type { RenderedPrompt } from '../prompts/template-engine';

export interface FlashcardPromptInput {
  chunks: KnowledgeChunk[];
  documentId: string;
  title?: string;
  count?: number;
}

export interface BuiltPrompt {
  system: string;
  user: string;
  warnings: string[];
  estimatedTokens: number;
  chunkCount: number;
}

export function buildFlashcardPrompt(
  input: FlashcardPromptInput,
  estimateTokens: (text: string) => number,
): BuiltPrompt {
  const content = prepareContent(input.chunks);
  const title = input.title ?? 'Untitled Document';
  const count = input.count ?? 10;

  const rendered: RenderedPrompt = renderPrompt(
    'flashcard-generation',
    '1.0',
    {
      content,
      title,
      count: String(count),
    },
    { includeFewShot: true },
  );

  const fullText = `${rendered.system}\n\n${rendered.user}`;
  const estimatedTokens = estimateTokens(fullText);

  logger.info('Flashcard prompt built', {
    documentId: input.documentId,
    chunkCount: input.chunks.length,
    estimatedTokens,
    warnings: rendered.warnings.length,
  });

  if (rendered.warnings.length > 0) {
    logger.warn('Prompt rendering warnings', { warnings: rendered.warnings });
  }

  return {
    system: rendered.system,
    user: rendered.user,
    warnings: rendered.warnings,
    estimatedTokens,
    chunkCount: input.chunks.length,
  };
}

function prepareContent(chunks: KnowledgeChunk[]): string {
  const maxChars = 8000;
  let result = '';
  let i = 0;

  for (const chunk of chunks) {
    const header = chunk.metadata.sectionTitle
      ? `[Section: ${chunk.metadata.sectionTitle}]\n`
      : '';
    const entry = `${header}${chunk.content}\n\n`;

    if (result.length + entry.length > maxChars) {
      if (i === 0) {
        result += entry.slice(0, maxChars);
      }
      break;
    }

    result += entry;
    i++;
  }

  return result.trim() || '(No content available)';
}
