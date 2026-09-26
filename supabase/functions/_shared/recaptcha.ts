const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY');
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

// Check if reCAPTCHA is enabled (defaults to true if not set)
const RECAPTCHA_ENABLED = Deno.env.get('RECAPTCHA_ENABLED')?.toLowerCase() !== 'false';

// Minimum score threshold (0.0 to 1.0, higher = more likely human).
// 0.3 e não o 0.5 do exemplo da Google: navegadores com proteção de
// privacidade, VPN e telemóveis novos dão pontuações entre 0.3 e 0.5 a pessoas
// reais, e aqui recusar um cliente real custa muito mais do que um spam.
const MIN_SCORE_THRESHOLD = 0.3;

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export interface RecaptchaResult {
  valid: boolean;
  score?: number;
  error?: string;
  bypassed?: boolean;
}

/**
 * Verify reCAPTCHA v3 token
 * @param token - The reCAPTCHA token from the frontend
 * @param expectedAction - The expected action name (e.g., 'submit_quote')
 * @param clientIP - Optional client IP for additional validation
 */
export async function verifyRecaptcha(
  token: string | undefined,
  expectedAction: string,
  clientIP?: string
): Promise<RecaptchaResult> {
  // If reCAPTCHA is explicitly disabled via env var, bypass validation
  if (!RECAPTCHA_ENABLED) {
    console.log('[reCAPTCHA] Validation bypassed (RECAPTCHA_ENABLED=false)');
    return { valid: true, score: 1.0, bypassed: true };
  }

  // If no secret key configured, skip validation (development mode)
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('[reCAPTCHA] Secret key not configured, skipping validation');
    return { valid: true, score: 1.0, bypassed: true };
  }

  // If no token provided, BYPASS (resiliency): keep lead capture working even if client-side reCAPTCHA
  // is blocked, keys are missing on the frontend build, or script fails to load.
  if (!token) {
    console.warn('[reCAPTCHA] No token provided by client, bypassing validation');
    return { valid: true, score: MIN_SCORE_THRESHOLD, bypassed: true };
  }

  try {
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
    });

    if (clientIP) {
      params.append('remoteip', clientIP);
    }

    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    // Regra desde 2026-09-26: um problema NOSSO (API da Google em baixo, chave
    // secreta que não corresponde à do site, domínio por registar) nunca recusa
    // um pedido. Antes recusava — e como a CSP bloqueava o script, isso nunca
    // se viu; ao desbloquear, uma chave mal emparelhada teria recusado todos os
    // pedidos no CRM. Um bot não ganha nada com isto: já podia simplesmente
    // não mandar token. Só se recusa um token que a Google validou e que tem
    // pontuação de robô.
    if (!response.ok) {
      console.error('[reCAPTCHA] Verification API error, bypassing:', response.status);
      return { valid: true, bypassed: true, error: 'reCAPTCHA verification unavailable' };
    }

    const data: RecaptchaResponse = await response.json();

    // Check if verification succeeded
    if (!data.success) {
      // Chave secreta errada, token expirado ou de outra chave: não dá para
      // distinguir um erro de configuração nosso de um token forjado, e um bot
      // que forja tokens podia simplesmente não mandar nenhum. Deixa passar e
      // regista, para o erro de configuração aparecer nos logs da função.
      console.error('[reCAPTCHA] Token not verified, bypassing:', data['error-codes']);
      return { valid: true, bypassed: true, error: 'reCAPTCHA token not verified' };
    }

    // Verify action matches expected
    if (data.action && data.action !== expectedAction) {
      console.warn('[reCAPTCHA] Action mismatch:', data.action, 'vs', expectedAction);
      return { 
        valid: false, 
        error: 'Invalid reCAPTCHA action',
        score: data.score 
      };
    }

    // Check score threshold
    if (data.score !== undefined && data.score < MIN_SCORE_THRESHOLD) {
      console.warn('[reCAPTCHA] Low score:', data.score);
      return { 
        valid: false, 
        error: 'Suspicious activity detected',
        score: data.score 
      };
    }

    return { valid: true, score: data.score };

  } catch (error) {
    console.error('[reCAPTCHA] Verification error, bypassing:', error);
    return { valid: true, bypassed: true, error: 'reCAPTCHA verification error' };
  }
}
