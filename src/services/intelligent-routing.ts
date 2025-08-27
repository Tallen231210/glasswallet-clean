/**
 * Intelligent Lead Routing System
 * AI-powered lead assignment and routing based on agent capabilities and lead characteristics
 * Story 2.6: Optimizes conversion rates through intelligent agent-lead matching
 */

interface Agent {
  id: string;
  name: string;
  email: string;
  specializations: string[];
  performance: {
    conversionRate: number;
    avgResponseTime: number; // minutes
    avgDealValue: number;
    satisfactionScore: number; // 1-5
    activeLeads: number;
    maxLeads: number;
  };
  availability: {
    status: 'available' | 'busy' | 'offline' | 'break';
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
    timezone: string;
  };
  preferences: {
    leadTypes: string[];
    communicationChannels: string[];
    workloadLevel: 'light' | 'moderate' | 'heavy';
  };
  skills: {
    creditSpecialist: boolean;
    highValueDeals: boolean;
    difficultCases: boolean;
    newLeadExpert: boolean;
    closingExpert: boolean;
  };
  created: Date;
  lastActive: Date;
}

interface RoutingDecision {
  recommendedAgent: Agent;
  confidence: number;
  reasoning: string[];
  alternativeOptions: Array<{
    agent: Agent;
    confidence: number;
    reasoning: string;
  }>;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  estimatedResponseTime: number; // minutes
  followUpStrategy: {
    primaryChannel: 'phone' | 'email' | 'sms' | 'video_call';
    timing: string;
    fallbackActions: string[];
  };
}

interface RoutingContext {
  leadId: string;
  features: any;
  aiScore?: any;
  tags?: string[];
  anomalyDetection?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  preferredContactMethod?: string;
  timeConstraints?: {
    mustContactBefore?: Date;
    preferredContactTime?: string;
  };
}

export class IntelligentRoutingSystem {
  private static instance: IntelligentRoutingSystem;
  private agents: Map<string, Agent> = new Map();
  private routingRules: Array<{
    id: string;
    condition: (context: RoutingContext) => boolean;
    agentSelector: (agents: Agent[], context: RoutingContext) => Agent[];
    priority: number;
  }> = [];

  public static getInstance(): IntelligentRoutingSystem {
    if (!IntelligentRoutingSystem.instance) {
      IntelligentRoutingSystem.instance = new IntelligentRoutingSystem();
      IntelligentRoutingSystem.instance.initializeMockAgents();
      IntelligentRoutingSystem.instance.initializeRoutingRules();
    }
    return IntelligentRoutingSystem.instance;
  }

  /**
   * Route lead to optimal agent using AI-powered matching
   */
  async routeLead(context: RoutingContext): Promise<RoutingDecision> {
    try {
      // Get available agents
      const availableAgents = this.getAvailableAgents();
      
      if (availableAgents.length === 0) {
        throw new Error('No agents available for routing');
      }

      // Apply routing rules to filter agents
      const eligibleAgents = this.applyRoutingRules(availableAgents, context);

      // Score and rank agents based on lead characteristics
      const rankedAgents = await this.scoreAgents(eligibleAgents, context);

      // Select the best agent
      const recommendedAgent = rankedAgents[0];
      
      if (!recommendedAgent) {
        throw new Error('No suitable agent found for lead');
      }

      // Generate alternative options
      const alternativeOptions = rankedAgents.slice(1, 4).map(scored => ({
        agent: scored.agent,
        confidence: scored.score,
        reasoning: scored.reasoning
      }));

      // Determine urgency and follow-up strategy
      const urgencyLevel = this.determineUrgencyLevel(context);
      const followUpStrategy = this.generateFollowUpStrategy(context, recommendedAgent.agent);

      return {
        recommendedAgent: recommendedAgent.agent,
        confidence: recommendedAgent.score,
        reasoning: recommendedAgent.reasoningPoints,
        alternativeOptions,
        urgencyLevel,
        estimatedResponseTime: this.calculateEstimatedResponseTime(recommendedAgent.agent, urgencyLevel),
        followUpStrategy
      };

    } catch (error) {
      console.error('Error in intelligent routing:', error);
      throw new Error('Failed to route lead intelligently');
    }
  }

  /**
   * Add or update agent
   */
  addAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Remove agent
   */
  removeAgent(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Update agent availability
   */
  updateAgentAvailability(agentId: string, status: Agent['availability']['status']): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.availability.status = status;
      agent.lastActive = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get available agents based on current status and capacity
   */
  private getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(agent => {
      return agent.availability.status === 'available' && 
             agent.performance.activeLeads < agent.performance.maxLeads &&
             this.isAgentInWorkingHours(agent);
    });
  }

