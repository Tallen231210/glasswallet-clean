import { 
  CreditPackage, 
  CreditTransaction, 
  UserCreditBalance, 
  CREDIT_PACKAGES 
} from '@/types/billing';

// In-memory storage for demo (replace with database in production)
class CreditServiceDemo {
  private balances = new Map<string, UserCreditBalance>();
  private transactions = new Map<string, CreditTransaction[]>();

  // Get user's current credit balance
  getUserBalance(userId: string): UserCreditBalance {
    if (!this.balances.has(userId)) {
      // Initialize new user with 0 credits
      const initialBalance: UserCreditBalance = {
        userId,
        totalCredits: 0,
        usedCredits: 0,
        availableCredits: 0,
        lastUpdated: new Date().toISOString(),
        alertThreshold: 10, // Alert when credits fall below 10
        lowBalanceAlert: true
      };
      this.balances.set(userId, initialBalance);
    }
    return this.balances.get(userId)!;
  }

  // Add credits to user balance (from purchase)
  addCredits(
    userId: string, 
    credits: number, 
    packageId: string, 
    amount: number,
    stripePaymentId?: string
  ): { success: boolean; balance: UserCreditBalance; transaction: CreditTransaction } {
    const currentBalance = this.getUserBalance(userId);
    const newBalance: UserCreditBalance = {
      ...currentBalance,
      totalCredits: currentBalance.totalCredits + credits,
      availableCredits: currentBalance.availableCredits + credits,
      lastUpdated: new Date().toISOString()
    };

    // Create transaction record
    const transaction: CreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'purchase',
      packageId,
      credits,
      amount,
      description: `Purchased ${credits} credits`,
      timestamp: new Date().toISOString(),
      stripePaymentId
    };

    // Save updates
    this.balances.set(userId, newBalance);
    
    if (!this.transactions.has(userId)) {
      this.transactions.set(userId, []);
    }
    this.transactions.get(userId)!.push(transaction);

    return { success: true, balance: newBalance, transaction };
  }

  // Deduct credits (from credit pull usage)
  deductCredits(
    userId: string, 
    credits: number, 
    description: string = 'Credit pull'
  ): { success: boolean; balance?: UserCreditBalance; transaction?: CreditTransaction; error?: string } {
    const currentBalance = this.getUserBalance(userId);
    
    // Check if user has sufficient credits
    if (currentBalance.availableCredits < credits) {
      return {
        success: false,
        error: `Insufficient credits. Available: ${currentBalance.availableCredits}, Required: ${credits}`
      };
    }

    const newBalance: UserCreditBalance = {
      ...currentBalance,
      usedCredits: currentBalance.usedCredits + credits,
      availableCredits: currentBalance.availableCredits - credits,
      lastUpdated: new Date().toISOString()
    };

    // Create transaction record
    const transaction: CreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'usage',
      credits: -credits, // Negative for usage
      description,
      timestamp: new Date().toISOString()
    };

    // Save updates
    this.balances.set(userId, newBalance);
    
    if (!this.transactions.has(userId)) {
      this.transactions.set(userId, []);
    }
    this.transactions.get(userId)!.push(transaction);

    return { success: true, balance: newBalance, transaction };
  }

  // Get user's transaction history
  getUserTransactions(userId: string, limit: number = 50): CreditTransaction[] {
    const transactions = this.transactions.get(userId) || [];
    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Check if user needs low balance alert
  checkLowBalanceAlert(userId: string): boolean {
    const balance = this.getUserBalance(userId);
    return balance.lowBalanceAlert && balance.availableCredits <= balance.alertThreshold;
  }

  // Update alert threshold
  updateAlertThreshold(userId: string, threshold: number): UserCreditBalance {
    const balance = this.getUserBalance(userId);
    const updatedBalance = {
      ...balance,
      alertThreshold: threshold,
      lastUpdated: new Date().toISOString()
    };
    this.balances.set(userId, updatedBalance);
    return updatedBalance;
  }

  // Get credit package by ID
  getCreditPackage(packageId: string): CreditPackage | null {
    return CREDIT_PACKAGES.find(pkg => pkg.id === packageId) || null;
  }

  // Get all available credit packages
  getAllCreditPackages(): CreditPackage[] {
    return CREDIT_PACKAGES;
  }

  // Adjust credits (admin function)
  adjustCredits(
    userId: string, 
    credits: number, 
    description: string,
    adminUserId?: string
  ): { success: boolean; balance: UserCreditBalance; transaction: CreditTransaction } {
    const currentBalance = this.getUserBalance(userId);
    const newBalance: UserCreditBalance = {
      ...currentBalance,
      totalCredits: currentBalance.totalCredits + credits,
      availableCredits: currentBalance.availableCredits + credits,
      lastUpdated: new Date().toISOString()
    };

    // If it's a negative adjustment, also update used credits
    if (credits < 0 && Math.abs(credits) <= currentBalance.availableCredits) {
      newBalance.usedCredits = Math.max(0, currentBalance.usedCredits + Math.abs(credits));
    }

    const transaction: CreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'adjustment',
      credits,
      description,
      timestamp: new Date().toISOString(),
      metadata: { adminUserId }
    };

    this.balances.set(userId, newBalance);
    
    if (!this.transactions.has(userId)) {
      this.transactions.set(userId, []);
    }
    this.transactions.get(userId)!.push(transaction);

    return { success: true, balance: newBalance, transaction };
  }

  // Get usage statistics
  getUsageStats(userId: string): {
    totalCreditsEverPurchased: number;
    totalCreditsUsed: number;
    totalSpent: number;
    averageCostPerCredit: number;
  } {
    const transactions = this.getUserTransactions(userId, 1000);
    
    const purchaseTransactions = transactions.filter(t => t.type === 'purchase');
    const totalCreditsEverPurchased = purchaseTransactions.reduce((sum, t) => sum + t.credits, 0);
    const totalSpent = purchaseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const usageTransactions = transactions.filter(t => t.type === 'usage');
    const totalCreditsUsed = Math.abs(usageTransactions.reduce((sum, t) => sum + t.credits, 0));
    
    const averageCostPerCredit = totalCreditsEverPurchased > 0 ? totalSpent / totalCreditsEverPurchased : 0;

    return {
      totalCreditsEverPurchased,
      totalCreditsUsed,
      totalSpent,
      averageCostPerCredit
    };
  }
}

// Export singleton instance
export const creditService = new CreditServiceDemo();

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const calculateSavings = (packageId: string): { amount: number; percentage: number } => {
  const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
  const bronzePackage = CREDIT_PACKAGES.find(p => p.id === 'bronze');
  
  if (!pkg || !bronzePackage) return { amount: 0, percentage: 0 };
  
  const bronzeCostForSameCredits = pkg.totalCredits * bronzePackage.pricePerCredit;
  const savings = bronzeCostForSameCredits - pkg.price;
  const percentage = (savings / bronzeCostForSameCredits) * 100;
  
  return { amount: Math.max(0, savings), percentage: Math.max(0, percentage) };
};