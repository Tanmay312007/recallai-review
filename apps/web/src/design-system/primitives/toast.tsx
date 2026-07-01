'use client';

import { useEffect, useState } from 'react';
import { cn } from '../utils/cn';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-l-semantic-success',
  error: 'border-l-semantic-error',
  info: 'border-l-brand',
  warning: 'border-l-semantic-warning',
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg className="h-4 w-4 text-semantic-success" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg className="h-4 w-4 text-semantic-error" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4 text-brand" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7v4M8 5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg className="h-4 w-4 text-semantic-warning" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3L2 13h12L8 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 8v3M8 6v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

function ToastItem({ id, message, variant = 'info', duration = 4000, onDismiss }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(id), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-border bg-background-elevated px-4 py-3 shadow-high border-l-4',
        'transition-all duration-slow',
        exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0',
        variantStyles[variant],
      )}
      role="alert"
    >
      {variantIcons[variant]}
      <p className="flex-1 text-sm text-foreground">{message}</p>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onDismiss(id), 200); }}
        className="text-foreground-muted hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 max-w-sm" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export type { ToastData, ToastVariant };
