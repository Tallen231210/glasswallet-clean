import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError, BusinessLogicError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { pixelService } from '@/services/pixel';

interface BatchSyncRequest {
  connectionIds: string[];
  filters: {
    tagTypes?: ('whitelist' | 'blacklist' | 'qualified' | 'unqualified')[];
    creditScoreMin?: number;
    creditScoreMax?: number;
    dateRange?: {
      from: string;
      to: string;
    };
    includeUntagged?: boolean;
  };
  batchSize?: number;
  dryRun?: boolean;
}

const batchSyncHandler = withMiddleware(
  async (context, request) => {
    const { userId, requestId } = context as any;
    const body = await request.json() as BatchSyncRequest;
    
    const { 
      connectionIds, 
      filters, 
      batchSize = 1000,
      dryRun = false 
    } = body;
    
    if (!connectionIds || connectionIds.length === 0) {
      throw new ValidationError('Connection IDs are required');
    }
    
    if (batchSize > 5000) {
      throw new ValidationError('Batch size cannot exceed 5000 leads');
    }
    
    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Validate connections belong to user
    const connections = await prisma.pixelConnection.findMany({
      where: {
        id: { in: connectionIds },
        userId: user.id
      }
    });

    if (connections.length !== connectionIds.length) {
      const foundIds = connections.map(c => c.id);
      const missingIds = connectionIds.filter(id => !foundIds.includes(id));
      throw new ValidationError(
        `Some connections not found or access denied: ${missingIds.join(', ')}`
      );
    }

    // Check for inactive connections
    const inactiveConnections = connections.filter(c => c.connectionStatus !== 'active');
    if (inactiveConnections.length > 0) {
      const inactiveNames = inactiveConnections.map(c => c.connectionName);
      throw new BusinessLogicError(
        `Cannot sync to inactive connections: ${inactiveNames.join(', ')}`,
        { inactiveConnections: inactiveNames }
      );
    }

    // Build lead query based on filters
    const leadQuery: any = {
      userId: user.id
    };

    // Apply filters
    if (filters.creditScoreMin || filters.creditScoreMax) {
      leadQuery.creditScore = {};
      if (filters.creditScoreMin) leadQuery.creditScore.gte = filters.creditScoreMin;
      if (filters.creditScoreMax) leadQuery.creditScore.lte = filters.creditScoreMax;
    }

    if (filters.dateRange) {
      leadQuery.createdAt = {
        gte: new Date(filters.dateRange.from),
        lte: new Date(filters.dateRange.to)
      };
    }

    // Handle tag filtering
    let leadIds: string[] = [];
    
    if (filters.tagTypes && filters.tagTypes.length > 0) {
      // Get leads with specific tags
      const taggedLeads = await prisma.leadTag.findMany({
        where: {
          tagType: { in: filters.tagTypes as any[] }
        },
        select: { leadId: true },
        distinct: ['leadId']
      });
      
      const taggedLeadIds = taggedLeads.map(tag => tag.leadId);
      leadQuery.id = { in: taggedLeadIds };
      
    } else if (!filters.includeUntagged) {
      // Default: only include leads with tags
      const allTaggedLeads = await prisma.leadTag.findMany({
        select: { leadId: true },
        distinct: ['leadId']
      });
      
      const allTaggedLeadIds = allTaggedLeads.map(tag => tag.leadId);
      leadQuery.id = { in: allTaggedLeadIds };
    }

    // Count total matching leads
    const totalLeads = await prisma.lead.count({ where: leadQuery });
    
    if (totalLeads === 0) {
      return NextResponse.json(
        formatSuccessResponse({
          totalLeads: 0,
          batchCount: 0,
          syncResults: [],
          message: 'No leads match the specified filters'
        })
      );
    }

    if (totalLeads > 50000) {
      throw new BusinessLogicError(
        'Too many leads selected for batch sync (max 50,000)',
        { totalLeads }
      );
    }

    // If dry run, return summary without syncing
    if (dryRun) {
      const sampleLeads = await prisma.lead.findMany({
        where: leadQuery,
        take: 10,
        include: {
          leadTags: true
        }
      });

      return NextResponse.json(
        formatSuccessResponse({
          dryRun: true,
          totalLeads,
          estimatedBatches: Math.ceil(totalLeads / batchSize),
          connections: connections.map(conn => ({
            id: conn.id,
            name: conn.connectionName,
            platform: conn.platformType
          })),
          sampleLeads: sampleLeads.map(lead => ({
            id: lead.id,
            email: lead.email,
            creditScore: lead.creditScore,
            tags: lead.leadTags.map(tag => tag.tagType)
          })),
          estimatedDuration: Math.ceil(totalLeads / batchSize) * 30, // 30 seconds per batch
          filters
        }, 'Batch sync dry run completed')
      );
    }

    // Process leads in batches
    const allSyncResults: any[] = [];
    const batchCount = Math.ceil(totalLeads / batchSize);
    let processedLeads = 0;

    for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
      const batchLeads = await prisma.lead.findMany({
        where: leadQuery,
        skip: batchIndex * batchSize,
        take: batchSize,
        select: { id: true }
      });

      const batchLeadIds = batchLeads.map(lead => lead.id);
      
      if (batchLeadIds.length === 0) break;

      try {
        // Determine sync type based on filters
        const syncType = filters.tagTypes?.includes('whitelist') ? 'whitelist' :
                        filters.tagTypes?.includes('qualified') ? 'qualified' :
                        'all';

        // Sync this batch
        const batchResults = await pixelService.syncLeadsToPixels(
          batchLeadIds,
          connectionIds,
          syncType
        );

        allSyncResults.push(...batchResults);
        processedLeads += batchLeadIds.length;

        // Update sync status for successfully synced leads
        const successfulSyncs = batchResults.filter(result => result.success);
        if (successfulSyncs.length > 0) {
          await prisma.leadTag.updateMany({
            where: {
              leadId: { in: batchLeadIds },
              ...(filters.tagTypes ? { tagType: { in: filters.tagTypes as any[] } } : {})
            },
            data: {
              syncedToPixels: true,
              pixelSyncAt: new Date()
            }
          });
        }

        // Rate limiting: wait between batches to avoid overwhelming APIs
        if (batchIndex < batchCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (batchError) {
        console.error(`Batch ${batchIndex + 1} sync error:`, batchError);
        
        // Add error result for this batch
        connections.forEach(conn => {
          allSyncResults.push({
            success: false,
            platformType: conn.platformType,
            connectionId: conn.id,
            leadCount: batchLeadIds.length,
            syncedCount: 0,
            failedCount: batchLeadIds.length,
            errors: [batchError instanceof Error ? batchError.message : 'Batch sync failed'],
            syncId: `batch_${batchIndex + 1}_${Date.now()}`,
            timestamp: new Date()
          });
        });
      }
    }

    // Calculate summary statistics
    const platformStats = connections.map(conn => {
      const connectionResults = allSyncResults.filter(r => r.connectionId === conn.id);
      return {
        connectionId: conn.id,
        connectionName: conn.connectionName,
        platformType: conn.platformType,
        totalSynced: connectionResults.reduce((sum, r) => sum + r.syncedCount, 0),
        totalFailed: connectionResults.reduce((sum, r) => sum + r.failedCount, 0),
        successRate: connectionResults.length > 0 ? 
          (connectionResults.filter(r => r.success).length / connectionResults.length) * 100 : 0
      };
    });

    const overallStats = {
      totalLeads: processedLeads,
      totalSynced: allSyncResults.reduce((sum, r) => sum + r.syncedCount, 0),
      totalFailed: allSyncResults.reduce((sum, r) => sum + r.failedCount, 0),
      batchesProcessed: batchCount,
      successfulBatches: Math.ceil(allSyncResults.filter(r => r.success).length / connections.length),
      duration: Date.now() - parseInt(requestId.split('_')[1] || '0'),
      platformStats
    };

    return NextResponse.json(
      formatSuccessResponse({
        batchSync: true,
        ...overallStats,
        syncResults: allSyncResults,
        filters
      }, `Batch sync completed: ${overallStats.totalSynced} leads synced across ${connections.length} platforms`)
    );
  },
  {
    requireAuth: true,
    rateLimit: { requests: 5, windowMs: 300000 } // 5 batch syncs per 5 minutes
  }
);

export const POST = batchSyncHandler;