import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-provider';
import { ThemeProvider } from '@/design-system/theme';
import { TooltipProvider } from '@/design-system/primitives/tooltip-provider';
import { DesktopLayout } from '@/features/desktop/components/desktop-layout';
import { CommandPalette } from '@/features/navigation/components/command-palette';

/**
 * Root layout (Next.js 14 App Router).
 *
 * Wraps every page in the monorepo. The auth and app route groups add their
 * own nested layouts with/without the sidebar shell.
 */
export const metadata: Metadata = {
  title: 'Lumora — The Intelligent Workspace for Knowledge',
  description:
    'Ingest, understand, organize, and act on your knowledge. AI-powered workspace for the modern knowledge worker.',
  // PWA manifest is added in Phase 10.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>
              <DesktopLayout>
                {children}
                <CommandPalette />
              </DesktopLayout>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
