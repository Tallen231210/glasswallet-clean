'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { useResponsive, useResponsiveColumns } from '@/hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
  minItemWidth?: string;
  maxItemWidth?: string;
}

const ResponsiveGridComponent: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 'gap-4', tablet: 'gap-6', desktop: 'gap-6' },
  className,
  minItemWidth,
  maxItemWidth,
}) => {
  const { deviceType } = useResponsive();
  const columnCount = useResponsiveColumns(columns);
  
  // Dynamic gap class based on device type
  const gapClass = React.useMemo(() => {
    switch (deviceType) {
      case 'mobile':
        return gap.mobile || 'gap-4';
      case 'tablet':
        return gap.tablet || 'gap-6';
      case 'desktop':
        return gap.desktop || 'gap-6';
      default:
        return 'gap-6';
    }
  }, [deviceType, gap]);

  // Grid template columns
  const gridStyle = React.useMemo(() => {
    if (minItemWidth && maxItemWidth) {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, ${maxItemWidth}))`,
      };
    }
    
    const columnClass = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    }[Math.min(columnCount, 6)] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return { className: columnClass };
  }, [columnCount, minItemWidth, maxItemWidth]);

  if (minItemWidth && maxItemWidth) {
    return (
      <div
        className={cn('grid', gapClass, className)}
        style={gridStyle as React.CSSProperties}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn('grid', gridStyle.className, gapClass, className)}>
      {children}
    </div>
  );
};

export const ResponsiveGrid = memo(ResponsiveGridComponent);
ResponsiveGrid.displayName = 'ResponsiveGrid';