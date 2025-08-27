import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'positive' | 'negative';
    period?: string;
  };
  trend?: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'neon' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

const variantStyles = {
  default: {
    icon: 'bg-gray-500/20 text-gray-400',
    value: 'text-white',
  },
  neon: {
    icon: 'bg-neon-green/20 text-neon-green',
    value: 'text-neon-green',
  },
  success: {
    icon: 'bg-green-500/20 text-green-400',
    value: 'text-green-400',
  },
  warning: {
    icon: 'bg-yellow-500/20 text-yellow-400',
    value: 'text-yellow-400',
  },
  error: {
    icon: 'bg-red-500/20 text-red-400',
    value: 'text-red-400',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  description,
  icon,
  variant = 'default',
  loading = false,
  className,
  ...props
}) => {
  const styles = variantStyles[variant];

  return (
    <GlassCard className={cn('p-6', className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-1">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
          ) : (
            <p className={cn('text-2xl font-bold mb-1', styles.value)}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
          {(change || trend) && !loading && (
            <div className="flex items-center text-sm">
              {change && (
                <span
                  className={cn(
                    'flex items-center gap-1 font-medium',
                    (change.type === 'increase' || change.type === 'positive') ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {(change.type === 'increase' || change.type === 'positive') ? '↗' : '↘'}
                  {Math.abs(change.value)}%
                </span>
              )}
              {change && change.period && (
                <span className="text-gray-500 ml-2">
                  vs {change.period}
                </span>
              )}
              {trend && !change && (
                <span className="text-gray-400">{trend}</span>
              )}
            </div>
          )}
          {description && !loading && (
            <p className="text-sm text-gray-400 mt-2">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center text-xl',
            styles.icon
          )}>
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
};