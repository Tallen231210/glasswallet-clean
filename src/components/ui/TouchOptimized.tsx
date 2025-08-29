'use client';

import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTouchDevice, useResponsive } from '@/hooks/useResponsive';
import { NeonButton } from './NeonButton';

// Touch-optimized button with haptic feedback
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  haptic?: boolean;
  children: React.ReactNode;
}

const TouchButtonComponent: React.FC<TouchButtonProps> = ({
  variant = 'primary',
  size = 'md',
  haptic = true,
  className,
  children,
  onClick,
  ...props
}) => {
  const isTouch = useTouchDevice();
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  }, [haptic]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const sizeClasses = {
    sm: 'px-4 py-3 text-sm min-h-[44px]', // 44px minimum for touch
    md: 'px-6 py-4 text-base min-h-[48px]',
    lg: 'px-8 py-5 text-lg min-h-[52px]',
  };

  const variantClasses = {
    primary: 'bg-neon-green text-black hover:bg-neon-green/90',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      {...props}
      className={cn(
        'rounded-lg font-semibold transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2 focus:ring-offset-black',
        sizeClasses[size],
        variantClasses[variant],
        isPressed && 'scale-95',
        isTouch && 'active:scale-95',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const TouchButton = memo(TouchButtonComponent);

// Swipeable card component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  className?: string;
}

const SwipeableCardComponent: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    setDragOffset(diff);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const diff = currentX.current - startX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (diff < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, swipeThreshold, onSwipeLeft, onSwipeRight]);

  return (
    <div
      className={cn('touch-pan-y', className)}
      style={{
        transform: `translateX(${dragOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

export const SwipeableCard = memo(SwipeableCardComponent);

// Pull-to-refresh component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
}

const PullToRefreshComponent: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  className,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || containerRef.current?.scrollTop !== 0) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      e.preventDefault();
      setPullDistance(Math.min(diff * 0.5, refreshThreshold * 1.5));
    }
  }, [isPulling, refreshThreshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [isPulling, pullDistance, refreshThreshold, onRefresh]);

  const refreshProgress = Math.min((pullDistance / refreshThreshold) * 100, 100);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-white/5 backdrop-blur-sm transition-all duration-200 z-10"
        style={{
          height: pullDistance > 0 ? Math.min(pullDistance, refreshThreshold) : 0,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-3">
          {isRefreshing ? (
            <>
              <div className="w-4 h-4 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-neon-green">Refreshing...</span>
            </>
          ) : (
            <>
              <div
                className="w-4 h-4 border-2 border-gray-400 rounded-full"
                style={{
                  borderTopColor: refreshProgress >= 100 ? '#00ff88' : 'transparent',
                  transform: `rotate(${refreshProgress * 3.6}deg)`,
                }}
              />
              <span className="text-sm text-gray-400">
                {pullDistance >= refreshThreshold ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const PullToRefresh = memo(PullToRefreshComponent);

// Mobile-optimized modal
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullScreen?: boolean;
}

const MobileModalComponent: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  fullScreen = false,
}) => {
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-gray-900 border border-white/20',
          isMobile
            ? fullScreen
              ? 'w-full h-full rounded-none'
              : 'w-full max-h-[90vh] rounded-t-2xl'
            : 'w-full max-w-md max-h-[80vh] rounded-xl mx-4',
          'flex flex-col overflow-hidden'
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <TouchButton
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="!min-h-[36px] !px-3"
            >
              ✕
            </TouchButton>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export const MobileModal = memo(MobileModalComponent);