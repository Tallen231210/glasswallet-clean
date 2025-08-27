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
  Loading,
  Select,
  FormField
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';

interface ConversionFunnelStage {
  stage: string;
  stageOrder: number;
  leadsEntered: number;
  leadsExited: number;
  conversionRate: number;
  averageTimeInStage: number;
  dropOffReasons: string[];
}

interface ConversionTrend {
  date: string;
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
}

interface TopSource {
  source: string;
  leads: number;
  qualificationRate: number;
  avgCreditScore: number;
}

interface LeadLifecycleAnalytics {
  funnelAnalysis: ConversionFunnelStage[];
  performanceMetrics: any[];
  conversionTrends: ConversionTrend[];
  topPerformingSources: TopSource[];
}

interface ROIAnalytics {
  period: string;
  totalLeads: number;
  qualifiedLeads: number;
  costPerLead: number;
  costPerQualifiedLead: number;
  totalSpend: number;
  estimatedRevenue: number;
  roi: number;
  platformBreakdown: Array<{
    platform: string;
    leads: number;
    spend: number;
    revenue: number;
    roi: number;
  }>;
}

interface RealtimeAnalytics {
  currentLeads: number;
  hourlyQualifications: number;
  pixelSyncsInProgress: number;
  averageProcessingTime: number;
  qualityDistribution: Record<string, number>;
  platformActivity: Array<{
    platform: string;
    activity: number;
    status: 'healthy' | 'warning' | 'error';
  }>;
}

const AdvancedLeadAnalyticsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [lifecycleData, setLifecycleData] = useState<LeadLifecycleAnalytics | null>(null);
  const [roiData, setROIData] = useState<ROIAnalytics | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'roi' | 'realtime'>('lifecycle');

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' }
  ];

  useEffect(() => {
    fetchAllAnalytics();
    
    // Set up real-time data refresh
    const realtimeInterval = setInterval(() => {
      if (activeTab === 'realtime') {
        fetchRealtimeAnalytics();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(realtimeInterval);
  }, [dateRange, activeTab]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const dateParams = `startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`;

      const [lifecycleResponse, roiResponse, realtimeResponse] = await Promise.all([
        fetch(`/api/analytics/lifecycle?${dateParams}`),
        fetch(`/api/analytics/roi?${dateParams}`),
        fetch('/api/analytics/realtime')
      ]);

      const [lifecycleResult, roiResult, realtimeResult] = await Promise.all([
        lifecycleResponse.json(),
        roiResponse.json(),
        realtimeResponse.json()
      ]);

      if (lifecycleResult.success) {
        setLifecycleData(lifecycleResult.data);
      }
      
      if (roiResult.success) {
        setROIData(roiResult.data);
      }
      
      if (realtimeResult.success) {
        setRealtimeData(realtimeResult.data);
      }

      if (!lifecycleResult.success || !roiResult.success || !realtimeResult.success) {
        throw new Error('Failed to fetch some analytics data');
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/realtime');
      const result = await response.json();
      
      if (result.success) {
        setRealtimeData(result.data);
      }
    } catch (error) {
      console.error('Error fetching realtime analytics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllAnalytics();
    setRefreshing(false);
    showToast({
      title: 'Analytics Refreshed',
      message: 'Latest analytics data has been loaded',
      variant: 'success'
    });
  };

  const calculateFunnelTotalDrop = () => {
    if (!lifecycleData?.funnelAnalysis?.length) return 0;
    const first = lifecycleData.funnelAnalysis[0];
    const last = lifecycleData.funnelAnalysis[lifecycleData.funnelAnalysis.length - 1];
    if (!first || !last) return 0;
    return ((first.leadsEntered - last.leadsExited) / first.leadsEntered * 100);
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="absolute inset-0 bg-black" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Advanced Lead Analytics</h1>
            <p className="text-gray-400">Advanced performance insights</p>
          </div>
          <Alert variant="error" title="Error Loading Analytics">
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <AppShell 
      headerActions={
            <div className="flex gap-2">
              <FormField label="">
                <Select
                  options={dateRangeOptions}
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                />
              </FormField>
              <NeonButton 
                variant="secondary" 
                onClick={handleRefresh}
                loading={refreshing}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </NeonButton>
              <NeonButton onClick={() => router.push('/leads')}>
                Back to Leads
              </NeonButton>
            </div>
      }
    >
      <div className="p-6 space-y-8 max-w-7xl mx-auto">

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'lifecycle'
                ? 'bg-neon-green text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Lifecycle Analysis
          </button>
          <button
            onClick={() => setActiveTab('roi')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'roi'
                ? 'bg-neon-green text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            ROI & Financial
          </button>
          <button
            onClick={() => setActiveTab('realtime')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'realtime'
                ? 'bg-neon-green text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Real-time Dashboard
          </button>
        </div>

        {loading ? (
          <GlassCard className="p-12">
            <Loading message="Loading advanced analytics..." size="lg" />
          </GlassCard>
        ) : (
          <div className="space-y-8">
            {/* Lifecycle Analysis Tab */}
            {activeTab === 'lifecycle' && lifecycleData && (
              <div className="space-y-8">
                {/* Conversion Funnel */}
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Conversion Funnel Analysis</h3>
                    <Badge variant="warning">
                      {calculateFunnelTotalDrop().toFixed(1)}% total drop-off
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {lifecycleData.funnelAnalysis.map((stage, index) => (
                      <div key={stage.stage} className="relative">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center text-black font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{stage.stage}</h4>
                              <p className="text-sm text-gray-400">
                                Avg time: {stage.averageTimeInStage.toFixed(1)} hours
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm text-gray-400">Entered</p>
                              <p className="font-semibold text-white">{stage.leadsEntered.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-400">Exited</p>
                              <p className="font-semibold text-white">{stage.leadsExited.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-400">Conversion Rate</p>
                              <p className="font-semibold text-neon-green">
                                {(stage.conversionRate * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {stage.dropOffReasons.length > 0 && (
                          <div className="mt-2 ml-12 flex gap-2">
                            {stage.dropOffReasons.map((reason, reasonIndex) => (
                              <Badge key={reasonIndex} variant="error" size="sm">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Top Performing Sources */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Top Performing Sources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lifecycleData.topPerformingSources.map((source, index) => (
                      <div key={source.source} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white">{source.source}</h4>
                          <Badge variant={index === 0 ? 'success' : index === 1 ? 'neon' : 'default'}>
                            #{index + 1}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400">Leads</p>
                            <p className="font-semibold text-white">{source.leads}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Qualification Rate</p>
                            <p className="font-semibold text-neon-green">
                              {(source.qualificationRate * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Avg Credit Score</p>
                            <p className="font-semibold text-white">{source.avgCreditScore}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Conversion Trends */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Conversion Trends</h3>
                  <div className="h-64 flex items-end gap-2">
                    {lifecycleData.conversionTrends.slice(-14).map((trend, index) => (
                      <div key={trend.date} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-neon-green/30 rounded-t"
                          style={{
                            height: `${(trend.conversionRate * 200)}px`,
                            minHeight: '4px'
                          }}
                        />
                        <div className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-left">
                          {new Date(trend.date).getDate()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between text-sm text-gray-400">
                    <span>Conversion Rate Trend (Last 14 Days)</span>
                    <span>Higher bars = Better conversion</span>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* ROI Analysis Tab */}
            {activeTab === 'roi' && roiData && (
              <div className="space-y-8">
                {/* ROI Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <StatCard
                    title="Total ROI"
                    value={`${(roiData.roi * 100).toFixed(1)}%`}
                    icon="📈"
                    variant={roiData.roi > 1 ? 'success' : roiData.roi > 0.5 ? 'warning' : 'error'}
                    description={`${roiData.period}`}
                  />
                  <StatCard
                    title="Cost Per Lead"
                    value={`$${roiData.costPerLead.toFixed(2)}`}
                    icon="💰"
                    variant="default"
                    description={`${roiData.totalLeads.toLocaleString()} total leads`}
                  />
                  <StatCard
                    title="Cost Per Qualified"
                    value={`$${roiData.costPerQualifiedLead.toFixed(2)}`}
                    icon="🎯"
                    variant="neon"
                    description={`${roiData.qualifiedLeads.toLocaleString()} qualified`}
                  />
                  <StatCard
                    title="Estimated Revenue"
                    value={`$${roiData.estimatedRevenue.toLocaleString()}`}
                    icon="💎"
                    variant="success"
                    description={`$${roiData.totalSpend.toLocaleString()} invested`}
                  />
                </div>

                {/* Platform ROI Breakdown */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Platform ROI Breakdown</h3>
                  <div className="space-y-4">
                    {roiData.platformBreakdown.map((platform) => (
                      <div key={platform.platform} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white">{platform.platform}</h4>
                          <Badge 
                            variant={platform.roi > 2 ? 'success' : platform.roi > 1 ? 'neon' : 'warning'}
                          >
                            {(platform.roi * 100).toFixed(0)}% ROI
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Leads</p>
                            <p className="font-semibold text-white">{platform.leads.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Spend</p>
                            <p className="font-semibold text-white">${platform.spend.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Revenue</p>
                            <p className="font-semibold text-neon-green">${platform.revenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Profit</p>
                            <p className={`font-semibold ${
                              platform.revenue > platform.spend ? 'text-neon-green' : 'text-red-400'
                            }`}>
                              ${(platform.revenue - platform.spend).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Real-time Dashboard Tab */}
            {activeTab === 'realtime' && realtimeData && (
              <div className="space-y-8">
                {/* Real-time Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <StatCard
                    title="Current Leads"
                    value={realtimeData.currentLeads.toLocaleString()}
                    icon="👥"
                    variant="neon"
                    description="Active in system"
                  />
                  <StatCard
                    title="Hourly Qualified"
                    value={realtimeData.hourlyQualifications}
                    icon="⚡"
                    variant="success"
                    description="Last hour"
                  />
                  <StatCard
                    title="Syncs in Progress"
                    value={realtimeData.pixelSyncsInProgress}
                    icon="🔄"
                    variant="warning"
                    description="Active sync operations"
                  />
                  <StatCard
                    title="Avg Processing"
                    value={`${realtimeData.averageProcessingTime.toFixed(1)}s`}
                    icon="⏱️"
                    variant="default"
                    description="Processing time"
                  />
                </div>

                {/* Quality Distribution */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Live Quality Distribution</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(realtimeData.qualityDistribution).map(([tier, count]) => (
                      <div key={tier} className="p-4 bg-white/5 rounded-lg text-center">
                        <p className="text-sm text-gray-400 mb-2">{tier}</p>
                        <p className="text-2xl font-bold text-white">{count}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Platform Activity */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Platform Activity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {realtimeData.platformActivity.map((platform) => (
                      <div key={platform.platform} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white">{platform.platform}</h4>
                          <Badge 
                            variant={
                              platform.status === 'healthy' ? 'success' : 
                              platform.status === 'warning' ? 'warning' : 
                              'error'
                            }
                            dot
                          >
                            {platform.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Activity Score</p>
                          <p className="text-xl font-bold text-neon-green">{platform.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Story 2.5 Feature Showcase */}
            <GlassCard className="p-6 border border-neon-green/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">2.5</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Story 2.5: Advanced Analytics Features</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm" dot>Complete</Badge>
                  <span className="text-gray-300">Conversion Funnel Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm" dot>Complete</Badge>
                  <span className="text-gray-300">ROI & Cost Calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm" dot>Complete</Badge>
                  <span className="text-gray-300">Real-time Analytics Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neon" size="sm" dot>Active</Badge>
                  <span className="text-gray-300">Performance Insights Engine</span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default function AdvancedLeadAnalyticsPageWrapper() {
  return (
    <ToastProvider>
      <AdvancedLeadAnalyticsPage />
    </ToastProvider>
  );
}