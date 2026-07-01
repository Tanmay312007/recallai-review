'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { setLogoutHandler } from '@/lib/api';
import { LoadingOverlay } from '@/components/auth/loading-overlay';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    setLogoutHandler(() => useAuthStore.getState().logout());
    initialize();
  }, [initialize]);

  if (status === 'initializing') {
    return <LoadingOverlay />;
  }

  return <>{children}</>;
}
