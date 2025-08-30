'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { CreditPullForm } from '@/components/credit/CreditPullForm';
import { CreditBalance } from '@/components/billing/CreditBalance';
import { CreditPullResponse } from '@/lib/services/crsApiService';

export default function NewLeadPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [lastResult, setLastResult] = useState<CreditPullResponse | null>(null);

  const handleCreditPullComplete = (result: CreditPullResponse) => {
    setLastResult(result);
    // Could redirect to leads list or show success message
  };

  const handleStartNewPull = () => {
    setShowForm(true);
    setLastResult(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    router.push('/leads');
  };

  if (showForm) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-black">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-gray-700/30">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    New Credit Pull
                  </h1>
                  <p className="text-gray-400">
                    Perform credit qualification for a new lead
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="neon">Demo Mode</Badge>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            <CreditPullForm
              onCreditPullComplete={handleCreditPullComplete}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-700/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Add New Lead
                </h1>
                <p className="text-gray-400">
                  Start credit qualification for a new lead
                </p>
              </div>
              <Badge variant="neon">Demo Mode Active</Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
          {/* Credit Balance Display */}
          <div className="max-w-2xl">
            <CreditBalance 
              compact={true}
              onPurchaseCredits={() => router.push('/billing')}
            />
          </div>

          {/* Main Action Card */}
          <div className="max-w-4xl mx-auto">
            <GlassCard className="text-center py-12">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-4xl">👤</span>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Ready to Process a New Lead?
                  </h2>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Click below to start the FCRA-compliant credit qualification process.
                    Each pull uses 1 credit from your balance.
                  </p>
                </div>

                <NeonButton
                  onClick={handleStartNewPull}
                  className="px-8 py-3 text-lg"
                >
                  Start Credit Pull
                </NeonButton>
              </div>
            </GlassCard>
          </div>

          {/* Demo Notice */}
          <div className="max-w-4xl mx-auto">
            <GlassCard className="border-blue-500/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-400 text-sm">ℹ</span>
                </div>
                <div>
                  <h4 className="text-blue-400 font-semibold mb-2">Demo Mode Information</h4>
                  <p className="text-gray-300 text-sm">
                    <strong>Demo Notice:</strong> This system uses mock credit data for demonstration.
                    Real credit pulls will be processed when CRS API access is enabled.
                    Each demo pull uses 1 credit from your balance.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Last Result Summary */}
          {lastResult && (
            <div className="max-w-4xl mx-auto">
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Last Credit Pull Result
                  </h3>
                  <Badge variant={lastResult.success ? 'success' : 'danger'}>
                    {lastResult.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>

                {lastResult.success && lastResult.creditScores && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-neon-green">
                        {lastResult.creditScores[0]?.score}
                      </div>
                      <div className="text-sm text-gray-400">Credit Score</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-lg font-semibold text-white">
                        {lastResult.subject.firstName} {lastResult.subject.lastName}
                      </div>
                      <div className="text-sm text-gray-400">Lead Name</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-lg font-semibold text-white">
                        {lastResult.qualificationSuggestion?.qualified ? 'Qualified' : 'Not Qualified'}
                      </div>
                      <div className="text-sm text-gray-400">Status</div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-4">
                  <NeonButton
                    onClick={handleStartNewPull}
                    size="sm"
                  >
                    New Credit Pull
                  </NeonButton>
                  <button
                    onClick={() => router.push('/leads')}
                    className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors text-sm"
                  >
                    View All Leads
                  </button>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Quick Actions */}
          <div className="max-w-4xl mx-auto">
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">
                📋 Quick Actions
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/leads')}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="text-white font-medium">View Leads</p>
                      <p className="text-gray-400 text-sm">See all processed leads</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/leads/rules')}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <p className="text-white font-medium">Auto Rules</p>
                      <p className="text-gray-400 text-sm">Set qualification rules</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/pixels')}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="text-white font-medium">Pixel Sync</p>
                      <p className="text-gray-400 text-sm">Connect ad platforms</p>
                    </div>
                  </div>
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}