// Mock CRS Credit API Service
// This simulates the real CRS Credit API with realistic responses
// When you get real API access, replace the mock functions with actual API calls

import { creditService } from './creditService';

export interface CreditPullRequest {
  firstName: string;
  lastName: string;
  ssn: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone?: string;
  email?: string;
  permissiblePurpose: string;
  consentGiven: boolean;
  consentTimestamp: string;
  ipAddress?: string;
}

export interface CreditScore {
  score: number;
  model: string;
  range: {
    min: number;
    max: number;
  };
  factors: string[];
}

export interface CreditPullResponse {
  success: boolean;
  transactionId: string;
  timestamp: string;
  subject: {
    firstName: string;
    lastName: string;
    ssn: string; // Masked in response
    dateOfBirth: string;
  };
  creditScores: CreditScore[];
  creditProfile: {
    totalAccounts: number;
    openAccounts: number;
    totalBalance: number;
    availableCredit: number;
    creditUtilization: number;
    oldestAccount: string;
    averageAccountAge: number;
    paymentHistory: {
      onTimePayments: number;
      totalPayments: number;
      percentage: number;
    };
    delinquencies: {
      current: number;
      thirtyDays: number;
      sixtyDays: number;
      ninetyDays: number;
    };
    inquiries: {
      hardInquiries: number;
      softInquiries: number;
      lastInquiryDate?: string;
    };
  };
  incomeEstimate?: {
    estimatedAnnualIncome: number;
    confidenceLevel: 'high' | 'medium' | 'low';
    methodology: string;
  };
  riskFactors: string[];
  qualificationSuggestion: {
    qualified: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    recommendedAction: string;
  };
  fcraNotice: string;
  error?: string;
}

// Mock data generators for realistic responses
const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jessica', 'William', 'Ashley'];
const LAST_NAMES = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const STATES = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA'];

class CRSApiServiceMock {
  private readonly apiEndpoint = process.env.CRS_API_ENDPOINT || 'https://api.crscreditapi.com';
  private readonly apiKey = process.env.CRS_API_KEY || 'demo_key';

  // Generate realistic mock data based on credit score
  private generateMockCreditData(targetScore?: number): Partial<CreditPullResponse> {
    // Generate score in realistic range
    const score = targetScore || this.generateCreditScore();
    
    // Higher scores = better profile
    const scoreRatio = (score - 300) / 550; // Normalize to 0-1
    
    return {
      creditScores: [
        {
          score,
          model: 'FICO Score 8',
          range: { min: 300, max: 850 },
          factors: this.getCreditFactors(score)
        }
      ],
      creditProfile: {
        totalAccounts: Math.floor(5 + scoreRatio * 15), // 5-20 accounts
        openAccounts: Math.floor(3 + scoreRatio * 12), // 3-15 open accounts
        totalBalance: Math.floor((20000 + scoreRatio * 80000) * 100) / 100, // $20k-$100k
        availableCredit: Math.floor((5000 + scoreRatio * 45000) * 100) / 100, // $5k-$50k
        creditUtilization: Math.floor((50 - scoreRatio * 35) * 10) / 10, // 15%-50%
        oldestAccount: this.generateAccountAge(scoreRatio),
        averageAccountAge: Math.floor(2 + scoreRatio * 10), // 2-12 years
        paymentHistory: {
          onTimePayments: Math.floor(85 + scoreRatio * 15), // 85-100%
          totalPayments: Math.floor(100 + scoreRatio * 200),
          percentage: Math.floor(85 + scoreRatio * 15)
        },
        delinquencies: {
          current: Math.floor((1 - scoreRatio) * 3),
          thirtyDays: Math.floor((1 - scoreRatio) * 2),
          sixtyDays: Math.floor((1 - scoreRatio) * 1),
          ninetyDays: Math.floor((1 - scoreRatio) * 1)
        },
        inquiries: {
          hardInquiries: Math.floor((1 - scoreRatio) * 5),
          softInquiries: Math.floor(2 + Math.random() * 8),
          lastInquiryDate: this.generateRecentDate()
        }
      },
      incomeEstimate: {
        estimatedAnnualIncome: Math.floor(35000 + scoreRatio * 65000), // $35k-$100k
        confidenceLevel: scoreRatio > 0.6 ? 'high' : scoreRatio > 0.3 ? 'medium' : 'low',
        methodology: 'Credit bureau analysis and statistical modeling'
      },
      riskFactors: this.getRiskFactors(score),
      qualificationSuggestion: {
        qualified: score >= 650,
        riskLevel: score >= 720 ? 'low' : score >= 650 ? 'medium' : 'high',
        recommendedAction: this.getRecommendedAction(score)
      }
    };
  }

  private generateCreditScore(): number {
    // Generate realistic distribution (bell curve centered around 680)
    const random1 = Math.random();
    const random2 = Math.random();
    const gaussian = Math.sqrt(-2 * Math.log(random1)) * Math.cos(2 * Math.PI * random2);
    
    const mean = 680;
    const stdDev = 80;
    let score = Math.round(mean + gaussian * stdDev);
    
    // Clamp to realistic range
    return Math.min(850, Math.max(300, score));
  }

  private getCreditFactors(score: number): string[] {
    if (score >= 750) {
      return [
        'Excellent payment history',
        'Low credit utilization',
        'Long credit history',
        'Good credit mix'
      ];
    } else if (score >= 650) {
      return [
        'Good payment history with occasional late payments',
        'Moderate credit utilization',
        'Established credit history',
        'Recent credit inquiries'
      ];
    } else {
      return [
        'History of late payments',
        'High credit utilization',
        'Limited credit history',
        'Recent delinquencies',
        'Multiple recent inquiries'
      ];
    }
  }

