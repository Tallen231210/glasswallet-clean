import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { aiIntelligenceService } from '@/services/ai-intelligence';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  if (req.method === 'POST') {
    return handleAutoQualifyLead(req);
  }

  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
};

async function handleAutoQualifyLead(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { leadId, features, bypassThresholds = false } = body;

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

    // Step 1: Generate AI lead score
    const leadScore = await aiIntelligenceService.scoreLeadWithAI(leadId, features);

    // Step 2: Run anomaly detection
    const anomalyDetection = await aiIntelligenceService.detectAnomalies(leadId, features);

    // Step 3: Auto-qualify based on AI analysis
    const qualificationResult = await aiIntelligenceService.autoQualifyLead(leadScore, features);

    // Step 4: Generate intelligent routing recommendation
    const routingRecommendation = await aiIntelligenceService.routeLeadIntelligently(
      leadId,
      leadScore,
      features
    );

    // Step 5: Determine final qualification status
    const finalQualificationStatus = determineFinalQualification(
      qualificationResult,
      anomalyDetection,
      leadScore,
      bypassThresholds
    );

    // Step 6: Generate action plan
    const actionPlan = generateActionPlan(
      finalQualificationStatus,
      qualificationResult,
      routingRecommendation,
      anomalyDetection
    );

    return NextResponse.json({
      success: true,
      data: {
        qualification: {
          status: finalQualificationStatus.status,
          confidence: finalQualificationStatus.confidence,
          reasoning: finalQualificationStatus.reasoning,
          qualified: finalQualificationStatus.qualified,
          autoApproved: finalQualificationStatus.autoApproved,
          requiresReview: finalQualificationStatus.requiresReview
        },
        leadScore: {
          overall: leadScore.overallScore,
          conversionProbability: leadScore.conversionProbability,
          recommendedAction: leadScore.recommendedAction,
          predictiveInsights: leadScore.predictiveInsights
        },
        anomalyDetection: {
          flagged: anomalyDetection.flagged,
          riskLevel: anomalyDetection.anomalyScore > 0.7 ? 'high' : 
                    anomalyDetection.anomalyScore > 0.4 ? 'medium' : 'low',
          anomalyType: anomalyDetection.anomalyType,
          explanation: anomalyDetection.explanation
        },
        routing: routingRecommendation.routingDecision,
        actionPlan,
        tags: qualificationResult.tags,
        automationLevel: 'full',
        processingComplete: true
      },
      meta: {
        timestamp: new Date().toISOString(),
        leadId,
        processingSteps: ['scoring', 'anomaly_detection', 'qualification', 'routing', 'action_planning'],
        automationEngine: 'ai_qualification_v2.6',
        bypassedThresholds: bypassThresholds
      }
    });

  } catch (error) {
    console.error('Error auto-qualifying lead:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTO_QUALIFICATION_ERROR',
          message: 'Failed to auto-qualify lead'
        }
      },
      { status: 500 }
    );
  }
}

interface FinalQualificationStatus {
  status: 'qualified' | 'disqualified' | 'requires_review' | 'pending_verification';
  confidence: number;
  reasoning: string;
  qualified: boolean;
  autoApproved: boolean;
  requiresReview: boolean;
}

