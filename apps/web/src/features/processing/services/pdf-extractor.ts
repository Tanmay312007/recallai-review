import type { DocumentExtractor, ExtractorOutcome } from './extractor.interface';
import { estimateReadingTimeMinutes, estimateWordCountFromBytes } from '../utils/text-stats';

export class PdfExtractor implements DocumentExtractor {
  readonly supportedExtensions = ['.pdf'] as const;
  readonly supportedMimeTypes = ['application/pdf'];

  canHandle(extension: string, mimeType: string): boolean {
    return (
      this.supportedExtensions.includes(extension.toLowerCase() as '.pdf') &&
      this.supportedMimeTypes.includes(mimeType)
    );
  }

  async extract(
    fileName: string,
    fileSize: number,
    _mimeType: string,
  ): Promise<ExtractorOutcome> {
    const wordCount = estimateWordCountFromBytes(fileSize, '.pdf');
    const pageCount = Math.max(1, Math.ceil(wordCount / 350));

    const now = new Date().toISOString();
    const baseName = fileName.replace(/\.pdf$/i, '');

    return {
      success: true,
      document: {
        metadata: {
          fileName,
          extension: '.pdf',
          fileSize,
          pageCount,
          wordCount,
          estimatedReadingTimeMinutes: estimateReadingTimeMinutes(wordCount),
          language: 'en',
          uploadedAt: now,
          processingTimestamps: {
            queuedAt: now,
            preparingAt: now,
            extractingAt: now,
            normalizingAt: now,
            completedAt: now,
          },
        },
        pages: Array.from({ length: Math.min(pageCount, 5) }, (_, i) => ({
          pageNumber: i + 1,
          blocks: [
            {
              type: 'paragraph' as const,
              content: `Page ${i + 1} of "${baseName}". Content extraction is pending server-side processing.`,
            },
          ],
        })),
        createdAt: now,
        updatedAt: now,
      },
    };
  }
}
