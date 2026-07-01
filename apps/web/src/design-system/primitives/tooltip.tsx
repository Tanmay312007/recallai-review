'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../utils/cn';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delayDuration?: number;
}

export function Tooltip({ content, children, side = 'top', className, delayDuration = 300 }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={4}
            className={cn(
              'z-tooltip rounded-md bg-foreground px-2.5 py-1.5 text-caption font-medium text-background shadow-low',
              'data-[state=delayed-open]:animate-fade-in',
              className,
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-foreground" width={8} height={4} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
