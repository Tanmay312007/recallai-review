import {
  SUPPORTED_EXTENSIONS,
  MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type SupportedExtension,
} from '../types';

export interface FileValidationError {
  code: 'UNSUPPORTED_TYPE' | 'FILE_TOO_LARGE' | 'INVALID_EXTENSION';
  message: string;
}

const EXTENSION_PATTERN = /\.([a-z0-9]+)$/i;

function getExtension(filename: string): string | null {
  const match = filename.match(EXTENSION_PATTERN);
  return match ? match[0].toLowerCase() : null;
}

function isSupportedExtension(ext: string): ext is SupportedExtension {
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);
}

export function validateFile(file: File): FileValidationError | null {
  const ext = getExtension(file.name);

  if (!ext || !isSupportedExtension(ext)) {
    return {
      code: 'INVALID_EXTENSION',
      message: `"${ext ?? ''}" files are not supported. Accepted formats: ${SUPPORTED_EXTENSIONS.join(', ')}`,
    };
  }

  const allowedMimes = MIME_TYPES[ext];
  if (!allowedMimes.includes(file.type)) {
    return {
      code: 'UNSUPPORTED_TYPE',
      message: `The file "${file.name}" has an invalid MIME type. Please upload a valid file.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      code: 'FILE_TOO_LARGE',
      message: `"${file.name}" exceeds the 50 MB limit.`,
    };
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}
