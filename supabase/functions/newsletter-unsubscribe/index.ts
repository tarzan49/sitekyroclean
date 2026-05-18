import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from '../_shared/rate-limit.ts';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  handleCORS, 
  safeLog 
} from '../_shared/security.ts';
import { validateFormData, hasHeaderInjection } from '../_shared/validation.ts';

// Rate limit: 5 requests per 10 minutes per IP
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes

interface NewsletterUnsubscribeRequest {
  email: string;
}

const MAILERLITE_API_KEY = Deno.env.get("MAILERLITE_API_KEY");
const MAILERLITE_API_URL = "https://api.mailerlite.com/api/v2";

/**
 * Unsubscribe user from MailerLite
 */
async function unsubscribeFromMailerLite(email: string): Promise<void> {
  if (!MAILERLITE_API_KEY) {
    throw new Error("MAILERLITE_API_KEY is not configured");
  }

  // First, find the subscriber by email
  const searchResponse = await fetch(
    `${MAILERLITE_API_URL}/subscribers/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        "X-MailerLite-ApiKey": MAILERLITE_API_KEY,
      },
    }
  );

  if (!searchResponse.ok) {
    if (searchResponse.status === 404) {
      throw new Error("Email not found");
    }
    throw new Error("Failed to find subscriber");
  }

  const subscriber = await searchResponse.json();

  // Unsubscribe the user
  const unsubscribeResponse = await fetch(
    `${MAILERLITE_API_URL}/subscribers/${subscriber.id}/unsubscribe`,
    {
      method: "POST",
      headers: {
        "X-MailerLite-ApiKey": MAILERLITE_API_KEY,
      },
    }
  );

  if (!unsubscribeResponse.ok) {
    throw new Error("Failed to unsubscribe");
  }
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
  const rateLimit = checkRateLimit(`newsletter-unsubscribe:${clientIP}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!rateLimit.allowed) {
    safeLog('warn', 'Rate limit exceeded for newsletter-unsubscribe', { ip: clientIP });
    return createErrorResponse(
      "Too many requests. Please try again later.",
      429,
      getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt)
    );
  }

  try {
    // Parse request body with error handling
    let body: NewsletterUnsubscribeRequest;
    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid request format", 400);
    }

    // Check for injection attempts
    if (hasHeaderInjection(JSON.stringify(body))) {
      safeLog('warn', 'Header injection attempt detected in newsletter-unsubscribe', { ip: clientIP });
      return createErrorResponse("Invalid request data", 400);
    }

    // Validate using new validation system
    const validation = validateFormData(body, {
      email: { required: true, type: 'email' }
    });

    if (!validation.isValid) {
      return createErrorResponse(validation.errors[0] || "Invalid email", 400);
    }

    const { email } = validation.sanitizedData;

    // Unsubscribe from MailerLite
    await unsubscribeFromMailerLite(email);

    safeLog('info', 'Newsletter unsubscription successful');

    return createSuccessResponse(
      { message: "Successfully unsubscribed from newsletter" },
      getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    safeLog('error', 'Newsletter unsubscription failed', {
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    });

    // Provide user-friendly error for "not found" case
    if (errorMessage === "Email not found") {
      return createErrorResponse("Email not found in our newsletter list.", 404);
    }

    return createErrorResponse("Unsubscription failed. Please try again later.", 500);
  }
});
