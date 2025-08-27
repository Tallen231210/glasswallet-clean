'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'glow' | 'lift' | 'tilt' | 'scale' | 'rainbow' | 'none';
  clickEffect?: 'ripple' | 'scale' | 'glow' | 'none';
  disabled?: boolean;
  onClick?: () => void;
  glowColor?: string;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className,
  hoverEffect = 'lift',
  clickEffect = 'ripple',
  disabled = false,
  onClick,
  glowColor = '#00ff88'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const rippleTimeouts = useRef<Set<number>>(new Set());

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || disabled || hoverEffect !== 'tilt') return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (clickEffect === 'ripple') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples(prev => [...prev, { id, x, y }]);

      const timeoutId = window.setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
        rippleTimeouts.current.delete(timeoutId);
      }, 600);

      rippleTimeouts.current.add(timeoutId);
    }

    onClick?.();
  };

  const getHoverStyles = () => {
    if (disabled || !isHovered) return '';

    switch (hoverEffect) {
      case 'glow':
        return 'shadow-lg shadow-neon-green/20 scale-[1.02]';
      case 'lift':
        return 'transform-gpu translate-y-[-4px] shadow-xl shadow-black/20';
      case 'scale':
        return 'scale-[1.05]';
      case 'tilt':
        return '';
      case 'rainbow':
        return 'shadow-lg shadow-purple-500/20 scale-[1.02]';
      default:
        return '';
    }
  };

  const getTiltStyles = () => {
    if (hoverEffect !== 'tilt' || disabled) return {};
    return {
      transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    };
  };

  const getRainbowAnimation = () => {
    if (hoverEffect !== 'rainbow' || !isHovered) return '';
    return 'animate-rainbow-border';
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden transition-all duration-300 ease-out cursor-pointer',
        'backdrop-blur-md bg-white/5 border border-white/10 rounded-xl',
        getHoverStyles(),
        getRainbowAnimation(),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={getTiltStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Ripple Effect */}
      {clickEffect === 'ripple' && ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute animate-ripple rounded-full bg-white/30"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}

      {/* Glow Effect */}
      {hoverEffect === 'glow' && isHovered && !disabled && (
        <div
          className="absolute inset-0 opacity-20 blur-xl"
          style={{
            background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Rainbow Border Effect */}
      {hoverEffect === 'rainbow' && isHovered && !disabled && (
        <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-r from-pink-500 via-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 animate-spin-slow opacity-60">
          <div className="h-full w-full rounded-xl bg-black/80" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes rainbow-border {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-ripple {
          animation: ripple 0.6s linear;
        }

        .animate-rainbow-border {
          background: linear-gradient(
            45deg,
            #ff0000, #ff7300, #fffb00, #48ff00, 
            #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000
          );
          background-size: 400%;
          animation: rainbow-border 2s ease infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Floating Action Button with micro-interactions
interface FloatingActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  color?: 'neon' | 'blue' | 'purple' | 'red';
  tooltip?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  children,
  onClick,
  className,
  position = 'bottom-right',
  size = 'md',
  color = 'neon',
  tooltip
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-16 h-16 text-lg'
  };

  const colorClasses = {
    neon: 'bg-gradient-to-r from-neon-green to-emerald-400 shadow-neon-green/50',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-blue-500/50',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-400 shadow-purple-500/50',
    red: 'bg-gradient-to-r from-red-500 to-orange-400 shadow-red-500/50'
  };

  return (
    <>
      <button
        className={cn(
          'fixed z-50 rounded-full flex items-center justify-center text-white font-medium',
          'transform transition-all duration-300 ease-out',
          'shadow-lg hover:shadow-xl active:scale-95',
          'backdrop-blur-md border border-white/20',
          positionClasses[position],
          sizeClasses[size],
          colorClasses[color],
          isHovered && 'scale-110 rotate-3',
          className
        )}
        onMouseEnter={() => {
          setIsHovered(true);
          setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTooltip(false);
        }}
        onClick={onClick}
      >
        <div className={cn('transition-transform duration-200', isHovered && 'scale-110')}>
          {children}
        </div>
        
        {/* Pulse Animation */}
        <div className={cn(
          'absolute inset-0 rounded-full animate-ping opacity-20',
          color === 'neon' ? 'bg-neon-green' :
          color === 'blue' ? 'bg-blue-500' :
          color === 'purple' ? 'bg-purple-500' : 'bg-red-500'
        )} />
      </button>

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className={cn(
          'fixed z-50 px-3 py-2 text-sm text-white bg-black/80 rounded-lg',
          'backdrop-blur-md border border-white/20 whitespace-nowrap',
          'transform transition-all duration-200 ease-out',
          'animate-in fade-in slide-in-from-bottom-2',
          position === 'bottom-right' && 'bottom-20 right-6',
          position === 'bottom-left' && 'bottom-20 left-6',
          position === 'top-right' && 'top-20 right-6',
          position === 'top-left' && 'top-20 left-6'
        )}>
          {tooltip}
          <div className={cn(
            'absolute w-2 h-2 bg-black/80 border-r border-b border-white/20 transform rotate-45',
            position.includes('bottom') && '-top-1 left-1/2 -translate-x-1/2',
            position.includes('top') && '-bottom-1 left-1/2 -translate-x-1/2'
          )} />
        </div>
      )}
    </>
  );
};

// Animated Counter component
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  className,
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const [currentValue, setCurrentValue] = useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = currentValue;
    const difference = value - startValue;

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newValue = startValue + (difference * easeOut);
      
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}{currentValue.toFixed(decimals)}{suffix}
    </span>
  );
};