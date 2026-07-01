import { cn } from '../utils/cn';
import { Button } from '../primitives/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-8 text-center', className)}>
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background-overlay text-foreground-muted">
          {icon}
        </div>
      )}
      <h3 className="text-title text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-foreground-secondary">{description}</p>
      )}
      {action && (
        <Button variant="primary" size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
