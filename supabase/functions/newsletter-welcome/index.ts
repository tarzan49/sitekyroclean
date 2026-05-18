import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

interface NewsletterRequest {
  email: string;
  name?: string;
  recaptchaToken?: string;
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
  const rateLimit = checkRateLimit(`newsletter-welcome:${clientIP}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!rateLimit.allowed) {
    safeLog('warn', 'Rate limit exceeded for newsletter-welcome', { ip: clientIP });
    return createErrorResponse(
      "Too many requests. Please try again later.",
      429,
      getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt)
    );
  }

  try {
    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      safeLog('error', 'RESEND_API_KEY not configured');
      return createErrorResponse("Service temporarily unavailable", 503);
    }

    const resend = new Resend(resendApiKey);

    // Parse request body with error handling
    let body: NewsletterRequest;
    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid request format", 400);
    }

    // Check for injection attempts
    if (hasHeaderInjection(JSON.stringify(body))) {
      safeLog('warn', 'Header injection attempt detected in newsletter-welcome', { ip: clientIP });
      return createErrorResponse("Invalid request data", 400);
    }

    // Verify reCAPTCHA token (optional - rate limiting provides backup protection)
    if (body.recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(body.recaptchaToken, 'newsletter_subscribe', clientIP);
      if (!recaptchaResult.valid) {
        safeLog('warn', 'reCAPTCHA verification failed', { 
          ip: clientIP, 
          error: recaptchaResult.error,
          score: recaptchaResult.score 
        });
        // Continue anyway - rate limiting provides protection
      }
    } else {
      safeLog('info', 'reCAPTCHA token not provided, relying on rate limiting', { ip: clientIP });
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
    const displayName = name || "Cliente";

    // Save subscriber to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error: dbError } = await supabase
        .from('newsletter_subscribers')
        .upsert(
          { 
            email, 
            name: name || null, 
            source: 'popup_clean10' 
          },
          { onConflict: 'email' }
        );
      
      if (dbError) {
        safeLog('warn', 'Failed to save subscriber to database', { error: dbError.message });
        // Continue anyway - email sending is priority
      } else {
        safeLog('info', 'Subscriber saved to database');
      }
    }

    // Send welcome email using Resend
    const emailResponse = await resend.emails.send({
      from: "Kyro Clean Solutions <info@kyroclean.pt>",
      to: [email],
      subject: "Bem-vindo à Kyro Clean Solutions | O seu código exclusivo CLEAN10",
      html: `
        <!DOCTYPE html>
        <html lang="pt">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          <meta name="supported-color-schemes" content="light dark">
          <title>Bem-vindo à Clean Solutions</title>
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
          <style>
            @media (prefers-color-scheme: dark) {
              .dark-bg { background-color: #1a1a1a !important; }
              .dark-text { color: #f5f5f5 !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5; -webkit-font-smoothing: antialiased;">
          <!-- Wrapper Table -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
            <tr>
              <td style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                  
                  <!-- Premium Header -->
                  <tr>
                    <td style="background-color: #0D3C47; padding: 48px 40px; text-align: center;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="text-align: center;">
                            <!-- Logo Text -->
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase;">CLEAN</h1>
                            <h1 style="color: #BEB47D; margin: 4px 0 0; font-size: 32px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase;">SOLUTIONS</h1>
                            <div style="width: 60px; height: 2px; background-color: #BEB47D; margin: 20px auto 0;"></div>
                            <p style="color: rgba(255, 255, 255, 0.7); margin: 16px 0 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Limpeza Premium de Estofos</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Welcome Section -->
                  <tr>
                    <td style="padding: 48px 40px 32px;">
                      <h2 style="color: #0D3C47; margin: 0 0 24px; font-size: 28px; font-weight: 300; line-height: 1.3;">
                        ${displayName !== "Cliente" ? `Olá, <strong>${displayName}</strong>` : "Bem-vindo"}
                      </h2>
                      <p style="color: #666666; font-size: 16px; line-height: 1.7; margin: 0;">
                        É uma honra tê-lo(a) connosco. A <strong style="color: #0D3C47;">Clean Solutions</strong> é a referência nacional em limpeza profunda e impermeabilização premium de estofos.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Exclusive Discount Box -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0D3C47; border-radius: 12px; overflow: hidden;">
                        <tr>
                          <td style="padding: 32px; text-align: center;">
                            <p style="color: #BEB47D; margin: 0 0 8px; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase;">Oferta Exclusiva de Boas-Vindas</p>
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 16px auto;">
                              <tr>
                                <td style="background-color: #ffffff; border-radius: 8px; padding: 16px 32px;">
                                  <span style="color: #0D3C47; font-size: 36px; font-weight: 700; letter-spacing: 6px; font-family: 'Courier New', monospace;">CLEAN10</span>
                                </td>
                              </tr>
                            </table>
                            <p style="color: #ffffff; margin: 16px 0 0; font-size: 18px; font-weight: 300;">
                              <strong style="font-weight: 600;">10% de desconto</strong> no seu primeiro serviço
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- How to Use -->
                  <tr>
                    <td style="padding: 40px 40px 32px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-left: 3px solid #BEB47D; padding-left: 20px;">
                        <tr>
                          <td>
                            <p style="color: #0D3C47; margin: 0 0 8px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Como utilizar</p>
                            <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0;">
                              Mencione o código <strong style="color: #0D3C47;">CLEAN10</strong> ao solicitar o seu orçamento. O desconto será aplicado automaticamente ao valor final.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Services Section -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="color: #0D3C47; margin: 0 0 24px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Os Nossos Serviços Premium</p>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <!-- Service Row 1 -->
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="40" style="vertical-align: middle;">
                                  <div style="width: 32px; height: 32px; background-color: #f8f8f8; border-radius: 8px; text-align: center; line-height: 32px;">🛋️</div>
                                </td>
                                <td style="vertical-align: middle; padding-left: 12px;">
                                  <span style="color: #333333; font-size: 15px;">Limpeza Profunda de Sofás</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Service Row 2 -->
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="40" style="vertical-align: middle;">
                                  <div style="width: 32px; height: 32px; background-color: #f8f8f8; border-radius: 8px; text-align: center; line-height: 32px;">🛏️</div>
                                </td>
                                <td style="vertical-align: middle; padding-left: 12px;">
                                  <span style="color: #333333; font-size: 15px;">Higienização de Colchões</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Service Row 3 -->
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="40" style="vertical-align: middle;">
                                  <div style="width: 32px; height: 32px; background-color: #f8f8f8; border-radius: 8px; text-align: center; line-height: 32px;">🧶</div>
                                </td>
                                <td style="vertical-align: middle; padding-left: 12px;">
                                  <span style="color: #333333; font-size: 15px;">Limpeza de Carpetes e Alcatifas</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Service Row 4 -->
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="40" style="vertical-align: middle;">
                                  <div style="width: 32px; height: 32px; background-color: #f8f8f8; border-radius: 8px; text-align: center; line-height: 32px;">🪑</div>
                                </td>
                                <td style="vertical-align: middle; padding-left: 12px;">
                                  <span style="color: #333333; font-size: 15px;">Limpeza de Cadeiras Estofadas</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Service Row 5 -->
                        <tr>
                          <td style="padding: 12px 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="40" style="vertical-align: middle;">
                                  <div style="width: 32px; height: 32px; background-color: #f8f8f8; border-radius: 8px; text-align: center; line-height: 32px;">💧</div>
                                </td>
                                <td style="vertical-align: middle; padding-left: 12px;">
                                  <span style="color: #333333; font-size: 15px;">Impermeabilização Premium</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 0 40px 48px; text-align: center;">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://cleansolutions.com.pt/" style="height:56px;v-text-anchor:middle;width:280px;" arcsize="14%" stroke="f" fillcolor="#BEB47D">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;">Pedir Orçamento Agora</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="https://cleansolutions.com.pt/" target="_blank" style="display: inline-block; background-color: #BEB47D; color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; mso-hide: all;">
                        Pedir Orçamento Agora
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                  
                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <div style="height: 1px; background-color: #f0f0f0;"></div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 40px; text-align: center; background-color: #fafafa;">
                      <!-- Contact Info -->
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px;">
                        <tr>
                          <td style="padding: 0 16px; text-align: center;">
                            <p style="color: #666666; font-size: 14px; margin: 0;">📞 <a href="tel:932956558" style="color: #0D3C47; text-decoration: none; font-weight: 500;">932 956 558</a></p>
                          </td>
                          <td style="padding: 0 16px; text-align: center; border-left: 1px solid #e0e0e0;">
                            <p style="color: #666666; font-size: 14px; margin: 0;">✉️ <a href="mailto:cleansolutions.pt25@gmail.com" style="color: #0D3C47; text-decoration: none; font-weight: 500;">Email</a></p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Social Media -->
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px;">
                        <tr>
                          <td style="padding: 0 8px;">
                            <a href="https://www.instagram.com/cleansolutions.pt/" target="_blank" style="display: inline-block; width: 36px; height: 36px; background-color: #0D3C47; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; color: #ffffff; font-size: 16px;">📷</a>
                          </td>
                          <td style="padding: 0 8px;">
                            <a href="https://www.facebook.com/profile.php?id=61579858370858" target="_blank" style="display: inline-block; width: 36px; height: 36px; background-color: #0D3C47; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; color: #ffffff; font-size: 16px;">👥</a>
                          </td>
                          <td style="padding: 0 8px;">
                            <a href="https://wa.me/351932956558" target="_blank" style="display: inline-block; width: 36px; height: 36px; background-color: #0D3C47; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; color: #ffffff; font-size: 16px;">💬</a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Legal -->
                      <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 0;">
                        Kyro Clean Solutions · R. de António Cardoso 263, 4150-081 Porto
                      </p>
                      <p style="color: #bbbbbb; font-size: 11px; line-height: 1.5; margin: 16px 0 0;">
                        Recebeu este email porque subscreveu a nossa newsletter.<br>
                        <a href="https://kyroclean.pt/" style="color: #999999; text-decoration: underline;">Visitar website</a>
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    safeLog('info', 'Welcome email sent successfully');

    return createSuccessResponse(
      { message: "Welcome email sent successfully" },
      getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt)
    );
  } catch (error) {
    safeLog('error', 'Failed to send welcome email', {
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    });

    return createErrorResponse("Failed to send welcome email. Please try again later.", 500);
  }
});
