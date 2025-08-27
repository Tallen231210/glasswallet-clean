import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { analyticsService } from '@/services/analytics';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  if (req.method === 'GET') {
    return handleGetRealtimeAnalytics();
  }

  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
};

async function handleGetRealtimeAnalytics(): Promise<NextResponse> {
  try {
    const realtimeAnalytics = await analyticsService.getRealtimeAnalytics();

    return NextResponse.json({
      success: true,
      data: realtimeAnalytics,
      meta: {
        timestamp: new Date().toISOString(),
        refreshInterval: 30000 // Suggest refresh every 30 seconds
      }
    });

  } catch (error) {
    console.error('Error fetching realtime analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: 'Failed to fetch realtime analytics'
        }
      },
      { status: 500 }
    );
  }
}

export const GET = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 120, // Higher rate limit for real-time data
    windowMs: 60000 // 1 minute
  }
});