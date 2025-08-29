'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Input } from '@/components/ui/Input';

// Mock webhook data
const mockWebhooks = [
  {
    id: 'webhook-001',
    name: 'Lead Captured',
    description: 'Fires when a new lead is captured via widget or API',
    url: 'https://api.example.com/webhooks/lead-captured',
    events: ['lead.created', 'lead.tagged'],
    status: 'active' as const,
    method: 'POST' as const,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk_***********'
    },
    retryPolicy: {
      enabled: true,
      maxRetries: 3,
      backoffStrategy: 'exponential'
    },
    stats: {
      totalCalls: 1247,
      successfulCalls: 1198,
      failedCalls: 49,
      lastTriggered: '2024-08-29T10:30:00Z',
      avgResponseTime: 145
    },
    createdAt: '2024-08-15T09:00:00Z'
  },
  {
    id: 'webhook-002',
    name: 'Pixel Sync Complete',
    description: 'Triggered when leads are successfully synced to advertising pixels',
    url: 'https://crm.example.com/api/pixel-sync-complete',
    events: ['pixel.sync.completed', 'pixel.sync.failed'],
    status: 'active' as const,
    method: 'POST' as const,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'api_***********'
    },
    retryPolicy: {
      enabled: true,
      maxRetries: 5,
      backoffStrategy: 'linear'
    },
    stats: {
      totalCalls: 532,
      successfulCalls: 528,
      failedCalls: 4,
      lastTriggered: '2024-08-29T09:45:00Z',
      avgResponseTime: 89
    },
    createdAt: '2024-08-20T14:30:00Z'
  },
  {
    id: 'webhook-003',
    name: 'High-Value Lead Alert',
    description: 'Sends notifications when high-value leads are identified',
    url: 'https://slack.example.com/api/webhooks/incoming',
    events: ['lead.tagged.whitelist', 'lead.tagged.high-value'],
    status: 'paused' as const,
    method: 'POST' as const,
    headers: {
      'Content-Type': 'application/json'
    },
    retryPolicy: {
      enabled: false,
      maxRetries: 1,
      backoffStrategy: 'none'
    },
    stats: {
      totalCalls: 89,
      successfulCalls: 82,
      failedCalls: 7,
      lastTriggered: '2024-08-27T16:20:00Z',
      avgResponseTime: 234
    },
    createdAt: '2024-08-10T11:15:00Z'
  }
];

type Webhook = typeof mockWebhooks[0];

const availableEvents = [
  { id: 'lead.created', name: 'Lead Created', description: 'New lead captured via widget or API' },
  { id: 'lead.updated', name: 'Lead Updated', description: 'Existing lead information modified' },
  { id: 'lead.tagged', name: 'Lead Tagged', description: 'Tags added to a lead (manual or auto)' },
  { id: 'lead.tagged.whitelist', name: 'Lead Whitelisted', description: 'Lead tagged as whitelist' },
  { id: 'lead.tagged.blacklist', name: 'Lead Blacklisted', description: 'Lead tagged as blacklist' },
  { id: 'lead.tagged.qualified', name: 'Lead Qualified', description: 'Lead tagged as qualified' },
  { id: 'lead.tagged.high-value', name: 'High-Value Lead', description: 'Lead tagged as high-value' },
  { id: 'pixel.sync.started', name: 'Pixel Sync Started', description: 'Pixel synchronization initiated' },
  { id: 'pixel.sync.completed', name: 'Pixel Sync Completed', description: 'Pixel synchronization successful' },
  { id: 'pixel.sync.failed', name: 'Pixel Sync Failed', description: 'Pixel synchronization failed' },
  { id: 'widget.lead.captured', name: 'Widget Lead Captured', description: 'Lead captured through JavaScript widget' },
  { id: 'rule.executed', name: 'Auto-Tag Rule Executed', description: 'Auto-tagging rule was applied to a lead' }
];

