import { NextRequest, NextResponse } from 'next/server';

interface WebhookPayload {
  client_id: string;
  api_key: string;
  leads: Array<{
    name: string;
    email: string;
    phone?: string;
    consent: boolean;
    source?: string;
    external_id?: string;
    metadata?: Record<string, any>;
  }>;
  webhook_url?: string;
  batch_id?: string;
}

// POST /api/integrate/webhook - External webhook endpoint for batch processing
export async function POST(request: NextRequest) {
  try {
    const body: WebhookPayload = await request.json();
    
    // Validate required fields
    const { client_id, api_key, leads } = body;
    if (!client_id || !api_key || !leads || !Array.isArray(leads)) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, api_key, leads (array)' },
        { status: 400 }
      );
    }

    // Validate each lead
    for (const lead of leads) {
      if (!lead.name || !lead.email || typeof lead.consent !== 'boolean') {
        return NextResponse.json(
          { error: 'Each lead must have: name, email, consent (boolean)' },
          { status: 400 }
        );
      }
    }

    // Get processing info
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1';
    const user_agent = request.headers.get('user-agent') || 'Unknown';
    const batch_id = body.batch_id || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const processed_at = new Date().toISOString();

    // TODO: Validate API key and check credit balance
    const creditsNeeded = leads.length;
    const hasCredits = true; // Placeholder

    if (!hasCredits) {
      return NextResponse.json(
        { 
          error: `Insufficient credits. Need ${creditsNeeded} credits for ${leads.length} leads`,
          code: 'INSUFFICIENT_CREDITS' 
        },
        { status: 402 }
      );
    }

    // Process each lead
    const processedLeads = [];
    const failedLeads = [];

    for (const lead of leads) {
      try {
        // Log FCRA consent
        console.log(`FCRA Consent logged: ${lead.email} at ${processed_at} from IP ${ip_address} (Batch: ${batch_id})`);

        // TODO: Process credit pull with CRS API
        const mockCreditData = {
          credit_score: Math.floor(Math.random() * (850 - 300) + 300),
          income_estimate: Math.floor(Math.random() * (150000 - 25000) + 25000),
          available_credit: Math.floor(Math.random() * (50000 - 1000) + 1000)
        };

        // Auto-tagging logic
        let lead_quality = 'untagged';
        let auto_tagged = false;
        
        if (mockCreditData.credit_score >= 720 && mockCreditData.income_estimate >= 80000) {
          lead_quality = 'whitelisted';
          auto_tagged = true;
        } else if (mockCreditData.credit_score <= 580) {
          lead_quality = 'blacklisted';
          auto_tagged = true;
        }

        const leadResult = {
          lead_id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          external_id: lead.external_id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          credit_score: mockCreditData.credit_score,
          income_estimate: mockCreditData.income_estimate,
          available_credit: mockCreditData.available_credit,
          qualification: mockCreditData.credit_score >= 650 ? 'approved' : 'declined',
          lead_quality,
          auto_tagged,
          consent_logged: true,
          source: lead.source || 'webhook',
          metadata: lead.metadata,
          batch_id,
          processed_at,
          ip_address
        };

        processedLeads.push(leadResult);

        // TODO: Store in database
        console.log('Lead processed:', leadResult.lead_id);

      } catch (error) {
        console.error(`Failed to process lead ${lead.email}:`, error);
        failedLeads.push({
          email: lead.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Prepare response
    const response = {
      success: true,
      batch_id,
      processed_at,
      summary: {
        total_submitted: leads.length,
        successfully_processed: processedLeads.length,
        failed: failedLeads.length,
        credits_used: processedLeads.length
      },
      leads: processedLeads,
      failures: failedLeads.length > 0 ? failedLeads : undefined
    };

    // TODO: Send batch results to client webhook if provided
    if (body.webhook_url && processedLeads.length > 0) {
      try {
        await fetch(body.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'GlassWallet-BatchWebhook/1.0',
            'X-Batch-ID': batch_id
          },
          body: JSON.stringify(response),
          signal: AbortSignal.timeout(30000) // 30 second timeout for batches
        });
        console.log(`Batch webhook delivered: ${batch_id}`);
      } catch (error) {
        console.error(`Batch webhook delivery failed for ${batch_id}:`, error);
        // TODO: Queue batch webhook for retry
      }
    }

    // TODO: Sync qualified leads to pixels
    const qualifiedLeads = processedLeads.filter(lead => lead.auto_tagged);
    if (qualifiedLeads.length > 0) {
      console.log(`Syncing ${qualifiedLeads.length} qualified leads to advertising pixels`);
      // TODO: Implement pixel sync
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'PROCESSING_ERROR' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Batch-ID',
      'Access-Control-Max-Age': '86400',
    },
  });
}