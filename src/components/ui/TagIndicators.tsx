'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { NeonButton } from '@/components/ui/NeonButton';
import { Lead } from '@/lib/mockData';

interface TagIndicatorsProps {
  lead: Lead;
  onTagAction?: (leadId: string, action: 'tag' | 'sync') => void;
  compact?: boolean;
}

export function TagIndicators({ lead, onTagAction, compact = false }: TagIndicatorsProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  
  const getTagVariant = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'whitelist':
        return 'success';
      case 'qualified':
        return 'neon';
      case 'blacklist':
        return 'default';
      case 'high-value':
      case 'premium':
      case 'vip':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'META': return '📘';
      case 'GOOGLE_ADS': return '🔍';
      case 'TIKTOK': return '🎵';
      default: return '📊';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'META': return 'Meta';
      case 'GOOGLE_ADS': return 'Google';
      case 'TIKTOK': return 'TikTok';
      default: return platform;
    }
  };

  const displayTags = compact && lead.tags.length > 3 ? 
    (showAllTags ? lead.tags : lead.tags.slice(0, 3)) : 
    lead.tags;

  const hasPixelSync = lead.pixelSyncStatus?.synced;
  const syncedPlatforms = lead.pixelSyncStatus?.syncedPlatforms || [];
  const failedPlatforms = lead.pixelSyncStatus?.failedPlatforms || [];

  return (
    <div className="space-y-2">
      {/* Tags Section */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 font-medium">Tags:</span>
          {displayTags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              variant={getTagVariant(tag) as any}
              size="sm"
              className="text-xs"
            >
              {tag}
            </Badge>
          ))}
          
          {compact && lead.tags.length > 3 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAllTags(!showAllTags);
              }}
              className="text-xs text-neon-green hover:text-neon-green/80 transition-colors"
            >
              {showAllTags ? 'show less' : `+${lead.tags.length - 3} more`}
            </button>
          )}
          
          {!compact && onTagAction && (
            <NeonButton
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onTagAction(lead.id, 'tag');
              }}
              className="text-xs px-2 py-1"
            >
              + Tag
            </NeonButton>
          )}
        </div>
      )}

      {/* Pixel Sync Status */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400 font-medium">Pixel Sync:</span>
        
        {!hasPixelSync ? (
          <div className="flex items-center gap-2">
            <Badge variant="default" size="sm" className="text-xs">
              ⏸️ Not Synced
            </Badge>
            {!compact && onTagAction && (
              <NeonButton
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagAction(lead.id, 'sync');
                }}
                className="text-xs px-2 py-1"
              >
                Sync Now
              </NeonButton>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {syncedPlatforms.map((platform) => (
              <Badge
                key={platform}
                variant="success"
                size="sm"
                className="text-xs"
                title={`Synced to ${getPlatformName(platform)}`}
              >
                {getPlatformIcon(platform)} {getPlatformName(platform)}
              </Badge>
            ))}
            
            {failedPlatforms.map((platform) => (
              <Badge
                key={`failed-${platform}`}
                variant="default"
                size="sm"
                className="text-xs opacity-70"
                title={`Failed to sync to ${getPlatformName(platform)}`}
              >
                ❌ {getPlatformName(platform)}
              </Badge>
            ))}
            
            {lead.pixelSyncStatus?.lastSyncAt && (
              <span className="text-xs text-gray-500 ml-2">
                Last: {new Date(lead.pixelSyncStatus.lastSyncAt).toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions for non-compact view */}
      {!compact && (lead.tags.length === 0 || !hasPixelSync) && onTagAction && (
        <div className="flex gap-2 pt-1">
          {lead.tags.length === 0 && (
            <NeonButton
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onTagAction(lead.id, 'tag');
              }}
              className="text-xs px-3 py-1"
            >
              🏷️ Add Tags
            </NeonButton>
          )}
          
          {!hasPixelSync && lead.tags.some(tag => ['qualified', 'whitelist'].includes(tag.toLowerCase())) && (
            <NeonButton
              size="sm"
              variant="neon"
              onClick={(e) => {
                e.stopPropagation();
                onTagAction(lead.id, 'sync');
              }}
              className="text-xs px-3 py-1"
            >
              🚀 Sync to Pixels
            </NeonButton>
          )}
        </div>
      )}
    </div>
  );
}