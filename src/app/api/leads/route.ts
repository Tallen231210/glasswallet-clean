import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { CreateLeadSchema, LeadFilterSchema } from '@/lib/validation';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

const createLeadHandler = withMiddleware(
  async (context) => {
    const { validatedData, userId, requestId } = context as any;
    
    // Find user to associate lead with
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Check if lead already exists by email
    const existingLead = await prisma.lead.findFirst({
      where: { 
        email: validatedData.email,
        userId: user.id
      }
    });
    
    if (existingLead) {
      throw new ValidationError('Lead with this email already exists');
    }

    // Create new lead
    const lead = await prisma.lead.create({
      data: {
        ...validatedData,
        userId: user.id,
        processed: false,
        createdAt: new Date(),
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

    return NextResponse.json(
      formatSuccessResponse(lead, undefined),
      { status: 201 }
    );
  },
  {
    schema: CreateLeadSchema,
    requireAuth: true,
    rateLimit: { requests: 100, windowMs: 60000 } // 100 requests per minute
  }
);

const getLeadsHandler = withMiddleware(
  async (context) => {
    const { validatedData, userId } = context as any;
    const { page, limit, tagType, processed, creditScoreMin, creditScoreMax } = validatedData;

    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Build where clause
    const where: any = { userId: user.id };
    
    if (processed !== undefined) {
      where.processed = processed;
    }
    
    if (creditScoreMin !== undefined || creditScoreMax !== undefined) {
      where.creditScore = {};
      if (creditScoreMin !== undefined) where.creditScore.gte = creditScoreMin;
      if (creditScoreMax !== undefined) where.creditScore.lte = creditScoreMax;
    }
    
    if (tagType) {
      where.leadTags = {
        some: { tagType }
      };
    }

    // Get total count
    const total = await prisma.lead.count({ where });
    
    // Get leads with pagination
    const leads = await prisma.lead.findMany({
      where,
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
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const pages = Math.ceil(total / limit);
    
    return NextResponse.json(
      formatSuccessResponse(leads, {
        page,
        limit,
        total,
        pages
      })
    );
  },
  {
    schema: LeadFilterSchema,
    requireAuth: true,
    rateLimit: { requests: 200, windowMs: 60000 } // 200 requests per minute
  }
);

export const POST = createLeadHandler;
export const GET = getLeadsHandler;