import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from '../_shared/rate-limit.ts';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  handleCORS, 
  safeLog 
} from '../_shared/security.ts';
import { validateFormData, hasHeaderInjection } from '../_shared/validation.ts';
import { verifyRecaptcha } from '../_shared/recaptcha.ts';

// Rate limit: 5 requests per 10 minutes per IP
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes

interface NewsletterSubscriptionRequest {
  email: string;
  name?: string;
  groupId?: string;
  recaptchaToken?: string;
  customFields?: Record<string, string | number>;
}

interface MailerLiteResponse {
  id?: string;
  email?: string;
  name?: string;
  error?: {
    code: number;
    message: string;
  };
}

const MAILERLITE_API_KEY = Deno.env.get("MAILERLITE_API_KEY");
const MAILERLITE_API_URL = "https://api.mailerlite.com/api/v2";

/**
 * Subscribe user to MailerLite
 */
async function subscribeToMailerLite(
  email: string,
  name?: string,
  groupId?: string,
  customFields?: Record<string, string | number>
): Promise<MailerLiteResponse> {
  if (!MAILERLITE_API_KEY) {
    throw new Error("MAILERLITE_API_KEY is not configured");
  }

  // Prepare subscriber data
  const subscriberData: Record<string, unknown> = {
    email: email,
    type: "active",
  };

  if (name) {
    subscriberData.name = name;
  }

  if (customFields) {
    subscriberData.fields = customFields;
  }

  // Subscribe to group or general subscribers endpoint
  const endpoint = groupId
    ? `${MAILERLITE_API_URL}/groups/${encodeURIComponent(groupId)}/subscribers`
    : `${MAILERLITE_API_URL}/subscribers`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-MailerLite-ApiKey": MAILERLITE_API_KEY,
    },
    body: JSON.stringify(subscriberData),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error?.message || "Subscription failed");
  }

  return responseData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCORS();
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  const clientIP = getClientIP(req);

  // Check rate limit
  const rateLimit = checkRateLimit(`newsletter-subscribe:${clientIP}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!rateLimit.allowed) {
    safeLog('warn', 'Rate limit exceeded for newsletter-subscribe', { ip: clientIP });
    return createErrorResponse(
      "Too many requests. Please try again later.",
      429,
      getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt)
    );
  }

  try {
    // Parse request body with error handling
    let body: NewsletterSubscriptionRequest;
    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid request format", 400);
    }

    // Check for injection attempts
    const rawString = JSON.stringify(body);
    if (hasHeaderInjection(rawString)) {
      safeLog('warn', 'Header injection attempt detected in newsletter-subscribe', { ip: clientIP });
      return createErrorResponse("Invalid request data", 400);
    }

    // Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptcha(body.recaptchaToken, 'newsletter_subscribe', clientIP);
    if (!recaptchaResult.valid) {
      safeLog('warn', 'reCAPTCHA verification failed', { 
        ip: clientIP, 
        error: recaptchaResult.error,
        score: recaptchaResult.score 
      });
      return createErrorResponse(recaptchaResult.error || 'reCAPTCHA verification failed', 400);
    }

    // Validate using new validation system
    const validation = validateFormData(body, {
      email: { required: true, type: 'email' },
      name: { required: false, type: 'name', maxLength: 100 }
    });

    if (!validation.isValid) {
      return createErrorResponse(validation.errors[0] || "Invalid form data", 400);
    }

    const { email, name } = validation.sanitizedData;
    
    // Validate groupId if provided
    let groupId: string | undefined;
    if (body.groupId && typeof body.groupId === 'string') {
      groupId = body.groupId.slice(0, 50).replace(/[^a-zA-Z0-9_-]/g, '');
    }

    // Subscribe to MailerLite
    await subscribeToMailerLite(email, name, groupId, body.customFields);

    safeLog('info', 'Newsletter subscription successful');

    return createSuccessResponse(
      { message: "Successfully subscribed to newsletter" },
      getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt)
    );
  } catch (error) {
    safeLog('error', 'Newsletter subscription failed', {
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    });

    return createErrorResponse("Subscription failed. Please try again later.", 500);
  }
});
