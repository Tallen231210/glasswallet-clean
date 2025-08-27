import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { CreatePixelConnectionSchema } from '@/lib/validation';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

const createPixelConnectionHandler = withMiddleware(
  async (context) => {
    const { validatedData, userId, requestId } = context as any;
    
    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Check if connection with same name already exists
    const existingConnection = await prisma.pixelConnection.findFirst({
      where: {
        userId: user.id,
        connectionName: validatedData.connectionName
      }
    });

    if (existingConnection) {
      throw new ValidationError('A connection with this name already exists');
    }

    // Create pixel connection
    const pixelConnection = await prisma.pixelConnection.create({
      data: {
        userId: user.id,
        platformType: validatedData.platformType,
        connectionName: validatedData.connectionName,
        pixelId: validatedData.pixelId,
        connectionStatus: 'inactive', // Start as inactive until validated
        syncSettings: validatedData.syncSettings || {
          autoSync: false,
          syncQualifiedOnly: true,
          syncWhitelisted: true,
          excludeBlacklisted: true,
          syncFrequency: 'daily'
        },
        oauthTokens: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(
      formatSuccessResponse(pixelConnection, undefined),
      { status: 201 }
    );
  },
  {
    schema: CreatePixelConnectionSchema,
    requireAuth: true,
    rateLimit: { requests: 10, windowMs: 60000 } // 10 connections per minute
  }
);

const getPixelConnectionsHandler = withMiddleware(
  async (context) => {
    const { userId } = context as any;
    
    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Get all pixel connections for user
    const connections = await prisma.pixelConnection.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        platformType: true,
        connectionName: true,
        pixelId: true,
        connectionStatus: true,
        syncSettings: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true,
        // Don't expose access tokens in list view
      }
    });

    return NextResponse.json(
      formatSuccessResponse(connections, undefined)
    );
  },
  {
    requireAuth: true,
    rateLimit: { requests: 60, windowMs: 60000 }
  }
);

export const POST = createPixelConnectionHandler;
export const GET = getPixelConnectionsHandler;