'use client';

import React, { Suspense, lazy, memo } from 'react';

// Lazy loading wrapper with error boundary
interface LazyComponentProps {
  importFn: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  children?: React.ReactNode;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
      <span className="text-gray-400">Loading...</span>
    </div>
  </div>
);

const DefaultErrorFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="text-red-400 text-xl mb-2">⚠️</div>
      <p className="text-gray-400">Failed to load component</p>
    </div>
  </div>
);

class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback />;
    }

    return this.props.children;
  }
}

export const LazyComponent: React.FC<LazyComponentProps> = memo(({
  importFn,
  fallback = <DefaultFallback />,
  errorFallback,
  children,
  ...props
}) => {
  const Component = lazy(importFn);

  return (
    <LazyErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <Component {...props}>
          {children}
        </Component>
      </Suspense>
    </LazyErrorBoundary>
  );
});

LazyComponent.displayName = 'LazyComponent';

// Utility function to create lazy components with pre-configured fallbacks
export const createLazyComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  options?: {
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
  }
) => {
  const LazyComponentWrapper = (props: any) => (
    <LazyComponent
      importFn={importFn}
      fallback={options?.fallback}
      errorFallback={options?.errorFallback}
      {...props}
    />
  );
  
  LazyComponentWrapper.displayName = `LazyWrapper(${importFn.name || 'Anonymous'})`;
  
  return LazyComponentWrapper;
};

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  fallbackComponent?: React.ComponentType
) => {
  const LazyComponentHOC = lazy(importFn);
  
  const WrappedComponent = (props: P) => (
    <Suspense fallback={fallbackComponent ? <fallbackComponent /> : <DefaultFallback />}>
      <LazyComponentHOC {...props} />
    </Suspense>
  );
  
  WrappedComponent.displayName = `withLazyLoading(${LazyComponentHOC.displayName || 'Component'})`;
  
  return memo(WrappedComponent);
};