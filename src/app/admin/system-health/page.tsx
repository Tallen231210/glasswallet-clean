'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

// Mock error and logging data
const mockSystemHealth = {
  errorStats: {
    totalErrors: 1247,
    criticalErrors: 12,
    warningErrors: 156,
    infoErrors: 1079,
    errorRate: 0.023,
    resolvedErrors: 1198,
    openErrors: 49
  },
  systemMetrics: {
    cpuUsage: 68.5,
    memoryUsage: 72.1,
    diskUsage: 45.8,
    networkLatency: 145,
    databaseConnections: 124,
    activeThreads: 87,
    queueSize: 23,
    cacheHitRate: 94.7
  },
  recentErrors: [
    {
      id: 'err-001',
      timestamp: '2024-08-29T10:42:18Z',
      level: 'critical' as const,
      service: 'Pixel Sync Service',
      message: 'TikTok API authentication failed for client DataDriven Corp',
      details: 'Token expired - automatic refresh failed after 3 attempts',
      clientId: 'client-002',
      clientName: 'DataDriven Corp',
      userId: 'user-456',
      stackTrace: 'PixelSyncError: Authentication failed at line 142 in sync.js',
      resolution: 'pending' as const,
      assignedTo: 'DevOps Team',
      impact: 'Client unable to sync leads to TikTok pixel'
    },
    {
      id: 'err-002',
      timestamp: '2024-08-29T10:35:22Z',
      level: 'warning' as const,
      service: 'Lead Processing Service',
      message: 'High processing latency detected for bulk lead import',
      details: 'Processing 5000+ leads taking >30s, approaching timeout threshold',
      clientId: 'client-003',
      clientName: 'GrowthHacker Inc',
      userId: 'system',
      stackTrace: 'Performance warning at batch processor line 89',
      resolution: 'monitoring' as const,
      assignedTo: 'Performance Team',
      impact: 'Potential timeout for large bulk operations'
    },
    {
      id: 'err-003',
      timestamp: '2024-08-29T10:30:15Z',
      level: 'critical' as const,
      service: 'Database Service',
      message: 'Connection pool exhausted during peak traffic',
      details: 'All 200 database connections in use, new requests queuing',
      clientId: null,
      clientName: null,
      userId: null,
      stackTrace: 'ConnectionError: Pool exhausted at connection.js:45',
      resolution: 'resolved' as const,
      assignedTo: 'Database Team',
      impact: 'System-wide performance degradation',
      resolvedAt: '2024-08-29T10:33:45Z',
      resolutionNotes: 'Increased connection pool size to 300, added connection monitoring'
    },
    {
      id: 'err-004',
      timestamp: '2024-08-29T10:15:33Z',
      level: 'warning' as const,
      service: 'Widget Service',
      message: 'Widget load time exceeded performance threshold',
      details: 'Homepage widget for TechFlow Solutions loading in 4.2s (threshold: 3s)',
      clientId: 'client-001',
      clientName: 'TechFlow Solutions',
      userId: 'user-123',
      stackTrace: 'PerformanceWarning: Slow widget load at widget.js:156',
      resolution: 'resolved' as const,
      assignedTo: 'Frontend Team',
      impact: 'Poor user experience on client widget',
      resolvedAt: '2024-08-29T10:25:12Z',
      resolutionNotes: 'Optimized widget JavaScript, reduced bundle size by 30%'
    },
    {
      id: 'err-005',
      timestamp: '2024-08-29T09:58:47Z',
      level: 'info' as const,
      service: 'Billing Service',
      message: 'Payment retry successful after initial failure',
      details: 'Credit card payment for $2,850 succeeded on second attempt',
      clientId: 'client-001',
      clientName: 'TechFlow Solutions',
      userId: 'billing-system',
      stackTrace: 'Info: Payment retry at billing.js:234',
      resolution: 'resolved' as const,
      assignedTo: 'Billing Team',
      impact: 'No impact - payment processed successfully'
    }
  ],
  logAnalytics: {
    dailyVolume: 2847691,
    errorVolume: 1247,
    warningVolume: 8934,
    infoVolume: 2837510,
    topServices: [
      { service: 'Lead Processing', logCount: 892456, errorRate: 0.012 },
      { service: 'Pixel Sync', logCount: 634821, errorRate: 0.034 },
      { service: 'Widget Service', logCount: 445789, errorRate: 0.008 },
      { service: 'API Gateway', logCount: 398234, errorRate: 0.015 },
      { service: 'Database', logCount: 287456, errorRate: 0.002 }
    ],
    alertRules: [
      {
        id: 'alert-001',
        name: 'Critical Error Threshold',
        condition: 'error_level = critical AND count > 5 in 5 minutes',
        status: 'active' as const,
        triggered: 2,
        lastTriggered: '2024-08-29T10:42:18Z'
      },
      {
        id: 'alert-002',
        name: 'High Error Rate',
        condition: 'error_rate > 0.05 for any service in 10 minutes',
        status: 'active' as const,
        triggered: 0,
        lastTriggered: null
      },
      {
        id: 'alert-003',
        name: 'Performance Degradation',
        condition: 'response_time > 5s for > 50% requests in 5 minutes',
        status: 'paused' as const,
        triggered: 1,
        lastTriggered: '2024-08-29T08:23:15Z'
      }
    ]
  },
  performance: {
    uptimePercentage: 99.97,
    meanResponseTime: 145,
    p95ResponseTime: 890,
    p99ResponseTime: 2340,
    throughput: 15670,
    errorBudget: 97.2,
    slaStatus: 'healthy' as const
  }
};

