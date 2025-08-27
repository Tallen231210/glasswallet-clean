'use client';

import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { NeonButton } from './NeonButton';
import { Input } from './Input';
import { Select } from './Select';
import { Badge } from './Badge';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  creditScore?: number;
  processed: boolean;
  createdAt: string;
  leadTags: Array<{
    tagType: string;
    rule?: {
      ruleName: string;
    };
  }>;
}

interface TaggingModalProps {
  leads: Lead[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tagType: string, reason: string, notifyLead: boolean) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export const TaggingModal: React.FC<TaggingModalProps> = ({
  leads,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  className
}) => {
  const [tagType, setTagType] = useState<string>('qualified');
  const [reason, setReason] = useState('');
  const [notifyLead, setNotifyLead] = useState(false);
  const [customReason, setCustomReason] = useState('');

  const tagOptions = [
    { value: 'qualified', label: 'Qualified', description: 'Lead meets qualification criteria' },
    { value: 'unqualified', label: 'Unqualified', description: 'Lead does not meet criteria' },
    { value: 'whitelist', label: 'Whitelist', description: 'Approved for priority processing' },
    { value: 'blacklist', label: 'Blacklist', description: 'Blocked from further processing' },
    { value: 'high-priority', label: 'High Priority', description: 'Requires immediate attention' },
    { value: 'follow-up', label: 'Follow Up', description: 'Schedule for future contact' },
    { value: 'do-not-contact', label: 'Do Not Contact', description: 'Lead requested no further contact' },
    { value: 'duplicate', label: 'Duplicate', description: 'Lead already exists in system' }
  ];

  const reasonTemplates = {
    qualified: [
      'High credit score',
      'Meets income requirements',
      'Excellent credit history',
      'Pre-approved by underwriting',
      'Manual review - approved'
    ],
    unqualified: [
      'Credit score too low',
      'Insufficient income',
      'Poor credit history',
      'Failed verification',
      'Manual review - declined'
    ],
    whitelist: [
      'VIP customer',
      'Referral from existing customer',
      'High-value prospect',
      'Strategic account',
      'Management override'
    ],
    blacklist: [
      'Fraudulent information',
      'Previous bad experience',
      'Legal issues',
      'Compliance violation',
      'Manual review - blocked'
    ],
    'high-priority': [
      'Time-sensitive opportunity',
      'Large loan amount',
      'Competitive situation',
      'Executive referral',
      'Hot lead'
    ],
    'follow-up': [
      'Needs additional documentation',
      'Requires callback',
      'Scheduled appointment',
      'Waiting for decision',
      'Nurture sequence'
    ],
    'do-not-contact': [
      'Requested to be removed',
      'TCPA compliance',
      'Opted out',
      'Legal request',
      'Customer complaint'
    ],
    duplicate: [
      'Already in system',
      'Multiple submissions',
      'Same email address',
      'Same phone number',
      'Data quality issue'
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalReason = reason === 'custom' ? customReason : reason;
    if (!finalReason.trim()) return;

    try {
      await onConfirm(tagType, finalReason, notifyLead);
      
      // Reset form
      setTagType('qualified');
      setReason('');
      setCustomReason('');
      setNotifyLead(false);
      onClose();
    } catch (error) {
      console.error('Failed to tag leads:', error);
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'qualified': return 'text-neon-green';
      case 'whitelist': return 'text-green-400';
      case 'blacklist': return 'text-red-400';
      case 'unqualified': return 'text-yellow-400';
      case 'high-priority': return 'text-orange-400';
      case 'follow-up': return 'text-blue-400';
      case 'do-not-contact': return 'text-red-500';
      case 'duplicate': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  const getTagVariant = (tag: string) => {
    switch (tag) {
      case 'qualified': return 'neon';
      case 'whitelist': return 'success';
      case 'blacklist': return 'error';
      case 'unqualified': return 'warning';
      case 'high-priority': return 'warning';
      case 'follow-up': return 'default';
      case 'do-not-contact': return 'error';
      case 'duplicate': return 'default';
      default: return 'default';
    }
  };

  const getCreditScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 720) return 'text-neon-green';
    if (score >= 650) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className={cn('w-full max-w-2xl max-h-[90vh] overflow-y-auto', className)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Tag Leads</h2>
              <p className="text-gray-400">
                Apply tags to {leads.length} lead{leads.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Lead Preview */}
          <div className="mb-6 max-h-48 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Selected Leads:</h3>
            <div className="space-y-2">
              {leads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <div className="text-white font-medium">
                      {lead.firstName} {lead.lastName}
                    </div>
                    <div className="text-gray-400 text-sm">{lead.email}</div>
                  </div>
                  <div className="text-right">
                    {lead.creditScore && (
                      <div className={cn('font-bold', getCreditScoreColor(lead.creditScore))}>
                        {lead.creditScore}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {leads.length > 5 && (
                <div className="text-center text-gray-400 text-sm py-2">
                  ... and {leads.length - 5} more leads
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tag Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tag Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tagOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setTagType(option.value)}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                      tagType === option.value
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getTagVariant(option.value)} size="sm">
                        {option.label}
                      </Badge>
                      {tagType === option.value && (
                        <span className="text-neon-green text-sm">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason *
              </label>
              <Select
                placeholder="Select a reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={[
                  ...(reasonTemplates[tagType as keyof typeof reasonTemplates] || []).map(template => ({
                    value: template,
                    label: template
                  })),
                  { value: 'custom', label: '💬 Custom reason...' }
                ]}
              />
            </div>

            {/* Custom Reason Input */}
            {reason === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Reason *
                </label>
                <Input
                  placeholder="Enter custom reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="bg-white/5"
                />
              </div>
            )}

            {/* Notification Option */}
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <input
                type="checkbox"
                id="notifyLead"
                checked={notifyLead}
                onChange={(e) => setNotifyLead(e.target.checked)}
                className="mt-1 w-4 h-4 text-neon-green bg-transparent border-gray-300 rounded focus:ring-neon-green focus:ring-2"
              />
              <div>
                <label htmlFor="notifyLead" className="text-sm font-medium text-white cursor-pointer">
                  Send notification to leads
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Email leads about their status change (where applicable and TCPA compliant)
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <NeonButton
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </NeonButton>
              <NeonButton
                type="submit"
                loading={loading}
                disabled={!tagType || (!reason || (reason === 'custom' && !customReason.trim()))}
                className="flex-1"
              >
                Apply Tag{leads.length > 1 ? 's' : ''}
              </NeonButton>
            </div>
          </form>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg border border-blue-500/20">
            <h4 className="text-sm font-medium text-white mb-2">Preview:</h4>
            <div className="flex items-center gap-3 text-sm">
              <Badge variant={getTagVariant(tagType)} size="sm">
                {tagOptions.find(opt => opt.value === tagType)?.label}
              </Badge>
              <span className="text-gray-400">→</span>
              <span className="text-gray-300">
                {reason === 'custom' ? customReason : reason || 'Select a reason'}
              </span>
              {notifyLead && (
                <>
                  <span className="text-gray-400">→</span>
                  <span className="text-blue-400 text-xs">📧 Email notification</span>
                </>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};