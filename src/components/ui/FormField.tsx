import React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('w-full space-y-2', className)} {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && (
            <span className="text-neon-green ml-1">*</span>
          )}
        </label>
      )}
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <span className="text-xs">⚠</span>
          <span>{error}</span>
        </div>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};