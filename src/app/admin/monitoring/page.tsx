'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

// Mock system monitoring data
const mockSystemData = {
  overview: {
    totalSyncJobs: 24891,
    activeSyncJobs: 127,
    successRate: 98.7,
    avgSyncTime: 2.3,
    totalPixelsConnected: 89,
    dataProcessed: '2.4TB'
  },
  pixelPlatforms: [
    {
      platform: 'Meta',
      icon: '📘',
      totalPixels: 34,
      activeSync: 28,
      successRate: 99.1,
      avgLatency: 180,
      dailySyncs: 8924,
      errorCount: 12,
      status: 'healthy' as const
    },
    {
      platform: 'Google Ads',
      icon: '🔍',
      totalPixels: 31,
      activeSync: 29,
      successRate: 98.3,
      avgLatency: 210,
      dailySyncs: 7651,
      errorCount: 23,
      status: 'healthy' as const
    },
    {
      platform: 'TikTok',
      icon: '🎵',
      totalPixels: 24,
      activeSync: 21,
      successRate: 96.8,
      avgLatency: 340,
      dailySyncs: 4123,
      errorCount: 47,
      status: 'warning' as const
    }
  ],
  recentJobs: [
    {
      id: 'sync-89234',
      clientId: 'client-001',
      clientName: 'TechFlow Solutions',
      platform: 'Meta',
      type: 'Lead Sync',
      status: 'completed' as const,
      duration: 1.8,
      leadsProcessed: 47,
      timestamp: '2024-08-29T10:45:32Z',
      pixelId: 'px-meta-334'
    },
    {
      id: 'sync-89235',
      clientId: 'client-003',
      clientName: 'GrowthHacker Inc',
      platform: 'Google Ads',
      type: 'Batch Sync',
      status: 'running' as const,
      duration: 3.2,
      leadsProcessed: 128,
      timestamp: '2024-08-29T10:44:15Z',
      pixelId: 'px-google-128'
    },
    {
      id: 'sync-89236',
      clientId: 'client-002',
      clientName: 'DataDriven Corp',
      platform: 'TikTok',
      type: 'Auto-Tag Sync',
      status: 'failed' as const,
      duration: 0.5,
      leadsProcessed: 0,
      timestamp: '2024-08-29T10:42:18Z',
      pixelId: 'px-tiktok-089',
      error: 'Authentication failed - token expired'
    },
    {
      id: 'sync-89237',
      clientId: 'client-004',
      clientName: 'ScaleUp Ventures',
      platform: 'Meta',
      type: 'Real-time Sync',
      status: 'completed' as const,
      duration: 0.9,
      leadsProcessed: 12,
      timestamp: '2024-08-29T10:41:55Z',
      pixelId: 'px-meta-445'
    },
    {
      id: 'sync-89238',
      clientId: 'client-001',
      clientName: 'TechFlow Solutions',
      platform: 'Google Ads',
      type: 'Customer Match',
      status: 'completed' as const,
      duration: 4.1,
      leadsProcessed: 234,
      timestamp: '2024-08-29T10:40:32Z',
      pixelId: 'px-google-267'
    }
  ],
  systemHealth: [
    {
      metric: 'API Response Time',
      value: '145ms',
      status: 'healthy' as const,
      trend: 'down',
      change: '-12ms'
    },
    {
      metric: 'Queue Processing',
      value: '97.8%',
      status: 'healthy' as const,
      trend: 'up',
      change: '+2.1%'
    },
    {
      metric: 'Memory Usage',
      value: '68%',
      status: 'healthy' as const,
      trend: 'stable',
      change: '+1%'
    },
    {
      metric: 'Database Connections',
      value: '124/200',
      status: 'healthy' as const,
      trend: 'up',
      change: '+8'
    },
    {
      metric: 'Error Rate',
      value: '0.03%',
      status: 'healthy' as const,
      trend: 'down',
      change: '-0.01%'
    },
    {
      metric: 'Pixel Connectivity',
      value: '98.9%',
      status: 'healthy' as const,
      trend: 'stable',
      change: '0%'
    }
  ],
  alerts: [
    {
      id: 'alert-001',
      type: 'warning' as const,
      message: 'TikTok API latency increased by 40% in the last hour',
      timestamp: '2024-08-29T10:30:00Z',
      severity: 'medium' as const
    },
    {
      id: 'alert-002',
      type: 'error' as const,
      message: 'Client DataDriven Corp: 3 consecutive sync failures detected',
      timestamp: '2024-08-29T10:15:00Z',
      severity: 'high' as const
    },
    {
      id: 'alert-003',
      type: 'info' as const,
      message: 'Scheduled maintenance completed successfully',
      timestamp: '2024-08-29T09:00:00Z',
      severity: 'low' as const
    }
  ]
};

type Job = typeof mockSystemData.recentJobs[0];

