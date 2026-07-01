'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../utils/cn';

interface DropdownItem {
  label: string;
  onSelect?: () => void;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: (DropdownItem | { separator: true })[];
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function DropdownMenu({ trigger, items, align = 'start', className }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={4}
          className={cn(
            'z-popover min-w-[180px] rounded-lg border border-border bg-background-elevated p-1 shadow-high',
            'data-[state=open]:animate-scale-in',
            className,
          )}
        >
          {items.map((item, i) => {
            if ('separator' in item) {
              return <DropdownMenuPrimitive.Separator key={i} className="my-1 h-px bg-border" />;
            }
            const { label, onSelect, icon, shortcut, disabled, destructive } = item as DropdownItem;
            return (
              <DropdownMenuPrimitive.Item
                key={i}
                onSelect={onSelect}
                disabled={disabled}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-fast outline-none',
                  'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
                  destructive
                    ? 'text-semantic-error data-[highlighted]:bg-semantic-error/10'
                    : 'text-foreground data-[highlighted]:bg-background-overlay',
                )}
              >
                {icon && <span className="h-4 w-4 text-foreground-muted">{icon}</span>}
                <span className="flex-1">{label}</span>
                {shortcut && (
                  <span className="text-caption text-foreground-muted">{shortcut}</span>
                )}
              </DropdownMenuPrimitive.Item>
            );
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