  private getRiskFactors(score: number): string[] {
    const factors = [];
    if (score < 650) {
      factors.push('Below average credit score', 'Payment history concerns');
    }
    if (score < 600) {
      factors.push('High credit utilization', 'Recent delinquencies');
    }
    if (score < 550) {
      factors.push('Multiple collection accounts', 'Charge-offs present');
    }
    return factors;
  }

  private getRecommendedAction(score: number): string {
    if (score >= 720) return 'Approve - Excellent credit profile';
    if (score >= 650) return 'Approve with standard terms';
    if (score >= 600) return 'Consider with additional verification';
    return 'Decline or require co-signer';
  }

  private generateAccountAge(scoreRatio: number): string {
    const years = Math.floor(3 + scoreRatio * 15);
    return `${years} years, ${Math.floor(Math.random() * 12)} months`;
  }

  private generateRecentDate(): string {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  // Mock the actual credit pull API call
  async performCreditPull(
    userId: string,
    request: CreditPullRequest
  ): Promise<CreditPullResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Check if user has sufficient credits
    const deductResult = creditService.deductCredits(
      userId, 
      1, 
      `Credit pull: ${request.firstName} ${request.lastName}`
    );

    if (!deductResult.success) {
      return {
        success: false,
        transactionId: '',
        timestamp: new Date().toISOString(),
        subject: {
          firstName: request.firstName,
          lastName: request.lastName,
          ssn: this.maskSSN(request.ssn),
          dateOfBirth: request.dateOfBirth
        },
        creditScores: [],
        creditProfile: {} as any,
        riskFactors: [],
        qualificationSuggestion: {} as any,
        fcraNotice: '',
        error: deductResult.error || 'Insufficient credits'
      };
    }

    // Simulate occasional API errors (5% chance)
    if (Math.random() < 0.05) {
      return {
        success: false,
        transactionId: this.generateTransactionId(),
        timestamp: new Date().toISOString(),
        subject: {
          firstName: request.firstName,
          lastName: request.lastName,
          ssn: this.maskSSN(request.ssn),
          dateOfBirth: request.dateOfBirth
        },
        creditScores: [],
        creditProfile: {} as any,
        riskFactors: [],
        qualificationSuggestion: {} as any,
        fcraNotice: this.getFCRANotice(),
        error: 'Credit bureau temporarily unavailable. Please try again.'
      };
    }

    // Generate mock credit data
    const mockData = this.generateMockCreditData();

    return {
      success: true,
      transactionId: this.generateTransactionId(),
      timestamp: new Date().toISOString(),
      subject: {
        firstName: request.firstName,
        lastName: request.lastName,
        ssn: this.maskSSN(request.ssn),
        dateOfBirth: request.dateOfBirth
      },
      ...mockData,
      fcraNotice: this.getFCRANotice()
    } as CreditPullResponse;
  }

  // Batch credit pull for multiple leads
  async performBatchCreditPull(
    userId: string,
    requests: CreditPullRequest[]
  ): Promise<CreditPullResponse[]> {
    const results: CreditPullResponse[] = [];
    
    // Process in batches of 5 to simulate realistic API limits
    const batchSize = 5;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(request => this.performCreditPull(userId, request));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to simulate rate limiting
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  // Quick pre-qualification check (uses fewer credits, less detailed)
  async performPreQualification(
    userId: string,
    ssn: string,
    zipCode: string
  ): Promise<{ score: number; qualified: boolean; confidence: string }> {
    // Deduct 0.5 credits for pre-qualification
    const deductResult = creditService.deductCredits(
      userId,
      0.5,
      'Pre-qualification check'
    );

    if (!deductResult.success) {
      throw new Error(deductResult.error || 'Insufficient credits');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const score = this.generateCreditScore();
    return {
      score,
      qualified: score >= 650,
      confidence: score >= 700 ? 'high' : score >= 600 ? 'medium' : 'low'
    };
  }

  // Utility functions
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private maskSSN(ssn: string): string {
    return `***-**-${ssn.slice(-4)}`;
  }

  private getFCRANotice(): string {
    return 'This credit report was obtained for a permissible purpose under the Fair Credit Reporting Act. The consumer has provided written consent for this inquiry.';
  }

  // Validate request data
  validateCreditPullRequest(request: CreditPullRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.firstName?.trim()) errors.push('First name is required');
    if (!request.lastName?.trim()) errors.push('Last name is required');
    if (!request.ssn || !/^\d{9}$/.test(request.ssn.replace(/\D/g, ''))) {
      errors.push('Valid 9-digit SSN is required');
    }
    if (!request.dateOfBirth) errors.push('Date of birth is required');
    if (!request.address?.street) errors.push('Street address is required');
    if (!request.address?.city) errors.push('City is required');
    if (!request.address?.state) errors.push('State is required');
    if (!request.address?.zipCode || !/^\d{5}(-\d{4})?$/.test(request.address.zipCode)) {
      errors.push('Valid ZIP code is required');
    }
    if (!request.permissiblePurpose) errors.push('Permissible purpose is required');
    if (!request.consentGiven) errors.push('Consumer consent is required');

    return { valid: errors.length === 0, errors };
  }
}

// Export singleton instance
export const crsApiService = new CRSApiServiceMock();

// Export helper functions
export const PERMISSIBLE_PURPOSES = [
  'credit_transaction',
  'employment_screening', 
  'tenant_screening',
  'business_transaction',
  'collection_of_debt',
  'insurance_underwriting'
] as const;

export type PermissiblePurpose = typeof PERMISSIBLE_PURPOSES[number];