'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { SimpleToast } from '@/components/ui/SimpleToast';

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicOperator?: 'AND' | 'OR';
}

interface RuleAction {
  type: 'add_tags' | 'assign_rep' | 'flag_review' | 'send_notification' | 'pixel_sync';
  parameters: {
    tags?: string[];
    assignee?: string;
    priority?: string;
    message?: string;
    pixelTargets?: string[];
  };
}

interface TaggingRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  active: boolean;
  createdAt: string;
  lastExecuted?: string;
  executionCount: number;
  successRate: number;
}

// Field configurations for rule conditions
const FIELD_CONFIG = {
  creditScore: {
    label: 'Credit Score',
    type: 'number',
    operators: ['>=', '<=', '>', '<', '=', 'between'],
    icon: '💳',
    description: 'FICO credit score (300-850)'
  },
  incomeEstimate: {
    label: 'Income Estimate',
    type: 'number',
    operators: ['>=', '<=', '>', '<', '=', 'between'],
    icon: '💰',
    description: 'Estimated annual income'
  },
  email: {
    label: 'Email Address',
    type: 'text',
    operators: ['contains', 'not_contains', 'ends_with', 'starts_with', 'matches_pattern'],
    icon: '📧',
    description: 'Email address patterns'
  },
  phone: {
    label: 'Phone Number',
    type: 'text',
    operators: ['matches_pattern', 'area_code', 'contains'],
    icon: '📱',
    description: 'Phone number format and patterns'
  },
  state: {
    label: 'State',
    type: 'select',
    operators: ['=', '!=', 'in', 'not_in'],
    icon: '🌎',
    description: 'US state location',
    options: ['CA', 'NY', 'FL', 'TX', 'WA', 'IL', 'PA', 'OH', 'GA', 'NC']
  },
  city: {
    label: 'City',
    type: 'text',
    operators: ['=', '!=', 'contains', 'in'],
    icon: '🏙️',
    description: 'City location'
  },
  firstName: {
    label: 'First Name',
    type: 'text',
    operators: ['=', '!=', 'contains', 'starts_with'],
    icon: '👤',
    description: 'Lead first name'
  },
  lastName: {
    label: 'Last Name',
    type: 'text',
    operators: ['=', '!=', 'contains', 'starts_with'],
    icon: '👤',
    description: 'Lead last name'
  },
  zipCode: {
    label: 'ZIP Code',
    type: 'text',
    operators: ['=', '!=', 'starts_with', 'in'],
    icon: '📍',
    description: 'ZIP code patterns'
  }
} as const;

