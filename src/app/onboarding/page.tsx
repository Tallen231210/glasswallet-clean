'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="p-6 space-y-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🚀 Welcome to GlassWallet!</h1>
          <p className="text-gray-400 text-lg">Let's get your credit data platform set up</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-white mb-2">Account Created</h3>
            <p className="text-gray-400 text-sm">Your GlassWallet account is ready</p>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold text-white mb-2">Platform Setup</h3>
            <p className="text-gray-400 text-sm">Configure your credit API integrations</p>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">Start Processing</h3>
            <p className="text-gray-400 text-sm">Begin lead qualification and pixel sync</p>
          </GlassCard>
        </div>

        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Your GlassWallet platform is configured and ready for credit data processing. 
            Access your dashboard to begin managing leads and integrating with advertising pixels.
          </p>
          
          <div className="flex gap-4 justify-center">
            <NeonButton onClick={() => router.push('/dashboard')} className="px-8 py-3">
              Go to Dashboard
            </NeonButton>
            <NeonButton variant="secondary" onClick={() => router.push('/leads')} className="px-8 py-3">
              View Leads
            </NeonButton>
          </div>
        </GlassCard>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            💡 Need help? Check out our documentation or contact support
          </p>
        </div>
      </div>
    </div>
  );
}