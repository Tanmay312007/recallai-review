'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingOverlay } from '@/components/auth/loading-overlay';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'initializing' || status === 'refreshing') {
    return <LoadingOverlay />;
  }

  if (status !== 'authenticated') {
    return null;
  }

  return <>{children}</>;
}
