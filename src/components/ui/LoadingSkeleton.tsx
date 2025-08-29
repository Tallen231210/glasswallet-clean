import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  variant?: 'text' | 'card' | 'stat' | 'circular';
}

export function LoadingSkeleton({ 
  className = '', 
  lines = 1, 
  variant = 'text' 
}: LoadingSkeletonProps) {
  if (variant === 'circular') {
    return (
      <div className={`skeleton rounded-full ${className}`} />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="space-y-4">
          <div className="skeleton h-6 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'stat') {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-20" />
            <div className="skeleton rounded-full h-8 w-8" />
          </div>
          <div className="skeleton h-8 w-16" />
          <div className="skeleton h-3 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton h-4 w-full" />
      ))}
    </div>
  );
}

// Specific loading components for common use cases
export function LoadingStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <LoadingSkeleton key={i} variant="stat" />
      ))}
    </div>
  );
}

export function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <LoadingSkeleton key={i} variant="card" />
      ))}
    </div>
  );
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-4">
            <LoadingSkeleton variant="circular" className="w-12 h-12" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-4 w-48" />
              <LoadingSkeleton className="h-3 w-32" />
            </div>
            <div className="space-y-2">
              <LoadingSkeleton className="h-4 w-16" />
              <LoadingSkeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}