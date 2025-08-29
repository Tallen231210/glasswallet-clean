'use client';

import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { NeonButton } from './NeonButton';
import { Badge } from './Badge';
import { Select } from './Select';
import { FormField } from './FormField';
import { Input } from './Input';
import { Alert } from './Alert';
import { useToast } from './Toast';

interface LeadTag {
  id: string;
  tagType: 'qualified' | 'unqualified' | 'whitelist' | 'blacklist';
  tagReason: string;
  createdAt: string;
  rule?: {
    ruleName: string;
  };
}

interface LeadTagManagerProps {
  leadId: string;
  leadName: string;
  currentTags: LeadTag[];
  onTagsUpdated: () => void;
  className?: string;
}

export const LeadTagManager: React.FC<LeadTagManagerProps> = ({
  leadId,
  leadName,
  currentTags,
  onTagsUpdated,
  className = ''
}) => {
  const { showToast } = useToast();
  
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagType, setNewTagType] = useState<string>('');
  const [newTagReason, setNewTagReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tagTypeOptions = [
    { value: '', label: 'Select tag type...' },
    { value: 'qualified', label: 'Qualified Lead' },
    { value: 'unqualified', label: 'Unqualified Lead' },
    { value: 'whitelist', label: 'Whitelist' },
    { value: 'blacklist', label: 'Blacklist' },
  ];

  const getTagVariant = (tagType: string) => {
    switch (tagType) {
      case 'qualified': return 'success';
      case 'unqualified': return 'error';
      case 'whitelist': return 'neon';
      case 'blacklist': return 'warning';
      default: return 'default';
    }
  };

  const getTagLabel = (tagType: string) => {
    switch (tagType) {
      case 'qualified': return 'Qualified';
      case 'unqualified': return 'Unqualified';
      case 'whitelist': return 'Whitelist';
      case 'blacklist': return 'Blacklist';
      default: return tagType;
    }
  };

  const handleAddTag = async () => {
    if (!newTagType || !newTagReason.trim()) {
      showToast({
        title: 'Validation Error',
        message: 'Please select a tag type and provide a reason',
        variant: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/leads/${leadId}/tag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tagType: newTagType,
          tagReason: newTagReason.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to add tag');
      }

      const action = result.data.action;
      showToast({
        title: `Tag ${action === 'created' ? 'Added' : 'Updated'}`,
        message: `${getTagLabel(newTagType)} tag ${action === 'created' ? 'added to' : 'updated for'} ${leadName}`,
        variant: 'success'
      });

      // Reset form
      setNewTagType('');
      setNewTagReason('');
      setIsAddingTag(false);
      
      // Refresh parent component
      onTagsUpdated();

    } catch (error) {
      console.error('Error adding tag:', error);
      showToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to add tag',
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTag = async (tagType: string) => {
    if (!window.confirm(`Are you sure you want to remove the ${getTagLabel(tagType)} tag from ${leadName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/leads/${leadId}/tag?tagType=${tagType}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to remove tag');
      }

      showToast({
        title: 'Tag Removed',
        message: `${getTagLabel(tagType)} tag removed from ${leadName}`,
        variant: 'success'
      });

      // Refresh parent component
      onTagsUpdated();

    } catch (error) {
      console.error('Error removing tag:', error);
      showToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to remove tag',
        variant: 'error'
      });
    }
  };

  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <h3 className="text-lg font-semibold text-white">Lead Tags</h3>
        
        {!isAddingTag && (
          <NeonButton 
            size="sm"
            onClick={() => setIsAddingTag(true)}
          >
            Add Tag
          </NeonButton>
        )}
      </div>

      {/* Current Tags */}
      <div className="space-y-3 mb-6">
        {currentTags.length > 0 ? (
          currentTags.map((tag) => (
            <div key={tag.id} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Badge 
                  variant={getTagVariant(tag.tagType) as any}
                  dot
                  size="sm"
                >
                  {getTagLabel(tag.tagType)}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleRemoveTag(tag.tagType)}
                    className="text-red-400 hover:text-red-300 text-sm"
                    title="Remove tag"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-300 ml-2">{tag.tagReason}</p>
              {tag.rule && (
                <p className="text-xs text-gray-400 ml-2">
                  Auto-applied by rule: {tag.rule.ruleName}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">No tags applied</p>
        )}
      </div>

      {/* Add Tag Form */}
      {isAddingTag && (
        <div className="space-y-4 border-t border-white/10 pt-4">
          <h4 className="text-md font-medium text-white">Add New Tag</h4>
          
          <FormField label="Tag Type" required>
            <Select
              placeholder="Select tag type..."
              options={tagTypeOptions}
              value={newTagType}
              onChange={(e) => setNewTagType(e.target.value)}
            />
          </FormField>

          <FormField 
            label="Reason" 
            required
            helperText="Explain why this tag is being applied"
          >
            <Input
              placeholder="Enter reason for this tag..."
              value={newTagReason}
              onChange={(e) => setNewTagReason(e.target.value)}
              maxLength={200}
            />
          </FormField>

          {/* Tag Type Information */}
          {newTagType && (
            <Alert 
              variant={
                newTagType === 'qualified' ? 'success' :
                newTagType === 'unqualified' ? 'warning' :
                newTagType === 'whitelist' ? 'info' : 'warning'
              }
              title={`About ${getTagLabel(newTagType)} Tags`}
            >
              {newTagType === 'qualified' && 
                'Marks leads that meet credit and qualification criteria for offers.'
              }
              {newTagType === 'unqualified' && 
                'Marks leads that do not meet minimum qualification requirements.'
              }
              {newTagType === 'whitelist' && 
                'Marks high-priority leads for premium treatment and targeting.'
              }
              {newTagType === 'blacklist' && 
                'Marks leads to exclude from marketing and offers.'
              }
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <NeonButton 
              onClick={handleAddTag}
              loading={isSubmitting}
              disabled={!newTagType || !newTagReason.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding Tag...' : 'Add Tag'}
            </NeonButton>
            
            <NeonButton 
              variant="secondary"
              onClick={() => {
                setIsAddingTag(false);
                setNewTagType('');
                setNewTagReason('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </NeonButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
};export default LeadTagManager;
