/**
 * Landing page (PROMPT §4: app/page.tsx — root landing page).
 *
 * Phase 1 skeleton: hero + CTA. Full marketing landing page is built after
 * the product features are implemented (out of Phase 1 scope).
 */
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Remember
          <span className="text-brand"> everything.</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-foreground-secondary">
          Upload a PDF or paste a YouTube link. RecallAI transforms your
          content into Active Recall flashcards scheduled with FSRS v4 — the
          scientifically optimal spaced repetition algorithm.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/login"
            className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-bg-base shadow-sm hover:bg-brand-hover transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold leading-6 text-foreground-secondary hover:text-brand transition-colors"
          >
            Create Account →
          </Link>
        </div>
      </div>
    </main>
  );
}
