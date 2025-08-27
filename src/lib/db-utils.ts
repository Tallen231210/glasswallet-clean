import { prisma } from './prisma';
import type { User, Lead, CreditTransaction, PixelConnection } from '@/generated/prisma';

/**
 * Database utility functions for GlassWallet
 */

// User Operations
export const userQueries = {
  /**
   * Find user by Clerk user ID
   */
  findByClerkId: async (clerkUserId: string) => {
    return prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        pixelConnections: true,
        _count: {
          select: {
            leads: true,
            creditTransactions: true,
          },
        },
      },
    });
  },

  /**
   * Create new user from Clerk data
   */
  create: async (userData: {
    clerkUserId: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId?: string;
  }) => {
    return prisma.user.create({
      data: userData,
    });
  },

  /**
   * Update user credit balance
   */
  updateCreditBalance: async (userId: string, newBalance: number) => {
    return prisma.user.update({
      where: { id: userId },
      data: { creditBalance: newBalance },
    });
  },
};

// Lead Operations
export const leadQueries = {
  /**
   * Create new lead
   */
  create: async (leadData: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    consentGiven: boolean;
  }) => {
    return prisma.lead.create({
      data: {
        ...leadData,
        dataRetentionDate: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years for FCRA compliance
      },
      include: {
        leadTags: true,
      },
    });
  },

  /**
   * Update lead with credit information
   */
  updateCreditInfo: async (
    leadId: string,
    creditData: {
      creditScore: number;
      incomeEstimate?: number;
      ssnHash?: string;
    }
  ) => {
    return prisma.lead.update({
      where: { id: leadId },
      data: {
        ...creditData,
        processedAt: new Date(),
      },
    });
  },

  /**
   * Get leads for user with filtering
   */
  findByUser: async (
    userId: string,
    options: {
      skip?: number;
      take?: number;
      tagType?: string;
      processed?: boolean;
    } = {}
  ) => {
    const { skip = 0, take = 50, tagType, processed } = options;

    return prisma.lead.findMany({
      where: {
        userId,
        ...(tagType && {
          leadTags: {
            some: { tagType },
          },
        }),
        ...(processed !== undefined && {
          processedAt: processed ? { not: null } : null,
        }),
      },
      include: {
        leadTags: {
          include: {
            rule: {
              select: { ruleName: true },
            },
          },
        },
        creditTransactions: {
          select: { costInCents: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },
};

// Credit Transaction Operations
export const creditTransactionQueries = {
  /**
   * Record credit transaction
   */
  create: async (transactionData: {
    userId: string;
    leadId?: string;
    transactionType: 'pull' | 'purchase' | 'refund';
    costInCents: number;
    creditBalanceBefore: number;
    creditBalanceAfter: number;
    crsTransactionId?: string;
    metadata?: any;
  }) => {
    return prisma.creditTransaction.create({
      data: transactionData,
    });
  },

  /**
   * Get transaction history for user
   */
  findByUser: async (userId: string, skip = 0, take = 50) => {
    return prisma.creditTransaction.findMany({
      where: { userId },
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },
};

// Pixel Connection Operations
export const pixelConnectionQueries = {
  /**
   * Create pixel connection
   */
  create: async (connectionData: {
    userId: string;
    platformType: 'META' | 'GOOGLE_ADS' | 'TIKTOK';
    connectionName: string;
    oauthTokens: any;
    pixelId?: string;
    syncSettings?: any;
  }) => {
    return prisma.pixelConnection.create({
      data: connectionData,
    });
  },

  /**
   * Update sync status
   */
  updateSyncStatus: async (
    connectionId: string,
    syncData: {
      lastSyncStatus: 'success' | 'failed' | 'partial';
      syncStats?: any;
    }
  ) => {
    return prisma.pixelConnection.update({
      where: { id: connectionId },
      data: {
        ...syncData,
        lastSyncAt: new Date(),
      },
    });
  },

  /**
   * Get active pixel connections for user
   */
  findActiveByUser: async (userId: string) => {
    return prisma.pixelConnection.findMany({
      where: {
        userId,
        connectionStatus: 'active',
      },
    });
  },
};

// Lead Tagging Operations
export const leadTagQueries = {
  /**
   * Tag a lead
   */
  create: async (tagData: {
    leadId: string;
    tagType: 'whitelist' | 'blacklist' | 'qualified' | 'unqualified';
    tagReason: string;
    taggedBy?: string;
    ruleId?: string;
  }) => {
    return prisma.leadTag.upsert({
      where: {
        leadId_tagType: {
          leadId: tagData.leadId,
          tagType: tagData.tagType,
        },
      },
      update: {
        tagReason: tagData.tagReason,
        taggedBy: tagData.taggedBy,
        ruleId: tagData.ruleId,
        taggedAt: new Date(),
      },
      create: tagData,
    });
  },

  /**
   * Get leads ready for pixel sync
   */
  findReadyForPixelSync: async (userId: string) => {
    return prisma.leadTag.findMany({
      where: {
        syncedToPixels: false,
        tagType: {
          in: ['whitelist', 'qualified'],
        },
        lead: {
          userId,
        },
      },
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  },
};