'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';

interface FCRAConsentProps {
  onConsentGiven: (consentData: ConsentData) => void;
  onConsentDenied: () => void;
  leadName?: string;
  purpose?: string;
  companyName?: string;
  loading?: boolean;
}

interface ConsentData {
  consentGiven: boolean;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  purpose: string;
  leadName: string;
  companyName: string;
  consentText: string;
}

export const FCRAConsent: React.FC<FCRAConsentProps> = ({
  onConsentGiven,
  onConsentDenied,
  leadName = '[Lead Name]',
  purpose = 'credit_transaction',
  companyName = 'Your Company',
  loading = false
}) => {
  const [hasReadNotice, setHasReadNotice] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [understanding, setUnderstanding] = useState({
    creditReport: false,
    lenderUse: false,
    rights: false
  });

  const getPurposeText = (purpose: string) => {
    const purposes = {
      credit_transaction: 'for credit qualification and lending decisions',
      employment_screening: 'for employment verification purposes',
      tenant_screening: 'for rental application processing',
      business_transaction: 'for business relationship evaluation',
      insurance_underwriting: 'for insurance underwriting purposes'
    };
    return purposes[purpose as keyof typeof purposes] || 'for legitimate business purposes';
  };

  const handleGiveConsent = () => {
    const consentData: ConsentData = {
      consentGiven: true,
      timestamp: new Date().toISOString(),
      ipAddress: 'demo.ip.address', // Would get real IP in production
      userAgent: navigator.userAgent,
      purpose,
      leadName,
      companyName,
      consentText: getConsentText()
    };

    onConsentGiven(consentData);
  };

  const getConsentText = () => {
    return `I, ${leadName}, authorize ${companyName} to obtain my consumer credit report from one or more consumer reporting agencies ${getPurposeText(purpose)}. I understand that this authorization will result in an inquiry on my credit report, which may affect my credit score. I also understand my rights under the Fair Credit Reporting Act as disclosed below.`;
  };

  const allRequirementsChecked = hasReadNotice && consentChecked && 
    understanding.creditReport && understanding.lenderUse && understanding.rights;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="warning">FCRA Compliance Required</Badge>
        </div>
        <h2 className="text-2xl font-bold text-white">
          Credit Report Authorization
        </h2>
        <p className="text-gray-400">
          Federal law requires your explicit consent before obtaining credit information
        </p>
      </div>

      {/* Consumer Information */}
      <GlassCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            📋 Consumer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-gray-400">Lead Name</p>
              <p className="text-white font-medium">{leadName}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-gray-400">Company</p>
              <p className="text-white font-medium">{companyName}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-gray-400">Purpose</p>
              <p className="text-white font-medium">{getPurposeText(purpose)}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* FCRA Disclosure */}
      <GlassCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            ⚖️ Fair Credit Reporting Act (FCRA) Disclosure
          </h3>
          
          <div className="max-h-60 overflow-y-auto p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-sm text-gray-300 space-y-3">
              <p className="font-semibold text-white">YOUR RIGHTS UNDER THE FAIR CREDIT REPORTING ACT</p>
              
              <p>
                <strong>What is a consumer reporting agency?</strong><br />
                A consumer reporting agency (CRA) collects and maintains information about consumers' credit histories and provides that information to businesses for use in evaluating applications for credit, employment, insurance, and other purposes.
              </p>

              <p>
                <strong>Your rights regarding credit reports:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You have the right to know if information in your file has been used against you</li>
                <li>You have the right to know what is in your file</li>
                <li>You have the right to ask for a credit score</li>
                <li>You have the right to dispute incomplete or inaccurate information</li>
                <li>You have the right to limit access to your file</li>
                <li>You have the right to seek damages from violators</li>
              </ul>

              <p>
                <strong>Free Credit Reports:</strong><br />
                You are entitled to receive one free credit report annually from each of the nationwide consumer reporting agencies. Visit annualcreditreport.com or call 1-877-322-8228.
              </p>

              <p>
                <strong>Contact Information for Credit Bureaus:</strong>
              </p>
              <ul className="text-xs space-y-1">
                <li><strong>Equifax:</strong> 1-800-685-1111 | equifax.com</li>
                <li><strong>Experian:</strong> 1-888-397-3742 | experian.com</li>
                <li><strong>TransUnion:</strong> 1-800-916-8800 | transunion.com</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <input
              type="checkbox"
              id="readNotice"
              checked={hasReadNotice}
              onChange={(e) => setHasReadNotice(e.target.checked)}
              className="mt-1 w-4 h-4 text-neon-green bg-transparent border-gray-300 rounded focus:ring-neon-green"
            />
            <label htmlFor="readNotice" className="text-blue-200 text-sm">
              I have read and understand the FCRA disclosure above
            </label>
          </div>
        </div>
      </GlassCard>

      {/* Consumer Understanding Verification */}
      <GlassCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            ✓ Verification of Understanding
          </h3>
          <p className="text-gray-400 text-sm">
            Please confirm your understanding of the following:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="creditReport"
                checked={understanding.creditReport}
                onChange={(e) => setUnderstanding(prev => ({ ...prev, creditReport: e.target.checked }))}
                className="mt-1 w-4 h-4 text-neon-green bg-transparent border-gray-300 rounded focus:ring-neon-green"
              />
              <label htmlFor="creditReport" className="text-gray-300 text-sm">
                I understand that {companyName} will obtain my credit report from a consumer reporting agency
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="lenderUse"
                checked={understanding.lenderUse}
                onChange={(e) => setUnderstanding(prev => ({ ...prev, lenderUse: e.target.checked }))}
                className="mt-1 w-4 h-4 text-neon-green bg-transparent border-gray-300 rounded focus:ring-neon-green"
              />
              <label htmlFor="lenderUse" className="text-gray-300 text-sm">
                I understand this credit report will be used {getPurposeText(purpose)}
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="rights"
                checked={understanding.rights}
                onChange={(e) => setUnderstanding(prev => ({ ...prev, rights: e.target.checked }))}
                className="mt-1 w-4 h-4 text-neon-green bg-transparent border-gray-300 rounded focus:ring-neon-green"
              />
              <label htmlFor="rights" className="text-gray-300 text-sm">
                I understand my rights under the Fair Credit Reporting Act as disclosed above
              </label>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Final Consent */}
      <GlassCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            📝 Authorization and Consent
          </h3>
          
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-sm font-medium">
              {getConsentText()}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="finalConsent"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-1 w-4 h-4 text-neon-green bg-transparent border-gray-300 rounded focus:ring-neon-green"
            />
            <label htmlFor="finalConsent" className="text-white text-sm font-medium">
              I hereby provide my written authorization and consent for {companyName} to obtain my consumer credit report as described above.
            </label>
          </div>
        </div>
      </GlassCard>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <NeonButton
          onClick={handleGiveConsent}
          disabled={!allRequirementsChecked || loading}
          className="px-8"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            'Authorize Credit Pull'
          )}
        </NeonButton>
        <button
          onClick={onConsentDenied}
          disabled={loading}
          className="px-8 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {/* Legal Footer */}
      <div className="text-center text-xs text-gray-500 max-w-4xl mx-auto">
        <p>
          This authorization is given in compliance with the Fair Credit Reporting Act (FCRA). 
          Consumer credit reports obtained will be used solely for the stated permissible purpose. 
          Your information will be kept confidential and secure in accordance with applicable privacy laws.
        </p>
      </div>
    </div>
  );
};