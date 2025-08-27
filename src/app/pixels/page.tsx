'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  Badge, 
  StatCard,
  Alert,
  ToastProvider,
  useToast,
  Loading
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';

interface PixelConnection {
  id: string;
  platformType: 'META' | 'GOOGLE_ADS' | 'TIKTOK';
  connectionName: string;
  pixelId?: string;
  connectionStatus: 'active' | 'inactive' | 'expired' | 'error';
  syncSettings: {
    autoSync: boolean;
    syncQualifiedOnly: boolean;
    syncWhitelisted: boolean;
    excludeBlacklisted: boolean;
    minimumCreditScore?: number;
    syncFrequency: string;
  };
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

const PixelConnectionsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [connections, setConnections] = useState<PixelConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/pixels/connections');
      const result = await response.json();

      if (!response.ok) {
        // Handle authentication errors gracefully in development
        if (response.status === 401) {
          console.log('Authentication required - using demo data for development');
          setConnections([]);
          return;
        }
        throw new Error(result.error?.message || 'Failed to fetch connections');
      }

      setConnections(result.data);
    } catch (error) {
      console.error('Error fetching pixel connections:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    setTestingConnection(connectionId);
    
    try {
      const response = await fetch(`/api/pixels/connections/${connectionId}/test`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Connection test failed');
      }

      const { testResult, statusUpdated } = result.data;
      
      showToast({
        title: testResult.success ? 'Connection Successful' : 'Connection Failed',
        message: `${testResult.message}${testResult.latency ? ` (${testResult.latency}ms)` : ''}`,
        variant: testResult.success ? 'success' : 'error'
      });

      if (statusUpdated) {
        // Refresh connections to show updated status
        await fetchConnections();
      }

    } catch (error) {
      console.error('Error testing connection:', error);
      showToast({
        title: 'Test Failed',
        message: error instanceof Error ? error.message : 'Failed to test connection',
        variant: 'error'
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const getPlatformIcon = (platformType: string) => {
    switch (platformType) {
      case 'META': return '📘';
      case 'GOOGLE_ADS': return '🔍';
      case 'TIKTOK': return '🎵';
      default: return '🔗';
    }
  };

  const getPlatformName = (platformType: string) => {
    switch (platformType) {
      case 'META': return 'Meta (Facebook)';
      case 'GOOGLE_ADS': return 'Google Ads';
      case 'TIKTOK': return 'TikTok Ads';
      default: return platformType;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (error && !loading) {
    return (
      <AppShell>
        <div className="p-6">
          <Alert variant="error" title="Error Loading Connections">
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
            onClick={() => router.push('/pixels/analytics')}
          >
            View Analytics
          </NeonButton>
          <NeonButton onClick={() => router.push('/pixels/new')}>
            Add Connection
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-8 max-w-7xl mx-auto">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Connections"
            value={connections.length}
            icon="🔗"
            variant="default"
            loading={loading}
          />
          <StatCard
            title="Active"
            value={connections.filter(c => c.connectionStatus === 'active').length}
            icon="✅"
            variant="success"
            loading={loading}
          />
          <StatCard
            title="Auto-Sync Enabled"
            value={connections.filter(c => c.syncSettings.autoSync).length}
            icon="🔄"
            variant="neon"
            loading={loading}
          />
          <StatCard
            title="Platforms"
            value={new Set(connections.map(c => c.platformType)).size}
            icon="🌐"
            variant="warning"
            loading={loading}
          />
        </div>

        {loading ? (
          <GlassCard className="p-12">
            <Loading message="Loading pixel connections..." size="lg" />
          </GlassCard>
        ) : connections.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-neon-green text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Pixel Connections</h3>
              <p className="text-gray-400 mb-6">
                Connect your advertising pixels to automatically sync qualified leads and maximize your ad targeting.
              </p>
              <div className="flex gap-3 justify-center">
                <NeonButton onClick={() => router.push('/pixels/new')}>
                  Add First Connection
                </NeonButton>
                <NeonButton variant="secondary" onClick={() => router.push('/leads')}>
                  Manage Leads
                </NeonButton>
              </div>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            {/* Connection Cards */}
            {connections.map((connection) => (
              <GlassCard key={connection.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{getPlatformIcon(connection.platformType)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {connection.connectionName}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {getPlatformName(connection.platformType)}
                        {connection.pixelId && ` • ${connection.pixelId}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={getStatusVariant(connection.connectionStatus) as any}
                      dot
                    >
                      {getStatusLabel(connection.connectionStatus)}
                    </Badge>
                    <NeonButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleTestConnection(connection.id)}
                      loading={testingConnection === connection.id}
                      disabled={testingConnection === connection.id}
                    >
                      {testingConnection === connection.id ? 'Testing...' : 'Test'}
                    </NeonButton>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sync Settings */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Sync Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Auto-Sync</span>
                        <Badge variant={connection.syncSettings.autoSync ? 'success' : 'default'} size="sm">
                          {connection.syncSettings.autoSync ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Frequency</span>
                        <span className="text-white">{connection.syncSettings.syncFrequency}</span>
                      </div>
                      {connection.syncSettings.minimumCreditScore && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min Score</span>
                          <span className="text-white">{connection.syncSettings.minimumCreditScore}+</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Filter Settings */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Filters</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Qualified Only</span>
                        <Badge variant={connection.syncSettings.syncQualifiedOnly ? 'success' : 'default'} size="sm">
                          {connection.syncSettings.syncQualifiedOnly ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Include Whitelist</span>
                        <Badge variant={connection.syncSettings.syncWhitelisted ? 'success' : 'default'} size="sm">
                          {connection.syncSettings.syncWhitelisted ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Exclude Blacklist</span>
                        <Badge variant={connection.syncSettings.excludeBlacklisted ? 'success' : 'default'} size="sm">
                          {connection.syncSettings.excludeBlacklisted ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Activity */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Activity</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Last Sync</span>
                        <p className="text-white">
                          {connection.lastSyncAt 
                            ? new Date(connection.lastSyncAt).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Created</span>
                        <p className="text-white">
                          {new Date(connection.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                  <NeonButton 
                    size="sm"
                    onClick={() => showToast({
                      message: 'Manual sync functionality coming soon',
                      variant: 'info'
                    })}
                  >
                    Sync Now
                  </NeonButton>
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => showToast({
                      message: 'Edit connection functionality coming soon',
                      variant: 'info'
                    })}
                  >
                    Edit
                  </NeonButton>
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => router.push('/pixels/analytics')}
                  >
                    Analytics
                  </NeonButton>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Getting Started Guide */}
        {connections.length === 0 && !loading && (
          <GlassCard className="p-6 mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">🚀 Getting Started with Pixel Optimization</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-400 text-xl">📘</span>
                </div>
                <h4 className="font-medium text-white mb-2">Connect Meta Pixel</h4>
                <p className="text-sm text-gray-400">
                  Sync qualified leads to Facebook Custom Audiences for targeted advertising.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-red-400 text-xl">🔍</span>
                </div>
                <h4 className="font-medium text-white mb-2">Google Ads Integration</h4>
                <p className="text-sm text-gray-400">
                  Upload leads to Google Ads Customer Match for search and display targeting.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-400 text-xl">🎵</span>
                </div>
                <h4 className="font-medium text-white mb-2">TikTok Events API</h4>
                <p className="text-sm text-gray-400">
                  Send conversion events to TikTok for improved ad optimization.
                </p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </AppShell>
  );
};

export default function PixelConnectionsPageWrapper() {
  return (
    <ToastProvider>
      <PixelConnectionsPage />
    </ToastProvider>
  );
}