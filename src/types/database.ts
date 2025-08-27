// Database-specific types for GlassWallet
import type { User, Lead, CreditTransaction, PixelConnection, LeadTag, AutoTaggingRule, Webhook } from '@/generated/prisma/index.js';

// Re-export Prisma types
export type { User, Lead, CreditTransaction, PixelConnection, LeadTag, AutoTaggingRule, Webhook };

// Extended types with relationships
export type UserWithRelations = User & {
  leads?: Lead[];
  creditTransactions?: CreditTransaction[];
  pixelConnections?: PixelConnection[];
  autoTaggingRules?: AutoTaggingRule[];
  webhooks?: Webhook[];
  _count?: {
    leads: number;
    creditTransactions: number;
    pixelConnections: number;
    autoTaggingRules: number;
    webhooks: number;
  };
};

export type LeadWithTags = Lead & {
  leadTags: (LeadTag & {
    rule?: {
      ruleName: string;
    } | null;
  })[];
  creditTransactions?: {
    costInCents: number;
    createdAt: Date;
  }[];
};

export type PixelConnectionWithStats = PixelConnection & {
  syncStats?: {
    totalLeadsSynced: number;
    lastSyncCount: number;
    successRate: number;
    avgSyncTime: number;
  };
};

export type CreditTransactionWithLead = CreditTransaction & {
  lead?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

// Form data types
export type CreateUserData = {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
};

export type CreateLeadData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  consentGiven: boolean;
};

export type UpdateCreditData = {
  creditScore: number;
  incomeEstimate?: number;
  ssnHash?: string;
};

export type CreatePixelConnectionData = {
  platformType: 'META' | 'GOOGLE_ADS' | 'TIKTOK';
  connectionName: string;
  oauthTokens: Record<string, unknown>;
  pixelId?: string;
  syncSettings?: Record<string, unknown>;
};

export type CreateTagData = {
  leadId: string;
  tagType: 'whitelist' | 'blacklist' | 'qualified' | 'unqualified';
  tagReason: string;
  taggedBy?: string;
  ruleId?: string;
};

// Enums for type safety
export const SubscriptionPlan = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export const TransactionType = {
  PULL: 'pull',
  PURCHASE: 'purchase',
  REFUND: 'refund',
} as const;

export const PlatformType = {
  META: 'META',
  GOOGLE_ADS: 'GOOGLE_ADS',
  TIKTOK: 'TIKTOK',
} as const;

export const TagType = {
  WHITELIST: 'whitelist',
  BLACKLIST: 'blacklist',
  QUALIFIED: 'qualified',
  UNQUALIFIED: 'unqualified',
} as const;

export const ConnectionStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  ERROR: 'error',
} as const;

export const SyncStatus = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PARTIAL: 'partial',
} as const;

// Validation schemas (to be used with Zod later)
export type DatabaseConfig = {
  maxConnections?: number;
  connectionTimeout?: number;
  queryTimeout?: number;
};