function determineFinalQualification(
  qualificationResult: any,
  anomalyDetection: any,
  leadScore: any,
  bypassThresholds: boolean
): FinalQualificationStatus {
  // High-risk anomalies always require review
  if (anomalyDetection.flagged && anomalyDetection.anomalyScore > 0.8) {
    return {
      status: 'requires_review',
      confidence: 0.95,
      reasoning: 'High-risk anomaly detected - manual review required',
      qualified: false,
      autoApproved: false,
      requiresReview: true
    };
  }

  // Fraud risk check
  if (leadScore.fraudRiskScore > 0.6) {
    return {
      status: 'pending_verification',
      confidence: 0.85,
      reasoning: 'Elevated fraud risk - verification required',
      qualified: false,
      autoApproved: false,
      requiresReview: true
    };
  }

  // Auto-approve high-quality leads
  if (leadScore.overallScore >= 85 && leadScore.conversionProbability >= 0.8 && !anomalyDetection.flagged) {
    return {
      status: 'qualified',
      confidence: qualificationResult.confidence,
      reasoning: 'High-quality lead with strong conversion indicators',
      qualified: true,
      autoApproved: true,
      requiresReview: false
    };
  }

  // Standard qualification logic
  if (qualificationResult.qualified && !qualificationResult.manualReviewRequired) {
    return {
      status: 'qualified',
      confidence: qualificationResult.confidence,
      reasoning: qualificationResult.reasoning,
      qualified: true,
      autoApproved: !anomalyDetection.isAnomalous,
      requiresReview: anomalyDetection.isAnomalous
    };
  }

  // Manual review required
  if (qualificationResult.manualReviewRequired || bypassThresholds) {
    return {
      status: 'requires_review',
      confidence: qualificationResult.confidence,
      reasoning: 'Lead quality indicators suggest manual review',
      qualified: false,
      autoApproved: false,
      requiresReview: true
    };
  }

  // Disqualified
  return {
    status: 'disqualified',
    confidence: 1 - qualificationResult.confidence,
    reasoning: 'Lead does not meet minimum qualification criteria',
    qualified: false,
    autoApproved: false,
    requiresReview: false
  };
}

function generateActionPlan(
  finalStatus: FinalQualificationStatus,
  _qualificationResult: any,
  routingRecommendation: any,
  anomalyDetection: any
): Array<{ action: string; priority: string; timeline: string; reasoning: string }> {
  const actionPlan = [];

  // Immediate actions based on qualification status
  if (finalStatus.autoApproved) {
    actionPlan.push({
      action: 'Route to sales agent immediately',
      priority: 'urgent',
      timeline: 'within 15 minutes',
      reasoning: 'High-quality auto-approved lead requires immediate attention'
    });

    actionPlan.push({
      action: `Contact via ${routingRecommendation.routingDecision.preferredChannel}`,
      priority: 'high',
      timeline: routingRecommendation.routingDecision.followUpTiming,
      reasoning: 'AI-optimized contact method and timing'
    });
  }

  if (finalStatus.requiresReview) {
    actionPlan.push({
      action: 'Flag for manual review',
      priority: anomalyDetection.flagged ? 'urgent' : 'high',
      timeline: anomalyDetection.flagged ? 'immediate' : 'within 2 hours',
      reasoning: finalStatus.reasoning
    });

    if (anomalyDetection.flagged) {
      actionPlan.push({
        action: 'Conduct fraud verification checks',
        priority: 'urgent',
        timeline: 'immediate',
        reasoning: `${anomalyDetection.anomalyType} anomaly detected`
      });
    }
  }

  if (finalStatus.status === 'disqualified') {
    actionPlan.push({
      action: 'Add to nurture campaign',
      priority: 'low',
      timeline: 'within 24 hours',
      reasoning: 'Maintain engagement with disqualified leads for future opportunities'
    });

    actionPlan.push({
      action: 'Update lead status to disqualified',
      priority: 'medium',
      timeline: 'immediate',
      reasoning: 'Ensure accurate lead tracking and reporting'
    });
  }

  // General follow-up actions
  if (finalStatus.qualified) {
    actionPlan.push({
      action: 'Apply AI-recommended tags',
      priority: 'medium',
      timeline: 'immediate',
      reasoning: 'Enable better lead tracking and future optimization'
    });

    actionPlan.push({
      action: 'Schedule follow-up sequence',
      priority: 'medium',
      timeline: 'within 1 hour',
      reasoning: 'Maintain engagement throughout qualification process'
    });
  }

  return actionPlan;
}

export const POST = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 100,
    windowMs: 60000 // 1 minute
  }
});