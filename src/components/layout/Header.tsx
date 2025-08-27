'use client';

import React from 'react';
import { UserButton as MockUserButton } from '@/components/auth/MockAuthProvider';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';

// Only import Clerk in production
let ClerkUserButton: any = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  ClerkUserButton = require('@clerk/nextjs').UserButton;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return (
    <GlassCard className={cn(
      'px-6 py-4 rounded-none border-b border-white/10 border-t-0 border-l-0 border-r-0',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-2 mb-2">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-300">
                      {crumb.label}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-gray-500 text-sm">/</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Title & Subtitle */}
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-white mb-1">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-gray-400 text-sm">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions & User */}
        <div className="flex items-center gap-4">
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
          
          {/* User Profile */}
          <div className="flex items-center gap-3">
            <Badge variant="neon" size="sm" dot>
              Online
            </Badge>
            {isDevelopment ? (
              <MockUserButton />
            ) : (
              <ClerkUserButton 
                appearance={{
                  elements: {
                    avatarBox: "ring-2 ring-neon-green/30 ring-offset-2 ring-offset-slate-900",
                    userButtonPopoverCard: "glass-card border border-white/20",
                    userButtonPopoverActionButton: "hover:bg-white/10 text-white",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverFooter: "border-t border-white/10",
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};