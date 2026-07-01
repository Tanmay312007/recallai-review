'use client';

import { forwardRef } from 'react';
import { cn } from '../utils/cn';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both';
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = 'vertical', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'overflow-auto',
          orientation === 'vertical' && 'overflow-x-hidden',
          orientation === 'horizontal' && 'overflow-y-hidden',
          '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2',
          '[&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border',
          '[&::-webkit-scrollbar-thumb:hover]:bg-border-hover',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ScrollArea.displayName = 'ScrollArea';
