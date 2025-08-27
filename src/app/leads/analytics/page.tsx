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
  FormField,
  Progress
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

const LeadAnalyticsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [lifecycleData, setLifecycleData] = useState<LeadLifecycleAnalytics | null>(null);
  const [roiData, setROIData] = useState<ROIAnalytics | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [period, setPeriod] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'roi' | 'realtime'>('lifecycle');

  const periodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  // Mock analytics data for UI rendering
  const analytics = {
    overview: {
      totalLeads: 2847,
      processedLeads: 2341,
      qualifiedLeads: 1642,
      unqualifiedLeads: 699,
      whitelistedLeads: 234,
      blacklistedLeads: 47,
      totalCostSpent: 5847200, // in cents
      averageCreditScore: 724
    },
    creditScoreDistribution: [
      { range: '300-549', count: 234, percentage: 8.2 },
      { range: '550-649', count: 567, percentage: 19.9 },
      { range: '650-749', count: 1204, percentage: 42.3 },
      { range: '750-850', count: 842, percentage: 29.6 }
    ],
    tagDistribution: [
      { tagType: 'High Quality', count: 847, color: 'success', percentage: 29.8 },
      { tagType: 'Good', count: 1204, color: 'warning', percentage: 42.3 },
      { tagType: 'Poor Credit', count: 324, color: 'error', percentage: 11.4 },
      { tagType: 'Auto-Approved', count: 472, color: 'neon', percentage: 16.6 }
    ],
    recentActivity: [
      { date: '2024-01-15T10:30:00Z', action: 'New lead added', leadName: 'John Smith', details: 'Credit score: 724' },
      { date: '2024-01-15T10:25:00Z', action: 'Lead qualified', leadName: 'Sarah Johnson', details: 'Auto-approved' },
      { date: '2024-01-15T10:20:00Z', action: 'Credit pull completed', leadName: 'Mike Davis', details: 'Score: 686' },
      { date: '2024-01-15T10:15:00Z', action: 'Tag applied', leadName: 'Lisa Brown', details: 'Tagged as High Quality' }
    ]
  };

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
        <div className="flex gap-2 items-center">
          <div className="w-48">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={periodOptions}
            />
          </div>
          <NeonButton variant="secondary" onClick={() => router.push('/leads')}>
            Back to Leads
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-8 max-w-7xl mx-auto">

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Leads"
            value={analytics.overview.totalLeads}
            icon="👥"
            variant="default"
          />
          <StatCard
            title="Processed"
            value={analytics.overview.processedLeads}
            change={{ 
              value: 82.3, 
              type: 'positive',
              period: 'processing rate'
            }}
            icon="✅"
            variant="success"
          />
          <StatCard
            title="Qualified"
            value={analytics.overview.qualifiedLeads}
            change={{ 
              value: 57.7, 
              type: 'increase',
              period: 'qualification rate'
            }}
            icon="⭐"
            variant="neon"
          />
          <StatCard
            title="Total Cost"
            value={`$${(analytics.overview.totalCostSpent / 100).toFixed(2)}`}
            icon="💰"
            variant="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Key Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credit Score Performance */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-3">
                Credit Score Performance
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Average Credit Score</h4>
                  <div className="text-2xl font-bold text-white">
                    {analytics.overview.averageCreditScore ? (
                      <>
                        {analytics.overview.averageCreditScore}
                        <Badge 
                          variant={analytics.overview.averageCreditScore >= 650 ? 'success' : 'warning'}
                          className="ml-3"
                        >
                          {analytics.overview.averageCreditScore >= 750 ? 'Excellent' :
                           analytics.overview.averageCreditScore >= 700 ? 'Good' :
                           analytics.overview.averageCreditScore >= 650 ? 'Fair' : 'Poor'}
                        </Badge>
                      </>
                    ) : '—'}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Leads with Credit Data</h4>
                  <div className="text-2xl font-bold text-white">
                    {analytics.creditScoreDistribution.reduce((sum, item) => sum + item.count, 0)}
                    <span className="text-sm text-gray-400 ml-2">
                      of {analytics.overview.totalLeads}
                    </span>
                  </div>
                </div>
              </div>

              {/* Credit Score Distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-4">Score Distribution</h4>
                <div className="space-y-3">
                  {analytics.creditScoreDistribution.map((item) => (
                    <div key={item.range} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium w-20">{item.range}</span>
                        <div className="flex-1">
                          <Progress 
                            value={item.percentage} 
                            variant="success"
                            size="sm"
                            className="w-32"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">{item.count}</span>
                        <Badge variant="default" size="sm">
                          {item.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Lead Classification */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-3">
                Lead Classification
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {analytics.overview.qualifiedLeads}
                  </div>
                  <div className="text-sm text-gray-400">Qualified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {analytics.overview.unqualifiedLeads}
                  </div>
                  <div className="text-sm text-gray-400">Unqualified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-green">
                    {analytics.overview.whitelistedLeads}
                  </div>
                  <div className="text-sm text-gray-400">Whitelisted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {analytics.overview.blacklistedLeads}
                  </div>
                  <div className="text-sm text-gray-400">Blacklisted</div>
                </div>
              </div>

              {/* Tag Distribution */}
              {analytics.tagDistribution.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-4">Tag Distribution</h4>
                  <div className="space-y-2">
                    {analytics.tagDistribution.map((item) => (
                      <div key={item.tagType} className="flex items-center justify-between">
                        <Badge 
                          variant={item.color as any}
                          dot
                        >
                          {item.tagType}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">{item.count}</span>
                          <Badge variant="default" size="sm">
                            {item.percentage}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Recent Activity */}
          <div>
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-3">
                Recent Activity
              </h3>
              
              <div className="space-y-4">
                {analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={
                            activity.action === 'Lead Created' ? 'default' :
                            activity.action === 'Credit Pull' ? 'warning' :
                            activity.action === 'Tag Applied' ? 'neon' : 'default'
                          }
                          size="sm"
                        >
                          {activity.action}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-white font-medium">
                        {activity.leadName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {activity.details}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No recent activity</p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default function LeadAnalyticsPageWrapper() {
  return (
    <ToastProvider>
      <LeadAnalyticsPage />
    </ToastProvider>
  );
}