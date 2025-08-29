import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  variant?: 'default' | 'neon';
  size?: 'sm' | 'md' | 'lg';
}

const toggleSizes = {
  sm: {
    track: 'w-8 h-5',
    thumb: 'w-4 h-4',
    translate: 'translate-x-3',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'translate-x-7',
  },
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ 
    label, 
    description, 
    variant = 'neon', 
    size = 'md',
    className, 
    disabled,
    ...props 
  }, ref) => {
    const sizes = toggleSizes[size];

    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            disabled={disabled}
            ref={ref}
            {...props}
          />
          <label className="cursor-pointer">
            <div
              className={cn(
                'relative inline-flex items-center rounded-full transition-colors duration-200',
                sizes.track,
                // Background colors
                variant === 'neon' 
                  ? 'peer-checked:bg-neon-green bg-gray-600' 
                  : 'peer-checked:bg-blue-600 bg-gray-600',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200',
                  sizes.thumb,
                  'translate-x-0.5',
                  // Checked position
                  props.checked && sizes.translate
                )}
              />
            </div>
          </label>
        </div>
        
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <div className="text-sm font-medium text-white">
                {label}
              </div>
            )}
            {description && (
              <div className="text-sm text-gray-400">
                {description}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = "Toggle";

export default Toggle;