export default function SystemHealthPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const levels = ['all', 'critical', 'warning', 'info'];
  const services = ['all', 'Pixel Sync Service', 'Lead Processing Service', 'Widget Service', 'Database Service', 'Billing Service'];

  const filteredErrors = mockSystemHealth.recentErrors.filter(error => {
    const matchesLevel = selectedLevel === 'all' || error.level === selectedLevel;
    const matchesService = selectedService === 'all' || error.service === selectedService;
    return matchesLevel && matchesService;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'pending': return 'error';
      case 'monitoring': return 'warning';
      case 'active': return 'success';
      case 'paused': return 'default';
      case 'healthy': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return '✅';
      case 'pending': return '🔄';
      case 'monitoring': return '👁️';
      case 'active': return '🟢';
      case 'paused': return '⏸️';
      case 'healthy': return '💚';
      default: return '📄';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📄';
    }
  };

  const getPerformanceColor = (value: number, threshold: number, reverse: boolean = false) => {
    if (reverse) {
      return value <= threshold ? 'text-green-400' : value <= threshold * 1.5 ? 'text-yellow-400' : 'text-red-400';
    } else {
      return value >= threshold ? 'text-green-400' : value >= threshold * 0.8 ? 'text-yellow-400' : 'text-red-400';
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between space-component">
          <div className="space-element">
            <h1 className="text-heading text-white mb-2">🔍 System Health & Error Monitoring</h1>
            <p className="text-body-large text-gray-400 max-w-2xl">
              Comprehensive error tracking, system performance monitoring, and logging analytics
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-gray-800 border border-white/20 text-white rounded px-3 py-2 text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/admin/monitoring')}
            >
              📊 System Monitoring
            </NeonButton>
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/admin/dashboard')}
            >
              ← Back to Admin
            </NeonButton>
          </div>
        </div>
        
        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="System Uptime"
            value={`${mockSystemHealth.performance.uptimePercentage}%`}
            description="Last 30 days"
            icon="🟢"
            variant="success"
            trend="Target: 99.9%"
          />
          <StatCard
            title="Error Rate"
            value={`${mockSystemHealth.errorStats.errorRate}%`}
            description="Current period"
            icon="🚨"
            variant={mockSystemHealth.errorStats.errorRate < 0.05 ? "success" : "error"}
            trend="Target: <0.05%"
          />
          <StatCard
            title="Response Time"
            value={`${mockSystemHealth.performance.meanResponseTime}ms`}
            description="Average (P50)"
            icon="⚡"
            variant="success"
            trend="P99: 2.34s"
          />
          <StatCard
            title="Open Issues"
            value={mockSystemHealth.errorStats.openErrors}
            description={`${mockSystemHealth.errorStats.criticalErrors} critical`}
            icon="🔧"
            variant={mockSystemHealth.errorStats.criticalErrors > 0 ? "error" : "success"}
            trend={`${mockSystemHealth.errorStats.resolvedErrors} resolved`}
          />
        </div>

        {/* System Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">CPU Usage</span>
                  <span className={`font-medium ${getPerformanceColor(mockSystemHealth.systemMetrics.cpuUsage, 80, true)}`}>
                    {mockSystemHealth.systemMetrics.cpuUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${mockSystemHealth.systemMetrics.cpuUsage > 80 ? 'bg-red-500' : mockSystemHealth.systemMetrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${mockSystemHealth.systemMetrics.cpuUsage}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Memory Usage</span>
                  <span className={`font-medium ${getPerformanceColor(mockSystemHealth.systemMetrics.memoryUsage, 80, true)}`}>
                    {mockSystemHealth.systemMetrics.memoryUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${mockSystemHealth.systemMetrics.memoryUsage > 80 ? 'bg-red-500' : mockSystemHealth.systemMetrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${mockSystemHealth.systemMetrics.memoryUsage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Disk Usage</span>
                  <span className={`font-medium ${getPerformanceColor(mockSystemHealth.systemMetrics.diskUsage, 80, true)}`}>
                    {mockSystemHealth.systemMetrics.diskUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${mockSystemHealth.systemMetrics.diskUsage > 80 ? 'bg-red-500' : mockSystemHealth.systemMetrics.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${mockSystemHealth.systemMetrics.diskUsage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-sm text-gray-400">Network Latency</div>
                  <div className="text-lg font-semibold text-white">
                    {mockSystemHealth.systemMetrics.networkLatency}ms
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-sm text-gray-400">DB Connections</div>
                  <div className="text-lg font-semibold text-white">
                    {mockSystemHealth.systemMetrics.databaseConnections}/300
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-sm text-gray-400">Cache Hit Rate</div>
                  <div className="text-lg font-semibold text-green-400">
                    {mockSystemHealth.systemMetrics.cacheHitRate}%
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-sm text-gray-400">Queue Size</div>
                  <div className="text-lg font-semibold text-white">
                    {mockSystemHealth.systemMetrics.queueSize}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Error Statistics</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 mb-1">
                    {mockSystemHealth.errorStats.criticalErrors}
                  </div>
                  <div className="text-sm text-gray-400">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {mockSystemHealth.errorStats.warningErrors}
                  </div>
                  <div className="text-sm text-gray-400">Warning</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {mockSystemHealth.errorStats.infoErrors}
                  </div>
                  <div className="text-sm text-gray-400">Info</div>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Resolution Rate</span>
                  <span className="text-green-400 font-medium">
                    {Math.round((mockSystemHealth.errorStats.resolvedErrors / mockSystemHealth.errorStats.totalErrors) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(mockSystemHealth.errorStats.resolvedErrors / mockSystemHealth.errorStats.totalErrors) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-green-500/10 border border-green-500/20 rounded p-2 text-center">
                  <div className="text-green-200">Resolved</div>
                  <div className="text-white font-medium">{mockSystemHealth.errorStats.resolvedErrors}</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-center">
                  <div className="text-red-200">Open</div>
                  <div className="text-white font-medium">{mockSystemHealth.errorStats.openErrors}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Service Performance */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Service Log Analytics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Log Volume</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Error Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Trend</th>
                </tr>
              </thead>
              <tbody>
                {mockSystemHealth.logAnalytics.topServices.map((service, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{service.service}</td>
                    <td className="py-3 px-4 text-gray-300">{service.logCount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={service.errorRate < 0.02 ? 'text-green-400' : service.errorRate < 0.05 ? 'text-yellow-400' : 'text-red-400'}>
                        {(service.errorRate * 100).toFixed(3)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={service.errorRate < 0.02 ? 'success' : service.errorRate < 0.05 ? 'warning' : 'error'} size="sm">
                        {service.errorRate < 0.02 ? '🟢 Healthy' : service.errorRate < 0.05 ? '⚠️ Warning' : '🚨 Critical'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-green-400">📈 Stable</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Recent Errors */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Errors & Issues</h3>
            <div className="flex gap-2">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-gray-800 border border-white/20 text-white rounded px-3 py-1 text-sm"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="bg-gray-800 border border-white/20 text-white rounded px-3 py-1 text-sm"
              >
                {services.map(service => (
                  <option key={service} value={service}>
                    {service === 'all' ? 'All Services' : service}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredErrors.map((error) => (
              <div
                key={error.id}
                className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={getLevelColor(error.level) as any} size="sm">
                      {getLevelIcon(error.level)} {error.level}
                    </Badge>
                    <Badge variant={getStatusColor(error.resolution) as any} size="sm">
                      {getStatusIcon(error.resolution)} {error.resolution}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {new Date(error.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {error.service}
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-medium text-white mb-1">{error.message}</h4>
                  <p className="text-sm text-gray-400">{error.details}</p>
                </div>

                {error.clientName && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-400">Client: </span>
                    <span className="text-sm text-white">{error.clientName}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Impact:</div>
                    <div className="text-white">{error.impact}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Assigned to:</div>
                    <div className="text-white">{error.assignedTo}</div>
                  </div>
                </div>

                {error.resolution === 'resolved' && error.resolutionNotes && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <div className="text-sm text-green-200 font-medium mb-1">Resolution</div>
                    <div className="text-sm text-gray-300">{error.resolutionNotes}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Resolved: {new Date(error.resolvedAt!).toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <NeonButton size="sm" variant="secondary">
                    🔍 View Details
                  </NeonButton>
                  {error.resolution === 'pending' && (
                    <NeonButton size="sm" variant="secondary">
                      🔧 Assign
                    </NeonButton>
                  )}
                  <NeonButton size="sm" variant="secondary">
                    📋 View Logs
                  </NeonButton>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Alert Rules */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Alert Rules & Notifications</h3>
            <NeonButton size="sm" variant="secondary">
              + Create Alert Rule
            </NeonButton>
          </div>

          <div className="space-y-4">
            {mockSystemHealth.logAnalytics.alertRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-white">{rule.name}</h4>
                    <Badge variant={getStatusColor(rule.status) as any} size="sm">
                      {getStatusIcon(rule.status)} {rule.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">{rule.condition}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Triggered: </span>
                      <span className="text-white">{rule.triggered} times</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Triggered: </span>
                      <span className="text-white">
                        {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <NeonButton size="sm" variant="secondary">
                    ✏️ Edit
                  </NeonButton>
                  <NeonButton size="sm" variant="secondary">
                    {rule.status === 'active' ? '⏸️' : '▶️'}
                  </NeonButton>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}