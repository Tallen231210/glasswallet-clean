export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
  description: string;
  features: string[];
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'adjustment' | 'refund';
  packageId?: string;
  credits: number;
  amount?: number;
  description: string;
  timestamp: string;
  stripePaymentId?: string;
  metadata?: Record<string, any>;
}

export interface UserCreditBalance {
  userId: string;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  lastUpdated: string;
  alertThreshold: number;
  lowBalanceAlert: boolean;
}

export interface SubscriptionInfo {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number; // $199 monthly
  currency: string;
}

// Credit Package Definitions
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    credits: 25,
    bonusCredits: 0,
    totalCredits: 25,
    price: 125,
    pricePerCredit: 5.00,
    description: 'Perfect for small businesses testing the platform',
    features: [
      '25 Credit Pulls',
      'Basic Analytics',
      'Email Support',
      'Credits Never Expire'
    ]
  },
  {
    id: 'silver',
    name: 'Silver',
    credits: 100,
    bonusCredits: 0,
    totalCredits: 100,
    price: 449,
    pricePerCredit: 4.49,
    popular: true,
    description: 'Most popular choice for growing businesses',
    features: [
      '100 Credit Pulls',
      'Advanced Analytics',
      'Priority Email Support',
      'Pixel Integration',
      'Auto-Tagging Rules',
      'Credits Never Expire'
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    credits: 300,
    bonusCredits: 25,
    totalCredits: 325,
    price: 1199,
    pricePerCredit: 3.69,
    description: 'Professional package with bonus credits',
    features: [
      '300 + 25 Bonus Credits',
      'Advanced Analytics',
      'Priority Support',
      'Pixel Integration',
      'Auto-Tagging Rules',
      'Webhook Management',
      'Bulk Processing',
      'Credits Never Expire'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum',
    credits: 1000,
    bonusCredits: 100,
    totalCredits: 1100,
    price: 3499,
    pricePerCredit: 3.18,
    description: 'Enterprise package with maximum value',
    features: [
      '1,000 + 100 Bonus Credits',
      'Advanced Analytics',
      'Priority Phone Support',
      'Pixel Integration',
      'Auto-Tagging Rules',
      'Webhook Management',
      'Bulk Processing',
      'Custom Integrations',
      'Dedicated Account Manager',
      'Credits Never Expire'
    ]
  }
];

// Platform subscription pricing
export const PLATFORM_SUBSCRIPTION = {
  monthlyPrice: 199,
  currency: 'usd',
  features: [
    'Access to GlassWallet Platform',
    'Credit Balance Management',
    'Lead Processing Dashboard',
    'Pixel Optimization',
    'Advanced Analytics',
    'Auto-Tagging Rules',
    'Webhook Management',
    'JavaScript Widgets',
    'FCRA Compliance Tools',
    'Email Support'
  ]
};