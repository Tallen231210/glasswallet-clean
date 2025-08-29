'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

// Mock analytics data
const mockWidgetAnalytics = {
  overview: {
    totalWidgets: 5,
    activeWidgets: 4,
    totalLeads: 1247,
    totalConversions: 156,
    avgConversionRate: 12.5,
    totalRevenue: 45600,
    avgRevenuePerLead: 36.57
  },
  topPerformingWidgets: [
    {
      id: 'widget-001',
      name: 'Homepage Hero CTA',
      leads: 456,
      conversions: 68,
      conversionRate: 14.9,
      revenue: 18240,
      avgRevenue: 268.24,
      changePercent: +8.3
    },
    {
      id: 'widget-002',
      name: 'Pricing Page Form',
      leads: 234,
      conversions: 45,
      conversionRate: 19.2,
      revenue: 15300,
      avgRevenue: 340.00,
      changePercent: +12.1
    },
    {
      id: 'widget-003',
      name: 'Blog Sidebar CTA',
      leads: 334,
      conversions: 28,
      conversionRate: 8.4,
      revenue: 7560,
      avgRevenue: 270.00,
      changePercent: -2.4
    },
    {
      id: 'widget-004',
      name: 'Exit Intent Popup',
      leads: 123,
      conversions: 12,
      conversionRate: 9.8,
      revenue: 3240,
      avgRevenue: 270.00,
      changePercent: +5.7
    },
    {
      id: 'widget-005',
      name: 'Footer Newsletter',
      leads: 100,
      conversions: 3,
      conversionRate: 3.0,
      revenue: 1260,
      avgRevenue: 420.00,
      changePercent: -1.2
    }
  ],
  performanceMetrics: {
    dailyLeads: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      leads: Math.floor(Math.random() * 50) + 20,
      conversions: Math.floor(Math.random() * 15) + 2
    })),
    conversionFunnel: [
      { stage: 'Widget Views', count: 15847, percentage: 100 },
      { stage: 'Form Started', count: 3256, percentage: 20.5 },
      { stage: 'Form Completed', count: 1247, percentage: 7.9 },
      { stage: 'Qualified Leads', count: 498, percentage: 3.1 },
      { stage: 'Sales Conversions', count: 156, percentage: 1.0 }
    ],
    topSources: [
      { source: 'Organic Search', leads: 456, percentage: 36.6 },
      { source: 'Direct Traffic', leads: 334, percentage: 26.8 },
      { source: 'Social Media', leads: 234, percentage: 18.8 },
      { source: 'Paid Ads', leads: 123, percentage: 9.9 },
      { source: 'Email Campaign', leads: 100, percentage: 8.0 }
    ]
  },
  roiAnalysis: {
    totalInvestment: 12500, // Ad spend + platform costs
    totalRevenue: 45600,
    netProfit: 33100,
    roiPercentage: 264.8,
    paybackPeriod: 18, // days
    ltv: 890, // lifetime value
    cac: 80, // customer acquisition cost
    ltvToCAC: 11.1
  }
};

