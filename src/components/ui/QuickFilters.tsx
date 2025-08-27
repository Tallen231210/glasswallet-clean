'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { NeonButton } from './NeonButton';
import { Badge } from './Badge';

export interface QuickFilter {
  id: string;
  label: string;
  icon: string;
  description: string;
  count?: number;
  active?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  conditions: {
    field: string;
    operator: string;
    value: any;
  }[];
}

interface QuickFiltersProps {
  filters: QuickFilter[];
  onFilterClick: (filterId: string) => void;
  activeFilters: string[];
  className?: string;
}

const colorVariants = {
  blue: 'bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30',
  green: 'bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30',
  yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30',
  red: 'bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30',
  purple: 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30',
  gray: 'bg-gray-500/20 border-gray-500/30 text-gray-300 hover:bg-gray-500/30',
};

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  filters,
  onFilterClick,
  activeFilters,
  className
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Quick Filters</h3>
        {activeFilters.length > 0 && (
          <Badge variant="neon" size="sm">
            {activeFilters.length} active
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {filters.map((filter) => {
          const isActive = activeFilters.includes(filter.id);
          const colorClass = colorVariants[filter.color || 'gray'];

          return (
            <button
              key={filter.id}
              onClick={() => onFilterClick(filter.id)}
              className={cn(
                'relative p-3 rounded-lg border transition-all duration-200',
                'hover:scale-[1.02] active:scale-[0.98]',
                isActive 
                  ? 'bg-neon-green/20 border-neon-green/40 text-neon-green shadow-lg shadow-neon-green/20' 
                  : colorClass
              )}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="text-2xl">{filter.icon}</div>
                <div className="text-center">
                  <div className="font-medium text-xs leading-tight">
                    {filter.label}
                  </div>
                  {filter.count !== undefined && (
                    <div className={cn(
                      'text-xs font-bold mt-1',
                      isActive ? 'text-neon-green' : 'text-white'
                    )}>
                      {filter.count.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              )}

              {/* Hover tooltip */}
              <div className={cn(
                'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
                'px-2 py-1 text-xs bg-black/80 text-white rounded',
                'opacity-0 pointer-events-none transition-opacity',
                'group-hover:opacity-100'
              )}>
                {filter.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Predefined quick filters for lead management
export const defaultLeadQuickFilters: QuickFilter[] = [
  {
    id: 'new-leads',
    label: 'New Leads',
    icon: '✨',
    description: 'Leads created in the last 7 days',
    color: 'green',
    conditions: [
      {
        field: 'createdAt',
        operator: 'gte',
        value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'unprocessed',
    label: 'Unprocessed',
    icon: '⏳',
    description: 'Leads that haven\'t been processed yet',
    color: 'yellow',
    conditions: [
      {
        field: 'processed',
        operator: 'eq',
        value: false
      }
    ]
  },
  {
    id: 'qualified',
    label: 'Qualified',
    icon: '⭐',
    description: 'Leads that passed qualification',
    color: 'green',
    conditions: [
      {
        field: 'leadTags.tagType',
        operator: 'contains',
        value: 'qualified'
      }
    ]
  },
  {
    id: 'high-credit',
    label: 'High Credit',
    icon: '💎',
    description: 'Credit score 720 or higher',
    color: 'blue',
    conditions: [
      {
        field: 'creditScore',
        operator: 'gte',
        value: 720
      }
    ]
  },
  {
    id: 'whitelist',
    label: 'Whitelist',
    icon: '✅',
    description: 'Manually approved leads',
    color: 'green',
    conditions: [
      {
        field: 'leadTags.tagType',
        operator: 'contains',
        value: 'whitelist'
      }
    ]
  },
  {
    id: 'blacklist',
    label: 'Blacklist',
    icon: '🚫',
    description: 'Manually rejected leads',
    color: 'red',
    conditions: [
      {
        field: 'leadTags.tagType',
        operator: 'contains',
        value: 'blacklist'
      }
    ]
  },
  {
    id: 'missing-phone',
    label: 'No Phone',
    icon: '📵',
    description: 'Leads without phone numbers',
    color: 'gray',
    conditions: [
      {
        field: 'phone',
        operator: 'is_empty',
        value: ''
      }
    ]
  },
  {
    id: 'low-credit',
    label: 'Low Credit',
    icon: '⚠️',
    description: 'Credit score below 600',
    color: 'red',
    conditions: [
      {
        field: 'creditScore',
        operator: 'lt',
        value: 600
      }
    ]
  },
  {
    id: 'today',
    label: 'Today',
    icon: '📅',
    description: 'Leads created today',
    color: 'blue',
    conditions: [
      {
        field: 'createdAt',
        operator: 'gte',
        value: new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
      }
    ]
  },
  {
    id: 'business-emails',
    label: 'Business',
    icon: '🏢',
    description: 'Non-personal email domains',
    color: 'purple',
    conditions: [
      {
        field: 'email',
        operator: 'not_contains',
        value: '@gmail.com,@yahoo.com,@hotmail.com,@outlook.com'
      }
    ]
  },
  {
    id: 'duplicates',
    label: 'Duplicates',
    icon: '👥',
    description: 'Leads with duplicate emails',
    color: 'gray',
    conditions: [
      {
        field: 'isDuplicate',
        operator: 'eq',
        value: true
      }
    ]
  },
  {
    id: 'vip',
    label: 'VIP',
    icon: '👑',
    description: 'High-value prospects',
    color: 'purple',
    conditions: [
      {
        field: 'leadTags.tagType',
        operator: 'contains',
        value: 'vip'
      }
    ]
  }
];