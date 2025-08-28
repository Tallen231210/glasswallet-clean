'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  Input, 
  Badge, 
  Toggle,
  ToastProvider,
  useToast,
  Alert,
  StatCard
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';

interface WidgetConfig {
  apiKey: string;
  clientId: string;
  autoCheck: boolean;
  consentRequired: boolean;
  webhook: string;
  debug: boolean;
  autoTag: {
    whitelist: {
      minCreditScore: number;
      minIncome: number;
    };
    blacklist: {
      maxCreditScore: number;
      maxIncome: number;
    };
  };
  allowOriginalSubmit: boolean;
}

interface IntegrationStats {
  totalSubmissions: number;
  successfulProcessing: number;
  failureRate: number;
  lastActivity: string;
  creditBalance: number;
  apiCallsToday: number;
  webhookDeliveries: number;
}

const IntegrationsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [config, setConfig] = useState<WidgetConfig>({
    apiKey: 'gw_live_' + Math.random().toString(36).substr(2, 32),
    clientId: 'client_' + Math.random().toString(36).substr(2, 9),
    autoCheck: true,
    consentRequired: true,
    webhook: '',
    debug: false,
    autoTag: {
      whitelist: {
        minCreditScore: 720,
        minIncome: 80000
      },
      blacklist: {
        maxCreditScore: 580,
        maxIncome: 30000
      }
    },
    allowOriginalSubmit: true
  });

  const [stats] = useState<IntegrationStats>({
    totalSubmissions: 1247,
    successfulProcessing: 1189,
    failureRate: 4.7,
    lastActivity: new Date().toISOString(),
    creditBalance: 847,
    apiCallsToday: 23,
    webhookDeliveries: 1156
  });

  const [activeTab, setActiveTab] = useState<'setup' | 'testing' | 'analytics' | 'docs'>('setup');
  const [testFormData, setTestFormData] = useState({
    name: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567'
  });
  const [testing, setTesting] = useState(false);

  const generateEmbedCode = () => {
    return `<!-- GlassWallet Lead Integration Widget -->
<script src="https://glasswallet.io/widget.js"></script>
<script>
  GlassWallet.init({
    apiKey: '${config.apiKey}',
    clientId: '${config.clientId}',
    autoCheck: ${config.autoCheck},
    consentRequired: ${config.consentRequired},${config.webhook ? `
    webhook: '${config.webhook}',` : ''}
    debug: ${config.debug},
    autoTag: {
      whitelist: { 
        minCreditScore: ${config.autoTag.whitelist.minCreditScore}, 
        minIncome: ${config.autoTag.whitelist.minIncome} 
      },
      blacklist: { 
        maxCreditScore: ${config.autoTag.blacklist.maxCreditScore}, 
        maxIncome: ${config.autoTag.blacklist.maxIncome} 
      }
    },
    allowOriginalSubmit: ${config.allowOriginalSubmit}
  });
</script>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast({
        title: 'Copied!',
        message: 'Code copied to clipboard',
        variant: 'success'
      });
    });
  };

  const testWidget = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/integrate/widget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: config.clientId,
          api_key: config.apiKey,
          name: testFormData.name,
          email: testFormData.email,
          phone: testFormData.phone,
          consent: true,
          source: 'dashboard_test',
          webhook_url: config.webhook
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast({
          title: 'Test Successful!',
          message: `Lead processed with credit score: ${result.lead.credit_score}`,
          variant: 'success'
        });
      } else {
        throw new Error(result.error || 'Test failed');
      }
    } catch (error) {
      showToast({
        title: 'Test Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error'
      });
    } finally {
      setTesting(false);
    }
  };

  const checkHealth = async () => {
    try {
      const response = await fetch(`/api/integrate/health?api_key=${config.apiKey}&client_id=${config.clientId}`);
      const health = await response.json();
      
      if (health.status === 'healthy') {
        showToast({
          title: 'System Healthy',
          message: 'All integration endpoints are operational',
          variant: 'success'
        });
      } else {
        showToast({
          title: 'System Issue',
          message: health.error || 'Integration system may have issues',
          variant: 'warning'
        });
      }
    } catch (error) {
      showToast({
        title: 'Health Check Failed',
        message: 'Unable to check system health',
        variant: 'error'
      });
    }
  };

  return (
    <AppShell 
      headerTitle="Lead Integrations"
      headerSubtitle="Embed GlassWallet credit checking into your website"
      headerActions={
        <div className="flex gap-2">
          <NeonButton variant="secondary" onClick={checkHealth}>
            Health Check
          </NeonButton>
          <NeonButton onClick={() => router.push('/leads')}>
            View Leads
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* Integration Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Submissions"
            value={stats.totalSubmissions}
            icon="📊"
            variant="default"
          />
          <StatCard
            title="Success Rate"
            value={`${(100 - stats.failureRate).toFixed(1)}%`}
            change={{ 
              value: stats.failureRate, 
              type: stats.failureRate < 5 ? 'positive' : 'negative',
              period: 'failure rate'
            }}
            icon="✅"
            variant="success"
          />
          <StatCard
            title="API Calls Today"
            value={stats.apiCallsToday}
            icon="⚡"
            variant="neon"
          />
          <StatCard
            title="Credit Balance"
            value={stats.creditBalance}
            change={{ 
              value: 23, 
              type: 'negative',
              period: 'used today'
            }}
            icon="💳"
            variant="warning"
          />
        </div>

        {/* Tab Navigation */}
        <GlassCard className="p-1">
          <div className="flex space-x-1">
            {[
              { id: 'setup', label: 'Widget Setup', icon: '⚙️' },
              { id: 'testing', label: 'Testing', icon: '🧪' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'docs', label: 'Documentation', icon: '📚' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
                  ${activeTab === tab.id 
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Setup Tab */}
        {activeTab === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Widget Configuration</h2>
              
              <div className="space-y-6">
                {/* API Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={config.apiKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <NeonButton 
                      size="sm" 
                      variant="secondary"
                      onClick={() => copyToClipboard(config.apiKey)}
                    >
                      Copy
                    </NeonButton>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client ID
                  </label>
                  <Input
                    value={config.clientId}
                    onChange={(e) => setConfig({...config, clientId: e.target.value})}
                    placeholder="Your unique client identifier"
                  />
                </div>

                {/* Webhook URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Webhook URL (Optional)
                  </label>
                  <Input
                    value={config.webhook}
                    onChange={(e) => setConfig({...config, webhook: e.target.value})}
                    placeholder="https://your-crm.com/webhook"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Results will be sent to this URL in real-time
                  </p>
                </div>

                {/* Toggle Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Auto Credit Check</p>
                      <p className="text-xs text-gray-400">Automatically process forms on submission</p>
                    </div>
                    <Toggle
                      checked={config.autoCheck}
                      onChange={(e) => setConfig({...config, autoCheck: e.target.checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">FCRA Consent Required</p>
                      <p className="text-xs text-gray-400">Show consent checkbox (required for compliance)</p>
                    </div>
                    <Toggle
                      checked={config.consentRequired}
                      onChange={(e) => setConfig({...config, consentRequired: e.target.checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Allow Original Submit</p>
                      <p className="text-xs text-gray-400">Continue with form's original action after processing</p>
                    </div>
                    <Toggle
                      checked={config.allowOriginalSubmit}
                      onChange={(e) => setConfig({...config, allowOriginalSubmit: e.target.checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Debug Mode</p>
                      <p className="text-xs text-gray-400">Enable console logging (disable in production)</p>
                    </div>
                    <Toggle
                      checked={config.debug}
                      onChange={(e) => setConfig({...config, debug: e.target.checked})}
                    />
                  </div>
                </div>

                {/* Auto-Tagging Rules */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Auto-Tagging Rules</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-green-400">✅</span>
                        <span className="font-medium text-white">Whitelist Rules</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Min Credit Score</label>
                          <Input
                            type="number"
                            value={config.autoTag.whitelist.minCreditScore}
                            onChange={(e) => setConfig({
                              ...config,
                              autoTag: {
                                ...config.autoTag,
                                whitelist: {
                                  ...config.autoTag.whitelist,
                                  minCreditScore: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            min={300}
                            max={850}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Min Income</label>
                          <Input
                            type="number"
                            value={config.autoTag.whitelist.minIncome}
                            onChange={(e) => setConfig({
                              ...config,
                              autoTag: {
                                ...config.autoTag,
                                whitelist: {
                                  ...config.autoTag.whitelist,
                                  minIncome: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            min={0}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-red-400">🚫</span>
                        <span className="font-medium text-white">Blacklist Rules</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Max Credit Score</label>
                          <Input
                            type="number"
                            value={config.autoTag.blacklist.maxCreditScore}
                            onChange={(e) => setConfig({
                              ...config,
                              autoTag: {
                                ...config.autoTag,
                                blacklist: {
                                  ...config.autoTag.blacklist,
                                  maxCreditScore: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            min={300}
                            max={850}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Max Income</label>
                          <Input
                            type="number"
                            value={config.autoTag.blacklist.maxIncome}
                            onChange={(e) => setConfig({
                              ...config,
                              autoTag: {
                                ...config.autoTag,
                                blacklist: {
                                  ...config.autoTag.blacklist,
                                  maxIncome: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Embed Code */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Embed Code</h2>
              
              <div className="space-y-4">
                <Alert variant="info" title="Installation Instructions">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Copy the code below</li>
                    <li>Paste it before the closing &lt;/head&gt; tag on pages with lead forms</li>
                    <li>The widget will automatically enhance forms with email fields</li>
                    <li>Test using the Testing tab before going live</li>
                  </ol>
                </Alert>

                <div className="relative">
                  <pre className="bg-black/50 border border-white/10 rounded-lg p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-96">
                    {generateEmbedCode()}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(generateEmbedCode())}
                    className="absolute top-4 right-4 px-3 py-1 bg-neon-green/20 text-neon-green text-xs rounded border border-neon-green/30 hover:bg-neon-green/30 transition-colors"
                  >
                    Copy Code
                  </button>
                </div>

                <Alert variant="warning" title="FCRA Compliance Notice">
                  This widget automatically adds FCRA-compliant consent language. 
                  The consent checkbox is required by law for credit checks. 
                  Do not disable it in production environments.
                </Alert>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Testing Tab */}
        {activeTab === 'testing' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Widget Testing</h2>
            
            <div className="space-y-6">
              <Alert variant="info" title="Test Your Configuration">
                Use this form to test your widget configuration before deploying to your website. 
                This will make a real API call and consume one credit.
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <Input
                      value={testFormData.name}
                      onChange={(e) => setTestFormData({...testFormData, name: e.target.value})}
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={testFormData.email}
                      onChange={(e) => setTestFormData({...testFormData, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    <Input
                      value={testFormData.phone}
                      onChange={(e) => setTestFormData({...testFormData, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <NeonButton 
                    onClick={testWidget}
                    disabled={testing || !testFormData.name || !testFormData.email}
                    loading={testing}
                    className="w-full"
                  >
                    {testing ? 'Processing Credit Check...' : 'Test Widget'}
                  </NeonButton>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Current Configuration</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Auto Check:</span>
                      <Badge variant={config.autoCheck ? 'success' : 'warning'}>
                        {config.autoCheck ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Consent Required:</span>
                      <Badge variant={config.consentRequired ? 'success' : 'danger'}>
                        {config.consentRequired ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Webhook:</span>
                      <Badge variant={config.webhook ? 'success' : 'default'}>
                        {config.webhook ? 'Configured' : 'None'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Whitelist Score:</span>
                      <span className="text-white">{config.autoTag.whitelist.minCreditScore}+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blacklist Score:</span>
                      <span className="text-white">{config.autoTag.blacklist.maxCreditScore}-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Alert variant="info" title="Coming Soon">
              Detailed analytics including conversion rates, credit score distributions, 
              and webhook delivery statistics will be available soon.
            </Alert>
          </div>
        )}

        {/* Documentation Tab */}
        {activeTab === 'docs' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Integration Documentation</h2>
            
            <div className="space-y-6 text-sm text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Quick Start</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Configure your widget settings in the Setup tab</li>
                  <li>Copy the embed code and paste it in your website's &lt;head&gt; section</li>
                  <li>The widget will automatically detect and enhance forms with email fields</li>
                  <li>Test thoroughly using the Testing tab before going live</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">API Endpoints</h3>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 bg-black/50 rounded border border-white/10">
                    <strong>POST</strong> /api/integrate/widget
                    <p className="text-gray-400 mt-1">Process individual lead submissions from widget</p>
                  </div>
                  <div className="p-3 bg-black/50 rounded border border-white/10">
                    <strong>POST</strong> /api/integrate/webhook  
                    <p className="text-gray-400 mt-1">Process batch lead submissions via webhook</p>
                  </div>
                  <div className="p-3 bg-black/50 rounded border border-white/10">
                    <strong>GET</strong> /api/integrate/health
                    <p className="text-gray-400 mt-1">Check integration system health and client status</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">FCRA Compliance</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Consent checkbox is automatically added to forms</li>
                  <li>Consent is logged with timestamp and IP address</li>
                  <li>Soft credit inquiries only (no impact on credit score)</li>
                  <li>All data handling follows FCRA regulations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Support</h3>
                <p>
                  Need help with integration? Contact our support team or visit our 
                  <a href="#" className="text-neon-green hover:underline ml-1">developer documentation</a>.
                </p>
              </div>
            </div>
          </GlassCard>
        )}

      </div>
    </AppShell>
  );
};

export default function IntegrationsPageWithProvider() {
  return (
    <ToastProvider>
      <IntegrationsPage />
    </ToastProvider>
  );
}