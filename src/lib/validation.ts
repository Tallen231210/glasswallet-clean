import { z } from 'zod';

/**
 * Validation schemas for GlassWallet API endpoints
 */

// Common validation schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const IdSchema = z.object({
  id: z.string().cuid(),
});

// User-related schemas
export const CreateUserSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  organizationId: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  subscriptionPlan: z.enum(['free', 'pro', 'enterprise']).optional(),
});

// Lead-related schemas
export const CreateLeadSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  consentGiven: z.boolean(),
});

export const UpdateLeadCreditSchema = z.object({
  creditScore: z.number().min(300).max(850),
  incomeEstimate: z.number().min(0).max(1000000000), // $10M max in cents
  ssnHash: z.string().optional(),
});

export const LeadFilterSchema = z.object({
  ...PaginationSchema.shape,
  tagType: z.enum(['whitelist', 'blacklist', 'qualified', 'unqualified']).optional(),
  processed: z.coerce.boolean().optional(),
  creditScoreMin: z.coerce.number().min(300).max(850).optional(),
  creditScoreMax: z.coerce.number().min(300).max(850).optional(),
});

// Credit transaction schemas
export const CreateCreditTransactionSchema = z.object({
  leadId: z.string().cuid().optional(),
  transactionType: z.enum(['pull', 'purchase', 'refund']),
  costInCents: z.number(),
  crsTransactionId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const CreditTransactionFilterSchema = z.object({
  ...PaginationSchema.shape,
  transactionType: z.enum(['pull', 'purchase', 'refund']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// Pixel connection schemas
export const CreatePixelConnectionSchema = z.object({
  platformType: z.enum(['META', 'GOOGLE_ADS', 'TIKTOK']),
  connectionName: z.string().min(1).max(100),
  pixelId: z.string().optional(),
  customerId: z.string().optional(), // For Google Ads
  accessToken: z.string().optional(),
  syncSettings: z.object({
    autoSync: z.boolean().default(false),
    syncQualifiedOnly: z.boolean().default(true),
    syncWhitelisted: z.boolean().default(true),
    excludeBlacklisted: z.boolean().default(true),
    minimumCreditScore: z.number().min(300).max(850).optional(),
    syncFrequency: z.enum(['realtime', 'hourly', 'daily']).default('daily'),
  }).optional(),
});

export const UpdatePixelConnectionSchema = z.object({
  connectionName: z.string().min(1).max(100).optional(),
  connectionStatus: z.enum(['active', 'inactive', 'expired', 'error']).optional(),
  syncSettings: z.record(z.string(), z.unknown()).optional(),
});

export const PixelSyncSchema = z.object({
  connectionIds: z.array(z.string().cuid()).min(1),
  leadIds: z.array(z.string().cuid()).min(1),
  syncType: z.enum(['whitelist', 'qualified']),
});

// Lead tagging schemas
export const CreateLeadTagSchema = z.object({
  leadId: z.string().cuid(),
  tagType: z.enum(['whitelist', 'blacklist', 'qualified', 'unqualified']),
  tagReason: z.string().min(1).max(200),
  ruleId: z.string().cuid().optional(),
});

export const BulkTagLeadsSchema = z.object({
  leadIds: z.array(z.string().cuid()).min(1).max(100),
  tagType: z.enum(['whitelist', 'blacklist', 'qualified', 'unqualified']),
  tagReason: z.string().min(1).max(200),
});

// Auto-tagging rule schemas
export const CreateAutoTaggingRuleSchema = z.object({
  ruleName: z.string().min(1).max(100),
  conditions: z.record(z.string(), z.unknown()),
  actions: z.record(z.string(), z.unknown()),
  priority: z.number().min(0).max(100).default(0),
});

export const UpdateAutoTaggingRuleSchema = z.object({
  ruleName: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  actions: z.record(z.string(), z.unknown()).optional(),
  priority: z.number().min(0).max(100).optional(),
});

// Webhook schemas
export const CreateWebhookSchema = z.object({
  webhookUrl: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().min(8).optional(),
});

export const UpdateWebhookSchema = z.object({
  webhookUrl: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
  secret: z.string().min(8).optional(),
});

// API Response schemas
export const ApiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  meta: z.object({
    timestamp: z.string(),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }).optional(),
  }).optional(),
});

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
  meta: z.object({
    timestamp: z.string(),
    requestId: z.string().optional(),
  }),
});

// Type exports for use throughout the application
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadCreditInput = z.infer<typeof UpdateLeadCreditSchema>;
export type LeadFilterInput = z.infer<typeof LeadFilterSchema>;
export type CreateCreditTransactionInput = z.infer<typeof CreateCreditTransactionSchema>;
export type CreditTransactionFilterInput = z.infer<typeof CreditTransactionFilterSchema>;
export type CreatePixelConnectionInput = z.infer<typeof CreatePixelConnectionSchema>;
export type UpdatePixelConnectionInput = z.infer<typeof UpdatePixelConnectionSchema>;
export type PixelSyncInput = z.infer<typeof PixelSyncSchema>;
export type CreateLeadTagInput = z.infer<typeof CreateLeadTagSchema>;
export type BulkTagLeadsInput = z.infer<typeof BulkTagLeadsSchema>;
export type CreateAutoTaggingRuleInput = z.infer<typeof CreateAutoTaggingRuleSchema>;
export type UpdateAutoTaggingRuleInput = z.infer<typeof UpdateAutoTaggingRuleSchema>;
export type CreateWebhookInput = z.infer<typeof CreateWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof UpdateWebhookSchema>;
export type ApiSuccessResponse = z.infer<typeof ApiSuccessSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorSchema>;