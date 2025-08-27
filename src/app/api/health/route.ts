import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

const handler = withMiddleware(async (context) => {
  const { requestId } = context;

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      database: 'connected',
      uptime: process.uptime(),
      requestId,
    };

    return NextResponse.json(formatSuccessResponse(healthData));
  } catch (error) {
    const healthData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      database: 'disconnected',
      uptime: process.uptime(),
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(formatSuccessResponse(healthData), { status: 503 });
  }
});

export const GET = handler;