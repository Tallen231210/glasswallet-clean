import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCardProps } from '@/types';

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = false,
  neonBorder = false,
}) => {
  return (
    <div
      className={cn(
        'glass-card',
        hover && 'glass-card-hover',
        neonBorder && 'neon-border',
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;