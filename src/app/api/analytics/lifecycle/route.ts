import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { analyticsService } from '@/services/analytics';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  if (req.method === 'GET') {
    return handleGetLifecycleAnalytics(req);
  }

  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
};

async function handleGetLifecycleAnalytics(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const platforms = url.searchParams.get('platforms')?.split(',');
    const creditScoreMin = url.searchParams.get('creditScoreMin');
    const creditScoreMax = url.searchParams.get('creditScoreMax');
    const qualificationTags = url.searchParams.get('qualificationTags')?.split(',');
    const sources = url.searchParams.get('sources')?.split(',');
    const groupBy = url.searchParams.get('groupBy') as 'day' | 'week' | 'month' | null;

    // Default to last 30 days if no dates provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const query = {
      startDate: startDate ? new Date(startDate) : defaultStartDate,
      endDate: endDate ? new Date(endDate) : defaultEndDate,
      filters: {
        platforms: platforms || [],
        creditScoreRange: (creditScoreMin && creditScoreMax) 
          ? [parseInt(creditScoreMin), parseInt(creditScoreMax)] as [number, number]
          : [300, 850] as [number, number],
        qualificationTags: qualificationTags || [],
        sources: sources || [],
      },
      groupBy: groupBy || 'day'
    };

    const analytics = await analyticsService.getLeadLifecycleAnalytics(query);

    return NextResponse.json({
      success: true,
      data: analytics,
      meta: {
        timestamp: new Date().toISOString(),
        query: {
          period: `${query.startDate.toISOString().split('T')[0]} to ${query.endDate.toISOString().split('T')[0]}`,
          filters: query.filters,
          groupBy: query.groupBy
        }
      }
    });

  } catch (error) {
    console.error('Error fetching lifecycle analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: 'Failed to fetch lifecycle analytics'
        }
      },
      { status: 500 }
    );
  }
}

export const GET = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 60,
    windowMs: 60000 // 1 minute
  }
});