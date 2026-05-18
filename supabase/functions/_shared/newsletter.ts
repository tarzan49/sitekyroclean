/**
 * Newsletter utility functions for MailerLite integration
 */

export interface NewsletterConfig {
  apiKey: string;
  apiUrl?: string;
}

export interface MailerLiteSubscriber {
  email: string;
  name?: string;
  fields?: Record<string, string | number>;
  type?: string;
}

export interface MailerLiteError {
  code: number;
  message: string;
}

/**
 * Get MailerLite configuration from environment
 */
export function getMailerLiteConfig(): NewsletterConfig {
  const apiKey = Deno.env.get("MAILERLITE_API_KEY");

  if (!apiKey) {
    throw new Error("MAILERLITE_API_KEY environment variable is not set");
  }

  return {
    apiKey,
    apiUrl: "https://api.mailerlite.com/api/v2",
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength = 254): string {
  return input.trim().slice(0, maxLength);
}

/**
 * Validate newsletter subscription data
 */
export function validateSubscriptionData(data: {
  email: string;
  name?: string;
}): { valid: boolean; error?: string } {
  // Validate email
  if (!data.email) {
    return { valid: false, error: "Email is required" };
  }

  const sanitizedEmail = sanitizeString(data.email.toLowerCase(), 254);
  if (!isValidEmail(sanitizedEmail)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Validate name if provided
  if (data.name) {
    const sanitizedName = sanitizeString(data.name, 100);
    if (sanitizedName.length === 0) {
      return { valid: false, error: "Name cannot be empty if provided" };
    }
  }

  return { valid: true };
}

/**
 * Create MailerLite API headers
 */
export function createMailerLiteHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-MailerLite-ApiKey": apiKey,
  };
}

/**
 * Handle MailerLite API errors
 */
export function handleMailerLiteError(error: any): string {
  if (error.error && error.error.message) {
    return error.error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

/**
 * CORS headers for Edge Functions
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
