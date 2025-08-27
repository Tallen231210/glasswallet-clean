import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { aiIntelligenceService } from '@/services/ai-intelligence';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  if (req.method === 'POST') {
    return handleBatchQualifyLeads(req);
  }

  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
};

async function handleBatchQualifyLeads(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { leads, qualificationRules = {} } = body;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Leads array is required and must not be empty'
          }
        },
        { status: 400 }
      );
    }

    // Validate batch size
    if (leads.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BATCH_SIZE_EXCEEDED',
            message: 'Maximum batch size is 50 leads'
          }
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const results = [];
    const errors = [];

    // Process leads in parallel with concurrency limit
    const concurrencyLimit = 5;
    const chunks = chunkArray(leads, concurrencyLimit);
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (lead, index) => {
        try {
          if (!lead.leadId || !lead.features) {
            throw new Error(`Lead ${index}: leadId and features are required`);
          }

          // Generate lead score
          const leadScore = await aiIntelligenceService.scoreLeadWithAI(lead.leadId, lead.features);
          
          // Detect anomalies
          const anomalyDetection = await aiIntelligenceService.detectAnomalies(lead.leadId, lead.features);
          
          // Auto-qualify
          const qualification = await aiIntelligenceService.autoQualifyLead(leadScore, lead.features);
          
          // Apply custom qualification rules if provided
          const finalQualification = applyCustomQualificationRules(
            qualification,
            leadScore,
            anomalyDetection,
            qualificationRules
          );

          return {
            leadId: lead.leadId,
            success: true,
            qualification: finalQualification,
            score: {
              overall: leadScore.overallScore,
              conversionProbability: leadScore.conversionProbability,
              fraudRiskScore: leadScore.fraudRiskScore,
              recommendedAction: leadScore.recommendedAction
            },
            anomaly: {
              flagged: anomalyDetection.flagged,
              score: anomalyDetection.anomalyScore,
              type: anomalyDetection.anomalyType
            },
            tags: qualification.tags,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          const errorResult = {
            leadId: lead.leadId || `unknown_${index}`,
            success: false,
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              code: 'PROCESSING_ERROR'
            }
          };
          errors.push(errorResult);
          return errorResult;
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    // Separate successful results from errors
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Generate batch summary
    const summary = generateBatchSummary(successful, failed);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        results: successful,
        errors: failed,
        summary,
        batchProcessing: {
          totalLeads: leads.length,
          successful: successful.length,
          failed: failed.length,
          processingTimeMs: processingTime,
          averageProcessingTimeMs: Math.round(processingTime / leads.length),
          concurrencyUsed: concurrencyLimit
        },
        qualificationRules: qualificationRules
      },
      meta: {
        timestamp: new Date().toISOString(),
        batchId: generateBatchId(),
        automationEngine: 'batch_qualification_v2.6'
      }
    });

  } catch (error) {
    console.error('Error in batch qualification:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BATCH_PROCESSING_ERROR',
          message: 'Failed to process batch qualification'
        }
      },
      { status: 500 }
    );
  }
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function applyCustomQualificationRules(
  qualification: any,
  leadScore: any,
  anomalyDetection: any,
  rules: any
): any {
  let modifiedQualification = { ...qualification };

  // Apply minimum score thresholds
  if (rules.minimumScore && leadScore.overallScore < rules.minimumScore) {
    modifiedQualification.qualified = false;
    modifiedQualification.reasoning += ` (Below minimum score threshold of ${rules.minimumScore})`;
  }

  // Apply fraud risk limits
  if (rules.maxFraudRisk && leadScore.fraudRiskScore > rules.maxFraudRisk) {
    modifiedQualification.qualified = false;
    modifiedQualification.manualReviewRequired = true;
    modifiedQualification.reasoning += ` (Fraud risk ${(leadScore.fraudRiskScore * 100).toFixed(1)}% exceeds limit)`;
  }

  // Apply conversion probability requirements
  if (rules.minimumConversionProbability && leadScore.conversionProbability < rules.minimumConversionProbability) {
    modifiedQualification.qualified = false;
    modifiedQualification.reasoning += ` (Conversion probability below ${(rules.minimumConversionProbability * 100).toFixed(1)}% threshold)`;
  }

  // Force manual review for anomalies if strict mode enabled
  if (rules.strictAnomalyReview && anomalyDetection.isAnomalous) {
    modifiedQualification.manualReviewRequired = true;
    modifiedQualification.reasoning += ' (Strict anomaly review enabled)';
  }

  return modifiedQualification;
}

function generateBatchSummary(successful: any[], _failed: any[]) {
  if (successful.length === 0) {
    return {
      qualificationRate: 0,
      averageScore: 0,
      topPerformingTags: [],
      anomalyRate: 0,
      recommendedActions: {}
    };
  }

  const qualified = successful.filter(r => r.qualification.qualified);
  const qualificationRate = (qualified.length / successful.length) * 100;
  
  const totalScore = successful.reduce((sum, r) => sum + r.score.overall, 0);
  const averageScore = Math.round(totalScore / successful.length);
  
  const anomalies = successful.filter(r => r.anomaly.flagged);
  const anomalyRate = (anomalies.length / successful.length) * 100;

  // Aggregate tags
  const tagCounts: { [key: string]: number } = {};
  successful.forEach(r => {
    r.tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topPerformingTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count, percentage: Math.round((count / successful.length) * 100) }));

  // Aggregate recommended actions
  const actionCounts: { [key: string]: number } = {};
  successful.forEach(r => {
    const action = r.score.recommendedAction;
    actionCounts[action] = (actionCounts[action] || 0) + 1;
  });

  return {
    qualificationRate: Math.round(qualificationRate),
    averageScore,
    topPerformingTags,
    anomalyRate: Math.round(anomalyRate),
    recommendedActions: actionCounts,
    qualityDistribution: {
      highQuality: successful.filter(r => r.score.overall >= 80).length,
      mediumQuality: successful.filter(r => r.score.overall >= 60 && r.score.overall < 80).length,
      lowQuality: successful.filter(r => r.score.overall < 60).length
    }
  };
}

function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export const POST = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 10, // Lower rate limit for batch operations
    windowMs: 60000 // 1 minute
  }
});