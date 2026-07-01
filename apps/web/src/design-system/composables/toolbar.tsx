import { cn } from '../utils/cn';
import { Button } from '../primitives/button';
import { Search } from '../primitives/search';

interface ToolbarAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ToolbarProps {
  actions?: ToolbarAction[];
  search?: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    placeholder?: string;
  };
  metadata?: React.ReactNode;
  className?: string;
}

export function Toolbar({ actions, search, metadata, className }: ToolbarProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {actions && (
        <div className="flex items-center gap-1.5">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant={action.variant || 'secondary'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}
      <div className="flex-1" />
      {search && (
        <Search
          value={search.value}
          onChange={search.onChange}
          onClear={search.onClear}
          placeholder={search.placeholder || 'Search...'}
          className="w-64"
        />
      )}
      {metadata && (
        <div className="text-caption text-foreground-muted">{metadata}</div>
      )}
    </div>
  );
}
