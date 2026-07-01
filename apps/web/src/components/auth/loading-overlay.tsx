export function LoadingOverlay() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="mt-4 text-sm text-foreground-muted">Loading...</p>
      </div>
    </div>
  );
}
