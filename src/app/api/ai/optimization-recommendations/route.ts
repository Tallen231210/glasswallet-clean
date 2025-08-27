import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { aiIntelligenceService } from '@/services/ai-intelligence';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  if (req.method === 'GET') {
    return handleGetOptimizationRecommendations(req);
  }

  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
};

async function handleGetOptimizationRecommendations(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const context = url.searchParams.get('context') as 'campaign' | 'pixel' | 'overall' | null;
    const priority = url.searchParams.get('priority') as 'high' | 'medium' | 'low' | null;

    // Default to overall context if not specified
    const recommendationContext = context || 'overall';

    const recommendations = await aiIntelligenceService.generateOptimizationRecommendations(recommendationContext);

    // Filter by priority if specified
    const filteredRecommendations = priority 
      ? recommendations.filter(rec => rec.priority === priority)
      : recommendations;

    // Sort by priority and impact
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sortedRecommendations = filteredRecommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Secondary sort by expected impact
      return (b.expectedImpact.projectedValue - b.expectedImpact.currentValue) - 
             (a.expectedImpact.projectedValue - a.expectedImpact.currentValue);
    });

    return NextResponse.json({
      success: true,
      data: {
        recommendations: sortedRecommendations,
        summary: {
          total: sortedRecommendations.length,
          highPriority: sortedRecommendations.filter(r => r.priority === 'high').length,
          mediumPriority: sortedRecommendations.filter(r => r.priority === 'medium').length,
          lowPriority: sortedRecommendations.filter(r => r.priority === 'low').length,
          averageConfidence: sortedRecommendations.reduce((sum, r) => sum + r.expectedImpact.confidence, 0) / sortedRecommendations.length
        },
        aiPowered: true,
        context: recommendationContext
      },
      meta: {
        timestamp: new Date().toISOString(),
        filters: { context: recommendationContext, priority },
        generated: 'ai_intelligence_service'
      }
    });

  } catch (error) {
    console.error('Error generating optimization recommendations:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'OPTIMIZATION_ERROR',
          message: 'Failed to generate optimization recommendations'
        }
      },
      { status: 500 }
    );
  }
}

export const GET = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 30,
    windowMs: 60000 // 1 minute
  }
});