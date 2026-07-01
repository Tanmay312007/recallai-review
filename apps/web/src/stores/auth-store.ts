import { create } from 'zustand';
import {
  api,
  tokenManager,
  setLogoutHandler,
  fromAxiosError,
} from '@/lib/api';
import type { AuthSessionResponse } from '@/lib/api/types';

export type AuthStatus =
  | 'initializing'
  | 'authenticating'
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

export const useAuthStore = create<AuthState>((set, get) => {
  let logoutHandlerWired = false;

  const logout = async (): Promise<void> => {
    try {
      await api.auth.post('/auth/logout');
    } catch {
      // Best-effort — clear state regardless of network outcome.
    }
    tokenManager.clear();
    set({ user: null, status: 'unauthenticated' as const });
  };

  return {
    user: null,
    status: 'initializing',

    initialize: async () => {
      if (!logoutHandlerWired) {
        setLogoutHandler(() => {
          get().logout();
        });
        logoutHandlerWired = true;
      }

      set({ status: 'initializing' });

      try {
        const data = await api.auth.post<AuthSessionResponse>('/auth/refresh');
        tokenManager.set(data.accessToken);
        set({ user: data.user, status: 'authenticated' });
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
        tokenManager.set(data.accessToken);
        set({ user: data.user, status: 'authenticated' });
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
        tokenManager.set(data.accessToken);
        set({ user: data.user, status: 'authenticated' });
      } catch (err) {
        set({ status: 'unauthenticated' });
        throw fromAxiosError(err);
      }
    },

    logout,

    refreshSession: async () => {
      try {
        const data = await api.auth.post<AuthSessionResponse>('/auth/refresh');
        tokenManager.set(data.accessToken);
        set({ user: data.user, status: 'authenticated' });
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
