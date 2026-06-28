'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;

    const checkbox = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={cn(
          'peer h-5 w-5 shrink-0 rounded-micro border border-white/[0.12] bg-surface-2',
          'transition-all duration-spring ease-spring',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:border-transparent data-[state=checked]:bg-accent-gradient data-[state=checked]:text-text-inverse',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    if (!label) return checkbox;

    return (
      <label htmlFor={checkboxId} className="inline-flex cursor-pointer items-center gap-3">
        {checkbox}
        <span className="type-body-m text-text-primary">{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
