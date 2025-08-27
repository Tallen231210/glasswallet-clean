/**
 * Error handling system for GlassWallet API
 */

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, unknown> | undefined;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown> | undefined
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, ApiError);
  }
}

// Specific error classes
export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown> | undefined) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, message: string = 'External service error') {
    super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', { service });
    this.name = 'ExternalServiceError';
  }
}

export class InsufficientCreditsError extends ApiError {
  constructor(required: number, available: number) {
    super(
      `Insufficient credits. Required: ${required}, Available: ${available}`,
      402,
      'INSUFFICIENT_CREDITS',
      { required, available }
    );
    this.name = 'InsufficientCreditsError';
  }
}

export class BusinessLogicError extends ApiError {
  constructor(message: string, details?: Record<string, unknown> | undefined) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', details);
    this.name = 'BusinessLogicError';
  }
}

export class FCRAComplianceError extends ApiError {
  constructor(message: string = 'FCRA compliance violation') {
    super(message, 403, 'FCRA_COMPLIANCE_ERROR');
    this.name = 'FCRAComplianceError';
  }
}

// Error response formatters
export function formatErrorResponse(error: unknown, requestId?: string) {
  const timestamp = new Date().toISOString();

  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      meta: {
        timestamp,
        requestId,
      },
    };
  }

  if (error instanceof Error) {
    // Log unexpected errors for debugging
    console.error('Unexpected error:', error);

    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message,
      },
      meta: {
        timestamp,
        requestId,
      },
    };
  }

  // Handle non-Error objects
  console.error('Non-error thrown:', error);

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    },
    meta: {
      timestamp,
      requestId,
    },
  };
}

// Success response formatter
export function formatSuccessResponse<T>(
  data: T,
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(pagination && { pagination }),
    },
  };
}

// Error code mapping for different scenarios
export const ERROR_CODES = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Business Logic
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  
  // External Services
  CRS_API_ERROR: 'CRS_API_ERROR',
  PIXEL_SYNC_ERROR: 'PIXEL_SYNC_ERROR',
  WEBHOOK_DELIVERY_FAILED: 'WEBHOOK_DELIVERY_FAILED',
  
  // FCRA Compliance
  CONSENT_REQUIRED: 'CONSENT_REQUIRED',
  DATA_RETENTION_VIOLATION: 'DATA_RETENTION_VIOLATION',
  UNAUTHORIZED_PII_ACCESS: 'UNAUTHORIZED_PII_ACCESS',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DAILY_QUOTA_EXCEEDED: 'DAILY_QUOTA_EXCEEDED',
  
  // System
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];