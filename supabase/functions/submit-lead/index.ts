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
// continua a enviar em paralelo pelo segundo canal (email, função `send-lead-email`),
// por isso mesmo que esta função falhe, rejeite por engano, ou nem sequer esteja
// publicada, o pedido chega na mesma ao negócio. Ver `src/services/submissionService.ts`.
// O email é enviado por uma função à parte, não por esta, de propósito: se
// vivesse aqui, os dois canais dependeriam do mesmo ponto de falha.
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
  "location", "value", "booking_id", "lead_id", "message", "notes",
] as const;

const MAX_LENGTHS: Record<string, number> = {
  name: 120, phone: 40, email: 160, service: 120, service_type: 120,
  details: 4000, location: 120, value: 60, booking_id: 40, lead_id: 64,
  message: 8000, notes: 4000,
};

// Campos de atribuição aceites, por nome exato. Um campo a mais no corpo do
// pedido é ignorado em vez de ser escrito na tabela — mesma regra de LEAD_FIELDS.
//
// Nenhum destes é dado pessoal: são identificadores de clique, nomes de
// campanha e caminhos de página. Email, telefone e nome vivem só em `leads` e
// nunca são copiados para aqui.
const ATTRIBUTION_FIELDS = [
  "channel",
  "first_source", "first_medium", "first_campaign", "first_landing_page", "first_seen_at",
  "last_source", "last_medium", "last_campaign", "last_landing_page", "last_seen_at",
  "gclid", "gbraid", "wbraid",
  "campaign_id", "ad_group_id", "keyword", "match_type", "creative_id", "ads_device", "network",
  "referrer", "referrer_source", "landing_page", "conversion_page", "ga_client_id",
] as const;

const ATTRIBUTION_MAX_LENGTH = 250;

interface SubmitLeadRequest {
  lead?: Record<string, unknown>;
  recaptchaToken?: string;
  attribution?: Record<string, unknown>;
}

/**
 * Limpa a atribuição: só campos conhecidos, só texto, dentro do comprimento
 * máximo. `is_paid` é o único booleano e é derivado no cliente a partir de
 * haver ou não identificador de clique.
 */
function cleanAttribution(raw: Record<string, unknown> | undefined): Record<string, string | boolean> | null {
  if (!raw || typeof raw !== "object") return null;
  const out: Record<string, string | boolean> = { is_paid: raw.is_paid === true };
  for (const field of ATTRIBUTION_FIELDS) {
    const value = raw[field];
    if (typeof value !== "string" || value === "") continue;
    out[field] = value.slice(0, ATTRIBUTION_MAX_LENGTH);
  }
  return out;
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

  // ── Idempotência ──────────────────────────────────────────────────────────
  //
  // O `lead_id` é gerado uma vez por submissão no browser e sobrevive a duplos
  // cliques, a retries depois de um timeout e a um refresh com reenvio (ver
  // src/lib/submissionId.ts). Aqui é a autoridade final: se já existe um lead
  // com este identificador, devolve-se sucesso sem criar outro.
  //
  // Isto não substitui o índice único em `leads.lead_id` — substitui o
  // *depender* dele. O select apanha o caso normal; o índice apanha a corrida
  // entre dois pedidos simultâneos, tratada mais abaixo no erro 23505.
  if (lead.lead_id) {
    const { data: existing } = await supabase
      .from("leads").select("id, booking_id").eq("lead_id", lead.lead_id).maybeSingle();
    if (existing) {
      safeLog("info", "[submit-lead] Pedido repetido ignorado", { leadId: lead.lead_id });
      return createSuccessResponse(
        { bookingId: existing.booking_id ?? lead.booking_id ?? null, leadId: lead.lead_id, duplicate: true },
        getRateLimitHeaders(limit.remaining, limit.resetAt),
      );
    }
  }

  const { data: inserted, error } = await supabase.from("leads").insert({
    ...lead,
    status: "pending",
    // Estado inicial do funil de marketing. `status` (2024) fica como estava:
    // são dois vocabulários diferentes, de propósito — ver a migração
    // 20260918000000_marketing_attribution.sql.
    funnel_status: "NEW",
    source: "Website",
    priority: "Quente",
  }).select("id").single();

  if (error) {
    // 23505 = violação de unicidade. Com dois pedidos a chegar ao mesmo tempo,
    // o select acima passa nos dois e é o índice que decide qual ganha. O
    // perdedor não é um erro: é o mesmo pedido, já gravado.
    if (error.code === "23505") {
      safeLog("info", "[submit-lead] Corrida de pedidos repetidos resolvida pelo índice", { leadId: lead.lead_id });
      return createSuccessResponse(
        { bookingId: lead.booking_id ?? null, leadId: lead.lead_id ?? null, duplicate: true },
        getRateLimitHeaders(limit.remaining, limit.resetAt),
      );
    }
    safeLog("error", "[submit-lead] Insert falhou", { message: error.message });
    return createErrorResponse("Não foi possível registar o pedido", 500);
  }

  // A atribuição e o histórico de estado são gravados depois, e uma falha aqui
  // **não** falha o pedido: o lead já existe e o negócio já o vai ver. Perder a
  // origem de um lead é mau; perder o lead para não perder a origem seria pior.
  if (lead.lead_id) {
    const attribution = cleanAttribution(body.attribution);
    if (attribution) {
      // `ignoreDuplicates` e não `upsert`: a atribuição do primeiro pedido é a
      // verdadeira. Um reenvio chega com a mesma sessão mas pode já ter perdido
      // o `gclid` do URL, e reescrever apagava a origem real.
      const { error: attributionError } = await supabase.from("lead_attribution").upsert({
        ...attribution,
        lead_id: lead.lead_id,
        lead_row_id: inserted?.id ?? null,
      }, { onConflict: "lead_id", ignoreDuplicates: true });
      if (attributionError) safeLog("warn", "[submit-lead] Atribuição não gravada", { message: attributionError.message });
    }

    const { error: historyError } = await supabase.from("lead_status_history").insert({
      lead_row_id: inserted?.id ?? null,
      lead_id: lead.lead_id,
      previous_status: null,
      new_status: "NEW",
      changed_by: "site",
      note: "Pedido submetido no site",
    });
    if (historyError) safeLog("warn", "[submit-lead] Histórico não gravado", { message: historyError.message });
  }

  return createSuccessResponse(
    { bookingId: lead.booking_id ?? null, leadId: lead.lead_id ?? null, duplicate: false },
    getRateLimitHeaders(limit.remaining, limit.resetAt),
  );
});
