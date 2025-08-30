// Stripe service for handling billing and payments
// Note: This is a demo implementation. In production, you'd integrate with actual Stripe SDK

import { CreditPackage, SubscriptionInfo, CreditTransaction } from '@/types/billing';
import { creditService } from './creditService';

export interface StripeCheckoutSession {
  id: string;
  url: string;
  success_url: string;
  cancel_url: string;
  customer_email?: string;
}

export interface StripeSubscription {
  id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

export interface StripePaymentIntent {
  id: string;
  status: 'succeeded' | 'requires_payment_method' | 'requires_confirmation' | 'failed';
  amount: number;
  currency: string;
  customer: string;
}

class StripeServiceDemo {
  private readonly publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo';
  private readonly secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_demo';
  
  // Mock subscription data
  private subscriptions = new Map<string, SubscriptionInfo>();
  
  // Initialize user with active subscription (demo)
  initializeUserSubscription(userId: string, email: string): SubscriptionInfo {
    if (!this.subscriptions.has(userId)) {
      const subscription: SubscriptionInfo = {
        id: `sub_${Date.now()}`,
        userId,
        stripeSubscriptionId: `sub_stripe_${Math.random().toString(36).substr(2, 9)}`,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        cancelAtPeriodEnd: false,
        amount: 199, // $199/month
        currency: 'usd'
      };
      this.subscriptions.set(userId, subscription);
    }
    return this.subscriptions.get(userId)!;
  }

  // Get user's subscription status
  getUserSubscription(userId: string): SubscriptionInfo | null {
    return this.subscriptions.get(userId) || null;
  }

  // Create checkout session for platform subscription
  async createSubscriptionCheckout(
    userId: string, 
    email: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
    try {
      // In production, this would call Stripe API
      // For demo, we'll simulate the checkout process
      
      const sessionId = `cs_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate successful checkout session creation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Initialize subscription immediately for demo
      this.initializeUserSubscription(userId, email);
      
      return {
        success: true,
        checkoutUrl: `${successUrl}?session_id=${sessionId}`
      };
    } catch (error) {
      console.error('Stripe subscription checkout error:', error);
      return {
        success: false,
        error: 'Failed to create checkout session'
      };
    }
  }

  // Create checkout session for credit package purchase
  async createCreditPackageCheckout(
    userId: string,
    packageData: CreditPackage,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ success: boolean; checkoutUrl?: string; sessionId?: string; error?: string }> {
    try {
      // In production, this would call Stripe API
      const sessionId = `cs_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful payment and add credits
      const result = creditService.addCredits(
        userId,
        packageData.totalCredits,
        packageData.id,
        packageData.price,
        `pi_${Math.random().toString(36).substr(2, 9)}` // Mock payment intent ID
      );
      
      if (result.success) {
        return {
          success: true,
          checkoutUrl: `${successUrl}?session_id=${sessionId}&package=${packageData.id}`,
          sessionId
        };
      } else {
        return {
          success: false,
          error: 'Failed to process credit purchase'
        };
      }
    } catch (error) {
      console.error('Stripe credit checkout error:', error);
      return {
        success: false,
        error: 'Failed to create checkout session'
      };
    }
  }

  // Process webhook events (in production, this would verify webhook signatures)
  async processWebhookEvent(event: any): Promise<{ success: boolean; message: string }> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handleCheckoutCompleted(event.data.object);
        
        case 'invoice.payment_succeeded':
          return await this.handlePaymentSucceeded(event.data.object);
        
        case 'invoice.payment_failed':
          return await this.handlePaymentFailed(event.data.object);
        
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event.data.object);
        
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event.data.object);
        
        default:
          return { success: true, message: `Unhandled event type: ${event.type}` };
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      return { success: false, message: 'Webhook processing failed' };
    }
  }

  private async handleCheckoutCompleted(session: any): Promise<{ success: boolean; message: string }> {
    // Handle successful checkout completion
    console.log('Checkout completed:', session.id);
    return { success: true, message: 'Checkout completed successfully' };
  }

  private async handlePaymentSucceeded(invoice: any): Promise<{ success: boolean; message: string }> {
    // Handle successful payment
    console.log('Payment succeeded:', invoice.id);
    return { success: true, message: 'Payment processed successfully' };
  }

  private async handlePaymentFailed(invoice: any): Promise<{ success: boolean; message: string }> {
    // Handle failed payment
    console.log('Payment failed:', invoice.id);
    return { success: true, message: 'Payment failure handled' };
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<{ success: boolean; message: string }> {
    // Handle subscription updates
    console.log('Subscription updated:', subscription.id);
    return { success: true, message: 'Subscription updated successfully' };
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<{ success: boolean; message: string }> {
    // Handle subscription cancellation
    console.log('Subscription cancelled:', subscription.id);
    return { success: true, message: 'Subscription cancellation handled' };
  }

  // Cancel subscription
  async cancelSubscription(userId: string, immediately: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = this.getUserSubscription(userId);
      if (!subscription) {
        return { success: false, error: 'No active subscription found' };
      }

      // In production, would call Stripe API to cancel subscription
      const updatedSubscription: SubscriptionInfo = {
        ...subscription,
        status: immediately ? 'cancelled' : subscription.status,
        cancelAtPeriodEnd: !immediately
      };

      this.subscriptions.set(userId, updatedSubscription);
      
      return { success: true };
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      return { success: false, error: 'Failed to cancel subscription' };
    }
  }

  // Update payment method
  async updatePaymentMethod(userId: string, paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, would call Stripe API to update payment method
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Payment method updated for user ${userId}: ${paymentMethodId}`);
      return { success: true };
    } catch (error) {
      console.error('Payment method update error:', error);
      return { success: false, error: 'Failed to update payment method' };
    }
  }

  // Get billing history
  async getBillingHistory(userId: string, limit: number = 10): Promise<any[]> {
    // In production, would fetch from Stripe API
    // For demo, return mock data
    return [
      {
        id: 'in_1234',
        amount: 19900, // $199.00 in cents
        currency: 'usd',
        status: 'paid',
        created: Date.now() / 1000 - 86400, // 1 day ago
        description: 'GlassWallet Platform Subscription',
        invoice_pdf: 'https://example.com/invoice.pdf'
      },
      {
        id: 'in_1235',
        amount: 44900, // $449.00 in cents
        currency: 'usd',
        status: 'paid',
        created: Date.now() / 1000 - 172800, // 2 days ago
        description: 'Silver Credit Package (100 credits)',
        invoice_pdf: 'https://example.com/invoice2.pdf'
      }
    ];
  }

  // Format currency helper
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  // Check if user has active subscription
  hasActiveSubscription(userId: string): boolean {
    const subscription = this.getUserSubscription(userId);
    return subscription?.status === 'active' && 
           new Date(subscription.currentPeriodEnd).getTime() > Date.now();
  }

  // Get days remaining in current billing period
  getDaysRemainingInPeriod(userId: string): number {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return 0;
    
    const endTime = new Date(subscription.currentPeriodEnd).getTime();
    const now = Date.now();
    const daysRemaining = Math.ceil((endTime - now) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysRemaining);
  }
}

// Export singleton instance
export const stripeService = new StripeServiceDemo();

// Utility functions
export const formatStripeAmount = (cents: number): number => {
  return cents / 100;
};

export const toStripeAmount = (dollars: number): number => {
  return Math.round(dollars * 100);
};