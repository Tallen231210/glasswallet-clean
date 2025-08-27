'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedLoadingProps {
  variant?: 'default' | 'pulse' | 'dots' | 'bars' | 'ring' | 'wave' | 'matrix';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  overlay?: boolean;
  color?: 'neon' | 'blue' | 'purple' | 'white';
  className?: string;
}

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  variant = 'default',
  size = 'md',
  message,
  overlay = false,
  color = 'neon',
  className
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    neon: 'text-neon-green',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    white: 'text-white'
  };

  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div className={cn('relative', sizeClasses[size])}>
            <div className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-20',
              color === 'neon' ? 'bg-neon-green' :
              color === 'blue' ? 'bg-blue-400' :
              color === 'purple' ? 'bg-purple-400' : 'bg-white'
            )} />
            <div className={cn(
              'absolute inset-0 rounded-full animate-pulse',
              color === 'neon' ? 'bg-neon-green' :
              color === 'blue' ? 'bg-blue-400' :
              color === 'purple' ? 'bg-purple-400' : 'bg-white'
            )} />
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full animate-bounce',
                  size === 'sm' ? 'w-2 h-2' :
                  size === 'md' ? 'w-3 h-3' :
                  size === 'lg' ? 'w-4 h-4' : 'w-5 h-5',
                  color === 'neon' ? 'bg-neon-green' :
                  color === 'blue' ? 'bg-blue-400' :
                  color === 'purple' ? 'bg-purple-400' : 'bg-white'
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div className="flex items-end space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'animate-pulse',
                  size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : size === 'lg' ? 'w-2' : 'w-3',
                  color === 'neon' ? 'bg-neon-green' :
                  color === 'blue' ? 'bg-blue-400' :
                  color === 'purple' ? 'bg-purple-400' : 'bg-white'
                )}
                style={{
                  height: `${12 + i * 4}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );

      case 'ring':
        return (
          <div className={cn('relative', sizeClasses[size])}>
            <svg className="animate-spin w-full h-full" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="50"
                strokeDashoffset="50"
                className={cn('opacity-20', colorClasses[color])}
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="50"
                strokeDashoffset="15"
                className={cn(colorClasses[color])}
                style={{
                  animation: 'spin 1s linear infinite, dash 1.5s ease-in-out infinite'
                }}
              />
            </svg>
            <style jsx>{`
              @keyframes dash {
                0% {
                  stroke-dasharray: 1, 150;
                  stroke-dashoffset: 0;
                }
                50% {
                  stroke-dasharray: 90, 150;
                  stroke-dashoffset: -35;
                }
                100% {
                  stroke-dasharray: 90, 150;
                  stroke-dashoffset: -124;
                }
              }
            `}</style>
          </div>
        );

      case 'wave':
        return (
          <div className="flex items-center space-x-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full animate-bounce',
                  size === 'sm' ? 'w-1.5 h-1.5' :
                  size === 'md' ? 'w-2 h-2' :
                  size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
                  color === 'neon' ? 'bg-neon-green' :
                  color === 'blue' ? 'bg-blue-400' :
                  color === 'purple' ? 'bg-purple-400' : 'bg-white'
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.2s'
                }}
              />
            ))}
          </div>
        );

      case 'matrix':
        return (
          <div className={cn('relative overflow-hidden', sizeClasses[size])}>
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'w-full h-0.5 animate-pulse',
                    color === 'neon' ? 'bg-gradient-to-r from-transparent via-neon-green to-transparent' :
                    color === 'blue' ? 'bg-gradient-to-r from-transparent via-blue-400 to-transparent' :
                    color === 'purple' ? 'bg-gradient-to-r from-transparent via-purple-400 to-transparent' :
                    'bg-gradient-to-r from-transparent via-white to-transparent'
                  )}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex justify-between">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'w-0.5 h-full animate-pulse',
                    color === 'neon' ? 'bg-gradient-to-b from-transparent via-neon-green to-transparent' :
                    color === 'blue' ? 'bg-gradient-to-b from-transparent via-blue-400 to-transparent' :
                    color === 'purple' ? 'bg-gradient-to-b from-transparent via-purple-400 to-transparent' :
                    'bg-gradient-to-b from-transparent via-white to-transparent'
                  )}
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className={cn('relative', sizeClasses[size])}>
            <svg className="animate-spin w-full h-full" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={cn('opacity-20', colorClasses[color])}
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M12 2a10 10 0 0 1 10 10"
                className={cn(colorClasses[color])}
              />
            </svg>
          </div>
        );
    }
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="mb-4">
        {renderLoader()}
      </div>
      {message && (
        <div className={cn(
          'text-center animate-pulse',
          size === 'sm' ? 'text-xs' :
          size === 'md' ? 'text-sm' :
          size === 'lg' ? 'text-base' : 'text-lg',
          colorClasses[color]
        )}>
          {message}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-black/80 rounded-xl p-8 border border-white/10 backdrop-blur-md">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Skeleton loader component for content loading states
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  lines?: number;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  lines = 1,
  animated = true
}) => {
  const baseClasses = cn(
    'bg-white/10 rounded',
    animated && 'animate-pulse',
    className
  );

  switch (variant) {
    case 'text':
      if (lines === 1) {
        return <div className={cn(baseClasses, 'h-4 w-full')} />;
      }
      return (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                baseClasses,
                'h-4',
                i === lines - 1 ? 'w-3/4' : 'w-full'
              )}
            />
          ))}
        </div>
      );

    case 'circular':
      return <div className={cn(baseClasses, 'rounded-full', className)} />;

    case 'card':
      return (
        <div className={cn('space-y-4', className)}>
          <Skeleton variant="rectangular" className="h-48 w-full" />
          <div className="space-y-2">
            <Skeleton variant="text" className="h-6 w-3/4" />
            <Skeleton variant="text" lines={2} />
          </div>
        </div>
      );

    default:
      return <div className={baseClasses} />;
  }
};

// Page loading component with enhanced visuals
interface PageLoadingProps {
  message?: string;
  progress?: number;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
  progress
}) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <EnhancedLoading variant="matrix" size="xl" color="neon" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">GlassWallet</h2>
        
        <div className="mb-6">
          <EnhancedLoading variant="wave" size="md" color="neon" />
        </div>

        <p className="text-gray-300 text-lg mb-4">{message}</p>

        {progress !== undefined && (
          <div className="w-64 mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Loading</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-green to-blue-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500">
          Powered by AI-driven credit intelligence
        </div>
      </div>
    </div>
  );
};