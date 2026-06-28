'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)]',
    'text-body-m text-text-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]',
    'backdrop-blur-apple backdrop-saturate-[180%]',
    'placeholder:text-text-tertiary',
    'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
    'hover:border-[var(--glass-border-active)]',
    'focus:border-[var(--pulse-core)] focus:outline-none focus:ring-4 focus:ring-[var(--pulse-subtle)] focus:scale-[1.005]',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      inputSize: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3 text-body-m',
        lg: 'h-12 px-4 text-body-l',
      },
    },
    defaultVariants: {
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize, leftIcon, rightIcon, wrapperClassName, type = 'text', ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className={cn('relative flex items-center', wrapperClassName)}>
          {leftIcon ? (
            <span className="pointer-events-none absolute left-3.5 flex text-text-tertiary [&>svg]:h-[18px] [&>svg]:w-[18px]">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            type={type}
            className={cn(
              inputVariants({ inputSize }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon ? (
            <span className="pointer-events-none absolute right-3.5 flex text-text-tertiary [&>svg]:h-[18px] [&>svg]:w-[18px]">
              {rightIcon}
            </span>
          ) : null}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        className={cn(inputVariants({ inputSize, className }))}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, inputSize, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        inputVariants({ inputSize }),
        'min-h-[120px] resize-y py-3 leading-relaxed',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Input, Textarea, inputVariants };
