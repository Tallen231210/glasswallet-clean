'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { CreditBalance } from '@/components/billing/CreditBalance';

// Enhanced Progress component
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`progress-container ${className}`}>
    <div 
      className="progress-bar" 
      style={{ 
        width: `${Math.min(100, Math.max(0, value))}%`
      }}
    />
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  
  // Mock user data for now
  const user = { firstName: 'User' };
  const isBusinessOwner = true;
  const isSalesRep = false;
  
  // Credit balance will be handled by CreditBalance component
  
  // Mock stats
  const stats = {
    total: 247,
    conversionRate: 89,
    avgCreditScore: 742
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-700/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              Business Dashboard
            </h1>
            <p className="text-gray-400">Welcome back — here's your platform overview</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="space-component">
          <div className="flex items-start justify-between">
            <div className="space-element">
              <h2 className="text-subheading text-white mb-2">
                {isBusinessOwner ? "Business Overview" : isSalesRep ? "Sales Performance" : "Dashboard"}
              </h2>
              <p className="text-body text-gray-400 max-w-2xl">
                {isBusinessOwner 
                  ? "Monitor your team's performance and lead conversion rates with real-time insights and analytics"
                  : isSalesRep 
                    ? "Track your individual sales metrics and goals with personalized performance indicators"
                    : "Your comprehensive GlassWallet platform overview with key metrics and quick actions"
                }
              </p>
            </div>
            <div className="flex gap-3">
              <Badge variant={isBusinessOwner ? "success" : isSalesRep ? "neon" : "default"} size="lg">
                {isBusinessOwner ? "Business Owner" : isSalesRep ? "Sales Rep" : "User"}
              </Badge>
              <Badge variant="success" size="lg">
                Active
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <StatCard
            title={isBusinessOwner ? "Team Leads" : "My Leads"}
            value={isBusinessOwner ? stats.total : Math.floor(stats.total / 3)}
            description="Total processed"
            icon="👥"
            variant="default"
            trend={isBusinessOwner ? "+23% this month" : "+12% this week"}
          />
          
          <StatCard
            title="Qualification Rate"
            value={`${stats.conversionRate}%`}
            description="Above average"
            icon="🎯"
            variant="success"
            trend="+5% vs last period"
          />
          
          <StatCard
            title="Avg Credit Score"
            value={stats.avgCreditScore}
            description="Quality leads"
            icon="📊"
            variant="success"
            trend="+15 points"
          />
        </div>

        {/* Credit Balance Display */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">💳 Credit Balance</h3>
          <CreditBalance 
            compact={true} 
            onPurchaseCredits={() => router.push('/billing')} 
          />
        </div>

        {/* Quick Actions */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NeonButton 
              className="flex items-center gap-2 justify-center p-4"
              onClick={() => router.push('/leads/new')}
            >
              <span>📝</span>
              Add New Lead
            </NeonButton>
            
            <NeonButton 
              variant="secondary"
              className="flex items-center gap-2 justify-center p-4"
              onClick={() => router.push('/leads')}
            >
              <span>👥</span>
              View All Leads
            </NeonButton>
            
            {isBusinessOwner && (
              <NeonButton 
                variant="secondary"
                className="flex items-center gap-2 justify-center p-4"
                onClick={() => router.push('/performance')}
              >
                <span>📈</span>
                Team Performance
              </NeonButton>
            )}
            
            <NeonButton 
              variant="secondary"
              className="flex items-center gap-2 justify-center p-4"
              onClick={() => router.push('/settings')}
            >
              <span>⚙️</span>
              Settings
            </NeonButton>
          </div>
        </GlassCard>

        {/* Credit Usage Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Credit Usage</h3>
              <Badge variant="neon">
                Current Month
              </Badge>
            </div>
            <div className="space-y-4">
              <Progress 
                value={isBusinessOwner ? 65 : 75} 
                className="h-3"
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">This Month</span>
                <span className="font-medium" style={{color: 'var(--neon-green)'}}>
                  {isBusinessOwner ? "35%" : "25%"} remaining
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {isBusinessOwner 
                  ? "Your team is on track with credit usage this month"
                  : "You're efficiently using your credit allocation"
                }
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🔄 Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Lead qualified: Sarah Johnson</p>
                  <p className="text-gray-400 text-xs">2 minutes ago</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Getting Started (for new users) */}
        {isBusinessOwner && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🚀 Getting Started</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor: 'rgba(0, 255, 136, 0.2)'}}>
                  <span className="text-xl" style={{color: 'var(--neon-green)'}}>👥</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Import Leads</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Upload your lead list to start credit qualification
                </p>
                <NeonButton size="sm" onClick={() => router.push('/leads/new')}>
                  Add Leads
                </NeonButton>
              </div>

              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-400 text-xl">📊</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Track Performance</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Monitor your team's conversion rates and metrics
                </p>
                <NeonButton size="sm" variant="secondary" onClick={() => router.push('/performance')}>
                  View Analytics
                </NeonButton>
              </div>

              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-400 text-xl">⚙️</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Configure Settings</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Set up your account preferences and integrations
                </p>
                <NeonButton size="sm" variant="secondary" onClick={() => router.push('/settings')}>
                  Setup Account
                </NeonButton>
              </div>
            </div>
          </GlassCard>
        )}
        </div>
      </div>
    </AppLayout>
  );
}