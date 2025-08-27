'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

// Global shortcuts that work across the entire application
const GLOBAL_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'h',
    ctrlKey: true,
    action: () => {}, // Will be overridden
    description: 'Go to Dashboard',
    category: 'Navigation'
  },
  {
    key: 'l',
    ctrlKey: true,
    action: () => {}, // Will be overridden
    description: 'Go to Leads',
    category: 'Navigation'
  },
  {
    key: 's',
    ctrlKey: true,
    action: () => {}, // Will be overridden
    description: 'Go to Settings',
    category: 'Navigation'
  },
  {
    key: 'n',
    ctrlKey: true,
    action: () => {}, // Will be overridden
    description: 'New Lead',
    category: 'Actions'
  },
  {
    key: '/',
    action: () => {}, // Will be overridden
    description: 'Focus Search',
    category: 'Search'
  },
  {
    key: 'k',
    ctrlKey: true,
    action: () => {}, // Will be overridden
    description: 'Open Command Palette',
    category: 'General'
  },
  {
    key: '?',
    shiftKey: true,
    action: () => {}, // Will be overridden
    description: 'Show Help',
    category: 'General'
  }
];

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[] = [],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const router = useRouter();
  const shortcutsRef = useRef<KeyboardShortcut[]>([]);
  const { enabled = true, preventDefault = true } = options;

  // Setup global shortcuts with router actions
  const setupGlobalShortcuts = useCallback(() => {
    return GLOBAL_SHORTCUTS.map(shortcut => ({
      ...shortcut,
      action: () => {
        switch (shortcut.key) {
          case 'h':
            router.push('/dashboard');
            break;
          case 'l':
            router.push('/leads');
            break;
          case 's':
            router.push('/settings');
            break;
          case 'n':
            router.push('/leads/new');
            break;
          case '/':
            // Focus search input if available
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
            searchInput?.focus();
            break;
          case 'k':
            // Trigger command palette (will be implemented later)
            window.dispatchEvent(new CustomEvent('open-command-palette'));
            break;
          case '?':
            // Show help modal
            window.dispatchEvent(new CustomEvent('show-help-modal'));
            break;
        }
      }
    }));
  }, [router]);

  // Combine global and local shortcuts
  useEffect(() => {
    const globalShortcuts = setupGlobalShortcuts();
    shortcutsRef.current = [...globalShortcuts, ...shortcuts];
  }, [shortcuts, setupGlobalShortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in input fields
    const activeElement = document.activeElement;
    const isInputActive = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.getAttribute('contenteditable') === 'true'
    );

    // Allow some shortcuts even in input fields (like Ctrl+S for save)
    const allowInInputs = ['s', 'z', 'y', 'a'];
    if (isInputActive && !allowInInputs.includes(event.key.toLowerCase()) && event.ctrlKey) {
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;

      return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches;
    });

    if (matchingShortcut) {
      if (preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
      matchingShortcut.action();
    }
  }, [enabled, preventDefault]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: shortcutsRef.current,
    globalShortcuts: GLOBAL_SHORTCUTS
  };
};

// Hook for managing focus and keyboard navigation
export const useFocusManagement = () => {
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  const getFocusableElements = useCallback((container: HTMLElement = document.body) => {
    return Array.from(container.querySelectorAll(focusableSelector)) as HTMLElement[];
  }, [focusableSelector]);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [getFocusableElements]);

  const restoreFocus = useCallback((element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      // Use setTimeout to ensure the element is still in DOM
      setTimeout(() => {
        element.focus();
      }, 0);
    }
  }, []);

  return {
    getFocusableElements,
    trapFocus,
    restoreFocus,
    focusableSelector
  };
};

// Hook for screen reader announcements
export const useScreenReader = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return { announce };
};

// Hook for managing reduced motion preferences
export const useReducedMotion = () => {
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateMotionPreference = () => {
      document.documentElement.style.setProperty(
        '--motion-duration', 
        mediaQuery.matches ? '0ms' : '300ms'
      );
    };

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference);
    };
  }, []);

  return { prefersReducedMotion };
};