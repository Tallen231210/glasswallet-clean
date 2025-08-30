'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { UserCreditBalance } from '@/types/billing';
import { creditService, formatCurrency } from '@/lib/services/creditService';
import { useUser } from '@clerk/nextjs';

interface CreditBalanceProps {
  onPurchaseCredits?: () => void;
  compact?: boolean;
}

export const CreditBalance: React.FC<CreditBalanceProps> = ({ 
  onPurchaseCredits, 
  compact = false 
}) => {
  const { user } = useUser();
  const [balance, setBalance] = useState<UserCreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadBalance();
    }
  }, [user?.id]);

  const loadBalance = () => {
    if (!user?.id) return;
    
    try {
      const userBalance = creditService.getUserBalance(user.id);
      setBalance(userBalance);
    } catch (error) {
      console.error('Failed to load credit balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GlassCard className="animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-white/20 rounded"></div>
          <div className="h-8 bg-white/20 rounded"></div>
          <div className="h-6 bg-white/20 rounded w-2/3"></div>
        </div>
      </GlassCard>
    );
  }

  if (!balance) {
    return (
      <GlassCard className="border-red-500/30">
        <div className="text-center text-red-400">
          <p>Unable to load credit balance</p>
          <NeonButton size="sm" onClick={loadBalance} className="mt-2">
            Retry
          </NeonButton>
        </div>
      </GlassCard>
    );
  }

  const usagePercentage = balance.totalCredits > 0 
    ? (balance.usedCredits / balance.totalCredits) * 100 
    : 0;

  const isLowBalance = creditService.checkLowBalanceAlert(user?.id || '');

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center">
              <div 
                className="absolute inset-0 rounded-full border-4 border-neon-green transition-all duration-300"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + (100 - usagePercentage) * 0.5}% 0%, ${50 + (100 - usagePercentage) * 0.433}% 25%, ${50 + (100 - usagePercentage) * 0.25}% 43.3%, 50% 50%)`
                }}
              />
              <span className="text-sm font-bold text-white relative z-10">
                {balance.availableCredits}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Credits Available</p>
            <p className="text-xs text-gray-400">
              {balance.usedCredits} of {balance.totalCredits} used
            </p>
          </div>
        </div>

        {isLowBalance && (
          <Badge variant="warning" size="sm">
            Low Balance
          </Badge>
        )}

        {onPurchaseCredits && (
          <NeonButton size="sm" onClick={onPurchaseCredits}>
            Buy Credits
          </NeonButton>
        )}
      </div>
    );
  }

  return (
    <GlassCard className={isLowBalance ? 'border-yellow-500/30' : ''}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Credit Balance</h3>
            <p className="text-gray-400 text-sm">Track your credit usage and purchases</p>
          </div>
          {isLowBalance && (
            <Badge variant="warning">
              ⚠️ Low Balance
            </Badge>
          )}
        </div>

        {/* Credit Circle Display */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-8 border-white/10 flex items-center justify-center">
              {/* Progress ring */}
              <div 
                className="absolute inset-0 rounded-full border-8 border-neon-green transition-all duration-500"
                style={{
                  background: `conic-gradient(
                    from 0deg, 
                    #00ff88 0deg ${(100 - usagePercentage) * 3.6}deg, 
                    transparent ${(100 - usagePercentage) * 3.6}deg 360deg
                  )`,
                  mask: 'radial-gradient(circle at center, transparent 56px, black 64px)',
                  WebkitMask: 'radial-gradient(circle at center, transparent 56px, black 64px)'
                }}
              />
              <div className="text-center relative z-10">
                <div className="text-3xl font-bold text-white">
                  {balance.availableCredits}
                </div>
                <div className="text-sm text-gray-400">
                  credits left
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-lg font-semibold text-white">
              {balance.totalCredits}
            </div>
            <div className="text-xs text-gray-400">Total Purchased</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-lg font-semibold text-white">
              {balance.usedCredits}
            </div>
            <div className="text-xs text-gray-400">Used</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-lg font-semibold text-neon-green">
              {Math.round(usagePercentage)}%
            </div>
            <div className="text-xs text-gray-400">Usage Rate</div>
          </div>
        </div>

        {/* Low Balance Warning */}
        {isLowBalance && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-500 text-xl">⚠️</div>
              <div>
                <h4 className="text-yellow-400 font-semibold">Low Credit Balance</h4>
                <p className="text-gray-300 text-sm mt-1">
                  You have {balance.availableCredits} credits remaining. 
                  Consider purchasing more credits to avoid interruption.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onPurchaseCredits && (
            <NeonButton onClick={onPurchaseCredits} className="flex-1">
              Buy More Credits
            </NeonButton>
          )}
          <button
            onClick={loadBalance}
            className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(balance.lastUpdated).toLocaleString()}
        </div>
      </div>
    </GlassCard>
  );
};