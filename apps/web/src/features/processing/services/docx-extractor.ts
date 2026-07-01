import type { DocumentExtractor, ExtractorOutcome } from './extractor.interface';
import { estimateReadingTimeMinutes, estimateWordCountFromBytes } from '../utils/text-stats';

export class DocxExtractor implements DocumentExtractor {
  readonly supportedExtensions = ['.docx'] as const;
  readonly supportedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  canHandle(extension: string, mimeType: string): boolean {
    return (
      this.supportedExtensions.includes(extension.toLowerCase() as '.docx') &&
      this.supportedMimeTypes.includes(mimeType)
    );
  }

  async extract(
    fileName: string,
    fileSize: number,
    _mimeType: string,
  ): Promise<ExtractorOutcome> {
    const wordCount = estimateWordCountFromBytes(fileSize, '.docx');
    const now = new Date().toISOString();
    const baseName = fileName.replace(/\.docx$/i, '');

    return {
      success: true,
      document: {
        metadata: {
          fileName,
          extension: '.docx',
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
                content: `Content of "${baseName}". DOCX extraction is pending server-side processing.`,
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
