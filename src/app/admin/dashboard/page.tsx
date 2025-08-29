'use client';

// Disable static generation for this admin page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Input } from '@/components/ui/Input';

// Mock admin data - in production this would come from admin APIs
const mockAdminData = {
  systemHealth: {
    status: 'healthy' as const,
    uptime: '99.9%',
    responseTime: '145ms',
    activeUsers: 1247,
    totalRequests: 2845691,
    errorRate: '0.02%'
  },
  clients: [
    {
      id: 'client-001',
      name: 'Acme Financial Services',
      email: 'admin@acmefinancial.com',
      status: 'active' as const,
      plan: 'enterprise',
      totalLeads: 15420,
      monthlyLeads: 1247,
      conversionRate: 14.8,
      lastActive: '2024-08-29T10:30:00Z',
      joinedAt: '2024-01-15T09:00:00Z',
      pixelConnections: 3,
      widgets: 8,
      webhooks: 5,
      monthlyRevenue: 2850,
      totalRevenue: 24680
    },
    {
      id: 'client-002', 
      name: 'TechStart Solutions',
      email: 'contact@techstart.io',
      status: 'active' as const,
      plan: 'professional',
      totalLeads: 8934,
      monthlyLeads: 892,
      conversionRate: 18.2,
      lastActive: '2024-08-29T08:45:00Z',
      joinedAt: '2024-03-20T14:30:00Z',
      pixelConnections: 2,
      widgets: 4,
      webhooks: 3,
      monthlyRevenue: 1490,
      totalRevenue: 8940
    },
    {
      id: 'client-003',
      name: 'Global Mortgage Co',
      email: 'support@globalmortgage.com',
      status: 'warning' as const,
      plan: 'enterprise',
      totalLeads: 23847,
      monthlyLeads: 2103,
      conversionRate: 11.4,
      lastActive: '2024-08-27T16:20:00Z',
      joinedAt: '2023-11-10T11:15:00Z',
      pixelConnections: 4,
      widgets: 12,
      webhooks: 8,
      monthlyRevenue: 4250,
      totalRevenue: 38400
    },
    {
      id: 'client-004',
      name: 'StartupLending Inc',
      email: 'hello@startuplending.com',
      status: 'paused' as const,
      plan: 'starter',
      totalLeads: 2847,
      monthlyLeads: 45,
      conversionRate: 9.7,
      lastActive: '2024-08-15T12:00:00Z',
      joinedAt: '2024-07-01T10:00:00Z',
      pixelConnections: 1,
      widgets: 2,
      webhooks: 1,
      monthlyRevenue: 299,
      totalRevenue: 897
    }
  ],
  systemMetrics: {
    pixelSyncs: {
      total: 45892,
      successful: 44238,
      failed: 1654,
      avgResponseTime: '234ms'
    },
    widgets: {
      total: 26,
      active: 22,
      totalCaptures: 18934,
      conversionRate: '13.7%'
    },
    webhooks: {
      total: 17,
      active: 15,
      totalCalls: 128945,
      successRate: '99.1%'
    },
    revenue: {
      monthly: 8889,
      quarterly: 25467,
      annual: 98432,
      avgPerClient: 2947
    }
  },
  recentActivity: [
    {
      id: '1',
      type: 'client_signup',
      client: 'StartupLending Inc',
      description: 'New client registered with Starter plan',
      timestamp: '2024-08-29T09:15:00Z',
      severity: 'info' as const
    },
    {
      id: '2',
      type: 'system_alert',
      client: 'Global Mortgage Co',
      description: 'High error rate detected on webhook endpoint',
      timestamp: '2024-08-29T08:30:00Z',
      severity: 'warning' as const
    },
    {
      id: '3',
      type: 'pixel_sync',
      client: 'Acme Financial Services',
      description: 'Batch sync completed: 234 leads synced to Meta',
      timestamp: '2024-08-29T07:45:00Z',
      severity: 'success' as const
    },
    {
      id: '4',
      type: 'payment_received',
      client: 'TechStart Solutions',
      description: 'Monthly subscription payment processed',
      timestamp: '2024-08-29T07:00:00Z',
      severity: 'success' as const
    },
    {
      id: '5',
      type: 'system_maintenance',
      client: 'System',
      description: 'Database optimization completed',
      timestamp: '2024-08-29T06:00:00Z',
      severity: 'info' as const
    }
  ]
};

