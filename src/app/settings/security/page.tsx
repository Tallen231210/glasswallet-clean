'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { InteractiveCard } from '@/components/ui/InteractiveCard';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { usePermissions } from '@/contexts/UserContext';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  securityAlerts: boolean;
  sessionTimeout: number;
  allowedIpAddresses: string[];
  recentSessions: SessionInfo[];
  passwordLastChanged: string;
  recoveryEmail: string;
  apiAccessEnabled: boolean;
  webhookSecrets: string[];
}

interface SessionInfo {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditing2FA, setIsEditing2FA] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock security settings data
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    loginNotifications: true,
    securityAlerts: true,
    sessionTimeout: 30,
    allowedIpAddresses: ['192.168.1.100', '10.0.0.50'],
    passwordLastChanged: '2024-07-15T10:30:00Z',
    recoveryEmail: 'admin@glasswallet.io',
    apiAccessEnabled: true,
    webhookSecrets: ['whsec_1234567890abcdef', 'whsec_abcdef1234567890'],
    recentSessions: [
      {
        id: '1',
        device: 'Chrome on MacBook Pro',
        location: 'New York, NY',
        ipAddress: '192.168.1.100',
        lastActive: '2024-08-26T20:45:00Z',
        current: true
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        location: 'New York, NY',
        ipAddress: '192.168.1.101',
        lastActive: '2024-08-26T14:30:00Z',
        current: false
      },
      {
        id: '3',
        device: 'Chrome on Windows',
        location: 'San Francisco, CA',
        ipAddress: '10.0.0.50',
        lastActive: '2024-08-25T16:20:00Z',
        current: false
      }
    ]
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSettings(prev => ({
      ...prev,
      passwordLastChanged: new Date().toISOString()
    }));
    
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsEditingPassword(false);
    setIsSaving(false);
    
    console.log('Password updated successfully');
  };

  const handleToggleSetting = (setting: keyof SecuritySettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    console.log(`${setting} toggled`);
  };

  const handleSessionRevoke = (sessionId: string) => {
    setSettings(prev => ({
      ...prev,
      recentSessions: prev.recentSessions.filter(s => s.id !== sessionId)
    }));
    console.log(`Session ${sessionId} revoked`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return formatDate(dateString);
  };

  return (
    <AppShell
      headerTitle="Security Settings"
      headerSubtitle="Manage your account security and access controls"
      headerActions={
        <div className="flex gap-2">
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/admin')}
          >
            ← Back to Admin
          </NeonButton>
          <NeonButton 
            variant="secondary"
            onClick={() => console.log('Download security report')}
          >
            📊 Security Report
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-8 max-w-4xl mx-auto">

        {/* Security Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Security Status */}
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-electric-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-deep-navy-start font-bold text-2xl">🔒</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Security Status</h2>
              <Badge variant="success" className="mb-3">Excellent</Badge>
              <p className="text-gray-400 text-sm">All security measures active</p>
            </GlassCard>
          </InteractiveCard>

          {/* Recent Activity */}
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Login:</span>
                  <span className="text-white text-sm">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Sessions:</span>
                  <span className="text-neon-green font-bold">{settings.recentSessions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">2FA Status:</span>
                  <Badge variant={settings.twoFactorEnabled ? "success" : "danger"} size="sm">
                    {settings.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">API Access:</span>
                  <Badge variant={settings.apiAccessEnabled ? "success" : "warning"} size="sm">
                    {settings.apiAccessEnabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </GlassCard>
          </InteractiveCard>

          {/* Quick Actions */}
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <NeonButton 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setIsEditingPassword(true)}
                >
                  🔑 Change Password
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setIsEditing2FA(true)}
                >
                  📱 Setup 2FA
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => console.log('Download backup codes')}
                >
                  💾 Backup Codes
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => console.log('View audit log')}
                >
                  📋 Security Audit
                </NeonButton>
              </div>
            </GlassCard>
          </InteractiveCard>
        </div>

        {/* Password & Authentication */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Password & Authentication</h2>
            <Badge variant="neon">Admin Level</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Password Management</h3>
              
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400">Password Last Changed:</span>
                  <span className="text-white text-sm">{formatDate(settings.passwordLastChanged)}</span>
                </div>
                
                {!isEditingPassword ? (
                  <NeonButton 
                    variant="secondary" 
                    onClick={() => setIsEditingPassword(true)}
                  >
                    Change Password
                  </NeonButton>
                ) : (
                  <div className="space-y-4">
                    <FormField label="Current Password" required>
                      <Input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                      />
                    </FormField>
                    
                    <FormField label="New Password" required>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                      />
                    </FormField>
                    
                    <FormField label="Confirm New Password" required>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </FormField>
                    
                    <div className="flex gap-2">
                      <NeonButton 
                        onClick={handlePasswordChange}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Updating...' : 'Update Password'}
                      </NeonButton>
                      <NeonButton 
                        variant="secondary"
                        onClick={() => {
                          setIsEditingPassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </NeonButton>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2FA Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
              
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400">2FA Status:</span>
                  <Badge variant={settings.twoFactorEnabled ? "success" : "danger"} size="sm">
                    {settings.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                
                <p className="text-gray-300 text-sm mb-4">
                  Two-factor authentication adds an extra layer of security to your account.
                </p>
                
                <div className="flex gap-2">
                  <NeonButton 
                    variant={settings.twoFactorEnabled ? "secondary" : "primary"}
                    onClick={() => handleToggleSetting('twoFactorEnabled')}
                  >
                    {settings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </NeonButton>
                  {settings.twoFactorEnabled && (
                    <NeonButton 
                      variant="secondary"
                      onClick={() => console.log('Show backup codes')}
                    >
                      Backup Codes
                    </NeonButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Security Preferences */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Security Preferences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Login Notifications</span>
                    <p className="text-gray-400 text-sm">Get notified of new logins</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('loginNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.loginNotifications ? 'bg-neon-green' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Security Alerts</span>
                    <p className="text-gray-400 text-sm">Critical security notifications</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('securityAlerts')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.securityAlerts ? 'bg-neon-green' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Session Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Session Management</h3>
              
              <FormField label="Session Timeout (minutes)">
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours</option>
                </select>
              </FormField>

              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">API Access</span>
                  <Badge variant={settings.apiAccessEnabled ? "success" : "warning"} size="sm">
                    {settings.apiAccessEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Allow API access for integrations
                </p>
                <NeonButton 
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleSetting('apiAccessEnabled')}
                >
                  {settings.apiAccessEnabled ? 'Disable API' : 'Enable API'}
                </NeonButton>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Active Sessions */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Active Sessions</h2>
            <NeonButton 
              variant="secondary"
              onClick={() => console.log('Refresh sessions')}
            >
              🔄 Refresh
            </NeonButton>
          </div>

          <div className="space-y-4">
            {settings.recentSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 border rounded-lg ${
                  session.current 
                    ? 'bg-neon-green/10 border-neon-green/30' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-medium">{session.device}</span>
                      {session.current && (
                        <Badge variant="success" size="sm">Current Session</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>📍 {session.location}</div>
                      <div>🌐 {session.ipAddress}</div>
                      <div>⏰ Last active: {formatRelativeTime(session.lastActive)}</div>
                    </div>
                  </div>
                  
                  {!session.current && (
                    <NeonButton 
                      variant="secondary"
                      size="sm"
                      className="bg-red-600/20 hover:bg-red-600/30"
                      onClick={() => handleSessionRevoke(session.id)}
                    >
                      Revoke
                    </NeonButton>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-lg">⚠️</span>
              <div className="text-sm">
                <p className="text-yellow-400 font-medium mb-1">Session Security</p>
                <p className="text-gray-300">
                  If you notice any suspicious sessions, revoke them immediately and change your password. 
                  All sessions will be terminated if you change your password.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Advanced Security */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Advanced Security</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IP Restrictions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">IP Address Restrictions</h3>
              
              <div className="space-y-2">
                {settings.allowedIpAddresses.map((ip, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                    <span className="text-white font-mono">{ip}</span>
                    <NeonButton 
                      variant="secondary"
                      size="sm"
                      className="bg-red-600/20 hover:bg-red-600/30"
                      onClick={() => {
                        setSettings(prev => ({
                          ...prev,
                          allowedIpAddresses: prev.allowedIpAddresses.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      Remove
                    </NeonButton>
                  </div>
                ))}
                
                <NeonButton 
                  variant="secondary"
                  onClick={() => console.log('Add IP address')}
                >
                  + Add IP Address
                </NeonButton>
              </div>
            </div>

            {/* Webhook Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Webhook Security</h3>
              
              <div className="space-y-2">
                {settings.webhookSecrets.map((secret, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                    <span className="text-white font-mono text-sm">
                      {secret.substring(0, 12)}...
                    </span>
                    <div className="flex gap-2">
                      <NeonButton 
                        variant="secondary"
                        size="sm"
                        onClick={() => console.log('Regenerate secret')}
                      >
                        Regenerate
                      </NeonButton>
                      <NeonButton 
                        variant="secondary"
                        size="sm"
                        className="bg-red-600/20 hover:bg-red-600/30"
                        onClick={() => {
                          setSettings(prev => ({
                            ...prev,
                            webhookSecrets: prev.webhookSecrets.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        Remove
                      </NeonButton>
                    </div>
                  </div>
                ))}
                
                <NeonButton 
                  variant="secondary"
                  onClick={() => console.log('Add webhook secret')}
                >
                  + Add Webhook Secret
                </NeonButton>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">🚨</span>
              <div className="text-sm">
                <p className="text-red-400 font-medium mb-1">Critical Security Actions</p>
                <p className="text-gray-300 mb-3">
                  These actions will affect all users and integrations. Use with caution.
                </p>
                <div className="flex gap-2">
                  <NeonButton 
                    variant="secondary"
                    size="sm"
                    className="bg-red-600/20 hover:bg-red-600/30"
                    onClick={() => console.log('Force logout all users')}
                  >
                    Force Logout All Users
                  </NeonButton>
                  <NeonButton 
                    variant="secondary"
                    size="sm"
                    className="bg-red-600/20 hover:bg-red-600/30"
                    onClick={() => console.log('Reset all API keys')}
                  >
                    Reset All API Keys
                  </NeonButton>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}