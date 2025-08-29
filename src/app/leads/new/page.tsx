'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { SimpleToast } from '@/components/ui/SimpleToast';

interface ValidationErrors {
  [key: string]: string;
}

export default function NewLeadPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Step 2: Additional Details
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Step 3: Lead Source & Notes
    source: 'website',
    notes: '',
    
    // Step 4: FCRA Compliance
    consentGiven: false,
    consentDate: '',
  });

  const steps = [
    { title: 'Basic Info', description: 'Contact details' },
    { title: 'Address', description: 'Location information' },
    { title: 'Source & Notes', description: 'Lead origin and notes' },
    { title: 'FCRA Consent', description: 'Credit check authorization' }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phone === '' || re.test(phone);
  };

  const validateStep = (step: number) => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (formData.phone && !validatePhone(formData.phone)) {
          newErrors.phone = 'Please enter a valid phone number';
        }
        break;
      case 2:
        if (formData.zipCode && !/^\d{5}$/.test(formData.zipCode)) {
          newErrors.zipCode = 'ZIP code must be 5 digits';
        }
        if (formData.state && formData.state.length !== 2) {
          newErrors.state = 'State must be 2 letters (e.g., NY)';
        }
        break;
      case 3:
        if (!formData.source) newErrors.source = 'Lead source is required';
        break;
      case 4:
        if (!formData.consentGiven) newErrors.consent = 'FCRA consent is required for credit checks';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      showNotification('Please fix the errors above and try again.', 'error');
      return;
    }

    if (currentStep < steps.length) {
      nextStep();
      return;
    }

    // Final submission
    setIsSubmitting(true);
    try {
      // Simulate realistic API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For MVP, we'll simulate success and add to mock data
      const newLead = {
        id: `lead-${Date.now()}`,
        ...formData,
        status: 'new' as const,
        creditScore: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['new-customer'],
        consentDate: formData.consentGiven ? new Date().toISOString() : null,
      };
      
      // In a real app, this would be an API call
      console.log('New lead created:', newLead);
      
      showNotification('🎉 Lead added successfully! Credit qualification can now be initiated.', 'success');
      
      // Small delay to show the success message
      setTimeout(() => {
        router.push('/leads');
      }, 2000);
      
    } catch (error) {
      console.error('Lead creation error:', error);
      showNotification('Failed to add lead. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📝 Add New Lead</h1>
            <p className="text-gray-400">Create a new lead record for credit qualification</p>
          </div>
          <div className="flex gap-3">
            <NeonButton variant="secondary" onClick={() => router.push('/leads')}>
              Back to Leads
            </NeonButton>
          </div>
        </div>

        {/* Progress Steps */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep > index + 1 ? 'bg-green-500 text-white' :
                  currentStep === index + 1 ? 'bg-neon-green text-black' :
                  'bg-gray-600 text-gray-300'
                }`}>
                  {currentStep > index + 1 ? '✓' : index + 1}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-white">{step.title}</p>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`ml-6 w-16 h-0.5 ${
                    currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">📋 Basic Information</h2>
                  <p className="text-gray-400">Enter the lead's contact details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="First Name" required>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      placeholder="Enter first name..."
                      required
                      className={errors.firstName ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </FormField>

                  <FormField label="Last Name" required>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      placeholder="Enter last name..."
                      required
                      className={errors.lastName ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </FormField>
                </div>

                <FormField label="Email Address" required>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address..."
                    required
                    className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </FormField>

                <FormField label="Phone Number">
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                    className={errors.phone ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                  )}
                </FormField>
              </div>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">🏠 Address Information</h2>
                  <p className="text-gray-400">Optional - helps with credit verification</p>
                </div>

                <FormField label="Street Address">
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="123 Main St"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="City">
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="New York"
                    />
                  </FormField>

                  <FormField label="State">
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
                      placeholder="NY"
                      maxLength={2}
                      className={errors.state ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.state && (
                      <p className="text-red-400 text-sm mt-1">{errors.state}</p>
                    )}
                  </FormField>

                  <FormField label="ZIP Code">
                    <Input
                      value={formData.zipCode}
                      onChange={(e) => setFormData({...formData, zipCode: e.target.value.replace(/\D/g, '')})}
                      placeholder="10001"
                      maxLength={5}
                      className={errors.zipCode ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.zipCode && (
                      <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>
                    )}
                  </FormField>
                </div>
              </div>
            )}

            {/* Step 3: Source & Notes */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">📡 Lead Source & Notes</h2>
                  <p className="text-gray-400">Track where this lead came from</p>
                </div>

                <FormField label="Lead Source" required>
                  <select 
                    className={`w-full p-3 bg-white/5 border rounded-lg text-white focus:ring-1 ${
                      errors.source 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-white/10 focus:border-neon-green focus:ring-neon-green'
                    }`}
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                  >
                    <option value="website">🌐 Website</option>
                    <option value="facebook">📘 Facebook Ads</option>
                    <option value="google">🔍 Google Ads</option>
                    <option value="tiktok">🎵 TikTok Ads</option>
                    <option value="referral">👥 Referral</option>
                    <option value="cold-call">📞 Cold Call</option>
                    <option value="other">🔧 Other</option>
                  </select>
                  {errors.source && (
                    <p className="text-red-400 text-sm mt-1">{errors.source}</p>
                  )}
                </FormField>

                <FormField label="Notes">
                  <textarea
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green h-24 resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any additional information about this lead..."
                  />
                </FormField>
              </div>
            )}

            {/* Step 4: FCRA Consent */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">📋 FCRA Compliance</h2>
                  <p className="text-gray-400">Credit check authorization required by law</p>
                </div>

                <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-black text-sm font-bold">!</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-yellow-300 mb-2">FCRA Notice</h3>
                      <p className="text-yellow-200 text-sm leading-relaxed">
                        The Fair Credit Reporting Act (FCRA) requires that we obtain explicit consent 
                        before pulling a credit report. By checking the box below, the lead gives 
                        permission for credit verification for legitimate business purposes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentGiven}
                      onChange={(e) => setFormData({...formData, consentGiven: e.target.checked})}
                      className="mt-1 w-5 h-5 rounded border-2 border-white/20 bg-transparent checked:bg-neon-green checked:border-neon-green focus:ring-2 focus:ring-neon-green"
                      required
                    />
                    <div className="text-sm">
                      <p className="text-white font-medium mb-1">
                        ✅ I authorize a credit check for {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-gray-400">
                        Lead has given explicit consent for credit verification under FCRA guidelines
                      </p>
                    </div>
                  </label>
                  {errors.consent && (
                    <p className="text-red-400 text-sm mt-2">{errors.consent}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t border-white/10">
              {currentStep > 1 && (
                <NeonButton 
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                >
                  Previous
                </NeonButton>
              )}
              
              <NeonButton 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Creating Lead...' : 
                 currentStep < steps.length ? 'Next Step' : 'Create Lead'}
              </NeonButton>
              
              <NeonButton 
                type="button"
                variant="secondary"
                onClick={() => router.push('/leads')}
              >
                Cancel
              </NeonButton>
            </div>
          </form>
        </GlassCard>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            💡 After adding a lead, you can run credit qualification from the lead detail page
          </p>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <SimpleToast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </AppLayout>
  );
}