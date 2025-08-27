'use client';

import React, { useState, useEffect } from 'react';

// Disable static generation for this page
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { 
  AutoTaggingRulesEngine,
  ToastProvider,
  useToast,
  Alert,
  Loading,
  NeonButton,
  StatCard
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';

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

interface RuleStats {
  totalRules: number;
  activeRules: number;
  totalTriggers: number;
  recentActivity: number;
}

const AutoTaggingRulesPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [rules, setRules] = useState<TaggingRule[]>([]);
  const [stats, setStats] = useState<RuleStats>({
    totalRules: 0,
    activeRules: 0,
    totalTriggers: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Mock data for development
  const mockRules: TaggingRule[] = [
    {
      id: '1',
      name: 'High Credit Score Auto-Qualify',
      description: 'Automatically qualify leads with credit scores 720+',
      active: true,
      priority: 1,
      conditions: [
        {
          id: '1',
          field: 'creditScore',
          operator: 'greaterThanOrEqual',
          value: 720
        }
      ],
      actions: [
        {
          id: '1',
          type: 'tag',
          tagType: 'qualified',
          reason: 'High credit score (720+)'
        }
      ],
      createdAt: '2024-01-15T10:00:00Z',
      lastTriggered: '2024-01-20T14:30:00Z',
      triggerCount: 47
    },
    {
      id: '2',
      name: 'Gmail Domain Whitelist',
      description: 'Whitelist all Gmail users for follow-up',
      active: true,
      priority: 3,
      conditions: [
        {
          id: '2',
          field: 'email',
          operator: 'endsWith',
          value: '@gmail.com'
        }
      ],
      actions: [
        {
          id: '2',
          type: 'tag',
          tagType: 'whitelist',
          reason: 'Gmail domain user'
        }
      ],
      createdAt: '2024-01-10T09:00:00Z',
      lastTriggered: '2024-01-20T16:45:00Z',
      triggerCount: 23
    },
    {
      id: '3',
      name: 'Low Credit Score Review',
      description: 'Flag low credit scores for manual review',
      active: false,
      priority: 2,
      conditions: [
        {
          id: '3',
          field: 'creditScore',
          operator: 'lessThan',
          value: 600
        }
      ],
      actions: [
        {
          id: '3',
          type: 'tag',
          tagType: 'unqualified',
          reason: 'Low credit score - requires review'
        }
      ],
      createdAt: '2024-01-12T11:00:00Z',
      triggerCount: 8
    }
  ];

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      setError('');

      // TODO: Replace with actual API call
      // const response = await fetch('/api/auto-tagging/rules');
      // const result = await response.json();
      
      // For development, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      const loadedRules = mockRules;

      setRules(loadedRules);
      
      // Calculate stats
      const totalRules = loadedRules.length;
      const activeRules = loadedRules.filter(rule => rule.active).length;
      const totalTriggers = loadedRules.reduce((sum, rule) => sum + rule.triggerCount, 0);
      const recentActivity = loadedRules.filter(rule => 
        rule.lastTriggered && new Date(rule.lastTriggered) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;

      setStats({
        totalRules,
        activeRules,
        totalTriggers,
        recentActivity
      });

    } catch (error) {
      console.error('Error loading rules:', error);
      setError(error instanceof Error ? error.message : 'Failed to load rules');
      showToast({
        title: 'Error',
        message: 'Failed to load auto-tagging rules',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async (rule: TaggingRule) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auto-tagging/rules', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(rule)
      // });

      // For development, just update local state
      const existingRuleIndex = rules.findIndex(r => r.id === rule.id);
      if (existingRuleIndex >= 0) {
        setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
        showToast({
          title: 'Rule Updated',
          message: `"${rule.name}" has been updated`,
          variant: 'success'
        });
      } else {
        setRules(prev => [...prev, rule]);
        showToast({
          title: 'Rule Created',
          message: `"${rule.name}" has been created`,
          variant: 'success'
        });
      }

      // Recalculate stats
      const updatedRules = rules.map(r => r.id === rule.id ? rule : r);
      if (!rules.find(r => r.id === rule.id)) {
        updatedRules.push(rule);
      }
      
      const totalRules = updatedRules.length;
      const activeRules = updatedRules.filter(rule => rule.active).length;
      const totalTriggers = updatedRules.reduce((sum, rule) => sum + rule.triggerCount, 0);

      setStats(prev => ({
        ...prev,
        totalRules,
        activeRules,
        totalTriggers
      }));

    } catch (error) {
      console.error('Error saving rule:', error);
      showToast({
        title: 'Error',
        message: 'Failed to save rule',
        variant: 'error'
      });
      throw error;
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/auto-tagging/rules/${ruleId}`, {
      //   method: 'DELETE'
      // });

      const rule = rules.find(r => r.id === ruleId);
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      
      showToast({
        title: 'Rule Deleted',
        message: rule ? `"${rule.name}" has been deleted` : 'Rule has been deleted',
        variant: 'success'
      });

      // Recalculate stats
      const updatedRules = rules.filter(rule => rule.id !== ruleId);
      const totalRules = updatedRules.length;
      const activeRules = updatedRules.filter(rule => rule.active).length;
      const totalTriggers = updatedRules.reduce((sum, rule) => sum + rule.triggerCount, 0);

      setStats(prev => ({
        ...prev,
        totalRules,
        activeRules,
        totalTriggers
      }));

    } catch (error) {
      console.error('Error deleting rule:', error);
      showToast({
        title: 'Error',
        message: 'Failed to delete rule',
        variant: 'error'
      });
      throw error;
    }
  };

  const handleToggleRule = async (ruleId: string, active: boolean) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/auto-tagging/rules/${ruleId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ active })
      // });

      const rule = rules.find(r => r.id === ruleId);
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, active } : rule
      ));

      showToast({
        title: active ? 'Rule Activated' : 'Rule Deactivated',
        message: rule ? `"${rule.name}" is now ${active ? 'active' : 'inactive'}` : 'Rule status updated',
        variant: 'success'
      });

      // Recalculate active rules stat
      const updatedRules = rules.map(rule => 
        rule.id === ruleId ? { ...rule, active } : rule
      );
      const activeRules = updatedRules.filter(rule => rule.active).length;
      
      setStats(prev => ({
        ...prev,
        activeRules
      }));

    } catch (error) {
      console.error('Error toggling rule:', error);
      showToast({
        title: 'Error',
        message: 'Failed to update rule status',
        variant: 'error'
      });
      throw error;
    }
  };

  if (error && !loading) {
    return (
      <AppShell headerActions={
        <NeonButton onClick={() => window.location.reload()}>
          Retry
        </NeonButton>
      }>
        <div className="p-6">
          <Alert variant="error" title="Error Loading Rules">
            {error}
          </Alert>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell 
      headerActions={
        <div className="flex gap-2">
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/leads/analytics')}
          >
            Analytics
          </NeonButton>
          <NeonButton 
            onClick={() => router.push('/leads')}
          >
            Back to Leads
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Auto-Tagging Rules</h1>
          <p className="text-gray-400">Create intelligent rules to automatically process and tag leads based on their data</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Rules"
            value={stats.totalRules}
            icon="🤖"
            variant="default"
            loading={loading}
          />
          <StatCard
            title="Active Rules"
            value={stats.activeRules}
            change={{ 
              value: stats.totalRules > 0 ? Math.round((stats.activeRules / stats.totalRules) * 100) : 0, 
              type: 'positive',
              period: 'of total'
            }}
            icon="✅"
            variant="success"
            loading={loading}
          />
          <StatCard
            title="Total Triggers"
            value={stats.totalTriggers}
            icon="⚡"
            variant="neon"
            loading={loading}
          />
          <StatCard
            title="Recent Activity"
            value={stats.recentActivity}
            change={{ 
              value: stats.recentActivity, 
              type: 'positive',
              period: 'rules triggered today'
            }}
            icon="📊"
            variant="warning"
            loading={loading}
          />
        </div>

        {/* Rules Engine */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading message="Loading auto-tagging rules..." size="lg" />
          </div>
        ) : (
          <AutoTaggingRulesEngine
            rules={rules}
            onSaveRule={handleSaveRule}
            onDeleteRule={handleDeleteRule}
            onToggleRule={handleToggleRule}
          />
        )}

        {/* Help Section */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Rule Processing Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <p className="mb-2">• <strong>Priority matters:</strong> Lower numbers = higher priority</p>
                  <p className="mb-2">• <strong>Conditions:</strong> Use AND for strict matching, OR for flexible matching</p>
                  <p>• <strong>Credit Scores:</strong> 720+ excellent, 650-719 good, &lt;650 poor</p>
                </div>
                <div>
                  <p className="mb-2">• <strong>Email patterns:</strong> Use "contains" for domains, "equals" for exact matches</p>
                  <p className="mb-2">• <strong>Testing:</strong> Start with inactive rules to test conditions</p>
                  <p>• <strong>Actions:</strong> Tag leads automatically or trigger webhooks for external systems</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default function AutoTaggingRulesPageWrapper() {
  return (
    <ToastProvider>
      <AutoTaggingRulesPage />
    </ToastProvider>
  );
}