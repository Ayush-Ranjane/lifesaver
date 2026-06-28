'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
    'disabled:pointer-events-none disabled:opacity-45',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'rounded-full bg-accent-gradient text-white',
          'shadow-apple-md',
          'hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-hover-lift hover:brightness-105',
          'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]',
          'before:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',
        ].join(' '),
        secondary: [
          'rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-text-primary',
          'shadow-apple-md backdrop-blur-apple backdrop-saturate-[180%]',
          'hover:-translate-y-0.5 hover:border-[var(--glass-border-active)] hover:shadow-apple-lg',
        ].join(' '),
        ghost: [
          'rounded-xl bg-transparent text-text-secondary',
          'hover:bg-[var(--glass-mid)] hover:text-text-primary hover:scale-[1.02]',
        ].join(' '),
        destructive: [
          'rounded-full border border-critical/20 bg-critical/10 text-critical',
          'hover:-translate-y-0.5 hover:bg-critical/16 hover:shadow-[0_4px_12px_rgba(220,38,38,0.15)]',
        ].join(' '),
        outline: [
          'rounded-full border border-[var(--glass-border)] bg-transparent text-text-primary',
          'hover:bg-[var(--glass-mid)] hover:border-[var(--glass-border-active)]',
        ].join(' '),
      },
      size: {
        default: 'relative h-10 px-5 text-[14px]',
        sm: 'relative h-8 px-4 text-[13px]',
        lg: 'relative h-11 px-6 text-[15px]',
        icon: 'h-9 w-9 rounded-xl bg-transparent text-text-secondary hover:bg-[var(--glass-mid)] hover:text-text-primary hover:shadow-none',
      },
    },
    compoundVariants: [
      {
        variant: ['primary', 'secondary', 'destructive', 'outline'],
        size: 'icon',
        className: 'border-0 bg-transparent text-text-secondary hover:bg-[var(--glass-mid)] hover:text-text-primary hover:shadow-none',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
