'use client';

import { cn } from '../utils/cn';

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-border', className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-fast',
            active === tab.id
              ? 'text-foreground'
              : 'text-foreground-muted hover:text-foreground-secondary',
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'flex items-center justify-center h-5 min-w-[20px] rounded-full px-1.5 text-caption font-medium',
                active === tab.id
                  ? 'bg-background-overlay text-foreground-muted'
                  : 'bg-background-surface text-foreground-muted',
              )}
            >
              {tab.count}
            </span>
          )}
          {active === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
