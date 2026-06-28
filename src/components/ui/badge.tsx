import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-full',
    'border border-[var(--glass-border)] bg-[var(--glass-bg)]',
    'px-2.5 py-0.5 text-caption font-semibold uppercase tracking-wide text-text-secondary',
    'shadow-[inset_0_1px_0_var(--glass-border-highlight)] backdrop-blur-apple',
    'transition-all duration-200 hover:scale-[1.03]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border-l-[3px] border-l-border',
        success: 'border-l-[3px] border-l-success text-success',
        warning: 'border-l-[3px] border-l-warning text-warning',
        critical: 'border-l-[3px] border-l-critical text-critical',
        info: 'border-l-[3px] border-l-info text-info',
        cyan: 'border-l-[3px] border-l-cyan text-cyan',
        gradient: 'border-l-0 bg-accent-gradient text-white shadow-apple-sm',
      },
      size: {
        default: '',
        sm: 'px-2 py-0 text-[10px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
