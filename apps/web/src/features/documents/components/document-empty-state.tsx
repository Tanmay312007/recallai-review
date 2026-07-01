interface DocumentEmptyStateProps {
  hasSearch?: boolean;
}

export function DocumentEmptyState({
  hasSearch,
}: DocumentEmptyStateProps) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl text-foreground-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-sm font-medium text-foreground">
          No matching documents
        </h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl text-foreground-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">
        No documents yet
      </h3>
      <p className="mt-1 text-sm text-foreground-muted">
        Upload a PDF, DOCX, or other supported file to get started.
      </p>
    </div>
  );
}
