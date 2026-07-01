import type { DocumentExtractor } from './extractor.interface';
import { PdfExtractor } from './pdf-extractor';
import { DocxExtractor } from './docx-extractor';
import { PptExtractor } from './ppt-extractor';
import { TextExtractor } from './text-extractor';
import { MarkdownExtractor } from './markdown-extractor';

const extractors: DocumentExtractor[] = [
  new PdfExtractor(),
  new DocxExtractor(),
  new PptExtractor(),
  new TextExtractor(),
  new MarkdownExtractor(),
];

export function getExtractor(
  extension: string,
  mimeType: string,
): DocumentExtractor | null {
  return extractors.find((e) => e.canHandle(extension, mimeType)) ?? null;
}

export function getAllExtractors(): readonly DocumentExtractor[] {
  return extractors;
}
