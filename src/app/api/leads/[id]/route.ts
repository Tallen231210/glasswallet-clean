import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { IdSchema, UpdateLeadCreditSchema } from '@/lib/validation';
import { formatSuccessResponse, NotFoundError, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

const getLeadHandler = withMiddleware(
  async (context) => {
    const { userId, params } = context as any;
    const resolvedParams = params ? await params : {};
    const { id } = resolvedParams;

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
        id,
        userId: user.id 
      },
      include: {
        leadTags: {
          include: {
            rule: {
              select: { ruleName: true }
            }
          }
        },
        creditTransactions: {
          select: {
            costInCents: true,
            createdAt: true,
            transactionType: true,
            crsTransactionId: true
          }
        }
      }
    });

    if (!lead) {
      throw new NotFoundError('Lead');
    }

    return NextResponse.json(formatSuccessResponse(lead));
  },
  {
    requireAuth: true,
    rateLimit: { requests: 300, windowMs: 60000 }
  }
);

const updateLeadCreditHandler = withMiddleware(
  async (context) => {
    const { validatedData, userId, params } = context as any;
    const resolvedParams = params ? await params : {};
    const { id } = resolvedParams;
    const { creditScore, incomeEstimate, ssnHash } = validatedData;

    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Find and update lead
    const lead = await prisma.lead.findFirst({
      where: { 
        id,
        userId: user.id 
      }
    });

    if (!lead) {
      throw new NotFoundError('Lead');
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        creditScore,
        incomeEstimate,
        ssnHash,
        processedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        leadTags: {
          include: {
            rule: {
              select: { ruleName: true }
            }
          }
        }
      }
    });

    return NextResponse.json(formatSuccessResponse(updatedLead));
  },
  {
    schema: UpdateLeadCreditSchema,
    requireAuth: true,
    rateLimit: { requests: 100, windowMs: 60000 }
  }
);

const deleteLeadHandler = withMiddleware(
  async (context) => {
    const { userId, params } = context as any;
    const resolvedParams = params ? await params : {};
    const { id } = resolvedParams;

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
        id,
        userId: user.id 
      }
    });

    if (!lead) {
      throw new NotFoundError('Lead');
    }

    // Delete lead (cascading delete will handle related records)
    await prisma.lead.delete({
      where: { id }
    });

    return NextResponse.json(
      formatSuccessResponse({ 
        message: 'Lead deleted successfully',
        deletedId: id 
      })
    );
  },
  {
    requireAuth: true,
    rateLimit: { requests: 50, windowMs: 60000 }
  }
);

export const GET = getLeadHandler;
export const PUT = updateLeadCreditHandler;
export const DELETE = deleteLeadHandler;