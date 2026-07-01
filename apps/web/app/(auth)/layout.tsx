/**
 * Auth route-group layout (PROMPT §4).
 * No sidebar — clean auth pages (login, register, reset-password).
 * The sidebar shell is in (app)/layout.tsx.
 *
 * Guest guard: redirect authenticated users to /dashboard.
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  return <>{children}</>;
}
