'use client';

import { cn } from '../utils/cn';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function Progress({ value, max = 100, className, size = 'md', variant = 'default' }: ProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        'w-full overflow-hidden rounded-full bg-background-overlay',
        size === 'sm' && 'h-1',
        size === 'md' && 'h-2',
        size === 'lg' && 'h-3',
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-deliberate',
          variant === 'default' && 'bg-brand',
          variant === 'success' && 'bg-semantic-success',
          variant === 'warning' && 'bg-semantic-warning',
          variant === 'error' && 'bg-semantic-error',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