type Client = typeof mockAdminData.clients[0];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warning' | 'paused'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'starter' | 'professional' | 'enterprise'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);

  const { systemHealth, clients, systemMetrics, recentActivity } = mockAdminData;

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesPlan = planFilter === 'all' || client.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'warning': return 'warning';
      case 'paused': return 'default';
      default: return 'default';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'neon';
      case 'professional': return 'success';
      case 'starter': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between space-component">
          <div className="space-element">
            <h1 className="text-heading text-white mb-2">⚙️ Admin Dashboard</h1>
            <p className="text-body-large text-gray-400 max-w-2xl">
              Comprehensive system administration, client management, and platform monitoring
            </p>
          </div>
          <div className="flex gap-3">
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/admin/monitoring')}
            >
              📊 System Monitoring
            </NeonButton>
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/admin/system-health')}
            >
              🔍 System Health
            </NeonButton>
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/admin/reports')}
            >
              📈 Generate Report
            </NeonButton>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <StatCard
            title="System Status"
            value={systemHealth.status === 'healthy' ? 'Healthy' : 'Issues'}
            description={`${systemHealth.uptime} uptime`}
            icon={systemHealth.status === 'healthy' ? '🟢' : '🔴'}
            variant={systemHealth.status === 'healthy' ? 'success' : 'warning'}
            trend={`${systemHealth.responseTime} avg response`}
          />
          <StatCard
            title="Active Users"
            value={systemHealth.activeUsers.toLocaleString()}
            description="Currently online"
            icon="👥"
            variant="neon"
            trend="+8% this hour"
          />
          <StatCard
            title="Total Requests"
            value={`${(systemHealth.totalRequests / 1000000).toFixed(1)}M`}
            description="All time"
            icon="📡"
            variant="default"
            trend={systemHealth.errorRate + ' error rate'}
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(systemMetrics.revenue.monthly)}
            description="Current month"
            icon="💰"
            variant="success"
            trend="+12% vs last month"
          />
          <StatCard
            title="Total Clients"
            value={clients.length.toString()}
            description={`${clients.filter(c => c.status === 'active').length} active`}
            icon="🏢"
            variant="default"
            trend="+2 this week"
          />
          <StatCard
            title="Pixel Syncs"
            value={`${Math.round((systemMetrics.pixelSyncs.successful / systemMetrics.pixelSyncs.total) * 100)}%`}
            description="Success rate"
            icon="🔄"
            variant="success"
            trend={`${systemMetrics.pixelSyncs.total.toLocaleString()} total`}
          />
        </div>

        {/* Client Management */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Client Management</h2>
            <div className="flex gap-3">
              <NeonButton 
                variant="secondary" 
                size="sm"
                onClick={() => router.push('/admin/clients/export')}
              >
                📥 Export Data
              </NeonButton>
              <NeonButton 
                size="sm"
                onClick={() => router.push('/admin/clients/new')}
              >
                + Add Client
              </NeonButton>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="warning">Warning</option>
                <option value="paused">Paused</option>
              </select>
              
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as any)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Client Table */}
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div 
                key={client.id}
                className="card-interactive p-6 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                onClick={() => {
                  setSelectedClient(client);
                  setShowClientModal(true);
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Client Info */}
                  <div className="lg:col-span-1">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-neon-green font-bold text-lg">
                          {client.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">{client.name}</h3>
                        <p className="text-sm text-gray-400 truncate">{client.email}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={getStatusColor(client.status) as any} size="sm">
                            {client.status}
                          </Badge>
                          <Badge variant={getPlanColor(client.plan) as any} size="sm">
                            {client.plan}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-white">{client.totalLeads.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Total Leads</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-neon-green">{client.conversionRate}%</div>
                        <div className="text-xs text-gray-400">Conversion</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{formatCurrency(client.monthlyRevenue)}</div>
                        <div className="text-xs text-gray-400">Monthly</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{client.pixelConnections + client.widgets + client.webhooks}</div>
                        <div className="text-xs text-gray-400">Total Tools</div>
                      </div>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="lg:col-span-1 text-right">
                    <div className="text-sm text-gray-400">Last Active</div>
                    <div className="text-white font-medium">
                      {new Date(client.lastActive).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(client.lastActive).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No clients found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </GlassCard>

        {/* System Metrics & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Performance */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">System Performance</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-neon-green">
                    {Math.round((systemMetrics.pixelSyncs.successful / systemMetrics.pixelSyncs.total) * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">Pixel Sync Success</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {systemMetrics.pixelSyncs.total.toLocaleString()} total syncs
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-white">
                    {systemMetrics.widgets.conversionRate}
                  </div>
                  <div className="text-sm text-gray-400">Widget Conversion</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {systemMetrics.widgets.totalCaptures.toLocaleString()} captures
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-neon-green">
                  {systemMetrics.webhooks.successRate}
                </div>
                <div className="text-sm text-gray-400">Webhook Success Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  {systemMetrics.webhooks.totalCalls.toLocaleString()} total calls
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.severity === 'success' ? 'bg-neon-green' :
                    activity.severity === 'warning' ? 'bg-yellow-400' :
                    activity.severity === 'error' ? 'bg-red-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{activity.client}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Client Detail Modal */}
        {showClientModal && selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Client Details - {selectedClient.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowClientModal(false);
                      setSelectedClient(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="font-medium text-white mb-2">Account Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plan:</span>
                        <Badge variant={getPlanColor(selectedClient.plan) as any} size="sm">
                          {selectedClient.plan}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Joined:</span>
                        <span className="text-white">{new Date(selectedClient.joinedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <Badge variant={getStatusColor(selectedClient.status) as any} size="sm">
                          {selectedClient.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="font-medium text-white mb-2">Usage Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Leads:</span>
                        <span className="text-white">{selectedClient.totalLeads.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">This Month:</span>
                        <span className="text-white">{selectedClient.monthlyLeads.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Conversion:</span>
                        <span className="text-neon-green">{selectedClient.conversionRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="font-medium text-white mb-2">Revenue</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly:</span>
                        <span className="text-white">{formatCurrency(selectedClient.monthlyRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total:</span>
                        <span className="text-neon-green">{formatCurrency(selectedClient.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="font-medium text-white mb-2">Tools</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pixels:</span>
                        <span className="text-white">{selectedClient.pixelConnections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Widgets:</span>
                        <span className="text-white">{selectedClient.widgets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Webhooks:</span>
                        <span className="text-white">{selectedClient.webhooks}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <NeonButton
                    variant="secondary"
                    onClick={() => router.push(`/admin/clients/${selectedClient.id}/edit`)}
                    className="flex-1"
                  >
                    ✏️ Edit Client
                  </NeonButton>
                  <NeonButton
                    variant="secondary"
                    onClick={() => router.push(`/admin/clients/${selectedClient.id}/logs`)}
                    className="flex-1"
                  >
                    📊 View Logs
                  </NeonButton>
                  <NeonButton
                    onClick={() => alert('Feature coming soon!')}
                    className="flex-1"
                  >
                    🔧 Manage Tools
                  </NeonButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}