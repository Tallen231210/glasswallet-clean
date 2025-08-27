import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { aiIntelligenceService } from '@/services/ai-intelligence';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  if (req.method === 'POST') {
    return handlePredictConversion(req);
  }

  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
};

async function handlePredictConversion(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { leadId, features, historicalData } = body;

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

    // Validate required features for advanced prediction
    const requiredFields = ['sourceChannel', 'timeOfDay', 'dayOfWeek', 'formCompletionTime', 'pageViews', 'sessionDuration'];
    for (const field of requiredFields) {
      if (!(field in features)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: `Required feature missing for advanced prediction: ${field}`
            }
          },
          { status: 400 }
        );
      }
    }

    // Generate comprehensive conversion prediction
    const conversionPrediction = await aiIntelligenceService.predictConversionProbability(
      leadId,
      features,
      historicalData
    );

    // Also get the basic ML prediction for comparison
    const mlPrediction = await aiIntelligenceService.runAdvancedMLInference(features);

    return NextResponse.json({
      success: true,
      data: {
        conversionPrediction,
        mlPrediction,
        aiPowered: true,
        analysisDepth: 'advanced',
        recommendation: {
          priority: mlPrediction.conversionProbability > 0.8 ? 'immediate_contact' :
                   mlPrediction.conversionProbability > 0.6 ? 'priority_follow_up' :
                   mlPrediction.conversionProbability > 0.4 ? 'standard_sequence' : 'nurture_campaign',
          confidence: conversionPrediction.timeSeriesAnalysis.conversionProbabilityOverTime
            .find(t => t.timeFrame === '24h')?.confidence || 0.7,
          reasoning: `Based on ${conversionPrediction.behavioralPatterns.decisionMakingStage} stage analysis and ${conversionPrediction.cohortAnalysis.similarLeadConversions}% similar lead conversion rate`
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        leadId,
        modelVersion: '2.6.0',
        analysisType: 'predictive_conversion',
        processingTime: Date.now() - Date.now()
      }
    });

  } catch (error) {
    console.error('Error predicting conversion:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PREDICTION_ERROR',
          message: 'Failed to predict conversion probability'
        }
      },
      { status: 500 }
    );
  }
}

export const POST = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 50,
    windowMs: 60000 // 1 minute
  }
});