  /**
   * Apply routing rules to filter eligible agents
   */
  private applyRoutingRules(agents: Agent[], context: RoutingContext): Agent[] {
    let eligibleAgents = agents;

    // Apply each routing rule in priority order
    const sortedRules = this.routingRules.sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      if (rule.condition(context)) {
        const filteredAgents = rule.agentSelector(eligibleAgents, context);
        if (filteredAgents.length > 0) {
          eligibleAgents = filteredAgents;
        }
      }
    }

    return eligibleAgents;
  }

  /**
   * Score agents based on lead-agent matching
   */
  private async scoreAgents(agents: Agent[], context: RoutingContext): Promise<Array<{
    agent: Agent;
    score: number;
    reasoning: string;
    reasoningPoints: string[];
  }>> {
    const scoredAgents = agents.map(agent => {
      const score = this.calculateAgentScore(agent, context);
      return {
        agent,
        ...score
      };
    });

    return scoredAgents.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate comprehensive agent score for a specific lead
   */
  private calculateAgentScore(agent: Agent, context: RoutingContext): {
    score: number;
    reasoning: string;
    reasoningPoints: string[];
  } {
    let totalScore = 0;
    const reasoningPoints: string[] = [];

    // Base performance score (40% weight)
    const performanceScore = (
      agent.performance.conversionRate * 0.4 +
      (5 - agent.performance.avgResponseTime / 60) * 0.1 + // Lower response time = higher score
      (agent.performance.avgDealValue / 10000) * 0.2 + // Normalize deal value
      agent.performance.satisfactionScore * 0.1 +
      (1 - agent.performance.activeLeads / agent.performance.maxLeads) * 0.2 // Lower workload = higher score
    ) * 0.4;
    
    totalScore += performanceScore;
    reasoningPoints.push(`Performance score: ${Math.round(performanceScore * 100)}%`);

    // Lead characteristics matching (30% weight)
    let matchingScore = 0;
    
    // Credit score specialization
    if (context.features?.creditScore) {
      if (context.features.creditScore >= 750 && agent.skills.creditSpecialist) {
        matchingScore += 0.15;
        reasoningPoints.push('Matches credit specialist for high credit score lead');
      } else if (context.features.creditScore < 600 && agent.skills.difficultCases) {
        matchingScore += 0.12;
        reasoningPoints.push('Matches difficult cases specialist for challenging credit');
      }
    }

    // High value leads
    if (context.features?.income >= 75000 && agent.skills.highValueDeals) {
      matchingScore += 0.1;
      reasoningPoints.push('Matches high-value deal specialist');
    }

    // Lead tags matching
    if (context.tags) {
      const relevantTags = context.tags.filter(tag => 
        agent.preferences.leadTypes.some(type => 
          tag.toLowerCase().includes(type.toLowerCase())
        )
      );
      if (relevantTags.length > 0) {
        matchingScore += relevantTags.length * 0.05;
        reasoningPoints.push(`Matches ${relevantTags.length} lead type preferences`);
      }
    }

    totalScore += matchingScore * 0.3;

    // AI score integration (20% weight)
    let aiScore = 0;
    if (context.aiScore) {
      // High conversion probability leads go to closing experts
      if (context.aiScore.conversionProbability >= 0.8 && agent.skills.closingExpert) {
        aiScore += 0.15;
        reasoningPoints.push('Closing expert for high-probability conversion');
      }
      
      // New leads go to new lead experts
      if (!context.features?.previousApplications && agent.skills.newLeadExpert) {
        aiScore += 0.1;
        reasoningPoints.push('New lead expert for first-time applicant');
      }
    }
    
    totalScore += aiScore * 0.2;

    // Availability and urgency (10% weight)
    let availabilityScore = 0;
    const urgency = this.determineUrgencyLevel(context);
    
    if (urgency === 'urgent' && agent.performance.avgResponseTime <= 30) {
      availabilityScore += 0.08;
      reasoningPoints.push('Fast responder for urgent lead');
    }
    
    // Prefer agents with lower current workload for high-priority leads
    if ((urgency === 'high' || urgency === 'urgent')) {
      const workloadRatio = agent.performance.activeLeads / agent.performance.maxLeads;
      availabilityScore += (1 - workloadRatio) * 0.05;
      reasoningPoints.push(`Low workload (${Math.round(workloadRatio * 100)}% capacity)`);
    }

    totalScore += availabilityScore * 0.1;

    // Normalize score to 0-1 range
    const finalScore = Math.min(1, Math.max(0, totalScore));
    
    const reasoning = reasoningPoints.length > 0 
      ? reasoningPoints.join('; ')
      : 'Standard agent matching applied';

    return {
      score: finalScore,
      reasoning,
      reasoningPoints
    };
  }

  /**
   * Determine urgency level based on lead characteristics
   */
  private determineUrgencyLevel(context: RoutingContext): 'low' | 'medium' | 'high' | 'urgent' {
    if (context.priority) return context.priority;

    // High AI scores indicate urgent follow-up needed
    if (context.aiScore?.conversionProbability >= 0.9) return 'urgent';
    if (context.aiScore?.conversionProbability >= 0.8) return 'high';
    
    // High-value leads
    if (context.features?.income >= 100000) return 'high';
    
    // Excellent credit scores
    if (context.features?.creditScore >= 800) return 'high';
    
    // Risk factors require urgent attention
    if (context.anomalyDetection?.flagged) return 'urgent';
    
    // Time-sensitive leads
    if (context.timeConstraints?.mustContactBefore) {
      const hoursUntilDeadline = (context.timeConstraints.mustContactBefore.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilDeadline <= 2) return 'urgent';
      if (hoursUntilDeadline <= 6) return 'high';
    }

    // Quality tags suggest higher priority
    if (context.tags?.includes('high_quality') || context.tags?.includes('excellent_credit')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Generate follow-up strategy based on context and agent
   */
  private generateFollowUpStrategy(context: RoutingContext, agent: Agent): RoutingDecision['followUpStrategy'] {
    // Determine primary channel
    let primaryChannel: 'phone' | 'email' | 'sms' | 'video_call' = 'phone';
    
    if (context.preferredContactMethod) {
      primaryChannel = context.preferredContactMethod as any;
    } else if (context.features?.deviceType === 'mobile') {
      primaryChannel = 'sms';
    } else if (context.aiScore?.conversionProbability >= 0.8) {
      primaryChannel = 'phone'; // High-probability leads get phone calls
    }

    // Determine timing
    const urgency = this.determineUrgencyLevel(context);
    let timing = 'within 2 hours';
    
    switch (urgency) {
      case 'urgent':
        timing = 'immediate (within 15 minutes)';
        break;
      case 'high':
        timing = 'within 1 hour';
        break;
      case 'medium':
        timing = 'within 4 hours';
        break;
      case 'low':
        timing = 'within 24 hours';
        break;
    }

    // Generate fallback actions
    const fallbackActions = [
      'Send personalized email if no phone response',
      'Schedule follow-up call for next business day',
      'Add to automated nurture sequence'
    ];

    if (context.anomalyDetection?.flagged) {
      fallbackActions.unshift('Verify lead information before contact');
    }

    return {
      primaryChannel,
      timing,
      fallbackActions
    };
  }

  /**
   * Calculate estimated response time based on agent and urgency
   */
  private calculateEstimatedResponseTime(agent: Agent, urgency: string): number {
    let baseTime = agent.performance.avgResponseTime;
    
    // Adjust based on urgency
    switch (urgency) {
      case 'urgent':
        baseTime = Math.min(baseTime, 15);
        break;
      case 'high':
        baseTime = Math.min(baseTime, 60);
        break;
      case 'medium':
        baseTime = Math.min(baseTime, 120);
        break;
    }

    // Adjust for current workload
    const workloadFactor = agent.performance.activeLeads / agent.performance.maxLeads;
    return Math.round(baseTime * (1 + workloadFactor));
  }

  /**
   * Check if agent is currently in working hours
   */
  private isAgentInWorkingHours(agent: Agent): boolean {
    // For now, assume all agents are available during business hours
    // In production, this would check against the agent's actual schedule
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 9 && currentHour <= 17; // 9 AM - 5 PM
  }

  /**
   * Initialize mock agents for development
   */
  private initializeMockAgents(): void {
    const mockAgents: Agent[] = [
      {
        id: 'agent-1',
        name: 'Sarah Mitchell',
        email: 'sarah@glasswallet.com',
        specializations: ['high_value_deals', 'credit_repair'],
        performance: {
          conversionRate: 0.85,
          avgResponseTime: 12, // minutes
          avgDealValue: 8500,
          satisfactionScore: 4.8,
          activeLeads: 8,
          maxLeads: 15
        },
        availability: {
          status: 'available',
          schedule: [
            { day: 'Monday', startTime: '09:00', endTime: '17:00' },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
            { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
            { day: 'Friday', startTime: '09:00', endTime: '17:00' }
          ],
          timezone: 'America/New_York'
        },
        preferences: {
          leadTypes: ['high_income', 'excellent_credit'],
          communicationChannels: ['phone', 'email'],
          workloadLevel: 'moderate'
        },
        skills: {
          creditSpecialist: true,
          highValueDeals: true,
          difficultCases: false,
          newLeadExpert: false,
          closingExpert: true
        },
        created: new Date(),
        lastActive: new Date()
      },
      {
        id: 'agent-2',
        name: 'Michael Rodriguez',
        email: 'michael@glasswallet.com',
        specializations: ['new_leads', 'digital_marketing'],
        performance: {
          conversionRate: 0.72,
          avgResponseTime: 8,
          avgDealValue: 6200,
          satisfactionScore: 4.6,
          activeLeads: 12,
          maxLeads: 18
        },
        availability: {
          status: 'available',
          schedule: [
            { day: 'Monday', startTime: '08:00', endTime: '16:00' },
            { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
            { day: 'Wednesday', startTime: '08:00', endTime: '16:00' },
            { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
            { day: 'Friday', startTime: '08:00', endTime: '16:00' }
          ],
          timezone: 'America/New_York'
        },
        preferences: {
          leadTypes: ['digital_leads', 'social_media', 'new_applicant'],
          communicationChannels: ['phone', 'sms', 'email'],
          workloadLevel: 'heavy'
        },
        skills: {
          creditSpecialist: false,
          highValueDeals: false,
          difficultCases: false,
          newLeadExpert: true,
          closingExpert: false
        },
        created: new Date(),
        lastActive: new Date()
      },
      {
        id: 'agent-3',
        name: 'Jennifer Chen',
        email: 'jennifer@glasswallet.com',
        specializations: ['difficult_cases', 'credit_challenges'],
        performance: {
          conversionRate: 0.68,
          avgResponseTime: 25,
          avgDealValue: 5800,
          satisfactionScore: 4.9,
          activeLeads: 6,
          maxLeads: 12
        },
        availability: {
          status: 'available',
          schedule: [
            { day: 'Monday', startTime: '10:00', endTime: '18:00' },
            { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
            { day: 'Wednesday', startTime: '10:00', endTime: '18:00' },
            { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
            { day: 'Friday', startTime: '10:00', endTime: '18:00' }
          ],
          timezone: 'America/New_York'
        },
        preferences: {
          leadTypes: ['credit_repair', 'difficult_case', 'low_credit'],
          communicationChannels: ['phone', 'email'],
          workloadLevel: 'light'
        },
        skills: {
          creditSpecialist: true,
          highValueDeals: false,
          difficultCases: true,
          newLeadExpert: false,
          closingExpert: false
        },
        created: new Date(),
        lastActive: new Date()
      }
    ];

    mockAgents.forEach(agent => this.addAgent(agent));
  }

  /**
   * Initialize routing rules
   */
  private initializeRoutingRules(): void {
    // High-priority leads to best performers
    this.routingRules.push({
      id: 'high-priority-to-top-performers',
      condition: (context) => context.priority === 'urgent' || context.priority === 'high',
      agentSelector: (agents, context) => 
        agents.filter(a => a.performance.conversionRate >= 0.8).sort((a, b) => b.performance.conversionRate - a.performance.conversionRate),
      priority: 95
    });

    // Credit specialists for credit-related leads
    this.routingRules.push({
      id: 'credit-specialists',
      condition: (context) => context.features?.creditScore !== undefined,
      agentSelector: (agents, context) => 
        agents.filter(a => a.skills.creditSpecialist),
      priority: 80
    });

    // New lead experts for first-time applicants
    this.routingRules.push({
      id: 'new-lead-experts',
      condition: (context) => !context.features?.previousApplications,
      agentSelector: (agents, context) => 
        agents.filter(a => a.skills.newLeadExpert),
      priority: 75
    });

    // High-value deal specialists
    this.routingRules.push({
      id: 'high-value-specialists',
      condition: (context) => context.features?.income >= 75000,
      agentSelector: (agents, context) => 
        agents.filter(a => a.skills.highValueDeals),
      priority: 85
    });

    // Workload balancing - prefer agents with lower current load
    this.routingRules.push({
      id: 'workload-balancing',
      condition: (context) => true, // Always apply
      agentSelector: (agents, context) => 
        agents.sort((a, b) => (a.performance.activeLeads / a.performance.maxLeads) - (b.performance.activeLeads / b.performance.maxLeads)),
      priority: 50
    });
  }
}

export const intelligentRoutingSystem = IntelligentRoutingSystem.getInstance();