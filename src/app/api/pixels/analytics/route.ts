import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';

interface PixelAnalyticsData {
  overview: {
    totalConnections: number;
    activeConnections: number;
    totalSyncs: number;
    successfulSyncs: number;
    totalLeadsSynced: number;
    avgSyncTime: number;
  };
  platformBreakdown: {
    platformType: string;
    connections: number;
    syncs: number;
    leadsSynced: number;
    successRate: number;
    avgValue: number;
  }[];
  syncTrends: {
    date: string;
    syncs: number;
    leads: number;
    success_rate: number;
  }[];
  qualityMetrics: {
    qualifiedLeads: number;
    whitelistLeads: number;
    blacklistLeads: number;
    averageCreditScore: number;
    valueDistribution: {
      tier: string;
      count: number;
      value: number;
    }[];
  };
  recentActivity: {
    id: string;
    timestamp: string;
    platformType: string;
    eventType: string;
    leadCount: number;
    status: 'success' | 'failed';
    connectionName: string;
  }[];
}

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  if (req.method === 'GET') {
    return handleGetAnalytics();
  }

  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
};

async function handleGetAnalytics(): Promise<NextResponse> {
  try {
    // In production, this would query the database for actual analytics data
    // For development, return comprehensive mock data
    const analyticsData: PixelAnalyticsData = {
      overview: {
        totalConnections: 3,
        activeConnections: 2,
        totalSyncs: 127,
        successfulSyncs: 121,
        totalLeadsSynced: 2847,
        avgSyncTime: 1.8 // seconds
      },
      platformBreakdown: [
        {
          platformType: 'META',
          connections: 1,
          syncs: 67,
          leadsSynced: 1521,
          successRate: 0.97,
          avgValue: 23.50
        },
        {
          platformType: 'GOOGLE_ADS',
          connections: 1,
          syncs: 43,
          leadsSynced: 982,
          successRate: 0.93,
          avgValue: 31.20
        },
        {
          platformType: 'TIKTOK',
          connections: 1,
          syncs: 17,
          leadsSynced: 344,
          successRate: 0.88,
          avgValue: 18.75
        }
      ],
      syncTrends: generateSyncTrends(),
      qualityMetrics: {
        qualifiedLeads: 1247,
        whitelistLeads: 892,
        blacklistLeads: 123,
        averageCreditScore: 698,
        valueDistribution: [
          { tier: 'High Value (750+)', count: 623, value: 45.30 },
          { tier: 'Medium Value (650-749)', count: 1456, value: 28.90 },
          { tier: 'Standard Value (<650)', count: 768, value: 15.60 }
        ]
      },
      recentActivity: generateRecentActivity()
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
      meta: {
        timestamp: new Date().toISOString(),
        refreshedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching pixel analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: 'Failed to fetch pixel analytics'
        }
      },
      { status: 500 }
    );
  }
}

function generateSyncTrends(): PixelAnalyticsData['syncTrends'] {
  const trends = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0]!,
      syncs: Math.floor(Math.random() * 15) + 3,
      leads: Math.floor(Math.random() * 200) + 50,
      success_rate: 0.85 + Math.random() * 0.14 // 85-99% success rate
    });
  }
  
  return trends;
}

function generateRecentActivity(): PixelAnalyticsData['recentActivity'] {
  const activities = [];
  const platforms = ['META', 'GOOGLE_ADS', 'TIKTOK'];
  const eventTypes = ['sync', 'test_connection', 'batch_upload', 'qualification_update'];
  const connectionNames = ['Meta Primary Pixel', 'Google Ads Campaign 1', 'TikTok Brand Pixel'];
  
  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
    
    activities.push({
      id: `activity_${i + 1}`,
      timestamp: timestamp.toISOString(),
      platformType: platforms[Math.floor(Math.random() * platforms.length)]!,
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)]!,
      leadCount: Math.floor(Math.random() * 150) + 10,
      status: (Math.random() > 0.1 ? 'success' : 'failed') as 'success' | 'failed',
      connectionName: connectionNames[Math.floor(Math.random() * connectionNames.length)]!
    });
  }
  
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const GET = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 30,
    windowMs: 60000 // 1 minute
  }
});