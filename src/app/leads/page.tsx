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
import { mockLeads, getLeadStats, type Lead } from '@/lib/mockData';

export default function LeadsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [leads] = useState<Lead[]>(mockLeads);
  const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'all'>('all');
  const stats = getLeadStats();

  let filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
            variant="neon"
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
            
            <div className="flex gap-2 flex-wrap">
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

                  <div className="flex items-center gap-4">
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
      </div>
    </AppLayout>
  );
}