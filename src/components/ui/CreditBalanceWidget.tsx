'use client';

import React from 'react';
import { NeonButton } from './NeonButton';
import { cn } from '@/lib/utils';

interface CreditBalanceWidgetProps {
  balance: number;
  maxCredits?: number;
  size?: 'sm' | 'md' | 'lg';
  onBuyCredits?: () => void;
  className?: string;
  showBuyButton?: boolean;
}

export const CreditBalanceWidget: React.FC<CreditBalanceWidgetProps> = ({
  balance,
  maxCredits = 100,
  size = 'md',
  onBuyCredits,
  className,
  showBuyButton = true
}) => {
  // Calculate percentage for progress ring
  const percentage = Math.min((balance / maxCredits) * 100, 100);
  
  // Determine color scheme based on balance thresholds
  const getColorScheme = () => {
    if (balance > 50) {
      return {
        ring: 'stroke-neon-green',
        text: 'text-neon-green',
        glow: 'drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]',
        background: 'from-neon-green/20 to-neon-green/5'
      };
    } else if (balance >= 10) {
      return {
        ring: 'stroke-yellow-400',
        text: 'text-yellow-400',
        glow: 'drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]',
        background: 'from-yellow-400/20 to-yellow-400/5'
      };
    } else {
      return {
        ring: 'stroke-red-400',
        text: 'text-red-400',
        glow: 'drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]',
        background: 'from-red-400/20 to-red-400/5'
      };
    }
  };

  const colors = getColorScheme();

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-24 h-24',
      svg: 'w-24 h-24',
      strokeWidth: '3',
      radius: 42,
      textSize: 'text-sm',
      labelSize: 'text-xs',
      buttonSize: 'sm' as const
    },
    md: {
      container: 'w-32 h-32',
      svg: 'w-32 h-32',
      strokeWidth: '4',
      radius: 58,
      textSize: 'text-lg',
      labelSize: 'text-sm',
      buttonSize: 'sm' as const
    },
    lg: {
      container: 'w-40 h-40',
      svg: 'w-40 h-40',
      strokeWidth: '5',
      radius: 70,
      textSize: 'text-2xl',
      labelSize: 'text-base',
      buttonSize: 'md' as const
    }
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      {/* Circular Progress Ring */}
      <div className={cn('relative', config.container)}>
        {/* Background circle with gradient */}
        <div className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-br opacity-20',
          colors.background
        )} />
        
        {/* SVG Progress Ring */}
        <svg className={config.svg} viewBox="0 0 144 144">
          {/* Background ring */}
          <circle
            cx="72"
            cy="72"
            r={config.radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={config.strokeWidth}
            fill="none"
            className="drop-shadow-sm"
          />
          
          {/* Progress ring */}
          <circle
            cx="72"
            cy="72"
            r={config.radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 72 72)"
            className={cn(colors.ring, colors.glow, 'transition-all duration-1000 ease-out')}
            style={{
              filter: 'drop-shadow(0 0 8px currentColor)'
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn('font-bold leading-none', colors.text, config.textSize)}>
            {balance}
          </div>
          <div className={cn('text-gray-400 leading-none mt-1', config.labelSize)}>
            Credits
          </div>
        </div>
      </div>

      {/* Status indicator and buy button */}
      <div className="flex flex-col items-center space-y-2">
        {/* Status message */}
        <div className={cn('text-center', config.labelSize)}>
          {balance > 50 && (
            <span className="text-neon-green">✓ Good Balance</span>
          )}
          {balance <= 50 && balance >= 10 && (
            <span className="text-yellow-400">⚠ Running Low</span>
          )}
          {balance < 10 && (
            <span className="text-red-400">🚨 Critical Low</span>
          )}
        </div>

        {/* Buy credits button */}
        {showBuyButton && (
          <NeonButton
            size={config.buttonSize}
            onClick={onBuyCredits}
            className={cn(
              'transition-all duration-300',
              balance < 10 && 'animate-pulse shadow-lg shadow-neon-green/20'
            )}
          >
            {balance < 10 ? 'Buy Credits Now' : 'Buy More Credits'}
          </NeonButton>
        )}
      </div>
    </div>
  );
};