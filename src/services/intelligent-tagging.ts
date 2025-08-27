/**
 * Intelligent Tagging System
 * AI-powered automatic lead tagging based on behavioral patterns and characteristics
 * Story 2.6: Enables intelligent lead organization and segmentation
 */

interface TagRule {
  id: string;
  name: string;
  description: string;
  tag: string;
  priority: number;
  conditions: Array<{
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'in' | 'contains' | 'not_in' | 'range';
    value: any;
    weight: number;
  }>;
  confidence: number;
  category: 'quality' | 'behavior' | 'demographics' | 'risk' | 'source' | 'engagement' | 'timing' | 'custom';
  enabled: boolean;
}

interface TagResult {
  tag: string;
  confidence: number;
  reasoning: string;
  category: string;
  priority: number;
  appliedRules: string[];
}

interface TaggingContext {
  leadId: string;
  features: any;
  aiScore?: any;
  anomalyDetection?: any;
  behavioralData?: any;
  historicalPatterns?: any;
}

export class IntelligentTaggingSystem {
  private static instance: IntelligentTaggingSystem;
  private tagRules: Map<string, TagRule> = new Map();

  public static getInstance(): IntelligentTaggingSystem {
    if (!IntelligentTaggingSystem.instance) {
      IntelligentTaggingSystem.instance = new IntelligentTaggingSystem();
      IntelligentTaggingSystem.instance.initializeDefaultTags();
    }
    return IntelligentTaggingSystem.instance;
  }

