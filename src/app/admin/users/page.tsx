'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { InteractiveCard } from '@/components/ui/InteractiveCard';
import { usePermissions } from '@/contexts/UserContext';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

// Mock user data
interface User {
  id: string;
  name: string;
  email: string;
  accountType: 'BUSINESS_OWNER' | 'SALES_REP' | 'PLATFORM_ADMIN';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  credits: number;
  leadsCount: number;
  joinedDate: string;
  company?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    accountType: 'BUSINESS_OWNER',
    status: 'active',
    lastLogin: '2 hours ago',
    credits: 450,
    leadsCount: 1250,
    joinedDate: '2024-01-15',
    company: 'Smith Realty'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@marketpro.com',
    accountType: 'BUSINESS_OWNER',
    status: 'active',
    lastLogin: '1 day ago',
    credits: 890,
    leadsCount: 3400,
    joinedDate: '2023-11-22',
    company: 'MarketPro Solutions'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@salesteam.com',
    accountType: 'SALES_REP',
    status: 'active',
    lastLogin: '5 minutes ago',
    credits: 0,
    leadsCount: 890,
    joinedDate: '2024-02-10',
    company: 'SalesTeam LLC'
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily@leadgen.co',
    accountType: 'BUSINESS_OWNER',
    status: 'inactive',
    lastLogin: '1 week ago',
    credits: 120,
    leadsCount: 567,
    joinedDate: '2024-03-05',
    company: 'LeadGen Co'
  },
  {
    id: '5',
    name: 'David Rodriguez',
    email: 'david@mortgage.com',
    accountType: 'BUSINESS_OWNER',
    status: 'suspended',
    lastLogin: '2 weeks ago',
    credits: 0,
    leadsCount: 234,
    joinedDate: '2024-01-08',
    company: 'Mortgage Masters'
  }
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [users] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [filterAccountType, setFilterAccountType] = useState<'all' | 'BUSINESS_OWNER' | 'SALES_REP' | 'PLATFORM_ADMIN'>('all');

  // Check if user has admin access
  if (!hasPermission('platformAdminAccess')) {
    return (
      <AppShell
        headerTitle="Access Denied"
        headerSubtitle="This feature is restricted to platform administrators"
      >
        <div className="p-6 max-w-2xl mx-auto text-center">
          <GlassCard className="p-8">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-6">
              User Management is restricted to platform administrators only.
            </p>
            <NeonButton onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </NeonButton>
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesAccountType = filterAccountType === 'all' || user.accountType === filterAccountType;
    
    return matchesSearch && matchesStatus && matchesAccountType;
  });


  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'danger';
      default: return 'default';
    }
  };


  const getAccountTypeVariant = (accountType: string) => {
    switch (accountType) {
      case 'BUSINESS_OWNER': return 'success';
      case 'SALES_REP': return 'neon';
      case 'PLATFORM_ADMIN': return 'danger';
      default: return 'default';
    }
  };

  const handleUserAction = (userId: string, action: string) => {
    console.log(`${action} user ${userId}`);
    // Here you would implement the actual user management actions
  };

  const totalStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    businessOwners: users.filter(u => u.accountType === 'BUSINESS_OWNER').length,
    salesReps: users.filter(u => u.accountType === 'SALES_REP').length,
    totalCredits: users.reduce((sum, u) => sum + u.credits, 0),
    totalLeads: users.reduce((sum, u) => sum + u.leadsCount, 0)
  };

  return (
    <AppShell
      headerTitle="User Management"
      headerSubtitle="Manage platform users, permissions, and account settings"
      headerActions={
        <div className="flex gap-2">
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/admin')}
          >
            ← Back to Admin
          </NeonButton>
          <NeonButton onClick={() => console.log('Add new user')}>
            Add User
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-8 max-w-7xl mx-auto">

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-lg font-bold text-white mb-2">Total Users</h3>
              <div className="text-2xl font-bold text-neon-green">{totalStats.total}</div>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-white mb-2">Active</h3>
              <div className="text-2xl font-bold text-neon-green">{totalStats.active}</div>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="text-lg font-bold text-white mb-2">Business</h3>
              <div className="text-2xl font-bold text-blue-400">{totalStats.businessOwners}</div>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="text-lg font-bold text-white mb-2">Sales Reps</h3>
              <div className="text-2xl font-bold text-purple-400">{totalStats.salesReps}</div>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">💳</div>
              <h3 className="text-lg font-bold text-white mb-2">Total Credits</h3>
              <div className="text-2xl font-bold text-yellow-400">{totalStats.totalCredits.toLocaleString()}</div>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-white mb-2">Total Leads</h3>
              <div className="text-2xl font-bold text-orange-400">{totalStats.totalLeads.toLocaleString()}</div>
            </GlassCard>
          </InteractiveCard>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField label="Search Users">
              <Input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FormField>
            
            <FormField label="Status Filter">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </FormField>
            
            <FormField label="Account Type">
              <select
                value={filterAccountType}
                onChange={(e) => setFilterAccountType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="BUSINESS_OWNER">Business Owners</option>
                <option value="SALES_REP">Sales Reps</option>
                <option value="PLATFORM_ADMIN">Platform Admins</option>
              </select>
            </FormField>
            
            <div className="flex items-end">
              <NeonButton 
                variant="secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterAccountType('all');
                }}
                className="w-full"
              >
                Clear Filters
              </NeonButton>
            </div>
          </div>
        </GlassCard>

        {/* Users List */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Users ({filteredUsers.length})
            </h2>
            <div className="flex gap-2">
              <NeonButton size="sm" variant="secondary">
                Export CSV
              </NeonButton>
              <NeonButton size="sm" variant="secondary">
                Bulk Actions
              </NeonButton>
            </div>
          </div>

          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-6 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                  {/* User Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-electric-green rounded-full flex items-center justify-center text-deep-navy-start font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{user.name}</h3>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        {user.company && (
                          <p className="text-xs text-gray-500">{user.company}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Type */}
                  <div className="space-y-2">
                    <Badge variant={getStatusVariant(user.status)} size="sm">
                      {user.status}
                    </Badge>
                    <Badge variant={getAccountTypeVariant(user.accountType)} size="sm">
                      {user.accountType.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Credits:</span>
                      <span className="text-white">{user.credits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Leads:</span>
                      <span className="text-white">{user.leadsCount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-400">Last Login:</div>
                    <div className="text-white">{user.lastLogin}</div>
                    <div className="text-gray-400">Joined:</div>
                    <div className="text-white">{new Date(user.joinedDate).toLocaleDateString()}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <NeonButton 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleUserAction(user.id, 'View')}
                    >
                      View
                    </NeonButton>
                    <NeonButton 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleUserAction(user.id, 'Edit')}
                    >
                      Edit
                    </NeonButton>
                    {user.status === 'active' ? (
                      <NeonButton 
                        size="sm" 
                        variant="secondary"
                        className="bg-red-600/20 hover:bg-red-600/30"
                        onClick={() => handleUserAction(user.id, 'Suspend')}
                      >
                        Suspend
                      </NeonButton>
                    ) : (
                      <NeonButton 
                        size="sm" 
                        variant="secondary"
                        className="bg-green-600/20 hover:bg-green-600/30"
                        onClick={() => handleUserAction(user.id, 'Activate')}
                      >
                        Activate
                      </NeonButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
              <p className="text-gray-400">
                {searchTerm || filterStatus !== 'all' || filterAccountType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No users have been added to the platform yet'
                }
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}