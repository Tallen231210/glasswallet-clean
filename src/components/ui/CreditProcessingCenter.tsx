'use client';

import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Input } from './Input';
import { FormField } from './FormField';
import { NeonButton } from './NeonButton';
import { Loading } from './Spinner';
import { Badge } from './Badge';
import { Alert } from './Alert';
import { cn } from '@/lib/utils';

interface CreditResult {
  creditScore: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  qualified: boolean;
  autoTags: string[];
  riskFactors: string[];
  recommendedAction: 'approve' | 'review' | 'reject';
}

interface CreditProcessingCenterProps {
  onCreditPull?: (leadData: any) => Promise<CreditResult>;
  onCreditDeducted?: (amount: number) => void;
  className?: string;
}

export const CreditProcessingCenter: React.FC<CreditProcessingCenterProps> = ({
  onCreditPull,
  onCreditDeducted,
  className
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    consent: false
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreditResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
    if (result) setResult(null); // Clear previous results
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Valid email is required';
    if (!formData.consent) return 'FCRA consent is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call the credit pull function if provided
      if (onCreditPull) {
        const result = await onCreditPull(formData);
        setResult(result);
        onCreditDeducted?.(1); // Deduct 1 credit
      } else {
        // Demo/mock result for development
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API delay
        
        const mockResult: CreditResult = {
          creditScore: Math.floor(Math.random() * (850 - 300) + 300),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          qualified: Math.random() > 0.3,
          autoTags: [],
          riskFactors: [],
          recommendedAction: 'review'
        };

        // Determine qualification based on credit score
        if (mockResult.creditScore >= 720) {
          mockResult.qualified = true;
          mockResult.autoTags.push('High Quality');
          mockResult.recommendedAction = 'approve';
        } else if (mockResult.creditScore >= 650) {
          mockResult.qualified = true;
          mockResult.autoTags.push('Good');
          mockResult.recommendedAction = 'review';
        } else {
          mockResult.qualified = false;
          mockResult.autoTags.push('Poor Credit');
          mockResult.recommendedAction = 'reject';
          mockResult.riskFactors.push('Low credit score');
        }

        setResult(mockResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pull credit report');
    } finally {
      setLoading(false);
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 720) return 'text-neon-green';
    if (score >= 650) return 'text-yellow-400';
    if (score >= 600) return 'text-orange-400';
    return 'text-red-400';
  };

  const getCreditScoreBadgeVariant = (score: number) => {
    if (score >= 720) return 'success';
    if (score >= 650) return 'warning';
    return 'error';
  };

  const getRecommendationColor = (action: string) => {
    switch (action) {
      case 'approve': return 'success';
      case 'review': return 'neon';
      case 'reject': return 'error';
      default: return 'default';
    }
  };

  return (
    <GlassCard className={cn('p-8 border border-neon-green/30', className)}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Credit Processing Center</h2>
        <p className="text-gray-400">Enter lead information to pull credit report and qualify instantly</p>
      </div>

      {!result && !loading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="First Name" 
              required
              error={error && !formData.firstName.trim() ? 'Required' : ''}
            >
              <Input
                placeholder="Enter first name..."
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                leftIcon="👤"
                className="bg-white/5"
              />
            </FormField>

            <FormField 
              label="Last Name" 
              required
              error={error && !formData.lastName.trim() ? 'Required' : ''}
            >
              <Input
                placeholder="Enter last name..."
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                leftIcon="👤"
                className="bg-white/5"
              />
            </FormField>
          </div>

          <FormField 
            label="Email Address" 
            required
            error={error && (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) ? 'Valid email required' : ''}
          >
            <Input
              type="email"
              placeholder="Enter email address..."
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              leftIcon="📧"
              className="bg-white/5"
            />
          </FormField>

          <FormField 
            label="Phone Number (Optional)"
          >
            <Input
              type="tel"
              placeholder="(XXX) XXX-XXXX"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              leftIcon="📞"
              className="bg-white/5"
            />
          </FormField>

          <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consent}
              onChange={(e) => handleInputChange('consent', e.target.checked)}
              className="mt-1 w-4 h-4 text-neon-green bg-transparent border-gray-300 rounded focus:ring-neon-green focus:ring-2"
            />
            <label htmlFor="consent" className="text-sm text-gray-300 leading-relaxed">
              <span className="text-white font-medium">FCRA Compliance Consent:</span> I authorize the credit check for this lead in compliance with the Fair Credit Reporting Act. The lead has provided written consent for this credit inquiry.
            </label>
          </div>

          {error && (
            <Alert variant="error" title="Validation Error">
              {error}
            </Alert>
          )}

          <div className="text-center pt-4">
            <NeonButton
              type="submit"
              size="lg"
              disabled={loading}
              className="px-8 py-4 text-lg"
            >
              Pull Credit Report
            </NeonButton>
            <p className="text-xs text-gray-400 mt-2">1 credit will be deducted</p>
          </div>
        </form>
      )}

      {loading && (
        <div className="text-center py-12">
          <Loading message="Pulling credit report..." size="lg" />
          <div className="mt-4 space-y-2 text-sm text-gray-400">
            <p>🔍 Contacting credit bureau...</p>
            <p>📊 Analyzing credit history...</p>
            <p>🤖 Running AI qualification...</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">Credit Report Results</h3>
            <div className="inline-flex items-center gap-4 p-6 bg-white/5 rounded-xl border border-white/10">
              <div>
                <div className={cn('text-4xl font-bold mb-2', getCreditScoreColor(result.creditScore))}>
                  {result.creditScore}
                </div>
                <Badge variant={getCreditScoreBadgeVariant(result.creditScore) as any} size="sm">
                  Credit Score
                </Badge>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{result.firstName} {result.lastName}</p>
                <p className="text-gray-400 text-sm">{result.email}</p>
                {result.phone && <p className="text-gray-400 text-sm">{result.phone}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Qualification Status</p>
              <Badge variant={result.qualified ? 'success' : 'error'}>
                {result.qualified ? 'Qualified' : 'Unqualified'}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Recommended Action</p>
              <Badge variant={getRecommendationColor(result.recommendedAction) as any}>
                {result.recommendedAction.charAt(0).toUpperCase() + result.recommendedAction.slice(1)}
              </Badge>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Auto Tags</p>
              <div className="space-y-1">
                {result.autoTags.length > 0 ? (
                  result.autoTags.map((tag, index) => (
                    <Badge key={index} variant="neon" size="sm">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-xs">No auto tags</span>
                )}
              </div>
            </div>
          </div>

          {result.riskFactors.length > 0 && (
            <Alert variant="warning" title="Risk Factors">
              <ul className="list-disc list-inside space-y-1">
                {result.riskFactors.map((factor, index) => (
                  <li key={index} className="text-sm">{factor}</li>
                ))}
              </ul>
            </Alert>
          )}

          <div className="flex gap-3 justify-center pt-4">
            <NeonButton
              variant="secondary"
              onClick={() => {
                setResult(null);
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  consent: false
                });
              }}
            >
              Process Another Lead
            </NeonButton>
            <NeonButton>
              Save to Database
            </NeonButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
};