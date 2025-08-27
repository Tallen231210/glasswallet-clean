import { NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { pixelService } from '@/services/pixel';

const testPixelConnectionHandler = withMiddleware(
  async (context) => {
    const { params, userId, requestId } = context as any;
    const connectionId = params.id;
    
    if (!connectionId) {
      throw new ValidationError('Connection ID is required');
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId || 'mock-user-id' }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Find connection and ensure it belongs to user
    const connection = await prisma.pixelConnection.findFirst({
      where: {
        id: connectionId,
        userId: user.id
      }
    });

    if (!connection) {
      throw new ValidationError('Connection not found or access denied');
    }

    // Test the pixel connection
    const testResult = await pixelService.testPixelConnection(connectionId);
    
    // Update connection status based on test result
    const newStatus = testResult.success ? 'active' : 'error';
    
    if (connection.connectionStatus !== newStatus) {
      await prisma.pixelConnection.update({
        where: { id: connectionId },
        data: { 
          connectionStatus: newStatus,
          updatedAt: new Date()
        }
      });
    }

    // Log the test result (commented out - no pixelConnectionTest model)
    // await prisma.pixelConnectionTest.create({
    //   data: {
    //     connectionId,
    //     userId: user.id,
    //     success: testResult.success,
    //     message: testResult.message,
    //     latency: testResult.latency,
    //     metadata: {
    //       requestId,
    //       platformType: connection.platformType,
    //       timestamp: new Date().toISOString()
    //     },
    //     createdAt: new Date(),
    //   }
    // });

    return NextResponse.json(
      formatSuccessResponse({
        connectionId,
        connectionName: connection.connectionName,
        platformType: connection.platformType,
        testResult,
        statusUpdated: connection.connectionStatus !== newStatus,
        newStatus: connection.connectionStatus !== newStatus ? newStatus : connection.connectionStatus
      }, undefined)
    );
  },
  {
    requireAuth: true,
    rateLimit: { requests: 30, windowMs: 60000 } // 30 tests per minute
  }
);

export const POST = testPixelConnectionHandler;