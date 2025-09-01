'use client';

import React, { useState, memo, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { DemoStatusBanner } from '@/components/demo/DemoStatusBanner';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayoutComponent = ({ children }: AppLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = useCallback((path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  }, [pathname]);

  const navigationItems = useMemo(() => [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', type: 'main' },
    { path: '/leads', label: 'Leads', icon: 'users', type: 'main' },
    { path: '/leads/new', label: 'Add Lead', icon: 'plus', type: 'sub', parent: 'leads' },
    { path: '/leads/analytics', label: 'Analytics', icon: 'chart', type: 'sub', parent: 'leads' },
    { path: '/leads/rules', label: 'Auto-Tagging Rules', icon: 'robot', type: 'sub', parent: 'leads' },
    { path: '/billing', label: 'Billing & Credits', icon: 'billing', type: 'main' },
    { path: '/pixels', label: 'Pixel Integration', icon: 'pixel', type: 'main' },
    { path: '/widgets', label: 'JavaScript Widgets', icon: 'widget', type: 'main' },
    { path: '/webhooks', label: 'Webhook Management', icon: 'webhook', type: 'main' },
  ], []);

  const renderIcon = (iconName: string, isActive: boolean) => {
    const iconClass = `w-5 h-5 transition-smooth text-neon-green`;
    
    switch (iconName) {
      case 'dashboard':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5v4m4-4v4m4-4v4" />
          </svg>
        );
      case 'users':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'plus':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'chart':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'robot':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case 'pixel':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case 'widget':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2V3zM17 21a4 4 0 004-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4zM17 3h2a2 2 0 012 2v12a4 4 0 01-4 4h-2V3z" />
          </svg>
        );
      case 'billing':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'webhook':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-center">
          <img 
            src="/images/glasswallet-logo.png" 
            alt="GlassWallet Logo" 
            className="h-12 object-contain"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              router.push(item.path);
              setIsMobileMenuOpen(false);
            }}
            className={`sidebar-nav-item rainbow-border-hover w-full flex items-center gap-3 text-left rounded-lg font-medium transition-smooth ${
              item.type === 'sub' 
                ? 'sidebar-nav-sub ml-4 mr-2 px-3 py-2 text-sm' // Sub-items: reduced indent, added right margin, smaller padding
                : 'px-4 py-3' // Main items: normal padding
            } ${
              isActive(item.path)
                ? 'active bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 text-green-400'
                : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
            }`}
          >
            {item.type === 'sub' ? (
              // Sub-items: smaller icon, different style
              <div className="w-4 h-4 flex items-center justify-center">
                <div className="w-1 h-1 bg-neon-green rounded-full"></div>
              </div>
            ) : (
              // Main items: full icon
              renderIcon(item.icon, isActive(item.path))
            )}
            <span className={`font-medium ${item.type === 'sub' ? 'text-sm' : 'text-body'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-neon"></div>
              <span className="text-black text-sm font-bold relative z-10">
                {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
              </p>
              <p className="text-green-400 text-xs">
                {user?.emailAddresses?.[0]?.emailAddress || 'Active Account'}
              </p>
            </div>
            <SignOutButton>
              <button className="text-gray-400 hover:text-neon-green text-xs transition-smooth uppercase tracking-wide">
                Exit
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-sidebar-overlay md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 futuristic-sidebar flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar md:hidden futuristic-sidebar flex flex-col ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-400 hover:text-white transition-smooth"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-black md:ml-0">
        {children}
      </div>
      
      {/* Demo Status Banner */}
      <DemoStatusBanner />
      
      {/* Performance Monitor - Only in development */}
      <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
    </div>
  );
};

// Memoize the AppLayout component to prevent unnecessary re-renders
export const AppLayout = memo(AppLayoutComponent);
AppLayout.displayName = 'AppLayout';