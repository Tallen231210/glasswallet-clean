'use client';

import React, { useState, useEffect } from 'react';

// Disable static generation for this page
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  Input, 
  Select,
  Badge, 
  DataTable,
  EnhancedLeadTable,
  StatCard,
  ToastProvider,
  useToast,
  Alert,
  Loading,
  AdvancedFilters,
  SmartSearch,
  QuickFilters,
  defaultLeadQuickFilters,
  highlightText
} from '@/components/ui';
import type { 
  AdvancedFilterConfig, 
  FilterCondition,
  SearchField,
  SearchResult,
  QuickFilter
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';
import { LeadFilterInput } from '@/lib/validation';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  creditScore?: number;
  processed: boolean;
  createdAt: string;
  leadTags: Array<{
    tagType: string;
    rule?: {
      ruleName: string;
    };
  }>;
}

interface LeadsStats {
  total: number;
  processed: number;
  qualified: number;
  unprocessed: number;
}

const LeadsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadsStats>({
    total: 0,
    processed: 0,
    qualified: 0,
    unprocessed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Filter state
  const [filters, setFilters] = useState<LeadFilterInput>({
    page: 1,
    limit: 20,
    tagType: undefined,
    processed: undefined,
    creditScoreMin: undefined,
    creditScoreMax: undefined,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult<Lead>[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterConfig>({
    conditions: [],
    logic: 'AND'
  });
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [savedFilterSets, setSavedFilterSets] = useState<Array<{ name: string; config: AdvancedFilterConfig }>>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Search field configuration
  const searchFields: SearchField[] = [
    { key: 'firstName', label: 'First Name', weight: 1.0, searchable: true, type: 'text' },
    { key: 'lastName', label: 'Last Name', weight: 1.0, searchable: true, type: 'text' },
    { key: 'email', label: 'Email', weight: 0.9, searchable: true, type: 'email' },
    { key: 'phone', label: 'Phone', weight: 0.7, searchable: true, type: 'phone' },
    { key: 'creditScore', label: 'Credit Score', weight: 0.5, searchable: true, type: 'number' }
  ];

  // Advanced filter field configuration
  const filterFields = [
    {
      key: 'firstName',
      label: 'First Name',
      type: 'text' as const,
      operators: ['eq', 'neq', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
    },
    {
      key: 'lastName', 
      label: 'Last Name',
      type: 'text' as const,
      operators: ['eq', 'neq', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text' as const,
      operators: ['eq', 'neq', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
    },
    {
      key: 'phone',
      label: 'Phone',
      type: 'text' as const,
      operators: ['eq', 'neq', 'contains', 'not_contains', 'is_empty', 'is_not_empty']
    },
    {
      key: 'creditScore',
      label: 'Credit Score',
      type: 'number' as const,
      operators: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'is_empty', 'is_not_empty']
    },
    {
      key: 'processed',
      label: 'Processing Status',
      type: 'boolean' as const,
      operators: ['is_true', 'is_false']
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      type: 'date' as const,
      operators: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between']
    },
    {
      key: 'leadTags.tagType',
      label: 'Tag Type',
      type: 'select' as const,
      operators: ['eq', 'neq', 'contains', 'not_contains'],
      options: [
        { value: 'qualified', label: 'Qualified' },
        { value: 'unqualified', label: 'Unqualified' },
        { value: 'whitelist', label: 'Whitelist' },
        { value: 'blacklist', label: 'Blacklist' },
        { value: 'vip', label: 'VIP' }
      ]
    }
  ];

  // Enhanced quick filters with dynamic counts
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>(defaultLeadQuickFilters);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      queryParams.set('page', filters.page.toString());
      queryParams.set('limit', filters.limit.toString());
      
      if (filters.tagType) queryParams.set('tagType', filters.tagType);
      if (filters.processed !== undefined) queryParams.set('processed', filters.processed.toString());
      if (filters.creditScoreMin) queryParams.set('creditScoreMin', filters.creditScoreMin.toString());
      if (filters.creditScoreMax) queryParams.set('creditScoreMax', filters.creditScoreMax.toString());

      const response = await fetch(`/api/leads?${queryParams.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        // Handle authentication errors gracefully in development
        if (response.status === 401) {
          console.log('Authentication required - using demo data for development');
          setLeads([]);
          setStats({ total: 0, processed: 0, qualified: 0, unprocessed: 0 });
          return;
        }
        throw new Error(result.error?.message || 'Failed to fetch leads');
      }

      setLeads(result.data);
      if (result.meta?.pagination) {
        setPagination(result.meta.pagination);
      }

      // Calculate stats from the current data
      const totalLeads = result.data.length;
      const processedLeads = result.data.filter((lead: Lead) => lead.processed).length;
      const qualifiedLeads = result.data.filter((lead: Lead) => 
        lead.leadTags.some(tag => tag.tagType === 'qualified')
      ).length;

      setStats({
        total: result.meta?.pagination?.total || totalLeads,
        processed: processedLeads,
        qualified: qualifiedLeads,
        unprocessed: totalLeads - processedLeads
      });

    } catch (error) {
      console.error('Error fetching leads:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch leads');
      showToast({
        title: 'Error',
        message: 'Failed to load leads',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const handleFilterChange = (key: keyof LeadFilterInput, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const handlePageChange = (page: number) => {
    handleFilterChange('page', page);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    console.log('Sort:', column, direction);
    // TODO: Implement sorting in API
    showToast({
      message: 'Sorting functionality coming soon',
      variant: 'info'
    });
  };

  const handleTagLead = async (leadId: string, tagType: 'whitelist' | 'blacklist', reason?: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/tag`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagType, reason })
      });

      if (!response.ok) {
        throw new Error('Failed to tag lead');
      }

      // Update leads state with new tag
      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, leadTags: [...lead.leadTags, { tagType, rule: { ruleName: 'Manual Tag' } }] }
          : lead
      ));

      showToast({
        title: 'Lead Tagged',
        message: `Lead has been ${tagType === 'whitelist' ? 'whitelisted' : 'blacklisted'}`,
        variant: 'success'
      });

      // Refresh leads to get updated data
      fetchLeads();
    } catch (error) {
      console.error('Error tagging lead:', error);
      showToast({
        title: 'Error',
        message: 'Failed to tag lead',
        variant: 'error'
      });
    }
  };

  const handleBulkTag = async (leadIds: string[], tagType: 'whitelist' | 'blacklist', reason?: string) => {
    try {
      const response = await fetch('/api/leads/bulk-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds, tagType, reason })
      });

      if (!response.ok) {
        throw new Error('Failed to bulk tag leads');
      }

      showToast({
        title: 'Leads Tagged',
        message: `${leadIds.length} leads have been ${tagType === 'whitelist' ? 'whitelisted' : 'blacklisted'}`,
        variant: 'success'
      });

      // Refresh leads to get updated data
      fetchLeads();
    } catch (error) {
      console.error('Error bulk tagging leads:', error);
      showToast({
        title: 'Error',
        message: 'Failed to bulk tag leads',
        variant: 'error'
      });
    }
  };

  const handleExportTagged = (tagType: 'whitelist' | 'blacklist') => {
    const taggedLeads = leads.filter(lead => 
      lead.leadTags.some(tag => tag.tagType === tagType)
    );

    if (taggedLeads.length === 0) {
      showToast({
        title: 'No Data',
        message: `No ${tagType}ed leads to export`,
        variant: 'info'
      });
      return;
    }

    // Create CSV content
    const csvContent = [
      // Header
      'Name,Email,Phone,Credit Score,Created Date,Tags',
      // Data rows
      ...taggedLeads.map(lead => [
        `${lead.firstName} ${lead.lastName}`,
        lead.email,
        lead.phone || '',
        lead.creditScore || '',
        new Date(lead.createdAt).toLocaleDateString(),
        lead.leadTags.map(tag => tag.tagType).join('; ')
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tagType}_leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast({
      title: 'Export Complete',
      message: `${taggedLeads.length} ${tagType}ed leads exported`,
      variant: 'success'
    });
  };

  const getLeadStatus = (lead: Lead) => {
    if (lead.leadTags.some(tag => tag.tagType === 'qualified')) {
      return <Badge variant="success" dot>Qualified</Badge>;
    }
    if (lead.leadTags.some(tag => tag.tagType === 'unqualified')) {
      return <Badge variant="error" dot>Unqualified</Badge>;
    }
    if (lead.leadTags.some(tag => tag.tagType === 'whitelist')) {
      return <Badge variant="neon" dot>Whitelist</Badge>;
    }
    if (lead.leadTags.some(tag => tag.tagType === 'blacklist')) {
      return <Badge variant="warning" dot>Blacklist</Badge>;
    }
    if (!lead.processed) {
      return <Badge variant="default">Pending</Badge>;
    }
    return <Badge variant="default">No Tags</Badge>;
  };

  const columns = [
    { 
      key: 'name' as keyof Lead, 
      header: 'Name', 
      sortable: true,
      render: (lead: Lead) => `${lead.firstName} ${lead.lastName}`
    },
    { key: 'email' as keyof Lead, header: 'Email', sortable: true },
    { 
      key: 'phone' as keyof Lead, 
      header: 'Phone',
      render: (lead: Lead) => lead.phone || '—'
    },
    { 
      key: 'creditScore' as keyof Lead, 
      header: 'Credit Score', 
      sortable: true,
      render: (lead: Lead) => {
        if (!lead.creditScore) return '—';
        let variant: 'success' | 'warning' | 'error' = 'success';
        if (lead.creditScore < 650) variant = 'error';
        else if (lead.creditScore < 720) variant = 'warning';
        return <Badge variant={variant}>{lead.creditScore}</Badge>;
      }
    },
    { 
      key: 'status' as keyof Lead, 
      header: 'Status',
      render: (lead: Lead) => getLeadStatus(lead)
    },
    { 
      key: 'createdAt' as keyof Lead, 
      header: 'Created', 
      sortable: true,
      render: (lead: Lead) => new Date(lead.createdAt).toLocaleDateString()
    },
  ];

  // Apply all filters to get the final displayed leads
  const getFilteredLeads = () => {
    let filtered = [...leads];
    
    // Apply smart search results if there's a search term
    if (searchTerm && searchResults.length > 0) {
      const resultIds = new Set(searchResults.map(r => r.item.id));
      filtered = filtered.filter(lead => resultIds.has(lead.id));
    }
    
    // Apply advanced filters
    if (advancedFilters.conditions.length > 0) {
      filtered = filtered.filter(lead => {
        const results = advancedFilters.conditions.map(condition => 
          evaluateCondition(lead, condition)
        );
        
        return advancedFilters.logic === 'AND' 
          ? results.every(Boolean)
          : results.some(Boolean);
      });
    }
    
    // Apply quick filters
    if (activeQuickFilters.length > 0) {
      filtered = filtered.filter(lead => {
        return activeQuickFilters.every(filterId => {
          const quickFilter = quickFilters.find(f => f.id === filterId);
          if (!quickFilter) return true;
          
          return quickFilter.conditions.every(condition => 
            evaluateCondition(lead, condition)
          );
        });
      });
    }
    
    return filtered;
  };

  const evaluateCondition = (lead: any, condition: FilterCondition | { field: string; operator: string; value: any }) => {
    const value = getNestedValue(lead, condition.field);
    const conditionValue = condition.value;
    
    switch (condition.operator) {
      case 'eq': return value === conditionValue;
      case 'neq': return value !== conditionValue;
      case 'gt': return Number(value) > Number(conditionValue);
      case 'gte': return Number(value) >= Number(conditionValue);
      case 'lt': return Number(value) < Number(conditionValue);
      case 'lte': return Number(value) <= Number(conditionValue);
      case 'contains': return String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'not_contains': return !String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'starts_with': return String(value).toLowerCase().startsWith(String(conditionValue).toLowerCase());
      case 'ends_with': return String(value).toLowerCase().endsWith(String(conditionValue).toLowerCase());
      case 'is_empty': return !value || value === '' || value === null || value === undefined;
      case 'is_not_empty': return value && value !== '' && value !== null && value !== undefined;
      case 'is_true': return Boolean(value) === true;
      case 'is_false': return Boolean(value) === false;
      default: return true;
    }
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => {
      if (key.includes('[') && key.includes(']')) {
        // Handle array access like leadTags[0].tagType
        const [arrayKey, indexPart] = key.split('[');
        const index = parseInt(indexPart?.replace(']', '') || '0');
        return arrayKey ? current?.[arrayKey]?.[index] : current;
      }
      
      // Special handling for leadTags.tagType to search within array
      if (path === 'leadTags.tagType' && key === 'tagType') {
        return current?.some ? current.some((tag: any) => tag.tagType) : current;
      }
      
      return current?.[key];
    }, obj);
  };

  const filteredLeads = getFilteredLeads();

  // Update quick filter counts
  useEffect(() => {
    if (leads.length === 0) return;
    
    const updatedFilters = quickFilters.map(filter => {
      const count = leads.filter(lead => 
        filter.conditions.every(condition => evaluateCondition(lead, condition))
      ).length;
      
      return { ...filter, count };
    });
    
    setQuickFilters(updatedFilters);
  }, [leads]);

  if (error && !loading) {
    return (
      <AppShell headerActions={
        <NeonButton onClick={() => window.location.reload()}>
          Retry
        </NeonButton>
      }>
        <div className="p-6">
          <Alert variant="error" title="Error Loading Leads">
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
            onClick={() => router.push('/leads/rules')}
          >
            Auto Rules
          </NeonButton>
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/leads/analytics')}
          >
            Analytics
          </NeonButton>
          <NeonButton 
            onClick={() => router.push('/leads/new')}
          >
            Add New Lead
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Leads"
            value={stats.total}
            icon="👥"
            variant="default"
            loading={loading}
          />
          <StatCard
            title="Processed"
            value={stats.processed}
            change={{ 
              value: stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0, 
              type: 'positive',
              period: 'completion rate'
            }}
            icon="✅"
            variant="success"
            loading={loading}
          />
          <StatCard
            title="Qualified Leads"
            value={stats.qualified}
            change={{ 
              value: stats.processed > 0 ? Math.round((stats.qualified / stats.processed) * 100) : 0, 
              type: 'increase',
              period: 'qualification rate'
            }}
            icon="⭐"
            variant="neon"
            loading={loading}
          />
          <StatCard
            title="Pending"
            value={stats.unprocessed}
            icon="⏳"
            variant="warning"
            loading={loading}
          />
        </div>

        {/* Smart Search */}
        <GlassCard className="p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Smart Search</h3>
              <div className="flex items-center gap-2">
                {searchResults.length > 0 && (
                  <Badge variant="neon" size="sm">
                    {searchResults.length} results
                  </Badge>
                )}
              </div>
            </div>
            
            <SmartSearch
              data={leads}
              fields={searchFields}
              onResults={(results, query) => {
                setSearchResults(results);
                setSearchTerm(query);
              }}
              placeholder="Search leads by name, email, phone, or credit score..."
              maxResults={100}
              minScore={0.1}
              showSuggestions={true}
            />
            
            {searchTerm && searchResults.length > 0 && (
              <div className="text-sm text-gray-400">
                Found {searchResults.length} leads matching "{searchTerm}"
              </div>
            )}
          </div>
        </GlassCard>

        {/* Quick Filters */}
        <GlassCard className="p-6 mb-6">
          <QuickFilters
            filters={quickFilters}
            activeFilters={activeQuickFilters}
            onFilterClick={(filterId) => {
              setActiveQuickFilters(prev => 
                prev.includes(filterId)
                  ? prev.filter(id => id !== filterId)
                  : [...prev, filterId]
              );
            }}
          />
        </GlassCard>

        {/* Advanced Filters */}
        <AdvancedFilters
          fields={filterFields}
          filters={advancedFilters}
          onChange={setAdvancedFilters}
          onApply={() => {
            // Filters are applied automatically via getFilteredLeads
            showToast({
              title: 'Filters Applied',
              message: `Applied ${advancedFilters.conditions.length} advanced filter conditions`,
              variant: 'success'
            });
          }}
          onReset={() => {
            setAdvancedFilters({ conditions: [], logic: 'AND' });
            setActiveQuickFilters([]);
            setSearchTerm('');
            setSearchResults([]);
            showToast({
              title: 'Filters Reset',
              message: 'All filters have been cleared',
              variant: 'success'
            });
          }}
          onSave={(name) => {
            const newSavedFilter = { name, config: advancedFilters };
            setSavedFilterSets(prev => [...prev, newSavedFilter]);
            showToast({
              title: 'Filter Saved',
              message: `Filter set "${name}" has been saved`,
              variant: 'success'
            });
          }}
          savedFilters={savedFilterSets}
          onLoadSaved={(config) => {
            setAdvancedFilters(config);
            showToast({
              title: 'Filter Loaded',
              message: 'Saved filter set has been loaded',
              variant: 'success'
            });
          }}
          className="mb-6"
        />

        {/* Leads Table */}
        <GlassCard>
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Leads Database ({pagination.total} total)
              </h2>
              <div className="flex gap-2">
                <NeonButton 
                  size="sm"
                  variant="secondary"
                  onClick={() => showToast({ 
                    message: 'Export functionality coming soon',
                    variant: 'info' 
                  })}
                >
                  Export CSV
                </NeonButton>
              </div>
            </div>
          </div>

          <EnhancedLeadTable
            leads={filteredLeads}
            loading={loading}
            onTagLead={handleTagLead}
            onBulkTag={handleBulkTag}
            onExportTagged={handleExportTagged}
          />
        </GlassCard>
      </div>
    </AppShell>
  );
};

export default function LeadsListPage() {
  return (
    <ToastProvider>
      <LeadsPage />
    </ToastProvider>
  );
}