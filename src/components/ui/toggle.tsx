'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export interface ToggleProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  description?: string;
}

const Toggle = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, ToggleProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;

    const switchEl = (
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
          'border border-transparent bg-surface-3 transition-colors duration-spring',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:border-transparent data-[state=checked]:bg-accent-gradient',
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md',
            'transition-transform duration-spring ease-spring',
            'translate-x-0.5 data-[state=checked]:translate-x-[22px]'
          )}
        />
      </SwitchPrimitive.Root>
    );

    if (!label && !description) return switchEl;

    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          {label ? (
            <label htmlFor={switchId} className="type-body-m cursor-pointer text-text-primary">
              {label}
            </label>
          ) : null}
          {description ? (
            <p className="type-body-m text-text-tertiary">{description}</p>
          ) : null}
        </div>
        {switchEl}
      </div>
    );
  }
);
Toggle.displayName = 'Toggle';

export { Toggle };
