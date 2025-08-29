import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { pixelService } from '@/services/pixel';

interface TagAndSyncRequest {
  tags: string[];
  reason?: string;
  autoSync?: boolean;
  connectionIds?: string[];
}

const tagAndSyncHandler = withMiddleware(
  async (context, request) => {
    const { userId, requestId } = context as any;
    const { id } = context.params as { id: string };
    const body = await request.json() as TagAndSyncRequest;
    
    const { tags, reason, autoSync = true, connectionIds } = body;
    
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      throw new ValidationError('Tags array is required');
    }
    
    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Find lead
    const lead = await prisma.lead.findFirst({
      where: { 
        id: id,
        userId: user.id 
      }
    });
    
    if (!lead) {
      throw new ValidationError('Lead not found or access denied');
    }

    // Create lead tags
    const createdTags = [];
    for (const tagType of tags) {
      // Check if tag already exists
      const existingTag = await prisma.leadTag.findFirst({
        where: {
          leadId: lead.id,
          tagType: tagType as any
        }
      });
      
      if (!existingTag) {
        const newTag = await prisma.leadTag.create({
          data: {
            leadId: lead.id,
            tagType: tagType as any,
            tagReason: reason || 'Manual tag',
            taggedAt: new Date(),
            syncedToPixels: false
          }
        });
        createdTags.push(newTag);
      }
    }

    let syncResults = null;
    
    if (autoSync && createdTags.length > 0) {
      try {
        // Get user's active pixel connections
        let activeConnections = await prisma.pixelConnection.findMany({
          where: {
            userId: user.id,
            connectionStatus: 'active'
          }
        });

        // Filter by specific connections if provided
        if (connectionIds && connectionIds.length > 0) {
          activeConnections = activeConnections.filter(conn => 
            connectionIds.includes(conn.id)
          );
        }

        if (activeConnections.length > 0) {
          // Determine sync type based on tags
          const syncType = tags.includes('whitelist') ? 'whitelist' : 
                          tags.includes('qualified') ? 'qualified' : 
                          'all';

          // Perform pixel sync
          syncResults = await pixelService.syncLeadsToPixels(
            [lead.id], 
            activeConnections.map(conn => conn.id),
            syncType
          );

          // Update tag sync status for successful syncs
          const successfulSyncs = syncResults.filter(result => result.success);
          if (successfulSyncs.length > 0) {
            await prisma.leadTag.updateMany({
              where: {
                leadId: lead.id,
                tagType: { in: tags as any[] }
              },
              data: {
                syncedToPixels: true,
                pixelSyncAt: new Date()
              }
            });
          }
        }
      } catch (syncError) {
        console.error('Pixel sync error:', syncError);
        // Don't fail the tagging if sync fails
      }
    }

    // Get updated lead with tags
    const updatedLead = await prisma.lead.findFirst({
      where: { id: lead.id },
      include: {
        leadTags: true
      }
    });

    return NextResponse.json(
      formatSuccessResponse({
        lead: updatedLead,
        newTags: createdTags,
        pixelSync: syncResults ? {
          attempted: true,
          results: syncResults,
          successfulPlatforms: syncResults.filter(r => r.success).length,
          totalPlatforms: syncResults.length
        } : null
      }, `Lead tagged successfully${syncResults ? ' and synced to pixels' : ''}`)
    );
  },
  {
    requireAuth: true,
    rateLimit: { requests: 30, windowMs: 60000 } // 30 tag operations per minute
  }
);

export const POST = tagAndSyncHandler;