export default function SystemMonitoringPage() {
  const router = useRouter();
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'warning';
      case 'failed': return 'error';
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '⏳';
      case 'failed': return '❌';
      case 'healthy': return '🟢';
      case 'warning': return '⚠️';
      default: return '⚪';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➖';
      default: return '➖';
    }
  };

  const filteredJobs = selectedPlatform === 'all' 
    ? mockSystemData.recentJobs 
    : mockSystemData.recentJobs.filter(job => job.platform.toLowerCase() === selectedPlatform.toLowerCase());

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between space-component">
          <div className="space-element">
            <h1 className="text-heading text-white mb-2">📊 System Monitoring</h1>
            <p className="text-body-large text-gray-400 max-w-2xl">
              Real-time monitoring of pixel sync operations, system performance, and platform health
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green focus:ring-2"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-400">Auto-refresh</label>
            </div>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-gray-800 border border-white/20 text-white rounded px-3 py-1 text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/admin/dashboard')}
            >
              ← Back to Admin
            </NeonButton>
          </div>
        </div>
        
        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <StatCard
            title="Total Sync Jobs"
            value={mockSystemData.overview.totalSyncJobs.toLocaleString()}
            description="All time"
            icon="🔄"
            variant="default"
            trend="+1.2K today"
          />
          <StatCard
            title="Active Jobs"
            value={mockSystemData.overview.activeSyncJobs}
            description="Currently running"
            icon="⚡"
            variant="neon"
            trend="Real-time"
          />
          <StatCard
            title="Success Rate"
            value={`${mockSystemData.overview.successRate}%`}
            description="Last 24 hours"
            icon="✅"
            variant="success"
            trend="+0.3%"
          />
          <StatCard
            title="Avg Sync Time"
            value={`${mockSystemData.overview.avgSyncTime}s`}
            description="Per job"
            icon="⏱️"
            variant="default"
            trend="-0.1s"
          />
          <StatCard
            title="Pixels Connected"
            value={mockSystemData.overview.totalPixelsConnected}
            description="Across all platforms"
            icon="🔌"
            variant="success"
            trend="+3 this week"
          />
          <StatCard
            title="Data Processed"
            value={mockSystemData.overview.dataProcessed}
            description="This month"
            icon="📊"
            variant="neon"
            trend="+340GB today"
          />
        </div>

        {/* Platform Health Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mockSystemData.pixelPlatforms.map((platform) => (
            <GlassCard key={platform.platform} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <h3 className="font-semibold text-white">{platform.platform}</h3>
                  </div>
                  <Badge variant={getStatusColor(platform.status) as any} size="sm">
                    {getStatusIcon(platform.status)} {platform.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Total Pixels</div>
                    <div className="text-white font-medium">{platform.totalPixels}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Active Sync</div>
                    <div className="text-neon-green font-medium">{platform.activeSync}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Success Rate</div>
                    <div className="text-white font-medium">{platform.successRate}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Avg Latency</div>
                    <div className="text-white font-medium">{platform.avgLatency}ms</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Today: {platform.dailySyncs.toLocaleString()} syncs</span>
                    <span className="text-red-400">{platform.errorCount} errors</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* System Health Metrics */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">System Health Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSystemData.systemHealth.map((metric) => (
              <div key={metric.metric} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">{metric.metric}</div>
                  <Badge variant={getStatusColor(metric.status) as any} size="sm">
                    {getStatusIcon(metric.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-white">{metric.value}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>{getTrendIcon(metric.trend)}</span>
                    <span>{metric.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Alerts Section */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">System Alerts</h3>
            <NeonButton size="sm" variant="secondary">
              View All Alerts
            </NeonButton>
          </div>
          <div className="space-y-3">
            {mockSystemData.alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <Badge variant={getSeverityColor(alert.severity) as any} size="sm">
                  {alert.type === 'error' ? '❌' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{alert.message}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-500 capitalize">{alert.severity}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Sync Jobs */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Sync Jobs</h3>
            <div className="flex gap-2">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-gray-800 border border-white/20 text-white rounded px-3 py-1 text-sm"
              >
                <option value="all">All Platforms</option>
                <option value="meta">Meta</option>
                <option value="google ads">Google Ads</option>
                <option value="tiktok">TikTok</option>
              </select>
              <NeonButton size="sm" variant="secondary">
                Export Logs
              </NeonButton>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Job ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Platform</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Leads</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-mono">{job.id}</td>
                    <td className="py-3 px-4 text-white">{job.clientName}</td>
                    <td className="py-3 px-4 text-white">{job.platform}</td>
                    <td className="py-3 px-4 text-gray-300">{job.type}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusColor(job.status) as any} size="sm">
                        {getStatusIcon(job.status)} {job.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{job.duration}s</td>
                    <td className="py-3 px-4 text-neon-green">{job.leadsProcessed}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(job.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <NeonButton
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedJob(job)}
                      >
                        Details
                      </NeonButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Job Details Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Sync Job Details - {selectedJob.id}
                  </h3>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-400">Client</div>
                        <div className="text-white font-medium">{selectedJob.clientName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Platform</div>
                        <div className="text-white font-medium">{selectedJob.platform}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Sync Type</div>
                        <div className="text-white font-medium">{selectedJob.type}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-400">Status</div>
                        <Badge variant={getStatusColor(selectedJob.status) as any} size="sm">
                          {getStatusIcon(selectedJob.status)} {selectedJob.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Duration</div>
                        <div className="text-white font-medium">{selectedJob.duration}s</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Leads Processed</div>
                        <div className="text-neon-green font-medium">{selectedJob.leadsProcessed}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Pixel ID</div>
                    <div className="text-white font-mono bg-black/30 rounded px-3 py-2">{selectedJob.pixelId}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Timestamp</div>
                    <div className="text-white">{new Date(selectedJob.timestamp).toLocaleString()}</div>
                  </div>

                  {selectedJob.error && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Error Message</div>
                      <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                        {selectedJob.error}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="text-sm text-blue-200 font-medium mb-2">Job Performance</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Processing Rate</div>
                        <div className="text-white">{(selectedJob.leadsProcessed / selectedJob.duration).toFixed(1)} leads/sec</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Queue Position</div>
                        <div className="text-white">Completed</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <NeonButton
                    variant="secondary"
                    onClick={() => setSelectedJob(null)}
                    className="flex-1"
                  >
                    Close
                  </NeonButton>
                  {selectedJob.status === 'failed' && (
                    <NeonButton className="flex-1">
                      🔄 Retry Job
                    </NeonButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}