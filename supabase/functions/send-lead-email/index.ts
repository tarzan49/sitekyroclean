// Canal de email dos pedidos (quiz e contacto simples), agora via Resend em vez
// de Formspree. Corre à parte de `submit-lead` de propósito: os dois canais
// (CRM e email) são chamados em paralelo pelo browser via Promise.allSettled,
// e se ambos dependessem desta mesma função uma falha aqui perderia os dois de
// uma vez. Ver `src/services/submissionService.ts`.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "../_shared/rate-limit.ts";
import { createErrorResponse, createSuccessResponse, handleCORS, safeLog, validateMethod } from "../_shared/security.ts";
import { hasHeaderInjection } from "../_shared/validation.ts";
import { verifyRecaptcha } from "../_shared/recaptcha.ts";

const RATE_LIMIT_MAX = 8;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

const RECAPTCHA_ACTION = "submit_quote";

// Mesmos campos e limites que `submit-lead` aceita para a tabela `leads` — os
// dois canais recebem o mesmo lead, só o destino muda.
const LEAD_FIELDS = [
  "name", "phone", "email", "service", "service_type", "details",
  "location", "value", "booking_id", "message", "notes",
] as const;

const MAX_LENGTHS: Record<string, number> = {
  name: 120, phone: 40, email: 160, service: 120, service_type: 120,
  details: 4000, location: 120, value: 60, booking_id: 40,
  message: 8000, notes: 4000,
};

const SUBJECT_MAX_LENGTH = 200;

const FIELD_LABELS: Record<string, string> = {
  service: "Serviço", service_type: "Tipo", details: "Detalhes",
  location: "Localização", value: "Valor", booking_id: "Referência", notes: "Notas",
};

interface SendLeadEmailRequest {
  lead?: Record<string, unknown>;
  subject?: string;
  recaptchaToken?: string;
}

function cleanLead(raw: Record<string, unknown>): Record<string, string> | null {
  const out: Record<string, string> = {};
  for (const field of LEAD_FIELDS) {
    const value = raw[field];
    if (value === undefined || value === null || value === "") continue;
    if (typeof value !== "string") return null;
    out[field] = value.slice(0, MAX_LENGTHS[field] ?? 1000);
  }
  // O contacto simples permite telefone em branco (só o email é obrigatório
  // nesse formulário) — ao contrário de `submit-lead`, que serve só o quiz e
  // sempre exige telefone. Aqui basta nome e pelo menos um contacto.
  if (!out.name || (!out.phone && !out.email)) return null;
  return out;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildEmailHtml(lead: Record<string, string>): string {
  const rows = LEAD_FIELDS
    .filter((field) => field !== "name" && field !== "phone" && field !== "message" && lead[field])
    .map((field) => `<p><strong>${FIELD_LABELS[field] ?? field}:</strong> ${escapeHtml(lead[field]).replace(/\n/g, "<br>")}</p>`)
    .join("\n");

  return `
    <div style="font-family: Helvetica, Arial, sans-serif; color: #111111; max-width: 600px;">
      <h2 style="color: #0D3C47;">Novo pedido</h2>
      <p><strong>Nome:</strong> ${escapeHtml(lead.name)}</p>
      ${lead.phone ? `<p><strong>Telemóvel:</strong> ${escapeHtml(lead.phone)}</p>` : ""}
      ${lead.email ? `<p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>` : ""}
      ${rows}
      ${lead.message ? `<p><strong>Mensagem:</strong><br>${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>` : ""}
    </div>
  `;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return handleCORS();
  if (!validateMethod(req, ["POST"])) {
    return createErrorResponse("Método não permitido", 405);
  }

  const clientIP = getClientIP(req);
  const limit = checkRateLimit(`send-lead-email:${clientIP}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!limit.allowed) {
    safeLog("warn", "[send-lead-email] Limite de pedidos atingido", { ip: clientIP });
    return createErrorResponse(
      "Demasiados pedidos seguidos. Tente novamente daqui a alguns minutos.",
      429,
      getRateLimitHeaders(limit.remaining, limit.resetAt),
    );
  }

  let body: SendLeadEmailRequest;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse("Pedido inválido", 400);
  }

  if (!body.lead || typeof body.lead !== "object") {
    return createErrorResponse("Pedido inválido", 400);
  }

  if (hasHeaderInjection(JSON.stringify(body))) {
    safeLog("warn", "[send-lead-email] Tentativa de injeção detetada", { ip: clientIP });
    return createErrorResponse("Pedido inválido", 400);
  }

  const lead = cleanLead(body.lead as Record<string, unknown>);
  if (!lead) return createErrorResponse("Pedido inválido", 400);

  const subject = typeof body.subject === "string" && body.subject.trim()
    ? body.subject.slice(0, SUBJECT_MAX_LENGTH)
    : "Novo pedido - Kyro Clean Solutions";

  // Mesma filosofia que `submit-lead`: sem token deixa passar de propósito, e
  // um token recusado atrasa este canal, não perde o pedido (o outro canal,
  // o CRM, continua independente).
  const recaptcha = await verifyRecaptcha(body.recaptchaToken, RECAPTCHA_ACTION, clientIP);
  if (!recaptcha.valid) {
    safeLog("warn", "[send-lead-email] reCAPTCHA reprovado", { ip: clientIP, score: recaptcha.score });
    return createErrorResponse("Não foi possível validar o pedido.", 403);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const notificationEmail = Deno.env.get("LEAD_NOTIFICATION_EMAIL");
  if (!resendApiKey || !notificationEmail) {
    safeLog("error", "[send-lead-email] Variáveis do Resend em falta", {});
    return createErrorResponse("Serviço indisponível", 503);
  }

  try {
    const resend = new Resend(resendApiKey);
    const { error: resendError } = await resend.emails.send({
      from: "Kyro Clean Solutions <pedidos@cleansolutions.com.pt>",
      to: [notificationEmail],
      ...(lead.email ? { reply_to: lead.email } : {}),
      subject,
      html: buildEmailHtml(lead),
    });
    // O SDK do Resend não lança exceção para erros da API (domínio por
    // verificar, chave inválida, etc.) — vêm neste campo `error`, não num catch.
    if (resendError) {
      safeLog("error", "[send-lead-email] Resend recusou o envio", { message: resendError.message });
      return createErrorResponse("Não foi possível enviar o email", 502);
    }
  } catch (error) {
    safeLog("error", "[send-lead-email] Envio falhou", {
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
    });
    return createErrorResponse("Não foi possível enviar o email", 502);
  }

  return createSuccessResponse(
    { sent: true },
    getRateLimitHeaders(limit.remaining, limit.resetAt),
  );
});
