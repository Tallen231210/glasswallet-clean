'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { InteractiveCard } from '@/components/ui/InteractiveCard';

interface CreditPackage {
  name: string;
  tier: 'bronze' | 'silver' | 'gold';
  price: number;
  credits: number;
  pricePerCredit: number;
  savings?: string;
  badge?: string;
  features: string[];
  color: string;
  gradient: string;
}

const creditPackages: CreditPackage[] = [
  {
    name: 'Bronze Package',
    tier: 'bronze',
    price: 250,
    credits: 50,
    pricePerCredit: 5.00,
    features: [
      '50 credit checks',
      'Basic support',
      'Standard integrations',
      'Email notifications'
    ],
    color: 'text-orange-400',
    gradient: 'from-orange-400 to-orange-600'
  },
  {
    name: 'Silver Package',
    tier: 'silver',
    price: 800,
    credits: 200,
    pricePerCredit: 4.00,
    savings: 'Save $1.00 per credit',
    badge: 'Most Popular',
    features: [
      '200 credit checks',
      'Priority support',
      'Advanced integrations',
      'Real-time notifications',
      'Custom webhooks'
    ],
    color: 'text-gray-300',
    gradient: 'from-gray-300 to-gray-500'
  },
  {
    name: 'Gold Package',
    tier: 'gold',
    price: 2100,
    credits: 600,
    pricePerCredit: 3.50,
    savings: 'Save $1.50 per credit',
    badge: 'Best Value',
    features: [
      '600 credit checks',
      'Premium support',
      'All integrations',
      'Real-time notifications',
      'Custom webhooks',
      'Dedicated account manager',
      'API access'
    ],
    color: 'text-yellow-400',
    gradient: 'from-yellow-400 to-yellow-600'
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePackageSelect = (packageName: string) => {
    setSelectedPackage(packageName);
    // Mock purchase flow
    setTimeout(() => {
      alert(`Mock purchase: ${packageName} selected! Stripe integration coming soon.`);
      setSelectedPackage(null);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AppShell
      headerTitle="Pricing"
      headerSubtitle="Choose the perfect credit package for your business needs"
    >
      <div className="p-6 space-y-12 max-w-7xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-neon-green to-electric-green rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-neon-green/30">
            <span className="text-deep-navy-start font-bold text-3xl">💎</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Start with our platform subscription, then buy credit packages as you need them. 
            More credits = bigger savings.
          </p>
          
          {/* Platform Fee Highlight */}
          <div className="inline-block">
            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center">
                  <span className="text-neon-green text-xl">🏢</span>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">Platform Access</h3>
                  <p className="text-gray-300">$199/month recurring subscription</p>
                  <p className="text-sm text-gray-400">Includes software access, integrations & support</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Credit Packages */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Credit Packages</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Purchase credits as needed. No expiration, no waste. Volume discounts automatically applied.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {creditPackages.map((pkg, index) => (
              <InteractiveCard key={pkg.name} hoverEffect="lift">
                <div className="relative">
                  {pkg.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge 
                        variant={pkg.tier === 'silver' ? 'neon' : 'warning'}
                        className="px-4 py-1"
                      >
                        {pkg.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <GlassCard className="p-8 h-full relative overflow-hidden">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${pkg.gradient} opacity-5`}></div>
                    
                    {/* Package Icon */}
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${pkg.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <span className="text-white font-bold text-2xl">
                          {pkg.tier === 'bronze' ? '🥉' : pkg.tier === 'silver' ? '🥈' : '🥇'}
                        </span>
                      </div>
                      <h3 className={`text-2xl font-bold ${pkg.color} mb-2`}>{pkg.name}</h3>
                      {pkg.savings && (
                        <p className="text-neon-green font-semibold text-sm">{pkg.savings}</p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="text-center mb-8">
                      <div className="text-4xl font-bold text-white mb-2">
                        {formatCurrency(pkg.price)}
                      </div>
                      <div className="text-gray-300 mb-2">
                        {pkg.credits} credits included
                      </div>
                      <div className="text-sm text-gray-400">
                        ${pkg.pricePerCredit.toFixed(2)} per credit
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-neon-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-neon-green text-xs">✓</span>
                          </div>
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-auto">
                      <NeonButton
                        onClick={() => handlePackageSelect(pkg.name)}
                        disabled={selectedPackage === pkg.name}
                        className="w-full"
                        variant={pkg.tier === 'silver' ? 'primary' : 'secondary'}
                      >
                        {selectedPackage === pkg.name ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : (
                          `Purchase ${pkg.name}`
                        )}
                      </NeonButton>
                    </div>
                  </GlassCard>
                </div>
              </InteractiveCard>
            ))}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Volume Savings</h3>
              <p className="text-gray-300 mb-4">
                The more credits you buy, the more you save. Gold package customers save $1.50 per credit compared to Bronze.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bronze:</span>
                  <span className="text-orange-400">$5.00/credit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Silver:</span>
                  <span className="text-gray-300">$4.00/credit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gold:</span>
                  <span className="text-yellow-400">$3.50/credit</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-400 text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Flexible Usage</h3>
              <p className="text-gray-300 mb-4">
                Credits never expire. Buy when you need them, use them when you're ready. Perfect for seasonal businesses or varying lead volumes.
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div>✓ No expiration dates</div>
                <div>✓ Use credits anytime</div>
                <div>✓ Purchase on-demand</div>
                <div>✓ Scale up or down easily</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-3">What's included in the $199 platform fee?</h3>
              <p className="text-gray-300 text-sm">
                Full access to the GlassWallet platform, including CRM integrations, webhook management, 
                lead qualification tools, and basic support.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-3">Do credits expire?</h3>
              <p className="text-gray-300 text-sm">
                No! Credits never expire. Buy them when you need them and use them at your own pace. 
                Perfect for businesses with varying lead volumes.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-3">Can I buy multiple packages?</h3>
              <p className="text-gray-300 text-sm">
                Absolutely! You can purchase any combination of credit packages. All credits are added to your account balance.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-3">What if I need more than 600 credits?</h3>
              <p className="text-gray-300 text-sm">
                Purchase multiple Gold packages or contact us for enterprise pricing on larger volumes. 
                We can create custom packages for high-volume users.
              </p>
            </GlassCard>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <GlassCard className="p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses using GlassWallet to qualify leads and increase conversion rates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NeonButton 
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3"
              >
                Start Your Free Trial
              </NeonButton>
              <NeonButton 
                variant="secondary"
                onClick={() => router.push('/contact')}
                className="px-8 py-3"
              >
                Contact Sales
              </NeonButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}