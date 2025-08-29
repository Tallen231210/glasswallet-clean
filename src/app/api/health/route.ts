import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { withPerformance } from '@/middleware/performance';
import { formatSuccessResponse } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

const baseHandler = withMiddleware(async (context) => {
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

// Wrap with performance middleware - cache for 1 minute, rate limit 60 requests per minute
const handler = withPerformance(baseHandler, {
  cache: true,
  rateLimit: { limit: 60, windowMs: 60000 },
  timeout: 5000
});

export const GET = handler;