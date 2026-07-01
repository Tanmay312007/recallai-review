import { cn } from '../utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-[inherit] bg-background-overlay',
        variant === 'circular' && 'rounded-full',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-[var(--bg-elevated)] before:to-transparent',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
