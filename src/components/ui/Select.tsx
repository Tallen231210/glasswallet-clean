'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    placeholder, 
    options,
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
          <select
            className={cn(
              // Base styles
              "w-full glass-card text-white border-white/20 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-neon-green/30 focus:border-neon-green/50",
              "px-4 py-3 pr-10",
              "appearance-none cursor-pointer",
              // Error state
              error && "border-red-400 focus:ring-red-400/30 focus:border-red-400/50",
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-gray-400">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-slate-800 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
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

Select.displayName = "Select";