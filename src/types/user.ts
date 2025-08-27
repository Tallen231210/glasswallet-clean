// User account types and related interfaces

export enum AccountType {
  BUSINESS_OWNER = 'business_owner',
  SALES_REP = 'sales_rep',
  PLATFORM_ADMIN = 'platform_admin'
}

export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType: AccountType;
  company?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  
  // Account-specific settings
  settings: {
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      leadAlerts: boolean;
      systemAlerts: boolean;
    };
  };
  
  // Billing information
  billing: {
    creditBalance: number;
    subscriptionPlan?: 'starter' | 'professional' | 'enterprise';
    subscriptionStatus?: 'active' | 'past_due' | 'canceled';
    billingPeriod?: 'monthly' | 'yearly';
  };
  
  // Feature permissions based on account type
  permissions: UserPermissions;
}

export interface UserPermissions {
  // Core features (available to all)
  dashboard: boolean;
  activityFeed: boolean;
  leadManagement: boolean;
  basicSettings: boolean;
  creditPurchase: boolean;
  
  // Business owner features
  aiIntelligence?: boolean;
  pixelOptimization?: boolean;
  crmIntegration?: boolean;
  autoTaggingRules?: boolean;
  advancedAnalytics?: boolean;
  userManagement?: boolean;
  apiAccess?: boolean;
  webhooks?: boolean;
  bulkOperations?: boolean;
  exportData?: boolean;
  
  // Platform admin features (only for platform owners)
  platformAdminAccess?: boolean;
  systemManagement?: boolean;
  userAdministration?: boolean;
  systemMonitoring?: boolean;
  emergencyControls?: boolean;
}

export const getDefaultPermissions = (accountType: AccountType): UserPermissions => {
  const basePermissions: UserPermissions = {
    dashboard: true,
    activityFeed: true,
    leadManagement: true,
    basicSettings: true,
    creditPurchase: true,
  };

  if (accountType === AccountType.PLATFORM_ADMIN) {
    // Platform admins get EVERYTHING
    return {
      ...basePermissions,
      aiIntelligence: true,
      pixelOptimization: true,
      crmIntegration: true,
      autoTaggingRules: true,
      advancedAnalytics: true,
      userManagement: true,
      apiAccess: true,
      webhooks: true,
      bulkOperations: true,
      exportData: true,
      // Admin-only features
      platformAdminAccess: true,
      systemManagement: true,
      userAdministration: true,
      systemMonitoring: true,
      emergencyControls: true,
    };
  }

  if (accountType === AccountType.BUSINESS_OWNER) {
    return {
      ...basePermissions,
      aiIntelligence: true,
      pixelOptimization: true,
      crmIntegration: true,
      autoTaggingRules: true,
      advancedAnalytics: true,
      userManagement: true,
      apiAccess: true,
      webhooks: true,
      bulkOperations: true,
      exportData: true,
      // NO admin access for regular business owners
    };
  }

  // Sales rep gets only base permissions
  return basePermissions;
};

export const getAccountTypeLabel = (accountType: AccountType): string => {
  switch (accountType) {
    case AccountType.BUSINESS_OWNER:
      return 'Business Owner';
    case AccountType.SALES_REP:
      return 'Sales Rep';
    case AccountType.PLATFORM_ADMIN:
      return 'Platform Administrator';
    default:
      return 'Unknown';
  }
};

export const getAccountTypeDescription = (accountType: AccountType): string => {
  switch (accountType) {
    case AccountType.BUSINESS_OWNER:
      return 'Full platform access with CRM integrations, pixel optimization, and team management features';
    case AccountType.SALES_REP:
      return 'Individual account focused on lead qualification and personal productivity';
    case AccountType.PLATFORM_ADMIN:
      return 'Complete platform administration with system management, user control, and emergency access';
    default:
      return '';
  }
};

// Mock user data for development
export const createMockUser = (accountType: AccountType): UserAccount => ({
  id: '1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  accountType,
  company: accountType === AccountType.BUSINESS_OWNER ? 'Acme Financial' : undefined,
  phone: '(555) 123-4567',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    timezone: 'America/New_York',
    notifications: {
      email: true,
      sms: false,
      leadAlerts: true,
      systemAlerts: true,
    },
  },
  billing: {
    creditBalance: accountType === AccountType.BUSINESS_OWNER ? 127 : 25,
    subscriptionPlan: accountType === AccountType.BUSINESS_OWNER ? 'professional' : undefined,
    subscriptionStatus: accountType === AccountType.BUSINESS_OWNER ? 'active' : undefined,
    billingPeriod: accountType === AccountType.BUSINESS_OWNER ? 'monthly' : undefined,
  },
  permissions: getDefaultPermissions(accountType),
});