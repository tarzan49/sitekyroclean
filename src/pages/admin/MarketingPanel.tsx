import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw, TrendingUp, Target, Users, CheckCircle, Euro, Download,
  X, AlertTriangle, MousePointerClick, Info, Plus, LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/quizMetrics";
import {
  ADS_CUSTOMER_CONVERSION_ACTION, ADS_LEAD_CONVERSION_LABEL, ADS_QUALIFIED_LEAD_ACTION,
  GA4_MEASUREMENT_ID, GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_ID,
} from "@/constants/tracking";
import {
  buildOfflineConversionsCsv, costMetrics, countFunnel, countObservedSessions, countPaidSessions,
  coverage, groupByCampaign, groupByChannel, groupByLandingPage, joinLeads, observedOnly,
  offlineCandidates, paidOnly, rate, METRIC_DEFINITIONS, STATUS_RANK, UNKNOWN,
  type AttributionRow, type ContactLogRow, type ConversionExportRow, type JoinedLead,
  type LeadRow, type SessionEventRow, type StatusHistoryRow,
} from "@/lib/marketingMetrics";
import { LEAD_STATUSES, type LeadStatusValue } from "@/lib/leadTracking";

/**
 * Painel operacional de Google Ads.
 *
 * Três regras que decidem tudo o que está aqui:
 *
 * 1. **Operacional ≠ observado.** Os leads vêm da tabela `leads` e existem com
 *    ou sem cookies. As sessões e a atribuição vêm de `quiz_events` e
 *    `lead_attribution` e só existem com consentimento. O painel mostra os dois
 *    e diz qual é qual; nenhuma taxa mistura os dois lados.
 * 2. **Nada é estimado.** Sem gasto importado, CPL/CPA/CAC/ROAS ficam por
 *    calcular com o motivo escrito. Sem atribuição, "Não disponível".
 * 3. **Um clique não é uma conversa.** WhatsApp e telefone têm colunas
 *    separadas para cliques (medidos) e contactos confirmados (registados à
 *    mão), e nunca se somam.
 */

/**
 * `src/integrations/supabase/types.ts` foi gerado há muito tempo e só conhece
 * `newsletter_subscribers`. Todas as tabelas reais do painel ficam de fora
 * dele, por isso os outros painéis já usam este mesmo escape. A segurança de
 * tipos das linhas está garantida do outro lado: as interfaces em
 * `marketingMetrics.ts` descrevem o que é lido, e os testes correm contra elas.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ── Helpers de apresentação ──────────────────────────────────────────────────

const PERIODS = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
] as const;

const euros = (value: number) => `${value.toLocaleString("pt-PT", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`;
const percent = (value: number | null) => (value === null ? UNKNOWN : `${(value * 100).toFixed(1)}%`);
const money = (value: number | null) => (value === null ? UNKNOWN : euros(value));
const ratio = (value: number | null) => (value === null ? UNKNOWN : `${value.toFixed(2)}×`);

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-gray-50 text-gray-600 border-gray-200",
  VALID: "bg-sky-50 text-sky-700 border-sky-200",
  QUALIFIED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  QUOTED: "bg-amber-50 text-amber-700 border-amber-200",
  BOOKED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-300",
  INVALID: "bg-red-50 text-red-700 border-red-200",
  LOST: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<LeadStatusValue, string> = {
  NEW: "Novo", VALID: "Válido", QUALIFIED: "Qualificado", QUOTED: "Orçamentado",
  BOOKED: "Marcado", COMPLETED: "Concluído",
  INVALID: "Inválido", LOST: "Perdido", CANCELLED: "Cancelado",
};

const EXPORT_STATUS_LABEL: Record<string, string> = {
  queued: "Na fila", exported: "CSV exportado", submitted: "Carregado no Ads",
  accepted: "Aceite pelo Google", rejected: "Recusado",
};

type Origin = "operacional" | "observado";

/**
 * Cada cartão diz de onde vem o número. "Operacional" = tabela `leads`, existe
 * com ou sem cookies. "Observado" = só quem consentiu análise.
 */
