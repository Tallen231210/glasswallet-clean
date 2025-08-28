'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  Input, 
  FormField, 
  Toggle,
  Alert,
  ToastProvider,
  useToast,
  Loading
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';
import { CreateLeadInput } from '@/lib/validation';

const NewLeadForm = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<CreateLeadInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    consentGiven: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'firstName':
        return !value || value.length < 1 ? 'First name is required' : '';
      case 'lastName':
        return !value || value.length < 1 ? 'Last name is required' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !value ? 'Email is required' : !emailRegex.test(value) ? 'Invalid email format' : '';
      case 'phone':
        if (value && !/^\(\d{3}\) \d{3}-\d{4}$/.test(value)) {
          return 'Phone must be in format (XXX) XXX-XXXX';
        }
        return '';
      case 'zipCode':
        if (value && !/^\d{5}(-\d{4})?$/.test(value)) {
          return 'Zip code must be in format XXXXX or XXXXX-XXXX';
        }
        return '';
      case 'state':
        if (value && value.length !== 2) {
          return 'State must be 2 characters (e.g., CA)';
        }
        return '';
      case 'consentGiven':
        return !value ? 'Consent is required to proceed' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length >= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return digits;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof CreateLeadInput]);
      if (error) {
        newErrors[key] = error;
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
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create lead');
      }
      
      showToast({
        title: 'Success!',
        message: 'Lead created successfully',
        variant: 'success'
      });
      
      // Redirect to leads list or lead details
      setTimeout(() => {
        router.push('/leads');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating lead:', error);
      showToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create lead',
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell 
      headerActions={
        <NeonButton 
          variant="secondary" 
          onClick={() => router.push('/leads')}
        >
          Back to Leads
        </NeonButton>
      }
    >
      <div className="p-6 max-w-4xl mx-auto">

        {/* Form Card */}
        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-3">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  label="First Name" 
                  required
                  error={errors.firstName}
                >
                  <Input
                    placeholder="Enter first name..."
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    leftIcon="👤"
                  />
                </FormField>

                <FormField 
                  label="Last Name" 
                  required
                  error={errors.lastName}
                >
                  <Input
                    placeholder="Enter last name..."
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    leftIcon="👤"
                  />
                </FormField>

                <FormField 
                  label="Email Address" 
                  required
                  error={errors.email}
                  helperText="Primary contact email for the lead"
                >
                  <Input
                    type="email"
                    placeholder="Enter email address..."
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    leftIcon="📧"
                  />
                </FormField>

                <FormField 
                  label="Phone Number" 
                  error={errors.phone}
                  helperText="Format: (XXX) XXX-XXXX"
                >
                  <Input
                    type="tel"
                    placeholder="(XXX) XXX-XXXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                    leftIcon="📞"
                  />
                </FormField>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-3">
                Address Information
              </h3>
              
              <div className="space-y-6">
                <FormField 
                  label="Street Address" 
                  error={errors.address}
                  helperText="Optional - for more accurate credit reporting"
                >
                  <Input
                    placeholder="Enter street address..."
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    leftIcon="🏠"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField 
                    label="City" 
                    error={errors.city}
                  >
                    <Input
                      placeholder="Enter city..."
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      leftIcon="🏙️"
                    />
                  </FormField>

                  <FormField 
                    label="State" 
                    error={errors.state}
                    helperText="2-letter code (e.g., CA)"
                  >
                    <Input
                      placeholder="CA"
                      maxLength={2}
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                      leftIcon="🗺️"
                    />
                  </FormField>

                  <FormField 
                    label="ZIP Code" 
                    error={errors.zipCode}
                    helperText="5 or 9 digit format"
                  >
                    <Input
                      placeholder="12345 or 12345-6789"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      leftIcon="📍"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Consent Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-3">
                Consent & Compliance
              </h3>
              
              <div className="space-y-4">
                <FormField error={errors.consentGiven}>
                  <Toggle
                    label="FCRA Compliance Consent"
                    description="The lead has provided written consent for credit reporting in compliance with FCRA regulations. This is required before performing any credit pulls."
                    checked={formData.consentGiven}
                    onChange={(e) => handleInputChange('consentGiven', e.target.checked)}
                  />
                </FormField>

                {!formData.consentGiven && (
                  <Alert variant="warning" title="Consent Required">
                    FCRA compliance requires explicit written consent from the lead before performing credit checks. 
                    Please ensure proper documentation is collected.
                  </Alert>
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
                {isSubmitting ? 'Creating Lead...' : 'Create Lead'}
              </NeonButton>
              
              <NeonButton 
                type="button"
                variant="secondary"
                onClick={() => router.push('/leads')}
                disabled={isSubmitting}
              >
                Cancel
              </NeonButton>
            </div>
          </form>
        </GlassCard>

        {isSubmitting && (
          <GlassCard className="mt-6">
            <Loading message="Creating lead and validating data..." size="lg" />
          </GlassCard>
        )}
      </div>
    </AppShell>
  );
};

export default function NewLeadPage() {
  return (
    <ToastProvider>
      <NewLeadForm />
    </ToastProvider>
  );
}