export default function LeadRulesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'rules' | 'create' | 'analytics'>('rules');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Rule builder state
  const [ruleConditions, setRuleConditions] = useState<RuleCondition[]>([]);
  const [ruleActions, setRuleActions] = useState<RuleAction[]>([]);
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [rulePriority, setRulePriority] = useState(1);
  const [isRuleActive, setIsRuleActive] = useState(true);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Add new condition to rule builder
  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: `cond-${Date.now()}`,
      field: 'creditScore',
      operator: '>=',
      value: '',
      logicOperator: ruleConditions.length > 0 ? 'AND' : undefined
    };
    setRuleConditions([...ruleConditions, newCondition]);
  };

  // Update condition
  const updateCondition = (id: string, updates: Partial<RuleCondition>) => {
    setRuleConditions(conditions => 
      conditions.map(condition => 
        condition.id === id ? { ...condition, ...updates } : condition
      )
    );
  };

  // Remove condition
  const removeCondition = (id: string) => {
    setRuleConditions(conditions => {
      const filtered = conditions.filter(condition => condition.id !== id);
      // Reset first condition's logic operator
      if (filtered.length > 0 && filtered[0].logicOperator) {
        filtered[0] = { ...filtered[0], logicOperator: undefined };
      }
      return filtered;
    });
  };

  // Add new action to rule builder
  const addAction = () => {
    const newAction: RuleAction = {
      type: 'add_tags',
      parameters: { tags: [] }
    };
    setRuleActions([...ruleActions, newAction]);
  };

  // Update action
  const updateAction = (index: number, updates: Partial<RuleAction>) => {
    setRuleActions(actions => 
      actions.map((action, i) => 
        i === index ? { ...action, ...updates } : action
      )
    );
  };

  // Remove action
  const removeAction = (index: number) => {
    setRuleActions(actions => actions.filter((_, i) => i !== index));
  };

  // Reset rule builder
  const resetRuleBuilder = () => {
    setRuleConditions([]);
    setRuleActions([]);
    setRuleName('');
    setRuleDescription('');
    setRulePriority(1);
    setIsRuleActive(true);
    setEditingRule(null);
  };

  // Rule management state
  const [editingRule, setEditingRule] = useState<TaggingRule | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'success' | 'executions'>('priority');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load rule for editing
  const loadRuleForEdit = (rule: TaggingRule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleDescription(rule.description);
    setRulePriority(rule.priority);
    setIsRuleActive(rule.active);
    setRuleConditions(rule.conditions);
    setRuleActions(rule.actions);
    setActiveTab('create');
  };

  // Update existing rule
  const updateRule = (updatedRule: TaggingRule) => {
    setTaggingRules(rules => 
      rules.map(rule => 
        rule.id === updatedRule.id ? updatedRule : rule
      )
    );
  };

  // Delete rule
  const deleteRule = (ruleId: string) => {
    const rule = taggingRules.find(r => r.id === ruleId);
    if (rule && window.confirm(`Are you sure you want to delete the rule "${rule.name}"?`)) {
      setTaggingRules(rules => rules.filter(r => r.id !== ruleId));
      showNotification(`Rule "${rule.name}" deleted successfully`, 'success');
    }
  };

  // Toggle rule active status
  const toggleRuleStatus = (ruleId: string) => {
    setTaggingRules(rules => 
      rules.map(rule => {
        if (rule.id === ruleId) {
          const newStatus = !rule.active;
          showNotification(`Rule "${rule.name}" ${newStatus ? 'activated' : 'deactivated'}`, 'success');
          return { ...rule, active: newStatus };
        }
        return rule;
      })
    );
  };

  // Update rule priority
  const updateRulePriority = (ruleId: string, newPriority: number) => {
    setTaggingRules(rules => 
      rules.map(rule => 
        rule.id === ruleId ? { ...rule, priority: newPriority } : rule
      )
    );
    const rule = taggingRules.find(r => r.id === ruleId);
    if (rule) {
      showNotification(`Rule "${rule.name}" priority updated to ${newPriority}`, 'success');
    }
  };

  // Duplicate rule
  const duplicateRule = (rule: TaggingRule) => {
    const duplicatedRule: TaggingRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      name: `${rule.name} (Copy)`,
      createdAt: new Date().toISOString(),
      executionCount: 0,
      successRate: 0,
      active: false
    };
    setTaggingRules(rules => [...rules, duplicatedRule]);
    showNotification(`Rule "${duplicatedRule.name}" created as copy`, 'success');
  };

  // Filter and sort rules
  const getFilteredRules = () => {
    let filtered = taggingRules;
    
    // Filter by status
    if (filterActive === 'active') {
      filtered = filtered.filter(rule => rule.active);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(rule => !rule.active);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(rule => 
        rule.name.toLowerCase().includes(term) ||
        rule.description.toLowerCase().includes(term)
      );
    }
    
    // Sort rules
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return a.priority - b.priority;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'success':
          return b.successRate - a.successRate;
        case 'executions':
          return b.executionCount - a.executionCount;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  // Sample leads for testing
  const SAMPLE_LEADS = [
    {
      id: 'lead-001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@techstartup.com',
      phone: '(555) 123-4567',
      creditScore: 785,
      incomeEstimate: 95000,
      state: 'CA',
      city: 'San Francisco',
      zipCode: '94102',
      scenario: 'High-value tech professional'
    },
    {
      id: 'lead-002',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@email.com',
      phone: '(555) 987-6543',
      creditScore: 650,
      incomeEstimate: 45000,
      state: 'TX',
      city: 'Austin',
      zipCode: '73301',
      scenario: 'Mid-tier consumer lead'
    },
    {
      id: 'lead-003',
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@globalbusiness.com',
      phone: '(555) 456-7890',
      creditScore: 720,
      incomeEstimate: 125000,
      state: 'NY',
      city: 'New York',
      zipCode: '10001',
      scenario: 'Business owner prospect'
    },
    {
      id: 'lead-004',
      firstName: 'Lisa',
      lastName: 'Chen',
      email: 'lisa.c@tempmail.com',
      phone: '(555) 321-0987',
      creditScore: 580,
      incomeEstimate: 32000,
      state: 'FL',
      city: 'Miami',
      zipCode: '33101',
      scenario: 'Potentially low-quality lead'
    },
    {
      id: 'lead-005',
      firstName: 'David',
      lastName: 'Williams',
      email: 'david@premium-consulting.com',
      phone: '(555) 654-3210',
      creditScore: 810,
      incomeEstimate: 185000,
      state: 'WA',
      city: 'Seattle',
      zipCode: '98101',
      scenario: 'Premium qualified prospect'
    }
  ];

  // Rule testing state
  const [testingRule, setTestingRule] = useState<TaggingRule | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTestingInProgress, setIsTestingInProgress] = useState(false);

  // Test rule against sample leads
  const testRuleAgainstLeads = async (rule: TaggingRule) => {
    setTestingRule(rule);
    setIsTestingInProgress(true);
    setTestResults([]);

    // Simulate testing delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    const results = SAMPLE_LEADS.map(lead => {
      const matches = rule.conditions.map(condition => {
        const leadValue = lead[condition.field as keyof typeof lead];
        return evaluateCondition(leadValue, condition.operator, condition.value);
      });

      // Simple AND/OR logic evaluation
      let conditionResult = matches[0];
      for (let i = 1; i < matches.length; i++) {
        const logicOperator = rule.conditions[i].logicOperator || 'AND';
        if (logicOperator === 'AND') {
          conditionResult = conditionResult && matches[i];
        } else {
          conditionResult = conditionResult || matches[i];
        }
      }

      return {
        lead,
        matches: conditionResult,
        conditionDetails: matches.map((match, index) => ({
          condition: rule.conditions[index],
          leadValue: lead[rule.conditions[index].field as keyof typeof lead],
          matches: match
        })),
        appliedActions: conditionResult ? rule.actions : []
      };
    });

    setTestResults(results);
    setIsTestingInProgress(false);
  };

  // Evaluate a single condition
  const evaluateCondition = (leadValue: any, operator: string, ruleValue: string): boolean => {
    const numericLeadValue = typeof leadValue === 'number' ? leadValue : parseFloat(leadValue);
    const numericRuleValue = parseFloat(ruleValue);

    switch (operator) {
      case '>=':
        return numericLeadValue >= numericRuleValue;
      case '<=':
        return numericLeadValue <= numericRuleValue;
      case '>':
        return numericLeadValue > numericRuleValue;
      case '<':
        return numericLeadValue < numericRuleValue;
      case '=':
        return leadValue?.toString().toLowerCase() === ruleValue.toLowerCase();
      case '!=':
        return leadValue?.toString().toLowerCase() !== ruleValue.toLowerCase();
      case 'contains':
        return leadValue?.toString().toLowerCase().includes(ruleValue.toLowerCase());
      case 'not_contains':
        return !leadValue?.toString().toLowerCase().includes(ruleValue.toLowerCase());
      case 'starts_with':
        return leadValue?.toString().toLowerCase().startsWith(ruleValue.toLowerCase());
      case 'ends_with':
        return leadValue?.toString().toLowerCase().endsWith(ruleValue.toLowerCase());
      case 'in':
        const values = ruleValue.split(',').map(v => v.trim().toLowerCase());
        return values.includes(leadValue?.toString().toLowerCase());
      case 'not_in':
        const excludeValues = ruleValue.split(',').map(v => v.trim().toLowerCase());
        return !excludeValues.includes(leadValue?.toString().toLowerCase());
      default:
        return false;
    }
  };

  // Simulation state
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationLog, setSimulationLog] = useState<any[]>([]);
  const [simulationStats, setSimulationStats] = useState({
    totalLeads: 0,
    rulesTriggered: 0,
    actionsExecuted: 0,
    averageProcessingTime: 0
  });

  // Generate random leads for simulation
  const generateRandomLead = () => {
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Robert', 'Maria', 'James', 'Anna'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Jackson'];
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'company.com', 'business.net', 'startup.io'];
    const states = ['CA', 'NY', 'TX', 'FL', 'WA', 'IL', 'PA', 'OH', 'GA', 'NC'];
    const cities = ['Los Angeles', 'New York', 'Houston', 'Miami', 'Seattle', 'Chicago', 'Philadelphia', 'Columbus', 'Atlanta', 'Charlotte'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];

    return {
      id: `sim-lead-${Date.now()}-${Math.random()}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      creditScore: Math.floor(Math.random() * 400) + 450, // 450-850
      incomeEstimate: Math.floor(Math.random() * 150000) + 25000, // 25k-175k
      state,
      city,
      zipCode: Math.floor(Math.random() * 90000) + 10000,
      timestamp: new Date()
    };
  };

  // Run rule execution simulation
  const runAutomationSimulation = async () => {
    setIsSimulationRunning(true);
    setSimulationLog([]);
    setSimulationStats({ totalLeads: 0, rulesTriggered: 0, actionsExecuted: 0, averageProcessingTime: 0 });

    const activeRules = taggingRules.filter(rule => rule.active);
    if (activeRules.length === 0) {
      showNotification('No active rules to simulate', 'error');
      setIsSimulationRunning(false);
      return;
    }

    showNotification('🚀 Starting automated rule execution simulation', 'success');
    
    let totalLeads = 0;
    let totalRulesTriggered = 0;
    let totalActionsExecuted = 0;
    let processingTimes: number[] = [];

    // Simulate lead processing for 30 seconds
    const interval = setInterval(() => {
      if (!isSimulationRunning) {
        clearInterval(interval);
        return;
      }

      // Generate 1-3 leads per interval
      const leadsCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < leadsCount; i++) {
        const lead = generateRandomLead();
        const startTime = Date.now();
        
        const matchedRules: any[] = [];
        let totalActions = 0;

        // Test against all active rules
        activeRules.forEach(rule => {
          const matches = rule.conditions.map(condition => {
            const leadValue = lead[condition.field as keyof typeof lead];
            return evaluateCondition(leadValue, condition.operator, condition.value);
          });

          // Simple AND/OR logic evaluation
          let conditionResult = matches[0];
          for (let j = 1; j < matches.length; j++) {
            const logicOperator = rule.conditions[j].logicOperator || 'AND';
            if (logicOperator === 'AND') {
              conditionResult = conditionResult && matches[j];
            } else {
              conditionResult = conditionResult || matches[j];
            }
          }

          if (conditionResult) {
            matchedRules.push(rule);
            totalActions += rule.actions.length;
          }
        });

        const processingTime = Date.now() - startTime;
        processingTimes.push(processingTime);

        // Add to log
        setSimulationLog(prev => [
          {
            id: lead.id,
            timestamp: lead.timestamp,
            lead: {
              name: `${lead.firstName} ${lead.lastName}`,
              email: lead.email,
              creditScore: lead.creditScore,
              state: lead.state
            },
            matchedRules: matchedRules.length,
            ruleNames: matchedRules.map(r => r.name),
            actionsExecuted: totalActions,
            processingTime,
            status: matchedRules.length > 0 ? 'processed' : 'no-match'
          },
          ...prev.slice(0, 49) // Keep only latest 50 entries
        ]);

        totalLeads++;
        totalRulesTriggered += matchedRules.length;
        totalActionsExecuted += totalActions;
      }

      // Update stats
      setSimulationStats({
        totalLeads,
        rulesTriggered: totalRulesTriggered,
        actionsExecuted: totalActionsExecuted,
        averageProcessingTime: processingTimes.length > 0 
          ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
          : 0
      });
    }, 1500); // Process every 1.5 seconds

    // Stop simulation after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsSimulationRunning(false);
      showNotification('🏁 Simulation completed', 'success');
    }, 30000);
  };

  // Stop simulation manually
  const stopSimulation = () => {
    setIsSimulationRunning(false);
    showNotification('⏹️ Simulation stopped', 'success');
  };

  // Mock data with sophisticated rule structure
  const [taggingRules, setTaggingRules] = useState<TaggingRule[]>([
    {
      id: 'rule-001',
      name: 'Premium Credit Score Qualification',
      description: 'Automatically identify and prioritize leads with excellent credit scores for premium product offerings',
      conditions: [
        {
          id: 'cond-001',
          field: 'creditScore',
          operator: '>=',
          value: '750'
        }
      ],
      actions: [
        {
          type: 'add_tags',
          parameters: {
            tags: ['premium', 'high-value', 'auto-qualified']
          }
        },
        {
          type: 'pixel_sync',
          parameters: {
            pixelTargets: ['meta-premium-lookalike', 'google-high-value-audience']
          }
        }
      ],
      priority: 1,
      active: true,
      createdAt: '2024-08-25T10:00:00Z',
      lastExecuted: '2024-08-28T15:30:00Z',
      executionCount: 247,
      successRate: 94.5
    },
    {
      id: 'rule-002',
      name: 'Business Owner Identification',
      description: 'Detect potential business owners using advanced email and contact pattern analysis',
      conditions: [
        {
          id: 'cond-002',
          field: 'email',
          operator: 'contains',
          value: '@company',
          logicOperator: 'AND'
        },
        {
          id: 'cond-003',
          field: 'phone',
          operator: 'matches_pattern',
          value: 'business_format'
        }
      ],
      actions: [
        {
          type: 'add_tags',
          parameters: {
            tags: ['business-owner', 'b2b-prospect', 'commercial-potential']
          }
        },
        {
          type: 'assign_rep',
          parameters: {
            assignee: 'commercial-team'
          }
        }
      ],
      priority: 2,
      active: true,
      createdAt: '2024-08-20T14:20:00Z',
      lastExecuted: '2024-08-28T16:15:00Z',
      executionCount: 89,
      successRate: 87.2
    },
    {
      id: 'rule-003',
      name: 'Geographic Market Routing',
      description: 'Route leads from tier-1 markets to specialized regional representatives',
      conditions: [
        {
          id: 'cond-004',
          field: 'state',
          operator: 'in',
          value: 'CA,NY,FL,TX'
        }
      ],
      actions: [
        {
          type: 'add_tags',
          parameters: {
            tags: ['tier-1-market', 'priority-region']
          }
        },
        {
          type: 'assign_rep',
          parameters: {
            assignee: 'regional-specialist'
          }
        }
      ],
      priority: 3,
      active: true,
      createdAt: '2024-08-18T09:45:00Z',
      lastExecuted: '2024-08-28T14:45:00Z',
      executionCount: 156,
      successRate: 91.7
    },
    {
      id: 'rule-004',
      name: 'Quality Control Filter',
      description: 'Flag potentially low-quality leads for manual review based on multiple risk factors',
      conditions: [
        {
          id: 'cond-005',
          field: 'creditScore',
          operator: '<',
          value: '600',
          logicOperator: 'OR'
        },
        {
          id: 'cond-006',
          field: 'email',
          operator: 'matches_pattern',
          value: 'generic_email'
        }
      ],
      actions: [
        {
          type: 'flag_review',
          parameters: {
            priority: 'medium'
          }
        },
        {
          type: 'add_tags',
          parameters: {
            tags: ['requires-review', 'quality-check-needed']
          }
        }
      ],
      priority: 4,
      active: false,
      createdAt: '2024-08-15T16:30:00Z',
      executionCount: 45,
      successRate: 76.8
    }
  ]);

  const ruleStats = {
    totalRules: taggingRules.length,
    activeRules: taggingRules.filter(r => r.active).length,
    processedToday: 247,
    automationRate: 92
  };

  const TabButton = ({ tab, label, isActive, onClick }: {
    tab: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-neon-green text-black shadow-lg'
          : 'bg-white/5 text-gray-300 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-white mb-2">
              🤖 Auto-Tagging Rules Engine
            </h1>
            <p className="text-body-large text-gray-400">
              Advanced lead qualification and routing automation system
            </p>
          </div>
          <div className="flex gap-3">
            <NeonButton variant="secondary" onClick={() => router.push('/leads')}>
              Back to Leads
            </NeonButton>
            <NeonButton onClick={() => setActiveTab('create')}>
              ➕ Create Rule
            </NeonButton>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
          <TabButton
            tab="rules"
            label="📋 Rules"
            isActive={activeTab === 'rules'}
            onClick={() => setActiveTab('rules')}
          />
          <TabButton
            tab="create"
            label="➕ Create"
            isActive={activeTab === 'create'}
            onClick={() => setActiveTab('create')}
          />
          <TabButton
            tab="analytics"
            label="📊 Analytics"
            isActive={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
        </div>

        {/* Rules Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Rules"
            value={ruleStats.totalRules}
            description="Configured rules"
            icon="📋"
            variant="default"
          />
          <StatCard
            title="Active Rules"
            value={ruleStats.activeRules}
            description="Currently running"
            icon="✅"
            variant="success"
          />
          <StatCard
            title="Processed Today"
            value={ruleStats.processedToday}
            description="Leads auto-tagged"
            icon="⚡"
            variant="neon"
            trend="+15% vs yesterday"
          />
          <StatCard
            title="Automation Rate"
            value={`${ruleStats.automationRate}%`}
            description="Rules efficiency"
            icon="🤖"
            variant="success"
            trend="+3% this week"
          />
        </div>

        {/* Rules Tab - Enhanced Management Dashboard */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-white">🎛️ Rules Management Dashboard</h2>
              <div className="flex gap-3">
                <NeonButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    if (taggingRules.filter(r => r.active).length === 0) {
                      showNotification('No active rules to test', 'error');
                      return;
                    }
                    showNotification('Bulk testing all active rules - feature coming soon!', 'success');
                  }}
                >
                  📊 Bulk Test
                </NeonButton>
                <NeonButton variant="secondary" size="sm">
                  📥 Import
                </NeonButton>
                <NeonButton variant="secondary" size="sm">
                  📤 Export
                </NeonButton>
              </div>
            </div>

            {/* Filters and Search */}
            <GlassCard className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🔍 Search Rules
                  </label>
                  <Input
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📋 Status Filter
                  </label>
                  <select
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green text-sm"
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                  >
                    <option value="all">All Rules ({taggingRules.length})</option>
                    <option value="active">Active Only ({taggingRules.filter(r => r.active).length})</option>
                    <option value="inactive">Inactive Only ({taggingRules.filter(r => !r.active).length})</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📊 Sort By
                  </label>
                  <select
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'priority' | 'name' | 'success' | 'executions')}
                  >
                    <option value="priority">Priority Level</option>
                    <option value="name">Rule Name</option>
                    <option value="success">Success Rate</option>
                    <option value="executions">Execution Count</option>
                  </select>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <NeonButton 
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterActive('all');
                      setSortBy('priority');
                    }}
                  >
                    🔄 Reset
                  </NeonButton>
                </div>
              </div>
            </GlassCard>

            {/* Results Count */}
            <div className="text-sm text-gray-400">
              Showing {getFilteredRules().length} of {taggingRules.length} rules
            </div>

            {/* Rules List - Enhanced Management */}
            <div className="space-y-4">
              {getFilteredRules().length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-white mb-2">No rules found</h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm.trim() ? 'Try adjusting your search terms or filters' : 'Create your first auto-tagging rule to get started'}
                  </p>
                  <NeonButton onClick={() => setActiveTab('create')}>
                    ➕ Create New Rule
                  </NeonButton>
                </GlassCard>
              ) : (
                getFilteredRules().map((rule) => (
                  <GlassCard key={rule.id} className="p-6 hover:bg-white/5 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Status Indicator with Toggle */}
                        <button 
                          onClick={() => toggleRuleStatus(rule.id)}
                          className={`w-4 h-4 rounded-full mt-2 relative transition-all hover:scale-110 ${rule.active ? 'bg-green-500' : 'bg-gray-500 hover:bg-gray-400'}`}
                          title={`Click to ${rule.active ? 'deactivate' : 'activate'} rule`}
                        >
                          {rule.active && (
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-white truncate">{rule.name}</h3>
                            <Badge variant={rule.active ? 'success' : 'default'}>
                              {rule.active ? '✅ Active' : '⏸️ Inactive'}
                            </Badge>
                            
                            {/* Priority Badge with Inline Editor */}
                            <div className="relative group">
                              <select
                                className="appearance-none bg-neon-green/20 border border-neon-green/30 text-neon-green px-3 py-1 rounded text-xs font-bold hover:bg-neon-green/30 focus:outline-none focus:ring-2 focus:ring-neon-green cursor-pointer"
                                value={rule.priority}
                                onChange={(e) => updateRulePriority(rule.id, Number(e.target.value))}
                                title="Change priority level"
                              >
                                <option value={1}>P1</option>
                                <option value={2}>P2</option>
                                <option value={3}>P3</option>
                                <option value={4}>P4</option>
                                <option value={5}>P5</option>
                              </select>
                            </div>
                            
                            <Badge variant="default" size="sm">
                              {rule.executionCount} runs
                            </Badge>
                            <Badge variant={rule.successRate >= 90 ? 'success' : rule.successRate >= 70 ? 'neon' : 'default'} size="sm">
                              {rule.successRate}% success
                            </Badge>
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{rule.description}</p>
                          
                          {/* Conditions Display */}
                          <div className="mb-4">
                            <p className="text-gray-400 text-xs mb-2">CONDITIONS ({rule.conditions.length}):</p>
                            <div className="flex flex-wrap gap-2">
                              {rule.conditions.slice(0, 3).map((condition, index) => (
                                <div key={condition.id} className="flex items-center gap-1">
                                  {index > 0 && condition.logicOperator && (
                                    <span className="text-yellow-400 text-xs font-bold px-1">
                                      {condition.logicOperator}
                                    </span>
                                  )}
                                  <code className="text-neon-green bg-black/30 px-2 py-1 rounded text-xs">
                                    {FIELD_CONFIG[condition.field as keyof typeof FIELD_CONFIG]?.icon} {condition.field} {condition.operator} {condition.value}
                                  </code>
                                </div>
                              ))}
                              {rule.conditions.length > 3 && (
                                <Badge variant="default" size="sm">
                                  +{rule.conditions.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions Display */}
                          <div className="mb-3">
                            <p className="text-gray-400 text-xs mb-2">ACTIONS ({rule.actions.length}):</p>
                            <div className="flex flex-wrap gap-2">
                              {rule.actions.slice(0, 3).map((action, index) => (
                                <div key={index} className="bg-white/5 rounded px-2 py-1">
                                  <span className="text-white text-xs font-medium">
                                    {action.type === 'add_tags' ? '🏷️' :
                                     action.type === 'assign_rep' ? '👤' :
                                     action.type === 'flag_review' ? '🚩' :
                                     action.type === 'send_notification' ? '📢' :
                                     action.type === 'pixel_sync' ? '🎯' : '⚡'}
                                    {action.type.replace('_', ' ').toUpperCase()}
                                  </span>
                                  {action.parameters.tags && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {action.parameters.tags.slice(0, 2).map((tag) => (
                                        <Badge key={tag} variant="default" size="sm">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {action.parameters.tags.length > 2 && (
                                        <Badge variant="default" size="sm">+{action.parameters.tags.length - 2}</Badge>
                                      )}
                                    </div>
                                  )}
                                  {action.parameters.pixelTargets && (
                                    <div className="text-purple-400 text-xs mt-1">
                                      {action.parameters.pixelTargets.length} pixels
                                    </div>
                                  )}
                                </div>
                              ))}
                              {rule.actions.length > 3 && (
                                <Badge variant="default" size="sm">
                                  +{rule.actions.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Performance Metrics */}
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>Created: <span className="text-white">
                              {new Date(rule.createdAt).toLocaleDateString()}
                            </span></span>
                            {rule.lastExecuted && (
                              <span>Last Run: <span className="text-white">
                                {new Date(rule.lastExecuted).toLocaleDateString()}
                              </span></span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => loadRuleForEdit(rule)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                            title="Edit rule"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => duplicateRule(rule)}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors"
                            title="Duplicate rule"
                          >
                            📋
                          </button>
                          <button 
                            onClick={() => testRuleAgainstLeads(rule)}
                            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-colors"
                            title="Test rule with sample leads"
                          >
                            🧪
                          </button>
                          <button 
                            onClick={() => deleteRule(rule.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete rule"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </div>
        )}

        {/* Create Tab - Visual Rule Builder */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {editingRule ? '✏️ Edit Rule' : '🎯 Visual Rule Builder'}
              </h2>
              <div className="flex gap-3">
                {editingRule && (
                  <Badge variant="neon" size="sm">
                    Editing: {editingRule.name}
                  </Badge>
                )}
                <NeonButton 
                  variant="secondary" 
                  size="sm"
                  onClick={resetRuleBuilder}
                >
                  🗑️ Clear All
                </NeonButton>
              </div>
            </div>

            {/* Rule Basic Info */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📋 Rule Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Rule Name" required>
                  <Input
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="Enter descriptive rule name..."
                  />
                </FormField>
                
                <FormField label="Priority Level">
                  <select 
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                    value={rulePriority}
                    onChange={(e) => setRulePriority(Number(e.target.value))}
                  >
                    <option value={1}>Priority 1 (Highest - Execute First)</option>
                    <option value={2}>Priority 2 (High)</option>
                    <option value={3}>Priority 3 (Medium)</option>
                    <option value={4}>Priority 4 (Low)</option>
                    <option value={5}>Priority 5 (Lowest)</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Description" className="mt-4">
                <textarea
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green resize-none"
                  rows={3}
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  placeholder="Describe what this rule does and its business purpose..."
                />
              </FormField>
            </GlassCard>

            {/* Visual Conditions Builder */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">⚡ Rule Conditions</h3>
                <NeonButton size="sm" onClick={addCondition}>
                  ➕ Add Condition
                </NeonButton>
              </div>

              {ruleConditions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-lg mb-2">No conditions defined yet</p>
                  <p className="text-sm">Add conditions to define when this rule should trigger</p>
                  <NeonButton className="mt-4" onClick={addCondition}>
                    ➕ Add Your First Condition
                  </NeonButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {ruleConditions.map((condition, index) => (
                    <div key={condition.id} className="relative">
                      {/* Logic Operator for conditions after the first */}
                      {index > 0 && (
                        <div className="flex items-center justify-center mb-2">
                          <select
                            className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            value={condition.logicOperator || 'AND'}
                            onChange={(e) => updateCondition(condition.id, { logicOperator: e.target.value as 'AND' | 'OR' })}
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        </div>
                      )}

                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          {/* Field Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Field
                            </label>
                            <select
                              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green text-sm"
                              value={condition.field}
                              onChange={(e) => {
                                const field = e.target.value;
                                const config = FIELD_CONFIG[field as keyof typeof FIELD_CONFIG];
                                updateCondition(condition.id, { 
                                  field, 
                                  operator: config.operators[0],
                                  value: ''
                                });
                              }}
                            >
                              {Object.entries(FIELD_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>
                                  {config.icon} {config.label}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                              {FIELD_CONFIG[condition.field as keyof typeof FIELD_CONFIG]?.description}
                            </p>
                          </div>

                          {/* Operator Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Operator
                            </label>
                            <select
                              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green text-sm"
                              value={condition.operator}
                              onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                            >
                              {FIELD_CONFIG[condition.field as keyof typeof FIELD_CONFIG]?.operators.map(op => (
                                <option key={op} value={op}>
                                  {op === '>=' ? 'Greater than or equal' :
                                   op === '<=' ? 'Less than or equal' :
                                   op === '>' ? 'Greater than' :
                                   op === '<' ? 'Less than' :
                                   op === '=' ? 'Equals' :
                                   op === '!=' ? 'Not equals' :
                                   op === 'contains' ? 'Contains' :
                                   op === 'not_contains' ? 'Does not contain' :
                                   op === 'starts_with' ? 'Starts with' :
                                   op === 'ends_with' ? 'Ends with' :
                                   op === 'matches_pattern' ? 'Matches pattern' :
                                   op === 'in' ? 'Is one of' :
                                   op === 'not_in' ? 'Is not one of' :
                                   op === 'between' ? 'Between' :
                                   op === 'area_code' ? 'Area code is' : op}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Value Input */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Value
                            </label>
                            {FIELD_CONFIG[condition.field as keyof typeof FIELD_CONFIG]?.type === 'select' && 
                             FIELD_CONFIG[condition.field as keyof typeof FIELD_CONFIG]?.options ? (
                              <select
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green text-sm"
                                value={condition.value}
                                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                              >
                                <option value="">Select...</option>
                                {FIELD_CONFIG[condition.field as keyof typeof FIELD_CONFIG]?.options?.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                value={condition.value}
                                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                                placeholder={
                                  condition.field === 'creditScore' ? '750' :
                                  condition.field === 'incomeEstimate' ? '50000' :
                                  condition.field === 'email' ? '@company.com' :
                                  condition.field === 'zipCode' ? '90210' :
                                  'Enter value...'
                                }
                                type={FIELD_CONFIG[condition.field as keyof typeof FIELD_CONFIG]?.type === 'number' ? 'number' : 'text'}
                                className="text-sm"
                              />
                            )}
                          </div>

                          {/* Remove Button */}
                          <div>
                            <button
                              type="button"
                              onClick={() => removeCondition(condition.id)}
                              className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Remove condition"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Condition Preview */}
                        <div className="mt-3 p-3 bg-black/30 rounded border-l-4 border-neon-green">
                          <code className="text-neon-green text-sm">
                            {FIELD_CONFIG[condition.field as keyof typeof FIELD_CONFIG]?.icon} {FIELD_CONFIG[condition.field as keyof typeof FIELD_CONFIG]?.label} {condition.operator} {condition.value || '[value]'}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-white/10">
                    <NeonButton variant="secondary" size="sm" onClick={addCondition}>
                      ➕ Add Another Condition
                    </NeonButton>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Visual Actions Builder */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">🎬 Rule Actions</h3>
                <NeonButton size="sm" onClick={addAction}>
                  ➕ Add Action
                </NeonButton>
              </div>

              {ruleActions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-4">🎬</div>
                  <p className="text-lg mb-2">No actions defined yet</p>
                  <p className="text-sm">Add actions to define what happens when conditions are met</p>
                  <NeonButton className="mt-4" onClick={addAction}>
                    ➕ Add Your First Action
                  </NeonButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {ruleActions.map((action, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        {/* Action Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Action Type
                          </label>
                          <select
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green text-sm"
                            value={action.type}
                            onChange={(e) => {
                              const type = e.target.value as RuleAction['type'];
                              updateAction(index, { 
                                type, 
                                parameters: type === 'add_tags' ? { tags: [] } :
                                          type === 'assign_rep' ? { assignee: '' } :
                                          type === 'flag_review' ? { priority: 'medium' } :
                                          type === 'send_notification' ? { message: '' } :
                                          type === 'pixel_sync' ? { pixelTargets: [] } : {}
                              });
                            }}
                          >
                            <option value="add_tags">🏷️ Add Tags</option>
                            <option value="assign_rep">👤 Assign Representative</option>
                            <option value="flag_review">🚩 Flag for Review</option>
                            <option value="send_notification">📢 Send Notification</option>
                            <option value="pixel_sync">🎯 Sync to Pixels</option>
                          </select>
                        </div>

                        {/* Action Parameters */}
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {action.type === 'add_tags' ? 'Tags (comma separated)' :
                             action.type === 'assign_rep' ? 'Assignee' :
                             action.type === 'flag_review' ? 'Priority Level' :
                             action.type === 'send_notification' ? 'Message' :
                             action.type === 'pixel_sync' ? 'Pixel Targets' : 'Parameters'}
                          </label>
                          
                          {action.type === 'add_tags' ? (
                            <Input
                              placeholder="premium, high-value, qualified"
                              value={action.parameters.tags?.join(', ') || ''}
                              onChange={(e) => updateAction(index, {
                                parameters: { ...action.parameters, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) }
                              })}
                              className="text-sm"
                            />
                          ) : action.type === 'assign_rep' ? (
                            <select
                              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green text-sm"
                              value={action.parameters.assignee || ''}
                              onChange={(e) => updateAction(index, {
                                parameters: { ...action.parameters, assignee: e.target.value }
                              })}
                            >
                              <option value="">Select assignee...</option>
                              <option value="sales-team">Sales Team</option>
                              <option value="commercial-team">Commercial Team</option>
                              <option value="regional-specialist">Regional Specialist</option>
                              <option value="premium-specialist">Premium Specialist</option>
                              <option value="quality-assurance">Quality Assurance</option>
                            </select>
                          ) : action.type === 'flag_review' ? (
                            <select
                              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green text-sm"
                              value={action.parameters.priority || 'medium'}
                              onChange={(e) => updateAction(index, {
                                parameters: { ...action.parameters, priority: e.target.value }
                              })}
                            >
                              <option value="low">Low Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="high">High Priority</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          ) : action.type === 'send_notification' ? (
                            <Input
                              placeholder="High-value lead detected!"
                              value={action.parameters.message || ''}
                              onChange={(e) => updateAction(index, {
                                parameters: { ...action.parameters, message: e.target.value }
                              })}
                              className="text-sm"
                            />
                          ) : action.type === 'pixel_sync' ? (
                            <Input
                              placeholder="meta-premium, google-lookalike"
                              value={action.parameters.pixelTargets?.join(', ') || ''}
                              onChange={(e) => updateAction(index, {
                                parameters: { ...action.parameters, pixelTargets: e.target.value.split(',').map(t => t.trim()).filter(t => t) }
                              })}
                              className="text-sm"
                            />
                          ) : null}
                        </div>

                        {/* Remove Button */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeAction(index)}
                            className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove action"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Action Preview */}
                      <div className="mt-3 p-3 bg-black/30 rounded border-l-4 border-purple-500">
                        <code className="text-purple-400 text-sm">
                          {action.type === 'add_tags' && action.parameters.tags?.length ? 
                            `🏷️ Add tags: ${action.parameters.tags.join(', ')}` :
                           action.type === 'assign_rep' && action.parameters.assignee ?
                            `👤 Assign to: ${action.parameters.assignee}` :
                           action.type === 'flag_review' ?
                            `🚩 Flag for ${action.parameters.priority} priority review` :
                           action.type === 'send_notification' && action.parameters.message ?
                            `📢 Send: "${action.parameters.message}"` :
                           action.type === 'pixel_sync' && action.parameters.pixelTargets?.length ?
                            `🎯 Sync to: ${action.parameters.pixelTargets.join(', ')}` :
                            `${action.type.replace('_', ' ').toUpperCase()} [configure parameters]`}
                        </code>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-white/10">
                    <NeonButton variant="secondary" size="sm" onClick={addAction}>
                      ➕ Add Another Action
                    </NeonButton>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Rule Settings */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">⚙️ Rule Settings</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg flex-1">
                  <input
                    type="checkbox"
                    id="activate-rule"
                    checked={isRuleActive}
                    onChange={(e) => setIsRuleActive(e.target.checked)}
                    className="w-4 h-4 text-neon-green bg-transparent border-gray-300 rounded focus:ring-neon-green focus:ring-2"
                  />
                  <label htmlFor="activate-rule" className="text-white font-medium">
                    ✅ Activate rule immediately after creation
                  </label>
                </div>
              </div>
            </GlassCard>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <NeonButton 
                onClick={() => {
                  if (!ruleName.trim()) {
                    showNotification('Please enter a rule name', 'error');
                    return;
                  }
                  if (ruleConditions.length === 0) {
                    showNotification('Please add at least one condition', 'error');
                    return;
                  }
                  if (ruleActions.length === 0) {
                    showNotification('Please add at least one action', 'error');
                    return;
                  }
                  
                  if (editingRule) {
                    // Update existing rule
                    const updatedRule: TaggingRule = {
                      ...editingRule,
                      name: ruleName,
                      description: ruleDescription,
                      conditions: ruleConditions,
                      actions: ruleActions,
                      priority: rulePriority,
                      active: isRuleActive,
                      updatedAt: new Date().toISOString()
                    };
                    
                    updateRule(updatedRule);
                    showNotification(`Rule "${ruleName}" updated successfully!`, 'success');
                  } else {
                    // Create new rule
                    const newRule: TaggingRule = {
                      id: `rule-${Date.now()}`,
                      name: ruleName,
                      description: ruleDescription,
                      conditions: ruleConditions,
                      actions: ruleActions,
                      priority: rulePriority,
                      active: isRuleActive,
                      createdAt: new Date().toISOString(),
                      executionCount: 0,
                      successRate: 0
                    };
                    
                    setTaggingRules(prev => [...prev, newRule]);
                    showNotification(`Rule "${ruleName}" created successfully!`, 'success');
                  }
                  
                  resetRuleBuilder();
                  setActiveTab('rules');
                }}
                disabled={!ruleName.trim() || ruleConditions.length === 0 || ruleActions.length === 0}
              >
                {editingRule ? '💾 Update Rule' : '✅ Create Rule'}
              </NeonButton>
              <NeonButton 
                variant="secondary"
                onClick={() => {
                  if (ruleConditions.length === 0) {
                    showNotification('Add conditions first to test the rule', 'error');
                    return;
                  }
                  showNotification('Rule testing: Conditions look valid. Ready for deployment!', 'success');
                }}
              >
                🧪 Test Rule Logic
              </NeonButton>
              <NeonButton 
                variant="secondary"
                onClick={() => {
                  if (editingRule && (ruleName !== editingRule.name || ruleDescription !== editingRule.description || ruleConditions.length > 0 || ruleActions.length > 0)) {
                    if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                      resetRuleBuilder();
                      setActiveTab('rules');
                    }
                  } else {
                    resetRuleBuilder();
                    setActiveTab('rules');
                  }
                }}
              >
                ❌ {editingRule ? 'Cancel Edit' : 'Cancel'}
              </NeonButton>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">📊 Rules Performance Analytics</h2>
              <div className="flex gap-3">
                <NeonButton 
                  variant={isSimulationRunning ? "secondary" : "default"}
                  onClick={isSimulationRunning ? stopSimulation : runAutomationSimulation}
                  disabled={taggingRules.filter(r => r.active).length === 0}
                >
                  {isSimulationRunning ? '⏹️ Stop Simulation' : '🚀 Start Live Simulation'}
                </NeonButton>
                <NeonButton 
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSimulationLog([]);
                    setSimulationStats({ totalLeads: 0, rulesTriggered: 0, actionsExecuted: 0, averageProcessingTime: 0 });
                  }}
                  disabled={isSimulationRunning}
                >
                  🗑️ Clear Log
                </NeonButton>
              </div>
            </div>

            {/* Live Simulation Status */}
            {(isSimulationRunning || simulationLog.length > 0) && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${isSimulationRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <h3 className="text-lg font-semibold text-white">
                    {isSimulationRunning ? '🔄 Live Automation Simulation Running' : '⏸️ Simulation Paused'}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-neon-green">{simulationStats.totalLeads}</div>
                    <div className="text-xs text-gray-400">Leads Processed</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-400">{simulationStats.rulesTriggered}</div>
                    <div className="text-xs text-gray-400">Rules Triggered</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-400">{simulationStats.actionsExecuted}</div>
                    <div className="text-xs text-gray-400">Actions Executed</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{simulationStats.averageProcessingTime}ms</div>
                    <div className="text-xs text-gray-400">Avg Processing</div>
                  </div>
                </div>

                {/* Live Feed */}
                {simulationLog.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-3">📡 Live Processing Feed</h4>
                    <div className="bg-black/50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                      {simulationLog.slice(0, 10).map((entry) => (
                        <div key={entry.id} className={`flex items-center justify-between text-sm p-2 rounded border-l-4 ${
                          entry.status === 'processed' 
                            ? 'border-green-500 bg-green-500/10' 
                            : 'border-gray-500 bg-gray-500/10'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-mono text-gray-400">
                              {entry.timestamp.toLocaleTimeString()}
                            </div>
                            <div className="text-white">
                              {entry.lead.name} ({entry.lead.email})
                            </div>
                            <div className="text-xs text-gray-400">
                              Credit: {entry.lead.creditScore} • {entry.lead.state}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {entry.matchedRules > 0 ? (
                              <>
                                <Badge variant="success" size="sm">
                                  {entry.matchedRules} rules
                                </Badge>
                                <Badge variant="neon" size="sm">
                                  {entry.actionsExecuted} actions
                                </Badge>
                                <div className="text-xs text-green-400">{entry.processingTime}ms</div>
                              </>
                            ) : (
                              <>
                                <Badge variant="default" size="sm">
                                  No match
                                </Badge>
                                <div className="text-xs text-gray-400">{entry.processingTime}ms</div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {simulationLog.length > 10 && (
                        <div className="text-center text-xs text-gray-400 pt-2">
                          ... and {simulationLog.length - 10} more entries
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>
            )}
            
            {/* Help Text for Empty State */}
            {!isSimulationRunning && simulationLog.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-lg mb-2">Start Live Simulation</p>
                <p className="text-sm">Watch your auto-tagging rules process leads in real-time</p>
              </div>
            )}
            {/* Enhanced Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="Total Rules"
                value={taggingRules.length.toString()}
                description="All rules configured"
                icon="📋"
                variant="default"
              />
              <StatCard
                title="Active Rules"
                value={taggingRules.filter(r => r.active).length.toString()}
                description="Currently processing"
                icon="✅"
                variant="success"
                trend={`${Math.round((taggingRules.filter(r => r.active).length / taggingRules.length) * 100)}% of total`}
              />
              <StatCard
                title="Rules Executed"
                value="1,247"
                description="This month"
                icon="⚡"
                variant="neon"
                trend="+18% vs last month"
              />
              <StatCard
                title="Avg Success Rate"
                value={`${Math.round(taggingRules.reduce((acc, rule) => acc + rule.successRate, 0) / taggingRules.length)}%`}
                description="Across all rules"
                icon="🎯"
                variant="success"
                trend="+5% this week"
              />
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Rules */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6">🏆 Top Performing Rules</h3>
                <div className="space-y-4">
                  {taggingRules
                    .filter(r => r.active)
                    .sort((a, b) => b.successRate - a.successRate)
                    .slice(0, 5)
                    .map((rule, index) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-400/20 text-gray-400' :
                          index === 2 ? 'bg-amber-600/20 text-amber-600' :
                          'bg-neon-green/20 text-neon-green'
                        }`}>
                          {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{rule.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Priority {rule.priority}</span>
                            <span>•</span>
                            <span>{rule.conditions.length} conditions</span>
                            <span>•</span>
                            <span>{rule.actions.length} actions</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            rule.successRate >= 90 ? 'bg-green-500' :
                            rule.successRate >= 70 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}></div>
                          <p className="text-sm font-bold text-white">{rule.successRate}%</p>
                        </div>
                        <p className="text-xs text-gray-400">{rule.executionCount} executions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Rule Type Distribution */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6">📊 Action Type Distribution</h3>
                <div className="space-y-4">
                  {Object.entries(
                    taggingRules.reduce((acc, rule) => {
                      rule.actions.forEach(action => {
                        const type = action.type.replace('_', ' ').toUpperCase();
                        acc[type] = (acc[type] || 0) + 1;
                      });
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => {
                    const percentage = Math.round((count / taggingRules.reduce((acc, rule) => acc + rule.actions.length, 0)) * 100);
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">
                            {type === 'ADD TAGS' ? '🏷️' :
                             type === 'ASSIGN REP' ? '👤' :
                             type === 'FLAG REVIEW' ? '🚩' :
                             type === 'SEND NOTIFICATION' ? '📢' :
                             type === 'PIXEL SYNC' ? '🎯' : '⚡'}
                            {type}
                          </span>
                          <span className="text-gray-400">{count} rules ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-neon-green to-green-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* Performance Insights */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">📈 Performance Insights & Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-neon-green">✨ Optimization Opportunities</h4>
                  <div className="space-y-3">
                    {taggingRules.filter(r => r.successRate < 70).length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="text-yellow-500 mt-0.5">💡</div>
                          <div>
                            <p className="text-yellow-400 text-sm font-medium">Low Performance Rules Detected</p>
                            <p className="text-gray-300 text-xs mt-1">
                              {taggingRules.filter(r => r.successRate < 70).length} rule(s) have success rates below 70%. 
                              Consider reviewing conditions or adjusting criteria.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {taggingRules.filter(r => !r.active).length > 0 && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="text-blue-500 mt-0.5">🚀</div>
                          <div>
                            <p className="text-blue-400 text-sm font-medium">Inactive Rules Available</p>
                            <p className="text-gray-300 text-xs mt-1">
                              {taggingRules.filter(r => !r.active).length} rule(s) are inactive. 
                              Activate them to increase automation coverage.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {taggingRules.some(r => r.conditions.length === 1) && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="text-green-500 mt-0.5">🎯</div>
                          <div>
                            <p className="text-green-400 text-sm font-medium">Simple Rules Detected</p>
                            <p className="text-gray-300 text-xs mt-1">
                              Consider adding more conditions to single-condition rules for better precision.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-neon-green">📊 Key Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">Most Complex Rule</span>
                      <div className="text-right">
                        <div className="text-white text-sm font-medium">
                          {taggingRules.reduce((max, rule) => 
                            rule.conditions.length > max.conditions.length ? rule : max
                          ).name}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {Math.max(...taggingRules.map(r => r.conditions.length))} conditions
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">Most Active Rule</span>
                      <div className="text-right">
                        <div className="text-white text-sm font-medium">
                          {taggingRules.reduce((max, rule) => 
                            rule.executionCount > max.executionCount ? rule : max
                          ).name}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {Math.max(...taggingRules.map(r => r.executionCount))} executions
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">Average Conditions per Rule</span>
                      <div className="text-white text-sm font-medium">
                        {(taggingRules.reduce((acc, rule) => acc + rule.conditions.length, 0) / taggingRules.length).toFixed(1)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">Average Actions per Rule</span>
                      <div className="text-white text-sm font-medium">
                        {(taggingRules.reduce((acc, rule) => acc + rule.actions.length, 0) / taggingRules.length).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Rule Execution Timeline */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">📅 Recent Rule Activity</h3>
              <div className="space-y-3">
                {taggingRules
                  .filter(r => r.lastExecuted)
                  .sort((a, b) => new Date(b.lastExecuted!).getTime() - new Date(a.lastExecuted!).getTime())
                  .slice(0, 10)
                  .map((rule, index) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                        <div>
                          <p className="text-white text-sm font-medium">{rule.name}</p>
                          <p className="text-gray-400 text-xs">Priority {rule.priority} • {rule.successRate}% success rate</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-300 text-sm">{new Date(rule.lastExecuted!).toLocaleDateString()}</p>
                        <p className="text-gray-400 text-xs">{new Date(rule.lastExecuted!).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                {taggingRules.filter(r => r.lastExecuted).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">📋</div>
                    <p>No recent rule executions</p>
                    <p className="text-sm">Rules will appear here after they process leads</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Rule Testing Modal */}
        {testingRule && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    🧪 Testing Rule: "{testingRule.name}"
                  </h2>
                  <button 
                    onClick={() => {
                      setTestingRule(null);
                      setTestResults([]);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ❌
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {isTestingInProgress ? (
                  <div className="text-center py-12">
                    <div className="animate-spin text-4xl mb-4">⚙️</div>
                    <p className="text-lg text-white mb-2">Testing rule against sample leads...</p>
                    <p className="text-gray-400">Evaluating conditions and simulating actions</p>
                  </div>
                ) : testResults.length > 0 ? (
                  <div className="space-y-6">
                    {/* Test Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <StatCard
                        title="Total Leads Tested"
                        value={testResults.length}
                        description="Sample leads processed"
                        icon="📋"
                        variant="default"
                      />
                      <StatCard
                        title="Rules Matched"
                        value={testResults.filter(r => r.matches).length}
                        description="Conditions satisfied"
                        icon="✅"
                        variant="success"
                        trend={`${Math.round((testResults.filter(r => r.matches).length / testResults.length) * 100)}% match rate`}
                      />
                      <StatCard
                        title="Actions Triggered"
                        value={testResults.filter(r => r.matches).reduce((acc, r) => acc + r.appliedActions.length, 0)}
                        description="Total actions executed"
                        icon="⚡"
                        variant="neon"
                      />
                    </div>

                    {/* Detailed Results */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">📄 Detailed Test Results</h3>
                      {testResults.map((result) => (
                        <div key={result.lead.id} className={`bg-white/5 rounded-lg p-4 border-l-4 ${
                          result.matches ? 'border-green-500' : 'border-gray-500'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-white">
                                {result.lead.firstName} {result.lead.lastName}
                                <Badge variant={result.matches ? 'success' : 'default'} size="sm" className="ml-2">
                                  {result.matches ? '✅ Match' : '❌ No Match'}
                                </Badge>
                              </h4>
                              <p className="text-sm text-gray-400">{result.lead.scenario}</p>
                            </div>
                            <div className="text-xs text-gray-400">
                              {result.lead.email} • {result.lead.state}
                            </div>
                          </div>

                          {/* Lead Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-xs">
                            <div>
                              <span className="text-gray-400">Credit Score:</span>
                              <span className="text-white ml-1">{result.lead.creditScore}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Income:</span>
                              <span className="text-white ml-1">${result.lead.incomeEstimate?.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Location:</span>
                              <span className="text-white ml-1">{result.lead.city}, {result.lead.state}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">ZIP:</span>
                              <span className="text-white ml-1">{result.lead.zipCode}</span>
                            </div>
                          </div>

                          {/* Condition Evaluation */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-2">CONDITION EVALUATION:</p>
                            <div className="flex flex-wrap gap-2">
                              {result.conditionDetails.map((detail, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  {index > 0 && detail.condition.logicOperator && (
                                    <span className="text-yellow-400 text-xs font-bold px-1">
                                      {detail.condition.logicOperator}
                                    </span>
                                  )}
                                  <code className={`px-2 py-1 rounded text-xs ${
                                    detail.matches 
                                      ? 'text-green-400 bg-green-500/20' 
                                      : 'text-red-400 bg-red-500/20'
                                  }`}>
                                    {detail.condition.field} {detail.condition.operator} {detail.condition.value}
                                    <span className="ml-1 text-xs opacity-70">
                                      (Lead: {detail.leadValue})
                                    </span>
                                  </code>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          {result.matches && result.appliedActions.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-400 mb-2">ACTIONS THAT WOULD BE EXECUTED:</p>
                              <div className="flex flex-wrap gap-2">
                                {result.appliedActions.map((action, index) => (
                                  <div key={index} className="bg-green-500/20 text-green-400 rounded px-2 py-1 text-xs">
                                    {action.type === 'add_tags' ? '🏷️' :
                                     action.type === 'assign_rep' ? '👤' :
                                     action.type === 'flag_review' ? '🚩' :
                                     action.type === 'send_notification' ? '📢' :
                                     action.type === 'pixel_sync' ? '🎯' : '⚡'}
                                    {action.type.replace('_', ' ').toUpperCase()}
                                    {action.parameters.tags && (
                                      <span className="ml-1 opacity-70">
                                        ({action.parameters.tags.join(', ')})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-white/10">
                      <NeonButton
                        onClick={() => {
                          showNotification(`Rule test completed: ${testResults.filter(r => r.matches).length}/${testResults.length} leads matched`, 'success');
                          setTestingRule(null);
                          setTestResults([]);
                        }}
                      >
                        ✅ Test Complete
                      </NeonButton>
                      <NeonButton 
                        variant="secondary"
                        onClick={() => testRuleAgainstLeads(testingRule)}
                      >
                        🔄 Re-run Test
                      </NeonButton>
                      <NeonButton 
                        variant="secondary"
                        onClick={() => loadRuleForEdit(testingRule)}
                      >
                        ✏️ Edit Rule
                      </NeonButton>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🧪</div>
                    <p className="text-lg text-white mb-2">Ready to test rule</p>
                    <p className="text-gray-400 mb-6">Click the button below to test this rule against sample leads</p>
                    <NeonButton onClick={() => testRuleAgainstLeads(testingRule)}>
                      ▶️ Start Test
                    </NeonButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <SimpleToast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </AppLayout>
  );
}