import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { intelligentRoutingSystem } from '@/services/intelligent-routing';
import { aiIntelligenceService } from '@/services/ai-intelligence';
import { intelligentTaggingSystem } from '@/services/intelligent-tagging';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  switch (req.method) {
    case 'POST':
      return handleRouteLeadRequest(req);
    case 'GET':
      return handleGetAgents(req);
    case 'PUT':
      return handleUpdateAgentStatus(req);
    default:
      return NextResponse.json(
        { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
        { status: 405 }
      );
  }
};

async function handleRouteLeadRequest(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { 
      leadId, 
      features, 
      priority, 
      preferredContactMethod, 
      timeConstraints,
      includeAIAnalysis = true 
    } = body;

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

    // Build comprehensive routing context
    let routingContext: any = {
      leadId,
      features,
      priority,
      preferredContactMethod,
      timeConstraints: timeConstraints ? {
        ...timeConstraints,
        mustContactBefore: timeConstraints.mustContactBefore ? new Date(timeConstraints.mustContactBefore) : undefined
      } : undefined
    };

    // Enhance context with AI analysis if requested
    if (includeAIAnalysis) {
      try {
        const [aiScore, anomalyDetection, tags] = await Promise.all([
          aiIntelligenceService.scoreLeadWithAI(leadId, features),
          aiIntelligenceService.detectAnomalies(leadId, features),
          intelligentTaggingSystem.generateTags({ leadId, features })
        ]);

        routingContext.aiScore = aiScore;
        routingContext.anomalyDetection = anomalyDetection;
        routingContext.tags = tags.map(t => t.tag);
      } catch (aiError) {
        console.warn('AI analysis failed during routing, proceeding with basic routing:', aiError);
      }
    }

    // Perform intelligent routing
    const routingDecision = await intelligentRoutingSystem.routeLead(routingContext);

    // Generate routing summary
    const routingSummary = {
      agentMatch: {
        name: routingDecision.recommendedAgent.name,
        id: routingDecision.recommendedAgent.id,
        confidence: Math.round(routingDecision.confidence * 100),
        specializations: routingDecision.recommendedAgent.specializations
      },
      responseExpectation: {
        estimatedTime: routingDecision.estimatedResponseTime,
        urgencyLevel: routingDecision.urgencyLevel,
        primaryChannel: routingDecision.followUpStrategy.primaryChannel
      },
      alternatives: routingDecision.alternativeOptions.length,
      aiEnhanced: includeAIAnalysis
    };

    // Log routing decision for analytics
    await logRoutingDecision(leadId, routingDecision, routingContext);

    return NextResponse.json({
      success: true,
      data: {
        routing: {
          recommendedAgent: {
            id: routingDecision.recommendedAgent.id,
            name: routingDecision.recommendedAgent.name,
            email: routingDecision.recommendedAgent.email,
            specializations: routingDecision.recommendedAgent.specializations,
            performance: routingDecision.recommendedAgent.performance
          },
          confidence: routingDecision.confidence,
          reasoning: routingDecision.reasoning,
          urgencyLevel: routingDecision.urgencyLevel,
          estimatedResponseTime: routingDecision.estimatedResponseTime
        },
        followUpStrategy: routingDecision.followUpStrategy,
        alternativeOptions: routingDecision.alternativeOptions.map(alt => ({
          agent: {
            id: alt.agent.id,
            name: alt.agent.name,
            specializations: alt.agent.specializations
          },
          confidence: alt.confidence,
          reasoning: alt.reasoning
        })),
        routingSummary,
        actionItems: generateActionItems(routingDecision, routingContext)
      },
      meta: {
        timestamp: new Date().toISOString(),
        leadId,
        routingEngine: 'intelligent_routing_v2.6',
        processingSteps: includeAIAnalysis ? ['ai_analysis', 'agent_scoring', 'intelligent_matching'] : ['agent_scoring', 'intelligent_matching']
      }
    });

  } catch (error) {
    console.error('Error in intelligent routing:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ROUTING_ERROR',
          message: 'Failed to route lead intelligently'
        }
      },
      { status: 500 }
    );
  }
}

