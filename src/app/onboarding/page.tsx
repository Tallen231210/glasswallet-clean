'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React from 'react';
import { useRouter } from 'next/navigation';
import { AccountType } from '@/types/user';
import { useUser } from '@/contexts/UserContext';
import { AccountTypeSelector } from '@/components/ui/AccountTypeSelector';
import { GlassCard } from '@/components/ui/GlassCard';

export default function OnboardingPage() {
  const router = useRouter();
  const { setAccountType } = useUser();

  const handleAccountTypeSelect = (accountType: AccountType) => {
    setAccountType(accountType);
    
    // Redirect to appropriate dashboard after selection
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-7xl">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-electric-green rounded-2xl flex items-center justify-center shadow-2xl shadow-neon-green/30">
                <span className="text-deep-navy-start font-bold text-2xl">G</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-neon-green rounded-full animate-pulse shadow-lg shadow-neon-green/50"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-electric-green">GlassWallet</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The AI-powered credit data platform that transforms lead qualification with real-time credit intelligence and automated pixel optimization.
          </p>
        </div>

        {/* Account Type Selection */}
        <AccountTypeSelector
          onSelect={handleAccountTypeSelect}
          className="mb-8"
          showComparison={true}
        />

        {/* Trust Indicators */}
        <div className="mt-16">
          <GlassCard className="p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-6">Trusted by Industry Leaders</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'FCRA Compliant', icon: '🛡️' },
                { name: 'Bank-Grade Security', icon: '🔒' },
                { name: '99.9% Uptime SLA', icon: '⚡' },
                { name: 'Real-Time Processing', icon: '🚀' }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="text-3xl">{item.icon}</div>
                  <p className="text-sm font-medium text-gray-300">{item.name}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Get Started CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            Need help choosing the right plan? 
            <span className="text-neon-green cursor-pointer hover:underline ml-1">
              Schedule a consultation with our team
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}