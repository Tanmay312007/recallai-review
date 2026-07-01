'use client';

import { cn } from '../utils/cn';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-7 w-7 text-caption',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-14 w-14 text-lg',
};

export function Avatar({ src, alt = '', initials, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('rounded-full object-cover bg-background-overlay', sizeStyles[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-brand-subtle text-brand font-medium',
        sizeStyles[size],
        className,
      )}
      aria-label={alt || initials}
    >
      {initials ? initials.slice(0, 2).toUpperCase() : '?'}
    </div>
  );
}
