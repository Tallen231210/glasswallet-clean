'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { InteractiveCard } from '@/components/ui/InteractiveCard';
import { usePermissions } from '@/contexts/UserContext';
import { Progress } from '@/components/ui/Progress';

// Mock system health data
interface SystemMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: string;
  description: string;
  lastCheck: string;
  uptime?: string;
  responseTime?: string;
}

interface ResourceUsage {
  name: string;
  current: number;
  max: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

const mockSystemMetrics: SystemMetric[] = [
  {
    name: 'API Gateway',
    status: 'healthy',
    value: '99.9%',
    description: 'Main API endpoint availability',
    lastCheck: '30 seconds ago',
    uptime: '99.9%',
    responseTime: '145ms'
  },
  {
    name: 'Database Cluster',
    status: 'healthy',
    value: '99.7%',
    description: 'PostgreSQL cluster health',
    lastCheck: '1 minute ago',
    uptime: '99.7%',
    responseTime: '12ms'
  },
  {
    name: 'Redis Cache',
    status: 'healthy',
    value: '100%',
    description: 'Cache layer performance',
    lastCheck: '15 seconds ago',
    uptime: '100%',
    responseTime: '2ms'
  },
  {
    name: 'Background Jobs',
    status: 'warning',
    value: '98.5%',
    description: 'Asynchronous job processing',
    lastCheck: '2 minutes ago',
    uptime: '98.5%',
    responseTime: '500ms'
  },
  {
    name: 'File Storage',
    status: 'healthy',
    value: '99.8%',
    description: 'Object storage availability',
    lastCheck: '45 seconds ago',
    uptime: '99.8%',
    responseTime: '89ms'
  },
  {
    name: 'Email Service',
    status: 'healthy',
    value: '99.6%',
    description: 'Email delivery service',
    lastCheck: '3 minutes ago',
    uptime: '99.6%',
    responseTime: '250ms'
  },
  {
    name: 'CDN',
    status: 'healthy',
    value: '99.9%',
    description: 'Content delivery network',
    lastCheck: '20 seconds ago',
    uptime: '99.9%',
    responseTime: '45ms'
  },
  {
    name: 'Credit API',
    status: 'healthy',
    value: '99.4%',
    description: 'External credit reporting API',
    lastCheck: '1 minute ago',
    uptime: '99.4%',
    responseTime: '1.2s'
  }
];

const mockResourceUsage: ResourceUsage[] = [
  { name: 'CPU Usage', current: 34, max: 100, unit: '%', trend: 'stable' },
  { name: 'Memory Usage', current: 67, max: 100, unit: '%', trend: 'up' },
  { name: 'Disk Usage', current: 23, max: 100, unit: '%', trend: 'up' },
  { name: 'Network I/O', current: 45, max: 100, unit: '%', trend: 'down' },
  { name: 'Database Connections', current: 125, max: 200, unit: 'conn', trend: 'stable' },
  { name: 'Cache Hit Rate', current: 94, max: 100, unit: '%', trend: 'up' },
  { name: 'Queue Size', current: 12, max: 1000, unit: 'jobs', trend: 'stable' },
  { name: 'Error Rate', current: 0.3, max: 5, unit: '%', trend: 'down' }
];

export default function AdminSystemPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [systemMetrics] = useState<SystemMetric[]>(mockSystemMetrics);
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage[]>(mockResourceUsage);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Check if user has admin access
  if (!hasPermission('platformAdminAccess')) {
    return (
      <AppShell
        headerTitle="Access Denied"
        headerSubtitle="This feature is restricted to platform administrators"
      >
        <div className="p-6 max-w-2xl mx-auto text-center">
          <GlassCard className="p-8">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-6">
              System Health monitoring is restricted to platform administrators only.
            </p>
            <NeonButton onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </NeonButton>
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  // Auto-refresh system data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time data updates
      setResourceUsage(prev => prev.map(resource => ({
        ...resource,
        current: Math.max(0, Math.min(resource.max, 
          resource.current + (Math.random() - 0.5) * (resource.max * 0.1)
        ))
      })));
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-neon-green';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      default: return 'default';
    }
  };

