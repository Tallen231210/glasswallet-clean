'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { FCRAConsent } from '@/components/compliance/FCRAConsent';
import { CreditPullRequest, CreditPullResponse, PERMISSIBLE_PURPOSES } from '@/lib/services/crsApiService';
import { formatCurrency } from '@/lib/services/creditService';

interface CreditPullFormProps {
  onCreditPullComplete?: (result: CreditPullResponse) => void;
  onCancel?: () => void;
  leadData?: Partial<CreditPullRequest>;
}

interface FormData {
  firstName: string;
  lastName: string;
  ssn: string;
  dateOfBirth: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  permissiblePurpose: string;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const CreditPullForm: React.FC<CreditPullFormProps> = ({
  onCreditPullComplete,
  onCancel,
  leadData
}) => {
  const [currentStep, setCurrentStep] = useState<'form' | 'consent' | 'processing' | 'result'>('form');
  const [formData, setFormData] = useState<FormData>({
    firstName: leadData?.firstName || '',
    lastName: leadData?.lastName || '',
    ssn: leadData?.ssn || '',
    dateOfBirth: leadData?.dateOfBirth || '',
    street: leadData?.address?.street || '',
    city: leadData?.address?.city || '',
    state: leadData?.address?.state || '',
    zipCode: leadData?.address?.zipCode || '',
    phone: leadData?.phone || '',
    email: leadData?.email || '',
    permissiblePurpose: leadData?.permissiblePurpose || 'credit_transaction'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creditResult, setCreditResult] = useState<CreditPullResponse | null>(null);
  const [processing, setProcessing] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    const cleanSSN = formData.ssn.replace(/\D/g, '');
    if (!cleanSSN || cleanSSN.length !== 9) {
      newErrors.ssn = 'Valid 9-digit SSN is required';
    }
    
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    
    if (!formData.zipCode || !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Valid ZIP code is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email address required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      setCurrentStep('consent');
    }
  };

  const handleConsentGiven = async (consentData: any) => {
    setCurrentStep('processing');
    setProcessing(true);

    try {
      const creditPullRequest: CreditPullRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        ssn: formData.ssn.replace(/\D/g, ''),
        dateOfBirth: formData.dateOfBirth,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        permissiblePurpose: formData.permissiblePurpose,
        consentGiven: consentData.consentGiven,
        consentTimestamp: consentData.timestamp,
        ipAddress: consentData.ipAddress
      };

      const response = await fetch('/api/credit/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creditPullRequest)
      });

      const result = await response.json();
      setCreditResult(result);
      setCurrentStep('result');

      if (onCreditPullComplete) {
        onCreditPullComplete(result);
      }

    } catch (error) {
      console.error('Credit pull error:', error);
      setCreditResult({
        success: false,
        error: 'Failed to perform credit pull. Please try again.',
        transactionId: '',
        timestamp: new Date().toISOString(),
        subject: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          ssn: '***-**-****',
          dateOfBirth: formData.dateOfBirth
        },
        creditScores: [],
        creditProfile: {} as any,
        riskFactors: [],
        qualificationSuggestion: {} as any,
        fcraNotice: ''
      });
      setCurrentStep('result');
    } finally {
      setProcessing(false);
    }
  };

  const handleConsentDenied = () => {
    setCurrentStep('form');
  };

  const renderFormStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Credit Pull Information</h2>
        <p className="text-gray-400">
          Enter the lead's information for credit qualification
        </p>
        <Badge variant="neon">Demo Mode - Uses 1 Credit</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
          <div className="space-y-4">
            <FormField label="First Name" error={errors.firstName}>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter first name"
              />
            </FormField>

            <FormField label="Last Name" error={errors.lastName}>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter last name"
              />
            </FormField>

            <FormField label="Social Security Number" error={errors.ssn}>
              <Input
                value={formData.ssn}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 3 && value.length < 6) {
                    value = `${value.slice(0, 3)}-${value.slice(3)}`;
                  } else if (value.length >= 6) {
                    value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5, 9)}`;
                  }
                  setFormData(prev => ({ ...prev, ssn: value }));
                }}
                placeholder="123-45-6789"
                maxLength={11}
              />
            </FormField>

            <FormField label="Date of Birth" error={errors.dateOfBirth}>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </FormField>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Address Information</h3>
          <div className="space-y-4">
            <FormField label="Street Address" error={errors.street}>
              <Input
                value={formData.street}
                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                placeholder="Enter street address"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="City" error={errors.city}>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                />
              </FormField>

              <FormField label="State" error={errors.state}>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-neon-green focus:outline-none"
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state} className="bg-gray-800">
                      {state}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="ZIP Code" error={errors.zipCode}>
              <Input
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="12345"
                maxLength={10}
              />
            </FormField>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">Contact & Purpose</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Phone Number (Optional)" error={errors.phone}>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 123-4567"
            />
          </FormField>

          <FormField label="Email Address (Optional)" error={errors.email}>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com"
            />
          </FormField>
        </div>

        <FormField label="Permissible Purpose" className="mt-4">
          <select
            value={formData.permissiblePurpose}
            onChange={(e) => setFormData(prev => ({ ...prev, permissiblePurpose: e.target.value }))}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-neon-green focus:outline-none"
          >
            {PERMISSIBLE_PURPOSES.map(purpose => (
              <option key={purpose} value={purpose} className="bg-gray-800">
                {purpose.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </FormField>
      </GlassCard>

      <div className="flex gap-4 justify-center">
        <NeonButton onClick={handleFormSubmit}>
          Continue to Consent
        </NeonButton>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center space-y-6 py-12">
      <div className="w-20 h-20 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Processing Credit Pull
        </h3>
        <p className="text-gray-400">
          Obtaining credit information for {formData.firstName} {formData.lastName}...
        </p>
      </div>
      <Badge variant="neon">Demo Mode Active</Badge>
    </div>
  );

  const renderResultStep = () => {
    if (!creditResult) return null;

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            {creditResult.success ? (
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">❌</span>
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white">
            Credit Pull {creditResult.success ? 'Complete' : 'Failed'}
          </h2>
          
          {creditResult.success && creditResult.creditScores && creditResult.creditScores.length > 0 && (
            <div className="text-4xl font-bold text-neon-green">
              {creditResult.creditScores[0].score}
            </div>
          )}
          
          <Badge variant={creditResult.success ? 'success' : 'danger'}>
            {creditResult.demoMode ? 'Demo Result' : 'Live Result'}
          </Badge>
        </div>

        {creditResult.success && creditResult.creditScores && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Credit Score Details */}
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Credit Score</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-green mb-2">
                    {creditResult.creditScores[0].score}
                  </div>
                  <div className="text-sm text-gray-400">
                    {creditResult.creditScores[0].model}
                  </div>
                  <div className="text-xs text-gray-500">
                    Range: {creditResult.creditScores[0].range.min} - {creditResult.creditScores[0].range.max}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {creditResult.creditScores[0].factors?.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-neon-green rounded-full"></span>
                      <span className="text-gray-300">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Qualification Result */}
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Qualification</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <Badge 
                    variant={creditResult.qualificationSuggestion?.qualified ? 'success' : 'danger'}
                    size="lg"
                  >
                    {creditResult.qualificationSuggestion?.qualified ? 'Qualified' : 'Not Qualified'}
                  </Badge>
                </div>
                
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <strong>Risk Level:</strong> {creditResult.qualificationSuggestion?.riskLevel}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    <strong>Recommendation:</strong> {creditResult.qualificationSuggestion?.recommendedAction}
                  </p>
                </div>

                {creditResult.incomeEstimate && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <strong>Estimated Income:</strong> {formatCurrency(creditResult.incomeEstimate.estimatedAnnualIncome)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Confidence: {creditResult.incomeEstimate.confidenceLevel}
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {creditResult.error && (
          <GlassCard className="border-red-500/30">
            <div className="text-center text-red-400">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-2">{creditResult.error}</p>
            </div>
          </GlassCard>
        )}

        <div className="flex gap-4 justify-center">
          <NeonButton onClick={() => setCurrentStep('form')}>
            New Credit Pull
          </NeonButton>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  };

  if (currentStep === 'form') return renderFormStep();
  if (currentStep === 'processing') return renderProcessingStep();
  if (currentStep === 'result') return renderResultStep();
  
  if (currentStep === 'consent') {
    return (
      <FCRAConsent
        onConsentGiven={handleConsentGiven}
        onConsentDenied={handleConsentDenied}
        leadName={`${formData.firstName} ${formData.lastName}`}
        purpose={formData.permissiblePurpose}
        companyName="GlassWallet Demo"
        loading={processing}
      />
    );
  }

  return null;
};