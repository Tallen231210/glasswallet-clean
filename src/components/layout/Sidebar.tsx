'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { usePermissions } from '@/contexts/UserContext';

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'success' | 'neon' | 'warning' | 'danger';
  description?: string;
  children?: Omit<SidebarItem, 'children'>[];
  requiresPermission?: string; // Permission key required to show this item
  businessOwnerOnly?: boolean; // Only show for business owners
  salesRepOnly?: boolean; // Only show for sales reps
}

// Admin-only navigation structure for platform administrators
const adminNavigationItems: SidebarItem[] = [
  {
    id: 'admin',
    label: 'Platform Admin',
    href: '/admin',
    icon: '👑',
    description: 'Platform administration',
    badge: 'Admin Dashboard',
    badgeVariant: 'danger',
    requiresPermission: 'platformAdminAccess',
    children: [
      { id: 'admin-dashboard', label: 'Dashboard', href: '/admin', icon: '📊', description: 'Admin overview' },
      { id: 'admin-users', label: 'User Management', href: '/admin/users', icon: '👥', description: 'Manage users' },
      { id: 'admin-system', label: 'System Health', href: '/admin/system', icon: '⚡', description: 'System monitoring' },
      { id: 'admin-logs', label: 'System Logs', href: '/admin/logs', icon: '📋', description: 'View system logs' },
    ]
  },
  {
    id: 'roi-calculator',
    label: 'ROI Calculator',
    href: '/roi-calculator',
    icon: '📊',
    description: 'Sales presentation tool',
    badge: 'Demo Tool',
    badgeVariant: 'neon',
    requiresPermission: 'platformAdminAccess'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: '⚙️',
    description: 'Admin account settings',
    children: [
      { id: 'settings-account', label: 'Account', href: '/settings/account', icon: '👤', description: 'Profile settings' },
      { id: 'settings-security', label: 'Security', href: '/settings/security', icon: '🛡️', description: 'Security settings' },
    ]
  }
];

