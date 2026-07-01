import { create } from 'zustand';
import {
  api,
  tokenManager,
  fromAxiosError,
} from '@/lib/api';
import type { AuthSessionResponse } from '@/lib/api/types';

export type AuthStatus =
  | 'initializing'
  | 'authenticating'
  | 'refreshing'
  | 'authenticated'
  | 'unauthenticated';

interface AuthState {
  user: AuthSessionResponse['user'] | null;
  status: AuthStatus;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  initialize: () => Promise<void>;
  clear: () => void;
}

function applyAuthenticatedSession(
  data: AuthSessionResponse,
  set: (state: Partial<AuthState>) => void,
): void {
  tokenManager.set(data.accessToken);
  set({ user: data.user, status: 'authenticated' });
}

export const useAuthStore = create<AuthState>((set) => {
  const logout = async (): Promise<void> => {
    try {
      await api.auth.post('/auth/logout');
    } catch {
      // Best-effort — clear state regardless of network outcome.
    }
    tokenManager.clear();
    set({ user: null, status: 'unauthenticated' });
  };

  return {
    user: null,
    status: 'initializing',

    initialize: async () => {
      set({ status: 'initializing' });

      try {
        const data = await api.auth.post<AuthSessionResponse>('/auth/refresh');
        applyAuthenticatedSession(data, set);
      } catch {
        tokenManager.clear();
        set({ user: null, status: 'unauthenticated' });
      }
    },

    login: async (email: string, password: string) => {
      set({ status: 'authenticating' });

      try {
        const data = await api.auth.post<AuthSessionResponse>(
          '/auth/login',
          { email, password },
        );
        applyAuthenticatedSession(data, set);
      } catch (err) {
        set({ status: 'unauthenticated' });
        throw fromAxiosError(err);
      }
    },

    register: async (
      email: string,
      password: string,
      name?: string,
    ) => {
      set({ status: 'authenticating' });

      try {
        const data = await api.auth.post<AuthSessionResponse>(
          '/auth/register',
          { email, password, name },
        );
        applyAuthenticatedSession(data, set);
      } catch (err) {
        set({ status: 'unauthenticated' });
        throw fromAxiosError(err);
      }
    },

    logout,

    refreshSession: async () => {
      set({ status: 'refreshing' });

      try {
        const data = await api.auth.post<AuthSessionResponse>('/auth/refresh');
        applyAuthenticatedSession(data, set);
      } catch (err) {
        tokenManager.clear();
        set({ user: null, status: 'unauthenticated' });
        throw fromAxiosError(err);
      }
    },

    clear: () => {
      tokenManager.clear();
      set({ user: null, status: 'unauthenticated' });
    },
  };
});
