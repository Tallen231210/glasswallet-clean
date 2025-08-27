import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const AnalyticsQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
});

interface LeadAnalytics {
  overview: {
    totalLeads: number;
    processedLeads: number;
    unprocessedLeads: number;
    qualifiedLeads: number;
    unqualifiedLeads: number;
    whitelistedLeads: number;
    blacklistedLeads: number;
    averageCreditScore: number | null;
    totalCostSpent: number;
  };
  trends: {
    date: string;
    leadsCreated: number;
    leadsProcessed: number;
    qualifiedLeads: number;
    costSpent: number;
  }[];
  creditScoreDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  tagDistribution: {
    tagType: string;
    count: number;
    percentage: number;
  }[];
  topSources: {
    source: string;
    count: number;
    qualificationRate: number;
  }[];
  recentActivity: {
    date: string;
    action: string;
    leadName: string;
    details: string;
  }[];
}

const getAnalyticsHandler = withMiddleware(
  async (context) => {
    const { validatedData, userId } = context as any;
    const { dateFrom, dateTo, period } = validatedData;

    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Calculate date range based on period if not explicitly provided
    let startDate = dateFrom;
    let endDate = dateTo || new Date();
    
    if (!startDate) {
      const now = new Date();
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    // Build analytics data
    const analytics = await buildLeadAnalytics(user.id, startDate, endDate);

    return NextResponse.json({
      success: true,
      data: analytics,
      meta: {
        timestamp: new Date().toISOString(),
        dateFrom: startDate.toISOString(),
        dateTo: endDate.toISOString(),
        period
      }
    });
  },
  {
    schema: AnalyticsQuerySchema,
    requireAuth: true,
    rateLimit: { requests: 30, windowMs: 60000 }
  }
);

async function buildLeadAnalytics(userId: string, startDate: Date, endDate: Date): Promise<LeadAnalytics> {
  // Overview Statistics
  const totalLeads = await prisma.lead.count({
    where: { userId }
  });

  const processedLeads = await prisma.lead.count({
    where: { userId, processedAt: { not: null } }
  });

  const qualifiedLeads = await prisma.lead.count({
    where: {
      userId,
      leadTags: {
        some: { tagType: 'qualified' }
      }
    }
  });

  const unqualifiedLeads = await prisma.lead.count({
    where: {
      userId,
      leadTags: {
        some: { tagType: 'unqualified' }
      }
    }
  });

  const whitelistedLeads = await prisma.lead.count({
    where: {
      userId,
      leadTags: {
        some: { tagType: 'whitelist' }
      }
    }
  });

  const blacklistedLeads = await prisma.lead.count({
    where: {
      userId,
      leadTags: {
        some: { tagType: 'blacklist' }
      }
    }
  });

  // Average credit score
  const creditScoreAgg = await prisma.lead.aggregate({
    where: {
      userId,
      creditScore: { not: null }
    },
    _avg: {
      creditScore: true
    }
  });

  // Total cost spent
  const totalCostAgg = await prisma.creditTransaction.aggregate({
    where: {
      userId,
      transactionType: 'pull'
    },
    _sum: {
      costInCents: true
    }
  });

  // Trends data - simplified for MVP
  const trends = await generateTrendsData(userId, startDate, endDate);

  // Credit score distribution
  const creditScoreDistribution = await generateCreditScoreDistribution(userId);

  // Tag distribution
  const tagDistribution = await generateTagDistribution(userId);

  // Recent activity (last 10 activities)
  const recentActivity = await generateRecentActivity(userId);

  return {
    overview: {
      totalLeads,
      processedLeads,
      unprocessedLeads: totalLeads - processedLeads,
      qualifiedLeads,
      unqualifiedLeads,
      whitelistedLeads,
      blacklistedLeads,
      averageCreditScore: creditScoreAgg._avg.creditScore ? Math.round(creditScoreAgg._avg.creditScore) : null,
      totalCostSpent: totalCostAgg._sum.costInCents || 0,
    },
    trends,
    creditScoreDistribution,
    tagDistribution,
    topSources: [], // Placeholder - would need lead source tracking
    recentActivity
  };
}

async function generateTrendsData(userId: string, startDate: Date, endDate: Date) {
  // Generate daily aggregates for the date range
  const trends = [];
  const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i <= dayDiff; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    
    const leadsCreated = await prisma.lead.count({
      where: {
        userId,
        createdAt: {
          gte: date,
          lt: nextDate
        }
      }
    });

    const leadsProcessed = await prisma.lead.count({
      where: {
        userId,
        processedAt: { not: null },
        updatedAt: {
          gte: date,
          lt: nextDate
        }
      }
    });

    const qualifiedLeads = await prisma.leadTag.count({
      where: {
        tagType: 'qualified',
        lead: {
          userId,
          updatedAt: {
            gte: date,
            lt: nextDate
          }
        }
      }
    });

    const costAgg = await prisma.creditTransaction.aggregate({
      where: {
        userId,
        transactionType: 'pull',
        createdAt: {
          gte: date,
          lt: nextDate
        }
      },
      _sum: {
        costInCents: true
      }
    });

    trends.push({
      date: date.toISOString().split('T')[0]!,
      leadsCreated,
      leadsProcessed,
      qualifiedLeads,
      costSpent: costAgg._sum.costInCents || 0
    });
  }

  return trends;
}

