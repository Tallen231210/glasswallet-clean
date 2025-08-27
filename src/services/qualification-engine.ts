/**
 * Automated Lead Qualification Engine
 * Advanced rule-based qualification system with AI integration
 * Story 2.6: Provides intelligent, scalable lead qualification automation
 */

interface QualificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: Array<{
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'in' | 'contains' | 'not_in';
    value: any;
    weight: number;
  }>;
  actions: Array<{
    type: 'qualify' | 'disqualify' | 'review' | 'tag' | 'route' | 'score_adjustment';
    value: any;
    reasoning: string;
  }>;
  created: Date;
  updated: Date;
}

interface QualificationContext {
  leadId: string;
  features: any;
  aiScore?: any;
  anomalyDetection?: any;
  historicalData?: any[];
  customFields?: { [key: string]: any };
}

interface QualificationResult {
  qualified: boolean;
  confidence: number;
  score: number;
  reasoning: string[];
  appliedRules: string[];
  suggestedTags: string[];
  routingRecommendation?: string;
  requiredActions: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    deadline: string;
  }>;
}

export class AutomatedQualificationEngine {
  private static instance: AutomatedQualificationEngine;
  private qualificationRules: Map<string, QualificationRule> = new Map();

  public static getInstance(): AutomatedQualificationEngine {
    if (!AutomatedQualificationEngine.instance) {
      AutomatedQualificationEngine.instance = new AutomatedQualificationEngine();
      AutomatedQualificationEngine.instance.initializeDefaultRules();
    }
    return AutomatedQualificationEngine.instance;
  }

  /**
   * Process lead through qualification engine
   */
  async qualifyLead(context: QualificationContext): Promise<QualificationResult> {
    try {
      const enabledRules = Array.from(this.qualificationRules.values())
        .filter(rule => rule.enabled)
        .sort((a, b) => b.priority - a.priority);

      const result: QualificationResult = {
        qualified: false,
        confidence: 0,
        score: 0,
        reasoning: [],
        appliedRules: [],
        suggestedTags: [],
        requiredActions: []
      };

      let totalWeight = 0;
      let weightedScore = 0;

      // Apply each rule
      for (const rule of enabledRules) {
        const ruleResult = await this.evaluateRule(rule, context);
        
        if (ruleResult.matched) {
          result.appliedRules.push(rule.id);
          result.reasoning.push(...ruleResult.reasoning);
          
          totalWeight += ruleResult.weight;
          weightedScore += ruleResult.score * ruleResult.weight;

          // Apply rule actions
          await this.executeRuleActions(rule, ruleResult, result);
        }
      }

      // Calculate final score and qualification
      if (totalWeight > 0) {
        result.score = Math.round(weightedScore / totalWeight);
        result.confidence = Math.min(1, totalWeight / 100); // Normalize confidence
      }

      // Final qualification determination
      result.qualified = this.determineFinalQualification(result, context);

      // Generate required actions
      result.requiredActions = this.generateRequiredActions(result, context);

      return result;
    } catch (error) {
      console.error('Error in qualification engine:', error);
      throw new Error('Failed to qualify lead');
    }
  }

  /**
   * Add or update qualification rule
   */
  addRule(rule: Omit<QualificationRule, 'created' | 'updated'>): void {
    const fullRule: QualificationRule = {
      ...rule,
      created: new Date(),
      updated: new Date()
    };
    this.qualificationRules.set(rule.id, fullRule);
  }

  /**
   * Remove qualification rule
   */
  removeRule(ruleId: string): boolean {
    return this.qualificationRules.delete(ruleId);
  }

  /**
   * Get all rules
   */
  getAllRules(): QualificationRule[] {
    return Array.from(this.qualificationRules.values());
  }

  /**
   * Evaluate a single rule against lead context
   */
  private async evaluateRule(rule: QualificationRule, context: QualificationContext): Promise<{
    matched: boolean;
    score: number;
    weight: number;
    reasoning: string[];
  }> {
    let conditionsMet = 0;
    let totalConditions = rule.conditions.length;
    const reasoning: string[] = [];
    let totalWeight = 0;

    for (const condition of rule.conditions) {
      const fieldValue = this.extractFieldValue(context, condition.field);
      const conditionMet = this.evaluateCondition(fieldValue, condition.operator, condition.value);
      
      if (conditionMet) {
        conditionsMet++;
        totalWeight += condition.weight;
        reasoning.push(`${condition.field} ${condition.operator} ${condition.value}`);
      }
    }

    const matchPercentage = conditionsMet / totalConditions;
    const matched = matchPercentage >= 0.7; // 70% of conditions must be met

    return {
      matched,
      score: matched ? 80 + (matchPercentage - 0.7) * 66.67 : 30, // 80-100 if matched, lower if not
      weight: totalWeight,
      reasoning: matched ? reasoning : []
    };
  }

