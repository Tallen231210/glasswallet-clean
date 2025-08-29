'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { SimpleToast } from '@/components/ui/SimpleToast';
import { AppLayout } from '@/components/layout/AppLayout';

interface SyncJob {
  id: string;
  platformType: string;
  connectionName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  leadsCount: number;
  syncedCount: number;
  failedCount: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  errorMessage?: string;
}

export default function PixelAnalyticsPage() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'performance'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Mock data - in production this would come from API
  const [syncJobs] = useState<SyncJob[]>([
    {
      id: 'job_001',
      platformType: 'META',
      connectionName: 'Meta - Business Account',
      status: 'completed',
      leadsCount: 247,
      syncedCount: 239,
      failedCount: 8,
      startedAt: '2025-08-29T08:15:00Z',
      completedAt: '2025-08-29T08:16:23Z',
      duration: 83000
    },
    {
      id: 'job_002',
      platformType: 'GOOGLE_ADS',
      connectionName: 'Google Ads - Primary',
      status: 'completed',
      leadsCount: 189,
      syncedCount: 189,
      failedCount: 0,
      startedAt: '2025-08-29T08:10:00Z',
      completedAt: '2025-08-29T08:12:15Z',
      duration: 135000
    },
    {
      id: 'job_003',
      platformType: 'TIKTOK',
      connectionName: 'TikTok - Campaign Account',
      status: 'processing',
      leadsCount: 156,
      syncedCount: 89,
      failedCount: 2,
      startedAt: '2025-08-29T08:20:00Z'
    },
    {
      id: 'job_004',
      platformType: 'META',
      connectionName: 'Meta - Business Account',
      status: 'failed',
      leadsCount: 67,
      syncedCount: 0,
      failedCount: 67,
      startedAt: '2025-08-29T07:45:00Z',
      completedAt: '2025-08-29T07:46:12Z',
      duration: 72000,
      errorMessage: 'OAuth token expired - please reconnect'
    },
    {
      id: 'job_005',
      platformType: 'GOOGLE_ADS',
      connectionName: 'Google Ads - Primary',
      status: 'pending',
      leadsCount: 234,
      syncedCount: 0,
      failedCount: 0,
      startedAt: '2025-08-29T08:25:00Z'
    }
  ]);

  const analytics = {
    overview: {
      totalConnections: 3,
      activeConnections: 2,
      totalSyncs: syncJobs.length,
      successfulSyncs: syncJobs.filter(job => job.status === 'completed').length,
      totalLeadsSynced: syncJobs.reduce((acc, job) => acc + job.syncedCount, 0),
      avgSyncTime: syncJobs.filter(job => job.duration).reduce((acc, job) => acc + (job.duration || 0), 0) / 
                   Math.max(syncJobs.filter(job => job.duration).length, 1) / 1000
    },
    platformBreakdown: [
      {
        platformType: 'META',
        connections: 1,
        syncs: syncJobs.filter(job => job.platformType === 'META').length,
        leadsSynced: syncJobs.filter(job => job.platformType === 'META').reduce((acc, job) => acc + job.syncedCount, 0),
        successRate: syncJobs.filter(job => job.platformType === 'META' && job.status === 'completed').length / 
                     Math.max(syncJobs.filter(job => job.platformType === 'META').length, 1),
        avgValue: 127.45
      },
      {
        platformType: 'GOOGLE_ADS',
        connections: 1,
        syncs: syncJobs.filter(job => job.platformType === 'GOOGLE_ADS').length,
        leadsSynced: syncJobs.filter(job => job.platformType === 'GOOGLE_ADS').reduce((acc, job) => acc + job.syncedCount, 0),
        successRate: syncJobs.filter(job => job.platformType === 'GOOGLE_ADS' && job.status === 'completed').length / 
                     Math.max(syncJobs.filter(job => job.platformType === 'GOOGLE_ADS').length, 1),
        avgValue: 143.22
      },
      {
        platformType: 'TIKTOK',
        connections: 1,
        syncs: syncJobs.filter(job => job.platformType === 'TIKTOK').length,
        leadsSynced: syncJobs.filter(job => job.platformType === 'TIKTOK').reduce((acc, job) => acc + job.syncedCount, 0),
        successRate: syncJobs.filter(job => job.platformType === 'TIKTOK' && job.status === 'completed').length / 
                     Math.max(syncJobs.filter(job => job.platformType === 'TIKTOK').length, 1),
        avgValue: 98.76
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'neon';
      case 'pending': return 'default';
      case 'failed': return 'default';
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

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
    showNotification('Analytics refreshed', 'success');
  };

  const TabButton = ({ tab, label, isActive, onClick }: {
    tab: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-neon-green text-black shadow-lg'
          : 'bg-white/5 text-gray-300 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-white mb-2">
              📊 Pixel Analytics
            </h1>
            <p className="text-body-large text-gray-400">
              Monitor sync performance and pixel integration health
            </p>
          </div>
          <div className="flex gap-3">
            <NeonButton 
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </NeonButton>
            <NeonButton onClick={() => router.push('/pixels')}>
              👈 Back to Pixels
            </NeonButton>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
          <TabButton
            tab="overview"
            label="📈 Overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            tab="history"
            label="📋 Sync History"
            isActive={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          />
          <TabButton
            tab="performance"
            label="⚡ Performance"
            isActive={activeTab === 'performance'}
            onClick={() => setActiveTab('performance')}
          />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Syncs"
                value={analytics.overview.totalSyncs}
                description="All time"
                icon="🔄"
                variant="neon"
                trend="+12% this week"
              />
              <StatCard
                title="Success Rate"
                value={`${Math.round((analytics.overview.successfulSyncs / analytics.overview.totalSyncs) * 100)}%`}
                description="Completed successfully"
                icon="✅"
                variant="success"
                trend="+2% vs last week"
              />
              <StatCard
                title="Leads Synced"
                value={analytics.overview.totalLeadsSynced}
                description="Total processed"
                icon="👥"
                variant="default"
                trend="+347 today"
              />
              <StatCard
                title="Avg Sync Time"
                value={`${analytics.overview.avgSyncTime.toFixed(1)}s`}
                description="Per sync job"
                icon="⏱️"
                variant="success"
                trend="-0.8s faster"
              />
            </div>

            {/* Platform Breakdown */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">🌐 Platform Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics.platformBreakdown.map((platform) => (
                  <div key={platform.platformType} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{getPlatformIcon(platform.platformType)}</span>
                      <div>
                        <h4 className="font-medium text-white">
                          {platform.platformType === 'GOOGLE_ADS' ? 'Google Ads' : 
                           platform.platformType === 'META' ? 'Meta (Facebook)' :
                           platform.platformType}
                        </h4>
                        <p className="text-sm text-gray-400">{platform.connections} connection{platform.connections !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Syncs</span>
                        <span className="text-white font-medium">{platform.syncs}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Leads Synced</span>
                        <span className="text-white font-medium">{platform.leadsSynced}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Success Rate</span>
                        <span className={`font-medium ${platform.successRate >= 0.9 ? 'text-green-400' : 
                                      platform.successRate >= 0.8 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {Math.round(platform.successRate * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Avg Lead Value</span>
                        <span className="text-neon-green font-medium">${platform.avgValue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Sync History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">🕒 Recent Sync Jobs</h2>
              <div className="flex gap-3">
                <NeonButton variant="secondary" size="sm">
                  📊 Export Report
                </NeonButton>
                <NeonButton variant="secondary" size="sm">
                  🔍 Filter
                </NeonButton>
              </div>
            </div>

            <GlassCard className="p-6">
              <div className="space-y-4">
                {syncJobs.map((job) => (
                  <div key={job.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                          <span className="text-xl">{getPlatformIcon(job.platformType)}</span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-white">{job.connectionName}</h3>
                            <Badge variant={getStatusColor(job.status) as any}>
                              {job.status === 'processing' && (
                                <span className="inline-block w-2 h-2 bg-current rounded-full animate-pulse mr-1"></span>
                              )}
                              {job.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            Started {new Date(job.startedAt).toLocaleString()}
                            {job.completedAt && ` • Completed ${new Date(job.completedAt).toLocaleString()}`}
                          </p>
                          {job.errorMessage && (
                            <p className="text-sm text-red-400 mt-1">⚠️ {job.errorMessage}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-sm text-gray-400">Progress</p>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{job.syncedCount}/{job.leadsCount}</p>
                            {job.status === 'processing' && (
                              <div className="w-16 bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className="bg-neon-green h-1.5 rounded-full transition-all duration-500"
                                  style={{ width: `${(job.syncedCount / job.leadsCount) * 100}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400">Duration</p>
                          <p className="text-white font-medium">{formatDuration(job.duration)}</p>
                        </div>

                        {job.failedCount > 0 && (
                          <div>
                            <p className="text-sm text-gray-400">Failed</p>
                            <p className="text-red-400 font-medium">{job.failedCount}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <NeonButton variant="secondary" size="sm">
                            📋 Details
                          </NeonButton>
                          {job.status === 'failed' && (
                            <NeonButton variant="secondary" size="sm">
                              🔄 Retry
                            </NeonButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">⚡ Performance Insights</h2>
            
            {/* Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🚀 Optimization Recommendations</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-green-500">✅</span>
                      <div>
                        <p className="text-green-400 text-sm font-medium">All Connections Healthy</p>
                        <p className="text-gray-300 text-xs">All pixel connections are active and syncing successfully</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-500">⚡</span>
                      <div>
                        <p className="text-yellow-400 text-sm font-medium">Consider Batch Optimization</p>
                        <p className="text-gray-300 text-xs">Large syncs could benefit from increased batch sizes</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500">💡</span>
                      <div>
                        <p className="text-blue-400 text-sm font-medium">Auto-Sync Performing Well</p>
                        <p className="text-gray-300 text-xs">94% of syncs are triggered by auto-tagging rules</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📈 Trending Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300 text-sm">Daily Sync Volume</span>
                    <div className="text-right">
                      <span className="text-neon-green font-bold">+23%</span>
                      <p className="text-xs text-gray-400">vs last week</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300 text-sm">API Response Time</span>
                    <div className="text-right">
                      <span className="text-green-400 font-bold">-12%</span>
                      <p className="text-xs text-gray-400">faster avg</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300 text-sm">Success Rate</span>
                    <div className="text-right">
                      <span className="text-neon-green font-bold">97.2%</span>
                      <p className="text-xs text-gray-400">+2.1% improvement</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300 text-sm">Lead Value Increase</span>
                    <div className="text-right">
                      <span className="text-purple-400 font-bold">+$34</span>
                      <p className="text-xs text-gray-400">avg per lead</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

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