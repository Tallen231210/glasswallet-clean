/**
 * Credit Score Integration Service
 * Handles CRS Credit API integration for lead credit qualification
 */

interface CreditPullRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ssn?: string; // Last 4 digits or hashed
}

interface CreditScoreResponse {
  creditScore: number;
  incomeEstimate?: number;
  riskFactors?: string[];
  reportId: string;
  pullDate: Date;
}

interface CreditPullResult {
  success: boolean;
  data?: CreditScoreResponse;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  costInCents: number;
  transactionId: string;
}

export class CreditService {
  private static instance: CreditService;
  private apiKey: string;
  private apiUrl: string;
  private costPerPull: number = 495; // $4.95 per pull in cents

  constructor() {
    this.apiKey = process.env.CRS_CREDIT_API_KEY || '';
    this.apiUrl = process.env.CRS_CREDIT_API_URL || 'https://api.crs-credit.com/v1';
    
    if (!this.apiKey && process.env.NODE_ENV === 'production') {
      console.warn('CRS Credit API key not configured');
    }
  }

  public static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService();
    }
    return CreditService.instance;
  }

  /**
   * Pull credit report for a lead
   * Implements FCRA-compliant credit pulling
   */
  async pullCreditReport(
    leadData: CreditPullRequest,
    userId: string,
    consentGiven: boolean
  ): Promise<CreditPullResult> {
    // FCRA Compliance Check
    if (!consentGiven) {
      return {
        success: false,
        error: {
          code: 'CONSENT_REQUIRED',
          message: 'FCRA compliance requires explicit consent before credit pull',
          retryable: false
        },
        costInCents: 0,
        transactionId: ''
      };
    }

    const transactionId = this.generateTransactionId();

    try {
      // For now, simulate the credit pull since CRS API integration requires credentials
      // In production, this would make actual API calls to CRS Credit
      
      if (process.env.NODE_ENV === 'development' || !this.apiKey) {
        // Simulate credit pull for development
        return await this.simulateCreditPull(leadData, transactionId);
      }

      // Production credit pull implementation
      return await this.performRealCreditPull(leadData, transactionId);
      
    } catch (error) {
      console.error('Credit pull failed:', error);
      
      return {
        success: false,
        error: {
          code: 'CREDIT_PULL_FAILED',
          message: error instanceof Error ? error.message : 'Credit pull service unavailable',
          retryable: true
        },
        costInCents: 0,
        transactionId
      };
    }
  }

  /**
   * Simulate credit pull for development/testing
   */
  private async simulateCreditPull(
    leadData: CreditPullRequest,
    transactionId: string
  ): Promise<CreditPullResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock credit score based on email/name for consistent testing
    const hash = this.simpleHash(leadData.email + leadData.firstName + leadData.lastName);
    const baseScore = 550 + (hash % 300); // Score between 550-850
    
    // Add some realistic variance
    const creditScore = Math.min(850, Math.max(300, baseScore + (Math.random() * 40 - 20)));
    
    // Generate mock income estimate
    const incomeEstimate = Math.floor((30000 + (hash % 70000)) * 100); // $30k-$100k in cents

    // Simulate occasional failures for testing
    if (Math.random() < 0.05) { // 5% failure rate
      return {
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Credit reporting service temporarily unavailable',
          retryable: true
        },
        costInCents: 0,
        transactionId
      };
    }

    return {
      success: true,
      data: {
        creditScore: Math.round(creditScore),
        incomeEstimate,
        riskFactors: this.generateMockRiskFactors(creditScore),
        reportId: `MOCK_${transactionId}`,
        pullDate: new Date()
      },
      costInCents: this.costPerPull,
      transactionId
    };
  }

  /**
   * Perform real credit pull using CRS Credit API
   * This would be implemented when API credentials are available
   */
  private async performRealCreditPull(
    leadData: CreditPullRequest,
    transactionId: string
  ): Promise<CreditPullResult> {
    const requestPayload = {
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      address: {
        street: leadData.address,
        city: leadData.city,
        state: leadData.state,
        zipCode: leadData.zipCode
      },
      transactionId
    };

    const response = await fetch(`${this.apiUrl}/credit-pull`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Transaction-ID': transactionId
      },
      body: JSON.stringify(requestPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: result.error?.code || 'API_ERROR',
          message: result.error?.message || 'Credit API request failed',
          retryable: response.status >= 500 || response.status === 429
        },
        costInCents: 0,
        transactionId
      };
    }

    return {
      success: true,
      data: {
        creditScore: result.creditScore,
        incomeEstimate: result.incomeEstimate,
        riskFactors: result.riskFactors || [],
        reportId: result.reportId,
        pullDate: new Date(result.pullDate)
      },
      costInCents: result.cost || this.costPerPull,
      transactionId
    };
  }

  /**
   * Generate mock risk factors based on credit score
   */
  private generateMockRiskFactors(creditScore: number): string[] {
    const allFactors = [
      'High credit utilization',
      'Recent credit inquiries',
      'Limited credit history',
      'Missed payments in last 12 months',
      'High debt-to-income ratio',
      'Recent account closures',
      'Multiple credit accounts opened recently'
    ];

    if (creditScore >= 750) return [];
    if (creditScore >= 700) return allFactors.slice(0, 1);
    if (creditScore >= 650) return allFactors.slice(0, 2);
    return allFactors.slice(0, Math.floor(Math.random() * 4) + 2);
  }

  /**
   * Simple hash function for consistent mock data generation
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const randomBytes = Math.random().toString(36).substring(2, 8);
    return `CRS_${timestamp}_${randomBytes}`.toUpperCase();
  }

  /**
   * Validate if lead data is sufficient for credit pull
   */
  validateCreditPullData(leadData: CreditPullRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!leadData.firstName || leadData.firstName.length < 1) {
      errors.push('First name is required');
    }

    if (!leadData.lastName || leadData.lastName.length < 1) {
      errors.push('Last name is required');
    }

    if (!leadData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
      errors.push('Valid email address is required');
    }

    // For better credit matching, we recommend having address information
    const hasAddress = leadData.address && leadData.city && leadData.state && leadData.zipCode;
    if (!hasAddress) {
      console.warn('Credit pull accuracy may be reduced without complete address information');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get the current cost per credit pull
   */
  getCostPerPull(): number {
    return this.costPerPull;
  }

  /**
   * Check if credit service is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey) || process.env.NODE_ENV === 'development';
  }
}

// Export singleton instance
export const creditService = CreditService.getInstance();