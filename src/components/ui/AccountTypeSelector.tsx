'use client';

import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { NeonButton } from './NeonButton';
import { Badge } from './Badge';
import { InteractiveCard } from './InteractiveCard';
import { cn } from '@/lib/utils';
import { AccountType, getAccountTypeLabel, getAccountTypeDescription } from '@/types/user';

interface AccountTypeOption {
  type: AccountType;
  title: string;
  description: string;
  features: string[];
  pricing: string;
  icon: string;
  popular?: boolean;
  badge?: string;
}

const accountTypeOptions: AccountTypeOption[] = [
  {
    type: AccountType.BUSINESS_OWNER,
    title: 'Business Owner',
    description: 'Complete platform for teams and organizations',
    features: [
      'Full CRM integrations',
      'Pixel optimization tools',
      'AI-powered lead scoring',
      'Team management',
      'Advanced analytics',
      'Webhook integrations',
      'Bulk lead processing',
      'Custom auto-tagging rules'
    ],
    pricing: 'Subscription + Credits',
    icon: '🏢',
    popular: true,
    badge: 'Most Popular'
  },
  {
    type: AccountType.SALES_REP,
    title: 'Sales Rep',
    description: 'Individual account for personal lead qualification',
    features: [
      'Personal dashboard',
      'Lead qualification tools',
      'Credit-based pricing',
      'Activity tracking',
      'Basic export features',
      'Personal activity feed',
      'Simple credit management',
      'Mobile-optimized interface'
    ],
    pricing: 'Pay-per-credit',
    icon: '👤',
    badge: 'Simple & Affordable'
  }
];

interface AccountTypeSelectorProps {
  onSelect: (accountType: AccountType) => void;
  selectedType?: AccountType;
  className?: string;
  showComparison?: boolean;
}

export const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({
  onSelect,
  selectedType,
  className,
  showComparison = true
}) => {

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Account Type</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Select the account type that best fits your needs. You can always upgrade later.
        </p>
      </div>

      {/* Account Type Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {accountTypeOptions.map((option) => (
          <InteractiveCard
            key={option.type}
            hoverEffect="glow"
            clickEffect="ripple"
            onClick={() => onSelect(option.type)}
            className={cn(
              'relative p-8 transition-all duration-300',
              selectedType === option.type && 'ring-2 ring-neon-green'
            )}
          >
            {/* Popular Badge */}
            {option.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge variant="neon" className="px-4 py-1">
                  {option.badge}
                </Badge>
              </div>
            )}

            {/* Content */}
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="text-6xl mb-4">{option.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{option.title}</h3>
                <p className="text-gray-400">{option.description}</p>
                {!option.popular && option.badge && (
                  <Badge variant="success" size="sm" className="mt-2">
                    {option.badge}
                  </Badge>
                )}
              </div>

              {/* Pricing */}
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-lg font-semibold text-neon-green">{option.pricing}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {option.type === AccountType.BUSINESS_OWNER 
                    ? 'Starting at $179/month + credit usage'
                    : 'No monthly fee - only pay for credits used'
                  }
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white text-center">What's Included:</h4>
                <div className="space-y-2">
                  {option.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-neon-green rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Button */}
              <NeonButton
                className={cn(
                  'w-full',
                  selectedType === option.type && 'ring-2 ring-neon-green ring-offset-2 ring-offset-transparent'
                )}
                variant={selectedType === option.type ? 'primary' : 'secondary'}
              >
                {selectedType === option.type ? '✓ Selected' : `Select ${option.title}`}
              </NeonButton>
            </div>
          </InteractiveCard>
        ))}
      </div>

      {/* Comparison Table (Optional) */}
      {showComparison && (
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Feature Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4 text-gray-300">Feature</th>
                    <th className="text-center p-4 text-white">Business Owner</th>
                    <th className="text-center p-4 text-white">Sales Rep</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { feature: 'Lead Management', business: true, sales: true },
                    { feature: 'Credit Pull System', business: true, sales: true },
                    { feature: 'Personal Dashboard', business: true, sales: true },
                    { feature: 'Activity Feed', business: true, sales: true },
                    { feature: 'Basic Exports', business: true, sales: true },
                    { feature: 'CRM Integrations', business: true, sales: false },
                    { feature: 'Pixel Optimization', business: true, sales: false },
                    { feature: 'AI Intelligence', business: true, sales: false },
                    { feature: 'Auto-Tagging Rules', business: true, sales: false },
                    { feature: 'Team Management', business: true, sales: false },
                    { feature: 'Advanced Analytics', business: true, sales: false },
                    { feature: 'API Access', business: true, sales: false },
                    { feature: 'Webhook Support', business: true, sales: false },
                  ].map((item, index) => (
                    <tr key={index} className="border-b border-white/10">
                      <td className="p-4 text-gray-300">{item.feature}</td>
                      <td className="text-center p-4">
                        {item.business ? (
                          <span className="text-neon-green text-xl">✓</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="text-center p-4">
                        {item.sales ? (
                          <span className="text-neon-green text-xl">✓</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-gray-400 text-sm">
          Not sure which account type is right for you? 
          <span className="text-neon-green cursor-pointer hover:underline ml-1">
            Contact our team for personalized recommendations
          </span>
        </p>
      </div>
    </div>
  );
};