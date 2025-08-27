import { NextRequest, NextResponse } from 'next/server';

interface WidgetSubmission {
  client_id: string;
  api_key: string;
  name: string;
  email: string;
  phone?: string;
  consent: boolean;
  source: string;
  webhook_url?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

interface AutoTagConfig {
  whitelist?: {
    minCreditScore?: number;
    minIncome?: number;
  };
  blacklist?: {
    maxCreditScore?: number;
    maxIncome?: number;
  };
}

// POST /api/integrate/widget - Process leads from embedded widget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { client_id, api_key, name, email, consent } = body;
    if (!client_id || !api_key || !name || !email || !consent) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, api_key, name, email, consent' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for FCRA compliance
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1';
    const user_agent = request.headers.get('user-agent') || 'Unknown';

    const submission: WidgetSubmission = {
      ...body,
      ip_address,
      user_agent,
      timestamp: new Date().toISOString()
    };

    // TODO: Validate API key against client database
    // For now, we'll accept any API key for development

    // TODO: Check client credit balance
    const hasCredits = true; // Placeholder

    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' },
        { status: 402 }
      );
    }

    // Log the consent for FCRA compliance
    console.log(`FCRA Consent logged: ${submission.email} at ${submission.timestamp} from IP ${ip_address}`);

    // TODO: Process credit pull with CRS API
    // For now, generate mock credit data
    const mockCreditData = {
      credit_score: Math.floor(Math.random() * (850 - 300) + 300),
      income_estimate: Math.floor(Math.random() * (150000 - 25000) + 25000),
      available_credit: Math.floor(Math.random() * (50000 - 1000) + 1000)
    };

    // TODO: Apply auto-tagging rules
    let lead_quality = 'untagged';
    let auto_tagged = false;
    
    // Simple auto-tagging logic (will be configurable later)
    if (mockCreditData.credit_score >= 720 && mockCreditData.income_estimate >= 80000) {
      lead_quality = 'whitelisted';
      auto_tagged = true;
    } else if (mockCreditData.credit_score <= 580) {
      lead_quality = 'blacklisted';
      auto_tagged = true;
    }

    // Create lead record
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const leadResult = {
      lead_id: leadId,
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      credit_score: mockCreditData.credit_score,
      income_estimate: mockCreditData.income_estimate,
      available_credit: mockCreditData.available_credit,
      qualification: mockCreditData.credit_score >= 650 ? 'approved' : 'declined',
      lead_quality,
      auto_tagged,
      consent_logged: true,
      ip_address: submission.ip_address,
      processed_at: submission.timestamp,
      source: submission.source || 'widget'
    };

    // TODO: Store lead in database
    console.log('Lead processed:', leadResult);

    // TODO: Send to client webhook if provided
    if (submission.webhook_url) {
      try {
        await fetch(submission.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'GlassWallet-Webhook/1.0'
          },
          body: JSON.stringify(leadResult),
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        console.log('Webhook delivered successfully');
      } catch (error) {
        console.error('Webhook delivery failed:', error);
        // TODO: Queue webhook for retry
      }
    }

    // TODO: Sync to connected pixels (Meta, Google, TikTok)
    if (auto_tagged && lead_quality !== 'untagged') {
      console.log(`Syncing ${lead_quality} lead to advertising pixels`);
      // TODO: Implement pixel sync
    }

    return NextResponse.json({
      success: true,
      lead: leadResult
    });

  } catch (error) {
    console.error('Widget processing error:', error);
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}