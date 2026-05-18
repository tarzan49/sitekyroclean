/**
 * Security utilities for edge functions
 */

// Standard CORS headers with security best practices
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Security headers for all responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

/**
 * Create a secure error response that doesn't expose internal details
 */
export function createErrorResponse(
  userMessage: string,
  statusCode: number,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: userMessage
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...securityHeaders,
        ...additionalHeaders
      }
    }
  );
}

/**
 * Create a success response
 */
export function createSuccessResponse(
  data: Record<string, unknown>,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      ...data
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...securityHeaders,
        ...additionalHeaders
      }
    }
  );
}

/**
 * Handle CORS preflight request
 */
export function handleCORS(): Response {
  return new Response(null, { 
    headers: {
      ...corsHeaders,
      ...securityHeaders,
    }
  });
}

/**
 * Safe logging - removes sensitive data
 */
export function safeLog(
  level: 'info' | 'warn' | 'error',
  message: string,
  context?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const sanitizedContext = context ? sanitizeLogContext(context) : undefined;
  
  const logEntry = {
    timestamp,
    level,
    message,
    ...(sanitizedContext && { context: sanitizedContext })
  };
  
  switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
}

/**
 * Remove sensitive fields from log context
 */
function sanitizeLogContext(context: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'email', 'password', 'token', 'apiKey', 'api_key', 'secret',
    'authorization', 'cookie', 'session', 'phone', 'telefone',
    'name', 'nome', 'address', 'endereco', 'ip'
  ];
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      // Mask sensitive data
      if (typeof value === 'string' && value.length > 0) {
        sanitized[key] = `[REDACTED:${value.length}chars]`;
      } else {
        sanitized[key] = '[REDACTED]';
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeLogContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Validate request method
 */
export function validateMethod(req: Request, allowedMethods: string[]): boolean {
  return allowedMethods.includes(req.method.toUpperCase());
}

/**
 * Check for suspicious request patterns
 */
export function isSuspiciousRequest(req: Request): boolean {
  const userAgent = req.headers.get('user-agent') || '';
  
  // Check for missing or suspicious user agents
  if (!userAgent || userAgent.length < 10) {
    return true;
  }
  
  // Common bot patterns (basic check)
  const botPatterns = [
    /curl/i,
    /wget/i,
    /python-requests/i,
    /go-http-client/i,
    /java\//i,
    /libwww/i,
  ];
  
  // Note: We don't block these, just flag them for monitoring
  // Real bots often spoof user agents anyway
  
  return false;
}
