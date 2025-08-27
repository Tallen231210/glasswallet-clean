'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { NeonButton } from '@/components/ui/NeonButton';
import { FormField } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { InteractiveCard } from '@/components/ui/InteractiveCard';
import { calculateROI } from '@/utils/roiCalculations';
import { usePermissions } from '@/contexts/UserContext';

interface ROIInputs {
  // Sales Call Metrics (from prospect interviews)
  adSpend: number;              // Monthly ad spend
  callsBooked: number;          // Monthly calls booked
  currentQualificationRate: number; // % of current calls that are with people who have money (0-100)
  showRate: number;             // % who show up (0-100)
  pitchRate: number;            // % who get through full presentation (0-100)
  affordabilityLossRate: number; // % lost to affordability (0-100)
  closeRate: number;            // % who actually buy (0-100)
  aov: number;                  // Average Order Value (deal size)
  collectedPercent: number;     // % of revenue actually collected (0-100)
  avgCallLength: number;        // Average call length in minutes
  followUpTimePerLead: number;  // Time spent in minutes on follow up per lead
}

export default function ROICalculatorPage() {
  const router = useRouter();
  const [isCalculating, setIsCalculating] = useState(false);
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
  
  const [inputs, setInputs] = useState<ROIInputs>({
    adSpend: 0,
    callsBooked: 0,
    currentQualificationRate: 30, // Default to 30% as user mentioned
    showRate: 0,
    pitchRate: 0,
    affordabilityLossRate: 0,
    closeRate: 0,
    aov: 0,
    collectedPercent: 0,
    avgCallLength: 0,
    followUpTimePerLead: 0
  });

  const handleInputChange = (field: keyof ROIInputs, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };


  return (
    <AppShell
      headerTitle="ROI Calculator"
      headerSubtitle="Calculate your potential return on investment with GlassWallet"
    >
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-green rounded-xl flex items-center justify-center shadow-lg shadow-neon-green/20">
                <span className="text-deep-navy-start font-bold text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ROI Calculator</h1>
                <p className="text-gray-400">
                  Sales Call Metrics • Enter your current numbers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="neon">Interactive</Badge>
              <Badge variant="success">Sales Tool</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <InteractiveCard hoverEffect="glow">
              <GlassCard className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
                      <span className="text-neon-green font-bold">📞</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">Your Sales Call Metrics</h2>
                    <p className="text-gray-400 ml-3">Enter the numbers you track from prospect calls</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Monthly Ad Spend ($)" required>
                      <Input
                        type="number"
                        value={inputs.adSpend || ''}
                        onChange={(e) => handleInputChange('adSpend', parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 10000"
                        min="0"
                        step="100"
                      />
                      <p className="text-xs text-gray-400 mt-1">Total monthly marketing/advertising budget</p>
                    </FormField>

                    <FormField label="Calls Booked (Monthly)" required>
                      <Input
                        type="number"
                        value={inputs.callsBooked || ''}
                        onChange={(e) => handleInputChange('callsBooked', parseInt(e.target.value) || 0)}
                        placeholder="e.g. 200"
                        min="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">How many calls do you schedule per month?</p>
                    </FormField>

                    <FormField label="Current Qualification Rate (%)" required>
                      <Input
                        type="number"
                        value={inputs.currentQualificationRate || ''}
                        onChange={(e) => handleInputChange('currentQualificationRate', parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 30"
                        min="0"
                        max="100"
                        step="1"
                      />
                      <p className="text-xs text-gray-400 mt-1">% of your calls with people who actually have money</p>
                    </FormField>

                    <FormField label="Show Rate (%)" required>
                      <Input
                        type="number"
                        value={inputs.showRate || ''}
                        onChange={(e) => handleInputChange('showRate', parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 75"
                        min="0"
                        max="100"
                        step="1"
                      />
                      <p className="text-xs text-gray-400 mt-1">% of booked calls that actually show up</p>
                    </FormField>

                    <FormField label="Pitch Rate (%)" required>
                      <Input
                        type="number"
                        value={inputs.pitchRate || ''}
                        onChange={(e) => handleInputChange('pitchRate', parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 80"
                        min="0"
                        max="100"
                        step="1"
                      />
                      <p className="text-xs text-gray-400 mt-1">% who get through your full presentation</p>
                    </FormField>

                    <FormField label="Lost to Affordability (%)" required>
                      <Input
                        type="number"
                        value={inputs.affordabilityLossRate || ''}
                        onChange={(e) => handleInputChange('affordabilityLossRate', parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 30"
                        min="0"
                        max="100"
                        step="1"
                      />
                      <p className="text-xs text-gray-400 mt-1">% who say they can't afford your solution</p>
                    </FormField>

                    <FormField label="Close Rate (%)" required>
                      <Input
                        type="number"
                        value={inputs.closeRate || ''}
                        onChange={(e) => handleInputChange('closeRate', parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 20"
                        min="0"
                        max="100"
                        step="1"
                      />
                      <p className="text-xs text-gray-400 mt-1">% of qualified prospects who actually buy</p>
                    </FormField>

                    <FormField label="Average Order Value ($)" required>
                      <Input
                        type="number"
                        value={inputs.aov || ''}
                        onChange={(e) => handleInputChange('aov', parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 5000"
                        min="0"
                        step="100"
                      />
                      <p className="text-xs text-gray-400 mt-1">Average deal size when they buy</p>
                    </FormField>

                    <FormField label="Collection Rate (%)" required>
                      <Input
                        type="number"
                        value={inputs.collectedPercent || ''}
                        onChange={(e) => handleInputChange('collectedPercent', parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 95"
                        min="0"
                        max="100"
                        step="1"
                      />
                      <p className="text-xs text-gray-400 mt-1">% of revenue you actually collect</p>
                    </FormField>

                    <FormField label="Average Call Length (minutes)" required>
                      <Input
                        type="number"
                        value={inputs.avgCallLength || ''}
                        onChange={(e) => handleInputChange('avgCallLength', parseInt(e.target.value) || 0)}
                        placeholder="e.g. 45"
                        min="1"
                      />
                      <p className="text-xs text-gray-400 mt-1">How long is your typical sales call?</p>
                    </FormField>

                    <FormField label="Follow-up Time per Lead (minutes)" required>
                      <Input
                        type="number"
                        value={inputs.followUpTimePerLead || ''}
                        onChange={(e) => handleInputChange('followUpTimePerLead', parseInt(e.target.value) || 0)}
                        placeholder="e.g. 15"
                        min="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">Average time spent following up per lead</p>
                    </FormField>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-400 text-lg">💡</div>
                      <div className="text-sm">
                        <p className="text-white font-medium mb-1">How GlassWallet Helps</p>
                        <p className="text-gray-400">
                          We'll pre-qualify leads based on credit and affordability before they get to your calendar, 
                          improving your show rates, reducing affordability objections, and increasing close rates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculate Button */}
                <div className="flex justify-end pt-8 border-t border-white/10 mt-8">
                  <NeonButton 
                    onClick={async () => {
                      setIsCalculating(true);
                      
                      // Validate required fields
                      const requiredFields: (keyof ROIInputs)[] = ['adSpend', 'callsBooked', 'showRate', 'pitchRate', 'closeRate', 'aov', 'collectedPercent', 'avgCallLength'];
                      const hasAllRequired = requiredFields.every(field => inputs[field] > 0);
                      
                      if (!hasAllRequired) {
                        alert('Please fill out all required fields with values greater than 0');
                        setIsCalculating(false);
                        return;
                      }

                      // Simulate calculation time for better UX
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      
                      // Calculate ROI
                      const results = calculateROI(inputs);
                      
                      // Store results in sessionStorage for the results page
                      sessionStorage.setItem('roiInputs', JSON.stringify(inputs));
                      sessionStorage.setItem('roiResults', JSON.stringify(results));
                      
                      // Navigate to results
                      router.push('/roi-calculator/results');
                    }}
                    disabled={isCalculating}
                    className="min-w-40"
                  >
                    {isCalculating ? '⏳ Calculating...' : '📊 Calculate My ROI'}
                  </NeonButton>
                </div>
              </GlassCard>
            </InteractiveCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Tips */}
            <GlassCard className="p-4">
              <h3 className="font-semibold text-white mb-3 text-sm">💡 Tips</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p>✓ Use your actual numbers from last 3 months</p>
                <p>✓ Be honest about current performance</p>
                <p>✓ Include all follow-up time (calls, texts, emails)</p>
                <p>✓ Use percentages, not decimals</p>
              </div>
            </GlassCard>

            {/* Sample Numbers */}
            <GlassCard className="p-4">
              <h3 className="font-semibold text-white mb-3 text-sm">📊 Typical Numbers</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Show Rate:</span>
                  <span className="text-white">60-80%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pitch Rate:</span>
                  <span className="text-white">75-90%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Close Rate:</span>
                  <span className="text-neon-green">15-25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Affordability Loss:</span>
                  <span className="text-white">25-40%</span>
                </div>
              </div>
            </GlassCard>

            {/* What We Calculate */}
            <GlassCard className="p-4">
              <h3 className="font-semibold text-white mb-3 text-sm">🎯 What We'll Show</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p>• Current funnel efficiency</p>
                <p>• Cost per sale breakdown</p>
                <p>• Time investment per sale</p>
                <p>• Projected improvements with GlassWallet</p>
                <p>• Monthly ROI and payback period</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}