'use client';

import { TitleBar } from './title-bar';

export function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TitleBar />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
