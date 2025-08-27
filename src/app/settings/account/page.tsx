'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { InteractiveCard } from '@/components/ui/InteractiveCard';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { usePermissions } from '@/contexts/UserContext';

interface AdminProfile {
  name: string;
  email: string;
  role: string;
  company: string;
  phone: string;
  timezone: string;
  language: string;
  avatar?: string;
  lastLogin: string;
  accountCreated: string;
  loginCount: number;
  permissions: string[];
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock admin profile data
  const [profile, setProfile] = useState<AdminProfile>({
    name: 'Platform Administrator',
    email: 'admin@glasswallet.io',
    role: 'Platform Admin',
    company: 'GlassWallet Inc.',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York',
    language: 'English (US)',
    lastLogin: '2024-08-26T18:45:00Z',
    accountCreated: '2024-01-01T00:00:00Z',
    loginCount: 247,
    permissions: [
      'platformAdminAccess',
      'userManagement',
      'systemMonitoring',
      'dataExport',
      'billingAdmin',
      'securityAdmin'
    ]
  });

  const [editableProfile, setEditableProfile] = useState<AdminProfile>(profile);

  const handleInputChange = (field: keyof AdminProfile, value: string) => {
    setEditableProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProfile(editableProfile);
    setIsEditing(false);
    setIsSaving(false);
    
    console.log('Profile updated:', editableProfile);
  };

  const handleCancel = () => {
    setEditableProfile(profile);
    setIsEditing(false);
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

  return (
    <AppShell
      headerTitle="Account Settings"
      headerSubtitle="Manage your admin profile and account preferences"
      headerActions={
        <div className="flex gap-2">
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/admin')}
          >
            ← Back to Admin
          </NeonButton>
          {!isEditing ? (
            <NeonButton onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </NeonButton>
          ) : (
            <div className="flex gap-2">
              <NeonButton 
                variant="secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </NeonButton>
              <NeonButton 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '💾 Saving...' : '💾 Save Changes'}
              </NeonButton>
            </div>
          )}
        </div>
      }
    >
      <div className="p-6 space-y-8 max-w-4xl mx-auto">

        {/* Profile Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar & Basic Info */}
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-neon-green to-electric-green rounded-full flex items-center justify-center mx-auto mb-4 text-deep-navy-start font-bold text-2xl">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{profile.name}</h2>
              <Badge variant="danger" className="mb-3">Platform Admin</Badge>
              <p className="text-gray-400 text-sm">{profile.company}</p>
              <p className="text-gray-500 text-xs mt-2">
                Member since {new Date(profile.accountCreated).getFullYear()}
              </p>
            </GlassCard>
          </InteractiveCard>

          {/* Account Stats */}
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Account Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Login:</span>
                  <span className="text-white text-sm">
                    {formatDate(profile.lastLogin)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Logins:</span>
                  <span className="text-neon-green font-bold">{profile.loginCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account Status:</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Permissions:</span>
                  <Badge variant="neon" size="sm">{profile.permissions.length} granted</Badge>
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
                  onClick={() => router.push('/settings/security')}
                >
                  🔒 Security Settings
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => console.log('Change password')}
                >
                  🔑 Change Password
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => console.log('Download data')}
                >
                  📥 Download Data
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => console.log('Activity log')}
                >
                  📋 Activity Log
                </NeonButton>
              </div>
            </GlassCard>
          </InteractiveCard>
        </div>

        {/* Profile Details Form */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Profile Information</h2>
            {!isEditing && (
              <Badge variant="neon">Read Only</Badge>
            )}
            {isEditing && (
              <Badge variant="warning">Editing Mode</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Full Name" required>
              <Input
                type="text"
                value={isEditing ? editableProfile.name : profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your full name"
              />
            </FormField>

            <FormField label="Email Address" required>
              <Input
                type="email"
                value={isEditing ? editableProfile.email : profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your email address"
              />
            </FormField>

            <FormField label="Company">
              <Input
                type="text"
                value={isEditing ? editableProfile.company : profile.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter company name"
              />
            </FormField>

            <FormField label="Phone Number">
              <Input
                type="tel"
                value={isEditing ? editableProfile.phone : profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter phone number"
              />
            </FormField>

            <FormField label="Timezone">
              <select
                value={isEditing ? editableProfile.timezone : profile.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent disabled:opacity-50"
              >
                <option value="America/New_York">Eastern Time (UTC-5)</option>
                <option value="America/Chicago">Central Time (UTC-6)</option>
                <option value="America/Denver">Mountain Time (UTC-7)</option>
                <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                <option value="UTC">UTC</option>
              </select>
            </FormField>

            <FormField label="Language">
              <select
                value={isEditing ? editableProfile.language : profile.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent disabled:opacity-50"
              >
                <option value="English (US)">English (US)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </FormField>
          </div>

          {isEditing && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 text-lg">⚠️</span>
                <div className="text-sm">
                  <p className="text-yellow-400 font-medium mb-1">Profile Update Notice</p>
                  <p className="text-gray-300">
                    Changes to your profile will take effect immediately. Your email address is used 
                    for system notifications and account recovery.
                  </p>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Admin Permissions */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Admin Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.permissions.map((permission, index) => (
              <div
                key={index}
                className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                  <span className="text-white font-medium">
                    {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
                <Badge variant="success" size="sm">Granted</Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-lg">ℹ️</span>
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">Admin Permissions</p>
                <p className="text-gray-300">
                  These permissions grant you full administrative access to the GlassWallet platform. 
                  Contact system administrators if you need additional permissions or have access issues.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Account Actions */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Account Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Data & Privacy</h3>
              <div className="space-y-3">
                <NeonButton 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => console.log('Export account data')}
                >
                  📦 Export Account Data
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => console.log('Privacy settings')}
                >
                  🔐 Privacy Settings
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => console.log('Audit log')}
                >
                  📋 View Audit Log
                </NeonButton>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Account Management</h3>
              <div className="space-y-3">
                <NeonButton 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => console.log('Account backup')}
                >
                  💾 Backup Settings
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => console.log('API access')}
                >
                  🔑 API Access
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  className="w-full justify-start bg-red-600/20 hover:bg-red-600/30"
                  onClick={() => console.log('Deactivate account')}
                >
                  ⚠️ Deactivate Account
                </NeonButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}