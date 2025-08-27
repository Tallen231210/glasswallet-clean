/**
 * Pixel Optimization Service
 * Handles integration with Meta, Google Ads, and TikTok advertising pixels
 * Core differentiator for GlassWallet platform
 */

interface PixelConnection {
  id: string;
  platformType: 'META' | 'GOOGLE_ADS' | 'TIKTOK';
  connectionName: string;
  pixelId?: string;
  accessToken?: string;
  customerId?: string; // For Google Ads Customer ID
  connectionStatus: 'active' | 'inactive' | 'expired' | 'error';
  syncSettings: {
    autoSync: boolean;
    syncQualifiedOnly: boolean;
    syncWhitelisted: boolean;
    excludeBlacklisted: boolean;
    minimumCreditScore?: number;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
  };
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface LeadPixelData {
  leadId: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  creditScore?: number;
  tags: string[];
  customData?: Record<string, any>;
}

interface PixelSyncResult {
  success: boolean;
  platformType: string;
  connectionId: string;
  leadCount: number;
  syncedCount: number;
  failedCount: number;
  errors?: string[];
  syncId: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export class PixelOptimizationService {
  private static instance: PixelOptimizationService;

  public static getInstance(): PixelOptimizationService {
    if (!PixelOptimizationService.instance) {
      PixelOptimizationService.instance = new PixelOptimizationService();
    }
    return PixelOptimizationService.instance;
  }

  /**
   * Sync qualified leads to connected pixels
   */
  async syncLeadsToPixels(
    leadIds: string[],
    connectionIds: string[],
    syncType: 'qualified' | 'whitelist' | 'all' = 'qualified'
  ): Promise<PixelSyncResult[]> {
    const results: PixelSyncResult[] = [];

    for (const connectionId of connectionIds) {
      try {
        const connection = await this.getPixelConnection(connectionId);
        if (!connection || connection.connectionStatus !== 'active') {
          results.push({
            success: false,
            platformType: connection?.platformType || 'UNKNOWN',
            connectionId,
            leadCount: leadIds.length,
            syncedCount: 0,
            failedCount: leadIds.length,
            errors: ['Connection inactive or not found'],
            syncId: this.generateSyncId(),
            timestamp: new Date()
          });
          continue;
        }

        const leadData = await this.prepareLeadData(leadIds, syncType);
        const syncResult = await this.syncToPlatform(connection, leadData);
        results.push(syncResult);

      } catch (error) {
        console.error(`Error syncing to connection ${connectionId}:`, error);
        results.push({
          success: false,
          platformType: 'UNKNOWN',
          connectionId,
          leadCount: leadIds.length,
          syncedCount: 0,
          failedCount: leadIds.length,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          syncId: this.generateSyncId(),
          timestamp: new Date()
        });
      }
    }

    return results;
  }

  /**
   * Meta Conversions API Integration
   */
  private async syncToMeta(
    connection: PixelConnection, 
    leadData: LeadPixelData[]
  ): Promise<PixelSyncResult> {
    const syncId = this.generateSyncId();
    
    try {
      // In development, simulate Meta API calls
      if (process.env.NODE_ENV === 'development') {
        return this.simulateMetaSync(connection, leadData, syncId);
      }

      // Production Meta Conversions API implementation
      const metaEvents = leadData.map(lead => ({
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          em: this.hashEmail(lead.email),
          ph: lead.phone ? this.hashPhone(lead.phone) : undefined,
          fn: lead.firstName ? this.hashName(lead.firstName) : undefined,
          ln: lead.lastName ? this.hashName(lead.lastName) : undefined,
        },
        custom_data: {
          credit_score: lead.creditScore,
          lead_tags: lead.tags.join(','),
          source: 'glasswallet',
          ...lead.customData
        }
      }));

      const response = await fetch(`https://graph.facebook.com/v18.0/${connection.pixelId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connection.accessToken}`,
        },
        body: JSON.stringify({
          data: metaEvents,
          test_event_code: process.env.META_TEST_EVENT_CODE,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`Meta API Error: ${result.error?.message || 'Unknown error'}`);
      }

      return {
        success: true,
        platformType: 'META',
        connectionId: connection.id,
        leadCount: leadData.length,
        syncedCount: result.events_received || leadData.length,
        failedCount: leadData.length - (result.events_received || leadData.length),
        syncId,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        platformType: 'META',
        connectionId: connection.id,
        leadCount: leadData.length,
        syncedCount: 0,
        failedCount: leadData.length,
        errors: [error instanceof Error ? error.message : 'Meta sync failed'],
        syncId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Google Ads Customer Match Integration
   */
  private async syncToGoogleAds(
    connection: PixelConnection, 
    leadData: LeadPixelData[]
  ): Promise<PixelSyncResult> {
    const syncId = this.generateSyncId();
    
    try {
      // In development, simulate Google Ads API calls
      if (process.env.NODE_ENV === 'development') {
        return this.simulateGoogleAdsSync(connection, leadData, syncId);
      }

      // Production Google Ads Customer Match implementation
      const customerMatchMembers = leadData.map(lead => ({
        hashed_email: this.hashEmail(lead.email),
        hashed_phone_number: lead.phone ? this.hashPhone(lead.phone) : undefined,
        hashed_first_name: lead.firstName ? this.hashName(lead.firstName) : undefined,
        hashed_last_name: lead.lastName ? this.hashName(lead.lastName) : undefined,
        address_info: lead.address ? {
          hashed_street_address: this.hashAddress(lead.address),
          city: lead.city,
          state: lead.state,
          postal_code: lead.zipCode
        } : undefined
      }));

      // Filter out entries with no identifiable information
      const validMembers = customerMatchMembers.filter(member => 
        member.hashed_email || member.hashed_phone_number || 
        (member.hashed_first_name && member.hashed_last_name)
      );

      if (validMembers.length === 0) {
        throw new Error('No valid customer match data found');
      }

      // Create customer list operation
      const customerListOperation = {
        create: {
          name: `GlassWallet Sync ${syncId}`,
          description: `Leads synced from GlassWallet on ${new Date().toISOString()}`,
          membership_life_span: 10000, // 10,000 days retention
          upload_key_type: 'CONTACT_INFO'
        }
      };

      // Google Ads API call to create customer list
      const createResponse = await this.callGoogleAdsAPI(
        connection,
        `customers/${connection.customerId}/userLists:mutate`,
        {
          operations: [customerListOperation]
        }
      );

      if (!createResponse.results?.[0]?.resourceName) {
        throw new Error('Failed to create Google Ads customer list');
      }

      const customerListResourceName = createResponse.results[0].resourceName;

      // Upload customer match data
      const uploadResponse = await this.uploadCustomerMatchData(
        connection,
        customerListResourceName,
        validMembers,
        syncId
      );

      return {
        success: true,
        platformType: 'GOOGLE_ADS',
        connectionId: connection.id,
        leadCount: leadData.length,
        syncedCount: uploadResponse.uploadedCount,
        failedCount: leadData.length - uploadResponse.uploadedCount,
        syncId,
        metadata: {
          customerListId: customerListResourceName,
          validMembersCount: validMembers.length,
          segmentation: this.analyzeLeadSegmentation(leadData)
        },
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        platformType: 'GOOGLE_ADS',
        connectionId: connection.id,
        leadCount: leadData.length,
        syncedCount: 0,
        failedCount: leadData.length,
        errors: [error instanceof Error ? error.message : 'Google Ads sync failed'],
        syncId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Upload customer match data to Google Ads
   */
  private async uploadCustomerMatchData(
    connection: PixelConnection,
    customerListResourceName: string,
    members: any[],
    syncId: string
  ): Promise<{ uploadedCount: number; failedCount: number }> {
    const batchSize = 100000; // Google Ads limit
    let totalUploaded = 0;
    let totalFailed = 0;

    // Process in batches
    for (let i = 0; i < members.length; i += batchSize) {
      const batch = members.slice(i, i + batchSize);
      
      try {
        const response = await this.callGoogleAdsAPI(
          connection,
          `customers/${connection.customerId}/offlineUserDataJobs:addOfflineUserDataJobOperations`,
          {
            resource_name: customerListResourceName,
            enable_warnings: true,
            operations: batch.map(member => ({
              create: {
                user_identifiers: Object.entries(member)
                  .filter(([_, value]) => value !== undefined)
                  .map(([key, value]) => ({
                    identifier_type: this.getGoogleAdsIdentifierType(key),
                    [key]: value
                  }))
              }
            }))
          }
        );

        if (response.partial_failure_error) {
          const failedOps = response.partial_failure_error.details?.length || 0;
          totalFailed += failedOps;
          totalUploaded += (batch.length - failedOps);
        } else {
          totalUploaded += batch.length;
        }
      } catch (error) {
        console.error(`Failed to upload batch ${i / batchSize + 1}:`, error);
        totalFailed += batch.length;
      }
    }

    return { uploadedCount: totalUploaded, failedCount: totalFailed };
  }

  /**
   * Make authenticated Google Ads API call
   */
  private async callGoogleAdsAPI(
    connection: PixelConnection,
    endpoint: string,
    data: any
  ): Promise<any> {
    const response = await fetch(`https://googleads.googleapis.com/v14/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${connection.accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        'login-customer-id': process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || '',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Google Ads API Error: ${result.error?.message || 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Get Google Ads identifier type for customer match field
   */
  private getGoogleAdsIdentifierType(fieldName: string): string {
    const mapping: Record<string, string> = {
      'hashed_email': 'HASHED_EMAIL',
      'hashed_phone_number': 'HASHED_PHONE_NUMBER', 
      'hashed_first_name': 'HASHED_FIRST_NAME',
      'hashed_last_name': 'HASHED_LAST_NAME',
      'address_info': 'ADDRESS_INFO'
    };
    return mapping[fieldName] || 'UNKNOWN';
  }

  /**
   * TikTok Events API Integration
   */
  private async syncToTikTok(
    connection: PixelConnection, 
    leadData: LeadPixelData[]
  ): Promise<PixelSyncResult> {
    const syncId = this.generateSyncId();
    
    try {
      // In development, simulate TikTok API calls
      if (process.env.NODE_ENV === 'development') {
        return this.simulateTikTokSync(connection, leadData, syncId);
      }

      // Production TikTok Events API implementation
      const tiktokEvents = leadData.map(lead => ({
        event: this.determineTikTokEvent(lead),
        event_time: Math.floor(Date.now() / 1000),
        context: {
          user: {
            email: this.hashSHA256(lead.email),
            phone_number: lead.phone ? this.hashSHA256(this.normalizePhone(lead.phone)) : undefined,
          },
          page: {
            url: 'https://glasswallet.com/leads',
            referrer: 'https://glasswallet.com/dashboard'
          },
          user_agent: 'GlassWallet-PixelSync/1.0',
          ip: '0.0.0.0' // Will be replaced by TikTok with actual IP
        },
        properties: {
          content_type: 'lead_qualification',
          content_id: lead.leadId,
          value: this.calculateLeadValue(lead),
          currency: 'USD',
          credit_score_tier: this.getCreditScoreRange(lead.creditScore),
          lead_quality: lead.tags.includes('qualified') ? 'high' : 'standard',
          qualification_tags: lead.tags.filter(tag => 
            ['qualified', 'whitelist', 'blacklist', 'unqualified'].includes(tag)
          ),
          source: 'glasswallet_api',
          sync_batch_id: syncId,
          ...lead.customData
        }
      }));

      // Process events in batches (TikTok recommends max 1000 events per request)
      const batchSize = 1000;
      let totalSynced = 0;
      let totalFailed = 0;
      const errors: string[] = [];

      for (let i = 0; i < tiktokEvents.length; i += batchSize) {
        const batch = tiktokEvents.slice(i, i + batchSize);
        
        try {
          const response = await this.callTikTokAPI(connection, {
            pixel_code: connection.pixelId,
            partner_name: 'glasswallet',
            data: batch
          });

          // TikTok API returns success count and error details
          if (response.code === 0) {
            totalSynced += batch.length;
          } else {
            totalFailed += batch.length;
            errors.push(`Batch ${i / batchSize + 1}: ${response.message}`);
          }
        } catch (error) {
          totalFailed += batch.length;
          errors.push(`Batch ${i / batchSize + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: totalSynced > 0,
        platformType: 'TIKTOK',
        connectionId: connection.id,
        leadCount: leadData.length,
        syncedCount: totalSynced,
        failedCount: totalFailed,
        errors: errors.length > 0 ? errors : undefined,
        syncId,
        metadata: {
          batchCount: Math.ceil(tiktokEvents.length / batchSize),
          eventTypes: this.getTikTokEventDistribution(leadData),
          qualityDistribution: this.analyzeLeadSegmentation(leadData)
        },
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        platformType: 'TIKTOK',
        connectionId: connection.id,
        leadCount: leadData.length,
        syncedCount: 0,
        failedCount: leadData.length,
        errors: [error instanceof Error ? error.message : 'TikTok sync failed'],
        syncId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Route sync requests to appropriate platform
   */
  private async syncToPlatform(
    connection: PixelConnection,
    leadData: LeadPixelData[]
  ): Promise<PixelSyncResult> {
    switch (connection.platformType) {
      case 'META':
        return this.syncToMeta(connection, leadData);
      case 'GOOGLE_ADS':
        return this.syncToGoogleAds(connection, leadData);
      case 'TIKTOK':
        return this.syncToTikTok(connection, leadData);
      default:
        throw new Error(`Unsupported platform type: ${connection.platformType}`);
    }
  }

  /**
   * Simulate API calls for development
   */
  private async simulateMetaSync(
    connection: PixelConnection,
    leadData: LeadPixelData[],
    syncId: string
  ): Promise<PixelSyncResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate occasional failures for testing
    const successRate = 0.95;
    const syncedCount = Math.floor(leadData.length * successRate);
    
    return {
      success: syncedCount > 0,
      platformType: 'META',
      connectionId: connection.id,
      leadCount: leadData.length,
      syncedCount,
      failedCount: leadData.length - syncedCount,
      errors: syncedCount < leadData.length ? ['Some leads failed validation'] : undefined,
      syncId,
      timestamp: new Date()
    };
  }

  private async simulateGoogleAdsSync(
    connection: PixelConnection,
    leadData: LeadPixelData[],
    syncId: string
  ): Promise<PixelSyncResult> {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    return {
      success: true,
      platformType: 'GOOGLE_ADS',
      connectionId: connection.id,
      leadCount: leadData.length,
      syncedCount: leadData.length,
      failedCount: 0,
      syncId,
      timestamp: new Date()
    };
  }

  private async simulateTikTokSync(
    connection: PixelConnection,
    leadData: LeadPixelData[],
    syncId: string
  ): Promise<PixelSyncResult> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
    
    return {
      success: true,
      platformType: 'TIKTOK',
      connectionId: connection.id,
      leadCount: leadData.length,
      syncedCount: leadData.length,
      failedCount: 0,
      syncId,
      timestamp: new Date()
    };
  }

  /**
   * Utility functions
   */
  private async getPixelConnection(connectionId: string): Promise<PixelConnection | null> {
    // This would fetch from database
    // For now, return mock connection for development
    return {
      id: connectionId,
      platformType: 'META',
      connectionName: 'Development Meta Pixel',
      pixelId: 'mock-pixel-123',
      connectionStatus: 'active',
      syncSettings: {
        autoSync: true,
        syncQualifiedOnly: true,
        syncWhitelisted: true,
        excludeBlacklisted: true,
        minimumCreditScore: 650,
        syncFrequency: 'realtime'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async prepareLeadData(leadIds: string[], syncType: string): Promise<LeadPixelData[]> {
    // This would fetch and filter leads from database
    // For now, return mock lead data
    return leadIds.map((id, index) => ({
      leadId: id,
      email: `lead${index + 1}@example.com`,
      phone: `+1555000${String(index + 1).padStart(4, '0')}`,
      firstName: `Lead${index + 1}`,
      lastName: 'Tester',
      creditScore: 700 + Math.floor(Math.random() * 150),
      tags: syncType === 'qualified' ? ['qualified'] : ['whitelist'],
      customData: {
        source: 'glasswallet',
        leadValue: Math.floor(Math.random() * 1000) + 100
      }
    }));
  }

  private hashEmail(email: string): string {
    // In production, use proper SHA-256 hashing
    // For development, return mock hash
    return `hashed_${email.replace('@', '_at_')}`;
  }

  private hashPhone(phone: string): string {
    return `hashed_${phone.replace(/\D/g, '')}`;
  }

  private hashName(name: string): string {
    return `hashed_${name.toLowerCase()}`;
  }

  private hashAddress(address: string): string {
    return `hashed_${address.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private analyzeLeadSegmentation(leadData: LeadPixelData[]): Record<string, any> {
    const segments = {
      creditScoreDistribution: {
        excellent: leadData.filter(l => (l.creditScore || 0) >= 750).length,
        good: leadData.filter(l => (l.creditScore || 0) >= 700 && (l.creditScore || 0) < 750).length,
        fair: leadData.filter(l => (l.creditScore || 0) >= 650 && (l.creditScore || 0) < 700).length,
        poor: leadData.filter(l => (l.creditScore || 0) < 650).length,
      },
      tagDistribution: {
        qualified: leadData.filter(l => l.tags.includes('qualified')).length,
        whitelist: leadData.filter(l => l.tags.includes('whitelist')).length,
        blacklist: leadData.filter(l => l.tags.includes('blacklist')).length,
        unqualified: leadData.filter(l => l.tags.includes('unqualified')).length,
      },
      averageCreditScore: leadData.reduce((sum, lead) => sum + (lead.creditScore || 0), 0) / leadData.length,
      totalLeads: leadData.length
    };

    return segments;
  }

  private getCreditScoreRange(score?: number): string {
    if (!score) return 'unknown';
    if (score >= 750) return 'excellent';
    if (score >= 700) return 'good';
    if (score >= 650) return 'fair';
    return 'poor';
  }

  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * TikTok-specific helper methods
   */
  private async callTikTokAPI(connection: PixelConnection, data: any): Promise<any> {
    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': connection.accessToken!,
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`TikTok API Error: ${result.message || 'Unknown error'}`);
    }

    return result;
  }

  private determineTikTokEvent(lead: LeadPixelData): string {
    if (lead.tags.includes('qualified')) {
      return 'CompleteRegistration';
    } else if (lead.tags.includes('whitelist')) {
      return 'SubmitForm';
    } else if (lead.creditScore && lead.creditScore >= 700) {
      return 'ViewContent';
    } else {
      return 'Lead';
    }
  }

  private getTikTokEventDistribution(leadData: LeadPixelData[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    leadData.forEach(lead => {
      const eventType = this.determineTikTokEvent(lead);
      distribution[eventType] = (distribution[eventType] || 0) + 1;
    });

    return distribution;
  }

  private calculateLeadValue(lead: LeadPixelData): number {
    // Calculate lead value based on credit score and qualification status
    let baseValue = 10; // Base lead value in dollars
    
    if (lead.creditScore) {
      if (lead.creditScore >= 750) baseValue += 50;
      else if (lead.creditScore >= 700) baseValue += 30;
      else if (lead.creditScore >= 650) baseValue += 15;
    }
    
    if (lead.tags.includes('qualified')) baseValue += 25;
    if (lead.tags.includes('whitelist')) baseValue += 10;
    
    return baseValue;
  }

  private hashSHA256(value: string): string {
    // In production, use actual SHA-256 hashing
    // For development, return mock hash
    return `sha256_${value.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private normalizePhone(phone: string): string {
    // Remove all non-digits and format as E.164
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
  }

  /**
   * Test pixel connections
   */
  async testPixelConnection(connectionId: string): Promise<{
    success: boolean;
    message: string;
    latency?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const connection = await this.getPixelConnection(connectionId);
      if (!connection) {
        return { success: false, message: 'Connection not found' };
      }

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      const latency = Date.now() - startTime;
      
      return {
        success: true,
        message: `${connection.platformType} connection successful`,
        latency
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

// Export singleton instance
export const pixelService = PixelOptimizationService.getInstance();