async function generateCreditScoreDistribution(userId: string) {
  const distribution = [
    { range: '300-549', min: 300, max: 549 },
    { range: '550-649', min: 550, max: 649 },
    { range: '650-719', min: 650, max: 719 },
    { range: '720-799', min: 720, max: 799 },
    { range: '800-850', min: 800, max: 850 },
  ];

  const totalWithCreditScores = await prisma.lead.count({
    where: {
      userId,
      creditScore: { not: null }
    }
  });

  const result = [];
  for (const range of distribution) {
    const count = await prisma.lead.count({
      where: {
        userId,
        creditScore: {
          gte: range.min,
          lte: range.max
        }
      }
    });

    result.push({
      range: range.range,
      count,
      percentage: totalWithCreditScores > 0 ? Math.round((count / totalWithCreditScores) * 100) : 0
    });
  }

  return result;
}

async function generateTagDistribution(userId: string) {
  const tagTypes = ['qualified', 'unqualified', 'whitelist', 'blacklist'];
  const totalTags = await prisma.leadTag.count({
    where: {
      lead: { userId }
    }
  });

  const result = [];
  for (const tagType of tagTypes) {
    const count = await prisma.leadTag.count({
      where: {
        tagType: tagType as any,
        lead: { userId }
      }
    });

    result.push({
      tagType,
      count,
      percentage: totalTags > 0 ? Math.round((count / totalTags) * 100) : 0
    });
  }

  return result.filter(item => item.count > 0);
}

async function generateRecentActivity(userId: string) {
  // Get recent lead creations
  const recentLeads = await prisma.lead.findMany({
    where: { userId },
    orderBy: { id: 'desc' },
    take: 5,
    select: {
      firstName: true,
      lastName: true,
      createdAt: true
    }
  });

  // Get recent tags
  const recentTags = await prisma.leadTag.findMany({
    where: {
      lead: { userId }
    },
    orderBy: { id: 'desc' },
    take: 5,
    include: {
      lead: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // Get recent credit pulls
  const recentPulls = await prisma.creditTransaction.findMany({
    where: {
      userId,
      transactionType: 'pull'
    },
    orderBy: { id: 'desc' },
    take: 5,
    include: {
      lead: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // Combine and sort all activities
  const activities = [
    ...recentLeads.map(lead => ({
      date: lead.createdAt.toISOString(),
      action: 'Lead Created',
      leadName: `${lead.firstName} ${lead.lastName}`,
      details: 'New lead added to database'
    })),
    ...recentTags.map(tag => ({
      date: tag.taggedAt.toISOString(),
      action: 'Tag Applied',
      leadName: `${tag.lead.firstName} ${tag.lead.lastName}`,
      details: `Tagged as ${tag.tagType}`
    })),
    ...recentPulls.map(pull => ({
      date: pull.createdAt.toISOString(),
      action: 'Credit Pull',
      leadName: pull.lead ? `${pull.lead.firstName} ${pull.lead.lastName}` : 'Unknown',
      details: `Cost: $${(pull.costInCents / 100).toFixed(2)}`
    }))
  ];

  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
}

export const GET = getAnalyticsHandler;