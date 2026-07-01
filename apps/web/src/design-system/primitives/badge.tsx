import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md font-medium select-none',
  {
    variants: {
      variant: {
        default: 'bg-background-overlay text-foreground-muted',
        brand: 'bg-brand-subtle text-brand',
        success: 'bg-semantic-success/10 text-semantic-success',
        warning: 'bg-semantic-warning/10 text-semantic-warning',
        error: 'bg-semantic-error/10 text-semantic-error',
        info: 'bg-semantic-info/10 text-semantic-info',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-caption',
        md: 'px-2 py-0.5 text-caption',
        lg: 'px-2.5 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
