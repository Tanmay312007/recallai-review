'use client';

import { forwardRef, useId } from 'react';
import { cn } from '../utils/cn';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;

    return (
      <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none group">
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-4 w-4 rounded border border-border bg-background-surface transition-colors duration-fast',
              'group-hover:border-border-hover',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--focus-ring)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
              'peer-checked:bg-brand peer-checked:border-brand',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              className,
            )}
          >
            <svg
              className="hidden peer-checked:block h-full w-full text-white"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {label && <span className="text-sm text-foreground">{label}</span>}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
