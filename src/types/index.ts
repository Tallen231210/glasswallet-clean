// Core GlassWallet Type Definitions

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  creditBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  creditScore?: number;
  incomeEstimate?: number;
  processedAt?: string;
  createdAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  leadId?: string;
  transactionType: 'pull' | 'purchase' | 'refund';
  costInCents: number;
  creditBalanceBefore: number;
  creditBalanceAfter: number;
  crsTransactionId?: string;
  createdAt: string;
}

// UI Component Props
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  neonBorder?: boolean;
}

export interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    timestamp: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}