'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

// Mock analytics data
const mockAnalyticsData = {
  overview: {
    totalClients: 1247,
    totalLeads: 895420,
    totalRevenue: 2847650,
    avgConversionRate: 14.2,
    pixelConnections: 3891,
    widgetDeployments: 1566
  },
  timeSeriesData: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    revenue: [180000, 195000, 210000, 245000, 268000, 290000, 315000, 345000],
    leads: [68000, 71000, 75000, 82000, 89000, 95000, 103000, 112000],
    clients: [145, 162, 189, 234, 267, 298, 334, 367]
  },
  platformAnalytics: [
    {
      platform: 'Meta',
      icon: '📘',
      clients: 456,
      totalLeads: 342890,
      conversionRate: 16.8,
      revenue: 1240500,
      growthRate: 12.4,
      avgCostPerLead: 3.62,
      avgLifetimeValue: 287.50,
      topPerformingClient: 'TechFlow Solutions'
    },
    {
      platform: 'Google Ads',
      icon: '🔍',
      clients: 398,
      totalLeads: 289650,
      conversionRate: 14.2,
      revenue: 987420,
      growthRate: 8.7,
      avgCostPerLead: 3.41,
      avgLifetimeValue: 248.30,
      topPerformingClient: 'DataDriven Corp'
    },
    {
      platform: 'TikTok',
      icon: '🎵',
      clients: 287,
      totalLeads: 162880,
      conversionRate: 11.9,
      revenue: 519730,
      growthRate: 15.8,
      avgCostPerLead: 3.19,
      avgLifetimeValue: 181.90,
      topPerformingClient: 'ScaleUp Ventures'
    }
  ],
  clientSegmentation: {
    byPlan: [
      { plan: 'Enterprise', count: 67, revenue: 1895600, avgMonthly: 28288, color: '#ff6b6b' },
      { plan: 'Professional', count: 234, revenue: 759200, avgMonthly: 3244, color: '#4ecdc4' },
      { plan: 'Starter', count: 946, revenue: 192850, avgMonthly: 204, color: '#45b7d1' }
    ],
    byIndustry: [
      { industry: 'Financial Services', count: 298, revenue: 1245800, percentage: 23.9 },
      { industry: 'E-commerce', count: 267, revenue: 892400, percentage: 21.4 },
      { industry: 'SaaS', count: 189, revenue: 567200, percentage: 15.2 },
      { industry: 'Real Estate', count: 156, revenue: 398100, percentage: 12.5 },
      { industry: 'Healthcare', count: 142, revenue: 287900, percentage: 11.4 },
      { industry: 'Other', count: 195, revenue: 456250, percentage: 15.6 }
    ]
  },
  performanceMetrics: {
    topClients: [
      {
        id: 'client-001',
        name: 'TechFlow Solutions',
        plan: 'Enterprise',
        monthlyRevenue: 45600,
        totalLeads: 15420,
        conversionRate: 18.9,
        growth: 23.4
      },
      {
        id: 'client-002',
        name: 'DataDriven Corp',
        plan: 'Enterprise',
        monthlyRevenue: 38900,
        totalLeads: 12890,
        conversionRate: 16.7,
        growth: 18.2
      },
      {
        id: 'client-003',
        name: 'GrowthHacker Inc',
        plan: 'Professional',
        monthlyRevenue: 12400,
        totalLeads: 8934,
        conversionRate: 14.2,
        growth: 31.8
      },
      {
        id: 'client-004',
        name: 'ScaleUp Ventures',
        plan: 'Professional',
        monthlyRevenue: 9800,
        totalLeads: 7650,
        conversionRate: 13.8,
        growth: 15.7
      }
    ],
    systemPerformance: {
      averageApiResponseTime: 145,
      systemUptime: 99.97,
      errorRate: 0.02,
      peakConcurrentUsers: 2847,
      dataProcessingSpeed: 15670,
      storageUsed: 2.8,
      bandwidthUsed: 847.2
    }
  },
  revenueAnalysis: {
    mrr: 247850,
    arr: 2974200,
    churnRate: 2.1,
    expansionRate: 18.7,
    cac: 127.50,
    ltv: 3420.80,
    ltvCacRatio: 26.8,
    paybackPeriod: 4.2
  },
  regionalData: [
    { region: 'North America', clients: 567, revenue: 1547800, percentage: 45.5 },
    { region: 'Europe', clients: 398, revenue: 892400, percentage: 26.1 },
    { region: 'Asia Pacific', clients: 189, revenue: 287900, percentage: 15.2 },
    { region: 'Latin America', clients: 67, revenue: 89500, percentage: 8.9 },
    { region: 'Africa/Middle East', clients: 26, revenue: 30050, percentage: 4.3 }
  ]
};

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 15) return 'text-green-400';
    if (growth > 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '📈';
    return '📉';
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between space-component">
          <div className="space-element">
            <h1 className="text-heading text-white mb-2">📊 Advanced Analytics</h1>
            <p className="text-body-large text-gray-400 max-w-2xl">
              Comprehensive analytics and reporting across all platform metrics, clients, and business intelligence
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-gray-800 border border-white/20 text-white rounded px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="12m">Last 12 Months</option>
            </select>
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/admin/reports')}
            >
              📄 Generate Report
            </NeonButton>
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/admin/dashboard')}
            >
              ← Back to Admin
            </NeonButton>
          </div>
        </div>
        
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <StatCard
            title="Total Clients"
            value={formatNumber(mockAnalyticsData.overview.totalClients)}
            description="Active accounts"
            icon="👥"
            variant="default"
            trend="+12% this month"
          />
          <StatCard
            title="Total Leads"
            value={formatNumber(mockAnalyticsData.overview.totalLeads)}
            description="All-time processed"
            icon="🎯"
            variant="neon"
            trend="+2.4K today"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(mockAnalyticsData.overview.totalRevenue)}
            description="All-time ARR"
            icon="💰"
            variant="success"
            trend="+18.7% MoM"
          />
          <StatCard
            title="Avg Conversion"
            value={`${mockAnalyticsData.overview.avgConversionRate}%`}
            description="Platform average"
            icon="📈"
            variant="success"
            trend="+1.2% this month"
          />
          <StatCard
            title="Pixel Connections"
            value={formatNumber(mockAnalyticsData.overview.pixelConnections)}
            description="Active integrations"
            icon="🔌"
            variant="neon"
            trend="+47 this week"
          />
          <StatCard
            title="Widget Deployments"
            value={formatNumber(mockAnalyticsData.overview.widgetDeployments)}
            description="Live widgets"
            icon="🔧"
            variant="default"
            trend="+23 today"
          />
        </div>

        {/* Revenue Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 col-span-2">
            <h3 className="text-lg font-semibold text-white mb-6">Revenue Analysis & SaaS Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green mb-1">
                  {formatCurrency(mockAnalyticsData.revenueAnalysis.mrr)}
                </div>
                <div className="text-sm text-gray-400">Monthly Recurring Revenue</div>
                <div className="text-xs text-green-400 mt-1">+12.4% MoM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(mockAnalyticsData.revenueAnalysis.arr)}
                </div>
                <div className="text-sm text-gray-400">Annual Recurring Revenue</div>
                <div className="text-xs text-green-400 mt-1">+18.7% YoY</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {mockAnalyticsData.revenueAnalysis.churnRate}%
                </div>
                <div className="text-sm text-gray-400">Churn Rate</div>
                <div className="text-xs text-green-400 mt-1">-0.3% this month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {mockAnalyticsData.revenueAnalysis.ltvCacRatio.toFixed(1)}:1
                </div>
                <div className="text-sm text-gray-400">LTV:CAC Ratio</div>
                <div className="text-xs text-green-400 mt-1">Target: &gt;3:1</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Customer Acquisition Cost</div>
                <div className="text-xl font-semibold text-white">
                  {formatCurrency(mockAnalyticsData.revenueAnalysis.cac)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Customer Lifetime Value</div>
                <div className="text-xl font-semibold text-white">
                  {formatCurrency(mockAnalyticsData.revenueAnalysis.ltv)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Payback Period</div>
                <div className="text-xl font-semibold text-white">
                  {mockAnalyticsData.revenueAnalysis.paybackPeriod} months
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Client Distribution by Plan</h3>
            <div className="space-y-4">
              {mockAnalyticsData.clientSegmentation.byPlan.map((plan) => (
                <div key={plan.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    />
                    <div>
                      <div className="text-white font-medium">{plan.plan}</div>
                      <div className="text-sm text-gray-400">{plan.count} clients</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{formatCurrency(plan.revenue)}</div>
                    <div className="text-sm text-gray-400">
                      {formatCurrency(plan.avgMonthly)}/mo avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Platform Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mockAnalyticsData.platformAnalytics.map((platform) => (
            <GlassCard key={platform.platform} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{platform.icon}</span>
                <h3 className="text-lg font-semibold text-white">{platform.platform} Analytics</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Clients</div>
                    <div className="text-lg font-semibold text-white">{formatNumber(platform.clients)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total Leads</div>
                    <div className="text-lg font-semibold text-neon-green">{formatNumber(platform.totalLeads)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Conversion Rate</div>
                    <div className="text-lg font-semibold text-white">{platform.conversionRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Revenue</div>
                    <div className="text-lg font-semibold text-white">{formatCurrency(platform.revenue)}</div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Growth Rate</span>
                    <span className={`text-sm font-medium ${getGrowthColor(platform.growthRate)}`}>
                      {getGrowthIcon(platform.growthRate)} {platform.growthRate}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-gray-400">Avg Cost/Lead</div>
                      <div className="text-white font-medium">${platform.avgCostPerLead}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Avg LTV</div>
                      <div className="text-white font-medium">${platform.avgLifetimeValue}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="text-xs text-blue-200 font-medium mb-1">Top Performer</div>
                  <div className="text-sm text-white">{platform.topPerformingClient}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Top Clients Performance */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Top Performing Clients</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Monthly Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Total Leads</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Conversion Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Growth</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockAnalyticsData.performanceMetrics.topClients.map((client) => (
                  <tr key={client.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{client.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant={client.plan === 'Enterprise' ? 'error' : 'neon'} size="sm">
                        {client.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-neon-green font-medium">
                      {formatCurrency(client.monthlyRevenue)}
                    </td>
                    <td className="py-3 px-4 text-white">{formatNumber(client.totalLeads)}</td>
                    <td className="py-3 px-4 text-white">{client.conversionRate}%</td>
                    <td className="py-3 px-4">
                      <span className={getGrowthColor(client.growth)}>
                        {getGrowthIcon(client.growth)} {client.growth}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <NeonButton 
                        size="sm" 
                        variant="secondary"
                        onClick={() => router.push(`/admin/clients/${client.id}`)}
                      >
                        View Details
                      </NeonButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Regional Distribution & System Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Regional Distribution</h3>
            <div className="space-y-4">
              {mockAnalyticsData.regionalData.map((region) => (
                <div key={region.region} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{region.region}</span>
                      <span className="text-sm text-gray-400">{region.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-neon-green to-blue-400 h-2 rounded-full"
                        style={{ width: `${region.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>{region.clients} clients</span>
                      <span>{formatCurrency(region.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Performance</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-sm text-gray-400">API Response Time</div>
                  <div className="text-lg font-semibold text-white">
                    {mockAnalyticsData.performanceMetrics.systemPerformance.averageApiResponseTime}ms
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-sm text-gray-400">System Uptime</div>
                  <div className="text-lg font-semibold text-green-400">
                    {mockAnalyticsData.performanceMetrics.systemPerformance.systemUptime}%
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-sm text-gray-400">Error Rate</div>
                  <div className="text-lg font-semibold text-green-400">
                    {mockAnalyticsData.performanceMetrics.systemPerformance.errorRate}%
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-sm text-gray-400">Peak Users</div>
                  <div className="text-lg font-semibold text-white">
                    {formatNumber(mockAnalyticsData.performanceMetrics.systemPerformance.peakConcurrentUsers)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-center">
                  <div className="text-blue-200">Processing Speed</div>
                  <div className="text-white font-medium">
                    {formatNumber(mockAnalyticsData.performanceMetrics.systemPerformance.dataProcessingSpeed)} req/min
                  </div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2 text-center">
                  <div className="text-purple-200">Storage Used</div>
                  <div className="text-white font-medium">
                    {mockAnalyticsData.performanceMetrics.systemPerformance.storageUsed}TB
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded p-2 text-center">
                  <div className="text-green-200">Bandwidth</div>
                  <div className="text-white font-medium">
                    {mockAnalyticsData.performanceMetrics.systemPerformance.bandwidthUsed}GB/day
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}