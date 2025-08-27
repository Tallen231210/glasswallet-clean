import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { qualificationEngine } from '@/services/qualification-engine';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  switch (req.method) {
    case 'GET':
      return handleGetRules(req);
    case 'POST':
      return handleCreateRule(req);
    case 'PUT':
      return handleUpdateRule(req);
    case 'DELETE':
      return handleDeleteRule(req);
    default:
      return NextResponse.json(
        { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
        { status: 405 }
      );
  }
};

async function handleGetRules(req: NextRequest): Promise<NextResponse> {
  try {
    const rules = qualificationEngine.getAllRules();
    
    // Add statistics
    const enabledRules = rules.filter(r => r.enabled);
    const rulesByPriority = rules.sort((a, b) => b.priority - a.priority);
    
    return NextResponse.json({
      success: true,
      data: {
        rules: rulesByPriority,
        statistics: {
          total: rules.length,
          enabled: enabledRules.length,
          disabled: rules.length - enabledRules.length,
          averagePriority: Math.round(rules.reduce((sum, r) => sum + r.priority, 0) / rules.length),
          ruleTypes: getRuleTypeDistribution(rules)
        },
        engineStatus: 'active'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.6.0'
      }
    });
  } catch (error) {
    console.error('Error fetching qualification rules:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_RULES_ERROR',
          message: 'Failed to fetch qualification rules'
        }
      },
      { status: 500 }
    );
  }
}

async function handleCreateRule(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { rule } = body;

    if (!rule || !rule.id || !rule.name || !rule.conditions || !rule.actions) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Rule must include id, name, conditions, and actions'
          }
        },
        { status: 400 }
      );
    }

    // Validate rule structure
    const validationErrors = validateRule(rule);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Rule validation failed',
            details: validationErrors
          }
        },
        { status: 400 }
      );
    }

    // Check for duplicate ID
    const existingRules = qualificationEngine.getAllRules();
    if (existingRules.some(r => r.id === rule.id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_RULE_ID',
            message: 'Rule with this ID already exists'
          }
        },
        { status: 409 }
      );
    }

    // Add default values
    const fullRule = {
      enabled: true,
      priority: 50,
      ...rule
    };

    qualificationEngine.addRule(fullRule);

    return NextResponse.json({
      success: true,
      data: {
        rule: { ...fullRule, created: new Date(), updated: new Date() },
        message: 'Qualification rule created successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        action: 'rule_created'
      }
    });

  } catch (error) {
    console.error('Error creating qualification rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_RULE_ERROR',
          message: 'Failed to create qualification rule'
        }
      },
      { status: 500 }
    );
  }
}

async function handleUpdateRule(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { ruleId, updates } = body;

    if (!ruleId || !updates) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Rule ID and updates are required'
          }
        },
        { status: 400 }
      );
    }

    const existingRules = qualificationEngine.getAllRules();
    const existingRule = existingRules.find(r => r.id === ruleId);

    if (!existingRule) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RULE_NOT_FOUND',
            message: 'Rule not found'
          }
        },
        { status: 404 }
      );
    }

    // Merge updates with existing rule
    const updatedRule = {
      ...existingRule,
      ...updates,
      id: ruleId, // Prevent ID changes
      updated: new Date()
    };

    // Validate updated rule
    const validationErrors = validateRule(updatedRule);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Updated rule validation failed',
            details: validationErrors
          }
        },
        { status: 400 }
      );
    }

    qualificationEngine.addRule(updatedRule); // This overwrites the existing rule

    return NextResponse.json({
      success: true,
      data: {
        rule: updatedRule,
        message: 'Qualification rule updated successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        action: 'rule_updated'
      }
    });

  } catch (error) {
    console.error('Error updating qualification rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_RULE_ERROR',
          message: 'Failed to update qualification rule'
        }
      },
      { status: 500 }
    );
  }
}

async function handleDeleteRule(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const ruleId = url.searchParams.get('ruleId');

    if (!ruleId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Rule ID is required'
          }
        },
        { status: 400 }
      );
    }

    const deleted = qualificationEngine.removeRule(ruleId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RULE_NOT_FOUND',
            message: 'Rule not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Qualification rule deleted successfully',
        ruleId
      },
      meta: {
        timestamp: new Date().toISOString(),
        action: 'rule_deleted'
      }
    });

  } catch (error) {
    console.error('Error deleting qualification rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_RULE_ERROR',
          message: 'Failed to delete qualification rule'
        }
      },
      { status: 500 }
    );
  }
}

function validateRule(rule: any): string[] {
  const errors: string[] = [];

  // Basic required fields
  if (!rule.id || typeof rule.id !== 'string') {
    errors.push('Rule ID is required and must be a string');
  }

  if (!rule.name || typeof rule.name !== 'string') {
    errors.push('Rule name is required and must be a string');
  }

  if (!Array.isArray(rule.conditions) || rule.conditions.length === 0) {
    errors.push('Rule must have at least one condition');
  }

  if (!Array.isArray(rule.actions) || rule.actions.length === 0) {
    errors.push('Rule must have at least one action');
  }

  // Validate conditions
  if (Array.isArray(rule.conditions)) {
    rule.conditions.forEach((condition: any, index: number) => {
      if (!condition.field || typeof condition.field !== 'string') {
        errors.push(`Condition ${index + 1}: field is required and must be a string`);
      }

      const validOperators = ['gt', 'lt', 'eq', 'gte', 'lte', 'in', 'contains', 'not_in'];
      if (!condition.operator || !validOperators.includes(condition.operator)) {
        errors.push(`Condition ${index + 1}: operator must be one of ${validOperators.join(', ')}`);
      }

      if (condition.value === undefined || condition.value === null) {
        errors.push(`Condition ${index + 1}: value is required`);
      }

      if (typeof condition.weight !== 'number' || condition.weight < 0) {
        errors.push(`Condition ${index + 1}: weight must be a positive number`);
      }
    });
  }

  // Validate actions
  if (Array.isArray(rule.actions)) {
    rule.actions.forEach((action: any, index: number) => {
      const validActionTypes = ['qualify', 'disqualify', 'review', 'tag', 'route', 'score_adjustment'];
      if (!action.type || !validActionTypes.includes(action.type)) {
        errors.push(`Action ${index + 1}: type must be one of ${validActionTypes.join(', ')}`);
      }

      if (!action.reasoning || typeof action.reasoning !== 'string') {
        errors.push(`Action ${index + 1}: reasoning is required and must be a string`);
      }
    });
  }

  // Validate priority
  if (typeof rule.priority !== 'number' || rule.priority < 0 || rule.priority > 100) {
    errors.push('Priority must be a number between 0 and 100');
  }

  return errors;
}

function getRuleTypeDistribution(rules: any[]): { [key: string]: number } {
  const distribution: { [key: string]: number } = {};
  
  rules.forEach(rule => {
    rule.actions.forEach((action: any) => {
      distribution[action.type] = (distribution[action.type] || 0) + 1;
    });
  });

  return distribution;
}

export const GET = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 100,
    windowMs: 60000
  }
});

export const POST = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 20,
    windowMs: 60000
  }
});

export const PUT = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 30,
    windowMs: 60000
  }
});

export const DELETE = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 10,
    windowMs: 60000
  }
});