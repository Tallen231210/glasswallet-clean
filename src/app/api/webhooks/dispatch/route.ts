import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

interface WebhookEvent {
  event: string;
  timestamp: string;
  userId: string;
  data: Record<string, any>;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'paused';
  method: 'POST' | 'PUT' | 'PATCH';
  headers: Record<string, string>;
  retryPolicy: {
    enabled: boolean;
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential' | 'none';
  };
}

// Internal webhook dispatch function (not exposed as API endpoint)
export async function dispatchWebhooks(webhookEvent: WebhookEvent) {
  const { event, timestamp, userId, data } = webhookEvent;
  
  try {
    // Find all active webhooks that subscribe to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        userId,
        status: 'active',
        events: {
          hasSome: [event]
        }
      }
    }) as WebhookEndpoint[];

    if (webhooks.length === 0) {
      console.log(`No active webhooks found for event: ${event}`);
      return { dispatched: 0, results: [] };
    }

    const dispatchPromises = webhooks.map(webhook => 
      dispatchSingleWebhook(webhook, webhookEvent)
    );

    const results = await Promise.allSettled(dispatchPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`Webhook dispatch complete: ${successful}/${webhooks.length} successful for event: ${event}`);
    
    return {
      dispatched: webhooks.length,
      successful,
      failed: webhooks.length - successful,
      results: results.map((result, index) => ({
        webhookId: webhooks[index].id,
        webhookUrl: webhooks[index].url,
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason : null
      }))
    };

  } catch (error) {
    console.error('Webhook dispatch error:', error);
    throw error;
  }
}

