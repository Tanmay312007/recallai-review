import type { DocumentExtractor, ExtractorOutcome } from './extractor.interface';
import { estimateReadingTimeMinutes, estimateWordCountFromBytes } from '../utils/text-stats';

export class PptExtractor implements DocumentExtractor {
  readonly supportedExtensions = ['.ppt', '.pptx'] as const;
  readonly supportedMimeTypes = [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  canHandle(extension: string, mimeType: string): boolean {
    const lower = extension.toLowerCase();
    const extMatch =
      lower === '.ppt' || lower === '.pptx';
    return extMatch && this.supportedMimeTypes.includes(mimeType);
  }

  async extract(
    fileName: string,
    fileSize: number,
    _mimeType: string,
  ): Promise<ExtractorOutcome> {
    const ext = fileName.toLowerCase().endsWith('.pptx') ? '.pptx' : '.ppt';
    const wordCount = estimateWordCountFromBytes(fileSize, ext);
    const slideCount = Math.max(1, Math.ceil(wordCount / 100));
    const now = new Date().toISOString();
    const baseName = fileName.replace(/\.(ppt|pptx)$/i, '');

    return {
      success: true,
      document: {
        metadata: {
          fileName,
          extension: ext,
          fileSize,
          pageCount: slideCount,
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
        pages: Array.from({ length: Math.min(slideCount, 5) }, (_, i) => ({
          pageNumber: i + 1,
          blocks: [
            {
              type: 'paragraph',
              content: `Slide ${i + 1} of "${baseName}". PPT content extraction is pending server-side processing.`,
            },
          ],
        })),
        createdAt: now,
        updatedAt: now,
      },
    };
  }
}
