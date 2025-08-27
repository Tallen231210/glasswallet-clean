import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError, BusinessLogicError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { creditService } from '@/services/credit';

const creditPullHandler = withMiddleware(
  async (context) => {
    const { params, userId, requestId } = context as any;
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
        creditTransactions: {
          where: { transactionType: 'pull' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    
    if (!lead) {
      throw new ValidationError('Lead not found or access denied');
    }

    // Check if lead has given consent
    if (!lead.consentGiven) {
      throw new BusinessLogicError(
        'FCRA compliance requires explicit consent before credit pull',
        { leadId, consentGiven: false }
      );
    }

    // Check if lead already has a recent credit pull (within 24 hours)
    const recentPull = lead.creditTransactions[0];
    if (recentPull) {
      const hoursSinceLastPull = (Date.now() - new Date(recentPull.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastPull < 24) {
        throw new BusinessLogicError(
          'Credit pull already performed within last 24 hours',
          { 
            leadId, 
            lastPullDate: recentPull.createdAt,
            hoursSinceLastPull: Math.round(hoursSinceLastPull * 100) / 100
          }
        );
      }
    }

    // Prepare credit pull request data
    const creditPullData: any = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
    };
    
    // Only add optional fields if they exist
    if (lead.phone) creditPullData.phone = lead.phone;
    if (lead.address) creditPullData.address = lead.address;
    if (lead.city) creditPullData.city = lead.city;
    if (lead.state) creditPullData.state = lead.state;
    if (lead.zipCode) creditPullData.zipCode = lead.zipCode;

    // Validate credit pull data
    const validation = creditService.validateCreditPullData(creditPullData);
    if (!validation.valid) {
      throw new ValidationError(
        `Insufficient data for credit pull: ${validation.errors.join(', ')}`,
        { errors: validation.errors }
      );
    }

    // Perform the credit pull
    const creditResult = await creditService.pullCreditReport(
      creditPullData,
      user.id,
      lead.consentGiven
    );

    // Create credit transaction record
    const creditBalanceBefore = user.creditBalance;
    const creditBalanceAfter = creditBalanceBefore - creditResult.costInCents;
    
    const transaction = await prisma.creditTransaction.create({
      data: {
        leadId: lead.id,
        userId: user.id,
        transactionType: 'pull',
        costInCents: creditResult.costInCents,
        crsTransactionId: creditResult.transactionId,
        creditBalanceBefore,
        creditBalanceAfter,
        metadata: {
          success: creditResult.success,
          error: creditResult.error || null,
          requestId,
          pullDate: new Date().toISOString()
        }
      }
    });

    // If credit pull was successful, update lead with credit information
    if (creditResult.success && creditResult.data) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          creditScore: creditResult.data.creditScore,
          ...(creditResult.data.incomeEstimate !== undefined && {
            incomeEstimate: creditResult.data.incomeEstimate
          }),
          processedAt: new Date(),
          updatedAt: new Date(),
          // Store additional credit data in metadata if needed
          // metadata: {
          //   riskFactors: creditResult.data.riskFactors,
          //   reportId: creditResult.data.reportId,
          //   pullDate: creditResult.data.pullDate
          // }
        }
      });

      // TODO: Trigger auto-tagging rules based on credit score
      // This would be implemented as part of the lead tagging system
      
      return NextResponse.json(
        formatSuccessResponse({
          leadId: lead.id,
          creditScore: creditResult.data.creditScore,
          incomeEstimate: creditResult.data.incomeEstimate,
          transactionId: transaction.id,
          costInCents: creditResult.costInCents,
          success: true
        }, undefined),
        { status: 200 }
      );
    }

    // Credit pull failed
    if (creditResult.error) {
      return NextResponse.json(
        formatSuccessResponse({
          leadId: lead.id,
          transactionId: transaction.id,
          costInCents: creditResult.costInCents,
          success: false,
          error: creditResult.error
        }, undefined),
        { status: creditResult.error.retryable ? 503 : 400 }
      );
    }

    // This shouldn't happen, but handle the edge case
    throw new BusinessLogicError('Credit pull completed but no result data received');
  },
  {
    requireAuth: true,
    rateLimit: { requests: 20, windowMs: 60000 } // 20 credit pulls per minute max
  }
);

export const POST = creditPullHandler;