  /**
   * Execute actions defined in a rule
   */
  private async executeRuleActions(
    rule: QualificationRule, 
    ruleResult: any, 
    result: QualificationResult
  ): Promise<void> {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'qualify':
          // Don't override existing qualification, just note the recommendation
          break;
        
        case 'disqualify':
          result.qualified = false;
          result.reasoning.push(action.reasoning);
          break;
        
        case 'review':
          result.requiredActions.push({
            action: 'Manual review required',
            priority: 'high',
            deadline: 'within 2 hours'
          });
          result.reasoning.push(action.reasoning);
          break;
        
        case 'tag':
          if (Array.isArray(action.value)) {
            result.suggestedTags.push(...action.value);
          } else {
            result.suggestedTags.push(action.value);
          }
          break;
        
        case 'route':
          result.routingRecommendation = action.value;
          break;
        
        case 'score_adjustment':
          result.score += action.value;
          result.reasoning.push(`Score adjusted by ${action.value}: ${action.reasoning}`);
          break;
      }
    }
  }

  /**
   * Extract field value from context using dot notation
   */
  private extractFieldValue(context: QualificationContext, fieldPath: string): any {
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
   * Evaluate a single condition
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
      default:
        return false;
    }
  }

  /**
   * Make final qualification determination
   */
  private determineFinalQualification(result: QualificationResult, context: QualificationContext): boolean {
    // If explicitly disqualified by any rule, respect that
    if (result.reasoning.some(r => r.includes('disqualified'))) {
      return false;
    }

    // High-confidence, high-score leads are qualified
    if (result.score >= 75 && result.confidence >= 0.8) {
      return true;
    }

    // Use AI score if available for borderline cases
    if (context.aiScore && result.score >= 60) {
      return context.aiScore.conversionProbability >= 0.6;
    }

    // Default qualification threshold
    return result.score >= 70;
  }

  /**
   * Generate required actions based on qualification result
   */
  private generateRequiredActions(result: QualificationResult, context: QualificationContext): Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    deadline: string;
  }> {
    const actions = [...result.requiredActions]; // Copy existing actions

    if (result.qualified) {
      actions.push({
        action: 'Route to sales team',
        priority: result.score >= 85 ? 'urgent' : 'high',
        deadline: result.score >= 85 ? 'within 15 minutes' : 'within 2 hours'
      });

      actions.push({
        action: 'Apply suggested tags',
        priority: 'medium',
        deadline: 'within 1 hour'
      });
    } else if (result.score >= 50) {
      actions.push({
        action: 'Add to nurture campaign',
        priority: 'medium',
        deadline: 'within 24 hours'
      });
    } else {
      actions.push({
        action: 'Update lead status to disqualified',
        priority: 'low',
        deadline: 'within 24 hours'
      });
    }

    return actions;
  }

  /**
   * Initialize default qualification rules
   */
  private initializeDefaultRules(): void {
    // High Credit Score Rule
    this.addRule({
      id: 'high-credit-score',
      name: 'High Credit Score Qualification',
      description: 'Qualify leads with excellent credit scores',
      enabled: true,
      priority: 90,
      conditions: [
        {
          field: 'features.creditScore',
          operator: 'gte',
          value: 750,
          weight: 30
        }
      ],
      actions: [
        {
          type: 'qualify',
          value: true,
          reasoning: 'Excellent credit score indicates high qualification likelihood'
        },
        {
          type: 'tag',
          value: ['excellent_credit', 'high_priority'],
          reasoning: 'Credit score based tagging'
        },
        {
          type: 'score_adjustment',
          value: 15,
          reasoning: 'Bonus for excellent credit score'
        }
      ]
    });

    // High Income Rule
    this.addRule({
      id: 'high-income',
      name: 'High Income Qualification',
      description: 'Qualify leads with high income levels',
      enabled: true,
      priority: 85,
      conditions: [
        {
          field: 'features.income',
          operator: 'gte',
          value: 75000,
          weight: 25
        }
      ],
      actions: [
        {
          type: 'tag',
          value: ['high_income'],
          reasoning: 'Income-based qualification'
        },
        {
          type: 'score_adjustment',
          value: 10,
          reasoning: 'Bonus for high income'
        }
      ]
    });

    // Fraud Risk Rule
    this.addRule({
      id: 'fraud-risk-check',
      name: 'Fraud Risk Disqualification',
      description: 'Disqualify high fraud risk leads',
      enabled: true,
      priority: 95,
      conditions: [
        {
          field: 'aiScore.fraudRiskScore',
          operator: 'gt',
          value: 0.7,
          weight: 40
        }
      ],
      actions: [
        {
          type: 'disqualify',
          value: true,
          reasoning: 'High fraud risk detected'
        },
        {
          type: 'review',
          value: true,
          reasoning: 'Manual review required for fraud risk'
        },
        {
          type: 'tag',
          value: ['fraud_risk', 'requires_verification'],
          reasoning: 'Risk-based tagging'
        }
      ]
    });

    // Quality Source Rule
    this.addRule({
      id: 'quality-source',
      name: 'Quality Traffic Source',
      description: 'Boost qualification for high-quality traffic sources',
      enabled: true,
      priority: 70,
      conditions: [
        {
          field: 'features.sourceChannel',
          operator: 'in',
          value: ['organic_search', 'referral', 'direct'],
          weight: 20
        }
      ],
      actions: [
        {
          type: 'tag',
          value: ['quality_source'],
          reasoning: 'High-quality traffic source'
        },
        {
          type: 'score_adjustment',
          value: 8,
          reasoning: 'Bonus for quality source'
        }
      ]
    });

    // Fast Form Completion (Potential Bot)
    this.addRule({
      id: 'fast-form-completion',
      name: 'Suspicious Form Completion Speed',
      description: 'Flag leads with unusually fast form completion',
      enabled: true,
      priority: 88,
      conditions: [
        {
          field: 'features.formCompletionTime',
          operator: 'lt',
          value: 30,
          weight: 35
        }
      ],
      actions: [
        {
          type: 'review',
          value: true,
          reasoning: 'Unusually fast form completion - potential bot activity'
        },
        {
          type: 'tag',
          value: ['fast_completion', 'requires_verification'],
          reasoning: 'Flagged for completion speed'
        }
      ]
    });
  }
}

export const qualificationEngine = AutomatedQualificationEngine.getInstance();