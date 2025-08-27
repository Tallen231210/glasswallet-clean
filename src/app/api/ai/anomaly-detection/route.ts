import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { aiIntelligenceService } from '@/services/ai-intelligence';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  if (req.method === 'POST') {
    return handleDetectAnomalies(req);
  }

  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
};

async function handleDetectAnomalies(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { leadId, features } = body;

    if (!leadId || !features) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Lead ID and features are required'
          }
        },
        { status: 400 }
      );
    }

    const anomalyDetection = await aiIntelligenceService.detectAnomalies(leadId, features);

    return NextResponse.json({
      success: true,
      data: {
        anomalyDetection,
        aiPowered: true,
        securityLevel: anomalyDetection.flagged ? 'high_risk' : 'normal'
      },
      meta: {
        timestamp: new Date().toISOString(),
        leadId,
        alertGenerated: anomalyDetection.flagged
      }
    });

  } catch (error) {
    console.error('Error detecting anomalies:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANOMALY_DETECTION_ERROR',
          message: 'Failed to detect anomalies'
        }
      },
      { status: 500 }
    );
  }
}

export const POST = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 200,
    windowMs: 60000 // 1 minute
  }
});