// Default navigation structure for business users
const defaultNavigationItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    description: 'Overview & mission control',
    badge: 'Home'
  },
  {
    id: 'my-performance',
    label: 'My Performance',
    href: '/performance',
    icon: '📈',
    description: 'Personal metrics & achievements',
    badge: 'Stats',
    badgeVariant: 'success',
    salesRepOnly: true
  },
  {
    id: 'activity',
    label: 'Activity Feed',
    href: '/activity',
    icon: '🔔',
    description: 'Real-time notifications',
    badge: 'Live',
    badgeVariant: 'neon'
  },
  {
    id: 'leads',
    label: 'Lead Management',
    href: '/leads',
    icon: '👥',
    description: 'Lead capture & qualification',
    children: [
      { id: 'leads-all', label: 'All Leads', href: '/leads', icon: '📋', description: 'View all leads' },
      { id: 'leads-new', label: 'Add Lead', href: '/leads/new', icon: '➕', description: 'Capture new lead' },
      { id: 'leads-rules', label: 'Auto Rules', href: '/leads/rules', icon: '🤖', description: 'Auto-tagging rules', businessOwnerOnly: true },
      { id: 'leads-analytics', label: 'Analytics', href: '/leads/advanced-analytics', icon: '📈', description: 'Performance insights', businessOwnerOnly: true },
    ]
  },
  {
    id: 'ai-intelligence',
    label: 'AI Intelligence',
    href: '/ai-intelligence',
    icon: '🤖',
    description: 'Machine learning insights',
    badge: 'AI',
    badgeVariant: 'neon',
    businessOwnerOnly: true
  },
  {
    id: 'pixels',
    label: 'Pixel Optimization',
    href: '/pixels',
    icon: '🎯',
    description: 'Advertising optimization',
    businessOwnerOnly: true,
    children: [
      { id: 'pixels-overview', label: 'Overview', href: '/pixels', icon: '📊', description: 'Pixel dashboard' },
      { id: 'pixels-connections', label: 'Connections', href: '/pixels/new', icon: '🔗', description: 'Manage connections' },
      { id: 'pixels-analytics', label: 'Analytics', href: '/pixels/analytics', icon: '📈', description: 'Performance data' },
    ]
  },
  {
    id: 'crm',
    label: 'CRM Integration',
    href: '/crm',
    icon: '🤝',
    description: 'Customer relationship management',
    businessOwnerOnly: true,
    children: [
      { id: 'crm-overview', label: 'Overview', href: '/crm', icon: '📊', description: 'CRM dashboard' },
      { id: 'crm-contacts', label: 'Contacts', href: '/crm/contacts', icon: '👥', description: 'Manage contacts' },
      { id: 'crm-integrations', label: 'Integrations', href: '/crm/integrations', icon: '🔗', description: 'CRM connections' },
    ]
  },
  {
    id: 'quick-actions',
    label: 'Quick Actions',
    href: '/quick-actions',
    icon: '⚡',
    description: 'Fast lead operations',
    badge: 'Fast',
    badgeVariant: 'neon',
    salesRepOnly: true,
    children: [
      { id: 'quick-pull', label: 'Quick Credit Pull', href: '/quick-actions/credit-pull', icon: '🔍', description: 'Instant credit check' },
      { id: 'bulk-import', label: 'Import Leads', href: '/quick-actions/import', icon: '📂', description: 'Upload lead list' },
      { id: 'daily-summary', label: 'Daily Summary', href: '/quick-actions/summary', icon: '📋', description: 'Today\'s activity' },
    ]
  },
  {
    id: 'integrations',
    label: 'Website Integration',
    href: '/integrations',
    icon: '🔗',
    description: 'Embed widget & API integration',
    badge: 'Embed',
    badgeVariant: 'neon',
    businessOwnerOnly: true
  },
  {
    id: 'billing',
    label: 'Billing & Credits',
    href: '/billing',
    icon: '💳',
    description: 'Credit purchases & billing',
    badge: 'Pro',
    badgeVariant: 'warning'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: '⚙️',
    description: 'Account & platform settings',
    children: [
      { id: 'settings-account', label: 'Account', href: '/settings/account', icon: '👤', description: 'Profile settings' },
      { id: 'settings-api', label: 'API Keys', href: '/settings/api', icon: '🔐', description: 'API configuration', businessOwnerOnly: true },
      { id: 'settings-notifications', label: 'Notifications', href: '/settings/notifications', icon: '🔔', description: 'Alert preferences' },
      { id: 'settings-security', label: 'Security', href: '/settings/security', icon: '🛡️', description: 'Security settings' },
    ]
  },
];

