import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'neon' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
}

const progressSizes = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const progressVariants = {
  default: 'bg-neon-green/30',
  neon: 'bg-neon-green shadow-neon-glow',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'neon',
  showLabel = false,
  label,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-white/10 rounded-full overflow-hidden',
          progressSizes[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            progressVariants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;