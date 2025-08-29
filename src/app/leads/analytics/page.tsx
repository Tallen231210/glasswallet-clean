'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { getLeadStats, mockPerformanceData } from '@/lib/mockData';

export default function LeadsAnalyticsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const stats = getLeadStats();
  const performance = mockPerformanceData;

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Lead Analytics</h1>
            <p className="text-gray-400">Comprehensive insights into lead performance and conversion trends</p>
          </div>
          <div className="flex gap-3">
            <NeonButton variant="secondary" onClick={() => router.push('/leads')}>
              Back to Leads
            </NeonButton>
            <NeonButton onClick={() => router.push('/leads/advanced-analytics')}>
              Advanced Analytics
            </NeonButton>
          </div>
        </div>

        {/* Period Selector */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Analytics Period</h3>
            <div className="flex gap-2">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-neon-green text-black'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Leads"
            value={stats.total}
            description="All time"
            icon="👥"
            variant="default"
            trend="+12% this period"
          />
          <StatCard
            title="Qualified Rate"
            value={`${stats.conversionRate}%`}
            description="Conversion rate"
            icon="✅"
            variant="success"
            trend="+5% improvement"
          />
          <StatCard
            title="Avg Credit Score"
            value={stats.avgCreditScore}
            description="Quality indicator"
            icon="📊"
            variant="neon"
            trend="+15 points"
          />
          <StatCard
            title="Revenue Impact"
            value="$247K"
            description="Generated revenue"
            icon="💰"
            variant="success"
            trend="+23% increase"
          />
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Lead Status Distribution */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Lead Status Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Qualified ({stats.qualified})</span>
                </div>
                <Badge variant="success">{Math.round((stats.qualified / stats.total) * 100)}%</Badge>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.qualified / stats.total) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-300">Processing ({stats.processing})</span>
                </div>
                <Badge variant="warning">{Math.round((stats.processing / stats.total) * 100)}%</Badge>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(stats.processing / stats.total) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-neon-green rounded-full"></div>
                  <span className="text-gray-300">Completed ({stats.completed})</span>
                </div>
                <Badge variant="neon">{Math.round((stats.completed / stats.total) * 100)}%</Badge>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-neon-green h-2 rounded-full" 
                  style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">New ({stats.new})</span>
                </div>
                <Badge variant="default">{Math.round((stats.new / stats.total) * 100)}%</Badge>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(stats.new / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Top Performers */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Top Performing Sources</h3>
            <div className="space-y-4">
              {performance.topPerformers.slice(0, 4).map((performer, index) => (
                <div key={performer.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center text-xs font-bold text-neon-green">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{performer.name}</p>
                      <p className="text-xs text-gray-400">{performer.leads} leads</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neon-green">{Math.round(performer.conversionRate * 100)}%</p>
                    <p className="text-xs text-gray-400">${performer.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Performance Goals */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">📊 Monthly Performance Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Leads Goal</span>
                <span className="text-white font-medium">
                  {performance.monthlyGoals.leadsActual} / {performance.monthlyGoals.leadsGoal}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-neon-green h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(performance.monthlyGoals.leadsActual / performance.monthlyGoals.leadsGoal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {Math.round((performance.monthlyGoals.leadsActual / performance.monthlyGoals.leadsGoal) * 100)}% of monthly target
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Qualification Rate</span>
                <span className="text-white font-medium">
                  {Math.round(performance.monthlyGoals.qualificationActual * 100)}% / {Math.round(performance.monthlyGoals.qualificationGoal * 100)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(performance.monthlyGoals.qualificationActual / performance.monthlyGoals.qualificationGoal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {Math.round((performance.monthlyGoals.qualificationActual / performance.monthlyGoals.qualificationGoal) * 100)}% of target rate
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Revenue Goal</span>
                <span className="text-white font-medium">
                  ${performance.monthlyGoals.revenueActual.toLocaleString()} / ${performance.monthlyGoals.revenueGoal.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(performance.monthlyGoals.revenueActual / performance.monthlyGoals.revenueGoal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {Math.round((performance.monthlyGoals.revenueActual / performance.monthlyGoals.revenueGoal) * 100)}% of revenue target
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📈 Analytics Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NeonButton variant="secondary" className="flex items-center gap-2 justify-center p-4">
              <span>📊</span>
              Export Report
            </NeonButton>
            <NeonButton variant="secondary" className="flex items-center gap-2 justify-center p-4">
              <span>📧</span>
              Schedule Report
            </NeonButton>
            <NeonButton variant="secondary" className="flex items-center gap-2 justify-center p-4">
              <span>🎯</span>
              Set Goals
            </NeonButton>
            <NeonButton variant="secondary" className="flex items-center gap-2 justify-center p-4">
              <span>📈</span>
              View Trends
            </NeonButton>
          </div>
        </GlassCard>

      </div>
    </AppLayout>
  );
}