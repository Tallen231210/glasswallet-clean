import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripeService } from '@/lib/services/stripeService';
import { creditService } from '@/lib/services/creditService';

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
    const { packageId, type = 'credits' } = body;

    // Get the origin for redirect URLs
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const successUrl = `${origin}/billing/success`;
    const cancelUrl = `${origin}/billing`;

    if (type === 'subscription') {
      // Handle platform subscription checkout
      const result = await stripeService.createSubscriptionCheckout(
        userId,
        '', // Email would come from Clerk user object
        successUrl,
        cancelUrl
      );

      if (result.success) {
        return NextResponse.json({ 
          checkoutUrl: result.checkoutUrl 
        });
      } else {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
    } else {
      // Handle credit package purchase
      if (!packageId) {
        return NextResponse.json(
          { error: 'Package ID is required' },
          { status: 400 }
        );
      }

      const packageData = creditService.getCreditPackage(packageId);
      if (!packageData) {
        return NextResponse.json(
          { error: 'Invalid package ID' },
          { status: 400 }
        );
      }

      const result = await stripeService.createCreditPackageCheckout(
        userId,
        packageData,
        successUrl + `?package=${packageId}`,
        cancelUrl
      );

      if (result.success) {
        return NextResponse.json({ 
          checkoutUrl: result.checkoutUrl,
          sessionId: result.sessionId 
        });
      } else {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
    }

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}