'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { TagIndicators } from '@/components/ui/TagIndicators';
import { mockLeads, getLeadStats, type Lead } from '@/lib/mockData';

export default function LeadsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [syncFilter, setSyncFilter] = useState<'all' | 'synced' | 'unsynced'>('all');
  const stats = getLeadStats();
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  let filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    const matchesTag = tagFilter === 'all' || lead.tags.some(tag => 
      tag.toLowerCase().includes(tagFilter.toLowerCase())
    );
    
    const matchesSync = syncFilter === 'all' || 
      (syncFilter === 'synced' && lead.pixelSyncStatus?.synced) ||
      (syncFilter === 'unsynced' && !lead.pixelSyncStatus?.synced);
    
    return matchesSearch && matchesStatus && matchesTag && matchesSync;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified': return 'success';
      case 'processing': return 'warning';
      case 'completed': return 'neon';
      case 'new': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'qualified': return '✅';
      case 'processing': return '⏳';
      case 'completed': return '🎉';
      case 'new': return '📋';
      default: return '📋';
    }
  };

  const handleTagAction = async (leadId: string, action: 'tag' | 'sync') => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (action === 'tag') {
      setSelectedLead(lead);
      setIsTagModalOpen(true);
    } else if (action === 'sync') {
      // Simulate pixel sync
      const updatedLeads = leads.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            pixelSyncStatus: {
              synced: true,
              lastSyncAt: new Date().toISOString(),
              syncedPlatforms: ['META', 'GOOGLE_ADS'] as ('META' | 'GOOGLE_ADS' | 'TIKTOK')[],
              failedPlatforms: []
            }
          };
        }
        return l;
      });
      setLeads(updatedLeads);
      
      // Show success message (in real app, this would be a toast)
      alert(`Lead ${lead.firstName} ${lead.lastName} successfully synced to pixels!`);
    }
  };

  const quickTagLead = (leadId: string, newTags: string[]) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const existingTags = lead.tags.filter(tag => !newTags.includes(tag));
        return {
          ...lead,
          tags: [...existingTags, ...newTags]
        };
      }
      return lead;
    });
    setLeads(updatedLeads);
    setIsTagModalOpen(false);
    setSelectedLead(null);
  };

  // Get unique tags for filter
  const allTags = Array.from(new Set(leads.flatMap(lead => lead.tags)));
  const syncStats = {
    synced: leads.filter(l => l.pixelSyncStatus?.synced).length,
    unsynced: leads.filter(l => !l.pixelSyncStatus?.synced).length
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between space-component">
          <div className="space-element">
            <h1 className="text-heading text-white mb-2">👥 Lead Management</h1>
            <p className="text-body-large text-gray-400 max-w-2xl">Manage and track your leads through the qualification process with advanced filtering and analytics</p>
          </div>
          <div className="flex gap-3">
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/leads/analytics')}
            >
              View Analytics
            </NeonButton>
            <NeonButton onClick={() => router.push('/leads/new')}>
              Add New Lead
            </NeonButton>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Leads"
            value={stats.total}
            description="All time"
            icon="👥"
            variant="default"
            trend="+12% this week"
          />
          <StatCard
            title="Qualified"
            value={stats.qualified}
            description={`${stats.conversionRate}% rate`}
            icon="✅"
            variant="success"
            trend="+8% this month"
          />
          <StatCard
            title="Pixel Synced"
            value={syncStats.synced}
            description={`${Math.round((syncStats.synced / stats.total) * 100)}% of leads`}
            icon="🔄"
            variant="neon"
            trend={`${syncStats.unsynced} pending`}
          />
          <StatCard
            title="Processing"
            value={stats.processing}
            description="In review"
            icon="⏳"
            variant="warning"
          />
          <StatCard
            title="New Today"
            value={stats.new}
            description="Needs attention"
            icon="📋"
            variant="default"
          />
          <StatCard
            title="Avg Credit Score"
            value={stats.avgCreditScore}
            description="Above average"
            icon="📊"
            variant="success"
            trend="+15 points"
          />
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search leads by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-gray-400 font-medium self-center mr-2">Status:</span>
                {['all', 'new', 'qualified', 'processing', 'completed', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as any)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-neon-green text-black'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {status !== 'all' && (
                      <span className="ml-1 text-xs opacity-75">
                        ({status === 'new' ? stats.new : 
                          status === 'qualified' ? stats.qualified :
                          status === 'processing' ? stats.processing :
                          status === 'completed' ? stats.completed :
                          status === 'rejected' ? stats.rejected : stats.total})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tag Filter */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-gray-400 font-medium self-center mr-2">Tags:</span>
                <button
                  onClick={() => setTagFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    tagFilter === 'all'
                      ? 'bg-neon-green text-black'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  All Tags
                </button>
                {['qualified', 'whitelist', 'high-value', 'premium'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      tagFilter === tag
                        ? 'bg-neon-green text-black'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {tag}
                    <span className="ml-1 text-xs opacity-75">
                      ({leads.filter(l => l.tags.includes(tag)).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Sync Filter */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-gray-400 font-medium self-center mr-2">Pixel Sync:</span>
                {[
                  { key: 'all', label: 'All Leads', count: leads.length },
                  { key: 'synced', label: 'Synced', count: syncStats.synced },
                  { key: 'unsynced', label: 'Not Synced', count: syncStats.unsynced }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSyncFilter(option.key as any)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      syncFilter === option.key
                        ? 'bg-neon-green text-black'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {option.label}
                    <span className="ml-1 text-xs opacity-75">
                      ({option.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <NeonButton variant="secondary" size="sm">
              Export CSV
            </NeonButton>
          </div>
        </GlassCard>

        {/* Leads Table */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Leads</h2>
            <Badge variant="neon">
              {filteredLeads.length} leads
            </Badge>
          </div>

          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div 
                key={lead.id}
                className="card-interactive p-6 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                onClick={() => router.push(`/leads/${lead.id}`)}
              >
                <div className="space-y-4">
                  {/* Lead Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center">
                        <span className="text-neon-green font-bold">
                          {lead.firstName[0]}{lead.lastName[0]}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-white">
                          {lead.firstName} {lead.lastName}
                        </h3>
                        <p className="text-gray-400 text-sm">{lead.email}</p>
                        {lead.phone && (
                          <p className="text-gray-500 text-sm">{lead.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {lead.creditScore && (
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Credit Score</p>
                          <p className="font-bold text-white">{lead.creditScore}</p>
                        </div>
                      )}
                      
                      <Badge variant={getStatusColor(lead.status) as any}>
                        {getStatusIcon(lead.status)} {lead.status}
                      </Badge>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Added</p>
                        <p className="text-xs text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tags and Pixel Sync Status */}
                  <div className="border-t border-white/10 pt-4">
                    <TagIndicators 
                      lead={lead} 
                      onTagAction={handleTagAction}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No leads found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first lead'}
              </p>
              <NeonButton onClick={() => router.push('/leads/new')}>
                Add New Lead
              </NeonButton>
            </div>
          )}
        </GlassCard>

        {/* Quick Tag Modal */}
        {isTagModalOpen && selectedLead && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Add Tags to {selectedLead.firstName} {selectedLead.lastName}
              </h3>
              
              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-400">Current tags:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLead.tags.map((tag, index) => (
                    <Badge key={`current-${tag}-${index}`} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {selectedLead.tags.length === 0 && (
                    <span className="text-sm text-gray-500">No tags yet</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-400">Add quick tags:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['qualified', 'whitelist', 'high-value', 'premium', 'vip', 'blacklist'].map((tag) => (
                    <NeonButton
                      key={tag}
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (!selectedLead.tags.includes(tag)) {
                          quickTagLead(selectedLead.id, [tag]);
                        }
                      }}
                      disabled={selectedLead.tags.includes(tag)}
                      className="text-xs"
                    >
                      {selectedLead.tags.includes(tag) ? '✓ ' : ''}{tag}
                    </NeonButton>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <NeonButton
                  variant="secondary"
                  onClick={() => {
                    setIsTagModalOpen(false);
                    setSelectedLead(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </NeonButton>
                <NeonButton
                  onClick={() => router.push(`/leads/${selectedLead.id}`)}
                  className="flex-1"
                >
                  View Details
                </NeonButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}