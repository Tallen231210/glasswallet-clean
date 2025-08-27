import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { CreateCreditTransactionSchema, CreditTransactionFilterSchema } from '@/lib/validation';
import { formatSuccessResponse, ValidationError, InsufficientCreditsError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

const createTransactionHandler = withMiddleware(
  async (context) => {
    const { validatedData, userId } = context as any;
    const { leadId, transactionType, costInCents, crsTransactionId, metadata } = validatedData;

    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // For pull transactions, check credit balance
    if (transactionType === 'pull' && costInCents > 0) {
      if (user.creditBalance < costInCents) {
        throw new InsufficientCreditsError(costInCents, user.creditBalance);
      }
    }

    // If leadId provided, verify it belongs to user
    if (leadId) {
      const lead = await prisma.lead.findFirst({
        where: { 
          id: leadId,
          userId: user.id 
        }
      });
      
      if (!lead) {
        throw new ValidationError('Lead not found or does not belong to user');
      }
    }

    // Create transaction within a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Calculate balance values
      const creditBalanceBefore = user.creditBalance;
      let creditBalanceAfter = creditBalanceBefore;
      
      switch (transactionType) {
        case 'purchase':
          creditBalanceAfter = creditBalanceBefore + costInCents;
          break;
        case 'pull':
          creditBalanceAfter = creditBalanceBefore - costInCents;
          break;
        case 'refund':
          creditBalanceAfter = creditBalanceBefore + Math.abs(costInCents);
          break;
        default:
          creditBalanceAfter = creditBalanceBefore;
      }

      // Create credit transaction
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: user.id,
          leadId,
          transactionType,
          costInCents,
          crsTransactionId,
          metadata: metadata || {},
          createdAt: new Date(),
          creditBalanceBefore,
          creditBalanceAfter,
        },
        ...(leadId && {
          include: {
            lead: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        })
      });

      // Update user credit balance
      await tx.user.update({
        where: { id: user.id },
        data: { 
          creditBalance: creditBalanceAfter,
          updatedAt: new Date()
        }
      });

      return transaction;
    });

    return NextResponse.json(
      formatSuccessResponse(result),
      { status: 201 }
    );
  },
  {
    schema: CreateCreditTransactionSchema,
    requireAuth: true,
    rateLimit: { requests: 200, windowMs: 60000 }
  }
);

const getTransactionsHandler = withMiddleware(
  async (context) => {
    const { validatedData, userId } = context as any;
    const { page, limit, transactionType, dateFrom, dateTo } = validatedData;

    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Build where clause
    const where: any = { userId: user.id };
    
    if (transactionType) {
      where.transactionType = transactionType;
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    // Get total count
    const total = await prisma.creditTransaction.count({ where });
    
    // Get transactions with pagination
    const transactions = await prisma.creditTransaction.findMany({
      where,
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const pages = Math.ceil(total / limit);
    
    return NextResponse.json(
      formatSuccessResponse(transactions, {
        page,
        limit,
        total,
        pages
      })
    );
  },
  {
    schema: CreditTransactionFilterSchema,
    requireAuth: true,
    rateLimit: { requests: 200, windowMs: 60000 }
  }
);

export const POST = createTransactionHandler;
export const GET = getTransactionsHandler;