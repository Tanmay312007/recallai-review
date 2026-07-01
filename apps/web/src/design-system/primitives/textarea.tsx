'use client';

import { forwardRef, useId } from 'react';
import { cn } from '../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id: externalId, wrapperClassName, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="text-label text-foreground-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'flex w-full rounded-lg border bg-background-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted transition-colors duration-fast resize-y min-h-[80px]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-semantic-error focus-visible:ring-semantic-error',
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error && (
          <p className="text-caption text-semantic-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
