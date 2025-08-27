'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { NeonButton } from './NeonButton';
import { Input } from './Input';
import { Select } from './Select';
import { Badge } from './Badge';

export interface FilterCondition {
  field: string;
  operator: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
}

export interface AdvancedFilterConfig {
  conditions: FilterCondition[];
  logic: 'AND' | 'OR';
  saved?: boolean;
  name?: string;
}

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  operators: string[];
  options?: Array<{ value: string; label: string }>;
}

interface AdvancedFiltersProps {
  fields: FieldConfig[];
  filters: AdvancedFilterConfig;
  onChange: (filters: AdvancedFilterConfig) => void;
  onApply: () => void;
  onReset: () => void;
  onSave?: (name: string) => void;
  savedFilters?: Array<{ name: string; config: AdvancedFilterConfig }>;
  onLoadSaved?: (config: AdvancedFilterConfig) => void;
  className?: string;
}

const operatorLabels: Record<string, string> = {
  eq: 'equals',
  neq: 'not equals',
  gt: 'greater than',
  gte: 'greater than or equal',
  lt: 'less than',
  lte: 'less than or equal',
  contains: 'contains',
  not_contains: 'does not contain',
  starts_with: 'starts with',
  ends_with: 'ends with',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
  in: 'is one of',
  not_in: 'is not one of',
  between: 'between',
  is_true: 'is true',
  is_false: 'is false'
};

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  fields,
  filters,
  onChange,
  onApply,
  onReset,
  onSave,
  savedFilters = [],
  onLoadSaved,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [activeConditions, setActiveConditions] = useState(filters.conditions.length);

  useEffect(() => {
    setActiveConditions(filters.conditions.filter(c => c.value !== '' && c.value !== null).length);
  }, [filters.conditions]);

  const addCondition = () => {
    const newCondition: FilterCondition = {
      field: fields[0]?.key || '',
      operator: fields[0]?.operators[0] || 'eq',
      value: '',
      type: fields[0]?.type || 'text'
    };
    
    onChange({
      ...filters,
      conditions: [...filters.conditions, newCondition]
    });
  };

  const removeCondition = (index: number) => {
    const newConditions = filters.conditions.filter((_, i) => i !== index);
    onChange({
      ...filters,
      conditions: newConditions
    });
  };

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    const newConditions = [...filters.conditions];
    const field = fields.find(f => f.key === updates.field);
    
    const current = newConditions[index];
    if (!current) return; // Safety check
    
    const updatedCondition: FilterCondition = {
      field: updates.field ?? current.field,
      operator: updates.operator ?? current.operator,
      value: updates.value ?? current.value,
      type: updates.type ?? current.type
    };
    
    // Reset operator and value if field changes
    if (updates.field && field) {
      updatedCondition.operator = field.operators[0] || 'eq';
      updatedCondition.value = '';
      updatedCondition.type = field.type || 'text';
    }
    
    newConditions[index] = updatedCondition;
    
    onChange({
      ...filters,
      conditions: newConditions
    });
  };

  const getOperatorsForField = (fieldKey: string) => {
    const field = fields.find(f => f.key === fieldKey);
    return field?.operators || ['eq'];
  };

  const renderConditionValue = (condition: FilterCondition, index: number) => {
    const field = fields.find(f => f.key === condition.field);
    
    if (['is_empty', 'is_not_empty', 'is_true', 'is_false'].includes(condition.operator)) {
      return (
        <div className="flex-1 flex items-center text-gray-400 text-sm italic">
          No value needed
        </div>
      );
    }

    switch (condition.type) {
      case 'select':
        return (
          <Select
            value={condition.value as string}
            onChange={(e) => updateCondition(index, { value: e.target.value })}
            options={field?.options || []}
            className="flex-1"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder="Enter number..."
            value={condition.value as string}
            onChange={(e) => updateCondition(index, { value: parseFloat(e.target.value) || '' })}
            className="flex-1"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={condition.value as string}
            onChange={(e) => updateCondition(index, { value: e.target.value })}
            className="flex-1"
          />
        );

      case 'boolean':
        return (
          <Select
            value={condition.value as string}
            onChange={(e) => updateCondition(index, { value: e.target.value === 'true' })}
            options={[
              { value: 'true', label: 'True' },
              { value: 'false', label: 'False' }
            ]}
            className="flex-1"
          />
        );

      default:
        return (
          <Input
            placeholder="Enter value..."
            value={condition.value as string}
            onChange={(e) => updateCondition(index, { value: e.target.value })}
            className="flex-1"
          />
        );
    }
  };

  const handleSave = () => {
    if (filterName.trim() && onSave) {
      onSave(filterName);
      setFilterName('');
      setSaveDialogOpen(false);
    }
  };

  return (
    <GlassCard className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-white hover:text-neon-green transition-colors"
            >
              <span className={cn(
                'transition-transform duration-200',
                isExpanded ? 'rotate-90' : ''
              )}>
                ▶
              </span>
              <span className="font-medium">Advanced Filters</span>
            </button>
            
            {activeConditions > 0 && (
              <Badge variant="neon" size="sm">
                {activeConditions} active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {savedFilters.length > 0 && (
              <Select
                placeholder="Load saved..."
                value=""
                onChange={(e) => {
                  const saved = savedFilters.find(s => s.name === e.target.value);
                  if (saved && onLoadSaved) {
                    onLoadSaved(saved.config);
                  }
                }}
                options={savedFilters.map(s => ({ value: s.name, label: s.name }))}
                className="w-40"
              />
            )}
            
            <NeonButton
              size="sm"
              variant="secondary"
              onClick={onReset}
              disabled={filters.conditions.length === 0}
            >
              Clear All
            </NeonButton>
            
            <NeonButton
              size="sm"
              onClick={onApply}
              disabled={activeConditions === 0}
            >
              Apply Filters
            </NeonButton>
          </div>
        </div>
      </div>

      {/* Filter Builder */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Logic Selector */}
          {filters.conditions.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Match</span>
              <Select
                value={filters.logic}
                onChange={(e) => onChange({ ...filters, logic: e.target.value as 'AND' | 'OR' })}
                options={[
                  { value: 'AND', label: 'ALL conditions' },
                  { value: 'OR', label: 'ANY condition' }
                ]}
                className="w-40"
              />
            </div>
          )}

          {/* Conditions */}
          <div className="space-y-3">
            {filters.conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                {/* Field Selector */}
                <Select
                  value={condition.field}
                  onChange={(e) => updateCondition(index, { field: e.target.value })}
                  options={fields.map(f => ({ value: f.key, label: f.label }))}
                  className="w-40"
                />

                {/* Operator Selector */}
                <Select
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, { operator: e.target.value })}
                  options={getOperatorsForField(condition.field).map(op => ({
                    value: op,
                    label: operatorLabels[op] || op
                  }))}
                  className="w-40"
                />

                {/* Value Input */}
                {renderConditionValue(condition, index)}

                {/* Remove Button */}
                <button
                  onClick={() => removeCondition(index)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Remove condition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add Condition Button */}
          <div className="flex items-center gap-3">
            <NeonButton
              size="sm"
              variant="secondary"
              onClick={addCondition}
              disabled={fields.length === 0}
            >
              + Add Condition
            </NeonButton>

            {/* Save Filter */}
            {onSave && filters.conditions.length > 0 && (
              <div className="flex items-center gap-2">
                {!saveDialogOpen ? (
                  <button
                    onClick={() => setSaveDialogOpen(true)}
                    className="text-sm text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Save filter set
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Filter name..."
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="w-32"
                    />
                    <NeonButton size="sm" onClick={handleSave} disabled={!filterName.trim()}>
                      Save
                    </NeonButton>
                    <button
                      onClick={() => setSaveDialogOpen(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter Summary */}
          {activeConditions > 0 && (
            <div className="mt-4 p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg">
              <div className="text-sm text-white font-medium mb-1">Active Filter Summary:</div>
              <div className="text-xs text-gray-300">
                {filters.conditions
                  .filter(c => c.value !== '' && c.value !== null)
                  .map((condition, index) => {
                    const field = fields.find(f => f.key === condition.field);
                    return (
                      <span key={index}>
                        {index > 0 && ` ${filters.logic} `}
                        <span className="text-neon-green">{field?.label}</span>
                        {' '}
                        <span className="text-gray-400">{operatorLabels[condition.operator]}</span>
                        {' '}
                        {!['is_empty', 'is_not_empty', 'is_true', 'is_false'].includes(condition.operator) && (
                          <span className="text-white font-medium">{condition.value}</span>
                        )}
                      </span>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};