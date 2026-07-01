/**
 * Text statistics utilities for the processing pipeline.
 * Used by extractors to compute word count, reading time, etc.
 */

const WORDS_PER_MINUTE = 238;
const CHARACTERS_PER_WORD = 5;

export function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

export function estimateReadingTimeMinutes(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function estimatePageCount(
  wordCount: number,
  wordsPerPage = 350,
): number {
  if (wordCount <= 0) return 1;
  return Math.max(1, Math.ceil(wordCount / wordsPerPage));
}

export function estimateWordCountFromBytes(
  fileSize: number,
  extension: string,
): number {
  const density: Record<string, number> = {
    '.txt': 1,
    '.md': 1,
    '.pdf': 0.8,
    '.docx': 0.6,
    '.ppt': 0.4,
    '.pptx': 0.3,
  };
  const ratio = density[extension.toLowerCase()] ?? 0.5;
  return Math.round((fileSize / CHARACTERS_PER_WORD) * ratio);
}
