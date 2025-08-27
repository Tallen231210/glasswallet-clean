import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError, BusinessLogicError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const TagLeadSchema = z.object({
  tagType: z.enum(['qualified', 'unqualified', 'whitelist', 'blacklist']),
  tagReason: z.string().min(1).max(200),
  ruleId: z.string().cuid().optional(),
});

const tagLeadHandler = withMiddleware(
  async (context) => {
    const { params, validatedData, userId, requestId } = context as any;
    const leadId = params.id;
    
    if (!leadId) {
      throw new ValidationError('Lead ID is required');
    }

    // Find user to ensure they own this lead
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Find the lead and ensure it belongs to the user
    const lead = await prisma.lead.findFirst({
      where: { 
        id: leadId,
        userId: user.id
      },
      include: {
        leadTags: true
      }
    });
    
    if (!lead) {
      throw new ValidationError('Lead not found or access denied');
    }

    // Check if tag of this type already exists
    const existingTag = lead.leadTags.find(tag => tag.tagType === validatedData.tagType);
    
    if (existingTag) {
      // Update existing tag
      const updatedTag = await prisma.leadTag.update({
        where: { id: existingTag.id },
        data: {
          tagReason: validatedData.tagReason,
          ruleId: validatedData.ruleId || null,
        },
        include: {
          rule: {
            select: { ruleName: true }
          }
        }
      });

      return NextResponse.json(
        formatSuccessResponse({
          leadId,
          tag: updatedTag,
          action: 'updated'
        }, undefined),
        { status: 200 }
      );
    } else {
      // Create new tag
      const newTag = await prisma.leadTag.create({
        data: {
          leadId,
          tagType: validatedData.tagType,
          tagReason: validatedData.tagReason,
          ruleId: validatedData.ruleId || null,
        },
        include: {
          rule: {
            select: { ruleName: true }
          }
        }
      });

      return NextResponse.json(
        formatSuccessResponse({
          leadId,
          tag: newTag,
          action: 'created'
        }, undefined),
        { status: 201 }
      );
    }
  },
  {
    schema: TagLeadSchema,
    requireAuth: true,
    rateLimit: { requests: 100, windowMs: 60000 }
  }
);

const removeTagHandler = withMiddleware(
  async (context) => {
    const { params, userId } = context as any;
    const leadId = params.id;
    
    if (!leadId) {
      throw new ValidationError('Lead ID is required');
    }

    // Parse tagType from query params
    const { searchParams } = new URL(context.req.url);
    const tagType = searchParams.get('tagType');
    
    if (!tagType || !['qualified', 'unqualified', 'whitelist', 'blacklist'].includes(tagType)) {
      throw new ValidationError('Valid tagType parameter is required');
    }

    // Find user to ensure they own this lead
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Find the lead and ensure it belongs to the user
    const lead = await prisma.lead.findFirst({
      where: { 
        id: leadId,
        userId: user.id
      }
    });
    
    if (!lead) {
      throw new ValidationError('Lead not found or access denied');
    }

    // Find and remove the tag
    const deletedTag = await prisma.leadTag.deleteMany({
      where: {
        leadId,
        tagType: tagType as any
      }
    });

    if (deletedTag.count === 0) {
      throw new ValidationError(`No ${tagType} tag found for this lead`);
    }

    return NextResponse.json(
      formatSuccessResponse({
        leadId,
        tagType,
        action: 'removed',
        deletedCount: deletedTag.count
      }, undefined),
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    rateLimit: { requests: 100, windowMs: 60000 }
  }
);

export const POST = tagLeadHandler;
export const DELETE = removeTagHandler;