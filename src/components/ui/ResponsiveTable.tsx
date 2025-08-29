'use client';

import React, { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';
import { NeonButton } from './NeonButton';
import { Badge } from './Badge';

interface Column<T = any> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
  sortable?: boolean;
  priority?: 'high' | 'medium' | 'low'; // For mobile column hiding
}

interface ResponsiveTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onRowClick?: (record: T, index: number) => void;
}

const ResponsiveTableComponent = <T extends Record<string, any>>({
  data,
  columns,
  className,
  loading = false,
  emptyMessage = 'No data available',
  pagination,
  onRowClick,
}: ResponsiveTableProps<T>) => {
  const { isMobile, isTablet } = useResponsive();
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Filter columns based on screen size
  const visibleColumns = React.useMemo(() => {
    if (isMobile) {
      // On mobile, show only high priority columns
      return columns.filter(col => col.priority === 'high' || !col.priority);
    }
    if (isTablet) {
      // On tablet, show high and medium priority columns
      return columns.filter(col => col.priority !== 'low');
    }
    return columns;
  }, [columns, isMobile, isTablet]);

  // Sort data if sort config exists
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleRowExpansion = (index: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className={cn('space-y-4', className)}>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/5 rounded-lg p-4 h-32" />
              </div>
            ))}
          </div>
        ) : sortedData.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {emptyMessage}
          </div>
        ) : (
          sortedData.map((record, index) => (
            <div
              key={index}
              className={cn(
                'bg-white/5 border border-white/10 rounded-lg p-4',
                onRowClick && 'cursor-pointer hover:bg-white/10 transition-colors'
              )}
              onClick={() => onRowClick?.(record, index)}
            >
              {/* Primary columns (high priority) */}
              <div className="space-y-3">
                {visibleColumns.map((column) => {
                  const value = record[column.key];
                  const displayValue = column.render
                    ? column.render(value, record, index)
                    : value;

                  return (
                    <div key={column.key} className="flex justify-between items-start">
                      <div className="text-sm text-gray-400 font-medium min-w-0 flex-1">
                        {column.title}
                      </div>
                      <div className="text-sm text-white min-w-0 flex-1 text-right">
                        {displayValue}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expandable section for additional columns */}
              {columns.length > visibleColumns.length && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRowExpansion(index);
                    }}
                    className="mt-3 text-xs text-neon-green hover:text-neon-green/80 transition-colors"
                  >
                    {expandedRows.has(index) ? '↑ Show Less' : '↓ Show More'}
                  </button>
                  
                  {expandedRows.has(index) && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                      {columns.filter(col => !visibleColumns.includes(col)).map((column) => {
                        const value = record[column.key];
                        const displayValue = column.render
                          ? column.render(value, record, index)
                          : value;

                        return (
                          <div key={column.key} className="flex justify-between items-start">
                            <div className="text-xs text-gray-500 font-medium min-w-0 flex-1">
                              {column.title}
                            </div>
                            <div className="text-xs text-gray-300 min-w-0 flex-1 text-right">
                              {displayValue}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}

        {/* Mobile pagination */}
        {pagination && (
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-400">
              Showing {Math.min((pagination.current - 1) * pagination.pageSize + 1, pagination.total)} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total}
            </div>
            <div className="flex gap-2">
              <NeonButton
                size="sm"
                variant="secondary"
                onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
                disabled={pagination.current <= 1}
              >
                Prev
              </NeonButton>
              <NeonButton
                size="sm"
                variant="secondary"
                onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
                disabled={pagination.current * pagination.pageSize >= pagination.total}
              >
                Next
              </NeonButton>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop/Tablet table view
  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-left py-3 px-4 font-medium text-gray-400',
                    column.sortable && 'cursor-pointer hover:text-white transition-colors',
                    column.className
                  )}
                  style={column.width ? { width: column.width } : undefined}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && (
                      <span className="text-xs">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : (
                          '↕'
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {visibleColumns.map((column) => (
                    <td key={column.key} className="py-3 px-4">
                      <div className="animate-pulse bg-white/10 rounded h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="text-center py-8 text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => (
                <tr
                  key={index}
                  className={cn(
                    'border-b border-white/5 hover:bg-white/5 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {visibleColumns.map((column) => {
                    const value = record[column.key];
                    const displayValue = column.render
                      ? column.render(value, record, index)
                      : value;

                    return (
                      <td
                        key={column.key}
                        className={cn('py-3 px-4 text-sm text-white', column.className)}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Desktop pagination */}
      {pagination && (
        <div className="flex justify-between items-center mt-4 px-4">
          <div className="text-sm text-gray-400">
            Showing {Math.min((pagination.current - 1) * pagination.pageSize + 1, pagination.total)} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex gap-2">
            <NeonButton
              size="sm"
              variant="secondary"
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current <= 1}
            >
              Previous
            </NeonButton>
            <span className="flex items-center px-3 text-sm text-gray-400">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <NeonButton
              size="sm"
              variant="secondary"
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current * pagination.pageSize >= pagination.total}
            >
              Next
            </NeonButton>
          </div>
        </div>
      )}
    </div>
  );
};

export const ResponsiveTable = memo(ResponsiveTableComponent) as <T extends Record<string, any>>(
  props: ResponsiveTableProps<T>
) => JSX.Element;

ResponsiveTable.displayName = 'ResponsiveTable';