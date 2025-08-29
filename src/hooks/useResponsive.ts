'use client';

import { useState, useEffect, useCallback } from 'react';

// Breakpoint definitions matching Tailwind CSS
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Hook for responsive design utilities
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined' 
      ? window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      : 'landscape'
  );

  const updateSize = useCallback(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      window.addEventListener('orientationchange', updateSize);
      
      return () => {
        window.removeEventListener('resize', updateSize);
        window.removeEventListener('orientationchange', updateSize);
      };
    }
  }, [updateSize]);

  // Check if current screen size is at or above a breakpoint
  const isAbove = useCallback((breakpoint: Breakpoint): boolean => {
    return windowSize.width >= breakpoints[breakpoint];
  }, [windowSize.width]);

  // Check if current screen size is below a breakpoint
  const isBelow = useCallback((breakpoint: Breakpoint): boolean => {
    return windowSize.width < breakpoints[breakpoint];
  }, [windowSize.width]);

  // Check if current screen size is between two breakpoints
  const isBetween = useCallback((min: Breakpoint, max: Breakpoint): boolean => {
    return windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max];
  }, [windowSize.width]);

  // Current breakpoint
  const currentBreakpoint = useCallback((): Breakpoint => {
    const width = windowSize.width;
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'sm'; // Default for very small screens
  }, [windowSize.width]);

  // Device type detection
  const deviceType = useCallback(() => {
    const width = windowSize.width;
    if (width < breakpoints.sm) return 'mobile';
    if (width < breakpoints.lg) return 'tablet';
    return 'desktop';
  }, [windowSize.width]);

  // Utility functions
  const isMobile = useCallback(() => deviceType() === 'mobile', [deviceType]);
  const isTablet = useCallback(() => deviceType() === 'tablet', [deviceType]);
  const isDesktop = useCallback(() => deviceType() === 'desktop', [deviceType]);

  return {
    windowSize,
    orientation,
    isAbove,
    isBelow,
    isBetween,
    currentBreakpoint: currentBreakpoint(),
    deviceType: deviceType(),
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
  };
};

// Hook for responsive values
export const useResponsiveValue = <T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T => {
  const { deviceType } = useResponsive();
  
  switch (deviceType) {
    case 'mobile':
      return values.mobile ?? values.default;
    case 'tablet':
      return values.tablet ?? values.default;
    case 'desktop':
      return values.desktop ?? values.default;
    default:
      return values.default;
  }
};

// Hook for responsive grid columns
export const useResponsiveColumns = (config: {
  mobile: number;
  tablet: number;
  desktop: number;
}): number => {
  return useResponsiveValue({
    mobile: config.mobile,
    tablet: config.tablet,
    desktop: config.desktop,
    default: config.desktop,
  });
};

// Hook for touch device detection
export const useTouchDevice = (): boolean => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });

    return () => {
      window.removeEventListener('touchstart', checkTouch);
    };
  }, []);

  return isTouch;
};

// Hook for responsive spacing
export const useResponsiveSpacing = (config: {
  mobile: string;
  tablet: string;
  desktop: string;
}): string => {
  return useResponsiveValue({
    mobile: config.mobile,
    tablet: config.tablet,
    desktop: config.desktop,
    default: config.desktop,
  });
};