import type { DocumentExtractor, ExtractorOutcome } from './extractor.interface';
import { estimateReadingTimeMinutes } from '../utils/text-stats';

export class MarkdownExtractor implements DocumentExtractor {
  readonly supportedExtensions = ['.md'] as const;
  readonly supportedMimeTypes = ['text/markdown', 'text/plain'];

  canHandle(extension: string, mimeType: string): boolean {
    const lower = extension.toLowerCase();
    return (
      lower === '.md' &&
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
    const baseName = fileName.replace(/\.md$/i, '');

    return {
      success: true,
      document: {
        metadata: {
          fileName,
          extension: '.md',
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
                content: `Content of "${baseName}". Markdown content extraction is pending server-side processing.`,
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
