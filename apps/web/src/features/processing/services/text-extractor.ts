import type { DocumentExtractor, ExtractorOutcome } from './extractor.interface';
import { estimateReadingTimeMinutes } from '../utils/text-stats';

export class TextExtractor implements DocumentExtractor {
  readonly supportedExtensions = ['.txt'] as const;
  readonly supportedMimeTypes = ['text/plain'];

  canHandle(extension: string, mimeType: string): boolean {
    return (
      this.supportedExtensions.includes(extension.toLowerCase() as '.txt') &&
      this.supportedMimeTypes.includes(mimeType)
    );
  }

  async extract(
    fileName: string,
    fileSize: number,
    _mimeType: string,
  ): Promise<ExtractorOutcome> {
    const wordCount = Math.max(1, Math.round(fileSize / 5));
    const now = new Date().toISOString();
    const baseName = fileName.replace(/\.txt$/i, '');

    return {
      success: true,
      document: {
        metadata: {
          fileName,
          extension: '.txt',
          fileSize,
          pageCount: null,
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
        pages: [
          {
            pageNumber: 1,
            blocks: [
              {
                type: 'paragraph',
                content: `Content of "${baseName}". TXT content extraction is pending server-side processing.`,
              },
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    };
  }
}
