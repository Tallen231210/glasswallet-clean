import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { CreateUserSchema, UpdateUserSchema } from '@/lib/validation';
import { formatSuccessResponse, ValidationError, ConflictError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

const createUserHandler = withMiddleware(
  async (context) => {
    const { validatedData, requestId } = context as any;
    const { clerkUserId, email, firstName, lastName, organizationId } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkUserId },
          { email }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        clerkUserId,
        email,
        firstName,
        lastName,
        organizationId,
        subscriptionPlan: 'free',
        creditBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            leads: true,
            creditTransactions: true,
            pixelConnections: true,
            autoTaggingRules: true,
            webhooks: true
          }
        }
      }
    });

    return NextResponse.json(
      formatSuccessResponse(user),
      { status: 201 }
    );
  },
  {
    schema: CreateUserSchema,
    rateLimit: { requests: 10, windowMs: 60000 } // 10 registrations per minute
  }
);

const getUserHandler = withMiddleware(
  async (context) => {
    const { userId } = context as any;

    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' },
      include: {
        _count: {
          select: {
            leads: true,
            creditTransactions: true,
            pixelConnections: true,
            autoTaggingRules: true,
            webhooks: true
          }
        }
      }
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    return NextResponse.json(formatSuccessResponse(user));
  },
  {
    requireAuth: true,
    rateLimit: { requests: 100, windowMs: 60000 }
  }
);

const updateUserHandler = withMiddleware(
  async (context) => {
    const { validatedData, userId } = context as any;

    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            leads: true,
            creditTransactions: true,
            pixelConnections: true,
            autoTaggingRules: true,
            webhooks: true
          }
        }
      }
    });

    return NextResponse.json(formatSuccessResponse(updatedUser));
  },
  {
    schema: UpdateUserSchema,
    requireAuth: true,
    rateLimit: { requests: 20, windowMs: 60000 }
  }
);

export const POST = createUserHandler;
export const GET = getUserHandler;
export const PUT = updateUserHandler;