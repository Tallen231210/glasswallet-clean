'use client';

import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { NeonButton } from './NeonButton';
import { Input } from './Input';
import { Select } from './Select';
import { Badge } from './Badge';
import { Alert } from './Alert';
import { Loading } from './Spinner';
import { Toggle } from './Toggle';
import { cn } from '@/lib/utils';

interface TaggingRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface RuleCondition {
  id: string;
  field: 'creditScore' | 'email' | 'phone' | 'firstName' | 'lastName' | 'leadSource';
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'startsWith' | 'endsWith';
  value: string | number;
  logicalOperator?: 'AND' | 'OR';
}

interface RuleAction {
  id: string;
  type: 'tag' | 'webhook' | 'email' | 'export';
  tagType?: 'qualified' | 'unqualified' | 'whitelist' | 'blacklist' | 'high-priority' | 'follow-up';
  webhookUrl?: string;
  emailTemplate?: string;
  reason?: string;
}

interface AutoTaggingRulesEngineProps {
  rules?: TaggingRule[];
  onSaveRule?: (rule: TaggingRule) => Promise<void>;
  onDeleteRule?: (ruleId: string) => Promise<void>;
  onToggleRule?: (ruleId: string, active: boolean) => Promise<void>;
  className?: string;
}

export const AutoTaggingRulesEngine: React.FC<AutoTaggingRulesEngineProps> = ({
  rules: initialRules = [],
  onSaveRule,
  onDeleteRule,
  onToggleRule,
  className
}) => {
  const [rules, setRules] = useState<TaggingRule[]>(initialRules);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<TaggingRule | null>(null);
  const [saving, setSaving] = useState(false);

  // New rule form state
  const [newRule, setNewRule] = useState<Partial<TaggingRule>>({
    name: '',
    description: '',
    active: true,
    priority: 1,
    conditions: [],
    actions: []
  });

  const fieldOptions = [
    { value: 'creditScore', label: 'Credit Score' },
    { value: 'email', label: 'Email Address' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'leadSource', label: 'Lead Source' }
  ];

  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'lessThan', label: 'Less Than' },
    { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
    { value: 'lessThanOrEqual', label: 'Less Than or Equal' }
  ];

  const tagTypeOptions = [
    { value: 'qualified', label: 'Qualified' },
    { value: 'unqualified', label: 'Unqualified' },
    { value: 'whitelist', label: 'Whitelist' },
    { value: 'blacklist', label: 'Blacklist' },
    { value: 'high-priority', label: 'High Priority' },
    { value: 'follow-up', label: 'Follow Up' }
  ];

  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: Date.now().toString(),
      field: 'creditScore',
      operator: 'greaterThan',
      value: '',
      logicalOperator: newRule.conditions?.length === 0 ? undefined : 'AND'
    };

    setNewRule(prev => ({
      ...prev,
      conditions: [...(prev.conditions || []), newCondition]
    }));
  };

  const updateCondition = (conditionId: string, updates: Partial<RuleCondition>) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions?.map(condition =>
        condition.id === conditionId ? { ...condition, ...updates } : condition
      ) || []
    }));
  };

  const removeCondition = (conditionId: string) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions?.filter(condition => condition.id !== conditionId) || []
    }));
  };

  const addAction = () => {
    const newAction: RuleAction = {
      id: Date.now().toString(),
      type: 'tag',
      tagType: 'qualified',
      reason: 'Auto-tagged by rule'
    };

    setNewRule(prev => ({
      ...prev,
      actions: [...(prev.actions || []), newAction]
    }));
  };

  const updateAction = (actionId: string, updates: Partial<RuleAction>) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions?.map(action =>
        action.id === actionId ? { ...action, ...updates } : action
      ) || []
    }));
  };

  const removeAction = (actionId: string) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions?.filter(action => action.id !== actionId) || []
    }));
  };

  const handleSaveRule = async () => {
    if (!newRule.name || !newRule.conditions?.length || !newRule.actions?.length) {
      return;
    }

    setSaving(true);
    try {
      const ruleToSave: TaggingRule = {
        id: editingRule?.id || Date.now().toString(),
        name: newRule.name,
        description: newRule.description || '',
        active: newRule.active || true,
        priority: newRule.priority || 1,
        conditions: newRule.conditions,
        actions: newRule.actions,
        createdAt: editingRule?.createdAt || new Date().toISOString(),
        triggerCount: editingRule?.triggerCount || 0
      };

      if (onSaveRule) {
        await onSaveRule(ruleToSave);
      }

      if (editingRule) {
        setRules(prev => prev.map(rule => rule.id === editingRule.id ? ruleToSave : rule));
      } else {
        setRules(prev => [...prev, ruleToSave]);
      }

      // Reset form
      setNewRule({
        name: '',
        description: '',
        active: true,
        priority: 1,
        conditions: [],
        actions: []
      });
      setShowBuilder(false);
      setEditingRule(null);
    } catch (error) {
      console.error('Failed to save rule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditRule = (rule: TaggingRule) => {
    setEditingRule(rule);
    setNewRule({
      name: rule.name,
      description: rule.description,
      active: rule.active,
      priority: rule.priority,
      conditions: rule.conditions,
      actions: rule.actions
    });
    setShowBuilder(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (onDeleteRule) {
      await onDeleteRule(ruleId);
    }
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const handleToggleRule = async (ruleId: string, active: boolean) => {
    if (onToggleRule) {
      await onToggleRule(ruleId, active);
    }
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, active } : rule
    ));
  };

  const getRulePriorityColor = (priority: number) => {
    if (priority === 1) return 'text-red-400';
    if (priority <= 3) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getTagTypeColor = (tagType: string) => {
    switch (tagType) {
      case 'qualified': return 'neon';
      case 'whitelist': return 'success';
      case 'blacklist': return 'error';
      case 'high-priority': return 'warning';
      default: return 'default';
    }
  };

  return (
    <GlassCard className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Auto-Tagging Rules Engine</h2>
          <p className="text-gray-400">Create intelligent rules to automatically tag and process leads</p>
        </div>
        <NeonButton
          onClick={() => {
            setShowBuilder(!showBuilder);
            if (showBuilder) {
              setEditingRule(null);
              setNewRule({
                name: '',
                description: '',
                active: true,
                priority: 1,
                conditions: [],
                actions: []
              });
            }
          }}
        >
          {showBuilder ? 'Cancel' : 'Create Rule'}
        </NeonButton>
      </div>

      {showBuilder && (
        <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingRule ? 'Edit Rule' : 'Rule Builder'}
          </h3>

          {/* Basic Rule Info */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rule Name *
                </label>
                <Input
                  placeholder="e.g., High Credit Score Auto-Qualify"
                  value={newRule.name || ''}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority (1 = Highest)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newRule.priority || 1}
                  onChange={(e) => setNewRule(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <Input
                placeholder="Describe what this rule does..."
                value={newRule.description || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Toggle
                checked={newRule.active || true}
                onChange={(e) => setNewRule(prev => ({ ...prev, active: e.target.checked }))}
              />
              <span className="text-sm text-gray-300">Rule Active</span>
            </div>
          </div>

          {/* Conditions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Conditions</h4>
              <NeonButton size="sm" variant="secondary" onClick={addCondition}>
                Add Condition
              </NeonButton>
            </div>

            {newRule.conditions?.map((condition, index) => (
              <div key={condition.id} className="p-4 bg-white/5 rounded-lg border border-white/10 mb-3">
                {index > 0 && (
                  <div className="mb-3">
                    <Select
                      value={condition.logicalOperator || 'AND'}
                      onChange={(e) => updateCondition(condition.id, { logicalOperator: e.target.value as 'AND' | 'OR' })}
                      options={[
                        { value: 'AND', label: 'AND' },
                        { value: 'OR', label: 'OR' }
                      ]}
                      className="w-20"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Select
                    placeholder="Field"
                    value={condition.field}
                    onChange={(e) => updateCondition(condition.id, { field: e.target.value as RuleCondition['field'] })}
                    options={fieldOptions}
                  />
                  
                  <Select
                    placeholder="Operator"
                    value={condition.operator}
                    onChange={(e) => updateCondition(condition.id, { operator: e.target.value as RuleCondition['operator'] })}
                    options={operatorOptions}
                  />
                  
                  <Input
                    placeholder="Value"
                    type={condition.field === 'creditScore' ? 'number' : 'text'}
                    value={condition.value}
                    onChange={(e) => updateCondition(condition.id, { 
                      value: condition.field === 'creditScore' ? parseInt(e.target.value) || 0 : e.target.value 
                    })}
                  />
                  
                  <NeonButton 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => removeCondition(condition.id)}
                    className="bg-red-600/20 hover:bg-red-600/30"
                  >
                    Remove
                  </NeonButton>
                </div>
              </div>
            ))}

            {(!newRule.conditions || newRule.conditions.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                No conditions added. Click "Add Condition" to start building your rule.
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Actions</h4>
              <NeonButton size="sm" variant="secondary" onClick={addAction}>
                Add Action
              </NeonButton>
            </div>

            {newRule.actions?.map((action) => (
              <div key={action.id} className="p-4 bg-white/5 rounded-lg border border-white/10 mb-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Action Type</label>
                    <Select
                      value={action.type}
                      onChange={(e) => updateAction(action.id, { type: e.target.value as RuleAction['type'] })}
                      options={[
                        { value: 'tag', label: 'Tag Lead' },
                        { value: 'webhook', label: 'Trigger Webhook' },
                        { value: 'email', label: 'Send Email' },
                        { value: 'export', label: 'Export Lead' }
                      ]}
                    />
                  </div>
                  
                  {action.type === 'tag' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tag Type</label>
                      <Select
                        value={action.tagType || 'qualified'}
                        onChange={(e) => updateAction(action.id, { tagType: e.target.value as RuleAction['tagType'] })}
                        options={tagTypeOptions}
                      />
                    </div>
                  )}
                  
                  {action.type === 'webhook' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Webhook URL</label>
                      <Input
                        placeholder="https://..."
                        value={action.webhookUrl || ''}
                        onChange={(e) => updateAction(action.id, { webhookUrl: e.target.value })}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Reason/Note</label>
                    <Input
                      placeholder="Auto-tagged by rule"
                      value={action.reason || ''}
                      onChange={(e) => updateAction(action.id, { reason: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <NeonButton 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => removeAction(action.id)}
                      className="bg-red-600/20 hover:bg-red-600/30 w-full"
                    >
                      Remove
                    </NeonButton>
                  </div>
                </div>
              </div>
            ))}

            {(!newRule.actions || newRule.actions.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                No actions added. Click "Add Action" to define what happens when conditions match.
              </div>
            )}
          </div>

          {/* Save/Cancel */}
          <div className="flex gap-3 justify-end">
            <NeonButton
              variant="secondary"
              onClick={() => {
                setShowBuilder(false);
                setEditingRule(null);
                setNewRule({
                  name: '',
                  description: '',
                  active: true,
                  priority: 1,
                  conditions: [],
                  actions: []
                });
              }}
            >
              Cancel
            </NeonButton>
            <NeonButton
              onClick={handleSaveRule}
              loading={saving}
              disabled={!newRule.name || !newRule.conditions?.length || !newRule.actions?.length}
            >
              {editingRule ? 'Update Rule' : 'Save Rule'}
            </NeonButton>
          </div>
        </div>
      )}

      {/* Existing Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Active Rules ({rules.length})</h3>
          <div className="text-sm text-gray-400">
            Rules are processed in priority order (1 = highest)
          </div>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Rules Created</h3>
            <p className="text-gray-400 mb-4">Create your first auto-tagging rule to start automating lead processing</p>
            <NeonButton onClick={() => setShowBuilder(true)}>
              Create First Rule
            </NeonButton>
          </div>
        ) : (
          rules
            .sort((a, b) => a.priority - b.priority)
            .map((rule) => (
              <div
                key={rule.id}
                className={cn(
                  'p-6 rounded-xl border transition-all duration-200',
                  rule.active
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-white/2 border-white/5 opacity-60'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{rule.name}</h4>
                      <Badge variant={rule.active ? 'success' : 'default'} size="sm">
                        {rule.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="default" size="sm" className={getRulePriorityColor(rule.priority)}>
                        Priority {rule.priority}
                      </Badge>
                    </div>
                    {rule.description && (
                      <p className="text-gray-400 text-sm mb-3">{rule.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-xs text-gray-400">
                      <span>Created: {new Date(rule.createdAt).toLocaleDateString()}</span>
                      <span>Triggered: {rule.triggerCount} times</span>
                      {rule.lastTriggered && (
                        <span>Last: {new Date(rule.lastTriggered).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={rule.active}
                      onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                    />
                    <NeonButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditRule(rule)}
                    >
                      Edit
                    </NeonButton>
                    <NeonButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="bg-red-600/20 hover:bg-red-600/30"
                    >
                      Delete
                    </NeonButton>
                  </div>
                </div>

                {/* Rule Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Conditions ({rule.conditions.length})</h5>
                    <div className="space-y-1 text-xs">
                      {rule.conditions.map((condition, index) => (
                        <div key={condition.id} className="flex items-center gap-2 text-gray-400">
                          {index > 0 && (
                            <span className="text-yellow-400 font-medium px-1">
                              {condition.logicalOperator}
                            </span>
                          )}
                          <span className="text-white">{fieldOptions.find(f => f.value === condition.field)?.label}</span>
                          <span>{operatorOptions.find(o => o.value === condition.operator)?.label?.toLowerCase()}</span>
                          <span className="text-neon-green">{condition.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Actions ({rule.actions.length})</h5>
                    <div className="space-y-1 text-xs">
                      {rule.actions.map((action) => (
                        <div key={action.id} className="flex items-center gap-2">
                          <Badge variant={action.type === 'tag' ? getTagTypeColor(action.tagType || '') : 'default'} size="sm">
                            {action.type === 'tag' && action.tagType && tagTypeOptions.find(t => t.value === action.tagType)?.label}
                            {action.type === 'webhook' && 'Webhook'}
                            {action.type === 'email' && 'Email'}
                            {action.type === 'export' && 'Export'}
                          </Badge>
                          {action.reason && (
                            <span className="text-gray-400">- {action.reason}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </GlassCard>
  );
};

export default AutoTaggingRulesEngine;