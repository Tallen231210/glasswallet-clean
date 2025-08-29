import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    DEFAULT: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
    AUTH: { requests: 5, window: 60 * 1000 }, // 5 auth requests per minute
    CREDIT_PULL: { requests: 10, window: 60 * 1000 }, // 10 credit pulls per minute
    API_KEY: { requests: 1000, window: 60 * 1000 }, // 1000 API requests per minute
  },
  
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
  },
  
  // Session management
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD: 30 * 60 * 1000, // Refresh if expires in 30 minutes
  },
  
  // FCRA compliance
  FCRA: {
    DATA_RETENTION_DAYS: 2555, // ~7 years as per FCRA
    LOG_RETENTION_DAYS: 2555,
    AUDIT_LOG_FIELDS: ['user_id', 'action', 'resource', 'timestamp', 'ip_address'],
  },
  
  // Encryption
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    KEY_LENGTH: 32,
    IV_LENGTH: 12,
    TAG_LENGTH: 16,
  },
} as const;

// Input validation and sanitization
export class SecurityValidator {
  private static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static phoneRegex = /^\+?[\d\s\-\(\)\.]{10,}$/;
  private static ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>\"'&]/g, (match) => {
        const map: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;',
        };
        return map[match] || match;
      });
  }

  static validateEmail(email: string): boolean {
    return this.emailRegex.test(email) && email.length <= 254;
  }

  static validatePhone(phone: string): boolean {
    return this.phoneRegex.test(phone);
  }

  static validateSSN(ssn: string): boolean {
    const cleaned = ssn.replace(/\D/g, '');
    return this.ssnRegex.test(ssn) && cleaned !== '000000000' && cleaned !== '123456789';
  }

  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const config = SECURITY_CONFIG.PASSWORD;

    if (password.length < config.MIN_LENGTH) {
      errors.push(`Password must be at least ${config.MIN_LENGTH} characters long`);
    }

    if (config.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (config.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (config.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (config.REQUIRE_SYMBOLS && !/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateCreditScore(score: any): score is number {
    return typeof score === 'number' && score >= 300 && score <= 850;
  }
}

// Data encryption utilities
export class DataEncryption {
  private static getKey(): Buffer {
    const keyHex = process.env.ENCRYPTION_KEY;
    if (!keyHex) {
      throw new Error('ENCRYPTION_KEY environment variable not set');
    }
    return Buffer.from(keyHex, 'hex');
  }

  static encrypt(plaintext: string): string {
    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(SECURITY_CONFIG.ENCRYPTION.IV_LENGTH);
      const cipher = crypto.createCipher(SECURITY_CONFIG.ENCRYPTION.ALGORITHM, key);
      
      cipher.setAAD(Buffer.from('additional-data'));
      
      let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
      ciphertext += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return `${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const [ivHex, tagHex, ciphertext] = encryptedData.split(':');
      const key = this.getKey();
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      
      const decipher = crypto.createDecipher(SECURITY_CONFIG.ENCRYPTION.ALGORITHM, key);
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from('additional-data'));
      
      let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
      plaintext += decipher.final('utf8');
      
      return plaintext;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static hashPII(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

// FCRA compliance utilities
export class FCRACompliance {
  static readonly PERMISSIBLE_PURPOSES = [
    'credit_transaction',
    'employment_screening',
    'tenant_screening',
    'business_transaction',
    'collection_of_debt',
    'court_order',
    'insurance_underwriting',
  ] as const;

  static validatePermissiblePurpose(purpose: string): boolean {
    return this.PERMISSIBLE_PURPOSES.includes(purpose as any);
  }

  static createAuditLog(event: {
    user_id: string;
    action: string;
    resource: string;
    purpose?: string;
    ip_address?: string;
    user_agent?: string;
    additional_data?: Record<string, any>;
  }) {
    const auditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: event.user_id,
      action: event.action,
      resource: event.resource,
      purpose: event.purpose,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      additional_data: event.additional_data ? JSON.stringify(event.additional_data) : null,
    };

    // In production, this would be stored in a secure, immutable audit log
    console.log('FCRA Audit Log:', auditEntry);
    
    return auditEntry;
  }

  static checkDataRetention(createdAt: Date): {
    expired: boolean;
    daysRemaining: number;
  } {
    const now = new Date();
    const ageInMs = now.getTime() - createdAt.getTime();
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
    const daysRemaining = SECURITY_CONFIG.FCRA.DATA_RETENTION_DAYS - ageInDays;

    return {
      expired: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining),
    };
  }
}

// Security headers middleware
export function getSecurityHeaders() {
  return {
    // HTTPS enforcement
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com https://maps.googleapis.com wss:",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
    
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
    ].join(', '),
    
    // Cache Control for sensitive routes
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

// Request validation utilities
export class RequestValidator {
  static validateApiKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') return false;
    
    // API keys should be at least 32 characters
    if (apiKey.length < 32) return false;
    
    // Check if it matches expected format (alphanumeric with optional dashes/underscores)
    return /^[a-zA-Z0-9_-]+$/.test(apiKey);
  }

  static extractClientIP(req: NextRequest): string {
    return (
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      req.ip ||
      'unknown'
    );
  }

  static getUserAgent(req: NextRequest): string {
    return req.headers.get('user-agent') || 'unknown';
  }

  static validateJSONPayload(payload: any, maxSize: number = 1024 * 1024): boolean {
    try {
      const jsonString = JSON.stringify(payload);
      return jsonString.length <= maxSize;
    } catch {
      return false;
    }
  }
}

// PII detection and masking
export class PIIProtection {
  private static patterns = {
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(?:\+?1[-.\s]?)?\(?[2-9][0-8][0-9]\)?[-.\s]?[2-9][0-9]{2}[-.\s]?[0-9]{4}\b/g,
  };

  static detectPII(text: string): { type: string; matches: string[] }[] {
    const results: { type: string; matches: string[] }[] = [];
    
    Object.entries(this.patterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        results.push({ type, matches });
      }
    });
    
    return results;
  }

  static maskPII(text: string): string {
    let maskedText = text;
    
    // Mask SSNs: 123-45-6789 -> ***-**-6789
    maskedText = maskedText.replace(this.patterns.ssn, (match) => {
      const cleaned = match.replace(/\D/g, '');
      return `***-**-${cleaned.slice(-4)}`;
    });
    
    // Mask credit cards: 1234-5678-9012-3456 -> ****-****-****-3456
    maskedText = maskedText.replace(this.patterns.creditCard, (match) => {
      const cleaned = match.replace(/\D/g, '');
      const lastFour = cleaned.slice(-4);
      return `****-****-****-${lastFour}`;
    });
    
    // Mask emails: user@example.com -> u***@example.com
    maskedText = maskedText.replace(this.patterns.email, (match) => {
      const [username, domain] = match.split('@');
      const maskedUsername = username[0] + '*'.repeat(Math.max(0, username.length - 1));
      return `${maskedUsername}@${domain}`;
    });
    
    // Mask phone numbers: (555) 123-4567 -> (***) ***-4567
    maskedText = maskedText.replace(this.patterns.phone, (match) => {
      const cleaned = match.replace(/\D/g, '');
      const lastFour = cleaned.slice(-4);
      return `(***) ***-${lastFour}`;
    });
    
    return maskedText;
  }

  static shouldLogPII(): boolean {
    return process.env.NODE_ENV === 'development';
  }
}

// Security monitoring
export class SecurityMonitor {
  private static suspiciousPatterns = [
    /(\bSELECT\b|\bUNION\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b)/i, // SQL injection
    /(<script|javascript:|vbscript:|onload=|onerror=)/i, // XSS
    /(\.\.\/|\.\.\\)/g, // Path traversal
    /(\bexec\b|\beval\b|\bsystem\b|\bpassthru\b)/i, // Command injection
  ];

  static detectSuspiciousInput(input: string): {
    suspicious: boolean;
    patterns: string[];
  } {
    const detectedPatterns: string[] = [];
    
    this.suspiciousPatterns.forEach((pattern) => {
      if (pattern.test(input)) {
        detectedPatterns.push(pattern.source);
      }
    });
    
    return {
      suspicious: detectedPatterns.length > 0,
      patterns: detectedPatterns,
    };
  }

  static logSecurityEvent(event: {
    type: 'suspicious_input' | 'rate_limit_exceeded' | 'invalid_auth' | 'pii_access';
    severity: 'low' | 'medium' | 'high' | 'critical';
    user_id?: string;
    ip_address: string;
    user_agent: string;
    details: Record<string, any>;
  }) {
    const securityLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event,
    };
    
    // In production, send to security monitoring service
    console.warn('Security Event:', securityLog);
    
    // For critical events, send immediate alerts
    if (event.severity === 'critical') {
      console.error('CRITICAL SECURITY EVENT:', securityLog);
      // Would trigger immediate notification to security team
    }
    
    return securityLog;
  }
}