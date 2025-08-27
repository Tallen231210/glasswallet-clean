import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'search' | 'password';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    ...props 
  }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              // Base styles
              "w-full glass-card text-white placeholder-gray-400 border-white/20 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-neon-green/30 focus:border-neon-green/50",
              // Padding adjustments for icons
              leftIcon ? "pl-10" : "pl-4",
              rightIcon ? "pr-10" : "pr-4",
              "py-3",
              // Variants
              variant === 'search' && "rounded-full",
              variant === 'password' && "font-mono tracking-wider",
              // Error state
              error && "border-red-400 focus:ring-red-400/30 focus:border-red-400/50",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";