import type { Metadata } from 'next';
import './globals.css';

/**
 * Root layout (Next.js 14 App Router).
 *
 * Wraps every page in the monorepo. The auth and app route groups add their
 * own nested layouts with/without the sidebar shell.
 */
export const metadata: Metadata = {
  title: 'RecallAI — AI-Powered Memory Infrastructure',
  description:
    'Transform PDFs and YouTube videos into scientifically optimized flashcards. Active recall meets spaced repetition.',
  // PWA manifest is added in Phase 10.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
