'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { KeyboardShortcutsProvider } from '@/components/providers/KeyboardShortcutsProvider';

interface AppShellProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  headerActions?: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' }
  ];

  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
    return [{ label: 'Dashboard' }];
  }

  // Generate breadcrumbs based on pathname
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip if it's dashboard (already added)
    if (segment === 'dashboard') return;
    
    let label = segment;
    
    // Beautify segment names
    switch (segment) {
      case 'leads':
        label = 'Lead Management';
        break;
      case 'ai-intelligence':
        label = 'AI Intelligence';
        break;
      case 'pixels':
        label = 'Pixel Optimization';
        break;
      case 'advanced-analytics':
        label = 'Advanced Analytics';
        break;
      case 'new':
        label = 'Add New';
        break;
      case 'analytics':
        label = 'Analytics';
        break;
      case 'activity':
        label = 'Activity Center';
        break;
      case 'rules':
        label = 'Auto-Tagging Rules';
        break;
      default:
        // Capitalize and replace hyphens with spaces
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
    
    // Only add href if it's not the last item
    breadcrumbs.push({
      label,
      href: index < segments.length - 1 ? currentPath : undefined
    });
  });

  return breadcrumbs;
};

export const AppShell: React.FC<AppShellProps> = ({
  children,
  headerTitle,
  headerSubtitle,
  headerActions,
  showSidebar = true,
  className
}) => {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const breadcrumbs = generateBreadcrumbs(pathname);

  // Auto-generate header title if not provided
  const title = headerTitle || breadcrumbs[breadcrumbs.length - 1]?.label || 'GlassWallet';

  // Auto-generate subtitle if not provided
  const getSubtitle = () => {
    if (headerSubtitle) return headerSubtitle;
    
    if (pathname === '/dashboard') {
      return 'AI-Powered Credit Intelligence Platform';
    }
    if (pathname.startsWith('/leads')) {
      return 'Lead capture, qualification & management';
    }
    if (pathname.startsWith('/ai-intelligence')) {
      return 'Machine learning insights & automation';
    }
    if (pathname.startsWith('/pixels')) {
      return 'Advertising optimization & analytics';
    }
    
    return 'Advanced credit data integration platform';
  };

  return (
    <KeyboardShortcutsProvider>
      <div className="min-h-screen flex bg-black">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar 
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* Main Content Area */}
        <div className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out',
          showSidebar 
            ? (sidebarCollapsed ? 'ml-16' : 'ml-64')
            : 'ml-0'
        )}>
          {/* Top Header */}
          <Header
            title={title}
            subtitle={getSubtitle()}
            breadcrumbs={breadcrumbs.length > 1 ? breadcrumbs : undefined}
            actions={headerActions}
            className="flex-shrink-0"
          />

          {/* Page Content */}
          <main 
            id="main-content"
            className={cn(
              'flex-1 overflow-auto',
              className
            )}
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>
        </div>
      </div>
    </KeyboardShortcutsProvider>
  );
};