'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  StatCard,
  Badge,
  ToastProvider,
  Progress,
  CreditBalanceWidget,
  CreditProcessingCenter,
  ActivityFeed,
  LineChart,
  DonutChart,
  InteractiveCard,
  FloatingActionButton,
  AnimatedCounter
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';
import { useUser } from '@/contexts/UserContext';

const DashboardPage = () => {
  const router = useRouter();
  const { user, isBusinessOwner, isSalesRep } = useUser();
  
  // Different credit balances for different account types
  const [creditBalance, setCreditBalance] = useState(isBusinessOwner ? 127 : 25);
  // Different data for different account types
  const [realtimeData, setRealtimeData] = useState(
    isBusinessOwner ? {
      activeUsers: 147,
      leadConversions: 23,
      aiProcessing: 8,
      systemLoad: 34
    } : {
      personalLeads: 12,
      weeklyGoal: 50,
      qualificationRate: 68,
      avgCreditScore: 724
    }
  );

  // Different chart data for different account types
  const leadTrendData = isBusinessOwner ? [
    { label: 'Mon', value: 45 },
    { label: 'Tue', value: 67 },
    { label: 'Wed', value: 52 },
    { label: 'Thu', value: 89 },
    { label: 'Fri', value: 78 },
    { label: 'Sat', value: 91 },
    { label: 'Sun', value: 103 }
  ] : [
    { label: 'Mon', value: 3 },
    { label: 'Tue', value: 8 },
    { label: 'Wed', value: 5 },
    { label: 'Thu', value: 7 },
    { label: 'Fri', value: 4 },
    { label: 'Sat', value: 2 },
    { label: 'Sun', value: 1 }
  ];

  const leadDistributionData = isBusinessOwner ? [
    { label: 'Qualified', value: 65, color: '#00ff88' },
    { label: 'Unqualified', value: 25, color: '#f59e0b' },
    { label: 'Pending', value: 10, color: '#6b7280' }
  ] : [
    { label: 'High Quality', value: 35, color: '#00ff88' },
    { label: 'Good', value: 45, color: '#3b82f6' },
    { label: 'Poor', value: 20, color: '#f59e0b' }
  ];

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isBusinessOwner) {
        setRealtimeData(prev => ({
          activeUsers: (prev?.activeUsers || 0) + Math.floor(Math.random() * 10) - 5,
          leadConversions: Math.max(0, (prev?.leadConversions || 0) + Math.floor(Math.random() * 4) - 1),
          aiProcessing: Math.max(0, (prev?.aiProcessing || 0) + Math.floor(Math.random() * 6) - 3),
          systemLoad: Math.max(10, Math.min(95, (prev?.systemLoad || 50) + Math.floor(Math.random() * 10) - 5))
        }));
      } else {
        setRealtimeData(prev => ({
          personalLeads: Math.max(0, (prev?.personalLeads || 0) + Math.floor(Math.random() * 3) - 1),
          weeklyGoal: prev?.weeklyGoal || 100,
          qualificationRate: Math.max(30, Math.min(95, (prev?.qualificationRate || 60) + Math.floor(Math.random() * 6) - 3)),
          avgCreditScore: Math.max(300, Math.min(850, (prev?.avgCreditScore || 650) + Math.floor(Math.random() * 20) - 10))
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isBusinessOwner]);

  const handleBuyCredits = () => {
    // TODO: Implement Stripe billing integration
    console.log('Redirecting to credit purchase...');
    // For now, just simulate buying credits
    setCreditBalance(prev => prev + 50);
  };

  const handleCreditPull = async (leadData: any) => {
    // TODO: Implement real CRS API integration
    console.log('Processing credit pull for:', leadData);
    
    // Simulate API delay and processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock credit result based on form data
    const mockScore = Math.floor(Math.random() * (850 - 300) + 300);
    return {
      creditScore: mockScore,
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      qualified: mockScore >= 650,
      autoTags: mockScore >= 720 ? ['High Quality', 'Auto-Approved'] : mockScore >= 650 ? ['Good'] : ['Poor Credit'],
      riskFactors: mockScore < 600 ? ['Low credit score', 'High risk'] : [],
      recommendedAction: (mockScore >= 720 ? 'approve' : mockScore >= 650 ? 'review' : 'reject') as 'approve' | 'review' | 'reject'
    };
  };

  const handleCreditDeducted = (amount: number) => {
    setCreditBalance(prev => Math.max(0, prev - amount));
  };

  const quickActions = isBusinessOwner ? [
    { 
      icon: '👥', 
      label: 'New Lead', 
      description: 'Capture & qualify instantly',
      href: '/leads/new',
      color: 'neon'
    },
    { 
      icon: '🤖', 
      label: 'AI Analysis', 
      description: 'Run intelligent insights',
      href: '/ai-intelligence',
      color: 'purple'
    },
    { 
      icon: '📊', 
      label: 'Analytics', 
      description: 'View performance data',
      href: '/leads/advanced-analytics',
      color: 'blue'
    },
    { 
      icon: '🎯', 
      label: 'Pixel Sync', 
      description: 'Optimize ad targeting',
      href: '/pixels',
      color: 'green'
    }
  ] : [
    { 
      icon: '⚡', 
      label: 'Quick Pull', 
      description: 'Instant credit report',
      href: '/quick-actions/credit-pull',
      color: 'neon'
    },
    { 
      icon: '👥', 
      label: 'Add Lead', 
      description: 'Capture new prospect',
      href: '/leads/new',
      color: 'blue'
    },
    { 
      icon: '📈', 
      label: 'My Stats', 
      description: 'View personal metrics',
      href: '/performance',
      color: 'green'
    },
    { 
      icon: '💳', 
      label: 'Buy Credits', 
      description: 'Purchase more credits',
      href: '/billing',
      color: 'purple'
    }
  ];

  return (
    <AppShell>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            {isBusinessOwner ? (
              <>
                <h1 className="text-2xl font-bold text-white mb-2">Mission Control</h1>
                <p className="text-gray-400">AI-powered credit data processing platform</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Welcome back, {user?.firstName || 'Sales Rep'}! 👋
                </h1>
                <p className="text-gray-400">Your personal credit qualification workspace</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-6">
            {/* Credit Balance Widget */}
            <CreditBalanceWidget
              balance={creditBalance}
              maxCredits={200}
              size="md"
              onBuyCredits={handleBuyCredits}
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/30">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span className="text-neon-green text-sm font-medium">Live</span>
              </div>
              {isBusinessOwner ? (
                <Badge variant="success" size="sm">All Systems Operational</Badge>
              ) : (
                <Badge variant="neon" size="sm">Sales Rep</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isBusinessOwner ? (
            <>
              <InteractiveCard hoverEffect="glow" clickEffect="ripple">
                <StatCard
                  title="Total Leads"
                  value="2847"
                  icon="👥"
                  variant="neon"
                  trend="+12.5%"
                />
              </InteractiveCard>
              
              <InteractiveCard hoverEffect="lift" clickEffect="scale">
                <StatCard
                  title="Conversion Rate"
                  value="24.3%"
                  icon="📈"
                  variant="success"
                  trend="+5.2%"
                />
              </InteractiveCard>
              
              <InteractiveCard hoverEffect="tilt" clickEffect="glow">
                <StatCard
                  title="AI Qualified"
                  value="1692"
                  icon="🤖"
                  variant="success"
                  trend="+18.7%"
                />
              </InteractiveCard>
              
              <InteractiveCard hoverEffect="rainbow" clickEffect="ripple">
                <StatCard
                  title="Active Users"
                  value={realtimeData?.activeUsers?.toString() || "0"}
                  icon="⚡"
                  variant="neon"
                  trend="Live"
                />
              </InteractiveCard>
            </>
          ) : (
            <>
              <InteractiveCard hoverEffect="glow" clickEffect="ripple">
                <StatCard
                  title="My Leads"
                  value={realtimeData?.personalLeads?.toString() || "0"}
                  icon="👥"
                  variant="neon"
                  trend="This week"
                />
              </InteractiveCard>
              
              <InteractiveCard hoverEffect="lift" clickEffect="scale">
                <StatCard
                  title="Weekly Goal"
                  value={`${realtimeData?.personalLeads || 0}/${realtimeData?.weeklyGoal || 100}`}
                  icon="🎯"
                  variant="success"
                  trend={`${Math.round(((realtimeData?.personalLeads || 0) / (realtimeData?.weeklyGoal || 100)) * 100)}%`}
                />
              </InteractiveCard>
              
              <InteractiveCard hoverEffect="tilt" clickEffect="glow">
                <StatCard
                  title="Qualification Rate"
                  value={`${realtimeData.qualificationRate}%`}
                  icon="📈"
                  variant="success"
                  trend="Above avg"
                />
              </InteractiveCard>
              
              <InteractiveCard hoverEffect="rainbow" clickEffect="ripple">
                <StatCard
                  title="Avg Credit Score"
                  value={realtimeData?.avgCreditScore?.toString() || "650"}
                  icon="⭐"
                  variant="neon"
                  trend="Live"
                />
              </InteractiveCard>
            </>
          )}
        </div>

        {/* Data Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Chart 1 */}
          <InteractiveCard hoverEffect="lift" className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">
                {isBusinessOwner ? 'Weekly Lead Trend' : 'My Activity'}
              </h3>
              <p className="text-gray-400 text-sm">
                {isBusinessOwner 
                  ? 'Lead capture performance over the last 7 days' 
                  : 'Your daily lead processing activity'}
              </p>
            </div>
            <LineChart
              data={leadTrendData}
              height={180}
              color="#00ff88"
              gradient={true}
              animated={true}
              showGrid={true}
              showDots={true}
            />
          </InteractiveCard>

          {/* Chart 2 */}
          <InteractiveCard hoverEffect="glow" className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">
                {isBusinessOwner ? 'Lead Distribution' : 'My Lead Quality'}
              </h3>
              <p className="text-gray-400 text-sm">
                {isBusinessOwner 
                  ? 'Current lead qualification status' 
                  : 'Quality breakdown of your leads'}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <DonutChart
                data={leadDistributionData}
                size={180}
                strokeWidth={25}
                animated={true}
                centerContent={
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      <AnimatedCounter value={isBusinessOwner ? 2847 : realtimeData.personalLeads || 30} />
                    </div>
                    <div className="text-sm text-gray-400">
                      {isBusinessOwner ? 'Total Leads' : 'My Leads'}
                    </div>
                  </div>
                }
              />
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              {leadDistributionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-300">{item.label}</span>
                  <span className="text-sm text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </InteractiveCard>
        </div>

        {/* Credit Processing Center (Business Owners Only) */}
        {isBusinessOwner && (
          <CreditProcessingCenter
            onCreditPull={handleCreditPull}
            onCreditDeducted={handleCreditDeducted}
            className="mb-8"
          />
        )}

        {/* Quick Action Center */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Quick Actions</h2>
              <p className="text-gray-400 text-sm">Access key platform functions instantly</p>
            </div>
            <NeonButton size="sm" onClick={() => router.push('/leads')}>
              View All →
            </NeonButton>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={() => router.push(action.href)}
                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {action.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{action.label}</h3>
                <p className="text-gray-400 text-xs">{action.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Status & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isBusinessOwner ? (
            <>
              {/* System Health */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-neon-green">⚡</span>
                  System Health
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Processing Load</span>
                      <span className="text-white">{realtimeData?.systemLoad || 0}%</span>
                    </div>
                    <Progress value={realtimeData?.systemLoad || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">AI Queue</span>
                      <span className="text-white">{realtimeData?.aiProcessing || 0} tasks</span>
                    </div>
                    <Progress value={(realtimeData?.aiProcessing || 0) * 10} variant="neon" className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Conversions (Today)</span>
                      <span className="text-white">{realtimeData?.leadConversions || 0}</span>
                    </div>
                    <Progress value={(realtimeData?.leadConversions || 0) * 3} variant="success" className="h-2" />
                  </div>
                </div>
              </GlassCard>

              {/* Platform Insights */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-purple-400">🎯</span>
                  AI Insights
                </h3>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-neon-green/10 border border-neon-green/20">
                    <p className="text-neon-green text-sm font-medium">High Conversion Window</p>
                    <p className="text-gray-300 text-xs mt-1">Next 2 hours optimal for lead contact</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-blue-400 text-sm font-medium">Pixel Performance</p>
                    <p className="text-gray-300 text-xs mt-1">Meta campaigns +23% above target</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-purple-400 text-sm font-medium">Quality Score</p>
                    <p className="text-gray-300 text-xs mt-1">Lead quality improved 18% this week</p>
                  </div>
                </div>
              </GlassCard>
            </>
          ) : (
            <>
              {/* Personal Goal Progress */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-neon-green">🎯</span>
                  Weekly Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Weekly Goal</span>
                      <span className="text-white">{realtimeData?.personalLeads || 0}/{realtimeData?.weeklyGoal || 100}</span>
                    </div>
                    <Progress value={((realtimeData?.personalLeads || 0) / (realtimeData?.weeklyGoal || 100)) * 100} className="h-3" />
                  </div>
                  <div className="p-3 rounded-lg bg-neon-green/10 border border-neon-green/20">
                    <p className="text-neon-green text-sm font-medium">Great Progress!</p>
                    <p className="text-gray-300 text-xs mt-1">You're {Math.round(((realtimeData?.personalLeads || 0) / (realtimeData?.weeklyGoal || 100)) * 100)}% to your weekly goal</p>
                  </div>
                </div>
              </GlassCard>

              {/* Personal Insights */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-purple-400">💡</span>
                  Personal Tips
                </h3>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-blue-400 text-sm font-medium">Best Time to Call</p>
                    <p className="text-gray-300 text-xs mt-1">2-4 PM has your highest success rate</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-green-400 text-sm font-medium">Quality Score</p>
                    <p className="text-gray-300 text-xs mt-1">Your avg score: {realtimeData.avgCreditScore}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-purple-400 text-sm font-medium">Streak Active</p>
                    <p className="text-gray-300 text-xs mt-1">5 days of goal achievement</p>
                  </div>
                </div>
              </GlassCard>
            </>
          )}

          {/* Activity Feed (for both account types) */}
          <ActivityFeed
            maxItems={8}
            compact={true}
            className="lg:row-span-1"
            onItemClick={(item) => {
              console.log('Activity clicked:', item);
              // TODO: Navigate to relevant page based on activity type
            }}
          />
        </div>

        {/* Performance Overview (Business Owners Only) */}
        {isBusinessOwner && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Status */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-green-400">🚀</span>
                Platform Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">AI-Powered Lead Scoring</span>
                  </div>
                  <Badge variant="neon" size="sm">Live</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Credit Data Integration</span>
                  </div>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Pixel Optimization</span>
                  </div>
                  <Badge variant="success" size="sm">Running</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Automated Routing</span>
                  </div>
                  <Badge variant="neon" size="sm">Online</Badge>
                </div>
              </div>
            </GlassCard>

            {/* Today's Performance */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-yellow-400">📈</span>
                Today's Performance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-neon-green/10 to-transparent rounded-lg border border-neon-green/20">
                  <div>
                    <p className="text-white font-medium">Leads Processed</p>
                    <p className="text-gray-400 text-sm">+23 since midnight</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neon-green text-xl font-bold">127</p>
                    <p className="text-neon-green text-xs">+18%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-400/10 to-transparent rounded-lg border border-blue-400/20">
                  <div>
                    <p className="text-white font-medium">Conversions</p>
                    <p className="text-gray-400 text-sm">Above daily target</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 text-xl font-bold">{realtimeData.leadConversions}</p>
                    <p className="text-blue-400 text-xs">+12%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-400/10 to-transparent rounded-lg border border-purple-400/20">
                  <div>
                    <p className="text-white font-medium">AI Accuracy</p>
                    <p className="text-gray-400 text-sm">Prediction confidence</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 text-xl font-bold">94.2%</p>
                    <p className="text-purple-400 text-xs">+2.1%</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Floating Action Button */}
        <FloatingActionButton
          position="bottom-right"
          size="lg"
          color="neon"
          tooltip={isBusinessOwner ? "Quick Credit Pull" : "Quick Pull"}
          onClick={() => router.push(isBusinessOwner ? '/leads/new' : '/quick-actions/credit-pull')}
        >
          ⚡
        </FloatingActionButton>
      </div>
    </AppShell>
  );
};

export default function DashboardPageWrapper() {
  return (
    <ToastProvider>
      <DashboardPage />
    </ToastProvider>
  );
}