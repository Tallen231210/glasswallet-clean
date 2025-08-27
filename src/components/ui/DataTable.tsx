'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Spinner } from './Spinner';

export interface TableColumn<T = any> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  pagination,
  onSort,
  className,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: keyof T) => {
    if (!onSort) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sortColumn === column && sortDirection === 'asc') {
      direction = 'desc';
    }
    
    setSortColumn(column);
    setSortDirection(direction);
    onSort(column, direction);
  };

  const renderPagination = () => {
    if (!pagination) return null;
    
    const { page, limit, total, onPageChange } = pagination;
    const totalPages = Math.ceil(total / limit);
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
        <div className="text-sm text-gray-400">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 text-sm glass-card glass-card-hover text-white disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = page <= 3 ? i + 1 : page - 2 + i;
              if (pageNumber > totalPages) return null;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={cn(
                    'px-3 py-1 text-sm rounded',
                    pageNumber === page
                      ? 'bg-neon-green text-deep-navy-start font-medium'
                      : 'glass-card glass-card-hover text-white'
                  )}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm glass-card glass-card-hover text-white disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <GlassCard className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider',
                    column.sortable && onSort && 'cursor-pointer hover:text-white',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && onSort && (
                      <span className="text-xs">
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? '↑' : '↓'
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
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <Spinner size="md" />
                    <span className="text-gray-400">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="text-gray-400">
                    <div className="text-4xl mb-4">📊</div>
                    <div>{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {columns.map((column) => {
                    const value = row[column.key];
                    const rendered = column.render ? column.render(value, row) : value;
                    
                    return (
                      <td
                        key={String(column.key)}
                        className={cn(
                          'px-6 py-4 text-sm text-white',
                          column.className
                        )}
                      >
                        {rendered}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </GlassCard>
  );
}