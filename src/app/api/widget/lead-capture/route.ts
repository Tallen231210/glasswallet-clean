import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

interface WidgetLeadCaptureRequest {
  widgetId: string;
  leadData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    source: string;
    customFields?: Record<string, any>;
    metadata?: {
      userAgent: string;
      referrer: string;
      ip: string;
      timestamp: string;
    };
  };
}

interface AutoTaggingRule {
  id: string;
  name: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    type: 'add_tags' | 'assign_rep' | 'pixel_sync';
    parameters: Record<string, any>;
  }>;
}

const leadCaptureHandler = withMiddleware(
  async (context, request) => {
    const body = await request.json() as WidgetLeadCaptureRequest;
    const { widgetId, leadData } = body;
    
    if (!widgetId || !leadData?.email) {
      throw new ValidationError('Widget ID and lead email are required');
    }

    // Find widget configuration
    const widget = await prisma.leadWidget.findFirst({
      where: { 
        id: widgetId,
        status: 'active' 
      },
      include: {
        user: true,
        autoTagRules: {
          where: { status: 'active' },
          orderBy: { priority: 'desc' }
        }
      }
    });

    if (!widget) {
      throw new ValidationError('Widget not found or inactive');
    }

    // Create lead record
    const lead = await prisma.lead.create({
      data: {
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        source: `widget:${widget.name}`,
        status: 'new',
        userId: widget.userId,
        customData: leadData.customFields,
        captureMetadata: {
          widgetId,
          userAgent: leadData.metadata?.userAgent,
          referrer: leadData.metadata?.referrer,
          captureIp: leadData.metadata?.ip,
          capturedAt: leadData.metadata?.timestamp
        }
      }
    });

    // Apply auto-tagging rules
    const appliedTags: string[] = [];
    const triggeredRules: string[] = [];
    const pixelSyncRequired = false;

    for (const rule of widget.autoTagRules) {
      const conditions = rule.conditions as any[];
      const actions = rule.actions as any[];
      
      // Evaluate rule conditions
      let ruleMatches = true;
      for (const condition of conditions) {
        const fieldValue = getLeadFieldValue(lead, condition.field);
        const conditionResult = evaluateCondition(fieldValue, condition.operator, condition.value);
        
        if (!conditionResult) {
          ruleMatches = false;
          break;
        }
      }

      if (ruleMatches) {
        triggeredRules.push(rule.id);
        
        // Execute rule actions
        for (const action of actions) {
          if (action.type === 'add_tags' && action.parameters.tags) {
            const tags = Array.isArray(action.parameters.tags) 
              ? action.parameters.tags 
              : [action.parameters.tags];
            
            for (const tagType of tags) {
              if (!appliedTags.includes(tagType)) {
                await prisma.leadTag.create({
                  data: {
                    leadId: lead.id,
                    tagType: tagType as any,
                    tagReason: `Auto-tagged by rule: ${rule.name}`,
                    taggedAt: new Date(),
                    syncedToPixels: false,
                    ruleId: rule.id
                  }
                });
                appliedTags.push(tagType);
              }
            }
          }
        }

        // Update rule execution stats
        await prisma.autoTagRule.update({
          where: { id: rule.id },
          data: {
            totalExecutions: { increment: 1 },
            successfulExecutions: { increment: 1 },
            lastExecuted: new Date()
          }
        });
      }
    }

    // Trigger pixel sync for qualified/whitelist leads
    let pixelSyncResult = null;
    const syncTriggerTags = ['qualified', 'whitelist'];
    const shouldSync = appliedTags.some(tag => syncTriggerTags.includes(tag));

    if (shouldSync) {
      try {
        // Get active pixel connections for this user
        const pixelConnections = await prisma.pixelConnection.findMany({
          where: {
            userId: widget.userId,
            connectionStatus: 'active'
          }
        });

        if (pixelConnections.length > 0) {
          // Import pixel service dynamically to avoid circular dependencies
          const { pixelService } = await import('@/services/pixel');
          
          const syncType = appliedTags.includes('whitelist') ? 'whitelist' : 'qualified';
          pixelSyncResult = await pixelService.syncLeadsToPixels(
            [lead.id],
            pixelConnections.map(conn => conn.id),
            syncType
          );

          // Update tag sync status for successful syncs
          const successfulSyncs = pixelSyncResult.filter((result: any) => result.success);
          if (successfulSyncs.length > 0) {
            await prisma.leadTag.updateMany({
              where: {
                leadId: lead.id,
                tagType: { in: appliedTags as any[] }
              },
              data: {
                syncedToPixels: true,
                pixelSyncAt: new Date()
              }
            });
          }
        }
      } catch (syncError) {
        console.error('Widget lead capture - pixel sync failed:', syncError);
        // Don't fail the entire lead capture if pixel sync fails
      }
    }

    // Update widget stats
    await prisma.leadWidget.update({
      where: { id: widgetId },
      data: {
        totalLeads: { increment: 1 },
        lastLeadCaptured: new Date()
      }
    });

    // Return response (for iframe/JSONP compatibility)
    const response = {
      success: true,
      leadId: lead.id,
      appliedTags,
      triggeredRules,
      pixelSyncPerformed: pixelSyncResult !== null,
      pixelSyncResults: pixelSyncResult,
      message: `Lead captured successfully${appliedTags.length > 0 ? ` with tags: ${appliedTags.join(', ')}` : ''}`
    };

    return NextResponse.json(
      formatSuccessResponse(response, 'Lead captured and processed successfully')
    );
  },
  {
    requireAuth: false, // Widget endpoint should be publicly accessible
    cors: true, // Enable CORS for cross-domain requests
    rateLimit: { requests: 100, windowMs: 60000 } // 100 leads per minute per IP
  }
);

