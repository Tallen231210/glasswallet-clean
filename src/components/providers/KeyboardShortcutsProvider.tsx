'use client';

import React, { useState, useEffect } from 'react';
import { useKeyboardShortcuts, useReducedMotion, useScreenReader } from '@/hooks/useKeyboardShortcuts';
import { HelpModal } from '@/components/ui/HelpModal';

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({
  children
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { announce } = useScreenReader();
  const { prefersReducedMotion } = useReducedMotion();

  // Setup global keyboard shortcuts
  useKeyboardShortcuts([], {
    enabled: true,
    preventDefault: true
  });

  // Listen for global events
  useEffect(() => {
    const handleShowHelp = () => {
      setShowHelpModal(true);
      announce('Help modal opening', 'polite');
    };

    const handleOpenCommandPalette = () => {
      // TODO: Implement command palette
      announce('Command palette not yet implemented', 'polite');
    };

    document.addEventListener('show-help-modal', handleShowHelp);
    document.addEventListener('open-command-palette', handleOpenCommandPalette);

    return () => {
      document.removeEventListener('show-help-modal', handleShowHelp);
      document.removeEventListener('open-command-palette', handleOpenCommandPalette);
    };
  }, [announce]);

  // Add global styles for accessibility
  useEffect(() => {
    // Add CSS custom properties for reduced motion
    if (prefersReducedMotion()) {
      document.documentElement.style.setProperty('--animation-duration', '0ms');
      document.documentElement.style.setProperty('--transition-duration', '0ms');
    } else {
      document.documentElement.style.setProperty('--animation-duration', '300ms');
      document.documentElement.style.setProperty('--transition-duration', '200ms');
    }

    // Add focus-visible styles
    const style = document.createElement('style');
    style.textContent = `
      /* Hide focus ring for mouse users, show for keyboard users */
      .js-focus-visible :focus:not(.focus-visible) {
        outline: none;
      }

      .focus-visible {
        outline: 2px solid #00ff88;
        outline-offset: 2px;
      }

      /* Screen reader only class */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Skip link for screen readers */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #00ff88;
        color: black;
        padding: 8px;
        text-decoration: none;
        z-index: 1000;
        border-radius: 4px;
      }

      .skip-link:focus {
        top: 6px;
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .glass-card {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 2px solid #00ff88 !important;
        }
        
        .text-gray-400 {
          color: #cccccc !important;
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }

      /* Focus management for interactive elements */
      button:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible,
      a:focus-visible {
        outline: 2px solid #00ff88;
        outline-offset: 2px;
      }

      /* Keyboard navigation indicators */
      [data-focus-visible-added] {
        outline: 2px solid #00ff88;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [prefersReducedMotion]);

  // Add skip link for screen readers
  useEffect(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.setAttribute('aria-label', 'Skip to main content');

    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);

  return (
    <>
      {children}
      
      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
      
      {/* Aria live region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="aria-live-region"
      />
      
      {/* Aria live region for urgent announcements */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="aria-live-urgent"
      />
    </>
  );
};