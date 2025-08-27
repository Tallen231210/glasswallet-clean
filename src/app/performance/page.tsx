'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/ui/StatCard';
import { InteractiveCard } from '@/components/ui/InteractiveCard';
import { AnimatedCounter } from '@/components/ui/InteractiveCard';
import { LineChart, DonutChart } from '@/components/ui/Charts';
import { Badge } from '@/components/ui/Badge';
import { NeonButton } from '@/components/ui/NeonButton';
import { Progress } from '@/components/ui/Progress';
import { useUser } from '@/contexts/UserContext';

export default function PerformancePage() {
  const { user, isSalesRep } = useUser();
  const [performanceData] = useState({
    leadsProcessed: 47,
    creditsUsed: 23,
    qualificationRate: 68,
    avgCreditScore: 724,
    weeklyGoal: 75,
    monthlyGoal: 300,
    currentWeekProgress: 47,
    currentMonthProgress: 189,
    topPerformingDay: 'Tuesday',
    bestScoreRange: '720-800',
    totalEarnings: 1247.50,
    avgLeadValue: 26.54
  });

  if (!isSalesRep) {
    return (
      <AppShell>
        <div className="p-6">
          <GlassCard className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-gray-400">This page is only available for Sales Rep accounts.</p>
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  const weeklyProgress = (performanceData.currentWeekProgress / performanceData.weeklyGoal) * 100;
  const monthlyProgress = (performanceData.currentMonthProgress / performanceData.monthlyGoal) * 100;

  const performanceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Leads Processed',
      data: [5, 12, 8, 9, 6, 4, 3],
      borderColor: '#00ff88',
      backgroundColor: 'rgba(0, 255, 136, 0.1)',
      tension: 0.4
    }]
  };

  const scoreDistributionData = {
    labels: ['300-500', '500-650', '650-720', '720-800', '800+'],
    datasets: [{
      data: [8, 15, 12, 18, 4],
      backgroundColor: [
        '#ef4444', // Red
        '#f59e0b', // Yellow
        '#3b82f6', // Blue
        '#00ff88', // Neon green
        '#10b981'  // Green
      ]
    }]
  };

  return (
    <AppShell
      headerTitle="My Performance"
      headerSubtitle="Personal metrics and achievement tracking"
    >
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-400">
                You're {Math.round(weeklyProgress)}% towards your weekly goal
              </p>
            </div>
            <div className="flex gap-3">
              <Badge variant="success" size="lg">
                Sales Rep
              </Badge>
              <Badge variant="neon" size="lg">
                Active
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InteractiveCard hoverEffect="glow" clickEffect="ripple">
            <StatCard
              title="Leads Processed"
              value={performanceData.leadsProcessed}
              description="This week"
              trend="+12%"
              icon="👥"
            />
          </InteractiveCard>

          <InteractiveCard hoverEffect="glow" clickEffect="ripple">
            <StatCard
              title="Credits Used"
              value={performanceData.creditsUsed}
              description="This week"
              trend="+8%"
              icon="💳"
            />
          </InteractiveCard>

          <InteractiveCard hoverEffect="glow" clickEffect="ripple">
            <StatCard
              title="Qualification Rate"
              value={`${performanceData.qualificationRate}%`}
              description="Above average"
              trend="+5%"
              icon="🎯"
            />
          </InteractiveCard>

          <InteractiveCard hoverEffect="glow" clickEffect="ripple">
            <StatCard
              title="Avg Credit Score"
              value={performanceData.avgCreditScore}
              description="Quality leads"
              trend="+15%"
              icon="📊"
            />
          </InteractiveCard>
        </div>

        {/* Goals Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Weekly Goal</h3>
              <Badge variant="neon">
                {performanceData.currentWeekProgress}/{performanceData.weeklyGoal}
              </Badge>
            </div>
            <div className="space-y-4">
              <Progress value={weeklyProgress} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-neon-green font-medium">{Math.round(weeklyProgress)}%</span>
              </div>
              <p className="text-sm text-gray-400">
                {performanceData.weeklyGoal - performanceData.currentWeekProgress} more leads to reach your weekly goal
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Monthly Goal</h3>
              <Badge variant="success">
                {performanceData.currentMonthProgress}/{performanceData.monthlyGoal}
              </Badge>
            </div>
            <div className="space-y-4">
              <Progress value={monthlyProgress} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-neon-green font-medium">{Math.round(monthlyProgress)}%</span>
              </div>
              <p className="text-sm text-gray-400">
                Excellent progress! You're ahead of schedule this month.
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Weekly Activity</h3>
            <LineChart data={performanceChartData.labels.map((label: string, index: number) => ({
              label,
              value: performanceChartData.datasets[0]?.data[index] ?? 0
            }))} height={200} />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Credit Score Distribution</h3>
            <DonutChart data={scoreDistributionData.labels.map((label: string, index: number) => ({
              label,
              value: scoreDistributionData.datasets[0]?.data[index] ?? 0,
              color: scoreDistributionData.datasets[0]?.backgroundColor[index] ?? '#00ff88'
            }))} />
          </GlassCard>
        </div>

        {/* Performance Insights */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl mb-2">🔥</div>
              <h4 className="font-semibold text-white mb-1">Best Day</h4>
              <p className="text-neon-green font-medium">{performanceData.topPerformingDay}</p>
              <p className="text-xs text-gray-400 mt-1">Highest conversion rate</p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-white mb-1">Top Score Range</h4>
              <p className="text-neon-green font-medium">{performanceData.bestScoreRange}</p>
              <p className="text-xs text-gray-400 mt-1">Most qualified leads</p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold text-white mb-1">Avg Lead Value</h4>
              <p className="text-neon-green font-medium">${performanceData.avgLeadValue}</p>
              <p className="text-xs text-gray-400 mt-1">Per qualified lead</p>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <NeonButton className="px-6 py-3">
            Set New Goals
          </NeonButton>
          <NeonButton variant="secondary" className="px-6 py-3">
            Download Report
          </NeonButton>
        </div>
      </div>
    </AppShell>
  );
}