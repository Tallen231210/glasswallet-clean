'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccountType, UserAccount, createMockUser } from '@/types/user';

interface UserContextType {
  user: UserAccount | null;
  accountType: AccountType;
  setAccountType: (type: AccountType) => void;
  isBusinessOwner: boolean;
  isSalesRep: boolean;
  isPlatformAdmin: boolean;
  hasPermission: (permission: keyof UserAccount['permissions']) => boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
  defaultAccountType?: AccountType;
}

export const UserProvider: React.FC<UserProviderProps> = ({ 
  children, 
  defaultAccountType = AccountType.BUSINESS_OWNER 
}) => {
  const [accountType, setAccountType] = useState<AccountType>(defaultAccountType);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In development, create mock user based on account type
    const mockUser = createMockUser(accountType);
    setUser(mockUser);
    setIsLoading(false);
    
    // Store account type in localStorage for persistence
    localStorage.setItem('glasswallet_account_type', accountType);
  }, [accountType]);

  useEffect(() => {
    // Load account type from localStorage on mount
    const savedAccountType = localStorage.getItem('glasswallet_account_type');
    if (savedAccountType && Object.values(AccountType).includes(savedAccountType as AccountType)) {
      setAccountType(savedAccountType as AccountType);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleSetAccountType = (type: AccountType) => {
    setAccountType(type);
  };

  const isBusinessOwner = accountType === AccountType.BUSINESS_OWNER;
  const isSalesRep = accountType === AccountType.SALES_REP;
  const isPlatformAdmin = accountType === AccountType.PLATFORM_ADMIN;

  const hasPermission = (permission: keyof UserAccount['permissions']): boolean => {
    if (!user) return false;
    return Boolean(user.permissions[permission]);
  };

  const contextValue: UserContextType = {
    user,
    accountType,
    setAccountType: handleSetAccountType,
    isBusinessOwner,
    isSalesRep,
    isPlatformAdmin,
    hasPermission,
    isLoading,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Utility hook for checking permissions
export const usePermissions = () => {
  const { hasPermission, isBusinessOwner, isSalesRep, isPlatformAdmin } = useUser();
  
  return {
    hasPermission,
    isBusinessOwner,
    isSalesRep,
    isPlatformAdmin,
    canAccessAI: hasPermission('aiIntelligence'),
    canAccessPixels: hasPermission('pixelOptimization'),
    canAccessCRM: hasPermission('crmIntegration'),
    canAccessAutoTagging: hasPermission('autoTaggingRules'),
    canAccessAdvancedAnalytics: hasPermission('advancedAnalytics'),
    canAccessUserManagement: hasPermission('userManagement'),
    canAccessAPI: hasPermission('apiAccess'),
    canAccessWebhooks: hasPermission('webhooks'),
    canAccessBulkOperations: hasPermission('bulkOperations'),
    canExportData: hasPermission('exportData'),
    // Platform admin permissions
    canAccessPlatformAdmin: hasPermission('platformAdminAccess'),
    canManageSystem: hasPermission('systemManagement'),
    canAdministerUsers: hasPermission('userAdministration'),
    canMonitorSystem: hasPermission('systemMonitoring'),
    canUseEmergencyControls: hasPermission('emergencyControls'),
  };
};