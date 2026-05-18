/**
 * Comprehensive input validation utilities for edge functions
 */

// Email validation - strict RFC 5322 compliant regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Phone validation - Portuguese format
const PHONE_REGEX = /^(\+351)?[0-9]{9}$/;

// Dangerous patterns for header injection
const HEADER_INJECTION_PATTERNS = [
  /[\r\n]/,           // CRLF injection
  /\x00/,             // Null byte
  /%0[aAdD]/gi,       // URL encoded newlines
];

// XSS patterns to detect
const XSS_PATTERNS = [
  /<script\b[^>]*>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /data:/gi,
  /vbscript:/gi,
];

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  return EMAIL_REGEX.test(email.toLowerCase().trim());
}

/**
 * Validate phone number (Portuguese format)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return PHONE_REGEX.test(cleaned);
}

/**
 * Check for header injection attempts
 */
export function hasHeaderInjection(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return HEADER_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Check for XSS patterns
 */
export function hasXSSPatterns(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Sanitize string input - removes dangerous characters
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters except tab, newline, carriage return
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sanitize email - lowercase and trim
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.toLowerCase().trim().slice(0, 254);
}

/**
 * Sanitize name - allow letters, spaces, hyphens, apostrophes
 */
export function sanitizeName(name: string, maxLength: number = 100): string {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .trim()
    .slice(0, maxLength)
    .replace(/[^\p{L}\p{M}\s\-']/gu, '') // Only allow letters, combining marks, spaces, hyphens, apostrophes
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^\d+]/g, '').slice(0, 15);
}

/**
 * Sanitize message/text content
 */
export function sanitizeMessage(message: string, maxLength: number = 5000): string {
  if (!message || typeof message !== 'string') return '';
  
  return message
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Validate and sanitize form data with comprehensive checks
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: Record<string, string>;
}

// deno-lint-ignore no-explicit-any
export function validateFormData(
  data: any,
  schema: {
    [key: string]: {
      required?: boolean;
      type: 'email' | 'name' | 'phone' | 'message' | 'string';
      maxLength?: number;
    }
  }
): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Record<string, string> = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check required
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip if not provided and not required
    if (!value) continue;
    
    // Type check
    if (typeof value !== 'string') {
      errors.push(`${field} must be a string`);
      continue;
    }
    
    // Check for injection attempts
    if (hasHeaderInjection(value)) {
      errors.push(`${field} contains invalid characters`);
      continue;
    }
    
    if (hasXSSPatterns(value)) {
      errors.push(`${field} contains invalid content`);
      continue;
    }
    
    // Type-specific validation and sanitization
    switch (rules.type) {
      case 'email':
        const sanitizedEmail = sanitizeEmail(value);
        if (!isValidEmail(sanitizedEmail)) {
          errors.push(`Invalid email format`);
        } else {
          sanitizedData[field] = sanitizedEmail;
        }
        break;
        
      case 'name':
        sanitizedData[field] = sanitizeName(value, rules.maxLength || 100);
        break;
        
      case 'phone':
        const sanitizedPhone = sanitizePhone(value);
        if (value && !isValidPhone(sanitizedPhone)) {
          errors.push(`Invalid phone format`);
        } else {
          sanitizedData[field] = sanitizedPhone;
        }
        break;
        
      case 'message':
        sanitizedData[field] = sanitizeMessage(value, rules.maxLength || 5000);
        break;
        
      case 'string':
      default:
        sanitizedData[field] = sanitizeString(value, rules.maxLength || 1000);
        break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}
