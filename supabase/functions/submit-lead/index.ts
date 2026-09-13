// Entrada de servidor para os pedidos do quiz.
//
// Porque existe: a tabela `leads` tinha de aceitar inserts anónimos, porque o
// quiz insere a partir do browser com a chave pública. Isso deixa a porta
// aberta a qualquer script que chame o endpoint REST do Supabase diretamente,
// sem passar pelo site. Aqui a inserção passa a ser feita com a chave de
// serviço, depois de verificar o reCAPTCHA, e a política anónima pode ser
// fechada.
//
// Regra que manda em tudo o resto: **um pedido real nunca se perde.** O quiz
// continua a enviar em paralelo pelo segundo canal (email), por isso mesmo que
// esta função falhe, rejeite por engano, ou nem sequer esteja publicada, o
// pedido chega na mesma ao negócio. Ver `src/services/submissionService.ts`.
//
// Quando o Formspree for substituído pelo Resend, é aqui que o envio do email
// passa a ser feito: a chave do Resend não pode viver no browser.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "../_shared/rate-limit.ts";
import { createErrorResponse, createSuccessResponse, handleCORS, safeLog, validateMethod } from "../_shared/security.ts";
import { verifyRecaptcha } from "../_shared/recaptcha.ts";

// Um orçamento é um ato deliberado, não algo que se repita em série. Oito por
// IP em dez minutos deixa passar a família que pede dois e o cliente que se
// engana e repete, e corta o script que tenta centenas.
const RATE_LIMIT_MAX = 8;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

const RECAPTCHA_ACTION = "submit_quote";

// Só estes campos são aceites. Um campo a mais no corpo do pedido é ignorado,
// em vez de ser escrito na tabela.
const LEAD_FIELDS = [
  "name", "phone", "email", "service", "service_type", "details",
  "location", "value", "booking_id", "message", "notes",
] as const;

const MAX_LENGTHS: Record<string, number> = {
  name: 120, phone: 40, email: 160, service: 120, service_type: 120,
  details: 4000, location: 120, value: 60, booking_id: 40,
  message: 8000, notes: 4000,
};

interface SubmitLeadRequest {
  lead?: Record<string, unknown>;
  recaptchaToken?: string;
}

/** Aceita apenas os campos conhecidos, como texto, dentro do comprimento máximo. */
function cleanLead(raw: Record<string, unknown>): Record<string, string> | null {
  const out: Record<string, string> = {};
  for (const field of LEAD_FIELDS) {
    const value = raw[field];
    if (value === undefined || value === null || value === "") continue;
    if (typeof value !== "string") return null;
    out[field] = value.slice(0, MAX_LENGTHS[field] ?? 1000);
  }
  // Sem nome nem telefone não há pedido que valha a pena guardar.
  if (!out.name || !out.phone) return null;
  return out;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return handleCORS();
  if (!validateMethod(req, ["POST"])) {
    return createErrorResponse("Método não permitido", 405);
  }

  const clientIP = getClientIP(req);
  const limit = checkRateLimit(`submit-lead:${clientIP}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!limit.allowed) {
    safeLog("warn", "[submit-lead] Limite de pedidos atingido", { ip: clientIP });
    return createErrorResponse(
      "Demasiados pedidos seguidos. Tente novamente daqui a alguns minutos.",
      429,
      getRateLimitHeaders(limit.remaining, limit.resetAt),
    );
  }

  let body: SubmitLeadRequest;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse("Pedido inválido", 400);
  }

  if (!body.lead || typeof body.lead !== "object") {
    return createErrorResponse("Pedido inválido", 400);
  }

  const lead = cleanLead(body.lead as Record<string, unknown>);
  if (!lead) return createErrorResponse("Pedido inválido", 400);

  // Sem token o verificador deixa passar de propósito: reCAPTCHA bloqueado,
  // script em falha ou chave ausente no build não podem custar um cliente.
  // O que é rejeitado é um token presente e reprovado, ou pontuação baixa.
  const recaptcha = await verifyRecaptcha(body.recaptchaToken, RECAPTCHA_ACTION, clientIP);
  if (!recaptcha.valid) {
    safeLog("warn", "[submit-lead] reCAPTCHA reprovado", { ip: clientIP, score: recaptcha.score });
    // O pedido chega na mesma ao negócio pelo canal de email, por isso um
    // falso positivo aqui atrasa o registo no CRM, não perde o cliente.
    return createErrorResponse("Não foi possível validar o pedido.", 403);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    safeLog("error", "[submit-lead] Variáveis do Supabase em falta", {});
    return createErrorResponse("Serviço indisponível", 503);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { error } = await supabase.from("leads").insert({
    ...lead,
    status: "pending",
    source: "Website",
    priority: "Quente",
  });

  if (error) {
    safeLog("error", "[submit-lead] Insert falhou", { message: error.message });
    return createErrorResponse("Não foi possível registar o pedido", 500);
  }

  return createSuccessResponse(
    { bookingId: lead.booking_id ?? null },
    getRateLimitHeaders(limit.remaining, limit.resetAt),
  );
});
