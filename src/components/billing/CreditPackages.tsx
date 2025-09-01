'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { CreditPackage } from '@/types/billing';
import { creditService, formatCurrency, calculateSavings } from '@/lib/services/creditService';

interface CreditPackagesProps {
  onSelectPackage: (packageData: CreditPackage) => void;
  loading?: boolean;
  selectedPackageId?: string;
}

export const CreditPackages: React.FC<CreditPackagesProps> = ({
  onSelectPackage,
  loading = false,
  selectedPackageId
}) => {
  const [packages] = useState<CreditPackage[]>(creditService.getAllCreditPackages());

  const handlePackageSelect = (pkg: CreditPackage) => {
    if (loading) return;
    onSelectPackage(pkg);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Choose Your Credit Package</h2>
        <p className="text-gray-400">
          Select the package that best fits your lead qualification needs
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 rounded-lg">
          <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
          <span className="text-neon-green text-sm font-medium">Credits Never Expire</span>
        </div>
      </div>

      {/* Package Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => {
          const savings = calculateSavings(pkg.id);
          const isSelected = selectedPackageId === pkg.id;

          return (
            <GlassCard
              key={pkg.id}
              padding="none"
              className={`
                relative transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl min-h-[500px]
                ${isSelected 
                  ? 'border-neon-green shadow-neon-green/20 shadow-lg' 
                  : 'hover:border-white/30'
                }
              `}
              onClick={() => handlePackageSelect(pkg)}
            >

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="success" className="px-2 py-1">
                    ✓ Selected
                  </Badge>
                </div>
              )}

              <div className="flex flex-col h-full p-6">
                {/* Top Content Area */}
                <div className="flex-1 space-y-6">
                  {/* Package Name & Price */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-neon-green">
                        {formatCurrency(pkg.price)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatCurrency(pkg.pricePerCredit)} per credit
                      </div>
                    </div>
                  </div>

                  {/* Credits Info */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        {pkg.totalCredits}
                      </span>
                      <span className="text-gray-400">credits</span>
                    </div>
                    
                    {pkg.bonusCredits > 0 && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                        <span className="text-green-400 text-xs">
                          🎁 +{pkg.bonusCredits} bonus credits
                        </span>
                      </div>
                    )}

                    {savings.amount > 0 && (
                      <div className="text-sm text-green-400">
                        Save {formatCurrency(savings.amount)} ({Math.round(savings.percentage)}%)
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm text-center">
                    {pkg.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-neon-green text-xs mt-1">✓</span>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Button - Always at bottom */}
                <div className="mt-6">
                  <NeonButton
                    onClick={() => handlePackageSelect(pkg)}
                    disabled={loading}
                    className={`
                      w-full transition-all duration-300
                      ${isSelected 
                        ? 'bg-neon-green text-black' 
                        : ''
                      }
                    `}
                    size="sm"
                  >
                    {loading && selectedPackageId === pkg.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : isSelected ? (
                      'Selected'
                    ) : (
                      'Select Package'
                    )}
                  </NeonButton>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Comparison Table (Optional) */}
      <div className="mt-8">
        <GlassCard className="overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              Package Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 pb-2">Package</th>
                    <th className="text-center text-gray-400 pb-2">Credits</th>
                    <th className="text-center text-gray-400 pb-2">Price</th>
                    <th className="text-center text-gray-400 pb-2">Per Credit</th>
                    <th className="text-center text-gray-400 pb-2">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => {
                    const savings = calculateSavings(pkg.id);
                    return (
                      <tr key={pkg.id} className="border-b border-white/5">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{pkg.name}</span>
                            {pkg.popular && (
                              <Badge variant="neon" size="sm">Popular</Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-center text-white py-3">
                          {pkg.totalCredits}
                          {pkg.bonusCredits > 0 && (
                            <span className="text-green-400 text-xs ml-1">
                              (+{pkg.bonusCredits})
                            </span>
                          )}
                        </td>
                        <td className="text-center text-white py-3">
                          {formatCurrency(pkg.price)}
                        </td>
                        <td className="text-center text-white py-3">
                          {formatCurrency(pkg.pricePerCredit)}
                        </td>
                        <td className="text-center py-3">
                          {savings.amount > 0 ? (
                            <span className="text-green-400">
                              {formatCurrency(savings.amount)}
                            </span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};