import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { PixelSyncSchema } from '@/lib/validation';
import { formatSuccessResponse, ValidationError, BusinessLogicError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { pixelService } from '@/services/pixel';

const pixelSyncHandler = withMiddleware(
  async (context) => {
    const { validatedData, userId, requestId } = context as any;
    const { connectionIds, leadIds, syncType } = validatedData;
    
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
      const missingIds = connectionIds.filter((id: string) => !foundIds.includes(id));
      throw new ValidationError(
        `Some connections not found or access denied: ${missingIds.join(', ')}`
      );
    }

    // Validate leads belong to user
    const leads = await prisma.lead.findMany({
      where: {
        id: { in: leadIds },
        userId: user.id
      },
      select: { id: true }
    });

    if (leads.length !== leadIds.length) {
      const foundIds = leads.map(l => l.id);
      const missingIds = leadIds.filter((id: string) => !foundIds.includes(id));
      throw new ValidationError(
        `Some leads not found or access denied: ${missingIds.join(', ')}`
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

    // Perform pixel sync
    const syncResults = await pixelService.syncLeadsToPixels(leadIds, connectionIds, syncType);
    
    // Log sync results to database (commented out - no pixelSyncLog model)
    // for (const result of syncResults) {
    //   await prisma.pixelSyncLog.create({
    //     data: {
    //       userId: user.id,
    //       connectionId: result.connectionId,
    //       syncId: result.syncId,
    //       platformType: result.platformType,
    //       syncType,
    //       leadCount: result.leadCount,
    //       syncedCount: result.syncedCount,
    //       failedCount: result.failedCount,
    //       success: result.success,
    //       errors: result.errors || [],
    //       metadata: {
    //         requestId,
    //         timestamp: result.timestamp.toISOString(),
    //         leadIds: leadIds.slice(0, 100), // Limit stored lead IDs
    //       },
    //       createdAt: new Date(),
    //     }
    //   });

    for (const result of syncResults) {
      // Update last sync time for successful syncs
      if (result.success && result.syncedCount > 0) {
        await prisma.pixelConnection.update({
          where: { id: result.connectionId },
          data: { 
            lastSyncAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
    }

    // Calculate summary statistics
    const totalSynced = syncResults.reduce((sum, result) => sum + result.syncedCount, 0);
    const totalFailed = syncResults.reduce((sum, result) => sum + result.failedCount, 0);
    const successfulPlatforms = syncResults.filter(result => result.success).length;

    return NextResponse.json(
      formatSuccessResponse({
        syncResults,
        summary: {
          totalConnections: connectionIds.length,
          totalLeads: leadIds.length,
          totalSynced,
          totalFailed,
          successfulPlatforms,
          syncType,
          timestamp: new Date().toISOString()
        }
      }, undefined),
      { status: 200 }
    );
  },
  {
    schema: PixelSyncSchema,
    requireAuth: true,
    rateLimit: { requests: 20, windowMs: 60000 } // 20 syncs per minute
  }
);

export const POST = pixelSyncHandler;