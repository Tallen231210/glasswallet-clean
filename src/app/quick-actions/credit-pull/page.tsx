'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { NeonButton } from '@/components/ui/NeonButton';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { InteractiveCard } from '@/components/ui/InteractiveCard';
import { useUser } from '@/contexts/UserContext';

interface CreditPullForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ssn: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  purpose: string;
}

export default function QuickCreditPullPage() {
  const { user, isSalesRep } = useUser();
  const [formData, setFormData] = useState<CreditPullForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    ssn: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    purpose: 'loan_qualification'
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  if (!isSalesRep) {
    return (
      <AppShell>
        <div className="p-6">
          <GlassCard className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-gray-400">This page is only available for Sales Rep accounts.</p>
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  const handleInputChange = (field: keyof CreditPullForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to results or show success message
    }, 3000);
  };

  const progressPercent = (step / totalSteps) * 100;

  return (
    <AppShell
      headerTitle="Quick Credit Pull"
      headerSubtitle="Fast credit report processing for immediate qualification"
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-green rounded-xl flex items-center justify-center shadow-lg shadow-neon-green/20">
                <span className="text-deep-navy-start font-bold text-lg">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Quick Credit Pull</h1>
                <p className="text-gray-400 text-sm">
                  Step {step} of {totalSteps} • Estimated time: 2 minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="neon">Fast Track</Badge>
              <Badge variant="success">1 Credit</Badge>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <GlassCard className="p-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
                      <span className="text-neon-green font-bold">1</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">Personal Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="First Name" required>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="John"
                      />
                    </FormField>

                    <FormField label="Last Name" required>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Doe"
                      />
                    </FormField>

                    <FormField label="Email Address" required>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john.doe@example.com"
                      />
                    </FormField>

                    <FormField label="Phone Number" required>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </FormField>

                    <FormField label="Date of Birth" required>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    </FormField>

                    <FormField label="Last 4 of SSN" required>
                      <Input
                        value={formData.ssn}
                        onChange={(e) => handleInputChange('ssn', e.target.value)}
                        placeholder="1234"
                        maxLength={4}
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
                      <span className="text-neon-green font-bold">2</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">Address Information</h2>
                  </div>

                  <div className="space-y-4">
                    <FormField label="Street Address" required>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Main Street"
                      />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField label="City" required>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Los Angeles"
                        />
                      </FormField>

                      <FormField label="State" required>
                        <Select
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          options={[
                            { value: 'CA', label: 'California' },
                            { value: 'NY', label: 'New York' },
                            { value: 'TX', label: 'Texas' },
                            { value: 'FL', label: 'Florida' },
                            // Add more states as needed
                          ]}
                          placeholder="Select State"
                        />
                      </FormField>

                      <FormField label="ZIP Code" required>
                        <Input
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          placeholder="90210"
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
                      <span className="text-neon-green font-bold">3</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">Review & Submit</h2>
                  </div>

                  <FormField label="Pull Purpose" required>
                    <Select
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      options={[
                        { value: 'loan_qualification', label: 'Loan Qualification' },
                        { value: 'credit_review', label: 'Credit Review' },
                        { value: 'background_check', label: 'Background Check' },
                        { value: 'identity_verification', label: 'Identity Verification' }
                      ]}
                    />
                  </FormField>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="font-semibold text-white mb-3">Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Address:</span>
                        <span className="text-white">{formData.city}, {formData.state} {formData.zipCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Purpose:</span>
                        <span className="text-white">Loan Qualification</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-yellow-500 text-lg">⚠️</div>
                      <div className="text-sm">
                        <p className="text-white font-medium mb-1">FCRA Compliance Notice</p>
                        <p className="text-gray-400">
                          This credit pull is for permissible purposes only. By proceeding, you certify that you have 
                          obtained proper authorization and will use this information in compliance with FCRA regulations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-white/10 mt-6">
                <div>
                  {step > 1 && (
                    <NeonButton variant="secondary" onClick={handlePrevStep}>
                      ← Previous
                    </NeonButton>
                  )}
                </div>
                <div>
                  {step < totalSteps ? (
                    <NeonButton onClick={handleNextStep}>
                      Next →
                    </NeonButton>
                  ) : (
                    <NeonButton 
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className="min-w-32"
                    >
                      {isProcessing ? '⏳ Processing...' : '🚀 Pull Credit'}
                    </NeonButton>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <InteractiveCard hoverEffect="glow">
              <GlassCard className="p-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">💳</div>
                  <h3 className="font-semibold text-white mb-1">Credit Balance</h3>
                  <p className="text-neon-green font-bold text-lg">25</p>
                  <p className="text-xs text-gray-400">credits remaining</p>
                </div>
              </GlassCard>
            </InteractiveCard>

            <GlassCard className="p-4">
              <h3 className="font-semibold text-white mb-3 text-sm">Quick Tips</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p>✓ Double-check spelling for best results</p>
                <p>✓ Ensure SSN last 4 digits are correct</p>
                <p>✓ Use current address information</p>
                <p>✓ Select appropriate pull purpose</p>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <h3 className="font-semibold text-white mb-3 text-sm">Processing Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Report Type:</span>
                  <span className="text-white">Full Credit</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Processing Time:</span>
                  <span className="text-neon-green">~30 seconds</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Credit Cost:</span>
                  <span className="text-white">1 credit</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}