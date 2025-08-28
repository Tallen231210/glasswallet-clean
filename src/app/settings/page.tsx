'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  Input,
  Select,
  Toggle,
  Badge,
  ToastProvider,
  useToast,
  Alert,
  FormField
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';

const SettingsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [settings, setSettings] = useState({
    // Account Settings
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    company: 'Acme Financial Services',
    timezone: 'America/New_York',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    leadAlerts: true,
    systemAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30',
    apiAccess: true,
    webhookAccess: true,
    
    // Platform Settings
    autoTagging: true,
    leadScoring: true,
    pixelOptimization: true,
    creditThreshold: 10,
    defaultLeadSource: 'website',
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Save settings to API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast({
        title: 'Settings Saved',
        message: 'Your settings have been updated successfully',
        variant: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Save Failed',
        message: 'Unable to save settings. Please try again.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'platform', label: 'Platform', icon: '⚙️' },
    { id: 'api', label: 'API Keys', icon: '🔐' },
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
  ];

  const leadSourceOptions = [
    { value: 'website', label: 'Website Form' },
    { value: 'facebook', label: 'Facebook Ads' },
    { value: 'google', label: 'Google Ads' },
    { value: 'organic', label: 'Organic Search' },
    { value: 'referral', label: 'Referral' },
    { value: 'direct', label: 'Direct Traffic' },
  ];

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="First Name" required>
          <Input
            value={settings.firstName}
            onChange={(e) => handleSettingChange('firstName', e.target.value)}
            placeholder="Enter first name"
          />
        </FormField>
        
        <FormField label="Last Name" required>
          <Input
            value={settings.lastName}
            onChange={(e) => handleSettingChange('lastName', e.target.value)}
            placeholder="Enter last name"
          />
        </FormField>
      </div>

      <FormField label="Email Address" required>
        <Input
          type="email"
          value={settings.email}
          onChange={(e) => handleSettingChange('email', e.target.value)}
          placeholder="Enter email address"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Phone Number">
          <Input
            type="tel"
            value={settings.phone}
            onChange={(e) => handleSettingChange('phone', e.target.value)}
            placeholder="Enter phone number"
          />
        </FormField>
        
        <FormField label="Company">
          <Input
            value={settings.company}
            onChange={(e) => handleSettingChange('company', e.target.value)}
            placeholder="Enter company name"
          />
        </FormField>
      </div>

      <FormField label="Timezone">
        <Select
          value={settings.timezone}
          onChange={(e) => handleSettingChange('timezone', e.target.value)}
          options={timezoneOptions}
        />
      </FormField>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Communication Preferences</h4>
        
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">Email Notifications</p>
            <p className="text-sm text-gray-400">Receive notifications via email</p>
          </div>
          <Toggle
            checked={settings.emailNotifications}
            onChange={(checked) => handleSettingChange('emailNotifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">SMS Notifications</p>
            <p className="text-sm text-gray-400">Receive urgent alerts via text</p>
          </div>
          <Toggle
            checked={settings.smsNotifications}
            onChange={(checked) => handleSettingChange('smsNotifications', checked)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Alert Types</h4>
        
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">Lead Alerts</p>
            <p className="text-sm text-gray-400">New leads and qualification updates</p>
          </div>
          <Toggle
            checked={settings.leadAlerts}
            onChange={(checked) => handleSettingChange('leadAlerts', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">System Alerts</p>
            <p className="text-sm text-gray-400">System status and maintenance notices</p>
          </div>
          <Toggle
            checked={settings.systemAlerts}
            onChange={(checked) => handleSettingChange('systemAlerts', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">Weekly Reports</p>
            <p className="text-sm text-gray-400">Weekly performance summaries</p>
          </div>
          <Toggle
            checked={settings.weeklyReports}
            onChange={(checked) => handleSettingChange('weeklyReports', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">Monthly Reports</p>
            <p className="text-sm text-gray-400">Monthly analytics reports</p>
          </div>
          <Toggle
            checked={settings.monthlyReports}
            onChange={(checked) => handleSettingChange('monthlyReports', checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
        <div>
          <p className="text-white font-medium">Two-Factor Authentication</p>
          <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
        </div>
        <div className="flex items-center gap-3">
          {settings.twoFactorAuth ? (
            <Badge variant="success" size="sm">Enabled</Badge>
          ) : (
            <Badge variant="warning" size="sm">Disabled</Badge>
          )}
          <Toggle
            checked={settings.twoFactorAuth}
            onChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
          />
        </div>
      </div>

      <FormField label="Session Timeout (minutes)">
        <Select
          value={settings.sessionTimeout}
          onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
          options={[
            { value: '15', label: '15 minutes' },
            { value: '30', label: '30 minutes' },
            { value: '60', label: '1 hour' },
            { value: '240', label: '4 hours' },
            { value: '480', label: '8 hours' },
          ]}
        />
      </FormField>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">API Access</h4>
        
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">API Access</p>
            <p className="text-sm text-gray-400">Allow API access to your account</p>
          </div>
          <Toggle
            checked={settings.apiAccess}
            onChange={(checked) => handleSettingChange('apiAccess', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">Webhook Access</p>
            <p className="text-sm text-gray-400">Allow outbound webhook calls</p>
          </div>
          <Toggle
            checked={settings.webhookAccess}
            onChange={(checked) => handleSettingChange('webhookAccess', checked)}
          />
        </div>
      </div>

      <Alert variant="info" title="Password Management">
        <div className="flex items-center justify-between">
          <span>Last password change: 30 days ago</span>
          <NeonButton size="sm" variant="secondary">
            Change Password
          </NeonButton>
        </div>
      </Alert>
    </div>
  );

  const renderPlatformSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Automation Features</h4>
        
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">Auto-Tagging Rules</p>
            <p className="text-sm text-gray-400">Automatically tag leads based on criteria</p>
          </div>
          <Toggle
            checked={settings.autoTagging}
            onChange={(checked) => handleSettingChange('autoTagging', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">AI Lead Scoring</p>
            <p className="text-sm text-gray-400">Use AI to score and prioritize leads</p>
          </div>
          <Toggle
            checked={settings.leadScoring}
            onChange={(checked) => handleSettingChange('leadScoring', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">Pixel Optimization</p>
            <p className="text-sm text-gray-400">Automatically optimize ad pixels</p>
          </div>
          <Toggle
            checked={settings.pixelOptimization}
            onChange={(checked) => handleSettingChange('pixelOptimization', checked)}
          />
        </div>
      </div>

      <FormField label="Credit Alert Threshold">
        <Input
          type="number"
          min="0"
          max="100"
          value={settings.creditThreshold}
          onChange={(e) => handleSettingChange('creditThreshold', parseInt(e.target.value))}
          placeholder="Alert when credits are below..."
        />
      </FormField>

      <FormField label="Default Lead Source">
        <Select
          value={settings.defaultLeadSource}
          onChange={(e) => handleSettingChange('defaultLeadSource', e.target.value)}
          options={leadSourceOptions}
        />
      </FormField>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <Alert variant="info" title="API Documentation">
        <div className="flex items-center justify-between">
          <span>Access our comprehensive API documentation and examples</span>
          <NeonButton size="sm" variant="secondary">
            View Docs
          </NeonButton>
        </div>
      </Alert>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">API Keys</h4>
          <NeonButton size="sm">Generate New Key</NeonButton>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Production Key</span>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
          <div className="flex items-center gap-3">
            <code className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">
              gw_prod_•••••••••••••••••••••••••••••••12345
            </code>
            <NeonButton size="sm" variant="secondary">Copy</NeonButton>
            <NeonButton size="sm" variant="secondary">Revoke</NeonButton>
          </div>
          <p className="text-xs text-gray-400 mt-2">Created: January 15, 2024 • Last used: 2 hours ago</p>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Development Key</span>
            <Badge variant="warning" size="sm">Limited</Badge>
          </div>
          <div className="flex items-center gap-3">
            <code className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">
              gw_dev_•••••••••••••••••••••••••••••••67890
            </code>
            <NeonButton size="sm" variant="secondary">Copy</NeonButton>
            <NeonButton size="sm" variant="secondary">Revoke</NeonButton>
          </div>
          <p className="text-xs text-gray-400 mt-2">Created: January 10, 2024 • Last used: Never</p>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 rounded-lg border border-yellow-500/20">
        <h4 className="text-yellow-400 font-medium mb-2">Rate Limits</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-300">Requests per minute:</p>
            <p className="text-white font-medium">1,000</p>
          </div>
          <div>
            <p className="text-gray-300">Daily limit:</p>
            <p className="text-white font-medium">100,000</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell 
      headerActions={
        <div className="flex gap-2">
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/billing')}
          >
            Billing
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings, notifications, and platform preferences</p>
        </div>

        {/* Settings Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/5 rounded-lg p-1 backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-neon-green text-black'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <GlassCard className="p-6">
          {activeTab === 'account' && renderAccountSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'platform' && renderPlatformSettings()}
          {activeTab === 'api' && renderApiSettings()}

          {/* Save Button */}
          <div className="flex justify-end pt-8 mt-8 border-t border-white/10">
            <div className="flex gap-3">
              <NeonButton
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Reset Changes
              </NeonButton>
              <NeonButton
                onClick={handleSave}
                loading={loading}
              >
                Save Settings
              </NeonButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
};

export default function SettingsPageWrapper() {
  return (
    <ToastProvider>
      <SettingsPage />
    </ToastProvider>
  );
}