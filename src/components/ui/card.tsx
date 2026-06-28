'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  [
    'relative overflow-hidden rounded-xl',
    'border border-[var(--glass-border)] bg-[var(--glass-bg)]',
    'shadow-apple-md backdrop-blur-apple backdrop-saturate-[180%]',
    'transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
    'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]',
    'before:shadow-[inset_0_1px_0_var(--glass-border-highlight)]',
  ].join(' '),
  {
    variants: {
      padding: {
        default: 'p-5',
        lg: 'p-6',
        none: 'p-0',
      },
      interactive: {
        true: [
          'cursor-pointer',
          'hover:-translate-y-[3px] hover:scale-[1.005] hover:shadow-apple-lg',
          'hover:border-[var(--glass-border-active)]',
        ].join(' '),
        false: '',
      },
      variant: {
        default: '',
        glass: 'backdrop-blur-apple-strong',
        gradient: 'bg-apple-gradient-soft',
      },
    },
    defaultVariants: {
      padding: 'default',
      interactive: false,
      variant: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, interactive, variant, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(cardVariants({ padding, interactive, variant, className }))} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-[14px] font-semibold tracking-tight text-text-primary', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-[13px] text-text-secondary', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
