import { cn } from '../utils/cn';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  label?: string;
}

export function Divider({ orientation = 'horizontal', className, label }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('mx-2 w-px self-stretch bg-border', className)} role="separator" aria-orientation="vertical" />
    );
  }

  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)} role="separator" aria-orientation="horizontal">
        <div className="flex-1 border-t border-border" />
        <span className="text-caption text-foreground-muted">{label}</span>
        <div className="flex-1 border-t border-border" />
      </div>
    );
  }

  return <div className={cn('my-2 border-t border-border', className)} role="separator" aria-orientation="horizontal" />;
}
