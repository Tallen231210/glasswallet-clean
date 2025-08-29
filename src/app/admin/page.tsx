'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AccountType } from '@/types/user';
import { useUser } from '@/contexts/UserContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';

export default function AdminModePage() {
  const router = useRouter();
  const { setAccountType, accountType } = useUser();

  const handleSwitchToAdmin = () => {
    setAccountType(AccountType.PLATFORM_ADMIN);
    setTimeout(() => {
      router.push('/admin');
    }, 500);
  };

  const handleSwitchToBusinessOwner = () => {
    setAccountType(AccountType.BUSINESS_OWNER);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  const handleSwitchToSalesRep = () => {
    setAccountType(AccountType.SALES_REP);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30">
            <span className="text-white font-bold text-2xl">👑</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Account Type Switcher
          </h1>
          <p className="text-gray-400 mb-8">
            Switch between different account types for testing purposes. In production, this would be controlled by authentication.
          </p>

          {/* Current Account Type */}
          <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-gray-400 mb-2">Current Account Type:</p>
            <div className="flex items-center justify-center gap-3">
              <Badge variant={
                accountType === AccountType.PLATFORM_ADMIN ? 'error' :
                accountType === AccountType.BUSINESS_OWNER ? 'success' : 'neon'
              } size="lg">
                {accountType === AccountType.PLATFORM_ADMIN ? 'Platform Admin' :
                 accountType === AccountType.BUSINESS_OWNER ? 'Business Owner' : 'Sales Rep'}
              </Badge>
            </div>
          </div>

          {/* Switch Options */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="text-2xl mb-2">👑</div>
                <h3 className="font-bold text-white mb-2">Platform Admin</h3>
                <p className="text-xs text-gray-400 mb-4">Full system access & control</p>
                <NeonButton 
                  size="sm" 
                  variant={accountType === AccountType.PLATFORM_ADMIN ? 'primary' : 'secondary'}
                  onClick={handleSwitchToAdmin}
                  disabled={accountType === AccountType.PLATFORM_ADMIN}
                  className="w-full"
                >
                  {accountType === AccountType.PLATFORM_ADMIN ? 'Current' : 'Switch'}
                </NeonButton>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="font-bold text-white mb-2">Business Owner</h3>
                <p className="text-xs text-gray-400 mb-4">Client account with full features</p>
                <NeonButton 
                  size="sm" 
                  variant={accountType === AccountType.BUSINESS_OWNER ? 'primary' : 'secondary'}
                  onClick={handleSwitchToBusinessOwner}
                  disabled={accountType === AccountType.BUSINESS_OWNER}
                  className="w-full"
                >
                  {accountType === AccountType.BUSINESS_OWNER ? 'Current' : 'Switch'}
                </NeonButton>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="text-2xl mb-2">👤</div>
                <h3 className="font-bold text-white mb-2">Sales Rep</h3>
                <p className="text-xs text-gray-400 mb-4">Individual sales account</p>
                <NeonButton 
                  size="sm" 
                  variant={accountType === AccountType.SALES_REP ? 'primary' : 'secondary'}
                  onClick={handleSwitchToSalesRep}
                  disabled={accountType === AccountType.SALES_REP}
                  className="w-full"
                >
                  {accountType === AccountType.SALES_REP ? 'Current' : 'Switch'}
                </NeonButton>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="text-yellow-400 text-lg">⚠️</div>
              <div className="text-sm text-left">
                <p className="text-white font-medium mb-1">Development Tool</p>
                <p className="text-gray-400">
                  This page is for development and testing only. In production, account types would be 
                  determined by authentication and database records. Only you and your co-partner would 
                  have Platform Admin access.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <NeonButton variant="secondary" onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}