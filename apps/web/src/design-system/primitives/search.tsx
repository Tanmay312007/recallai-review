'use client';

import { forwardRef } from 'react';
import { cn } from '../utils/cn';

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({ className, value, onChange, onClear, ...props }, ref) => {
    return (
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={ref}
          type="text"
          role="searchbox"
          value={value}
          onChange={onChange}
          className={cn(
            'flex h-9 w-full rounded-lg border bg-background-surface pl-9 pr-8 text-sm text-foreground placeholder:text-foreground-muted transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        {value && onClear && (
          <button
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    );
  },
);
Search.displayName = 'Search';
