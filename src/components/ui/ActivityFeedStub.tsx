'use client';

import React from 'react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { NeonButton } from './NeonButton';

interface ActivityItem {
  id: string;
  type: 'lead_processed' | 'lead_qualified' | 'credit_pulled' | 'system_alert' | 'user_action';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: any;
}

interface ActivityFeedProps {
  maxItems?: number;
  compact?: boolean;
  className?: string;
  onItemClick?: (item: ActivityItem) => void;
  showFilters?: boolean;
  realTime?: boolean;
  onMarkAsRead?: (itemId: string) => void;
  onMarkAllAsRead?: () => void;
}

// Realistic mock activity data
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'lead_processed',
    title: 'New Lead Processed',
    description: 'Sarah Johnson (sarah.j@email.com) - Credit Score: 742',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
    priority: 'medium',
    metadata: { creditScore: 742, leadName: 'Sarah Johnson' }
  },
  {
    id: '2', 
    type: 'lead_qualified',
    title: 'Lead Qualified',
    description: 'Michael Chen qualified for premium tier - Score: 685',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    priority: 'high',
    metadata: { creditScore: 685, leadName: 'Michael Chen' }
  },
  {
    id: '3',
    type: 'credit_pulled',
    title: 'Credit Check Completed',
    description: 'Credit report generated for Emily Rodriguez',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago  
    priority: 'medium',
    metadata: { leadName: 'Emily Rodriguez' }
  },
  {
    id: '4',
    type: 'system_alert',
    title: 'System Update',
    description: 'Credit API integration optimized - 15% faster response times',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    priority: 'low',
  },
  {
    id: '5',
    type: 'user_action',
    title: 'Bulk Export Completed',
    description: 'Monthly lead report exported (47 leads)',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    priority: 'low',
  }
];

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  maxItems = 5,
  compact = false,
  className = '',
  onItemClick,
  showFilters = false,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const displayItems = mockActivities.slice(0, maxItems);
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'lead_processed': return '📝';
      case 'lead_qualified': return '✅';
      case 'credit_pulled': return '📊';
      case 'system_alert': return '🔔';
      case 'user_action': return '👤';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'neon';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {compact ? 'Recent Activity' : 'Activity Feed'}
        </h3>
        {showFilters && (
          <div className="flex gap-2">
            <NeonButton variant="secondary" size="sm">
              Filter
            </NeonButton>
            {onMarkAllAsRead && (
              <NeonButton variant="secondary" size="sm" onClick={onMarkAllAsRead}>
                Mark All Read
              </NeonButton>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {displayItems.map((item) => (
          <div 
            key={item.id}
            className={`p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors ${onItemClick ? 'cursor-pointer' : ''}`}
            onClick={() => onItemClick?.(item)}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">{getIconForType(item.type)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white text-sm">{item.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={getPriorityColor(item.priority) as any} size="sm">
                      {item.priority}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!compact && displayItems.length === maxItems && (
        <div className="text-center mt-4">
          <NeonButton variant="secondary" size="sm">
            View All Activity
          </NeonButton>
        </div>
      )}
    </GlassCard>
  );
};

export default ActivityFeed;