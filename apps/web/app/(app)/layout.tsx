/**
 * Authenticated app layout (PROMPT §4, §8.4 Dashboard Layout).
 *
 * Phase 1 skeleton: sidebar nav + main content area. Full sidebar with
 * deck list, search, and notification bell is built in Phase 6.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — full implementation in Phase 6 */}
      <aside className="hidden w-64 shrink-0 border-r border-bg-overlay bg-bg-surface md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b border-bg-overlay px-4">
            <span className="text-lg font-bold text-brand">RecallAI</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {/* TODO(spec): Add nav links for dashboard, decks, upload, analytics, settings, billing */}
          </nav>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
