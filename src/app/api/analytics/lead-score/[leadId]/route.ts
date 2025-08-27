import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { analyticsService } from '@/services/analytics';

interface RouteContext {
  params: Promise<{ leadId: string }>;
}

const handler = async (context: any): Promise<NextResponse> => {
  const { req, params } = context;
  
  if (req.method === 'GET') {
    return handleGetLeadScore(params);
  }

  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
};

async function handleGetLeadScore(params: Promise<{ leadId: string }>): Promise<NextResponse> {
  try {
    const { leadId } = await params;

    if (!leadId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Lead ID is required'
          }
        },
        { status: 400 }
      );
    }

    const leadScore = await analyticsService.calculateLeadScore(leadId);

    return NextResponse.json({
      success: true,
      data: leadScore,
      meta: {
        timestamp: new Date().toISOString(),
        leadId
      }
    });

  } catch (error) {
    console.error('Error calculating lead score:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: 'Failed to calculate lead score'
        }
      },
      { status: 500 }
    );
  }
}

export const GET = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 100,
    windowMs: 60000 // 1 minute
  }
});