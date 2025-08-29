'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Debounce hook for performance optimization
export const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Throttle hook for performance optimization
export const useThrottle = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
};

// Memoized search/filter hook
export const useMemoizedFilter = <T>(
  items: T[],
  searchTerm: string,
  filterFn: (item: T, searchTerm: string) => boolean,
  dependencies: any[] = []
) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return items;
    return items.filter(item => filterFn(item, searchTerm.toLowerCase()));
  }, [items, searchTerm, ...dependencies]);
};

// Virtualization hook for large lists
export const useVirtualization = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) => {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
    const totalHeight = itemCount * itemHeight;
    
    return {
      visibleCount,
      totalHeight,
      itemHeight,
    };
  }, [itemCount, itemHeight, containerHeight]);
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      options
    );

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [callback, options]);

  return targetRef;
};

// Optimized async state management
export const useAsyncState = <T>(
  initialState: T
): [T, (newState: T | ((prev: T) => T)) => void, boolean] => {
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);

  const optimizedSetState = useCallback((newState: T | ((prev: T) => T)) => {
    setIsPending(true);
    
    // Use requestIdleCallback if available, otherwise fallback to setTimeout
    const scheduleUpdate = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback);
      } else {
        setTimeout(callback, 0);
      }
    };

    scheduleUpdate(() => {
      setState(newState);
      setIsPending(false);
    });
  }, []);

  return [state, optimizedSetState, isPending];
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - renderStartTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime}ms`);
    }
    
    renderStartTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
  };
};

// Memory leak prevention hook
export const useCleanup = (cleanupFn: () => void, dependencies: any[] = []) => {
  useEffect(() => {
    return cleanupFn;
  }, dependencies);
};