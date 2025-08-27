import React from 'react';
import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

const alertVariants = {
  info: {
    container: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    icon: '💡',
    iconBg: 'bg-blue-500/20 text-blue-400',
  },
  success: {
    container: 'bg-green-500/10 border-green-500/30 text-green-300',
    icon: '✓',
    iconBg: 'bg-green-500/20 text-green-400',
  },
  warning: {
    container: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    icon: '⚠',
    iconBg: 'bg-yellow-500/20 text-yellow-400',
  },
  error: {
    container: 'bg-red-500/10 border-red-500/30 text-red-300',
    icon: '✕',
    iconBg: 'bg-red-500/20 text-red-400',
  },
};

const alertSizes = {
  sm: 'p-3 text-sm',
  md: 'p-4 text-base',
  lg: 'p-6 text-lg',
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  size = 'md',
  title,
  dismissible = false,
  onDismiss,
  icon,
  children,
  className,
  ...props
}) => {
  const variantStyles = alertVariants[variant];
  const sizeStyles = alertSizes[size];

  return (
    <div
      className={cn(
        'relative rounded-lg border backdrop-blur-sm',
        variantStyles.container,
        sizeStyles,
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium',
          variantStyles.iconBg
        )}>
          {icon || variantStyles.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold mb-1">
              {title}
            </h4>
          )}
          <div className="text-sm opacity-90">
            {children}
          </div>
        </div>

        {/* Dismiss Button */}
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Dismiss alert"
          >
            <span className="text-sm">✕</span>
          </button>
        )}
      </div>
    </div>
  );
};