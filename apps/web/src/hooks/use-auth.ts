import { useAuthStore } from '@/stores/auth-store';
import type { AuthStatus } from '@/stores/auth-store';

export function useAuthUser() {
  return useAuthStore((s) => s.user);
}

export function useAuthStatus(): AuthStatus {
  return useAuthStore((s) => s.status);
}

export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => s.status === 'authenticated');
}

export function useIsAuthLoading(): boolean {
  return useAuthStore(
    (s) => s.status === 'initializing' || s.status === 'refreshing',
  );
}
