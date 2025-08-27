'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  StatCard,
  Badge,
  Progress,
  ActivityFeed,
  ToastProvider,
  useToast,
  Alert
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';
import { usePermissions } from '@/contexts/UserContext';

const AdminPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { canAccessPlatformAdmin } = usePermissions();

  // Block access if user is not a platform admin
  if (!canAccessPlatformAdmin) {
    return (
      <AppShell>
        <div className="p-6">
          <GlassCard className="p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-400 mb-6">
              This area is restricted to platform administrators only.
            </p>
            <NeonButton onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </NeonButton>
          </GlassCard>
        </div>
      </AppShell>
    );
  }
  
  const [systemStats] = useState({
    totalUsers: 247,
    activeUsers: 143,
    totalLeads: 15847,
    systemHealth: 99.2,
    apiCalls: 2847,
    errorRate: 0.3,
    avgResponseTime: 145,
    storageUsed: 2.4
  });

  const [realtimeData, setRealtimeData] = useState({
    currentUsers: 89,
    activeConnections: 156,
    queueSize: 12,
    memoryUsage: 67,
    cpuUsage: 34,
    diskUsage: 23
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        currentUsers: Math.max(50, prev.currentUsers + Math.floor(Math.random() * 20) - 10),
        activeConnections: Math.max(100, prev.activeConnections + Math.floor(Math.random() * 30) - 15),
        queueSize: Math.max(0, prev.queueSize + Math.floor(Math.random() * 8) - 4),
        memoryUsage: Math.max(40, Math.min(90, prev.memoryUsage + Math.floor(Math.random() * 6) - 3)),
        cpuUsage: Math.max(10, Math.min(80, prev.cpuUsage + Math.floor(Math.random() * 10) - 5)),
        diskUsage: Math.max(15, Math.min(40, prev.diskUsage + Math.floor(Math.random() * 4) - 2))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSystemAction = (action: string) => {
    showToast({
      title: 'Action Triggered',
      message: `${action} has been initiated`,
      variant: 'info'
    });
  };

  const systemServices = [
    { name: 'API Gateway', status: 'healthy', uptime: '99.9%', lastCheck: '2 min ago' },
    { name: 'Database Cluster', status: 'healthy', uptime: '99.7%', lastCheck: '1 min ago' },
    { name: 'Redis Cache', status: 'healthy', uptime: '99.9%', lastCheck: '3 min ago' },
    { name: 'Background Jobs', status: 'warning', uptime: '98.5%', lastCheck: '5 min ago' },
    { name: 'File Storage', status: 'healthy', uptime: '99.8%', lastCheck: '2 min ago' },
    { name: 'Email Service', status: 'healthy', uptime: '99.6%', lastCheck: '4 min ago' },
    { name: 'CDN', status: 'healthy', uptime: '99.9%', lastCheck: '1 min ago' },
    { name: 'Monitoring', status: 'healthy', uptime: '100%', lastCheck: 'Now' },
  ];

  const getResourceColor = (usage: number) => {
    if (usage < 50) return 'text-neon-green';
    if (usage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getResourceVariant = (usage: number) => {
    if (usage < 50) return 'success';
    if (usage < 80) return 'warning';
    return 'error';
  };


  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  return (
    <AppShell 
      headerActions={
        <div className="flex gap-2">
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/admin/users')}
          >
            User Management
          </NeonButton>
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/admin/logs')}
          >
            System Logs
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Platform administration, system monitoring, and user management</p>
        </div>

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={systemStats.totalUsers.toString()}
            icon="👥"
            variant="neon"
            trend="+12 this week"
          />
          <StatCard
            title="Active Users"
            value={systemStats.activeUsers.toString()}
            change={{ 
              value: Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100), 
              type: 'increase',
              period: 'active rate'
            }}
            icon="⚡"
            variant="success"
          />
          <StatCard
            title="Total Leads"
            value={systemStats.totalLeads.toLocaleString()}
            icon="📊"
            variant="default"
            trend="+1.2k today"
          />
          <StatCard
            title="System Health"
            value={`${systemStats.systemHealth}%`}
            icon="💚"
            variant="success"
            trend="All systems operational"
          />
        </div>

        {/* Real-time System Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Resource Usage */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-red-400">📊</span>
              Resource Usage
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Memory Usage</span>
                  <span className={getResourceColor(realtimeData.memoryUsage)}>
                    {realtimeData.memoryUsage}%
                  </span>
                </div>
                <Progress 
                  value={realtimeData.memoryUsage} 
                  variant={getResourceVariant(realtimeData.memoryUsage)}
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">CPU Usage</span>
                  <span className={getResourceColor(realtimeData.cpuUsage)}>
                    {realtimeData.cpuUsage}%
                  </span>
                </div>
                <Progress 
                  value={realtimeData.cpuUsage} 
                  variant={getResourceVariant(realtimeData.cpuUsage)}
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Disk Usage</span>
                  <span className={getResourceColor(realtimeData.diskUsage)}>
                    {realtimeData.diskUsage}%
                  </span>
                </div>
                <Progress 
                  value={realtimeData.diskUsage} 
                  variant={getResourceVariant(realtimeData.diskUsage)}
                  className="h-2" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-neon-green">{realtimeData.currentUsers}</div>
                  <div className="text-xs text-gray-400">Online Users</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">{realtimeData.queueSize}</div>
                  <div className="text-xs text-gray-400">Queue Size</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* API & Performance */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-blue-400">⚡</span>
              API Performance
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-white">{systemStats.apiCalls.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">API Calls Today</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-neon-green">{systemStats.avgResponseTime}ms</div>
                  <div className="text-sm text-gray-400">Avg Response Time</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-red-400">{systemStats.errorRate}%</div>
                  <div className="text-sm text-gray-400">Error Rate</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-yellow-400">{systemStats.storageUsed}TB</div>
                  <div className="text-sm text-gray-400">Storage Used</div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex gap-2">
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleSystemAction('API Cache Clear')}
                  >
                    Clear Cache
                  </NeonButton>
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleSystemAction('Performance Report')}
                  >
                    Generate Report
                  </NeonButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* System Services Status */}
        <GlassCard className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">System Services</h3>
            <div className="flex gap-2">
              <NeonButton 
                size="sm" 
                variant="secondary"
                onClick={() => handleSystemAction('Health Check')}
              >
                Run Health Check
              </NeonButton>
              <NeonButton 
                size="sm" 
                onClick={() => handleSystemAction('Restart Services')}
              >
                Restart All
              </NeonButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemServices.map((service, index) => (
              <div
                key={index}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{service.name}</h4>
                  <Badge variant={getStatusVariant(service.status)} size="sm">
                    {service.status}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uptime:</span>
                    <span className="text-white">{service.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Check:</span>
                    <span className="text-gray-300">{service.lastCheck}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* System Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Activity Feed */}
          <ActivityFeed
            maxItems={10}
            compact={true}
            showFilters={false}
            onItemClick={(item) => {
              console.log('System activity clicked:', item);
            }}
          />

          {/* Admin Actions */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-purple-400">👑</span>
              Admin Actions
            </h3>
            
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 rounded-lg border border-yellow-500/20">
                <h4 className="text-yellow-400 font-medium mb-2">User Management</h4>
                <p className="text-sm text-gray-300 mb-3">Manage user accounts, permissions, and access controls</p>
                <div className="flex gap-2">
                  <NeonButton size="sm" onClick={() => router.push('/admin/users')}>
                    Manage Users
                  </NeonButton>
                  <NeonButton size="sm" variant="secondary">
                    View Permissions
                  </NeonButton>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-lg border border-blue-500/20">
                <h4 className="text-blue-400 font-medium mb-2">System Maintenance</h4>
                <p className="text-sm text-gray-300 mb-3">Database maintenance, backups, and system optimization</p>
                <div className="flex gap-2">
                  <NeonButton 
                    size="sm" 
                    onClick={() => handleSystemAction('Database Backup')}
                  >
                    Backup Database
                  </NeonButton>
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleSystemAction('System Optimization')}
                  >
                    Optimize
                  </NeonButton>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-lg border border-green-500/20">
                <h4 className="text-green-400 font-medium mb-2">Monitoring & Logs</h4>
                <p className="text-sm text-gray-300 mb-3">View system logs, error reports, and performance metrics</p>
                <div className="flex gap-2">
                  <NeonButton size="sm" onClick={() => router.push('/admin/logs')}>
                    View Logs
                  </NeonButton>
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleSystemAction('Error Report')}
                  >
                    Error Report
                  </NeonButton>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-red-600/10 to-pink-600/10 rounded-lg border border-red-500/20">
                <h4 className="text-red-400 font-medium mb-2">Emergency Actions</h4>
                <p className="text-sm text-gray-300 mb-3">Emergency system controls and maintenance mode</p>
                <div className="flex gap-2">
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    className="bg-red-600/20 hover:bg-red-600/30"
                    onClick={() => handleSystemAction('Maintenance Mode')}
                  >
                    Maintenance Mode
                  </NeonButton>
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleSystemAction('Emergency Shutdown')}
                  >
                    Emergency Stop
                  </NeonButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Admin Notice */}
        <Alert variant="warning" title="Administrator Access">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1">You have full administrative access to this platform.</p>
              <p className="text-sm text-gray-400">Please use these tools responsibly and follow security best practices.</p>
            </div>
            <Badge variant="warning" size="sm">Admin</Badge>
          </div>
        </Alert>
      </div>
    </AppShell>
  );
};

export default function AdminPageWrapper() {
  return (
    <ToastProvider>
      <AdminPage />
    </ToastProvider>
  );
}