export default function WebhooksPage() {
  const router = useRouter();
  const [webhooks] = useState<Webhook[]>(mockWebhooks);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [testPayload, setTestPayload] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'error': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'paused': return '⏸️';
      case 'error': return '🔴';
      default: return '📋';
    }
  };

  const totalStats = {
    totalWebhooks: webhooks.length,
    activeWebhooks: webhooks.filter(w => w.status === 'active').length,
    totalCalls: webhooks.reduce((sum, w) => sum + w.stats.totalCalls, 0),
    successRate: Math.round(
      (webhooks.reduce((sum, w) => sum + w.stats.successfulCalls, 0) /
       webhooks.reduce((sum, w) => sum + w.stats.totalCalls, 0)) * 100
    )
  };

  const handleTestWebhook = async () => {
    if (!selectedWebhook || !testPayload) return;
    
    // Simulate webhook test
    alert(`Testing webhook "${selectedWebhook.name}"...\n\nPayload sent to: ${selectedWebhook.url}\nResponse: 200 OK (simulated)`);
    setShowTestModal(false);
    setTestPayload('');
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between space-component">
          <div className="space-element">
            <h1 className="text-heading text-white mb-2">🪝 Webhook Management</h1>
            <p className="text-body-large text-gray-400 max-w-2xl">
              Manage webhook endpoints for real-time notifications about lead activities, pixel syncs, and system events
            </p>
          </div>
          <div className="flex gap-3">
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/webhooks/logs')}
            >
              📊 View Logs
            </NeonButton>
            <NeonButton 
              onClick={() => setShowCreateModal(true)}
            >
              + Create Webhook
            </NeonButton>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Webhooks"
            value={totalStats.totalWebhooks}
            description="All endpoints"
            icon="🪝"
            variant="default"
            trend="+1 this week"
          />
          <StatCard
            title="Active Webhooks"
            value={totalStats.activeWebhooks}
            description={`${Math.round((totalStats.activeWebhooks / totalStats.totalWebhooks) * 100)}% active`}
            icon="🟢"
            variant="success"
            trend="All operational"
          />
          <StatCard
            title="Total Calls"
            value={totalStats.totalCalls.toLocaleString()}
            description="All time"
            icon="📞"
            variant="neon"
            trend="+123 today"
          />
          <StatCard
            title="Success Rate"
            value={`${totalStats.successRate}%`}
            description="Delivery success"
            icon="✅"
            variant="success"
            trend="+2% this month"
          />
        </div>

        {/* Available Events Reference */}
        <GlassCard className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">📋 Available Webhook Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableEvents.map((event) => (
              <div key={event.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="font-medium text-white text-sm">{event.name}</div>
                <div className="text-xs text-gray-400 mt-1">{event.description}</div>
                <div className="text-xs text-neon-green mt-2 font-mono">{event.id}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Webhooks List */}
        <div className="space-y-6">
          {webhooks.map((webhook) => (
            <GlassCard key={webhook.id} className="p-6">
              <div className="space-y-4">
                {/* Webhook Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{webhook.name}</h3>
                      <Badge variant={getStatusColor(webhook.status) as any} size="sm">
                        {getStatusIcon(webhook.status)} {webhook.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{webhook.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Method: {webhook.method}</span>
                      <span>Created: {new Date(webhook.createdAt).toLocaleDateString()}</span>
                      <span>Last triggered: {webhook.stats.lastTriggered ? 
                        new Date(webhook.stats.lastTriggered).toLocaleString() : 'Never'}</span>
                    </div>
                  </div>
                </div>

                {/* Webhook URL */}
                <div className="bg-black/50 rounded-lg p-3 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Endpoint URL:</div>
                  <div className="text-sm font-mono text-white break-all">{webhook.url}</div>
                </div>

                {/* Events and Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Subscribed Events */}
                  <div>
                    <div className="text-sm font-medium text-white mb-2">Subscribed Events:</div>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="secondary" size="sm" className="font-mono text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div>
                    <div className="text-sm font-medium text-white mb-2">Performance:</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Total Calls</div>
                        <div className="text-white font-semibold">{webhook.stats.totalCalls.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Success Rate</div>
                        <div className="text-neon-green font-semibold">
                          {Math.round((webhook.stats.successfulCalls / webhook.stats.totalCalls) * 100)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Failed Calls</div>
                        <div className="text-red-400 font-semibold">{webhook.stats.failedCalls}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Avg Response</div>
                        <div className="text-white font-semibold">{webhook.stats.avgResponseTime}ms</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Retry Policy */}
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Retry Policy:</div>
                  <div className="text-sm text-white">
                    {webhook.retryPolicy.enabled ? (
                      <>
                        Max retries: {webhook.retryPolicy.maxRetries} • 
                        Strategy: {webhook.retryPolicy.backoffStrategy}
                      </>
                    ) : (
                      'Retries disabled'
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => {
                      setSelectedWebhook(webhook);
                      setTestPayload(JSON.stringify({
                        event: webhook.events[0],
                        timestamp: new Date().toISOString(),
                        data: {
                          leadId: "lead-example-123",
                          firstName: "John",
                          lastName: "Doe",
                          email: "john.doe@example.com",
                          tags: ["qualified", "high-value"]
                        }
                      }, null, 2));
                      setShowTestModal(true);
                    }}
                    className="text-xs"
                  >
                    🧪 Test
                  </NeonButton>
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => router.push(`/webhooks/${webhook.id}/edit`)}
                    className="text-xs"
                  >
                    ✏️ Edit
                  </NeonButton>
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => router.push(`/webhooks/${webhook.id}/logs`)}
                    className="text-xs"
                  >
                    📊 Logs
                  </NeonButton>
                  <NeonButton 
                    size="sm" 
                    variant={webhook.status === 'active' ? 'default' : 'neon'}
                    onClick={() => alert(`Webhook ${webhook.status === 'active' ? 'paused' : 'activated'} (simulated)`)}
                    className="text-xs"
                  >
                    {webhook.status === 'active' ? '⏸️ Pause' : '▶️ Activate'}
                  </NeonButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Test Webhook Modal */}
        {showTestModal && selectedWebhook && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Test Webhook - {selectedWebhook.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowTestModal(false);
                      setSelectedWebhook(null);
                      setTestPayload('');
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Test Payload (JSON):
                    </label>
                    <textarea
                      value={testPayload}
                      onChange={(e) => setTestPayload(e.target.value)}
                      className="w-full h-64 p-3 bg-black/50 border border-white/20 rounded-lg text-white font-mono text-sm resize-none"
                      placeholder="Enter JSON payload to send..."
                    />
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Webhook Details:</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>URL: {selectedWebhook.url}</div>
                      <div>Method: {selectedWebhook.method}</div>
                      <div>Content-Type: application/json</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <NeonButton
                    variant="secondary"
                    onClick={() => {
                      setShowTestModal(false);
                      setSelectedWebhook(null);
                      setTestPayload('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </NeonButton>
                  <NeonButton
                    onClick={handleTestWebhook}
                    disabled={!testPayload.trim()}
                    className="flex-1"
                  >
                    🧪 Send Test Request
                  </NeonButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Webhook Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Create New Webhook</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-neon-green text-2xl">🚧</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Coming Soon</h4>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Webhook creation interface is in development. For now, webhooks can be created via the API.
                  </p>
                  <NeonButton onClick={() => setShowCreateModal(false)}>
                    Close
                  </NeonButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}