  const getResourceColor = (percentage: number) => {
    if (percentage < 50) return 'text-neon-green';
    if (percentage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getResourceVariant = (percentage: number) => {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'error';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // In a real app, this would fetch fresh data from the API
    console.log('Refreshing system health data...');
  };

  const healthyCount = systemMetrics.filter(m => m.status === 'healthy').length;
  const warningCount = systemMetrics.filter(m => m.status === 'warning').length;
  const criticalCount = systemMetrics.filter(m => m.status === 'critical').length;
  const overallHealth = Math.round((healthyCount / systemMetrics.length) * 100);

  return (
    <AppShell
      headerTitle="System Health"
      headerSubtitle="Real-time platform monitoring and system diagnostics"
      headerActions={
        <div className="flex gap-2">
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/admin')}
          >
            ← Back to Admin
          </NeonButton>
          <NeonButton 
            variant={autoRefresh ? 'success' : 'secondary'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
          </NeonButton>
          <NeonButton onClick={handleRefresh}>
            🔄 Refresh
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-8 max-w-7xl mx-auto">

        {/* Overall Health Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">💚</div>
              <h3 className="text-lg font-bold text-white mb-2">Overall Health</h3>
              <div className="text-3xl font-bold text-neon-green">{overallHealth}%</div>
              <p className="text-xs text-gray-400 mt-2">System Status</p>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-white mb-2">Healthy</h3>
              <div className="text-3xl font-bold text-neon-green">{healthyCount}</div>
              <p className="text-xs text-gray-400 mt-2">Services</p>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-white mb-2">Warnings</h3>
              <div className="text-3xl font-bold text-yellow-400">{warningCount}</div>
              <p className="text-xs text-gray-400 mt-2">Issues</p>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">🚨</div>
              <h3 className="text-lg font-bold text-white mb-2">Critical</h3>
              <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
              <p className="text-xs text-gray-400 mt-2">Alerts</p>
            </GlassCard>
          </InteractiveCard>
        </div>

        {/* Last Updated Info */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              {autoRefresh && (
                <Badge variant="neon" size="sm">Auto-refresh</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Refreshes every 5 seconds</span>
            </div>
          </div>
        </GlassCard>

        {/* System Services Status */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">System Services</h2>
            <div className="flex gap-2">
              <NeonButton size="sm" variant="secondary">
                Run Health Check
              </NeonButton>
              <NeonButton size="sm" variant="secondary">
                Export Report
              </NeonButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((metric, index) => (
              <InteractiveCard key={index} hoverEffect="glow">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{metric.name}</h3>
                    <Badge variant={getStatusVariant(metric.status)} size="sm">
                      {metric.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Availability:</span>
                      <span className={getStatusColor(metric.status)}>{metric.value}</span>
                    </div>
                    
                    {metric.uptime && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Uptime:</span>
                        <span className="text-white">{metric.uptime}</span>
                      </div>
                    )}
                    
                    {metric.responseTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Response:</span>
                        <span className="text-white">{metric.responseTime}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-gray-400">{metric.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Checked {metric.lastCheck}</p>
                    </div>
                  </div>
                </div>
              </InteractiveCard>
            ))}
          </div>
        </GlassCard>

        {/* Resource Usage */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Resource Usage</h2>
            <div className="flex gap-2">
              <NeonButton size="sm" variant="secondary">
                View History
              </NeonButton>
              <NeonButton size="sm" variant="secondary">
                Set Alerts
              </NeonButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resourceUsage.map((resource, index) => {
              const percentage = resource.name === 'Queue Size' || resource.name === 'Database Connections' 
                ? (resource.current / resource.max) * 100
                : resource.current;
              
              return (
                <InteractiveCard key={index} hoverEffect="glow">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-white">{resource.name}</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{getTrendIcon(resource.trend)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={getResourceColor(percentage)}>
                          {resource.current.toFixed(resource.name.includes('Rate') ? 1 : 0)}{resource.unit}
                        </span>
                        {(resource.name === 'Queue Size' || resource.name === 'Database Connections') && (
                          <span className="text-xs text-gray-400">/ {resource.max}</span>
                        )}
                      </div>
                      
                      <Progress 
                        value={percentage} 
                        variant={getResourceVariant(percentage)}
                        className="h-2" 
                      />
                      
                      <div className="text-xs text-gray-500">
                        {resource.trend === 'up' && '↗ Increasing'}
                        {resource.trend === 'down' && '↘ Decreasing'}
                        {resource.trend === 'stable' && '→ Stable'}
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              );
            })}
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-blue-400">⚡</span>
              System Actions
            </h3>
            
            <div className="space-y-3">
              <NeonButton 
                className="w-full justify-start" 
                variant="secondary"
                onClick={() => console.log('Restart services')}
              >
                🔄 Restart All Services
              </NeonButton>
              
              <NeonButton 
                className="w-full justify-start" 
                variant="secondary"
                onClick={() => console.log('Clear cache')}
              >
                🗑️ Clear All Caches
              </NeonButton>
              
              <NeonButton 
                className="w-full justify-start" 
                variant="secondary"
                onClick={() => console.log('Run diagnostics')}
              >
                🔍 Run Full Diagnostics
              </NeonButton>
              
              <NeonButton 
                className="w-full justify-start bg-red-600/20 hover:bg-red-600/30" 
                variant="secondary"
                onClick={() => console.log('Enable maintenance mode')}
              >
                🚧 Enable Maintenance Mode
              </NeonButton>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-green-400">📊</span>
              Performance Metrics
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-lg border border-green-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-400 font-medium">API Response Time</span>
                  <span className="text-white font-bold">145ms</span>
                </div>
                <Progress value={25} variant="success" className="h-2" />
                <p className="text-xs text-gray-400 mt-1">Average over last 24 hours</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-lg border border-blue-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 font-medium">Throughput</span>
                  <span className="text-white font-bold">2,847 req/min</span>
                </div>
                <Progress value={65} variant="default" className="h-2" />
                <p className="text-xs text-gray-400 mt-1">Current request rate</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg border border-purple-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-400 font-medium">Active Users</span>
                  <span className="text-white font-bold">89</span>
                </div>
                <Progress value={35} variant="neon" className="h-2" />
                <p className="text-xs text-gray-400 mt-1">Currently online</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}