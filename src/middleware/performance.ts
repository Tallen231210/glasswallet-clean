import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache configuration by endpoint
const cacheConfig: Record<string, number> = {
  '/api/analytics': 300000, // 5 minutes
  '/api/leads/analytics': 180000, // 3 minutes
  '/api/pixels/analytics': 300000, // 5 minutes
  '/api/health': 60000, // 1 minute
  '/api/auth/user': 120000, // 2 minutes
};

// Performance monitoring middleware
export class PerformanceMiddleware {
  private static instance: PerformanceMiddleware;
  private requestTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceMiddleware {
    if (!PerformanceMiddleware.instance) {
      PerformanceMiddleware.instance = new PerformanceMiddleware();
    }
    return PerformanceMiddleware.instance;
  }

  // Cache management
  setCacheItem(key: string, data: any, ttl: number = 300000) {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCacheItem(key: string) {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clearCache(pattern?: string) {
    if (pattern) {
      for (const [key] of cache) {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      }
    } else {
      cache.clear();
    }
  }

  // Performance monitoring
  startTimer(requestId: string) {
    this.requestTimes.set(requestId, Date.now());
  }

  endTimer(requestId: string): number {
    const startTime = this.requestTimes.get(requestId);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.requestTimes.delete(requestId);
    return duration;
  }

  // Response compression helper
  shouldCompress(contentType?: string): boolean {
    if (!contentType) return false;
    
    const compressibleTypes = [
      'application/json',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'text/xml',
      'application/xml'
    ];
    
    return compressibleTypes.some(type => contentType.includes(type));
  }

  // Rate limiting helper
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  checkRateLimit(clientId: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = `${clientId}:${Math.floor(now / windowMs)}`;
    
    const current = this.rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
    
    if (now > current.resetTime) {
      // Reset the counter
      current.count = 0;
      current.resetTime = now + windowMs;
    }
    
    current.count++;
    this.rateLimitStore.set(key, current);
    
    // Clean up old entries
    for (const [storeKey, value] of this.rateLimitStore) {
      if (now > value.resetTime) {
        this.rateLimitStore.delete(storeKey);
      }
    }
    
    return current.count <= limit;
  }
}

// Middleware factory for API routes
export function withPerformance(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    cache?: boolean;
    rateLimit?: { limit: number; windowMs: number };
    timeout?: number;
  } = {}
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const perf = PerformanceMiddleware.getInstance();
    const requestId = `${req.method}-${req.url}-${Date.now()}`;
    
    // Start performance timer
    perf.startTimer(requestId);
    
    try {
      // Rate limiting
      if (options.rateLimit) {
        const clientId = req.headers.get('x-forwarded-for') || 
                        req.headers.get('x-real-ip') || 
                        'anonymous';
        
        if (!perf.checkRateLimit(clientId, options.rateLimit.limit, options.rateLimit.windowMs)) {
          return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil(options.rateLimit.windowMs / 1000))
            }
          });
        }
      }
      
      // Check cache for GET requests
      if (options.cache && req.method === 'GET') {
        const cacheKey = `${req.method}:${req.url}`;
        const cached = perf.getCacheItem(cacheKey);
        
        if (cached) {
          const duration = perf.endTimer(requestId);
          
          return new NextResponse(JSON.stringify(cached), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'HIT',
              'X-Response-Time': `${duration}ms`,
              'Cache-Control': 'public, max-age=300'
            }
          });
        }
      }
      
      // Execute the handler with timeout
      const timeoutPromise = new Promise<NextResponse>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), options.timeout || 30000);
      });
      
      const response = await Promise.race([
        handler(req, context),
        timeoutPromise
      ]);
      
      const duration = perf.endTimer(requestId);
      
      // Cache successful GET responses
      if (options.cache && req.method === 'GET' && response.status === 200) {
        const responseText = await response.text();
        const responseData = JSON.parse(responseText);
        
        const cacheKey = `${req.method}:${req.url}`;
        const ttl = cacheConfig[new URL(req.url).pathname] || 300000;
        perf.setCacheItem(cacheKey, responseData, ttl);
        
        // Return new response with cache headers
        return new NextResponse(responseText, {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'X-Cache': 'MISS',
            'X-Response-Time': `${duration}ms`,
            'Cache-Control': `public, max-age=${Math.floor(ttl / 1000)}`
          }
        });
      }
      
      // Add performance headers
      response.headers.set('X-Response-Time', `${duration}ms`);
      
      // Log slow requests
      if (duration > 1000) {
        console.warn(`Slow API request: ${req.method} ${req.url} took ${duration}ms`);
      }
      
      return response;
      
    } catch (error) {
      const duration = perf.endTimer(requestId);
      
      console.error(`API Error: ${req.method} ${req.url}`, error);
      
      return new NextResponse(JSON.stringify({ 
        error: 'Internal Server Error',
        requestId 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Response-Time': `${duration}ms`
        }
      });
    }
  };
}

// Utility functions
export const performanceUtils = {
  // Clear all cache
  clearAllCache: () => {
    const perf = PerformanceMiddleware.getInstance();
    perf.clearCache();
  },
  
  // Clear specific cache pattern
  clearCachePattern: (pattern: string) => {
    const perf = PerformanceMiddleware.getInstance();
    perf.clearCache(pattern);
  },
  
  // Get cache statistics
  getCacheStats: () => {
    return {
      size: cache.size,
      entries: Array.from(cache.keys())
    };
  }
};