import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { intelligentTaggingSystem } from '@/services/intelligent-tagging';
import { aiIntelligenceService } from '@/services/ai-intelligence';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  switch (req.method) {
    case 'POST':
      return handleGenerateTags(req);
    case 'GET':
      return handleGetTagRules(req);
    default:
      return NextResponse.json(
        { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
        { status: 405 }
      );
  }
};

async function handleGenerateTags(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { leadId, features, includeAIAnalysis = true, customContext = {} } = body;

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

    // Build tagging context
    let taggingContext: any = {
      leadId,
      features,
      ...customContext
    };

    // Optionally include AI analysis for more intelligent tagging
    if (includeAIAnalysis) {
      try {
        const [aiScore, anomalyDetection] = await Promise.all([
          aiIntelligenceService.scoreLeadWithAI(leadId, features),
          aiIntelligenceService.detectAnomalies(leadId, features)
        ]);

        taggingContext.aiScore = aiScore;
        taggingContext.anomalyDetection = anomalyDetection;
      } catch (aiError) {
        console.warn('AI analysis failed, proceeding with basic tagging:', aiError);
      }
    }

    // Generate intelligent tags
    const tagResults = await intelligentTaggingSystem.generateTags(taggingContext);

    // Organize results by category
    const tagsByCategory = tagResults.reduce((acc: any, tag) => {
      if (!acc[tag.category]) acc[tag.category] = [];
      acc[tag.category].push(tag);
      return acc;
    }, {});

    // Calculate overall tagging confidence
    const overallConfidence = tagResults.length > 0 
      ? tagResults.reduce((sum, tag) => sum + tag.confidence, 0) / tagResults.length 
      : 0;

    // Generate tagging summary
    const summary = {
      totalTags: tagResults.length,
      highConfidenceTags: tagResults.filter(t => t.confidence >= 0.8).length,
      categoriesRepresented: Object.keys(tagsByCategory).length,
      topCategory: Object.entries(tagsByCategory)
        .sort(([,a], [,b]) => (b as any[]).length - (a as any[]).length)[0]?.[0] || 'none',
      averageConfidence: Math.round(overallConfidence * 100) / 100
    };

    return NextResponse.json({
      success: true,
      data: {
        tags: tagResults,
        tagsByCategory,
        summary,
        recommendations: generateTagRecommendations(tagResults, summary),
        context: {
          leadId,
          aiAnalysisIncluded: includeAIAnalysis,
          processingMethod: 'intelligent_tagging_v2.6'
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        processingTimeMs: 0, // Would be calculated in production
        taggingEngine: 'intelligent_tagging_v2.6'
      }
    });

  } catch (error) {
    console.error('Error generating intelligent tags:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TAG_GENERATION_ERROR',
          message: 'Failed to generate intelligent tags'
        }
      },
      { status: 500 }
    );
  }
}

async function handleGetTagRules(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');

    let rules;
    if (category) {
      rules = intelligentTaggingSystem.getRulesByCategory(category);
    } else {
      rules = intelligentTaggingSystem.getAllTagRules();
    }

    // Generate statistics
    const allRules = intelligentTaggingSystem.getAllTagRules();
    const statistics = {
      totalRules: allRules.length,
      enabledRules: allRules.filter(r => r.enabled).length,
      categoryCounts: allRules.reduce((acc: any, rule) => {
        acc[rule.category] = (acc[rule.category] || 0) + 1;
        return acc;
      }, {}),
      averagePriority: Math.round(allRules.reduce((sum, r) => sum + r.priority, 0) / allRules.length),
      averageConfidence: Math.round(allRules.reduce((sum, r) => sum + r.confidence, 0) / allRules.length * 100) / 100
    };

    return NextResponse.json({
      success: true,
      data: {
        rules,
        statistics,
        availableCategories: [...new Set(allRules.map(r => r.category))],
        filterApplied: category ? { category } : null
      },
      meta: {
        timestamp: new Date().toISOString(),
        rulesVersion: '2.6.0'
      }
    });

  } catch (error) {
    console.error('Error fetching tag rules:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_RULES_ERROR',
          message: 'Failed to fetch tag rules'
        }
      },
      { status: 500 }
    );
  }
}

function generateTagRecommendations(tagResults: any[], summary: any): Array<{
  type: string;
  recommendation: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
}> {
  const recommendations = [];

  // High confidence tags
  if (summary.highConfidenceTags >= 3) {
    recommendations.push({
      type: 'lead_prioritization',
      recommendation: 'Prioritize this lead for immediate follow-up',
      reasoning: `${summary.highConfidenceTags} high-confidence tags indicate strong lead quality`,
      priority: 'high' as const
    });
  }

  // Risk tags
  const riskTags = tagResults.filter(t => t.category === 'risk');
  if (riskTags.length > 0) {
    recommendations.push({
      type: 'risk_mitigation',
      recommendation: 'Conduct additional verification before proceeding',
      reasoning: 'Risk-related tags detected, suggesting need for careful review',
      priority: 'high' as const
    });
  }

  // Quality tags
  const qualityTags = tagResults.filter(t => t.category === 'quality');
  if (qualityTags.length >= 2) {
    recommendations.push({
      type: 'fast_track',
      recommendation: 'Fast-track this lead through qualification process',
      reasoning: 'Multiple quality indicators suggest high conversion potential',
      priority: 'medium' as const
    });
  }

  // Behavioral insights
  const behaviorTags = tagResults.filter(t => t.category === 'behavior');
  if (behaviorTags.some(t => t.tag === 'comparison_shopper')) {
    recommendations.push({
      type: 'sales_approach',
      recommendation: 'Use comparison-focused sales approach with competitive analysis',
      reasoning: 'Behavioral patterns suggest lead is actively comparing options',
      priority: 'medium' as const
    });
  }

  // Engagement optimization
  if (tagResults.some(t => t.tag === 'off_hours_visitor')) {
    recommendations.push({
      type: 'contact_timing',
      recommendation: 'Consider evening or weekend contact windows',
      reasoning: 'Lead shows off-hours activity, may prefer non-traditional contact times',
      priority: 'low' as const
    });
  }

  // Default recommendation if no specific patterns
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'standard_follow_up',
      recommendation: 'Proceed with standard lead nurturing sequence',
      reasoning: 'No specific high-priority patterns detected, follow standard process',
      priority: 'low' as const
    });
  }

  return recommendations;
}

export const POST = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 100,
    windowMs: 60000 // 1 minute
  }
});

export const GET = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 200,
    windowMs: 60000 // 1 minute
  }
});