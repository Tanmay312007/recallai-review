import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { tokenManager } from './token-manager';

interface QueueEntry {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  config: InternalAxiosRequestConfig;
}

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];
let logoutHandler: (() => void) | null = null;
let authClientRef: AxiosInstance | null = null;

export function setLogoutHandler(fn: () => void): void {
  logoutHandler = fn;
}

export function setAuthClient(client: AxiosInstance): void {
  authClientRef = client;
}

export function requestInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const accessToken = tokenManager.get();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}

export function createResponseInterceptor(instance: AxiosInstance) {
  return async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if ((originalRequest as unknown as Record<string, unknown>)._retry) {
      return Promise.reject(error);
    }

    if (
      typeof originalRequest.url === 'string' &&
      originalRequest.url.includes('/auth/refresh')
    ) {
      logoutHandler?.();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    isRefreshing = true;
    (originalRequest as unknown as Record<string, unknown>)._retry = true;

    try {
      if (!authClientRef) {
        throw new Error(
          'Auth client is not configured. Ensure setAuthClient() is called during app initialization.',
        );
      }
      const { data } = await authClientRef.post<{ accessToken: string }>(
        '/auth/refresh',
      );
      tokenManager.set(data.accessToken);

      const queue = [...failedQueue];
      failedQueue = [];
      for (const entry of queue) {
        entry.resolve(instance(entry.config));
      }

      return instance(originalRequest);
    } catch (refreshError) {
      const queue = [...failedQueue];
      failedQueue = [];
      for (const entry of queue) {
        entry.reject(refreshError);
      }
      logoutHandler?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  };
}
