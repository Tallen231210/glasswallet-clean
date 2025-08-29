'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { SimpleToast } from '@/components/ui/SimpleToast';
import { AppLayout } from '@/components/layout/AppLayout';

interface PixelConnection {
  id: string;
  platformType: string;
  connectionName: string;
  pixelId?: string;
  connectionStatus: string;
  syncSettings: any;
  lastSyncAt?: string;
  createdAt: string;
  syncStats?: {
    leadsSync: number;
    conversionRate: string;
  };
}

export default function PixelsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<PixelConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Check for connection success/error messages from OAuth
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    
    if (connected) {
      const platformName = connected === 'meta' ? 'Meta (Facebook)' : 
                          connected === 'google' ? 'Google Ads' : 
                          connected === 'tiktok' ? 'TikTok' : connected;
      showNotification(`Successfully connected ${platformName}!`, 'success');
      
      // Remove query params from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Refresh connections
      fetchConnections();
    }
    
    if (error) {
      showNotification(decodeURIComponent(error), 'error');
      
      // Remove query params from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Fetch pixel connections from API
  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/pixels/connections');
      if (response.ok) {
        const data = await response.json();
        const connectionsData = data.data || [];
        
        // Add mock sync stats for demo
        const connectionsWithStats = connectionsData.map((conn: PixelConnection) => ({
          ...conn,
          syncStats: {
            leadsSync: Math.floor(Math.random() * 500) + 50,
            conversionRate: `${(Math.random() * 15 + 5).toFixed(1)}%`
          }
        }));
        
        setConnections(connectionsWithStats);
      } else {
        console.error('Failed to fetch connections');
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // Handle OAuth connection
  const handleConnect = async (platform: 'meta' | 'google' | 'tiktok') => {
    try {
      const response = await fetch(`/api/oauth/${platform}/connect`);
      const data = await response.json();
      
      if (data.success && data.data.authUrl) {
        // Open OAuth popup
        const popup = window.open(
          data.data.authUrl,
          `${platform}-oauth`,
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        
        // Monitor popup for completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setTimeout(() => {
              fetchConnections(); // Refresh after popup closes
            }, 1000);
          }
        }, 1000);
        
      } else {
        showNotification('Failed to initialize OAuth connection', 'error');
      }
    } catch (error) {
      console.error('OAuth connection error:', error);
      showNotification('Failed to connect to platform', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'neon';
      case 'error': return 'default';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getPlatformIcon = (platformType: string) => {
    switch (platformType) {
      case 'META': return '📘';
      case 'GOOGLE_ADS': return '🔍';
      case 'TIKTOK': return '🎵';
      default: return '📊';
    }
  };

  const getPlatformName = (platformType: string) => {
    switch (platformType) {
      case 'META': return 'Meta (Facebook)';
      case 'GOOGLE_ADS': return 'Google Ads';
      case 'TIKTOK': return 'TikTok';
      default: return platformType;
    }
  };

  const stats = {
    activeConnections: connections.filter(c => c.connectionStatus === 'active').length,
    totalLeadsSync: connections.reduce((acc, c) => acc + (c.syncStats?.leadsSync || 0), 0),
    avgConversion: connections.length > 0 ? 
      (connections.reduce((acc, c) => acc + parseFloat(c.syncStats?.conversionRate || '0'), 0) / connections.length).toFixed(1) + '%' : 
      '0%',
    apiHealth: '99.7%'
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-white mb-2">
              🔗 Pixel Integration
            </h1>
            <p className="text-body-large text-gray-400">
              Manage advertising pixel connections and lead synchronization
            </p>
          </div>
          <div className="flex gap-3">
            <NeonButton variant="secondary" onClick={() => router.push('/pixels/analytics')}>
              📊 View Analytics
            </NeonButton>
            <NeonButton onClick={() => router.push('/leads')}>
              👈 Back to Leads
            </NeonButton>
          </div>
        </div>

        {/* Pixel Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Connections"
            value={stats.activeConnections}
            description="Live integrations"
            icon="🔗"
            variant="success"
          />
          <StatCard
            title="Leads Synced"
            value={stats.totalLeadsSync}
            description="This month"
            icon="📊"
            variant="neon"
            trend="+23% vs last month"
          />
          <StatCard
            title="Avg Conversion"
            value={stats.avgConversion}
            description="Across platforms"
            icon="📈"
            variant="success"
            trend="+2.1% improvement"
          />
          <StatCard
            title="API Health"
            value={stats.apiHealth}
            description="Platform uptime"
            icon="✅"
            variant="success"
          />
        </div>

        {/* Connect New Platforms */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">🚀 Connect New Platform</h2>
            <div className="text-sm text-gray-400">
              Choose a platform to sync your leads with
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Meta Connection */}
            <div className="p-6 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/30 transition-all">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📘</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Meta (Facebook)</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Sync leads to Facebook Custom Audiences via Conversions API
                </p>
                <NeonButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleConnect('meta')}
                  className="w-full"
                >
                  📘 Connect Meta
                </NeonButton>
              </div>
            </div>

            {/* Google Ads Connection */}
            <div className="p-6 bg-white/5 rounded-lg border border-white/10 hover:border-green-500/30 transition-all">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Google Ads</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Create Customer Match audiences for improved targeting
                </p>
                <NeonButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleConnect('google')}
                  className="w-full"
                >
                  🔍 Connect Google
                </NeonButton>
              </div>
            </div>

            {/* TikTok Connection */}
            <div className="p-6 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎵</span>
                </div>
                <h3 className="font-semibold text-white mb-2">TikTok</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Send events to TikTok pixel for better ad optimization
                </p>
                <NeonButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleConnect('tiktok')}
                  className="w-full"
                >
                  🎵 Connect TikTok
                </NeonButton>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Connected Pixels */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">📊 Connected Platforms</h2>
            <div className="text-sm text-gray-400">
              {connections.length} connection{connections.length !== 1 ? 's' : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">
              <div className="animate-spin text-4xl mb-4">⚡</div>
              <p>Loading connections...</p>
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-4">🔗</div>
              <p className="text-lg mb-2">No pixel connections yet</p>
              <p className="text-sm">Connect your first platform above to start syncing leads</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div key={connection.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <span className="text-xl">
                          {getPlatformIcon(connection.platformType)}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-white">{connection.connectionName}</h3>
                        <p className="text-gray-400 text-sm">{getPlatformName(connection.platformType)}</p>
                        {connection.pixelId && (
                          <p className="text-gray-500 text-xs font-mono">{connection.pixelId}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Status</p>
                        <Badge variant={getStatusColor(connection.connectionStatus) as any}>
                          {connection.connectionStatus}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Leads Synced</p>
                        <p className="font-bold text-neon-green">{connection.syncStats?.leadsSync || 0}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Conversion Rate</p>
                        <p className="font-bold text-white">{connection.syncStats?.conversionRate || 'N/A'}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Connected</p>
                        <p className="text-xs text-gray-500">
                          {new Date(connection.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <NeonButton variant="secondary" size="sm">
                          ⚙️ Configure
                        </NeonButton>
                        <NeonButton variant="secondary" size="sm">
                          📊 Analytics
                        </NeonButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Integration Guide */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">💡 How Pixel Integration Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-400 text-xl">1️⃣</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Connect & Authenticate</h4>
              <p className="text-gray-400 text-sm">
                OAuth securely connects your ad accounts with proper permissions
              </p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-400 text-xl">2️⃣</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Auto-Tag & Sync</h4>
              <p className="text-gray-400 text-sm">
                Tagged leads automatically sync to pixel audiences in real-time
              </p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 text-xl">3️⃣</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Optimize & Scale</h4>
              <p className="text-gray-400 text-sm">
                Improved targeting leads to better conversion rates and lower costs
              </p>
            </div>
          </div>
        </GlassCard>

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