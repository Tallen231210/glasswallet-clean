import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'neon' | 'white';
}

const spinnerSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const spinnerVariants = {
  default: 'border-gray-300 border-t-neon-green',
  neon: 'border-neon-green/30 border-t-neon-green',
  white: 'border-white/30 border-t-white',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'neon',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        spinnerSizes[size],
        spinnerVariants[variant],
        className
      )}
      {...props}
    />
  );
};

interface LoadingProps {
  message?: string;
  size?: SpinnerProps['size'];
  variant?: SpinnerProps['variant'];
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'lg',
  variant = 'neon',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Spinner size={size} variant={variant} />
      <p className="text-gray-400 text-sm font-medium">{message}</p>
    </div>
  );
};

export default Spinner;