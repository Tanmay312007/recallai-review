import axios from 'axios';
import { env } from '@/config/env';
import {
  requestInterceptor,
  createResponseInterceptor,
  setAuthClient,
} from './interceptors';

const baseConfig = {
  baseURL: env.API_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

const protectedClient = axios.create(baseConfig);
protectedClient.interceptors.request.use(requestInterceptor);
protectedClient.interceptors.response.use(
  null,
  createResponseInterceptor(protectedClient),
);

const authClient = axios.create(baseConfig);
setAuthClient(authClient);

function createApiHelpers(client: typeof protectedClient) {
  return {
    get: <T>(url: string, params?: Record<string, unknown>) =>
      client.get<T>(url, { params }).then((r) => r.data),

    post: <T>(url: string, data?: unknown) =>
      client.post<T>(url, data).then((r) => r.data),

    patch: <T>(url: string, data?: unknown) =>
      client.patch<T>(url, data).then((r) => r.data),

    put: <T>(url: string, data?: unknown) =>
      client.put<T>(url, data).then((r) => r.data),

    delete: <T>(url: string) =>
      client.delete<T>(url).then((r) => r.data),
  };
}

export const api = {
  ...createApiHelpers(protectedClient),
  auth: createApiHelpers(authClient),
};
