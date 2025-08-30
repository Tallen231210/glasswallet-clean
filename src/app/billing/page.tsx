'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { CreditBalance } from '@/components/billing/CreditBalance';
import { CreditPackages } from '@/components/billing/CreditPackages';
import { CreditPackage, PLATFORM_SUBSCRIPTION } from '@/types/billing';
import { formatCurrency } from '@/lib/services/creditService';
import { useUser } from '@clerk/nextjs';

export default function BillingPage() {
  const { user } = useUser();
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [processing, setProcessing] = useState(false);

  const handlePurchaseCredits = () => {
    setShowPurchaseFlow(true);
  };

  const handleSelectPackage = async (packageData: CreditPackage) => {
    setSelectedPackage(packageData);
    // Here we would integrate with Stripe
    // For now, just show the selection
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage) return;
    
    setProcessing(true);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          type: 'credits'
        }),
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        // Redirect to checkout URL (in demo, this redirects to success page)
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Billing & Credits
            </h1>
            <p className="text-gray-400">
              Manage your subscription and credit balance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="success">Active Subscription</Badge>
            <NeonButton onClick={handlePurchaseCredits}>
              Buy Credits
            </NeonButton>
          </div>
        </div>

        {/* Subscription Status */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neon-green/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Platform Subscription
                </h3>
                <p className="text-gray-400">
                  Access to GlassWallet platform and all features
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-neon-green">
                {formatCurrency(PLATFORM_SUBSCRIPTION.monthlyPrice)}
              </div>
              <div className="text-sm text-gray-400">per month</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {PLATFORM_SUBSCRIPTION.features.slice(0, 8).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-neon-green">✓</span>
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {!showPurchaseFlow ? (
          <>
            {/* Current Credit Balance */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CreditBalance onPurchaseCredits={handlePurchaseCredits} />
              </div>
              <div className="space-y-4">
                {/* Quick Actions */}
                <GlassCard>
                  <h4 className="text-lg font-semibold text-white mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <NeonButton 
                      onClick={handlePurchaseCredits}
                      className="w-full"
                      size="sm"
                    >
                      Purchase Credits
                    </NeonButton>
                    <button className="w-full px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors text-sm">
                      View Transaction History
                    </button>
                    <button className="w-full px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors text-sm">
                      Download Invoices
                    </button>
                  </div>
                </GlassCard>

                {/* Usage Tips */}
                <GlassCard>
                  <h4 className="text-lg font-semibold text-white mb-4">💡 Tips</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-neon-green mt-1">•</span>
                      <span className="text-gray-300">
                        Credits never expire - buy in bulk to save money
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-neon-green mt-1">•</span>
                      <span className="text-gray-300">
                        Gold and Platinum packages include bonus credits
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-neon-green mt-1">•</span>
                      <span className="text-gray-300">
                        Each credit pull provides instant lead qualification
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Recent Transactions */}
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Recent Transactions
                </h3>
                <button className="text-neon-green hover:text-neon-green/80 text-sm">
                  View All
                </button>
              </div>
              
              {/* Mock Transaction Data */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 text-sm">+</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Silver Package Purchase</p>
                      <p className="text-gray-400 text-sm">Added 100 credits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{formatCurrency(449)}</p>
                    <p className="text-gray-400 text-sm">2 days ago</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                      <span className="text-red-400 text-sm">-</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Credit Pull Usage</p>
                      <p className="text-gray-400 text-sm">Used 5 credits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">-5 credits</p>
                    <p className="text-gray-400 text-sm">1 hour ago</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </>
        ) : (
          <>
            {/* Purchase Flow */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Purchase Credits</h2>
                <button
                  onClick={() => setShowPurchaseFlow(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ← Back to Billing
                </button>
              </div>

              <CreditPackages
                onSelectPackage={handleSelectPackage}
                loading={processing}
                selectedPackageId={selectedPackage?.id}
              />

              {selectedPackage && (
                <GlassCard>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Purchase Summary
                    </h3>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">
                          {selectedPackage.name} Package
                        </p>
                        <p className="text-gray-400 text-sm">
                          {selectedPackage.totalCredits} credits total
                          {selectedPackage.bonusCredits > 0 && (
                            <span className="text-green-400">
                              {' '}(+{selectedPackage.bonusCredits} bonus)
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          {formatCurrency(selectedPackage.price)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatCurrency(selectedPackage.pricePerCredit)} per credit
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <NeonButton
                        onClick={handleConfirmPurchase}
                        disabled={processing}
                        className="flex-1"
                      >
                        {processing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : (
                          `Purchase ${selectedPackage.name} Package`
                        )}
                      </NeonButton>
                      <button
                        onClick={() => setSelectedPackage(null)}
                        disabled={processing}
                        className="px-6 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}