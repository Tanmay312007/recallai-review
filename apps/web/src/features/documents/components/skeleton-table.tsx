export function SkeletonTable() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full animate-pulse rounded-lg bg-bg-overlay" />
      <div className="overflow-hidden rounded-lg border border-bg-overlay">
        <table className="min-w-full">
          <thead className="bg-background-surface">
            <tr>
              {['Name', 'Status', 'Size', 'Uploaded', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left">
                  <div className="h-3 w-16 animate-pulse rounded bg-bg-overlay" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-bg-overlay">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-pulse rounded bg-bg-overlay" />
                    <div className="h-4 w-48 animate-pulse rounded bg-bg-overlay" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 animate-pulse rounded-full bg-bg-overlay" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-12 animate-pulse rounded bg-bg-overlay" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-bg-overlay" />
                </td>
                <td className="px-4 py-3">
                  <div className="ml-auto h-5 w-5 animate-pulse rounded bg-bg-overlay" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 animate-pulse rounded bg-bg-overlay" />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-8 animate-pulse rounded border border-bg-overlay bg-bg-overlay"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
