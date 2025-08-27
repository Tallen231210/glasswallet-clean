'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { NeonButton } from './NeonButton';
import { Badge } from './Badge';
import { cn } from '@/lib/utils';
import { useFocusManagement, useScreenReader } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  category?: string;
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: KeyboardShortcut[];
  className?: string;
}

const GLOBAL_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'h',
    ctrlKey: true,
    description: 'Go to Dashboard',
    category: 'Navigation'
  },
  {
    key: 'l',
    ctrlKey: true,
    description: 'Go to Leads',
    category: 'Navigation'
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Go to Settings',
    category: 'Navigation'
  },
  {
    key: 'n',
    ctrlKey: true,
    description: 'Create New Lead',
    category: 'Actions'
  },
  {
    key: '/',
    description: 'Focus Search',
    category: 'Search'
  },
  {
    key: 'k',
    ctrlKey: true,
    description: 'Open Command Palette',
    category: 'General'
  },
  {
    key: '?',
    shiftKey: true,
    description: 'Show Help (this modal)',
    category: 'General'
  },
  {
    key: 'Escape',
    description: 'Close modals/Cancel',
    category: 'General'
  }
];

const ADDITIONAL_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'Tab',
    description: 'Navigate between elements',
    category: 'Navigation'
  },
  {
    key: 'Enter',
    description: 'Activate buttons/links',
    category: 'Actions'
  },
  {
    key: 'Space',
    description: 'Toggle checkboxes/buttons',
    category: 'Actions'
  },
  {
    key: 'Arrow Keys',
    description: 'Navigate lists/menus',
    category: 'Navigation'
  }
];

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  shortcuts = [],
  className
}) => {
  const [activeTab, setActiveTab] = useState('shortcuts');
  const { trapFocus, restoreFocus } = useFocusManagement();
  const { announce } = useScreenReader();
  const [previouslyFocusedElement, setPreviouslyFocusedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      setPreviouslyFocusedElement(document.activeElement as HTMLElement);
      
      // Announce modal opening
      announce('Help modal opened', 'assertive');
      
      // Trap focus in modal
      const modalElement = document.getElementById('help-modal');
      if (modalElement) {
        const cleanup = trapFocus(modalElement);
        return cleanup;
      }
    } else {
      // Restore focus when modal closes
      restoreFocus(previouslyFocusedElement);
    }
    
    return undefined; // Explicit return for all code paths
  }, [isOpen, trapFocus, restoreFocus, previouslyFocusedElement, announce]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allShortcuts = [...GLOBAL_SHORTCUTS, ...shortcuts];
  const groupedShortcuts = allShortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const formatKeyCombo = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.metaKey) keys.push('⌘');
    
    // Special handling for some keys
    let keyDisplay = shortcut.key;
    if (shortcut.key === ' ') keyDisplay = 'Space';
    if (shortcut.key === '?') keyDisplay = '?';
    if (shortcut.key === '/') keyDisplay = '/';
    
    keys.push(keyDisplay);
    return keys;
  };

  const renderShortcutKey = (key: string, index: number) => (
    <Badge
      key={index}
      variant="default"
      size="sm"
      className="bg-white/20 text-white font-mono text-xs px-2 py-1"
    >
      {key}
    </Badge>
  );

  const tabs = [
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: '⌨️' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'tips', label: 'Tips & Tricks', icon: '💡' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div id="help-modal">
        <GlassCard 
          className={cn('w-full max-w-4xl max-h-[90vh] overflow-hidden', className)}
        >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 id="help-modal-title" className="text-2xl font-bold text-white mb-2">
                Help & Support
              </h2>
              <p className="text-gray-400">
                Learn keyboard shortcuts, accessibility features, and tips for using GlassWallet
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              aria-label="Close help modal"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1 backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-neon-green text-black'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                )}
                aria-pressed={activeTab === tab.id}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[60vh]">
            {activeTab === 'shortcuts' && (
              <div className="space-y-6">
                {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-neon-green rounded-full"></span>
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {shortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <span className="text-gray-300">{shortcut.description}</span>
                          <div className="flex gap-1">
                            {formatKeyCombo(shortcut).map((key, keyIndex) => 
                              renderShortcutKey(key, keyIndex)
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    General Navigation
                  </h3>
                  <div className="space-y-2">
                    {ADDITIONAL_SHORTCUTS.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <span className="text-gray-300">{shortcut.description}</span>
                        <div className="flex gap-1">
                          {renderShortcutKey(shortcut.key, 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Screen Reader Support</h3>
                  <div className="space-y-3 text-gray-300">
                    <p>GlassWallet is fully compatible with screen readers including:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>NVDA (Windows)</li>
                      <li>JAWS (Windows)</li>
                      <li>VoiceOver (Mac/iOS)</li>
                      <li>TalkBack (Android)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Visual Accessibility</h3>
                  <div className="space-y-3 text-gray-300">
                    <p>Features to improve visual accessibility:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>High contrast design with WCAG AA compliance</li>
                      <li>Respects system dark mode preferences</li>
                      <li>Supports browser zoom up to 200%</li>
                      <li>Color-blind friendly color scheme</li>
                      <li>Focus indicators on all interactive elements</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Motor Accessibility</h3>
                  <div className="space-y-3 text-gray-300">
                    <p>Features for users with motor impairments:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Large click targets (minimum 44x44px)</li>
                      <li>Keyboard navigation for all functionality</li>
                      <li>Generous spacing between interactive elements</li>
                      <li>No time-based interactions required</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Reduced Motion</h3>
                  <div className="space-y-3 text-gray-300">
                    <p>
                      Animations are automatically reduced or disabled if you have 
                      "Reduce motion" enabled in your system preferences.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Productivity Tips</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-neon-green/10 to-transparent rounded-lg border border-neon-green/20">
                      <h4 className="text-neon-green font-medium mb-2">⚡ Quick Lead Entry</h4>
                      <p className="text-gray-300 text-sm">
                        Press Ctrl+N anywhere in the app to quickly add a new lead without navigating to the leads page.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-400/10 to-transparent rounded-lg border border-blue-400/20">
                      <h4 className="text-blue-400 font-medium mb-2">🔍 Smart Search</h4>
                      <p className="text-gray-300 text-sm">
                        Use the "/" key to quickly focus the search bar from anywhere. Search supports email, phone, and name patterns.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-purple-400/10 to-transparent rounded-lg border border-purple-400/20">
                      <h4 className="text-purple-400 font-medium mb-2">⌨️ Navigation</h4>
                      <p className="text-gray-300 text-sm">
                        Learn the main navigation shortcuts (Ctrl+H for Home, Ctrl+L for Leads) to move around quickly.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Lead Management Tips</h3>
                  <div className="space-y-3 text-gray-300 text-sm">
                    <p>• Use bulk selection (Shift+Click) to tag multiple leads at once</p>
                    <p>• Color-coded credit scores: Green (720+), Yellow (650-719), Red (&lt;650)</p>
                    <p>• Set up auto-tagging rules to automatically process leads based on criteria</p>
                    <p>• Export tagged leads as CSV for use in external systems</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Performance Tips</h3>
                  <div className="space-y-3 text-gray-300 text-sm">
                    <p>• Use filters to reduce large lead lists for better performance</p>
                    <p>• The activity feed auto-refreshes every 5-15 seconds</p>
                    <p>• Charts and visualizations animate based on your motion preferences</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-6 mt-6 border-t border-white/10">
            <NeonButton onClick={onClose}>
              Got it!
            </NeonButton>
          </div>
        </div>
      </GlassCard>
      </div>
    </div>
  );
};