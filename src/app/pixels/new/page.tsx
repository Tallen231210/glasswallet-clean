'use client';

import React, { useState } from 'react';

// Disable static generation for this page
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  Input, 
  Select,
  FormField, 
  Toggle,
  Alert,
  ToastProvider,
  useToast,
  Badge
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';

interface NewPixelConnectionData {
  platformType: 'META' | 'GOOGLE_ADS' | 'TIKTOK' | '';
  connectionName: string;
  pixelId: string;
  customerId: string; // For Google Ads Customer ID
  accessToken: string;
  syncSettings: {
    autoSync: boolean;
    syncQualifiedOnly: boolean;
    syncWhitelisted: boolean;
    excludeBlacklisted: boolean;
    minimumCreditScore: number | undefined;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
  };
}

const NewPixelConnectionPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<NewPixelConnectionData>({
    platformType: '',
    connectionName: '',
    pixelId: '',
    customerId: '',
    accessToken: '',
    syncSettings: {
      autoSync: false,
      syncQualifiedOnly: true,
      syncWhitelisted: true,
      excludeBlacklisted: true,
      minimumCreditScore: undefined,
      syncFrequency: 'daily'
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const platformOptions = [
    { value: '', label: 'Select a platform...' },
    { value: 'META', label: 'Meta (Facebook/Instagram)' },
    { value: 'GOOGLE_ADS', label: 'Google Ads' },
    { value: 'TIKTOK', label: 'TikTok Ads' },
  ];

  const syncFrequencyOptions = [
    { value: 'realtime', label: 'Real-time (Instant)' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
  ];

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'platformType':
        return !value ? 'Please select a platform' : '';
      case 'connectionName':
        return !value || value.length < 1 ? 'Connection name is required' : '';
      case 'pixelId':
        return !value ? 'Pixel ID is required' : '';
      case 'customerId':
        return formData.platformType === 'GOOGLE_ADS' && !value ? 'Customer ID is required for Google Ads' : '';
      case 'accessToken':
        // In development, we'll skip token validation
        return process.env.NODE_ENV === 'production' && !value ? 'Access token is required for production' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (name: string, value: any) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const parentKey = parent as keyof NewPixelConnectionData;
        const parentObject = prev[parentKey] as any;
        const updated = { ...parentObject };
        updated[child as string] = value;
        return {
          ...prev,
          [parentKey]: updated
        };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate main fields
    ['platformType', 'connectionName', 'pixelId', 'customerId', 'accessToken'].forEach(field => {
      const error = validateField(field, formData[field as keyof NewPixelConnectionData]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast({
        title: 'Validation Error',
        message: 'Please correct the errors below',
        variant: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/pixels/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platformType: formData.platformType,
          connectionName: formData.connectionName,
          pixelId: formData.pixelId,
          customerId: formData.customerId,
          syncSettings: formData.syncSettings
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create connection');
      }
      
      showToast({
        title: 'Success!',
        message: `${formData.platformType} connection created successfully`,
        variant: 'success'
      });
      
      // Redirect to pixel connections page
      setTimeout(() => {
        router.push('/pixels');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating pixel connection:', error);
      showToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create connection',
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlatformIcon = (platformType: string) => {
    switch (platformType) {
      case 'META': return '📘';
      case 'GOOGLE_ADS': return '🔍';
      case 'TIKTOK': return '🎵';
      default: return '🔗';
    }
  };

  const getPlatformInstructions = (platformType: string) => {
    switch (platformType) {
      case 'META':
        return {
          title: 'Meta Pixel Setup',
          instructions: [
            'Go to your Facebook Business Manager',
            'Navigate to Events Manager and select your pixel',
            'Copy your Pixel ID from the setup tab',
            'Generate an access token with ads_management permissions'
          ],
          pixelIdPlaceholder: '1234567890123456',
          tokenHelp: 'Get your access token from Facebook Developer Console'
        };
      case 'GOOGLE_ADS':
        return {
          title: 'Google Ads Setup',
          instructions: [
            'Sign in to your Google Ads account and note your Customer ID',
            'Go to Tools & Settings > API Center to get API access',
            'Create a Customer Match audience in Audience Manager',
            'Generate OAuth credentials for API access',
            'Customer ID format: 123-456-7890 (without dashes: 1234567890)'
          ],
          pixelIdPlaceholder: '1234567890',
          customerIdPlaceholder: '1234567890',
          tokenHelp: 'Use Google Ads API OAuth token with ads_management permissions'
        };
      case 'TIKTOK':
        return {
          title: 'TikTok Pixel Setup',
          instructions: [
            'Access your TikTok Ads Manager',
            'Go to Assets > Events',
            'Create or select your pixel',
            'Copy your Pixel Code and get API access token'
          ],
          pixelIdPlaceholder: 'C1ABC23DEF456GH789IJK0LMN',
          tokenHelp: 'Generate token in TikTok Business API section'
        };
      default:
        return null;
    }
  };

  const platformInfo = getPlatformInstructions(formData.platformType);

  return (
    <AppShell 
      headerActions={
        <NeonButton 
          variant="secondary" 
          onClick={() => router.push('/pixels')}
        >
          Back to Pixels
        </NeonButton>
      }
    >
      <div className="p-6 space-y-8 max-w-4xl mx-auto">

        {/* Form */}
        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Platform Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-3">
                Platform Selection
              </h3>
              
              <FormField 
                label="Advertising Platform" 
                required
                error={errors.platformType}
                helperText="Choose the advertising platform you want to connect"
              >
                <Select
                  placeholder="Select platform..."
                  options={platformOptions}
                  value={formData.platformType}
                  onChange={(e) => handleInputChange('platformType', e.target.value)}
                />
              </FormField>

              {formData.platformType && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getPlatformIcon(formData.platformType)}</span>
                    <h4 className="font-medium text-blue-300">
                      {platformInfo?.title}
                    </h4>
                  </div>
                  <div className="text-sm text-blue-200 space-y-1">
                    {platformInfo?.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">{index + 1}.</span>
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Connection Details */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-3">
                Connection Details
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField 
                    label="Connection Name" 
                    required
                    error={errors.connectionName}
                    helperText="A friendly name to identify this connection"
                  >
                    <Input
                      placeholder="My Meta Pixel"
                      value={formData.connectionName}
                      onChange={(e) => handleInputChange('connectionName', e.target.value)}
                      leftIcon="🏷️"
                    />
                  </FormField>

                  <FormField 
                    label="Pixel ID" 
                    required
                    error={errors.pixelId}
                    helperText={platformInfo ? `Your ${formData.platformType} pixel identifier` : 'Your pixel identifier'}
                  >
                    <Input
                      placeholder={platformInfo?.pixelIdPlaceholder || 'Enter pixel ID...'}
                      value={formData.pixelId}
                      onChange={(e) => handleInputChange('pixelId', e.target.value)}
                      leftIcon={getPlatformIcon(formData.platformType)}
                    />
                  </FormField>
                </div>

                {formData.platformType === 'GOOGLE_ADS' && (
                  <div>
                    <FormField 
                      label="Google Ads Customer ID" 
                      required
                      error={errors.customerId}
                      helperText="Your Google Ads Customer ID (format: 1234567890, without dashes)"
                    >
                      <Input
                        placeholder={platformInfo?.customerIdPlaceholder || '1234567890'}
                        value={formData.customerId}
                        onChange={(e) => handleInputChange('customerId', e.target.value)}
                        leftIcon="🔍"
                      />
                    </FormField>
                  </div>
                )}
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4">
                  <Alert variant="info" title="Development Mode">
                    Access token validation is disabled in development mode. 
                    You can create connections for testing without real API credentials.
                  </Alert>
                </div>
              )}
            </div>

            {/* Sync Settings */}
            <div>
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-3">
                <h3 className="text-lg font-semibold text-white">Sync Settings</h3>
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-sm text-neon-green hover:text-neon-green/80 transition-colors"
                >
                  {showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Sync Frequency">
                    <Select
                      options={syncFrequencyOptions}
                      value={formData.syncSettings.syncFrequency}
                      onChange={(e) => handleInputChange('syncSettings.syncFrequency', e.target.value)}
                    />
                  </FormField>

                  <div className="flex items-center pt-8">
                    <Toggle
                      label="Enable Auto-Sync"
                      description="Automatically sync new qualified leads"
                      checked={formData.syncSettings.autoSync}
                      onChange={(e) => handleInputChange('syncSettings.autoSync', e.target.checked)}
                    />
                  </div>
                </div>

                {/* Advanced Settings */}
                {showAdvancedSettings && (
                  <div className="space-y-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-white">Lead Filtering</h4>
                        
                        <Toggle
                          label="Qualified Leads Only"
                          description="Sync only leads tagged as qualified"
                          checked={formData.syncSettings.syncQualifiedOnly}
                          onChange={(e) => handleInputChange('syncSettings.syncQualifiedOnly', e.target.checked)}
                        />
                        
                        <Toggle
                          label="Include Whitelisted"
                          description="Sync leads tagged as whitelist"
                          checked={formData.syncSettings.syncWhitelisted}
                          onChange={(e) => handleInputChange('syncSettings.syncWhitelisted', e.target.checked)}
                        />
                        
                        <Toggle
                          label="Exclude Blacklisted"
                          description="Never sync blacklisted leads"
                          checked={formData.syncSettings.excludeBlacklisted}
                          onChange={(e) => handleInputChange('syncSettings.excludeBlacklisted', e.target.checked)}
                        />
                      </div>
                      
                      <div>
                        <FormField 
                          label="Minimum Credit Score"
                          helperText="Only sync leads with this credit score or higher"
                        >
                          <Input
                            type="number"
                            placeholder="650"
                            min="300"
                            max="850"
                            value={formData.syncSettings.minimumCreditScore?.toString() || ''}
                            onChange={(e) => handleInputChange('syncSettings.minimumCreditScore', 
                              e.target.value ? parseInt(e.target.value) : undefined
                            )}
                            leftIcon="📊"
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-white/10">
              <NeonButton 
                type="submit" 
                loading={isSubmitting}
                disabled={isSubmitting}
                className="flex-1 md:flex-none"
              >
                {isSubmitting ? 'Creating Connection...' : 'Create Connection'}
              </NeonButton>
              
              <NeonButton 
                type="button"
                variant="secondary"
                onClick={() => router.push('/pixels')}
                disabled={isSubmitting}
              >
                Cancel
              </NeonButton>
            </div>
          </form>
        </GlassCard>

        {/* Help Section */}
        <GlassCard className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-white mb-2">📘 Meta Pixel</h4>
              <p className="text-gray-400">
                Sync qualified leads to Facebook Custom Audiences for precise ad targeting and lookalike audience creation.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">🔍 Google Ads</h4>
              <p className="text-gray-400">
                Upload leads to Customer Match lists for search campaigns and display remarketing.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">🎵 TikTok Ads</h4>
              <p className="text-gray-400">
                Send conversion events to TikTok for campaign optimization and audience building.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
};

export default function NewPixelConnectionPageWrapper() {
  return (
    <ToastProvider>
      <NewPixelConnectionPage />
    </ToastProvider>
  );
}