import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCardProps } from '@/types';

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = false,
  neonBorder = false,
  padding = 'normal',
}) => {
  const paddingClass = {
    compact: 'glass-card-compact',
    normal: '', // Default padding is already in glass-card
    spacious: 'glass-card-spacious', 
    none: 'glass-card-no-padding'
  }[padding];

  return (
    <div
      className={cn(
        'glass-card',
        hover && 'glass-card-hover',
        neonBorder && 'neon-border',
        paddingClass,
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;