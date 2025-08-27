import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'danger' | 'info' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const badgeVariants = {
  default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  success: 'bg-green-500/20 text-green-300 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-300 border-red-500/30',
  danger: 'bg-red-500/20 text-red-300 border-red-500/30', // Maps to same as error
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  neon: 'bg-neon-green/20 text-neon-green border-neon-green/30 shadow-neon-glow',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        // Base styles
        'inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-sm',
        // Variants
        badgeVariants[variant],
        // Sizes
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <div 
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'neon' ? 'bg-neon-green' :
            variant === 'success' ? 'bg-green-400' :
            variant === 'warning' ? 'bg-yellow-400' :
            variant === 'error' ? 'bg-red-400' :
            variant === 'danger' ? 'bg-red-400' :
            variant === 'info' ? 'bg-blue-400' :
            'bg-gray-400'
          )}
        />
      )}
      {children}
    </div>
  );
};