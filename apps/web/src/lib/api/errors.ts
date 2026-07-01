import { AxiosError } from 'axios';
import type { ApiErrorResponse } from './types';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isAuthError(): boolean {
    return this.code.startsWith('AUTH_');
  }

  get isRateLimited(): boolean {
    return this.code === 'RATE_LIMIT_001';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

export function fromAxiosError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError && error.response?.data) {
    const body = error.response.data as ApiErrorResponse;
    return new ApiError(
      body.error?.code ?? 'INTERNAL_001',
      body.error?.message ?? error.message,
      error.response.status,
      body.error?.requestId,
    );
  }

  if (error instanceof AxiosError && !error.response) {
    return new ApiError(
      'NETWORK_001',
      'Cannot connect to the RecallAI backend. Verify that the API server is running and NEXT_PUBLIC_API_URL is correct.',
      0,
    );
  }

  return new ApiError(
    'INTERNAL_001',
    error instanceof Error ? error.message : 'An unexpected error occurred',
    500,
  );
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