  /**
   * Generate intelligent tags for a lead
   */
  async generateTags(context: TaggingContext): Promise<TagResult[]> {
    try {
      const enabledRules = Array.from(this.tagRules.values())
        .filter(rule => rule.enabled)
        .sort((a, b) => b.priority - a.priority);

      const tagResults: TagResult[] = [];
      const appliedTags = new Set<string>();

      for (const rule of enabledRules) {
        const evaluation = this.evaluateTagRule(rule, context);
        
        if (evaluation.shouldApply && !appliedTags.has(rule.tag)) {
          tagResults.push({
            tag: rule.tag,
            confidence: evaluation.confidence,
            reasoning: evaluation.reasoning,
            category: rule.category,
            priority: rule.priority,
            appliedRules: [rule.id]
          });
          appliedTags.add(rule.tag);
        }
      }

      // Add AI-driven contextual tags
      const aiTags = await this.generateAIContextualTags(context);
      aiTags.forEach(tag => {
        if (!appliedTags.has(tag.tag)) {
          tagResults.push(tag);
          appliedTags.add(tag.tag);
        }
      });

      // Sort by priority and confidence
      return tagResults.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.confidence - a.confidence;
      });

    } catch (error) {
      console.error('Error generating intelligent tags:', error);
      throw new Error('Failed to generate intelligent tags');
    }
  }

  /**
   * Add or update a tagging rule
   */
  addTagRule(rule: TagRule): void {
    this.tagRules.set(rule.id, rule);
  }

  /**
   * Remove a tagging rule
   */
  removeTagRule(ruleId: string): boolean {
    return this.tagRules.delete(ruleId);
  }

  /**
   * Get all tagging rules
   */
  getAllTagRules(): TagRule[] {
    return Array.from(this.tagRules.values());
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(category: string): TagRule[] {
    return Array.from(this.tagRules.values()).filter(rule => rule.category === category);
  }

  /**
   * Evaluate a single tag rule against context
   */
  private evaluateTagRule(rule: TagRule, context: TaggingContext): {
    shouldApply: boolean;
    confidence: number;
    reasoning: string;
  } {
    let conditionsMet = 0;
    let totalWeight = 0;
    const reasons: string[] = [];

    for (const condition of rule.conditions) {
      const fieldValue = this.extractFieldValue(context, condition.field);
      const conditionMet = this.evaluateCondition(fieldValue, condition.operator, condition.value);
      
      if (conditionMet) {
        conditionsMet++;
        totalWeight += condition.weight;
        reasons.push(`${condition.field} ${condition.operator} ${this.formatValue(condition.value)}`);
      }
    }

    const matchRatio = conditionsMet / rule.conditions.length;
    const shouldApply = matchRatio >= 0.6; // 60% of conditions must be met
    const confidence = shouldApply ? rule.confidence * matchRatio : 0;

    return {
      shouldApply,
      confidence,
      reasoning: shouldApply ? reasons.join(', ') : 'Insufficient conditions met'
    };
  }

  /**
   * Generate AI-driven contextual tags based on patterns and anomalies
   */
  private async generateAIContextualTags(context: TaggingContext): Promise<TagResult[]> {
    const aiTags: TagResult[] = [];

    // Behavioral pattern tags
    if (context.features?.sessionDuration > 900) {
      aiTags.push({
        tag: 'deep_researcher',
        confidence: 0.85,
        reasoning: 'Extended session duration indicates thorough research behavior',
        category: 'behavior',
        priority: 70,
        appliedRules: ['ai_behavioral_analysis']
      });
    }

    if (context.features?.pageViews > 10) {
      aiTags.push({
        tag: 'comparison_shopper',
        confidence: 0.80,
        reasoning: 'High page view count suggests comparison shopping behavior',
        category: 'behavior',
        priority: 65,
        appliedRules: ['ai_behavioral_analysis']
      });
    }

    // Engagement intensity tags
    const engagementScore = this.calculateEngagementScore(context.features);
    if (engagementScore > 0.8) {
      aiTags.push({
        tag: 'highly_engaged',
        confidence: 0.90,
        reasoning: 'Multiple high-engagement indicators detected',
        category: 'engagement',
        priority: 80,
        appliedRules: ['ai_engagement_analysis']
      });
    } else if (engagementScore > 0.6) {
      aiTags.push({
        tag: 'moderately_engaged',
        confidence: 0.75,
        reasoning: 'Good engagement indicators present',
        category: 'engagement',
        priority: 60,
        appliedRules: ['ai_engagement_analysis']
      });
    }

    // Timing-based tags
    if (context.features?.timeOfDay >= 20 || context.features?.timeOfDay <= 6) {
      aiTags.push({
        tag: 'off_hours_visitor',
        confidence: 0.70,
        reasoning: 'Activity during off-business hours',
        category: 'timing',
        priority: 55,
        appliedRules: ['ai_timing_analysis']
      });
    }

    // Quality prediction tags
    if (context.aiScore?.conversionProbability > 0.8) {
      aiTags.push({
        tag: 'ai_predicted_convert',
        confidence: 0.95,
        reasoning: 'AI model predicts high conversion probability',
        category: 'quality',
        priority: 90,
        appliedRules: ['ai_conversion_prediction']
      });
    }

    // Risk assessment tags
    if (context.aiScore?.fraudRiskScore > 0.6) {
      aiTags.push({
        tag: 'elevated_risk',
        confidence: 0.85,
        reasoning: 'AI fraud detection indicates elevated risk',
        category: 'risk',
        priority: 95,
        appliedRules: ['ai_risk_analysis']
      });
    }

    // Decision stage tags
    const decisionStage = this.predictDecisionStage(context.features);
    aiTags.push({
      tag: `decision_stage_${decisionStage}`,
      confidence: 0.75,
      reasoning: `AI analysis suggests ${decisionStage} decision stage`,
      category: 'behavior',
      priority: 70,
      appliedRules: ['ai_decision_stage_analysis']
    });

    return aiTags;
  }

  /**
   * Calculate engagement score based on various factors
   */
  private calculateEngagementScore(features: any): number {
    if (!features) return 0;

    let score = 0;
    let factors = 0;

    // Session duration factor
    if (features.sessionDuration) {
      score += Math.min(features.sessionDuration / 600, 1) * 0.3; // Max 10 minutes = full score
      factors++;
    }

    // Page views factor
    if (features.pageViews) {
      score += Math.min(features.pageViews / 8, 1) * 0.25; // Max 8 pages = full score
      factors++;
    }

    // Form completion quality
    if (features.formFieldsCompleted && features.requiredFieldsCompleted) {
      const completionRatio = features.requiredFieldsCompleted / features.formFieldsCompleted;
      score += completionRatio * 0.25;
      factors++;
    }

    // Form completion time (not too fast, not too slow)
    if (features.formCompletionTime) {
      const optimalRange = features.formCompletionTime >= 60 && features.formCompletionTime <= 300;
      score += optimalRange ? 0.2 : 0;
      factors++;
    }

    return factors > 0 ? score / factors * factors : 0; // Normalize and weight by number of factors
  }

  /**
   * Predict decision making stage based on behavior
   */
  private predictDecisionStage(features: any): string {
    if (!features) return 'unknown';

    if (features.pageViews <= 2) return 'awareness';
    if (features.pageViews <= 5) return 'consideration';
    if (features.sessionDuration > 600 || features.formFieldsCompleted > 8) return 'decision';
    return 'evaluation';
  }

  /**
   * Extract field value using dot notation
   */
  private extractFieldValue(context: TaggingContext, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value: any = context;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Evaluate condition logic
   */
  private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    if (fieldValue === undefined || fieldValue === null) return false;

    switch (operator) {
      case 'gt':
        return Number(fieldValue) > Number(expectedValue);
      case 'gte':
        return Number(fieldValue) >= Number(expectedValue);
      case 'lt':
        return Number(fieldValue) < Number(expectedValue);
      case 'lte':
        return Number(fieldValue) <= Number(expectedValue);
      case 'eq':
        return fieldValue === expectedValue;
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      case 'range':
        if (Array.isArray(expectedValue) && expectedValue.length === 2) {
          const num = Number(fieldValue);
          return num >= expectedValue[0] && num <= expectedValue[1];
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Format value for display in reasoning
   */
  private formatValue(value: any): string {
    if (Array.isArray(value)) {
      return `[${value.join(', ')}]`;
    }
    return String(value);
  }

  /**
   * Initialize default tagging rules
   */
  private initializeDefaultTags(): void {
    // Quality-based tags
    this.addTagRule({
      id: 'excellent-credit',
      name: 'Excellent Credit Score',
      description: 'Leads with credit scores 750+',
      tag: 'excellent_credit',
      priority: 90,
      conditions: [
        {
          field: 'features.creditScore',
          operator: 'gte',
          value: 750,
          weight: 30
        }
      ],
      confidence: 0.95,
      category: 'quality',
      enabled: true
    });

    this.addTagRule({
      id: 'high-income',
      name: 'High Income Bracket',
      description: 'Leads with income $75k+',
      tag: 'high_income',
      priority: 85,
      conditions: [
        {
          field: 'features.income',
          operator: 'gte',
          value: 75000,
          weight: 25
        }
      ],
      confidence: 0.90,
      category: 'demographics',
      enabled: true
    });

    // Source-based tags
    this.addTagRule({
      id: 'organic-traffic',
      name: 'Organic Search Traffic',
      description: 'Leads from organic search channels',
      tag: 'organic_lead',
      priority: 75,
      conditions: [
        {
          field: 'features.sourceChannel',
          operator: 'in',
          value: ['organic_search', 'seo'],
          weight: 20
        }
      ],
      confidence: 0.85,
      category: 'source',
      enabled: true
    });

    this.addTagRule({
      id: 'paid-advertising',
      name: 'Paid Advertising Traffic',
      description: 'Leads from paid advertising channels',
      tag: 'paid_lead',
      priority: 70,
      conditions: [
        {
          field: 'features.sourceChannel',
          operator: 'contains',
          value: 'paid',
          weight: 20
        }
      ],
      confidence: 0.80,
      category: 'source',
      enabled: true
    });

    // Behavioral tags
    this.addTagRule({
      id: 'fast-form-completion',
      name: 'Fast Form Completion',
      description: 'Leads who completed forms very quickly',
      tag: 'fast_completion',
      priority: 60,
      conditions: [
        {
          field: 'features.formCompletionTime',
          operator: 'lt',
          value: 60,
          weight: 15
        }
      ],
      confidence: 0.70,
      category: 'behavior',
      enabled: true
    });

    this.addTagRule({
      id: 'thorough-researcher',
      name: 'Thorough Researcher',
      description: 'Leads with high page views and session time',
      tag: 'thorough_researcher',
      priority: 75,
      conditions: [
        {
          field: 'features.pageViews',
          operator: 'gte',
          value: 8,
          weight: 15
        },
        {
          field: 'features.sessionDuration',
          operator: 'gte',
          value: 600,
          weight: 15
        }
      ],
      confidence: 0.85,
      category: 'behavior',
      enabled: true
    });

    // Risk-based tags
    this.addTagRule({
      id: 'fraud-risk',
      name: 'Fraud Risk Indicator',
      description: 'Leads with elevated fraud risk scores',
      tag: 'fraud_risk',
      priority: 95,
      conditions: [
        {
          field: 'aiScore.fraudRiskScore',
          operator: 'gt',
          value: 0.5,
          weight: 30
        }
      ],
      confidence: 0.90,
      category: 'risk',
      enabled: true
    });

    // Geographic tags
    this.addTagRule({
      id: 'high-value-location',
      name: 'High Value Geographic Location',
      description: 'Leads from high-value geographic areas',
      tag: 'premium_location',
      priority: 65,
      conditions: [
        {
          field: 'features.location.state',
          operator: 'in',
          value: ['CA', 'NY', 'TX', 'FL', 'WA'],
          weight: 10
        }
      ],
      confidence: 0.75,
      category: 'demographics',
      enabled: true
    });

    // Device-based tags
    this.addTagRule({
      id: 'mobile-user',
      name: 'Mobile Device User',
      description: 'Leads using mobile devices',
      tag: 'mobile_user',
      priority: 50,
      conditions: [
        {
          field: 'features.deviceType',
          operator: 'eq',
          value: 'mobile',
          weight: 10
        }
      ],
      confidence: 0.80,
      category: 'behavior',
      enabled: true
    });
  }
}

export const intelligentTaggingSystem = IntelligentTaggingSystem.getInstance();