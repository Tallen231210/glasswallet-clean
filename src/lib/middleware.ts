import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { formatErrorResponse } from './errors';

export interface MiddlewareContext {
  req: NextRequest;
  params?: Promise<Record<string, string>>;
  userId?: string;
  requestId: string;
}

export type ApiHandler<T = any> = (
  context: MiddlewareContext
) => Promise<NextResponse<T>>;

export type MiddlewareFunction = (
  context: MiddlewareContext,
  next: () => Promise<NextResponse>
) => Promise<NextResponse>;

export function createApiHandler(
  handler: ApiHandler,
  options: {
    schema?: z.ZodSchema;
    requireAuth?: boolean;
    rateLimit?: {
      requests: number;
      windowMs: number;
    };
  } = {}
) {
  return async (
    req: NextRequest,
    context: { params?: Promise<Record<string, string>> } = {}
  ): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    
    const middlewareContext: MiddlewareContext = {
      req,
      params: context.params,
      requestId,
    };

    try {
      // Apply CORS first for preflight requests
      if (middlewareContext.req.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
          },
        });
      }

      // Build middleware chain
      let handlerFn = () => handler(middlewareContext);

      if (options.rateLimit) {
        const rateLimitFn = await applyRateLimit(middlewareContext, handlerFn, options.rateLimit);
        handlerFn = rateLimitFn;
      }

      if (options.requireAuth) {
        const originalFn = handlerFn;
        handlerFn = () => applyAuthMiddleware(middlewareContext, originalFn);
      }

      if (options.schema) {
        const originalFn = handlerFn;
        handlerFn = () => applyValidationMiddleware(middlewareContext, originalFn, options.schema!);
      }

      const response = await handlerFn();
      
      // Add CORS headers to all responses
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    } catch (error) {
      console.error(`API Error [${requestId}]:`, error);
      
      return NextResponse.json(
        formatErrorResponse(error, requestId),
        { 
          status: error instanceof Error && 'statusCode' in error 
            ? (error as any).statusCode 
            : 500 
        }
      );
    }
  };
}


async function applyValidationMiddleware(
  context: MiddlewareContext,
  next: () => Promise<NextResponse>,
  schema: z.ZodSchema
): Promise<NextResponse> {
  try {
    let data: unknown;
    
    if (context.req.method === 'GET') {
      const url = new URL(context.req.url);
      const params = Object.fromEntries(url.searchParams.entries());
      const resolvedParams = context.params ? await context.params : {};
      data = { ...params, ...resolvedParams };
    } else {
      const contentType = context.req.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await context.req.json();
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await context.req.formData();
        data = Object.fromEntries(formData.entries());
      } else {
        throw new Error('Unsupported content type');
      }
    }
    
    const validated = schema.parse(data);
    
    // Store validated data in context for handler access
    (context as any).validatedData = validated;
    
    return await next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        formatErrorResponse(
          {
            message: 'Validation failed',
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            details: { issues: error.issues }
          } as any,
          context.requestId
        ),
        { status: 400 }
      );
    }
    throw error;
  }
}

async function applyAuthMiddleware(
  context: MiddlewareContext,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    let userId: string | null = null;
    
    // In development mode, use mock authentication
    if (process.env.NODE_ENV === 'development') {
      userId = 'mock-user-id';
    } else {
      // Get authentication from Clerk in production
      const { auth } = require('@clerk/nextjs/server');
      const { userId: clerkUserId } = await auth();
      userId = clerkUserId;
    }
    
    if (!userId) {
      return NextResponse.json(
        formatErrorResponse(
          {
            message: 'Authentication required',
            statusCode: 401,
            code: 'AUTHENTICATION_ERROR'
          } as any,
          context.requestId
        ),
        { status: 401 }
      );
    }

    // Add Clerk user ID to context
    context.userId = userId;
    
    return await next();
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      formatErrorResponse(
        {
          message: 'Authentication failed',
          statusCode: 401,
          code: 'AUTHENTICATION_ERROR'
        } as any,
        context.requestId
      ),
      { status: 401 }
    );
  }
}

// Simple in-memory rate limiting (production should use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function applyRateLimit(
  context: MiddlewareContext,
  next: () => Promise<NextResponse>,
  options: { requests: number; windowMs: number }
): Promise<() => Promise<NextResponse>> {
  const identifier = context.req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const now = Date.now();
  
  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
  
  const current = rateLimitStore.get(identifier);
  
  if (!current || current.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + options.windowMs
    });
    return next;
  }
  
  if (current.count >= options.requests) {
    return async () => NextResponse.json(
      formatErrorResponse(
        {
          message: 'Rate limit exceeded',
          statusCode: 429,
          code: 'RATE_LIMIT_ERROR',
          details: { 
            limit: options.requests,
            windowMs: options.windowMs,
            resetTime: current.resetTime
          }
        } as any,
        context.requestId
      ),
      { status: 429 }
    );
  }
  
  current.count++;
  return next;
}

export const withMiddleware = createApiHandler;