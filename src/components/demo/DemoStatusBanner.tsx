'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';

export const DemoStatusBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const features = [
    { name: 'Credit Management', status: 'active', description: 'Bronze/Silver/Gold/Platinum packages' },
    { name: 'Stripe Billing', status: 'active', description: '$199/month + credit packages' },
    { name: 'Mock Credit API', status: 'active', description: 'Realistic demo credit pulls' },
    { name: 'FCRA Compliance', status: 'active', description: 'Full consent tracking system' },
    { name: 'Credit Deduction', status: 'active', description: 'Real-time balance updates' },
    { name: 'Pixel Integration', status: 'active', description: 'Meta, Google, TikTok OAuth' },
    { name: 'Auto-Tagging', status: 'active', description: 'Rules-based lead qualification' },
    { name: 'Admin Dashboard', status: 'active', description: 'Complete platform management' },
    { name: 'Performance Monitoring', status: 'active', description: 'Real-time metrics tracking' },
    { name: 'CRS Credit API', status: 'pending', description: 'Awaiting API approval' }
  ];

  const activeCount = features.filter(f => f.status === 'active').length;
  const totalCount = features.length;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <GlassCard className="border-neon-green/30 bg-black/40 backdrop-blur-lg">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
            <div>
              <p className="text-white font-semibold text-sm">Demo Mode</p>
              <p className="text-gray-400 text-xs">
                {activeCount}/{totalCount} features active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neon" size="sm">
              MVP Ready
            </Badge>
            <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      feature.status === 'active' ? 'bg-green-500' : 
                      feature.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-white text-xs font-medium">
                      {feature.name}
                    </span>
                  </div>
                  <Badge 
                    variant={feature.status === 'active' ? 'success' : 'warning'} 
                    size="sm"
                    className="text-xs"
                  >
                    {feature.status}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-400">
              <p><strong>Status:</strong> Ready for CRS API integration</p>
              <p><strong>Progress:</strong> {Math.round((activeCount/totalCount) * 100)}% complete</p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};