async function dispatchSingleWebhook(webhook: WebhookEndpoint, webhookEvent: WebhookEvent) {
  const { event, timestamp, data } = webhookEvent;
  const maxRetries = webhook.retryPolicy.enabled ? webhook.retryPolicy.maxRetries : 1;
  
  const payload = {
    event,
    timestamp,
    data,
    webhook: {
      id: webhook.id,
      attempt: 1
    }
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      payload.webhook.attempt = attempt;
      
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GlassWallet-Webhooks/1.0',
          'X-Webhook-Event': event,
          'X-Webhook-Timestamp': timestamp,
          'X-Webhook-Attempt': attempt.toString(),
          'X-Webhook-Max-Attempts': maxRetries.toString(),
          ...webhook.headers
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      // Log webhook call
      await logWebhookCall(webhook.id, {
        event,
        attempt,
        success: response.ok,
        statusCode: response.status,
        responseTime: Date.now() - Date.parse(timestamp),
        error: response.ok ? null : await response.text().catch(() => 'Unknown error')
      });

      if (response.ok) {
        console.log(`Webhook ${webhook.id} successful on attempt ${attempt}`);
        return { success: true, attempt, statusCode: response.status };
      }

      if (attempt === maxRetries) {
        throw new Error(`HTTP ${response.status}: ${await response.text().catch(() => 'Unknown error')}`);
      }

      // Calculate backoff delay
      const delay = calculateBackoffDelay(attempt, webhook.retryPolicy.backoffStrategy);
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error) {
      await logWebhookCall(webhook.id, {
        event,
        attempt,
        success: false,
        statusCode: 0,
        responseTime: Date.now() - Date.parse(timestamp),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (attempt === maxRetries) {
        console.error(`Webhook ${webhook.id} failed after ${maxRetries} attempts:`, error);
        throw error;
      }

      // Calculate backoff delay for network errors
      const delay = calculateBackoffDelay(attempt, webhook.retryPolicy.backoffStrategy);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function calculateBackoffDelay(attempt: number, strategy: string): number {
  const baseDelay = 1000; // 1 second
  
  switch (strategy) {
    case 'linear':
      return baseDelay * attempt;
    case 'exponential':
      return baseDelay * Math.pow(2, attempt - 1);
    case 'none':
    default:
      return baseDelay;
  }
}

async function logWebhookCall(webhookId: string, callData: {
  event: string;
  attempt: number;
  success: boolean;
  statusCode: number;
  responseTime: number;
  error: string | null;
}) {
  try {
    await prisma.webhookCall.create({
      data: {
        webhookId,
        event: callData.event,
        attempt: callData.attempt,
        success: callData.success,
        statusCode: callData.statusCode,
        responseTime: callData.responseTime,
        error: callData.error,
        timestamp: new Date()
      }
    });

    // Update webhook stats
    await prisma.webhook.update({
      where: { id: webhookId },
      data: {
        totalCalls: { increment: 1 },
        successfulCalls: callData.success ? { increment: 1 } : undefined,
        failedCalls: !callData.success ? { increment: 1 } : undefined,
        lastTriggered: new Date(),
        avgResponseTime: callData.responseTime // This would need proper averaging logic in production
      }
    });
  } catch (error) {
    console.error('Failed to log webhook call:', error);
  }
}

// Webhook event helper functions for different events
export const webhookEvents = {
  // Lead events
  leadCreated: (userId: string, leadData: any) => 
    dispatchWebhooks({
      event: 'lead.created',
      timestamp: new Date().toISOString(),
      userId,
      data: {
        lead: leadData,
        source: leadData.source || 'unknown'
      }
    }),

  leadTagged: (userId: string, leadData: any, tags: string[], ruleId?: string) =>
    dispatchWebhooks({
      event: 'lead.tagged',
      timestamp: new Date().toISOString(),
      userId,
      data: {
        lead: leadData,
        tags,
        ruleId,
        autoTagged: !!ruleId
      }
    }),

  leadWhitelisted: (userId: string, leadData: any) =>
    dispatchWebhooks({
      event: 'lead.tagged.whitelist',
      timestamp: new Date().toISOString(),
      userId,
      data: {
        lead: leadData,
        tag: 'whitelist',
        priority: 'high'
      }
    }),

  leadQualified: (userId: string, leadData: any, creditScore?: number) =>
    dispatchWebhooks({
      event: 'lead.tagged.qualified',
      timestamp: new Date().toISOString(),
      userId,
      data: {
        lead: leadData,
        tag: 'qualified',
        creditScore
      }
    }),

  // Pixel sync events
  pixelSyncStarted: (userId: string, syncData: any) =>
    dispatchWebhooks({
      event: 'pixel.sync.started',
      timestamp: new Date().toISOString(),
      userId,
      data: {
        syncId: syncData.syncId,
        leadIds: syncData.leadIds,
        platforms: syncData.platforms,
        syncType: syncData.syncType
      }
    }),

  pixelSyncCompleted: (userId: string, syncData: any) =>
    dispatchWebhooks({
      event: 'pixel.sync.completed',
      timestamp: new Date().toISOString(),
      userId,
      data: {
        syncId: syncData.syncId,
        leadIds: syncData.leadIds,
        platforms: syncData.platforms,
        successfulPlatforms: syncData.successfulPlatforms,
        failedPlatforms: syncData.failedPlatforms,
        totalSynced: syncData.totalSynced,
        totalFailed: syncData.totalFailed,
        duration: syncData.duration
      }
    }),

  pixelSyncFailed: (userId: string, syncData: any, error: string) =>
    dispatchWebhooks({
      event: 'pixel.sync.failed',
      timestamp: new Date().toISOString(),
      userId,
      data: {
        syncId: syncData.syncId,
        leadIds: syncData.leadIds,
        platforms: syncData.platforms,
        error,
        retryable: syncData.retryable || false
      }
    }),

  // Widget events
  widgetLeadCaptured: (userId: string, widgetData: any, leadData: any) =>
    dispatchWebhooks({
      event: 'widget.lead.captured',
      timestamp: new Date().toISOString(),
      userId,
      data: {
        widget: {
          id: widgetData.widgetId,
          name: widgetData.widgetName
        },
        lead: leadData,
        metadata: widgetData.metadata
      }
    }),

  // Auto-tagging rule events
  ruleExecuted: (userId: string, ruleData: any, leadData: any, actions: any[]) =>
    dispatchWebhooks({
      event: 'rule.executed',
      timestamp: new Date().toISOString(),
      userId,
      data: {
        rule: {
          id: ruleData.ruleId,
          name: ruleData.ruleName,
          priority: ruleData.priority
        },
        lead: leadData,
        actions,
        conditions: ruleData.conditions,
        executionTime: ruleData.executionTime
      }
    })
};

// Test endpoint for webhook dispatch (internal use)
const webhookTestHandler = withMiddleware(
  async (context, request) => {
    const { userId } = context as any;
    const body = await request.json();
    
    const result = await dispatchWebhooks({
      event: body.event || 'test.event',
      timestamp: new Date().toISOString(),
      userId: userId || 'mock-user-id',
      data: body.data || { test: true }
    });

    return NextResponse.json(
      formatSuccessResponse(result, 'Webhook dispatch test completed')
    );
  },
  {
    requireAuth: true,
    rateLimit: { requests: 10, windowMs: 60000 }
  }
);

export const POST = webhookTestHandler;