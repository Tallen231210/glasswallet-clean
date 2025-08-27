'use client';

import React from 'react';

// Disable static generation for this page
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { 
  ActivityFeed,
  ToastProvider,
  useToast,
  NeonButton,
  GlassCard,
  StatCard
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';

const ActivityPage = () => {
  const router = useRouter();
  const { showToast } = useToast();

  const handleActivityClick = (item: any) => {
    console.log('Activity clicked:', item);
    
    // Navigate to relevant pages based on activity type
    switch (item.type) {
      case 'lead_processed':
      case 'lead_qualified':
      case 'lead_tagged':
        router.push('/leads');
        break;
      case 'rule_triggered':
        router.push('/leads/rules');
        break;
      case 'credit_pulled':
        router.push('/dashboard');
        break;
      case 'system_alert':
        showToast({
          title: 'System Alert',
          message: item.description,
          variant: item.metadata?.status === 'warning' ? 'warning' : 'info'
        });
        break;
      default:
        break;
    }
  };

  const handleMarkAsRead = async (itemId: string) => {
    // TODO: Implement API call to mark activity as read
    console.log('Marking as read:', itemId);
    return Promise.resolve();
  };

  const handleMarkAllAsRead = async () => {
    // TODO: Implement API call to mark all activities as read
    console.log('Marking all as read');
    showToast({
      title: 'All Read',
      message: 'All activities marked as read',
      variant: 'success'
    });
    return Promise.resolve();
  };

  return (
    <AppShell 
      headerActions={
        <div className="flex gap-2">
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </NeonButton>
          <NeonButton 
            onClick={() => window.location.reload()}
          >
            Refresh
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Activity Center</h1>
          <p className="text-gray-400">Real-time platform activity, notifications, and system events</p>
        </div>

        {/* Activity Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Activity"
            value="47"
            icon="📊"
            variant="neon"
            trend="+12 since yesterday"
          />
          <StatCard
            title="Unread Items"
            value="8"
            icon="🔔"
            variant="warning"
            trend="Requires attention"
          />
          <StatCard
            title="Auto Actions"
            value="23"
            icon="🤖"
            variant="success"
            trend="Rules triggered today"
          />
          <StatCard
            title="System Health"
            value="99.9%"
            icon="⚡"
            variant="success"
            trend="Uptime this month"
          />
        </div>

        {/* Real-time Activity Feed */}
        <ActivityFeed
          maxItems={100}
          showFilters={true}
          realTime={true}
          compact={false}
          onItemClick={handleActivityClick}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          className="min-h-[600px]"
        />

        {/* Help Section */}
        <GlassCard className="p-6 mt-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Activity Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <p className="mb-2">• <strong className="text-neon-green">Lead Processing:</strong> New leads, qualifications, and credit pulls</p>
                  <p className="mb-2">• <strong className="text-blue-400">Rule Triggers:</strong> Automated tagging and processing rules</p>
                  <p>• <strong className="text-purple-400">Manual Actions:</strong> User-initiated tagging and updates</p>
                </div>
                <div>
                  <p className="mb-2">• <strong className="text-yellow-400">System Alerts:</strong> Important notifications and warnings</p>
                  <p className="mb-2">• <strong className="text-green-400">Integrations:</strong> Pixel syncing and external API calls</p>
                  <p>• <strong className="text-gray-400">User Activity:</strong> Logins, exports, and configuration changes</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  <strong>Tip:</strong> Click on any activity item to navigate to the relevant section or get more details. 
                  Use filters to focus on specific types of activity or unread items only.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
};

export default function ActivityPageWrapper() {
  return (
    <ToastProvider>
      <ActivityPage />
    </ToastProvider>
  );
}