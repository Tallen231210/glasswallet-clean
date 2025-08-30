'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { creditService } from '@/lib/services/creditService';
import { CREDIT_PACKAGES } from '@/types/billing';

function BillingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get package info from URL params
    const packageId = searchParams.get('package');
    const sessionId = searchParams.get('session_id');

    if (packageId) {
      const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
      setPackageData(pkg);
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Processing your purchase...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-400">
            Your purchase has been processed successfully
          </p>
        </div>

        {/* Purchase Details */}
        <GlassCard>
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <Badge variant="success" size="lg">
                ✓ Payment Confirmed
              </Badge>
            </div>

            {packageData && (
              <>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {packageData.name} Package
                  </h3>
                  <p className="text-gray-400">
                    {packageData.description}
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-neon-green">
                        {packageData.totalCredits}
                      </div>
                      <div className="text-sm text-gray-400">Credits Added</div>
                      {packageData.bonusCredits > 0 && (
                        <div className="text-xs text-green-400 mt-1">
                          +{packageData.bonusCredits} bonus credits included!
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        ${packageData.price}
                      </div>
                      <div className="text-sm text-gray-400">Total Paid</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${packageData.pricePerCredit.toFixed(2)} per credit
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Credits have been added to your account
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Receipt has been sent to your email
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Credits never expire - use them whenever you need
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Next Steps */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">
            🚀 What's Next?
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-neon-green/20 rounded-full flex items-center justify-center">
                <span className="text-neon-green">1</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Start Processing Leads</p>
                <p className="text-gray-400 text-sm">
                  Use your credits to perform credit pulls and qualify leads
                </p>
              </div>
              <NeonButton 
                size="sm" 
                onClick={() => router.push('/leads/new')}
              >
                Add Leads
              </NeonButton>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-blue-400">2</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Set Up Auto-Tagging</p>
                <p className="text-gray-400 text-sm">
                  Configure rules to automatically qualify leads based on credit scores
                </p>
              </div>
              <button 
                className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors text-sm"
                onClick={() => router.push('/leads/rules')}
              >
                Configure Rules
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-purple-400">3</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Connect Your Pixels</p>
                <p className="text-gray-400 text-sm">
                  Sync qualified leads to your advertising platforms for better targeting
                </p>
              </div>
              <button 
                className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors text-sm"
                onClick={() => router.push('/pixels')}
              >
                Connect Pixels
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <NeonButton onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </NeonButton>
          <button
            onClick={() => router.push('/billing')}
            className="px-6 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            View Billing
          </button>
        </div>

        {/* Support Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help getting started? Contact our support team</p>
          <p className="mt-1">
            <a 
              href="mailto:support@glasswallet.io" 
              className="text-neon-green hover:text-neon-green/80"
            >
              support@glasswallet.io
            </a>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </AppLayout>
    }>
      <BillingSuccessContent />
    </Suspense>
  );
}