async function handleGetAgents(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const includePerformance = url.searchParams.get('includePerformance') === 'true';

    let agents = intelligentRoutingSystem.getAllAgents();

    // Filter by availability status if specified
    if (status) {
      agents = agents.filter(agent => agent.availability.status === status);
    }

    // Calculate system statistics
    const statistics = {
      totalAgents: intelligentRoutingSystem.getAllAgents().length,
      availableAgents: agents.filter(a => a.availability.status === 'available').length,
      averageWorkload: Math.round(agents.reduce((sum, a) => sum + (a.performance.activeLeads / a.performance.maxLeads), 0) / agents.length * 100),
      totalCapacity: agents.reduce((sum, a) => sum + a.performance.maxLeads, 0),
      currentLoad: agents.reduce((sum, a) => sum + a.performance.activeLeads, 0)
    };

    // Performance metrics if requested
    let performanceMetrics = null;
    if (includePerformance) {
      performanceMetrics = {
        averageConversionRate: Math.round(agents.reduce((sum, a) => sum + a.performance.conversionRate, 0) / agents.length * 100),
        averageResponseTime: Math.round(agents.reduce((sum, a) => sum + a.performance.avgResponseTime, 0) / agents.length),
        averageDealValue: Math.round(agents.reduce((sum, a) => sum + a.performance.avgDealValue, 0) / agents.length),
        averageSatisfactionScore: Math.round(agents.reduce((sum, a) => sum + a.performance.satisfactionScore, 0) / agents.length * 10) / 10
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        agents: agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          email: agent.email,
          specializations: agent.specializations,
          availability: agent.availability,
          performance: includePerformance ? agent.performance : {
            activeLeads: agent.performance.activeLeads,
            maxLeads: agent.performance.maxLeads,
            status: agent.performance.activeLeads >= agent.performance.maxLeads ? 'at_capacity' : 'available'
          },
          skills: agent.skills,
          lastActive: agent.lastActive
        })),
        statistics,
        performanceMetrics
      },
      meta: {
        timestamp: new Date().toISOString(),
        filters: { status },
        includePerformance
      }
    });

  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_AGENTS_ERROR',
          message: 'Failed to fetch agent information'
        }
      },
      { status: 500 }
    );
  }
}

async function handleUpdateAgentStatus(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { agentId, status } = body;

    if (!agentId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Agent ID and status are required'
          }
        },
        { status: 400 }
      );
    }

    const validStatuses = ['available', 'busy', 'offline', 'break'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Status must be one of: ${validStatuses.join(', ')}`
          }
        },
        { status: 400 }
      );
    }

    const updated = intelligentRoutingSystem.updateAgentAvailability(agentId, status);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        agentId,
        newStatus: status,
        updatedAt: new Date().toISOString(),
        message: 'Agent status updated successfully'
      }
    });

  } catch (error) {
    console.error('Error updating agent status:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_STATUS_ERROR',
          message: 'Failed to update agent status'
        }
      },
      { status: 500 }
    );
  }
}

function generateActionItems(routingDecision: any, context: any): Array<{
  action: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  notes?: string;
}> {
  const actionItems = [];

  // Primary contact action
  actionItems.push({
    action: `Contact lead via ${routingDecision.followUpStrategy.primaryChannel}`,
    assignee: routingDecision.recommendedAgent.id,
    priority: routingDecision.urgencyLevel,
    deadline: routingDecision.followUpStrategy.timing,
    notes: routingDecision.reasoning.join('; ')
  });

  // Follow-up actions
  routingDecision.followUpStrategy.fallbackActions.forEach((fallback: string, index: number) => {
    actionItems.push({
      action: fallback,
      assignee: routingDecision.recommendedAgent.id,
      priority: index === 0 ? 'medium' : 'low' as any,
      deadline: index === 0 ? 'if no initial response within 2 hours' : 'as backup plan',
      notes: 'Automated fallback action'
    });
  });

  // Special actions for high-risk leads
  if (context.anomalyDetection?.flagged) {
    actionItems.unshift({
      action: 'Verify lead information and conduct fraud checks',
      assignee: routingDecision.recommendedAgent.id,
      priority: 'urgent',
      deadline: 'before initial contact',
      notes: `Anomaly detected: ${context.anomalyDetection.explanation}`
    });
  }

  return actionItems;
}

async function logRoutingDecision(leadId: string, decision: any, context: any): Promise<void> {
  // In production, this would log to analytics system
  console.log(`Routing decision for lead ${leadId}:`, {
    selectedAgent: decision.recommendedAgent.id,
    confidence: decision.confidence,
    urgency: decision.urgencyLevel,
    aiEnhanced: !!context.aiScore
  });
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

export const PUT = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 50,
    windowMs: 60000 // 1 minute
  }
});