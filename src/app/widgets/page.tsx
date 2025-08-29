'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

// Mock widget data
const mockWidgets = [
  {
    id: 'widget-001',
    name: 'Homepage Lead Capture',
    description: 'Main lead capture form for website homepage',
    status: 'active' as const,
    totalLeads: 342,
    conversionRate: 12.5,
    lastLeadCaptured: '2024-08-29T10:30:00Z',
    createdAt: '2024-08-15T09:00:00Z',
    settings: {
      fields: [
        { name: 'firstName', type: 'text', label: 'First Name', required: true },
        { name: 'lastName', type: 'text', label: 'Last Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'phone', type: 'tel', label: 'Phone', required: false }
      ],
      styling: {
        theme: 'glass' as const,
        primaryColor: '#00ff88',
        borderRadius: 12,
        width: 400,
        height: 500
      },
      behavior: {
        showThankYou: true,
        autoClose: false,
        closeDelay: 3
      }
    }
  },
  {
    id: 'widget-002', 
    name: 'Pricing Page CTA',
    description: 'High-converting form for pricing page visitors',
    status: 'active' as const,
    totalLeads: 187,
    conversionRate: 18.3,
    lastLeadCaptured: '2024-08-29T08:15:00Z',
    createdAt: '2024-08-10T14:20:00Z',
    settings: {
      fields: [
        { name: 'firstName', type: 'text', label: 'Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'company', type: 'text', label: 'Company', required: false },
        { name: 'interest', type: 'select', label: 'Interest Level', required: true, options: ['High', 'Medium', 'Low'] }
      ],
      styling: {
        theme: 'dark' as const,
        primaryColor: '#00ff88',
        borderRadius: 8,
        width: 350,
        height: 450
      },
      behavior: {
        showThankYou: true,
        redirectUrl: '/thank-you',
        autoClose: false,
        closeDelay: 2
      }
    }
  },
  {
    id: 'widget-003',
    name: 'Exit Intent Popup',
    description: 'Last-chance lead capture for exiting visitors',
    status: 'paused' as const,
    totalLeads: 89,
    conversionRate: 8.7,
    lastLeadCaptured: '2024-08-27T16:45:00Z',
    createdAt: '2024-08-05T11:30:00Z',
    settings: {
      fields: [
        { name: 'email', type: 'email', label: 'Email Address', required: true },
        { name: 'reason', type: 'select', label: 'Why are you leaving?', required: false, 
          options: ['Too expensive', 'Need more info', 'Not ready yet', 'Other'] }
      ],
      styling: {
        theme: 'light' as const,
        primaryColor: '#ff6b6b',
        borderRadius: 16,
        width: 380,
        height: 300
      },
      behavior: {
        showThankYou: true,
        autoClose: true,
        closeDelay: 5
      }
    }
  }
];

type Widget = typeof mockWidgets[0];

export default function WidgetsPage() {
  const router = useRouter();
  const [widgets] = useState<Widget[]>(mockWidgets);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'paused': return '⏸️';
      case 'draft': return '📝';
      default: return '📋';
    }
  };

  const generateEmbedCode = (widget: Widget) => {
    return `<!-- GlassWallet Lead Capture Widget -->
<script>
  window.GlassWalletWidget = window.GlassWalletWidget || [];
</script>
<script async src="${window.location.origin}/api/widget/${widget.id}/embed.js"></script>
<div id="glasswallet-widget" data-widget-id="${widget.id}"></div>`;
  };

  const totalStats = {
    totalWidgets: widgets.length,
    activeWidgets: widgets.filter(w => w.status === 'active').length,
    totalLeads: widgets.reduce((sum, w) => sum + w.totalLeads, 0),
    avgConversion: Math.round(widgets.reduce((sum, w) => sum + w.conversionRate, 0) / widgets.length * 10) / 10
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between space-component">
          <div className="space-element">
            <h1 className="text-heading text-white mb-2">🔌 JavaScript Widgets</h1>
            <p className="text-body-large text-gray-400 max-w-2xl">
              Create and manage embeddable lead capture widgets with auto-tagging and pixel integration
            </p>
          </div>
          <div className="flex gap-3">
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/widgets/analytics')}
            >
              📊 Widget Analytics
            </NeonButton>
            <NeonButton onClick={() => router.push('/widgets/new')}>
              + Create Widget
            </NeonButton>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Widgets"
            value={totalStats.totalWidgets}
            description="All widgets"
            icon="🔌"
            variant="default"
            trend="+2 this month"
          />
          <StatCard
            title="Active Widgets"
            value={totalStats.activeWidgets}
            description={`${Math.round((totalStats.activeWidgets / totalStats.totalWidgets) * 100)}% active`}
            icon="🟢"
            variant="success"
            trend="+1 activated"
          />
          <StatCard
            title="Total Leads"
            value={totalStats.totalLeads.toLocaleString()}
            description="Via widgets"
            icon="👥"
            variant="neon"
            trend="+47 today"
          />
          <StatCard
            title="Avg Conversion"
            value={`${totalStats.avgConversion}%`}
            description="Across all widgets"
            icon="📈"
            variant="success"
            trend="+2.3% this week"
          />
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <GlassCard key={widget.id} className="p-6">
              <div className="space-y-4">
                {/* Widget Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{widget.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{widget.description}</p>
                  </div>
                  <Badge variant={getStatusColor(widget.status) as any} size="sm">
                    {getStatusIcon(widget.status)} {widget.status}
                  </Badge>
                </div>

                {/* Widget Preview */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-xs text-gray-400 mb-2">Preview:</div>
                  <div 
                    className={`mini-widget theme-${widget.settings.styling.theme} p-3 rounded`}
                    style={{
                      backgroundColor: widget.settings.styling.theme === 'glass' ? 'rgba(255,255,255,0.05)' :
                                     widget.settings.styling.theme === 'dark' ? '#1a1a1a' : 'white',
                      color: widget.settings.styling.theme === 'light' ? '#333' : 'white',
                      fontSize: '11px',
                      minHeight: '80px'
                    }}
                  >
                    <div className="font-medium mb-2">Get Started</div>
                    {widget.settings.fields.slice(0, 2).map((field, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="text-xs opacity-75">{field.label}</div>
                        <div 
                          className="w-full h-6 rounded border border-white/20 bg-white/10 mt-1"
                          style={{ borderColor: widget.settings.styling.primaryColor + '33' }}
                        />
                      </div>
                    ))}
                    <div 
                      className="w-full h-6 rounded text-center leading-6 text-xs font-medium"
                      style={{ 
                        backgroundColor: widget.settings.styling.primaryColor,
                        color: 'white'
                      }}
                    >
                      Submit
                    </div>
                  </div>
                </div>

                {/* Widget Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{widget.totalLeads}</div>
                    <div className="text-xs text-gray-400">Total Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-neon-green">{widget.conversionRate}%</div>
                    <div className="text-xs text-gray-400">Conversion Rate</div>
                  </div>
                </div>

                {/* Widget Actions */}
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => {
                      setSelectedWidget(widget);
                      setShowEmbedModal(true);
                    }}
                    className="flex-1 text-xs"
                  >
                    📋 Embed Code
                  </NeonButton>
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => router.push(`/widgets/${widget.id}/edit`)}
                    className="flex-1 text-xs"
                  >
                    ✏️ Edit
                  </NeonButton>
                  <NeonButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => router.push(`/widgets/${widget.id}/analytics`)}
                    className="text-xs"
                  >
                    📊
                  </NeonButton>
                </div>

                {/* Last Activity */}
                <div className="text-xs text-gray-500">
                  Last lead: {widget.lastLeadCaptured ? 
                    new Date(widget.lastLeadCaptured).toLocaleString() : 
                    'Never'
                  }
                </div>
              </div>
            </GlassCard>
          ))}

          {/* Create New Widget Card */}
          <GlassCard className="p-6 border-dashed border-white/20">
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-neon-green text-2xl">+</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Create New Widget</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                Build a new lead capture widget with auto-tagging and custom styling
              </p>
              <NeonButton onClick={() => router.push('/widgets/new')}>
                Get Started
              </NeonButton>
            </div>
          </GlassCard>
        </div>

        {/* Embed Code Modal */}
        {showEmbedModal && selectedWidget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Embed Code - {selectedWidget.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowEmbedModal(false);
                      setSelectedWidget(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* HTML Embed */}
                  <div>
                    <h4 className="font-medium text-white mb-3">HTML Embed Code</h4>
                    <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap break-all">
                        {generateEmbedCode(selectedWidget)}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateEmbedCode(selectedWidget));
                        alert('Embed code copied to clipboard!');
                      }}
                      className="mt-2 text-sm text-neon-green hover:text-neon-green/80 transition-colors"
                    >
                      📋 Copy to Clipboard
                    </button>
                  </div>

                  {/* Widget Configuration */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Widget Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Theme:</span>
                          <span className="text-white capitalize">{selectedWidget.settings.styling.theme}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Size:</span>
                          <span className="text-white">
                            {selectedWidget.settings.styling.width}×{selectedWidget.settings.styling.height}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fields:</span>
                          <span className="text-white">{selectedWidget.settings.fields.length}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Auto-close:</span>
                          <span className="text-white">{selectedWidget.settings.behavior.autoClose ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Thank you:</span>
                          <span className="text-white">{selectedWidget.settings.behavior.showThankYou ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Leads:</span>
                          <span className="text-neon-green">{selectedWidget.totalLeads}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Integration Tips */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Integration Tips</h4>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Place the embed code where you want the widget to appear</li>
                        <li>• The widget will automatically inherit your page's fonts</li>
                        <li>• Leads are automatically tagged based on your rules</li>
                        <li>• Widget events can be tracked with custom JavaScript</li>
                        <li>• Use responsive design - widget adapts to mobile screens</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <NeonButton
                    variant="secondary"
                    onClick={() => {
                      setShowEmbedModal(false);
                      setSelectedWidget(null);
                    }}
                    className="flex-1"
                  >
                    Close
                  </NeonButton>
                  <NeonButton
                    onClick={() => router.push(`/widgets/${selectedWidget.id}/edit`)}
                    className="flex-1"
                  >
                    Edit Widget
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