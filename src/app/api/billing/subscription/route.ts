import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripeService } from '@/lib/services/stripeService';

// GET - Get user's subscription status
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const subscription = stripeService.getUserSubscription(userId);
    const hasActive = stripeService.hasActiveSubscription(userId);
    const daysRemaining = stripeService.getDaysRemainingInPeriod(userId);

    return NextResponse.json({
      subscription,
      hasActiveSubscription: hasActive,
      daysRemainingInPeriod: daysRemaining
    });

  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update subscription
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, email } = body;

    if (action === 'create') {
      // Initialize subscription for demo
      const subscription = stripeService.initializeUserSubscription(userId, email || '');
      
      return NextResponse.json({
        success: true,
        subscription
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Subscription action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel subscription
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const immediately = url.searchParams.get('immediately') === 'true';

    const result = await stripeService.cancelSubscription(userId, immediately);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: immediately 
          ? 'Subscription cancelled immediately' 
          : 'Subscription will cancel at the end of the current period'
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}