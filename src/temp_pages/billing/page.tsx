'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  StatCard,
  Badge,
  CreditBalanceWidget,
  ToastProvider,
  useToast,
  Alert,
  Progress
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';

const BillingPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [creditBalance, setCreditBalance] = useState(167);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleBuyCredits = async (packageName: string, amount: number) => {
    setSelectedPackage(packageName);
    setLoading(true);
    try {
      // TODO: Implement Stripe checkout
      console.log(`Purchasing ${packageName}: ${amount} credits`);
      
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCreditBalance(prev => prev + amount);
      showToast({
        title: 'Credits Purchased Successfully!',
        message: `${amount} credits from ${packageName} added to your account`,
        variant: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Purchase Failed',
        message: 'Unable to process payment. Please try again.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  const creditPackages = [
    {
      name: 'Bronze Package',
      tier: 'bronze',
      credits: 50,
      price: 250,
      perCredit: 5.00,
      popular: false,
      description: 'Perfect for small businesses and testing',
      icon: '🥉',
      color: 'text-orange-400',
      gradient: 'from-orange-400 to-orange-600'
    },
    {
      name: 'Silver Package',
      tier: 'silver',
      credits: 200,
      price: 800,
      perCredit: 4.00,
      popular: true,
      description: 'Most popular for growing teams',
      savings: 'Save $1.00 per credit',
      icon: '🥈',
      color: 'text-gray-300',
      gradient: 'from-gray-300 to-gray-500'
    },
    {
      name: 'Gold Package',
      tier: 'gold',
      credits: 600,
      price: 2100,
      perCredit: 3.50,
      popular: false,
      description: 'Best value for high-volume operations',
      savings: 'Save $1.50 per credit',
      icon: '🥇',
      color: 'text-yellow-400',
      gradient: 'from-yellow-400 to-yellow-600'
    }
  ];

  const usageHistory = [
    { date: '2024-01-20', credits: 15, type: 'Credit Pull', description: 'Lead qualification batch' },
    { date: '2024-01-19', credits: 8, type: 'Credit Pull', description: 'Individual lead processing' },
    { date: '2024-01-18', credits: 23, type: 'Credit Pull', description: 'Bulk lead processing' },
    { date: '2024-01-17', credits: 5, type: 'Credit Pull', description: 'Manual verification' },
    { date: '2024-01-16', credits: 12, type: 'Credit Pull', description: 'Auto-qualification' },
  ];

  return (
    <AppShell 
      headerActions={
        <div className="flex gap-2">
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/settings')}
          >
            Settings
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Billing & Credits</h1>
          <p className="text-gray-400">Manage your credit balance, purchase credits, and view billing history</p>
        </div>

        {/* Credit Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <CreditBalanceWidget
              balance={creditBalance}
              maxCredits={300}
              size="lg"
              onBuyCredits={() => handleBuyCredits('quick-buy', 50)}
            />
          </div>
          <StatCard
            title="This Month Usage"
            value="63"
            icon="📊"
            variant="neon"
            trend="+15% from last month"
          />
          <StatCard
            title="Average Per Day"
            value="2.1"
            icon="📈"
            variant="success"
            trend="Within normal range"
          />
          <StatCard
            title="Next Billing"
            value="Feb 1"
            icon="📅"
            variant="warning"
            trend="7 days remaining"
          />
        </div>

        {/* Credit Packages */}
        <GlassCard className="p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Credit Packages</h2>
            <p className="text-gray-400">Choose the right package for your business needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creditPackages.map((pkg, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border transition-all duration-300 relative ${
                  pkg.popular 
                    ? 'border-neon-green bg-gradient-to-b from-neon-green/10 to-transparent' 
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="neon" size="sm">Most Popular</Badge>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-white">${pkg.price}</span>
                    {pkg.credits > 0 && (
                      <div className="text-sm text-gray-400">
                        {pkg.credits} credits
                      </div>
                    )}
                  </div>
                  {pkg.savings && (
                    <Badge variant="success" size="sm" className="mb-2">
                      {pkg.savings}
                    </Badge>
                  )}
                  <p className="text-xs text-gray-400">{pkg.description}</p>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Credits:</span>
                    <span className="text-white">{pkg.credits > 0 ? pkg.credits : 'Unlimited'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Per Credit:</span>
                    <span className="text-white">
                      {pkg.perCredit > 0 ? `$${pkg.perCredit.toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                </div>

                <NeonButton
                  className="w-full"
                  variant={pkg.popular ? 'primary' : 'secondary'}
                  onClick={() => handleBuyCredits(pkg.name, pkg.credits > 0 ? pkg.credits : 100)}
                  loading={loading}
                >
                  {pkg.credits > 0 ? 'Purchase' : 'Subscribe'}
                </NeonButton>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Usage History & Billing Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Usage */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Usage</h3>
              <NeonButton size="sm" variant="secondary">
                View All
              </NeonButton>
            </div>

            <div className="space-y-3">
              {usageHistory.map((usage, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="neon" size="sm">{usage.type}</Badge>
                      <span className="text-sm text-gray-400">
                        {new Date(usage.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{usage.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-medium">-{usage.credits}</span>
                    <p className="text-xs text-gray-400">credits</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Account & Billing Info */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Account Information</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Current Plan</span>
                  <Badge variant="success">Professional</Badge>
                </div>
                <p className="text-sm text-gray-400">200 credits/month</p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Next Billing Date</span>
                  <span className="text-white">February 1, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Amount</span>
                  <span className="text-white">$179.99</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Payment Method</span>
                  <Badge variant="neon" size="sm">Visa ****1234</Badge>
                </div>
                <NeonButton size="sm" variant="secondary" className="mt-2">
                  Update Payment Method
                </NeonButton>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg border border-blue-500/20">
                <h4 className="text-white font-medium mb-2">Need More Credits?</h4>
                <p className="text-sm text-gray-300 mb-3">
                  Running low on credits? Upgrade your plan or purchase additional credits to keep your operations running smoothly.
                </p>
                <div className="flex gap-2">
                  <NeonButton size="sm" onClick={() => handleBuyCredits('quick-50', 50)}>
                    Buy 50 Credits
                  </NeonButton>
                  <NeonButton size="sm" variant="secondary">
                    Upgrade Plan
                  </NeonButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Billing History Coming Soon */}
        <Alert variant="info" title="Coming Soon">
          <div className="flex items-center justify-between">
            <span>Detailed billing history and invoice downloads will be available in the next update.</span>
            <NeonButton size="sm" variant="secondary">
              Subscribe for Updates
            </NeonButton>
          </div>
        </Alert>
      </div>
    </AppShell>
  );
};

export default function BillingPageWrapper() {
  return (
    <ToastProvider>
      <BillingPage />
    </ToastProvider>
  );
}