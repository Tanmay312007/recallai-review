'use client';

import { forwardRef, useId } from 'react';
import { cn } from '../utils/cn';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;

    return (
      <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none group">
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            role="switch"
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-5 w-9 rounded-full bg-background-overlay transition-colors duration-fast',
              'peer-checked:bg-brand',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--focus-ring)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              className,
            )}
          >
            <div
              className={cn(
                'h-4 w-4 rounded-full bg-white shadow-low transition-transform duration-fast',
                'translate-x-0.5 translate-y-0.5',
                'peer-checked:translate-x-[1.125rem]',
              )}
            />
          </div>
        </div>
        {label && <span className="text-sm text-foreground">{label}</span>}
      </label>
    );
  },
);
Switch.displayName = 'Switch';
