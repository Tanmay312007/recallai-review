'use client';

import { useState } from 'react';
import { cn } from '../utils/cn';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  allowMultiple?: boolean;
}

export function Accordion({ items, className, allowMultiple = false }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggle = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : allowMultiple
          ? [...prev, id]
          : [id],
    );
  };

  return (
    <div className={cn('divide-y divide-border', className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        return (
          <div key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between py-3 text-sm font-medium text-foreground transition-colors duration-fast hover:text-foreground-secondary"
              aria-expanded={isOpen}
            >
              {item.title}
              <svg
                className={cn('h-4 w-4 text-foreground-muted transition-transform duration-fast', isOpen && 'rotate-180')}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && (
              <div className="pb-3 text-sm text-foreground-secondary">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
