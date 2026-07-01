import { getExtractor } from './extractor-registry';
import type { ExtractorOutcome } from './extractor.interface';
import type { ProcessingStage } from '../types';

export interface ProcessingProgress {
  stage: ProcessingStage;
  progress: number;
  message: string;
}

export function canProcessFile(extension: string, mimeType: string): boolean {
  return getExtractor(extension, mimeType) !== null;
}

export async function processDocument(
  fileName: string,
  fileSize: number,
  mimeType: string,
  onProgress?: (progress: ProcessingProgress) => void,
): Promise<ExtractorOutcome> {
  const extension = getExtension(fileName);
  if (!extension) {
    return { success: false, error: `Could not determine file extension for "${fileName}".` };
  }

  const extractor = getExtractor(extension, mimeType);
  if (!extractor) {
    return {
      success: false,
      error: `No extractor available for "${extension}" files.`,
    };
  }

  const stages: ProcessingStage[] = ['QUEUED', 'PREPARING', 'EXTRACTING', 'NORMALIZING'];
  const total = stages.length;

  for (let i = 0; i < stages.length; i++) {
    const stage: ProcessingStage = stages[i]!;
    const pct = Math.round(((i + 1) / total) * 100);
    const labels: Record<string, string> = {
      QUEUED: 'Document queued for processing',
      PREPARING: 'Preparing document for extraction',
      EXTRACTING: `Extracting content using ${extractor.constructor.name}`,
      NORMALIZING: 'Normalizing extracted content',
    };
    onProgress?.({ stage, progress: pct, message: labels[stage] ?? 'Processing' });
    await simulateWork(stage);
  }

  const result = await extractor.extract(fileName, fileSize, mimeType);
  if (result.success) {
    onProgress?.({ stage: 'COMPLETED', progress: 100, message: 'Processing complete' });
  }
  return result;
}

function getExtension(fileName: string): string | null {
  const match = fileName.match(/\.([a-z0-9]+)$/i);
  return match ? match[0].toLowerCase() : null;
}

async function simulateWork(_stage: ProcessingStage): Promise<void> {
  await new Promise((r) => setTimeout(r, 150));
}
