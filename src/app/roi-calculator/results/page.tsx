'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { InteractiveCard } from '@/components/ui/InteractiveCard';
import { AnimatedCounter } from '@/components/ui/InteractiveCard';
import { BarChart } from '@/components/ui/Charts';
import { Progress } from '@/components/ui/Progress';
import { calculateROI, formatCurrency, formatPercentage, formatNumber } from '@/utils/roiCalculations';
import type { ROIInputs, ROIResults } from '@/utils/roiCalculations';
import { usePermissions } from '@/contexts/UserContext';

export default function ROIResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ROIResults | null>(null);
  const [inputs, setInputs] = useState<ROIInputs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = usePermissions();
  
  // Check if user has admin access
  if (!hasPermission('platformAdminAccess')) {
    return (
      <AppShell
        headerTitle="Access Denied"
        headerSubtitle="This feature is restricted to platform administrators"
      >
        <div className="p-6 max-w-2xl mx-auto text-center">
          <GlassCard className="p-8">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-6">
              The ROI Calculator is a restricted feature available only to platform administrators. 
              This tool is designed for internal sales presentations and demonstrations.
            </p>
            <NeonButton onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </NeonButton>
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  useEffect(() => {
    // Load results from sessionStorage
    try {
      const storedInputs = sessionStorage.getItem('roiInputs');
      const storedResults = sessionStorage.getItem('roiResults');
      
      if (storedInputs && storedResults) {
        const parsedInputs = JSON.parse(storedInputs);
        const parsedResults = JSON.parse(storedResults);
        
        setInputs(parsedInputs);
        setResults(parsedResults);
        setIsLoading(false);
      } else {
        // Fallback to mock data if no stored results
        const mockInputs: ROIInputs = {
          adSpend: 10000,
          callsBooked: 200,
          currentQualificationRate: 30,
          showRate: 75,
          pitchRate: 80,
          affordabilityLossRate: 30,
          closeRate: 20,
          aov: 5000,
          collectedPercent: 95,
          avgCallLength: 45,
          followUpTimePerLead: 15
        };

        const calculatedResults = calculateROI(mockInputs);
        setInputs(mockInputs);
        setResults(calculatedResults);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading ROI results:', error);
      setIsLoading(false);
    }
  }, []);

  if (isLoading || !results) {
    return (
      <AppShell>
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Calculating your ROI...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Sales funnel visualization data
  const currentFunnelData = [
    { label: 'Calls Booked', value: Math.round(results.currentFunnel.callsBooked), color: '#6b7280' },
    { label: 'Show Ups', value: Math.round(results.currentFunnel.showUps), color: '#6b7280' },
    { label: 'Pitched', value: Math.round(results.currentFunnel.completedPitches), color: '#6b7280' },
    { label: 'Affordable', value: Math.round(results.currentFunnel.affordableProspects), color: '#6b7280' },
    { label: 'Closed', value: Math.round(results.currentFunnel.closedSales), color: '#6b7280' }
  ];

  const futureFunnelData = [
    { label: 'Calls Booked', value: Math.round(results.futureFunnel.qualifiedCallsBooked), color: '#00ff88' },
    { label: 'Show Ups', value: Math.round(results.futureFunnel.showUps), color: '#00ff88' },
    { label: 'Pitched', value: Math.round(results.futureFunnel.completedPitches), color: '#00ff88' },
    { label: 'Affordable', value: Math.round(results.futureFunnel.affordableProspects), color: '#00ff88' },
    { label: 'Closed', value: Math.round(results.futureFunnel.closedSales), color: '#00ff88' }
  ];

  const revenueComparisonData = [
    { label: 'Current', value: Math.round(results.currentFunnel.actualRevenue), color: '#6b7280' },
    { label: 'With GlassWallet', value: Math.round(results.futureFunnel.actualRevenue), color: '#00ff88' }
  ];

  const efficiencyMetrics = [
    {
      label: 'Cost per Lead',
      current: formatCurrency(results.currentCosts.efficiency.costPerLead),
      future: formatCurrency(results.futureCosts.efficiency.costPerLead),
      improvement: ((results.currentCosts.efficiency.costPerLead - results.futureCosts.efficiency.costPerLead) / results.currentCosts.efficiency.costPerLead * 100).toFixed(1)
    },
    {
      label: 'Cost per Sale',
      current: formatCurrency(results.currentCosts.efficiency.costPerSale),
      future: formatCurrency(results.futureCosts.efficiency.costPerSale),
      improvement: ((results.currentCosts.efficiency.costPerSale - results.futureCosts.efficiency.costPerSale) / results.currentCosts.efficiency.costPerSale * 100).toFixed(1)
    },
    {
      label: 'Time per Sale',
      current: `${Math.round(results.currentCosts.efficiency.timePerSale)} min`,
      future: `${Math.round(results.futureCosts.efficiency.timePerSale)} min`,
      improvement: ((results.currentCosts.efficiency.timePerSale - results.futureCosts.efficiency.timePerSale) / results.currentCosts.efficiency.timePerSale * 100).toFixed(1)
    },
    {
      label: 'Revenue per Hour',
      current: formatCurrency(results.timeWasteAnalysis.revenuePerQualifiedHour),
      future: formatCurrency(results.timeWasteAnalysis.revenuePerQualifiedHour),
      improvement: '0.0' // Time waste analysis doesn't change this metric
    }
  ];

  return (
    <AppShell
      headerTitle="ROI Analysis Results"
      headerSubtitle="Your personalized sales funnel optimization analysis"
    >
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Executive Summary */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-electric-green rounded-2xl flex items-center justify-center shadow-2xl shadow-neon-green/30">
              <span className="text-deep-navy-start font-bold text-2xl">🎯</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Your ROI: <span className="text-neon-green">{formatPercentage(results.roiSummary.roiPercentage, 0)}</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            GlassWallet can generate <span className="text-neon-green font-bold">{formatCurrency(results.roiSummary.netMonthlyBenefit * 12)}</span> in 
            net benefits annually with a payback period of just <span className="text-neon-green font-bold">{Math.ceil(results.roiSummary.paybackMonths)} months</span>.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InteractiveCard hoverEffect="glow" clickEffect="ripple">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-bold text-white mb-2">More Revenue</h3>
              <div className="text-2xl font-bold text-neon-green">
                <AnimatedCounter value={results.roiSummary.additionalMonthlyRevenue} duration={2000} />
              </div>
              <p className="text-sm text-gray-400 mt-1">per month</p>
            </GlassCard>
          </InteractiveCard>

          <InteractiveCard hoverEffect="lift" clickEffect="scale">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="text-lg font-bold text-white mb-2">Time Redirected</h3>
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(results.timeWasteAnalysis.timeRedirected)}h
              </div>
              <p className="text-sm text-gray-400 mt-1">to qualified prospects</p>
            </GlassCard>
          </InteractiveCard>

          <InteractiveCard hoverEffect="tilt" clickEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-white mb-2">ROI Percentage</h3>
              <div className="text-2xl font-bold text-purple-400">
                {formatPercentage(results.roiSummary.roiPercentage, 0)}
              </div>
              <p className="text-sm text-gray-400 mt-1">Annual return</p>
            </GlassCard>
          </InteractiveCard>

          <InteractiveCard hoverEffect="rainbow" clickEffect="ripple">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-white mb-2">Payback Period</h3>
              <div className="text-2xl font-bold text-yellow-400">
                {Math.ceil(results.roiSummary.paybackMonths)} months
              </div>
              <p className="text-sm text-gray-400 mt-1">Break-even timeline</p>
            </GlassCard>
          </InteractiveCard>
        </div>

        {/* Call Quality Improvement - The Key Value Proposition */}
        <InteractiveCard hoverEffect="glow">
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-electric-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-deep-navy-start font-bold text-2xl">🎯</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Call Quality Transformation</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Stop wasting time on unqualified prospects. GlassWallet ensures you're talking to people who actually have money.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current vs GlassWallet Qualified Calls */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Qualified Call Volume</h3>
                
                {/* Current Qualified Calls */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-red-400">Current Situation</h4>
                    <Badge variant="danger">{formatNumber(inputs?.currentQualificationRate || 30)}% Qualified</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatNumber(results.callQualityImprovement.currentQualifiedCalls)}
                      </div>
                      <div className="text-sm text-green-400">Qualified Calls</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-400 mb-1">
                        {formatNumber(results.callQualityImprovement.currentUnqualifiedCalls)}
                      </div>
                      <div className="text-sm text-red-400">Wasted Calls</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-400">
                    {formatNumber(results.callQualityImprovement.currentUnqualifiedCalls)} calls with people who can't afford your service
                  </div>
                </div>

                {/* GlassWallet Qualified Calls */}
                <div className="bg-neon-green/10 border border-neon-green/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-neon-green">With GlassWallet</h4>
                    <Badge variant="success">85% Qualified</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-neon-green mb-1">
                        {formatNumber(results.callQualityImprovement.glassWalletQualifiedCalls)}
                      </div>
                      <div className="text-sm text-neon-green">Qualified Calls</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatNumber(results.callQualityImprovement.glassWalletUnqualifiedCalls)}
                      </div>
                      <div className="text-sm text-gray-400">Unqualified</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-300">
                    Pre-qualified based on credit score & debt-to-income ratio
                  </div>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">The Impact</h3>
                
                {/* Additional Qualified Calls */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-3">📈</div>
                  <div className="text-3xl font-bold text-neon-green mb-2">
                    +{formatNumber(results.callQualityImprovement.additionalQualifiedCalls)}
                  </div>
                  <div className="text-lg text-white font-semibold mb-1">Additional Qualified Calls</div>
                  <div className="text-sm text-gray-400">Every single month</div>
                </div>

                {/* Time Savings */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-3">⏰</div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {Math.round(results.callQualityImprovement.wastedTimeReduction)}h
                  </div>
                  <div className="text-lg text-white font-semibold mb-1">Time Saved Monthly</div>
                  <div className="text-sm text-gray-400">Stop talking to people without money</div>
                </div>

                {/* Revenue Per Qualified Call */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-3">💰</div>
                  <div className="text-2xl font-bold text-yellow-400 mb-2">
                    {formatCurrency(results.callQualityImprovement.qualifiedCallRevenuePotential)}
                  </div>
                  <div className="text-lg text-white font-semibold mb-1">Revenue Per Qualified Call</div>
                  <div className="text-sm text-gray-400">Maximum earning potential</div>
                </div>
              </div>
            </div>

            {/* Bottom Summary */}
            <div className="mt-8 p-6 bg-neon-green/5 border border-neon-green/20 rounded-lg">
              <div className="text-center">
                <h4 className="text-xl font-bold text-neon-green mb-3">The GlassWallet Advantage</h4>
                <p className="text-gray-300 text-lg mb-4">
                  Instead of {formatNumber(results.callQualityImprovement.currentQualifiedCalls)} qualified conversations per month, 
                  you'll have {formatNumber(results.callQualityImprovement.glassWalletQualifiedCalls)} — that's a 
                  <span className="text-neon-green font-bold"> {formatPercentage(results.callQualityImprovement.qualificationRateImprovement)} </span> 
                  improvement in call quality.
                </p>
                <div className="inline-flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-gray-400">Current: Mostly unqualified prospects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-neon-green rounded-full"></div>
                    <span className="text-gray-400">GlassWallet: Pre-qualified prospects with money</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </InteractiveCard>

        {/* Sales Funnel Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Funnel */}
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-red-400">📊</span>
                Current Sales Funnel
              </h3>
              <div className="h-64">
                <BarChart 
                  data={currentFunnelData}
                  height={200}
                  animated={true}
                />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Revenue:</span>
                  <span className="text-white font-bold">{formatCurrency(results.currentFunnel.actualRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Closed Sales:</span>
                  <span className="text-white font-bold">{Math.round(results.currentFunnel.closedSales)}</span>
                </div>
              </div>
            </GlassCard>
          </InteractiveCard>

          {/* Future Funnel */}
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-neon-green">🚀</span>
                With GlassWallet
              </h3>
              <div className="h-64">
                <BarChart 
                  data={futureFunnelData}
                  height={200}
                  animated={true}
                />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Revenue:</span>
                  <span className="text-neon-green font-bold">{formatCurrency(results.futureFunnel.actualRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Closed Sales:</span>
                  <span className="text-neon-green font-bold">{Math.round(results.futureFunnel.closedSales)}</span>
                </div>
              </div>
            </GlassCard>
          </InteractiveCard>
        </div>

        {/* Efficiency Improvements */}
        <InteractiveCard hoverEffect="lift">
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Efficiency Improvements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {efficiencyMetrics.map((metric, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">{metric.label}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Current:</span>
                      <span className="text-white">{metric.current}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Future:</span>
                      <span className="text-neon-green">{metric.future}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Improvement:</span>
                        <Badge variant="success" size="sm">
                          {metric.improvement}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </InteractiveCard>

        {/* Time Waste Analysis */}
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">⏰</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Time Waste Analysis</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See exactly how many hours you're wasting on unqualified prospects and the revenue opportunity you're missing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Time Allocation */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Your Current Time Allocation</h3>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-red-400 mb-2">
                    {Math.round(results.timeWasteAnalysis.currentWastedHours)}h
                  </div>
                  <div className="text-lg font-semibold text-red-400">Wasted Monthly</div>
                  <div className="text-sm text-gray-400">Talking to unqualified prospects</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Unqualified Calls:</span>
                    <span className="text-red-400 font-bold">{formatNumber(results.callQualityImprovement.currentUnqualifiedCalls)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Time Per Call + Follow-up:</span>
                    <span className="text-white">{(inputs?.avgCallLength || 0) + (inputs?.followUpTimePerLead || 0)} min</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-red-500/20">
                    <span className="text-gray-400">Hours Wasted:</span>
                    <span className="text-red-400 font-bold">{Math.round(results.timeWasteAnalysis.currentWastedHours)} hours/month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GlassWallet Time Reallocation */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">With GlassWallet</h3>
              
              <div className="bg-neon-green/10 border border-neon-green/20 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-neon-green mb-2">
                    {Math.round(results.timeWasteAnalysis.timeRedirected)}h
                  </div>
                  <div className="text-lg font-semibold text-neon-green">Time Redirected</div>
                  <div className="text-sm text-gray-300">To qualified prospects with money</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Qualified Rate:</span>
                    <span className="text-neon-green font-bold">85%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Wasted Hours:</span>
                    <span className="text-white">{Math.round(results.timeWasteAnalysis.glassWalletWastedHours)}h/month</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-neon-green/20">
                    <span className="text-gray-400">Hours Redirected:</span>
                    <span className="text-neon-green font-bold">{Math.round(results.timeWasteAnalysis.timeRedirected)} hours/month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Opportunity */}
          <div className="mt-8 p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-yellow-400 mb-3">Revenue Opportunity from Redirected Time</h4>
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                {formatCurrency(results.timeWasteAnalysis.redirectedRevenueOpportunity)}
              </div>
              <p className="text-gray-300 text-lg mb-4">
                Additional monthly revenue if those {Math.round(results.timeWasteAnalysis.timeRedirected)} wasted hours 
                were spent talking to qualified prospects instead.
              </p>
              <div className="inline-flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-gray-400">Wasted on unqualified calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-neon-green rounded-full"></div>
                  <span className="text-gray-400">Redirected to qualified prospects</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* How GlassWallet Improves Your Funnel */}
        <InteractiveCard hoverEffect="glow">
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">How GlassWallet Improves Your Funnel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-neon-green text-2xl">📋</span>
                </div>
                <h3 className="font-bold text-white mb-2">Pre-Qualification</h3>
                <p className="text-sm text-gray-400">Credit check leads before they get to your calendar, filtering out {results.improvements.preQualificationRate}% of unqualified prospects</p>
                <div className="mt-3">
                  <Badge variant="neon">+{formatPercentage(results.improvements.improvedShowRate)}% Show Rate</Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-400 text-2xl">💰</span>
                </div>
                <h3 className="font-bold text-white mb-2">Affordability Focus</h3>
                <p className="text-sm text-gray-400">Reduce affordability objections by {formatPercentage(results.improvements.reducedAffordabilityLoss)}% by targeting creditworthy prospects</p>
                <div className="mt-3">
                  <Badge variant="success">+{formatPercentage(results.improvements.improvedCloseRate)}% Close Rate</Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-400 text-2xl">⏰</span>
                </div>
                <h3 className="font-bold text-white mb-2">Time Optimization</h3>
                <p className="text-sm text-gray-400">Reduce follow-up time by {Math.round(results.improvements.reducedFollowUpTime)} minutes per lead by focusing on qualified prospects</p>
                <div className="mt-3">
                  <Badge variant="warning">-{formatPercentage(40)}% Follow-up Time</Badge>
                </div>
              </div>
            </div>
          </GlassCard>
        </InteractiveCard>

        {/* Investment Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Monthly Ad Spend */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-blue-400">📊</span>
              Current Ad Spend
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(results.currentCosts.monthlyCosts.adSpend)}
                </div>
                <div className="text-blue-400 font-semibold mb-1">Monthly Marketing Spend</div>
                <div className="text-sm text-gray-400">Generating leads for your sales team</div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cost per Lead:</span>
                  <span className="text-white">{formatCurrency(results.currentCosts.efficiency.costPerLead)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cost per Sale:</span>
                  <span className="text-white">{formatCurrency(results.currentCosts.efficiency.costPerSale)}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* GlassWallet Investment */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-neon-green">💎</span>
              GlassWallet Investment
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Monthly Platform Fee</span>
                  <span className="text-neon-green font-bold">{formatCurrency(results.futureCosts.monthlyCosts.glassWalletFee)}</span>
                </div>
              </div>
              <div className="p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Credit Costs</span>
                  <span className="text-neon-green font-bold">{formatCurrency(results.futureCosts.monthlyCosts.creditCosts)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total Investment</span>
                  <span className="text-neon-green">{formatCurrency(results.roiSummary.glassWalletInvestment)}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Net Benefit */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-yellow-400">🏆</span>
              Net Monthly Benefit
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Additional Revenue</span>
                  <span className="text-yellow-400 font-bold">+{formatCurrency(results.roiSummary.additionalMonthlyRevenue)}</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Redirected Time Revenue</span>
                  <span className="text-yellow-400 font-bold">+{formatCurrency(results.roiSummary.redirectedRevenueOpportunity)}</span>
                </div>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">GlassWallet Cost</span>
                  <span className="text-red-400 font-bold">-{formatCurrency(results.roiSummary.glassWalletInvestment)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-white">Net Benefit</span>
                  <span className="text-neon-green">{formatCurrency(results.roiSummary.netMonthlyBenefit)}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Navigation & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Navigation */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Calculate Another Scenario</h3>
            <p className="text-gray-400 mb-6">
              Want to try different numbers or show multiple scenarios? Go back to the calculator 
              to run another analysis with different metrics.
            </p>
            <NeonButton 
              variant="secondary" 
              size="lg" 
              className="w-full"
              onClick={() => router.push('/roi-calculator')}
            >
              ← Back to Calculator
            </NeonButton>
          </GlassCard>

          {/* Actions */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Share Results</h3>
            <p className="text-gray-400 mb-6">
              Save or share this ROI analysis for your sales presentations and prospect discussions.
            </p>
            <div className="flex gap-3">
              <NeonButton variant="secondary" className="flex-1">
                📄 Download Report
              </NeonButton>
              <NeonButton variant="secondary" className="flex-1">
                📧 Email Results
              </NeonButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}