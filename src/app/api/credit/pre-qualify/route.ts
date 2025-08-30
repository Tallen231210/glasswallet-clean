import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { crsApiService } from '@/lib/services/crsApiService';
import { withSecurity } from '@/middleware/security';

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
    const { ssn, zipCode } = body;

    // Basic validation
    if (!ssn || !zipCode) {
      return NextResponse.json(
        { error: 'SSN and ZIP code are required' },
        { status: 400 }
      );
    }

    // Clean SSN
    const cleanSSN = ssn.replace(/\D/g, '');
    if (cleanSSN.length !== 9) {
      return NextResponse.json(
        { error: 'Invalid SSN format' },
        { status: 400 }
      );
    }

    // Validate ZIP code
    if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
      return NextResponse.json(
        { error: 'Invalid ZIP code format' },
        { status: 400 }
      );
    }

    try {
      // Perform pre-qualification check
      const result = await crsApiService.performPreQualification(userId, cleanSSN, zipCode);
      
      return NextResponse.json({
        ...result,
        demoMode: true,
        demoNotice: 'This is demo data for pre-qualification. Uses 0.5 credits.',
        creditsDeducted: 0.5
      });

    } catch (error: any) {
      return NextResponse.json(
        { 
          error: error.message || 'Pre-qualification failed',
          demoMode: true
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Pre-qualification error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        demoMode: true
      },
      { status: 500 }
    );
  }
}

// Apply security middleware
export const POST = withSecurity(handler, {
  requireAuth: true,
  rateLimit: { requests: 20, windowMs: 60000 }, // 20 pre-quals per minute
  logRequests: true
});