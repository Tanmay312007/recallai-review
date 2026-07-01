'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../utils/cn';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, title, description, children, className }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-modal bg-black/60',
            'data-[state=open]:animate-fade-in',
            'data-[state=closed]:animate-fade-in data-[state=closed]:opacity-0',
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-modal w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background-elevated p-6 shadow-overlay',
            'data-[state=open]:animate-scale-in',
            'data-[state=closed]:animate-scale-in data-[state=closed]:opacity-0 data-[state=closed]:scale-95',
            className,
          )}
        >
          <DialogPrimitive.Title className="text-h4 text-foreground">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="mt-1 text-sm text-foreground-secondary">
              {description}
            </DialogPrimitive.Description>
          )}
          <div className="mt-4">{children}</div>
          <DialogPrimitive.Close className="absolute right-4 top-4 text-foreground-muted hover:text-foreground transition-colors rounded-sm focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
