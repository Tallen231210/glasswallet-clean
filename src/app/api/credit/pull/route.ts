import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { crsApiService, CreditPullRequest } from '@/lib/services/crsApiService';
import { withSecurity } from '@/middleware/security';
import { withPerformance } from '@/middleware/performance';

async function handler(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate request data
    const validation = crsApiService.validateCreditPullRequest(body as CreditPullRequest);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Add DEMO MODE indicator
    const requestWithDemo: CreditPullRequest = {
      ...body,
      permissiblePurpose: body.permissiblePurpose || 'credit_transaction',
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
    };

    // Perform credit pull using mock API
    const result = await crsApiService.performCreditPull(userId, requestWithDemo);

    // Add demo indicator to response
    const response = {
      ...result,
      demoMode: true,
      demoNotice: 'This is demo data. Real credit pulls will be processed when CRS API access is enabled.'
    };

    if (result.success) {
      return NextResponse.json(response, { status: 200 });
    } else {
      return NextResponse.json(response, { status: 400 });
    }

  } catch (error) {
    console.error('Credit pull error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        demoMode: true
      },
      { status: 500 }
    );
  }
}

// Apply security and performance middleware
export const POST = withPerformance(
  withSecurity(handler, {
    requireAuth: true,
    rateLimit: { requests: 10, windowMs: 60000 }, // 10 credit pulls per minute
    validatePII: true,
    logRequests: true
  }),
  { name: 'credit-pull' }
);