const Card = ({ label, value, icon: Icon, origin, hint }: {
  label: string; value: string; icon: LucideIcon; origin: Origin; hint?: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-3.5 h-3.5 text-gold" />
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
    <p className="text-2xl font-bold text-navy">{value}</p>
    <p className={`text-[11px] mt-1 ${origin === "operacional" ? "text-emerald-700" : "text-sky-700"}`}>
      {origin === "operacional" ? "Operacional · todos os pedidos" : "Observado · só com consentimento"}
    </p>
    {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
  </div>
);

const Th = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th className={`${right ? "text-right" : "text-left"} px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap`}>{children}</th>
);
const Td = ({ children, right, muted }: { children: React.ReactNode; right?: boolean; muted?: boolean }) => (
  <td className={`${right ? "text-right tabular-nums" : "text-left"} px-3 py-2.5 text-sm ${muted ? "text-gray-400" : "text-navy"} whitespace-nowrap`}>{children}</td>
);

const Section = ({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h3 className="font-bold text-navy text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5 max-w-3xl">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="px-4 py-10 text-center text-sm text-gray-400">{children}</p>
);

const Notice = ({ tone, title, children }: { tone: "red" | "amber" | "sky"; title: string; children: React.ReactNode }) => {
  const styles = {
    red: "border-red-200 bg-red-50 text-red-800",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    sky: "border-sky-200 bg-sky-50 text-sky-900",
  }[tone];
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${styles}`}>
      {tone === "sky" ? <Info className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
      <div><p className="font-bold">{title}</p><div className="mt-1">{children}</div></div>
    </div>
  );
};

// ── Componente ───────────────────────────────────────────────────────────────

const MarketingPanel = () => {
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [attribution, setAttribution] = useState<AttributionRow[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryRow[]>([]);
  const [events, setEvents] = useState<SessionEventRow[]>([]);
  const [contacts, setContacts] = useState<ContactLogRow[]>([]);
  const [exportsRows, setExportsRows] = useState<ConversionExportRow[]>([]);
  const [deliveryFailures, setDeliveryFailures] = useState<number | null>(null);
  const [onlyPaid, setOnlyPaid] = useState(false);
  const [selected, setSelected] = useState<JoinedLead | null>(null);
  const [saving, setSaving] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const failures: string[] = [];

    /**
     * Cada leitura falha por si. Uma tabela que ainda não existe — porque a
     * migração não foi colada — não pode esvaziar o painel inteiro: o resto
     * continua a aparecer e o aviso diz exatamente o que falta. Ausência de
     * dados e zero são coisas diferentes, e é aqui que a diferença começa.
     */
    const safe = async <T,>(label: string, run: () => Promise<T[]>): Promise<T[]> => {
      try { return await run(); } catch (e: unknown) {
        failures.push(`${label}: ${e instanceof Error ? e.message : "leitura falhou"}`);
        return [];
      }
    };

    const [leadRows, attributionRows, historyRows, eventRows, contactRows, exportRows, errorCount] = await Promise.all([
      safe("leads", () => fetchAllRows<LeadRow>((from, to) => db.from("leads")
        .select("id, created_at, lead_id, service, location, source, funnel_status, quoted_value, booked_value, final_revenue, amount_received, payment_received_at, completed_at", { count: "exact" })
        .gte("created_at", since).order("created_at", { ascending: false }).order("id").range(from, to))),
      safe("lead_attribution", () => fetchAllRows<AttributionRow>((from, to) => db.from("lead_attribution")
        .select("*", { count: "exact" }).gte("created_at", since).order("created_at").order("lead_id").range(from, to))),
      safe("lead_status_history", () => fetchAllRows<StatusHistoryRow>((from, to) => db.from("lead_status_history")
        .select("*", { count: "exact" }).order("changed_at").range(from, to))),
      safe("quiz_events", () => fetchAllRows<SessionEventRow>((from, to) => db.from("quiz_events")
        .select("session_id, action, created_at, page_path, landing_page, is_paid, campaign_id", { count: "exact" })
        .gte("created_at", since).order("created_at").order("session_id").range(from, to))),
      safe("contact_log", () => fetchAllRows<ContactLogRow>((from, to) => db.from("contact_log")
        .select("*", { count: "exact" }).gte("occurred_at", since).order("occurred_at").range(from, to))),
      safe("conversion_exports", () => fetchAllRows<ConversionExportRow>((from, to) => db.from("conversion_exports")
        .select("*", { count: "exact" }).order("created_at").range(from, to))),
      // Falhas de entrega do canal do CRM nas últimas 24h: um pedido que só
      // chegou por email existe na caixa de correio e não existe em `leads`.
      (async () => {
        try {
          const { count } = await db.from("error_logs").select("id", { count: "exact", head: true })
            .in("source", ["QuizForm-crm", "QuizForm-submit"])
            .gte("created_at", new Date(Date.now() - 86400000).toISOString());
          return count ?? 0;
        } catch { return null; }
      })(),
    ]);

    setLeads(leadRows); setAttribution(attributionRows); setStatusHistory(historyRows);
    setEvents(eventRows); setContacts(contactRows); setExportsRows(exportRows);
    setDeliveryFailures(errorCount as number | null);
    setErrors(failures);
    setLoading(false);
  }, [days]);

  useEffect(() => { void load(); }, [load]);

  const joinedAll = useMemo(() => joinLeads(leads, attribution, statusHistory), [leads, attribution, statusHistory]);
  const joined = useMemo(() => (onlyPaid ? paidOnly(joinedAll) : joinedAll), [joinedAll, onlyPaid]);
  const funnel = useMemo(() => countFunnel(joined.map(item => item.lead), statusHistory), [joined, statusHistory]);
  const cover = useMemo(() => coverage(joinedAll), [joinedAll]);

  // Sem gasto importado. `null` de propósito, com o motivo por escrito.
  const cost = useMemo(() => costMetrics(null, funnel), [funnel]);

  const paidSessions = useMemo(() => countPaidSessions(events), [events]);
  const observedSessions = useMemo(() => countObservedSessions(events), [events]);
  const campaignRows = useMemo(() => groupByCampaign(observedOnly(joined)), [joined]);
  const landingRows = useMemo(() => groupByLandingPage(joined, events), [joined, events]);
  const channelRows = useMemo(() => groupByChannel(joined, events, contacts), [joined, events, contacts]);

  const qualifiedCandidates = useMemo(
    () => ADS_QUALIFIED_LEAD_ACTION
      ? offlineCandidates(joinedAll, exportsRows, { conversionAction: ADS_QUALIFIED_LEAD_ACTION, minRank: STATUS_RANK.QUALIFIED })
      : [],
    [joinedAll, exportsRows]);
  const customerCandidates = useMemo(
    () => ADS_CUSTOMER_CONVERSION_ACTION
      ? offlineCandidates(joinedAll, exportsRows, { conversionAction: ADS_CUSTOMER_CONVERSION_ACTION, minRank: STATUS_RANK.COMPLETED })
      : [],
    [joinedAll, exportsRows]);

  /**
   * Exportar **e registar** que foi exportado, na mesma ação.
   *
   * Sem o registo, o mesmo lead saía em todos os CSV seguintes e era importado
   * várias vezes no Google Ads. O registo também é o que permite distinguir os
   * quatro estados: na fila, exportado, carregado, aceite.
   */
  const exportOffline = async (conversionAction: string, candidates: ReturnType<typeof offlineCandidates>, filename: string) => {
    if (!candidates.length) return;
    setSaving(true);
    const now = new Date().toISOString();
    const { error } = await db.from("conversion_exports").insert(candidates.map(candidate => ({
      lead_id: candidate.lead_id,
      lead_row_id: candidate.lead_row_id,
      conversion_action: conversionAction,
      click_id: candidate.click_id,
      conversion_time: candidate.conversion_time,
      value: candidate.value,
      status: "exported",
      exported_at: now,
    })));
    if (error) {
      setErrors(prev => [...prev, `Não foi possível registar a exportação: ${error.message}. O CSV não foi gerado, para não haver importações repetidas.`]);
      setSaving(false);
      return;
    }
    const csv = buildOfflineConversionsCsv(candidates, { conversionAction });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = filename; link.click();
    URL.revokeObjectURL(url);
    await load();
    setSaving(false);
  };

  const markExportStatus = async (id: string, status: string) => {
    setSaving(true);
    const patch: Record<string, unknown> = { status };
    if (status === "submitted") patch.submitted_at = new Date().toISOString();
    if (status === "accepted" || status === "rejected") patch.resolved_at = new Date().toISOString();
    const { error } = await db.from("conversion_exports").update(patch).eq("id", id);
    if (error) setErrors(prev => [...prev, `Não foi possível atualizar o estado: ${error.message}`]);
    else await load();
    setSaving(false);
  };

  /**
   * Muda o estado e grava o histórico.
   *
   * `changed_by` **não** é enviado: um trigger na base de dados escreve-o a
   * partir do JWT da sessão. O que o browser mandasse nesse campo seria
   * ignorado, e é isso que torna o registo auditável.
   */
  const changeStatus = async (item: JoinedLead, next: LeadStatusValue) => {
    setSaving(true);
    const previous = item.lead.funnel_status;
    const patch: Record<string, unknown> = { funnel_status: next };
    if (next === "COMPLETED" && !item.lead.completed_at) patch.completed_at = new Date().toISOString();
    const { error } = await db.from("leads").update(patch).eq("id", item.lead.id);
    if (!error) {
      await db.from("lead_status_history").insert({
        lead_row_id: item.lead.id, lead_id: item.lead.lead_id,
        previous_status: previous, new_status: next,
      });
      await load();
      setSelected(null);
    } else {
      setErrors(prev => [...prev, `Não foi possível mudar o estado: ${error.message}`]);
    }
    setSaving(false);
  };

  const saveValue = async (item: JoinedLead, field: "quoted_value" | "booked_value" | "final_revenue" | "amount_received", value: string) => {
    const parsed = value.trim() === "" ? null : Number(value.replace(",", "."));
    if (parsed !== null && Number.isNaN(parsed)) return;
    setSaving(true);
    const patch: Record<string, unknown> = { [field]: parsed };
    if (field === "amount_received") patch.payment_received_at = parsed === null ? null : new Date().toISOString();
    const { error } = await db.from("leads").update(patch).eq("id", item.lead.id);
    if (error) setErrors(prev => [...prev, `Não foi possível gravar o valor: ${error.message}`]);
    else await load();
    setSaving(false);
  };

  const missingConfig = [
    !ADS_LEAD_CONVERSION_LABEL && "etiqueta da conversão de website (lead confirmado)",
    !ADS_QUALIFIED_LEAD_ACTION && "nome da ação offline de lead qualificado",
    !ADS_CUSTOMER_CONVERSION_ACTION && "nome da ação offline de cliente",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy">Marketing / Google Ads</h2>
          <p className="text-sm text-gray-500">
            GA4 <code className="bg-gray-100 px-1 rounded text-xs">{GA4_MEASUREMENT_ID}</code>
            {" · "}Conversões <code className="bg-gray-100 px-1 rounded text-xs">{GOOGLE_ADS_ID}</code>
            {" · "}Cliente <code className="bg-gray-100 px-1 rounded text-xs">{GOOGLE_ADS_CUSTOMER_ID}</code>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {PERIODS.map(period => (
              <button key={period.days} onClick={() => setDays(period.days)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${days === period.days ? "bg-navy text-white" : "text-navy hover:bg-gray-50"}`}>
                {period.label}
              </button>
            ))}
          </div>
          <button onClick={() => setOnlyPaid(prev => !prev)}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${onlyPaid ? "bg-gold/10 border-gold text-navy" : "border-gray-200 text-navy hover:border-navy/30"}`}>
            {onlyPaid ? "Só tráfego pago" : "Todo o tráfego"}
          </button>
          <button onClick={() => void load()} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </button>
        </div>
      </div>

      {/* ── Saúde operacional: primeiro, porque é o que não pode falhar ──── */}
      {errors.length > 0 && (
        <Notice tone="red" title="Leituras que falharam — os números abaixo estão incompletos">
          <ul className="list-disc pl-4 space-y-0.5">{errors.map((message, i) => <li key={i}>{message}</li>)}</ul>
          <p className="mt-2">Se estas tabelas ainda não existem, falta colar a migração <code className="bg-red-100 px-1 rounded">20260918000000_marketing_attribution.sql</code> no SQL Editor.</p>
        </Notice>
      )}

      {deliveryFailures !== null && deliveryFailures > 0 && (
        <Notice tone="red" title={`${deliveryFailures} falha(s) de entrega ao CRM nas últimas 24 horas`}>
          Um pedido cujo canal do CRM falhou chegou ao negócio por email mas <strong>não está na tabela
          de leads</strong> — não aparece em nenhuma contagem deste painel. Ver o separador Error Log e
          a caixa de correio antes de tratar estes números como completos.
        </Notice>
      )}

      {cover.observedShare !== null && cover.observedShare < 1 && (
        <Notice tone="sky" title={`Cobertura da medição: ${percent(cover.observedShare)} dos pedidos têm atribuição`}>
          {cover.unobservedLeads} de {cover.operationalLeads} pedidos não têm origem registada — recusaram
          cookies de análise, ou entraram antes de a atribuição existir. Continuam a contar como leads;
          não contam em nada por campanha ou por landing page.
        </Notice>
      )}

      {missingConfig.length > 0 && (
        <Notice tone="amber" title="Configuração do Google Ads por fazer">
          <p>Falta: {missingConfig.join("; ")}.</p>
          <p className="mt-1">
            Os leads são registados na mesma, com a atribuição toda. O que não sai é a conversão.
            A etiqueta de website é a parte depois da barra em <code className="bg-amber-100 px-1 rounded">{GOOGLE_ADS_ID}/…</code>;
            os nomes das ações offline são o <strong>nome</strong> da ação no Google Ads, não uma etiqueta.
          </p>
        </Notice>
      )}

      {/* ── A. Overview ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card label="Leads" value={String(funnel.leads)} icon={Users} origin="operacional" hint={onlyPaid ? "Filtrado a tráfego pago" : undefined} />
        <Card label="Leads válidos" value={String(funnel.valid)} icon={CheckCircle} origin="operacional" />
        <Card label="Qualificados" value={String(funnel.qualified)} icon={Target} origin="operacional" />
        <Card label="Marcações" value={String(funnel.bookings)} icon={TrendingUp} origin="operacional" />
        <Card label="Serviços concluídos" value={String(funnel.customers)} icon={CheckCircle} origin="operacional" />
        <Card label="Receita faturada" value={euros(funnel.revenueBilled)} icon={Euro} origin="operacional"
          hint={funnel.customers > funnel.billedKnownCount ? `${funnel.customers - funnel.billedKnownCount} concluídos sem valor registado` : undefined} />
        <Card label="Pagamentos recebidos" value={euros(funnel.revenueReceived)} icon={Euro} origin="operacional"
          hint="Dinheiro em conta. Nunca somado ao faturado." />
        <Card label="Taxa lead → cliente" value={percent(rate(funnel.customers, funnel.leads))} icon={TrendingUp} origin="operacional"
          hint="Concluídos / leads operacionais" />
        <Card label="Sessões observadas" value={String(observedSessions)} icon={MousePointerClick} origin="observado" />
        <Card label="Sessões pagas" value={String(paidSessions)} icon={MousePointerClick} origin="observado" hint="Com identificador de clique" />
        <Card label="Leads observados" value={String(cover.observedLeads)} icon={Users} origin="observado" hint="Com atribuição registada" />
        <Card label="Cobertura" value={percent(cover.observedShare)} icon={Info} origin="observado" hint="Leads observados / leads operacionais" />
      </div>

      {/* Economia — explicitamente por ligar */}
      <Section title="Custo, CAC e ROAS" subtitle="Precisa do gasto publicitário importado do Google Ads.">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-4">
          {[
            { label: "Gasto", value: money(cost.cost) },
            { label: "CPL", value: money(cost.cpl) },
            { label: "CPA (marcação)", value: money(cost.cpa) },
            { label: "CAC (cliente)", value: money(cost.cac) },
            { label: "ROAS", value: ratio(cost.roas) },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-dashed border-gray-200 p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
              <p className="text-lg font-bold text-gray-400 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
        <p className="px-4 pb-4 text-xs text-gray-500">
          {cost.unavailableReason ?? cost.warnings.join(" ")} Nenhum destes números é estimado.
          A receita acima já é real — vem dos valores registados em cada lead.
          Ver <code className="bg-gray-100 px-1 rounded">docs/tracking-google-ads.md</code>.
        </p>
      </Section>

      {/* ── B. Leads por campanha ────────────────────────────────────────── */}
      <Section title="Leads por campanha"
        subtitle="Só leads observados (com atribuição). Atribuição last touch, que é a que o Google Ads credita — o first touch está no detalhe de cada lead e nunca é somado a este. Palavra-chave é a da conta (ValueTrack), não o termo que a pessoa escreveu.">
        {campaignRows.length === 0 ? <Empty>Sem leads observados no período escolhido.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50/80">
                <Th>Campanha</Th><Th>Grupo</Th><Th>Palavra-chave</Th><Th>Correspondência</Th><Th>Dispositivo</Th>
                <Th>Landing</Th><Th right>Leads</Th><Th right>Válidos</Th><Th right>Marcações</Th><Th right>Clientes</Th><Th right>Faturado</Th>
              </tr></thead>
              <tbody>
                {campaignRows.map(row => (
                  <tr key={row.key} className="border-b border-gray-50">
                    <Td muted={row.campaign === UNKNOWN}>{row.campaign}</Td>
                    <Td muted={row.adGroup === UNKNOWN}>{row.adGroup}</Td>
                    <Td muted={row.keyword === UNKNOWN}>{row.keyword}</Td>
                    <Td muted={row.matchType === UNKNOWN}>{row.matchType}</Td>
                    <Td muted={row.device === UNKNOWN}>{row.device}</Td>
                    <Td muted={row.landingPage === UNKNOWN}>{row.landingPage}</Td>
                    <Td right>{row.leads}</Td><Td right>{row.valid}</Td><Td right>{row.bookings}</Td><Td right>{row.customers}</Td>
                    <Td right>{row.revenueBilled > 0 ? euros(row.revenueBilled) : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── C. Landing pages ─────────────────────────────────────────────── */}
      <Section title="Landing pages"
        subtitle="Sessões contadas pela página de entrada. A conversão é observada/observadas: as duas pontas da divisão vêm da mesma população consentida. Não é a taxa de conversão do site.">
        {landingRows.length === 0 ? <Empty>Sem sessões registadas no período.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50/80">
                <Th>Página</Th><Th right>Sessões</Th><Th right>Cliques CTA</Th><Th right>Leads observados</Th>
                <Th right>Conversão observada</Th><Th right>Clientes</Th><Th right>Faturado</Th>
              </tr></thead>
              <tbody>
                {landingRows.slice(0, 50).map(row => (
                  <tr key={row.path} className="border-b border-gray-50">
                    <Td>{row.path}</Td>
                    <Td right>{row.sessions}</Td><Td right>{row.ctaClicks}</Td><Td right>{row.observedLeads}</Td>
                    <Td right>{percent(row.observedConversionRate)}</Td><Td right>{row.customers}</Td>
                    <Td right>{row.revenueBilled > 0 ? euros(row.revenueBilled) : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── D. Conversões por canal ──────────────────────────────────────── */}
      <Section title="Conversões por canal"
        subtitle="Cliques, contactos confirmados e leads são três colunas diferentes que nunca se somam nem se transformam umas nas outras."
        action={
          <button onClick={() => setShowContactForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Registar contacto real
          </button>
        }>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50/80">
              <Th>Canal</Th><Th right>Cliques no site</Th><Th right>Contactos confirmados</Th><Th right>Leads</Th>
              <Th right>Marcações</Th><Th right>Clientes</Th><Th>O que conseguimos medir</Th>
            </tr></thead>
            <tbody>
              {channelRows.map(row => (
                <tr key={row.channel} className="border-b border-gray-50 align-top">
                  <Td>{row.label}</Td>
                  <Td right muted={row.clicks === null}>{row.clicks === null ? "Não aplicável" : row.clicks}</Td>
                  <Td right>{row.confirmedContacts}</Td>
                  <Td right>{row.leads}</Td><Td right>{row.bookings}</Td><Td right>{row.customers}</Td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 max-w-md whitespace-normal">{row.measurable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {contacts.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Últimos contactos registados</p>
            <ul className="space-y-1">
              {contacts.slice(-8).reverse().map(contact => (
                <li key={contact.id} className="text-xs text-navy flex flex-wrap gap-x-2">
                  <span className="text-gray-400 tabular-nums">{new Date(contact.occurred_at).toLocaleString("pt-PT")}</span>
                  <span className="font-medium">{contact.channel}</span>
                  <span className="text-gray-500">{contact.note ?? ""}</span>
                  <span className="text-gray-400">{contact.logged_by ?? ""}</span>
                  {contact.lead_row_id && <span className="text-emerald-700">ligado a um lead</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* ── Conversões offline ───────────────────────────────────────────── */}
      <Section title="Conversões offline para o Google Ads"
        subtitle="Exportar não é importar. Exportado, carregado e aceite são três estados diferentes e estão registados em separado.">
        <div className="p-4 flex flex-wrap gap-2">
          <button
            disabled={saving || !ADS_QUALIFIED_LEAD_ACTION || qualifiedCandidates.length === 0}
            onClick={() => void exportOffline(ADS_QUALIFIED_LEAD_ACTION!, qualifiedCandidates, "kyro-qualificados.csv")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> Qualificados por exportar ({qualifiedCandidates.length})
          </button>
          <button
            disabled={saving || !ADS_CUSTOMER_CONVERSION_ACTION || customerCandidates.length === 0}
            onClick={() => void exportOffline(ADS_CUSTOMER_CONVERSION_ACTION!, customerCandidates, "kyro-clientes.csv")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> Clientes por exportar ({customerCandidates.length})
          </button>
        </div>
        {exportsRows.length === 0 ? <Empty>Nada exportado ainda.</Empty> : (
          <div className="overflow-x-auto border-t border-gray-100">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50/80">
                <Th>Lead</Th><Th>Ação</Th><Th>Identificador de clique</Th><Th>Data da conversão</Th><Th right>Valor</Th><Th>Estado</Th><Th>Marcar</Th>
              </tr></thead>
              <tbody>
                {exportsRows.slice(-50).reverse().map(row => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <Td>{row.lead_id}</Td>
                    <Td>{row.conversion_action}</Td>
                    <Td muted={!row.click_id}>{row.click_id ?? UNKNOWN}</Td>
                    <Td>{new Date(row.conversion_time).toLocaleDateString("pt-PT")}</Td>
                    <Td right>{row.value ? euros(row.value) : "—"}</Td>
                    <Td>{EXPORT_STATUS_LABEL[row.status] ?? row.status}</Td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        {row.status === "exported" && (
                          <button disabled={saving} onClick={() => void markExportStatus(row.id, "submitted")}
                            className="px-2 py-1 text-[11px] rounded border border-gray-200 hover:border-navy/30 disabled:opacity-40">Carregado</button>
                        )}
                        {row.status === "submitted" && (
                          <>
                            <button disabled={saving} onClick={() => void markExportStatus(row.id, "accepted")}
                              className="px-2 py-1 text-[11px] rounded border border-emerald-200 text-emerald-700 hover:border-emerald-400 disabled:opacity-40">Aceite</button>
                            <button disabled={saving} onClick={() => void markExportStatus(row.id, "rejected")}
                              className="px-2 py-1 text-[11px] rounded border border-red-200 text-red-700 hover:border-red-400 disabled:opacity-40">Recusada</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── E. Leads + atribuição ────────────────────────────────────────── */}
      <Section title="Leads" subtitle="Abrir um lead mostra a atribuição completa e permite mudar o estado do funil.">
        {joined.length === 0 ? <Empty>Sem leads no período escolhido.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50/80">
                <Th>Data</Th><Th>Serviço</Th><Th>Local</Th><Th>Origem</Th><Th>Campanha</Th><Th>Estado</Th><Th right>Faturado</Th><Th right>Recebido</Th>
              </tr></thead>
              <tbody>
                {joined.slice(0, 200).map(item => {
                  const a = item.attribution;
                  return (
                    <tr key={item.lead.id} onClick={() => setSelected(item)} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                      <Td>{new Date(item.lead.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "2-digit" })}</Td>
                      <Td>{item.lead.service ?? UNKNOWN}</Td>
                      <Td>{item.lead.location ?? UNKNOWN}</Td>
                      <Td muted={!a?.last_source}>{a?.last_source ?? UNKNOWN}{a?.is_paid ? " (pago)" : ""}</Td>
                      <Td muted={!a?.last_campaign}>{a?.last_campaign ?? UNKNOWN}</Td>
                      <Td>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_STYLE[item.lead.funnel_status ?? "NEW"]}`}>
                          {STATUS_LABEL[(item.lead.funnel_status ?? "NEW") as LeadStatusValue] ?? item.lead.funnel_status}
                        </span>
                      </Td>
                      <Td right>{item.lead.final_revenue ? euros(item.lead.final_revenue) : "—"}</Td>
                      <Td right>{item.lead.amount_received ? euros(item.lead.amount_received) : "—"}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── De onde vem cada número ──────────────────────────────────────── */}
      <Section title="De onde vem cada número"
        subtitle="Fórmula e tabela de origem de tudo o que está acima, para os valores poderem ser reconciliados à mão.">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50/80">
              <Th>Métrica</Th><Th>Fórmula</Th><Th>Origem</Th><Th>Depende de consentimento</Th>
            </tr></thead>
            <tbody>
              {METRIC_DEFINITIONS.map(definition => (
                <tr key={definition.metric} className="border-b border-gray-50">
                  <Td>{definition.metric}</Td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 font-mono whitespace-normal">{definition.formula}</td>
                  <Td muted>{definition.source}</Td>
                  <Td muted={!definition.consentDependent}>{definition.consentDependent ? "Sim" : "Não"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {selected && (
        <LeadDetail
          item={selected}
          saving={saving}
          history={statusHistory.filter(row => row.lead_row_id === selected.lead.id || (selected.lead.lead_id !== null && row.lead_id === selected.lead.lead_id))}
          onClose={() => setSelected(null)}
          onChangeStatus={next => void changeStatus(selected, next)}
          onSaveValue={(field, value) => void saveValue(selected, field, value)}
        />
      )}

      {showContactForm && (
        <ContactForm
          leads={joinedAll}
          saving={saving}
          onClose={() => setShowContactForm(false)}
          onSave={async payload => {
            setSaving(true);
            // `logged_by` não é enviado: o trigger escreve-o a partir da sessão.
            const { error } = await db.from("contact_log").insert(payload);
            if (error) setErrors(prev => [...prev, `Não foi possível registar o contacto: ${error.message}`]);
            else { await load(); setShowContactForm(false); }
            setSaving(false);
          }}
        />
      )}
    </div>
  );
};

// ── Registo manual de um contacto ────────────────────────────────────────────

/**
 * Registar à mão um contacto que aconteceu fora do site.
 *
 * Existe porque o site mede **cliques** e não conversas. Ligar um contacto a um
 * lead é uma afirmação de uma pessoa que sabe que são a mesma, nunca uma
 * dedução a partir de um clique. Deixar em branco é válido e comum: alguém que
 * ligou e nunca preencheu nada.
 */
const ContactForm = ({ leads, saving, onClose, onSave }: {
  leads: JoinedLead[];
  saving: boolean;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) => {
  const [channel, setChannel] = useState("whatsapp");
  const [leadRowId, setLeadRowId] = useState("");
  const [note, setNote] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-bold text-navy text-sm">Registar contacto real</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-gray-500">
            Uma conversa ou chamada que aconteceu mesmo. Não é um clique: um clique no WhatsApp já é
            contado à parte e nunca se transforma nisto sozinho.
          </p>
          <label className="block">
            <span className="text-[11px] text-gray-400">Canal</span>
            <select value={channel} onChange={e => setChannel(e.target.value)}
              className="w-full mt-0.5 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-navy outline-none focus:border-navy/40">
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Telefone</option>
              <option value="email">Email</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] text-gray-400">Quando</span>
            <input type="datetime-local" value={occurredAt} onChange={e => setOccurredAt(e.target.value)}
              className="w-full mt-0.5 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-navy outline-none focus:border-navy/40" />
          </label>
          <label className="block">
            <span className="text-[11px] text-gray-400">Ligar a um lead (opcional — só se souber que é a mesma pessoa)</span>
            <select value={leadRowId} onChange={e => setLeadRowId(e.target.value)}
              className="w-full mt-0.5 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-navy outline-none focus:border-navy/40">
              <option value="">Sem lead associado</option>
              {leads.slice(0, 100).map(item => (
                <option key={item.lead.id} value={item.lead.id}>
                  {new Date(item.lead.created_at).toLocaleDateString("pt-PT")} · {item.lead.service ?? "?"} · {item.lead.location ?? "?"}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] text-gray-400">Nota</span>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              className="w-full mt-0.5 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-navy outline-none focus:border-navy/40" />
          </label>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy">Cancelar</button>
          <button
            disabled={saving}
            onClick={() => void onSave({
              channel, direction: "inbound",
              occurred_at: new Date(occurredAt).toISOString(),
              lead_row_id: leadRowId || null,
              note: note.trim() || null,
            })}
            className="px-3 py-2 text-xs font-bold rounded-lg bg-navy text-white disabled:opacity-50">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Detalhe do lead ──────────────────────────────────────────────────────────

const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="py-1.5 border-b border-gray-50 last:border-0">
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className={`text-sm break-all ${value ? "text-navy" : "text-gray-400"}`}>{value || UNKNOWN}</p>
  </div>
);

const LeadDetail = ({ item, history, saving, onClose, onChangeStatus, onSaveValue }: {
  item: JoinedLead;
  history: StatusHistoryRow[];
  saving: boolean;
  onClose: () => void;
  onChangeStatus: (next: LeadStatusValue) => void;
  onSaveValue: (field: "quoted_value" | "booked_value" | "final_revenue" | "amount_received", value: string) => void;
}) => {
  const a = item.attribution;
  const clickId = a?.gclid ?? a?.gbraid ?? a?.wbraid ?? null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-navy text-sm">{item.lead.service ?? "Pedido"} · {item.lead.location ?? UNKNOWN}</p>
            <p className="text-xs text-gray-400">{item.lead.lead_id ?? "Lead anterior ao sistema de atribuição"}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estado do funil</p>
            <div className="flex flex-wrap gap-1.5">
              {LEAD_STATUSES.map(status => (
                <button key={status} disabled={saving} onClick={() => onChangeStatus(status)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                    item.lead.funnel_status === status ? STATUS_STYLE[status] : "border-gray-200 text-gray-500 hover:border-navy/30"
                  }`}>
                  {STATUS_LABEL[status]}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">O autor da mudança é lido da sessão pelo servidor, não enviado pelo browser.</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Valores (€)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                ["quoted_value", "Orçamentado", item.lead.quoted_value],
                ["booked_value", "Marcado", item.lead.booked_value],
                ["final_revenue", "Faturado", item.lead.final_revenue],
                ["amount_received", "Recebido", item.lead.amount_received],
              ] as const).map(([field, label, value]) => (
                <label key={field} className="block">
                  <span className="text-[11px] text-gray-400">{label}</span>
                  <input type="text" inputMode="decimal" defaultValue={value ?? ""} disabled={saving}
                    onBlur={e => { if (e.target.value !== String(value ?? "")) onSaveValue(field, e.target.value); }}
                    className="w-full mt-0.5 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-navy outline-none focus:border-navy/40 disabled:opacity-50"
                    placeholder="—" />
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Quatro momentos do mesmo dinheiro, nunca somados entre si. Vazio significa desconhecido, não zero.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Atribuição</p>
            {!a && <p className="text-sm text-gray-400 py-2">Sem atribuição registada — o pedido chegou na mesma. Acontece com quem recusa cookies de análise e com leads anteriores a 2026-09-18. Não se inventa para trás.</p>}
            {a && (
              <div className="grid sm:grid-cols-2 gap-x-6">
                <div>
                  <Field label="Source" value={a.last_source} />
                  <Field label="Medium" value={a.last_medium} />
                  <Field label="Campanha" value={a.last_campaign} />
                  <Field label="Campaign ID" value={a.campaign_id} />
                  <Field label="Ad group ID" value={a.ad_group_id} />
                  <Field label="Keyword (da conta)" value={a.keyword} />
                  <Field label="Match type" value={a.match_type} />
                  <Field label="Creative" value={a.creative_id} />
                </div>
                <div>
                  <Field label="Device (Ads)" value={a.ads_device} />
                  <Field label="Network" value={a.network} />
                  <Field label="Landing page" value={a.landing_page} />
                  <Field label="Conversion page" value={a.conversion_page} />
                  <Field label="GCLID / GBRAID / WBRAID" value={clickId} />
                  <Field label="Referrer" value={a.referrer_source ?? a.referrer} />
                  <Field label="Canal" value={a.channel} />
                  <Field label="Tráfego pago" value={a.is_paid ? "Sim" : "Não"} />
                </div>
              </div>
            )}
          </div>

          {a && (
            <div className="grid sm:grid-cols-2 gap-x-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">First touch</p>
                <Field label="Source / Medium" value={a.first_source ? `${a.first_source} / ${a.first_medium ?? UNKNOWN}` : null} />
                <Field label="Campanha" value={a.first_campaign} />
                <Field label="Landing page" value={a.first_landing_page} />
                <Field label="Quando" value={a.first_seen_at ? new Date(a.first_seen_at).toLocaleString("pt-PT") : null} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last touch</p>
                <Field label="Source / Medium" value={a.last_source ? `${a.last_source} / ${a.last_medium ?? UNKNOWN}` : null} />
                <Field label="Campanha" value={a.last_campaign} />
                <Field label="Landing page" value={a.last_landing_page} />
                <Field label="Quando" value={a.last_seen_at ? new Date(a.last_seen_at).toLocaleString("pt-PT") : null} />
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Histórico de estados</p>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400">Sem mudanças registadas.</p>
            ) : (
              <ul className="space-y-1.5">
                {history.map((row, index) => (
                  <li key={`${row.changed_at}-${index}`} className="text-sm text-navy flex flex-wrap gap-x-2">
                    <span className="text-gray-400 tabular-nums">{new Date(row.changed_at).toLocaleString("pt-PT")}</span>
                    <span>{row.previous_status ? `${row.previous_status} → ` : ""}{row.new_status}</span>
                    <span className="text-gray-400">{row.changed_by ?? UNKNOWN}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPanel;
