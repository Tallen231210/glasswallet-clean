'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  StatCard,
  Badge,
  Alert
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';

const CrmPage = () => {
  const router = useRouter();

  const integrations = [
    {
      name: 'Salesforce',
      description: 'Sync leads and contacts with Salesforce CRM',
      status: 'available',
      icon: '☁️',
      features: ['Lead sync', 'Contact management', 'Opportunity tracking']
    },
    {
      name: 'HubSpot',
      description: 'Connect with HubSpot for complete lead lifecycle',
      status: 'available',
      icon: '🧡',
      features: ['Lead scoring', 'Email automation', 'Pipeline management']
    },
    {
      name: 'Pipedrive',
      description: 'Streamline your sales pipeline with Pipedrive',
      status: 'coming-soon',
      icon: '📊',
      features: ['Deal tracking', 'Activity monitoring', 'Sales reporting']
    },
    {
      name: 'Zoho CRM',
      description: 'Integrate with Zoho for comprehensive CRM features',
      status: 'coming-soon',
      icon: '📈',
      features: ['Contact management', 'Sales automation', 'Analytics']
    },
    {
      name: 'Custom API',
      description: 'Connect your custom CRM via our API',
      status: 'available',
      icon: '🔧',
      features: ['Webhook support', 'Real-time sync', 'Custom fields']
    }
  ];

  return (
    <AppShell 
      headerActions={
        <div className="flex gap-2">
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/settings')}
          >
            Settings
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CRM Integration</h1>
          <p className="text-gray-400">Connect your Customer Relationship Management system to sync leads and contacts</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Connected CRMs"
            value="0"
            icon="🔗"
            variant="warning"
            trend="Connect your first CRM"
          />
          <StatCard
            title="Synced Contacts"
            value="0"
            icon="👥"
            variant="default"
            trend="No contacts synced yet"
          />
          <StatCard
            title="Lead Pipeline"
            value="0"
            icon="📊"
            variant="default"
            trend="Connect CRM to view pipeline"
          />
          <StatCard
            title="Sync Status"
            value="Ready"
            icon="⚡"
            variant="success"
            trend="All systems operational"
          />
        </div>

        {/* Coming Soon Notice */}
        <Alert variant="info" title="CRM Integration Coming Soon">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2">We're working on seamless CRM integrations to help you manage your leads more effectively.</p>
              <p className="text-sm text-gray-400">Expected release: Q2 2024</p>
            </div>
            <NeonButton size="sm" variant="secondary">
              Get Notified
            </NeonButton>
          </div>
        </Alert>

        {/* Available Integrations */}
        <GlassCard className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Available Integrations</h2>
            <p className="text-gray-400">Choose from our supported CRM platforms or use our API for custom integrations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{integration.name}</h3>
                    <Badge
                      variant={
                        integration.status === 'available' ? 'success' :
                        integration.status === 'coming-soon' ? 'warning' : 'default'
                      }
                      size="sm"
                    >
                      {integration.status === 'available' ? 'Available' :
                       integration.status === 'coming-soon' ? 'Coming Soon' : integration.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4">{integration.description}</p>

                <div className="space-y-2 mb-6">
                  <h4 className="text-sm font-medium text-gray-300">Features:</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {integration.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-neon-green rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <NeonButton
                  className="w-full"
                  variant={integration.status === 'available' ? 'primary' : 'secondary'}
                  disabled={integration.status !== 'available'}
                >
                  {integration.status === 'available' ? 'Connect' : 'Coming Soon'}
                </NeonButton>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-neon-green">🎯</span>
              Why Connect Your CRM?
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-neon-green rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Seamless Lead Flow</p>
                  <p className="text-gray-400">Automatically sync qualified leads from GlassWallet to your CRM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Enhanced Lead Data</p>
                  <p className="text-gray-400">Enrich your CRM contacts with credit scores and qualification data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Automated Follow-up</p>
                  <p className="text-gray-400">Trigger automated workflows based on lead qualification status</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Unified Dashboard</p>
                  <p className="text-gray-400">View your complete sales pipeline in one place</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-blue-400">🔧</span>
              Custom Integration
            </h3>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Don't see your CRM listed? Use our flexible API to build custom integrations that meet your specific needs.
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-neon-green">✓</span>
                  <span className="text-gray-300">RESTful API with comprehensive documentation</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-neon-green">✓</span>
                  <span className="text-gray-300">Webhook support for real-time data sync</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-neon-green">✓</span>
                  <span className="text-gray-300">SDK libraries for popular programming languages</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-neon-green">✓</span>
                  <span className="text-gray-300">Dedicated developer support</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <NeonButton size="sm">View API Docs</NeonButton>
                <NeonButton size="sm" variant="secondary">Contact Support</NeonButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
};

export default CrmPage;