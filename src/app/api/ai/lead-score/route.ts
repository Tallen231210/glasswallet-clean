import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { aiIntelligenceService } from '@/services/ai-intelligence';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  if (req.method === 'POST') {
    return handleScoreLead(req);
  }

  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
};

async function handleScoreLead(req: NextRequest): Promise<NextResponse> {
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

    // Validate required features
    const requiredFields = ['sourceChannel', 'timeOfDay', 'dayOfWeek', 'formCompletionTime'];
    for (const field of requiredFields) {
      if (!(field in features)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: `Required feature missing: ${field}`
            }
          },
          { status: 400 }
        );
      }
    }

    const leadScore = await aiIntelligenceService.scoreLeadWithAI(leadId, features);

    return NextResponse.json({
      success: true,
      data: {
        leadScore,
        aiPowered: true,
        modelVersion: leadScore.modelVersion
      },
      meta: {
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - Date.now(), // Would calculate actual processing time
        leadId
      }
    });

  } catch (error) {
    console.error('Error scoring lead with AI:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AI_SCORING_ERROR',
          message: 'Failed to generate AI lead score'
        }
      },
      { status: 500 }
    );
  }
}

export const POST = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 100,
    windowMs: 60000 // 1 minute
  }
});