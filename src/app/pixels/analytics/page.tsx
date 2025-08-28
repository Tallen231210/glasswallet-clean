'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
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

interface PixelAnalytics {
  overview: {
    totalConnections: number;
    activeConnections: number;
    totalSyncs: number;
    successfulSyncs: number;
    totalLeadsSynced: number;
    avgSyncTime: number;
  };
  platformBreakdown: {
    platformType: string;
    connections: number;
    syncs: number;
    leadsSynced: number;
    successRate: number;
    avgValue: number;
  }[];
  syncTrends: {
    date: string;
    syncs: number;
    leads: number;
    success_rate: number;
  }[];
  qualityMetrics: {
    qualifiedLeads: number;
    whitelistLeads: number;
    blacklistLeads: number;
    averageCreditScore: number;
    valueDistribution: {
      tier: string;
      count: number;
      value: number;
    }[];
  };
  recentActivity: {
    id: string;
    timestamp: string;
    platformType: string;
    eventType: string;
    leadCount: number;
    status: 'success' | 'failed';
    connectionName: string;
  }[];
}

const PixelAnalyticsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [analytics, setAnalytics] = useState<PixelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/pixels/analytics');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch analytics');
      }

      setAnalytics(result.data);
    } catch (error) {
      console.error('Error fetching pixel analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    showToast({
      title: 'Analytics Refreshed',
      message: 'Latest pixel analytics data has been loaded',
      variant: 'success'
    });
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
      case 'TIKTOK': return 'TikTok Ads';
      default: return platformType;
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (error && !loading) {
    return (
      <AppShell>
        <div className="p-6">
          <Alert variant="error" title="Error Loading Analytics">
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
            onClick={handleRefresh}
            loading={refreshing}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </NeonButton>
          <NeonButton onClick={() => router.push('/pixels')}>
            Back to Pixels
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-8 max-w-7xl mx-auto">

        {loading ? (
          <GlassCard className="p-12">
            <Loading message="Loading pixel analytics..." size="lg" />
          </GlassCard>
        ) : !analytics ? (
          <GlassCard className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
              <p className="text-gray-400 mb-6">
                Unable to load analytics data. Please check your pixel connections and try again.
              </p>
              <NeonButton onClick={fetchAnalytics}>
                Retry Loading
              </NeonButton>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <StatCard
                title="Connections"
                value={analytics.overview.totalConnections}
                icon="🔗"
                variant="default"
                description={`${analytics.overview.activeConnections} active`}
              />
              <StatCard
                title="Total Syncs"
                value={analytics.overview.totalSyncs.toLocaleString()}
                icon="🔄"
                variant="neon"
                description={`${(analytics.overview.successfulSyncs / analytics.overview.totalSyncs * 100).toFixed(1)}% success`}
              />
              <StatCard
                title="Leads Synced"
                value={analytics.overview.totalLeadsSynced.toLocaleString()}
                icon="👥"
                variant="success"
                description="Total leads processed"
              />
              <StatCard
                title="Avg Sync Time"
                value={`${analytics.overview.avgSyncTime}s`}
                icon="⏱️"
                variant="default"
                description="Average sync duration"
              />
              <StatCard
                title="Success Rate"
                value={`${(analytics.overview.successfulSyncs / analytics.overview.totalSyncs * 100).toFixed(1)}%`}
                icon="✅"
                variant="success"
                description="Overall success rate"
              />
              <StatCard
                title="Avg Credit Score"
                value={analytics.qualityMetrics.averageCreditScore}
                icon="📊"
                variant="warning"
                description="Portfolio average"
              />
            </div>

            {/* Platform Breakdown */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Platform Performance</h3>
              <div className="space-y-4">
                {analytics.platformBreakdown.map((platform) => (
                  <div key={platform.platformType} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                        <span className="text-xl">{getPlatformIcon(platform.platformType)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{getPlatformName(platform.platformType)}</h4>
                        <p className="text-sm text-gray-400">{platform.connections} connection(s)</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-8 text-center">
                      <div>
                        <p className="text-sm text-gray-400">Syncs</p>
                        <p className="font-semibold text-white">{platform.syncs}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Leads</p>
                        <p className="font-semibold text-white">{platform.leadsSynced.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Success Rate</p>
                        <p className="font-semibold text-white">{(platform.successRate * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Avg Value</p>
                        <p className="font-semibold text-neon-green">${platform.avgValue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Quality Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Lead Quality Distribution</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Qualified Leads</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">{analytics.qualityMetrics.qualifiedLeads.toLocaleString()}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Whitelist Leads</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neon">{analytics.qualityMetrics.whitelistLeads.toLocaleString()}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Blacklist Leads</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="error">{analytics.qualityMetrics.blacklistLeads.toLocaleString()}</Badge>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Value Distribution</h3>
                <div className="space-y-4">
                  {analytics.qualityMetrics.valueDistribution.map((tier, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="text-white font-medium">{tier.tier}</span>
                        <p className="text-sm text-gray-400">{tier.count.toLocaleString()} leads</p>
                      </div>
                      <div className="text-right">
                        <span className="text-neon-green font-semibold">${tier.value.toFixed(2)}</span>
                        <p className="text-sm text-gray-400">avg value</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Recent Activity */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                <Badge variant="default" size="sm">Last 7 days</Badge>
              </div>
              
              <div className="space-y-3">
                {analytics.recentActivity.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-sm">{getPlatformIcon(activity.platformType)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {formatEventType(activity.eventType)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {activity.connectionName} • {activity.leadCount} leads
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={activity.status === 'success' ? 'success' : 'error'} 
                        size="sm"
                        dot
                      >
                        {activity.status}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <NeonButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => showToast({
                    message: 'Full activity log coming soon',
                    variant: 'info'
                  })}
                >
                  View Full Activity Log
                </NeonButton>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default function PixelAnalyticsPageWrapper() {
  return (
    <ToastProvider>
      <PixelAnalyticsPage />
    </ToastProvider>
  );
}