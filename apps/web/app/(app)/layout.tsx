'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { WorkspaceShell } from '@/features/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <WorkspaceShell>{children}</WorkspaceShell>
    </ProtectedRoute>
  );
}
