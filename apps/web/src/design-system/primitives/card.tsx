import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const cardVariants = cva('rounded-lg transition-shadow duration-fast', {
  variants: {
    variant: {
      elevated: 'bg-background-elevated shadow-low',
      outlined: 'bg-background-surface border border-border',
      flat: 'bg-background-surface',
      interactive:
        'bg-background-surface border border-border cursor-pointer hover:border-border-hover hover:shadow-low hover:bg-background-elevated',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    padding: 'md',
  },
});

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, padding }), className)} {...props} />;
}

export { cardVariants };
