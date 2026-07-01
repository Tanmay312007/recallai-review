import type { NormalizedDocument } from '../types';

export interface ExtractorResult {
  success: true;
  document: NormalizedDocument;
}

export interface ExtractorError {
  success: false;
  error: string;
}

export type ExtractorOutcome = ExtractorResult | ExtractorError;

export interface DocumentExtractor {
  readonly supportedExtensions: readonly string[];
  readonly supportedMimeTypes: readonly string[];

  canHandle(extension: string, mimeType: string): boolean;
  extract(
    fileName: string,
    fileSize: number,
    mimeType: string,
  ): Promise<ExtractorOutcome>;
}
