import { NextRequest, NextResponse } from 'next/server';
import { 
  getSecurityHeaders, 
  RequestValidator, 
  SecurityMonitor, 
  PIIProtection,
  SecurityValidator 
} from '@/lib/security';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security middleware
export function withSecurity(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    rateLimit?: { requests: number; windowMs: number };
    validatePII?: boolean;
    logRequests?: boolean;
  } = {}
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now();
    const clientIP = RequestValidator.extractClientIP(req);
    const userAgent = RequestValidator.getUserAgent(req);
    
    try {
      // 1. Rate Limiting
      if (options.rateLimit) {
        const rateLimitKey = `${clientIP}:${req.nextUrl.pathname}`;
        const now = Date.now();
        const windowKey = `${rateLimitKey}:${Math.floor(now / options.rateLimit.windowMs)}`;
        
        const current = rateLimitStore.get(windowKey) || { 
          count: 0, 
          resetTime: now + options.rateLimit.windowMs 
        };
        
        current.count++;
        rateLimitStore.set(windowKey, current);
        
        // Clean up old entries
        for (const [key, value] of rateLimitStore) {
          if (now > value.resetTime) {
            rateLimitStore.delete(key);
          }
        }
        
        if (current.count > options.rateLimit.requests) {
          SecurityMonitor.logSecurityEvent({
            type: 'rate_limit_exceeded',
            severity: 'medium',
            ip_address: clientIP,
            user_agent: userAgent,
            details: {
              path: req.nextUrl.pathname,
              limit: options.rateLimit.requests,
              windowMs: options.rateLimit.windowMs,
            },
          });
          
          return new NextResponse(
            JSON.stringify({ 
              error: 'Rate limit exceeded',
              retryAfter: Math.ceil((current.resetTime - now) / 1000) 
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(Math.ceil((current.resetTime - now) / 1000)),
                ...getSecurityHeaders(),
              },
            }
          );
        }
      }
      
      // 2. Input Validation and Security Scanning
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        try {
          const body = await req.text();
          
          // Check for suspicious patterns
          const suspiciousCheck = SecurityMonitor.detectSuspiciousInput(body);
          if (suspiciousCheck.suspicious) {
            SecurityMonitor.logSecurityEvent({
              type: 'suspicious_input',
              severity: 'high',
              ip_address: clientIP,
              user_agent: userAgent,
              details: {
                path: req.nextUrl.pathname,
                patterns: suspiciousCheck.patterns,
                bodyLength: body.length,
              },
            });
            
            return new NextResponse(
              JSON.stringify({ error: 'Invalid request format' }),
              {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                  ...getSecurityHeaders(),
                },
              }
            );
          }
          
          // PII Detection and Logging
          if (options.validatePII) {
            const piiDetected = PIIProtection.detectPII(body);
            if (piiDetected.length > 0) {
              SecurityMonitor.logSecurityEvent({
                type: 'pii_access',
                severity: 'medium',
                ip_address: clientIP,
                user_agent: userAgent,
                details: {
                  path: req.nextUrl.pathname,
                  piiTypes: piiDetected.map(p => p.type),
                },
              });
            }
          }
          
          // Reconstruct request with validated body
          const newRequest = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: body,
          });
          
          req = newRequest;
        } catch (error) {
          console.error('Error parsing request body:', error);
          return new NextResponse(
            JSON.stringify({ error: 'Invalid request body' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...getSecurityHeaders(),
              },
            }
          );
        }
      }
      
      // 3. Authentication Check
      if (options.requireAuth) {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
          SecurityMonitor.logSecurityEvent({
            type: 'invalid_auth',
            severity: 'low',
            ip_address: clientIP,
            user_agent: userAgent,
            details: {
              path: req.nextUrl.pathname,
              reason: 'missing_auth_header',
            },
          });
          
          return new NextResponse(
            JSON.stringify({ error: 'Authentication required' }),
            {
              status: 401,
              headers: {
                'Content-Type': 'application/json',
                ...getSecurityHeaders(),
              },
            }
          );
        }
        
        // Validate API key format
        const token = authHeader.replace('Bearer ', '');
        if (!RequestValidator.validateApiKey(token)) {
          SecurityMonitor.logSecurityEvent({
            type: 'invalid_auth',
            severity: 'medium',
            ip_address: clientIP,
            user_agent: userAgent,
            details: {
              path: req.nextUrl.pathname,
              reason: 'invalid_token_format',
            },
          });
          
          return new NextResponse(
            JSON.stringify({ error: 'Invalid authentication token' }),
            {
              status: 401,
              headers: {
                'Content-Type': 'application/json',
                ...getSecurityHeaders(),
              },
            }
          );
        }
      }
      
      // 4. Execute Handler
      const response = await handler(req, context);
      
      // 5. Apply Security Headers
      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      // 6. Request Logging
      if (options.logRequests) {
        const duration = Date.now() - startTime;
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.nextUrl.pathname,
          status: response.status,
          duration: `${duration}ms`,
          ip: clientIP,
          userAgent: userAgent.slice(0, 100), // Truncate long user agents
        }));
      }
      
      return response;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error('Security middleware error:', error);
      
      SecurityMonitor.logSecurityEvent({
        type: 'suspicious_input',
        severity: 'high',
        ip_address: clientIP,
        user_agent: userAgent,
        details: {
          path: req.nextUrl.pathname,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
        },
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Internal server error',
          requestId: crypto.randomUUID() 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...getSecurityHeaders(),
          },
        }
      );
    }
  };
}

// Specific security middleware presets
export const withBasicSecurity = (handler: Function) => 
  withSecurity(handler, { 
    rateLimit: { requests: 100, windowMs: 60000 },
    logRequests: true 
  });

export const withAuthSecurity = (handler: Function) => 
  withSecurity(handler, { 
    requireAuth: true,
    rateLimit: { requests: 50, windowMs: 60000 },
    logRequests: true 
  });

export const withPIISecurity = (handler: Function) => 
  withSecurity(handler, { 
    requireAuth: true,
    rateLimit: { requests: 20, windowMs: 60000 },
    validatePII: true,
    logRequests: true 
  });

// CSRF Token utilities
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();
  
  static generateToken(sessionId: string): string {
    const token = crypto.randomUUID();
    const expires = Date.now() + (30 * 60 * 1000); // 30 minutes
    
    this.tokens.set(sessionId, { token, expires });
    
    // Clean up expired tokens
    for (const [key, value] of this.tokens) {
      if (Date.now() > value.expires) {
        this.tokens.delete(key);
      }
    }
    
    return token;
  }
  
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    if (!stored) return false;
    
    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }
  
  static revokeToken(sessionId: string): void {
    this.tokens.delete(sessionId);
  }
}

// Content validation
export function validateRequestContent(req: NextRequest): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers.get('content-type');
    if (!contentType) {
      errors.push('Missing Content-Type header');
    } else if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      errors.push('Unsupported Content-Type');
    }
  }
  
  // Check Content-Length
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    errors.push('Request body too large');
  }
  
  // Check for required headers
  const requiredHeaders = ['user-agent'];
  for (const header of requiredHeaders) {
    if (!req.headers.get(header)) {
      errors.push(`Missing required header: ${header}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export default withSecurity;