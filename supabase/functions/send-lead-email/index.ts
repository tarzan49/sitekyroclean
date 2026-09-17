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
import { LEAD_FROM_ADDRESS } from "../_shared/constants.ts";

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

// Pedidos do quiz já trazem service/details/value estruturados — o campo
// `message` deles é só o mesmo conteúdo outra vez em bloco de texto (montado
// em QuizForm.tsx para a versão antiga, texto corrido), por isso é omitido
// aqui para não duplicar. O contacto simples não tem service/details/value,
// só `message` (a mensagem livre do cliente) — aí é a única fonte e é mostrado.
// Mensagem pré-preenchida no clique de "Responder no WhatsApp". Estes leads já
// viram o preço no quiz e mesmo assim avançaram, por isso o objetivo não é
// "confirmar interesse" mas fechar o agendamento logo na primeira mensagem:
// trata a pessoa pelo primeiro nome, recorda o serviço e a zona que pediu, dá
// duas opções de horário (pergunta fechada, decide-se em segundos) e só depois
// pede o único dado em falta (a morada). Os espaços em branco dos horários
// ficam por preencher à mão consoante a agenda: a mensagem abre editável na
// caixa do WhatsApp, não é enviada automaticamente. Parágrafos separados por
// linha em branco para não chegar como um bloco de texto corrido.
function firstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : fullName;
}

// Quase todas as localidades servidas levam "em" (em Oeiras, em Lisboa), mas
// um punhado leva artigo contraído e "em Porto" soa logo a mensagem automática.
// Lista curta e explícita das exceções que existem em `locationPrices`; tudo o
// resto, incluindo moradas escritas à mão no campo "outra", cai em "em".
const LOCATION_PREPOSITION: Record<string, string> = {
  "Porto": "no", "Barreiro": "no", "Seixal": "no", "Montijo": "no",
  "Amadora": "na", "Maia": "na", "Moita": "na", "Trofa": "na",
  "Póvoa de Varzim": "na", "Póvoa de Lanhoso": "na",
};

function buildWhatsAppMessage(lead: Record<string, string>): string {
  // Com upsell o campo `service` vem como lista ("Sofá, 2x Colchão Casal");
  // numa saudação só interessa o serviço principal, o resto está no email.
  const mainService = (lead.service ?? "").split(",")[0].trim().toLowerCase();
  const isWaterproofing = /impermeabiliza/i.test(lead.service_type ?? "");
  const service = mainService
    ? ` para ${isWaterproofing ? "impermeabilização" : "limpeza"} de ${mainService}`
    : "";
  const loc = lead.location
    ? ` ${LOCATION_PREPOSITION[lead.location] ?? "em"} ${lead.location}`
    : "";
  return [
    `Olá ${firstName(lead.name)}, tudo bem?`,
    `Aqui é o António, da Kyro Clean Solutions. Recebi o seu pedido de orçamento${service}${loc}.`,
    // Sem "para" antes dos espaços em branco de propósito: assim a frase
    // funciona tanto com horas ("quinta às 15h") como com períodos do dia
    // ("sábado de manhã"), seja o que for que se escreva à mão antes de enviar.
    `Tenho disponibilidade ______ ou ______. Qual lhe dá mais jeito?`,
    `É só enviar-me a morada completa e deixo a reserva confirmada.`,
  ].join("\n\n");
}

// O campo de telefone do quiz aceita indicativo estrangeiro ("com indicativo
// se for estrangeiro", ver QuizStepContact.tsx) — nem todos os leads são
// portugueses. Um número português sem indicativo tem sempre 9 dígitos
// (91x/92x/93x/96x); qualquer outra contagem já vem com indicativo (seja
// +351 explícito ou de outro país) e não deve ser mexida.
function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 9 ? `351${digits}` : digits;
}

function buildEmailHtml(lead: Record<string, string>): string {
  const isStructuredLead = Boolean(lead.service || lead.details || lead.value);
  const waLink = lead.phone
    ? `https://wa.me/${toWhatsAppNumber(lead.phone)}?text=${encodeURIComponent(buildWhatsAppMessage(lead))}`
    : null;

  const row = (label: string, value: string, preserveLines = false) => `
    <tr>
      <td style="padding:10px 4px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;width:130px;vertical-align:top;white-space:nowrap;">${label}</td>
      <td style="padding:10px 4px;border-bottom:1px solid #e5e7eb;color:#111111;font-size:15px;${preserveLines ? "white-space:pre-line;" : ""}">${escapeHtml(value)}</td>
    </tr>`;

  const rows: string[] = [];
  rows.push(row("Nome", lead.name));
  if (lead.phone) rows.push(row("Telemóvel", lead.phone));
  if (lead.email) rows.push(row("Email", lead.email));
  if (lead.service) rows.push(row("Serviço", lead.service));
  if (lead.service_type) rows.push(row("Tipo", lead.service_type));
  if (lead.details) rows.push(row("Detalhes", lead.details, true));
  if (lead.location) rows.push(row("Localização", lead.location));
  if (lead.value) rows.push(row("Valor", lead.value));
  if (!isStructuredLead && lead.message) rows.push(row("Mensagem", lead.message, true));
  if (lead.notes) rows.push(row("Notas", lead.notes, true));
  if (lead.booking_id) rows.push(row("Referência", `#${lead.booking_id}`));

  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
      <div style="background: #1A4E30; padding: 20px 24px;">
        <p style="margin: 0 0 4px; color: #C3A94B; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Kyro Clean Solutions</p>
        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">Novo pedido</h1>
      </div>
      <div style="padding: 20px 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          ${rows.join("\n")}
        </table>
        ${waLink ? `<a href="${waLink}" style="display: inline-block; margin-top: 20px; background: #25D366; color: #ffffff; text-decoration: none; padding: 11px 20px; border-radius: 6px; font-size: 14px; font-weight: 600;">Responder no WhatsApp</a>` : ""}
      </div>
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
      from: `Kyro Clean Solutions <${LEAD_FROM_ADDRESS}>`,
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
