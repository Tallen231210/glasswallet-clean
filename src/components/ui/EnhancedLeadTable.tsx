'use client';

import React, { useState } from 'react';
import { Badge } from './Badge';
import { NeonButton } from './NeonButton';
import { GlassCard } from './GlassCard';
import { Loading } from './Spinner';
import { TaggingModal } from './TaggingModal';
import { cn } from '@/lib/utils';

interface LeadTag {
  tagType: string;
  rule?: {
    ruleName: string;
  };
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  creditScore?: number;
  processed: boolean;
  createdAt: string;
  leadTags: LeadTag[];
}

interface EnhancedLeadTableProps {
  leads: Lead[];
  loading?: boolean;
  onTagLead?: (leadId: string, tagType: 'whitelist' | 'blacklist', reason?: string) => Promise<void>;
  onBulkTag?: (leadIds: string[], tagType: 'whitelist' | 'blacklist', reason?: string) => Promise<void>;
  onExportTagged?: (tagType: 'whitelist' | 'blacklist') => void;
  className?: string;
}

export const EnhancedLeadTable: React.FC<EnhancedLeadTableProps> = ({
  leads,
  loading = false,
  onTagLead,
  onBulkTag,
  onExportTagged,
  className
}) => {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [taggingLead, setTaggingLead] = useState<string | null>(null);
  const [showTaggingModal, setShowTaggingModal] = useState(false);
  const [bulkTagging, setBulkTagging] = useState(false);

  const getCreditScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 720) return 'text-neon-green';
    if (score >= 650) return 'text-yellow-400';
    if (score >= 600) return 'text-orange-400';
    return 'text-red-400';
  };

  const getCreditScoreBadgeVariant = (score?: number) => {
    if (!score) return 'default';
    if (score >= 720) return 'success';
    if (score >= 650) return 'warning';
    return 'error';
  };

  const getLeadStatus = (lead: Lead) => {
    const hasWhitelist = lead.leadTags.some(tag => tag.tagType === 'whitelist');
    const hasBlacklist = lead.leadTags.some(tag => tag.tagType === 'blacklist');
    const hasQualified = lead.leadTags.some(tag => tag.tagType === 'qualified');
    const hasUnqualified = lead.leadTags.some(tag => tag.tagType === 'unqualified');

    if (hasWhitelist) {
      return <Badge variant="success" dot>✅ Whitelist</Badge>;
    }
    if (hasBlacklist) {
      return <Badge variant="error" dot>🚫 Blacklist</Badge>;
    }
    if (hasQualified) {
      return <Badge variant="neon" dot>Qualified</Badge>;
    }
    if (hasUnqualified) {
      return <Badge variant="warning" dot>Unqualified</Badge>;
    }
    if (!lead.processed) {
      return <Badge variant="default">Pending</Badge>;
    }
    return <Badge variant="default">No Tags</Badge>;
  };

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead.id)));
    }
  };

  const handleTagLead = async (leadId: string, tagType: 'whitelist' | 'blacklist') => {
    if (!onTagLead) return;
    
    setTaggingLead(leadId);
    try {
      await onTagLead(leadId, tagType, 'Manual tagging from lead table');
    } finally {
      setTaggingLead(null);
    }
  };

  const handleBulkTag = async (tagType: 'whitelist' | 'blacklist') => {
    if (!onBulkTag || selectedLeads.size === 0) return;
    
    await onBulkTag(Array.from(selectedLeads), tagType, 'Bulk tagging from lead table');
    setSelectedLeads(new Set());
  };

  const handleAdvancedBulkTag = () => {
    if (selectedLeads.size === 0) return;
    setShowTaggingModal(true);
  };

  const handleTaggingModalConfirm = async (tagType: string, reason: string, notifyLead: boolean) => {
    if (!onBulkTag || selectedLeads.size === 0) return;
    
    setBulkTagging(true);
    try {
      await onBulkTag(Array.from(selectedLeads), tagType as 'whitelist' | 'blacklist', reason);
      setSelectedLeads(new Set());
      setShowTaggingModal(false);
    } finally {
      setBulkTagging(false);
    }
  };

  const isTagged = (lead: Lead, tagType: string) => {
    return lead.leadTags.some(tag => tag.tagType === tagType);
  };

  if (loading) {
    return (
      <GlassCard className={cn('p-12', className)}>
        <Loading message="Loading leads..." size="lg" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className={className}>
      {/* Table Header with Bulk Actions */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Enhanced Lead Database ({leads.length} leads)
          </h3>
          <div className="flex gap-3">
            {selectedLeads.size > 0 && (
              <>
                <NeonButton
                  size="sm"
                  onClick={handleAdvancedBulkTag}
                  className="bg-purple-600/20 hover:bg-purple-600/30"
                >
                  🏷️ Advanced Tag ({selectedLeads.size})
                </NeonButton>
                <NeonButton
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBulkTag('whitelist')}
                  className="bg-green-600/20 hover:bg-green-600/30"
                >
                  ✅ Whitelist {selectedLeads.size}
                </NeonButton>
                <NeonButton
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBulkTag('blacklist')}
                  className="bg-red-600/20 hover:bg-red-600/30"
                >
                  🚫 Blacklist {selectedLeads.size}
                </NeonButton>
              </>
            )}
            <NeonButton
              size="sm"
              variant="secondary"
              onClick={() => onExportTagged?.('whitelist')}
            >
              Export Whitelist
            </NeonButton>
            <NeonButton
              size="sm"
              variant="secondary"
              onClick={() => onExportTagged?.('blacklist')}
            >
              Export Blacklist
            </NeonButton>
          </div>
        </div>

        {/* Select all checkbox */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedLeads.size === leads.length && leads.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-neon-green bg-transparent border-gray-300 rounded focus:ring-neon-green focus:ring-2"
            />
            <span className="text-sm text-gray-300">
              {selectedLeads.size > 0 ? `${selectedLeads.size} selected` : 'Select all'}
            </span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Leads Found</h3>
            <p className="text-gray-400">Start by processing your first credit report</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-gray-300">Select</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Credit Score</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Created</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, index) => (
                <tr
                  key={lead.id}
                  className={cn(
                    'border-b border-white/5 hover:bg-white/5 transition-colors',
                    selectedLeads.has(lead.id) && 'bg-neon-green/10'
                  )}
                >
                  {/* Select checkbox */}
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      className="w-4 h-4 text-neon-green bg-transparent border-gray-300 rounded focus:ring-neon-green focus:ring-2"
                    />
                  </td>

                  {/* Name */}
                  <td className="p-4">
                    <div className="font-medium text-white">
                      {lead.firstName} {lead.lastName}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-4">
                    <div className="text-gray-300 text-sm">{lead.email}</div>
                  </td>

                  {/* Phone */}
                  <td className="p-4">
                    <div className="text-gray-300 text-sm">{lead.phone || '—'}</div>
                  </td>

                  {/* Credit Score */}
                  <td className="p-4">
                    {lead.creditScore ? (
                      <div className="flex items-center gap-2">
                        <span className={cn('font-bold text-lg', getCreditScoreColor(lead.creditScore))}>
                          {lead.creditScore}
                        </span>
                        <Badge variant={getCreditScoreBadgeVariant(lead.creditScore) as any} size="sm">
                          {lead.creditScore >= 720 ? 'Excellent' : 
                           lead.creditScore >= 650 ? 'Good' : 
                           lead.creditScore >= 600 ? 'Fair' : 'Poor'}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>

                  {/* Status/Tags */}
                  <td className="p-4">
                    {getLeadStatus(lead)}
                  </td>

                  {/* Created Date */}
                  <td className="p-4">
                    <div className="text-gray-300 text-sm">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Tag Actions */}
                  <td className="p-4">
                    <div className="flex gap-2">
                      {!isTagged(lead, 'whitelist') && (
                        <NeonButton
                          size="sm"
                          variant="secondary"
                          onClick={() => handleTagLead(lead.id, 'whitelist')}
                          loading={taggingLead === lead.id}
                          disabled={taggingLead === lead.id}
                          className="bg-green-600/20 hover:bg-green-600/30 px-2 py-1 text-xs"
                        >
                          ✅
                        </NeonButton>
                      )}
                      {!isTagged(lead, 'blacklist') && (
                        <NeonButton
                          size="sm"
                          variant="secondary"
                          onClick={() => handleTagLead(lead.id, 'blacklist')}
                          loading={taggingLead === lead.id}
                          disabled={taggingLead === lead.id}
                          className="bg-red-600/20 hover:bg-red-600/30 px-2 py-1 text-xs"
                        >
                          🚫
                        </NeonButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer with summary */}
      {leads.length > 0 && (
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-400">
              Showing {leads.length} leads • 
              {leads.filter(l => l.leadTags.some(t => t.tagType === 'whitelist')).length} whitelisted • 
              {leads.filter(l => l.leadTags.some(t => t.tagType === 'blacklist')).length} blacklisted
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-neon-green rounded-full"></div>
                <span>720+ Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>650-719 Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>&lt;650 Poor</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tagging Modal */}
      <TaggingModal
        leads={leads.filter(lead => selectedLeads.has(lead.id))}
        isOpen={showTaggingModal}
        onClose={() => setShowTaggingModal(false)}
        onConfirm={handleTaggingModalConfirm}
        loading={bulkTagging}
      />
    </GlassCard>
  );
};