export default function WidgetAnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'leads' | 'conversions' | 'revenue'>('leads');

  const analytics = mockWidgetAnalytics;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between space-component">
          <div className="space-element">
            <h1 className="text-heading text-white mb-2">📊 Widget Analytics</h1>
            <p className="text-body-large text-gray-400 max-w-2xl">
              Comprehensive performance analytics and ROI tracking for your JavaScript widgets
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    timeRange === range
                      ? 'bg-neon-green text-black'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {range === '7d' ? '7 Days' :
                   range === '30d' ? '30 Days' :
                   range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
            <NeonButton onClick={() => router.push('/widgets')}>
              Back to Widgets
            </NeonButton>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Leads"
            value={analytics.overview.totalLeads.toLocaleString()}
            description="Via widgets"
            icon="👥"
            variant="default"
            trend="+23% vs last period"
          />
          <StatCard
            title="Conversions"
            value={analytics.overview.totalConversions.toLocaleString()}
            description={`${analytics.overview.avgConversionRate}% rate`}
            icon="🎯"
            variant="success"
            trend="+8.4% vs last period"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(analytics.overview.totalRevenue)}
            description="From widget leads"
            icon="💰"
            variant="neon"
            trend="+15.2% vs last period"
          />
          <StatCard
            title="ROI"
            value={`${analytics.roiAnalysis.roiPercentage}%`}
            description={`${analytics.roiAnalysis.paybackPeriod}d payback`}
            icon="📈"
            variant="success"
            trend="+12.8% vs last period"
          />
        </div>

        {/* Performance Chart */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Performance Over Time</h2>
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              {(['leads', 'conversions', 'revenue'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                    selectedMetric === metric
                      ? 'bg-neon-green text-black'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>

          {/* Simple chart visualization */}
          <div className="h-64 bg-white/5 rounded-lg flex items-end justify-between p-4 gap-1">
            {analytics.performanceMetrics.dailyLeads.slice(-14).map((day, index) => {
              const maxValue = Math.max(...analytics.performanceMetrics.dailyLeads.map(d => 
                selectedMetric === 'leads' ? d.leads : 
                selectedMetric === 'conversions' ? d.conversions :
                d.conversions * 270 // Mock revenue calculation
              ));
              const value = selectedMetric === 'leads' ? day.leads : 
                           selectedMetric === 'conversions' ? day.conversions :
                           day.conversions * 270;
              const height = (value / maxValue) * 100;
              
              return (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-neon-green/60 to-neon-green/20 rounded-t min-h-[20px] relative group cursor-pointer"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br/>
                    {selectedMetric === 'revenue' ? formatCurrency(value) : value.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Widget Performance & Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Widgets */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Widget Performance</h3>
            <div className="space-y-4">
              {analytics.topPerformingWidgets.map((widget, index) => (
                <div key={widget.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-gray-400/20 text-gray-300' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/10 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{widget.name}</h4>
                      <p className="text-sm text-gray-400">
                        {widget.leads} leads • {widget.conversions} conversions
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-white">{widget.conversionRate}%</div>
                    <div className={`text-sm ${
                      widget.changePercent >= 0 ? 'text-neon-green' : 'text-red-400'
                    }`}>
                      {formatPercentage(widget.changePercent)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Conversion Funnel */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Conversion Funnel</h3>
            <div className="space-y-4">
              {analytics.performanceMetrics.conversionFunnel.map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{stage.stage}</span>
                    <span className="text-gray-400 text-sm">{stage.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-neon-green to-neon-green/60 rounded-full transition-all duration-500"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {stage.count.toLocaleString()} people
                  </div>
                  {index < analytics.performanceMetrics.conversionFunnel.length - 1 && (
                    <div className="flex justify-center mt-2">
                      <div className="w-0 h-0 border-l-2 border-r-2 border-l-transparent border-r-transparent border-t-4 border-t-gray-600"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ROI Analysis & Traffic Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ROI Analysis */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">ROI Analysis</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-neon-green">
                    {formatCurrency(analytics.roiAnalysis.totalRevenue)}
                  </div>
                  <div className="text-sm text-gray-400">Total Revenue</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(analytics.roiAnalysis.totalInvestment)}
                  </div>
                  <div className="text-sm text-gray-400">Total Investment</div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-neon-green/20 to-neon-green/10 rounded-lg border border-neon-green/30">
                <div className="text-3xl font-bold text-neon-green">
                  {analytics.roiAnalysis.roiPercentage}%
                </div>
                <div className="text-sm text-gray-300">Return on Investment</div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatCurrency(analytics.roiAnalysis.netProfit)} net profit
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">LTV/CAC Ratio:</span>
                  <span className="text-white font-semibold">{analytics.roiAnalysis.ltvToCAC}:1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payback Period:</span>
                  <span className="text-white font-semibold">{analytics.roiAnalysis.paybackPeriod} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg LTV:</span>
                  <span className="text-white font-semibold">{formatCurrency(analytics.roiAnalysis.ltv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg CAC:</span>
                  <span className="text-white font-semibold">{formatCurrency(analytics.roiAnalysis.cac)}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Traffic Sources */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Top Traffic Sources</h3>
            <div className="space-y-4">
              {analytics.performanceMetrics.topSources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-neon-green' :
                      index === 1 ? 'bg-blue-400' :
                      index === 2 ? 'bg-purple-400' :
                      index === 3 ? 'bg-yellow-400' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-white font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          index === 0 ? 'bg-neon-green' :
                          index === 1 ? 'bg-blue-400' :
                          index === 2 ? 'bg-purple-400' :
                          index === 3 ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <div className="text-right min-w-[4rem]">
                      <div className="text-white font-semibold">{source.leads}</div>
                      <div className="text-xs text-gray-400">{source.percentage}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Action Items */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">📋 Optimization Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400">✅</span>
                <span className="font-medium text-white">High Performance</span>
              </div>
              <p className="text-sm text-gray-300">
                Pricing Page Form has 19.2% conversion rate. Consider A/B testing similar design on other widgets.
              </p>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="font-medium text-white">Needs Attention</span>
              </div>
              <p className="text-sm text-gray-300">
                Footer Newsletter has low 3% conversion. Consider redesign or better positioning.
              </p>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400">💡</span>
                <span className="font-medium text-white">Opportunity</span>
              </div>
              <p className="text-sm text-gray-300">
                Blog Sidebar gets good traffic but lower conversions. Test different CTAs or offers.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}