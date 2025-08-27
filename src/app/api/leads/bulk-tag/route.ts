import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { BulkTagLeadsSchema } from '@/lib/validation';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

const bulkTagHandler = withMiddleware(
  async (context) => {
    const { validatedData, userId, requestId } = context as any;
    const { leadIds, tagType, tagReason } = validatedData;
    
    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Verify all leads belong to the user
    const leads = await prisma.lead.findMany({
      where: {
        id: { in: leadIds },
        userId: user.id
      },
      select: { id: true }
    });

    if (leads.length !== leadIds.length) {
      const foundIds = leads.map(lead => lead.id);
      const missingIds = leadIds.filter((id: string) => !foundIds.includes(id));
      throw new ValidationError(
        `Some leads not found or access denied: ${missingIds.join(', ')}`
      );
    }

    // For each lead, either create or update the tag
    const results = [];
    
    for (const leadId of leadIds) {
      try {
        // Check if tag already exists
        const existingTag = await prisma.leadTag.findFirst({
          where: {
            leadId,
            tagType
          }
        });

        if (existingTag) {
          // Update existing tag
          const updatedTag = await prisma.leadTag.update({
            where: { id: existingTag.id },
            data: {
              tagReason,
            }
          });
          
          results.push({
            leadId,
            tagId: updatedTag.id,
            action: 'updated'
          });
        } else {
          // Create new tag
          const newTag = await prisma.leadTag.create({
            data: {
              leadId,
              tagType,
              tagReason,
            }
          });
          
          results.push({
            leadId,
            tagId: newTag.id,
            action: 'created'
          });
        }
      } catch (error) {
        console.error(`Error tagging lead ${leadId}:`, error);
        results.push({
          leadId,
          action: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.action !== 'failed').length;
    const failureCount = results.filter(r => r.action === 'failed').length;

    return NextResponse.json(
      formatSuccessResponse({
        tagType,
        tagReason,
        totalRequested: leadIds.length,
        successCount,
        failureCount,
        results
      }, undefined),
      { status: successCount > 0 ? 200 : 400 }
    );
  },
  {
    schema: BulkTagLeadsSchema,
    requireAuth: true,
    rateLimit: { requests: 10, windowMs: 60000 } // Limited for bulk operations
  }
);

export const POST = bulkTagHandler;