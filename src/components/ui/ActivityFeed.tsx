'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { NeonButton } from './NeonButton';
import { Loading } from './Spinner';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'lead_processed' | 'lead_qualified' | 'lead_tagged' | 'rule_triggered' | 'credit_pulled' | 'export_generated' | 'system_alert' | 'user_action' | 'integration_sync';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    leadId?: string;
    leadName?: string;
    creditScore?: number;
    tagType?: string;
    ruleId?: string;
    ruleName?: string;
    userId?: string;
    userName?: string;
    amount?: number;
    status?: string;
    [key: string]: any;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  actionable?: boolean;
  actionUrl?: string;
}

interface ActivityFeedProps {
  maxItems?: number;
  showFilters?: boolean;
  realTime?: boolean;
  compact?: boolean;
  className?: string;
  onItemClick?: (item: ActivityItem) => void;
  onMarkAsRead?: (itemId: string) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  maxItems = 50,
  showFilters = true,
  realTime = true,
  compact = false,
  className,
  onItemClick,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLive, setIsLive] = useState(realTime);

  // Mock data for development
  const generateMockActivity = (): ActivityItem => {
    const types: ActivityItem['type'][] = [
      'lead_processed',
      'lead_qualified', 
      'lead_tagged',
      'rule_triggered',
      'credit_pulled',
      'system_alert',
      'user_action',
      'integration_sync'
    ];
    
    const type = types[Math.floor(Math.random() * types.length)] || 'lead_processed';
    const priorities: ActivityItem['priority'][] = ['low', 'medium', 'high'];
    const priority = priorities[Math.floor(Math.random() * priorities.length)] || 'low';
    
    const templates = {
      lead_processed: {
        title: 'Lead Processed',
        description: 'New lead successfully processed and qualified',
        metadata: {
          leadName: `${['John', 'Sarah', 'Michael', 'Emma', 'David'][Math.floor(Math.random() * 5)]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}`,
          creditScore: Math.floor(Math.random() * (850 - 300) + 300),
          status: 'qualified'
        }
      },
      lead_qualified: {
        title: 'Lead Auto-Qualified',
        description: 'AI engine automatically qualified high-score lead',
        metadata: {
          leadName: `${['Alice', 'Bob', 'Charlie', 'Diana', 'Eric'][Math.floor(Math.random() * 5)]} ${['Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'][Math.floor(Math.random() * 5)]}`,
          creditScore: Math.floor(Math.random() * (850 - 720) + 720),
          tagType: 'qualified'
        }
      },
      lead_tagged: {
        title: 'Lead Tagged',
        description: 'Lead manually tagged by user',
        metadata: {
          leadName: `${['Frank', 'Grace', 'Henry', 'Ivy', 'Jack'][Math.floor(Math.random() * 5)]} ${['Anderson', 'Thomas', 'Jackson', 'White', 'Harris'][Math.floor(Math.random() * 5)]}`,
          tagType: ['whitelist', 'blacklist', 'follow-up', 'high-priority'][Math.floor(Math.random() * 4)],
          userName: 'Admin User'
        }
      },
      rule_triggered: {
        title: 'Auto-Tagging Rule Triggered',
        description: 'Automated rule successfully processed leads',
        metadata: {
          ruleName: ['High Credit Score Auto-Qualify', 'Gmail Domain Whitelist', 'Low Score Review'][Math.floor(Math.random() * 3)],
          amount: Math.floor(Math.random() * 10) + 1
        }
      },
      credit_pulled: {
        title: 'Credit Report Pulled',
        description: 'Credit report successfully retrieved',
        metadata: {
          leadName: `${['Lisa', 'Mark', 'Nancy', 'Oscar', 'Paula'][Math.floor(Math.random() * 5)]} ${['Martin', 'Garcia', 'Rodriguez', 'Lewis', 'Lee'][Math.floor(Math.random() * 5)]}`,
          creditScore: Math.floor(Math.random() * (850 - 300) + 300),
          status: 'completed'
        }
      },
      system_alert: {
        title: 'System Alert',
        description: ['Low credit balance warning', 'API rate limit approaching', 'System maintenance scheduled', 'Database backup completed'][Math.floor(Math.random() * 4)],
        metadata: {
          status: ['warning', 'info', 'success'][Math.floor(Math.random() * 3)]
        }
      },
      user_action: {
        title: 'User Action',
        description: ['User logged in', 'Settings updated', 'Report generated', 'Data exported'][Math.floor(Math.random() * 4)],
        metadata: {
          userName: ['Admin User', 'Manager', 'Operator'][Math.floor(Math.random() * 3)]
        }
      },
      integration_sync: {
        title: 'Integration Sync',
        description: 'Pixel data synchronized with advertising platform',
        metadata: {
          platform: ['Meta', 'Google Ads', 'TikTok'][Math.floor(Math.random() * 3)],
          amount: Math.floor(Math.random() * 100) + 1,
          status: 'success'
        }
      }
    };

    const template = templates[type as keyof typeof templates];
    
    return {
      id: Date.now().toString() + Math.random(),
      type,
      title: template?.title || 'Activity',
      description: template?.description || 'Activity occurred',
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      metadata: template?.metadata || {},
      priority,
      read: Math.random() > 0.7,
      actionable: Math.random() > 0.8,
      actionUrl: Math.random() > 0.8 ? '/leads' : undefined
    };
  };

  // Initialize with mock data
  useEffect(() => {
    const mockActivities = Array.from({ length: Math.floor(Math.random() * 20) + 10 }, generateMockActivity)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setActivities(mockActivities);
    setUnreadCount(mockActivities.filter(item => !item.read).length);
    setLoading(false);
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Occasionally add new activity
      if (Math.random() > 0.7) {
        const newActivity = generateMockActivity();
        newActivity.read = false;
        
        setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)]);
        setUnreadCount(prev => prev + 1);
      }
    }, 5000 + Math.random() * 10000); // 5-15 second intervals

    return () => clearInterval(interval);
  }, [isLive, maxItems]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    const icons = {
      lead_processed: '👤',
      lead_qualified: '⭐',
      lead_tagged: '🏷️',
      rule_triggered: '🤖',
      credit_pulled: '📊',
      export_generated: '📁',
      system_alert: '🚨',
      user_action: '👨‍💼',
      integration_sync: '🔄'
    };
    return icons[type] || '📋';
  };

  const getPriorityColor = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityBadgeVariant = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'neon';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'lead_qualified': return 'text-neon-green';
      case 'lead_processed': return 'text-blue-400';
      case 'lead_tagged': return 'text-purple-400';
      case 'rule_triggered': return 'text-yellow-400';
      case 'credit_pulled': return 'text-cyan-400';
      case 'system_alert': return 'text-red-400';
      case 'user_action': return 'text-gray-300';
      case 'integration_sync': return 'text-green-400';
      default: return 'text-gray-300';
    }
  };

  const handleItemClick = async (item: ActivityItem) => {
    // Mark as read
    if (!item.read && onMarkAsRead) {
      await onMarkAsRead(item.id);
      setActivities(prev => prev.map(a => a.id === item.id ? { ...a, read: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (onMarkAllAsRead) {
      await onMarkAllAsRead();
    }
    
    setActivities(prev => prev.map(item => ({ ...item, read: true })));
    setUnreadCount(0);
  };

  const filteredActivities = activities.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !item.read;
    if (filter === 'actionable') return item.actionable;
    return item.type === filter;
  });

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <GlassCard className={cn('relative', className)}>
      <div className={cn('p-6', compact && 'p-4')}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className={cn('font-bold text-white', compact ? 'text-lg' : 'text-xl')}>
              Activity Feed
            </h3>
            {unreadCount > 0 && (
              <Badge variant="error" size="sm">
                {unreadCount} new
              </Badge>
            )}
            {isLive && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span className="text-neon-green text-xs font-medium">Live</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <NeonButton
              size="sm"
              variant="secondary"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Pause' : 'Resume'}
            </NeonButton>
            {unreadCount > 0 && (
              <NeonButton
                size="sm"
                variant="secondary"
                onClick={handleMarkAllAsRead}
              >
                Mark All Read
              </NeonButton>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'actionable', label: 'Actionable' },
              { value: 'lead_processed', label: 'Leads' },
              { value: 'rule_triggered', label: 'Rules' },
              { value: 'system_alert', label: 'Alerts' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  filter === filterOption.value
                    ? 'bg-neon-green text-black'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                )}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        )}

        {/* Activity List */}
        {loading ? (
          <Loading message="Loading activity..." size="sm" />
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-gray-400">No activity to show</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredActivities.slice(0, maxItems).map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'p-4 rounded-lg border transition-all duration-200 cursor-pointer',
                  item.read
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-neon-green/5 border-neon-green/20 hover:border-neon-green/30',
                  item.actionable && 'ring-1 ring-yellow-500/30'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                    'bg-white/10 border border-white/20'
                  )}>
                    {getActivityIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn('font-medium truncate', getTypeColor(item.type))}>
                        {item.title}
                      </h4>
                      {!item.read && (
                        <div className="w-2 h-2 bg-neon-green rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    
                    <p className={cn('text-sm text-gray-300 mb-2', compact && 'text-xs')}>
                      {item.description}
                    </p>

                    {/* Metadata */}
                    {item.metadata && (
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {item.metadata.leadName && (
                          <Badge variant="default" size="sm">
                            {item.metadata.leadName}
                          </Badge>
                        )}
                        {item.metadata.creditScore && (
                          <Badge 
                            variant={item.metadata.creditScore >= 720 ? 'success' : item.metadata.creditScore >= 650 ? 'warning' : 'error'} 
                            size="sm"
                          >
                            Score: {item.metadata.creditScore}
                          </Badge>
                        )}
                        {item.metadata.tagType && (
                          <Badge variant="neon" size="sm">
                            {item.metadata.tagType}
                          </Badge>
                        )}
                        {item.metadata.ruleName && (
                          <Badge variant="default" size="sm">
                            {item.metadata.ruleName}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityBadgeVariant(item.priority)} size="sm">
                          {item.priority}
                        </Badge>
                        <span className={cn('text-xs', getPriorityColor(item.priority))}>
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      {item.actionable && (
                        <Badge variant="warning" size="sm">
                          Action Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};