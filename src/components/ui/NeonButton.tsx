import React from 'react';
import { cn } from '@/lib/utils';
import { NeonButtonProps } from '@/types';

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className,
}) => {
  const baseClasses = 'relative font-medium transition-all duration-300 focus-neon';
  
  const variantClasses = {
    primary: 'bg-neon-green text-deep-navy-start hover:shadow-neon-glow',
    secondary: 'glass-card hover:glass-card-hover text-text-primary',
    danger: 'bg-bright-red text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600 hover:shadow-green-500/20',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && disabledClasses,
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  );
};

export default NeonButton;