// Helper functions
function getLeadFieldValue(lead: any, fieldName: string): any {
  const fieldMap: Record<string, any> = {
    'firstName': lead.firstName,
    'lastName': lead.lastName,
    'email': lead.email,
    'phone': lead.phone,
    'source': lead.source,
    'customData': lead.customData
  };
  
  return fieldMap[fieldName] || null;
}

function evaluateCondition(fieldValue: any, operator: string, targetValue: any): boolean {
  if (fieldValue === null || fieldValue === undefined) {
    return operator === '!=' || operator === 'not_in';
  }

  const strFieldValue = String(fieldValue).toLowerCase();
  const strTargetValue = String(targetValue).toLowerCase();

  switch (operator) {
    case '=':
      return strFieldValue === strTargetValue;
    case '!=':
      return strFieldValue !== strTargetValue;
    case 'contains':
      return strFieldValue.includes(strTargetValue);
    case 'starts_with':
      return strFieldValue.startsWith(strTargetValue);
    case 'ends_with':
      return strFieldValue.endsWith(strTargetValue);
    case 'in':
      const values = Array.isArray(targetValue) ? targetValue : [targetValue];
      return values.some(v => String(v).toLowerCase() === strFieldValue);
    case 'not_in':
      const notValues = Array.isArray(targetValue) ? targetValue : [targetValue];
      return !notValues.some(v => String(v).toLowerCase() === strFieldValue);
    case 'matches_pattern':
      try {
        const regex = new RegExp(strTargetValue, 'i');
        return regex.test(strFieldValue);
      } catch {
        return false;
      }
    case '>=':
    case '>':
    case '<=':
    case '<':
      const numFieldValue = Number(fieldValue);
      const numTargetValue = Number(targetValue);
      if (isNaN(numFieldValue) || isNaN(numTargetValue)) return false;
      
      switch (operator) {
        case '>=': return numFieldValue >= numTargetValue;
        case '>': return numFieldValue > numTargetValue;
        case '<=': return numFieldValue <= numTargetValue;
        case '<': return numFieldValue < numTargetValue;
      }
      break;
    default:
      return false;
  }
  
  return false;
}

export const POST = leadCaptureHandler;
export const OPTIONS = leadCaptureHandler; // For CORS preflight