interface SidebarProps {
  items?: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  onToggle,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isBusinessOwner, isSalesRep, hasPermission } = usePermissions();
  
  // Determine which navigation items to show based on user type
  const navigationItems = items || (hasPermission('platformAdminAccess') ? adminNavigationItems : defaultNavigationItems);
  
  // Filter items based on permissions
  const filterNavigationItems = (items: SidebarItem[]): SidebarItem[] => {
    return items
      .filter(item => {
        // Check business owner only restriction
        if (item.businessOwnerOnly && !isBusinessOwner) return false;
        
        // Check sales rep only restriction
        if (item.salesRepOnly && !isSalesRep) return false;
        
        // Check specific permission requirements
        if (item.requiresPermission && !hasPermission(item.requiresPermission as any)) {
          return false;
        }
        
        return true;
      })
      .map(item => ({
        ...item,
        children: item.children ? filterNavigationItems(item.children as SidebarItem[]) : item.children
      }));
  };

  const filteredItems = useMemo(() => filterNavigationItems(navigationItems), [navigationItems, isBusinessOwner, isSalesRep, hasPermission]);

  // Auto-expand active sections
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const expanded = new Set<string>();
    filteredItems.forEach(item => {
      if (item.children && item.children.some(child => pathname.startsWith(child.href))) {
        expanded.add(item.id);
      }
    });
    return expanded;
  });

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string, children?: SidebarItem['children']) => {
    if (pathname === href) return true;
    if (children) {
      return children.some(child => pathname === child.href || pathname.startsWith(child.href));
    }
    return pathname.startsWith(href) && href !== '/';
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const renderItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const active = isActive(item.href, item.children);

    return (
      <div key={item.id} className="mb-2">
        {/* Main Navigation Item */}
        <div
          className={cn(
            'group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden',
            'hover:bg-white/10',
            active 
              ? 'bg-gradient-to-r from-neon-green/20 to-transparent border border-neon-green/30 text-white shadow-lg shadow-neon-green/10' 
              : 'text-gray-300 hover:text-white'
          )}
          onClick={() => {
            if (hasChildren && !collapsed) {
              toggleExpanded(item.id);
            } else {
              handleNavigation(item.href);
            }
          }}
          title={collapsed ? item.label : undefined}
        >
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 text-lg transition-transform duration-200',
            'group-hover:scale-110',
            active && 'text-neon-green'
          )}>
            {item.icon}
          </div>

          {/* Label and extras */}
          {!collapsed && (
            <>
              <div className="flex-1">
                <div className="font-medium text-sm leading-tight">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-400 mt-0.5 leading-tight">{item.description}</div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {item.badge && (
                  <Badge 
                    variant={item.badgeVariant || 'success'} 
                    size="sm"
                    className="text-xs font-medium"
                  >
                    {item.badge}
                  </Badge>
                )}
                {hasChildren && (
                  <div className={cn(
                    'text-xs transition-transform duration-200 text-gray-400',
                    isExpanded ? 'rotate-90' : '',
                    'group-hover:text-white'
                  )}>
                    ▶
                  </div>
                )}
              </div>
            </>
          )}

          {/* Active indicator */}
          {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-green rounded-r-full"></div>
          )}
        </div>

        {/* Sub-navigation Items */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-4">
            {item.children!.map((child) => (
              <div
                key={child.id}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer group overflow-hidden',
                  'hover:bg-white/5',
                  pathname === child.href || pathname.startsWith(child.href)
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/20 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                )}
                onClick={() => handleNavigation(child.href)}
              >
                <div className="text-sm flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  {child.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{child.label}</div>
                  {child.description && (
                    <div className="text-xs text-gray-500 mt-0.5">{child.description}</div>
                  )}
                </div>
                {child.badge && (
                  <Badge 
                    variant={child.badgeVariant || 'success'} 
                    size="sm"
                    className="text-xs"
                  >
                    {child.badge}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      'fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <GlassCard className="h-full rounded-none border-r border-white/10 border-t-0 border-b-0 border-l-0 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="/glasswallet-logo.svg" 
                    alt="GlassWallet Logo" 
                    className="w-48 h-auto"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <img 
                  src="/glasswallet-logo.svg" 
                  alt="GlassWallet" 
                  className="w-12 h-auto"
                />
              </div>
            )}
            
            {onToggle && (
              <button
                onClick={onToggle}
                className={cn(
                  'p-2 rounded-lg hover:bg-white/10 transition-all duration-200',
                  'text-gray-400 hover:text-white hover:scale-105'
                )}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <span className="text-base font-medium">
                  {collapsed ? '⮞' : '⮜'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {filteredItems.map(item => renderItem(item))}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/10">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse shadow-sm shadow-neon-green"></div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">
                  {hasPermission('platformAdminAccess') ? 'Platform Status' : 'System Status'}
                </p>
                <p className="text-xs text-gray-400">
                  {hasPermission('platformAdminAccess') ? 'Admin access active' : 'All systems operational'}
                </p>
              </div>
              <Badge 
                variant={hasPermission('platformAdminAccess') ? 'danger' : 'success'} 
                size="sm" 
                className="text-xs"
              >
                {hasPermission('platformAdminAccess') ? 'Admin' : 'Live'}
              </Badge>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};