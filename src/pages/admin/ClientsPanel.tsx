import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Search, X, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lisbonDay } from "@/lib/crmClosings";
import {
  CLIENT_REGIONS,
  CLIENT_SERVICES,
  CLIENT_STATUSES,
  STATUS_LABEL,
  STAT_PERIODS,
  clientsCsv,
  contactMonth,
  contactStats,
  contactWeek,
  displayName,
  effectiveStatus,
  emptyFilters,
  firstName,
  formatPhone,
  inWindow,
  matchesFilters,
  monthlyStats,
  normalizePhone,
  servicesByPhone,
  summarizeClient,
  type ClientFilters,
  type ClientRow,
  type ClientStatus,
  type ClientSummary,
  type StatPeriod,
  weeklyStats,
} from "@/lib/clientRecords";
import {
  ACTION_LABEL,
  CONTACT_PREFERENCES,
  CONTACT_PREFERENCE_LABEL,
  STAGE_INFO,
  planAll,
  snapshotAt,
  type ClientTouch,
  type ContactPreference,
  type PlannedClient,
} from "@/lib/clientFollowUp";
import ClientsToday from "./ClientsToday";
import ClientsCampaigns from "./ClientsCampaigns";
import ClientsStrategy, { type SpendRow, type StrategyService } from "./ClientsStrategy";
import type { ClientPatch, TouchPayload } from "./FollowUpActionCard";

// Separador "Clientes" (dono, 2026-10-06): fichas de todos os contactos do
// WhatsApp Business (os que fecharam, os por marcar e os não interessados), à
// parte do CRM de vendas. Os serviços de cada ficha leem-se do CRM pelo telefone.
// Vistas: Hoje (o que fazer hoje, com a mensagem pronta), Campanhas, Estratégia,
// Fichas e Evolução. As regras dos seguimentos vivem em clientFollowUp.ts e são
// as mesmas do email das 9h30 e do bot.

const GOLD = "#D4AF37";
const money = (n: number) => `${Math.round(n).toLocaleString("pt-PT")}€`;
const pct = (r: number | null) => (r === null ? "-" : `${Math.round(r * 100)}%`);
const dayLabel = (iso: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}` : "-");
const MONTH_FMT = new Intl.DateTimeFormat("pt-PT", { month: "long", timeZone: "UTC" });
const monthLabel = (m: string) => `${MONTH_FMT.format(new Date(`${m}-15T12:00:00Z`))} ${m.slice(0, 4)}`;
/** "28/09 a 04/10" a partir da segunda-feira. */
const weekLabel = (monday: string) => {
  const end = new Date(`${monday}T12:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 6);
  const dm = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
  return `${dm(monday)} a ${dm(end.toISOString().slice(0, 10))}`;
};

const STATUS_STYLE: Record<ClientStatus, string> = {
  cliente: "bg-green-50 text-green-800 border-green-200",
  marcado: "bg-blue-50 text-blue-800 border-blue-200",
  por_marcar: "bg-amber-50 text-amber-800 border-amber-200",
  nao_interessado: "bg-gray-100 text-gray-600 border-gray-200",
  sem_estado: "bg-white text-gray-500 border-gray-200",
};

type Enriched = { client: ClientRow; summary: ClientSummary; status: ClientStatus };
type View = "hoje" | "campanhas" | "estrategia" | "fichas" | "evolucao";

const TOUCH_COLUMNS = "id, client_id, kind, campaign, template, skipped, note, message, channel, created_at";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${active ? "bg-navy text-white border-navy" : "bg-white text-navy border-gray-200 hover:border-navy/30"}`}>
      {children}
    </button>
  );
}

function Kpi({ label, value, note, accent }: { label: string; value: string; note?: React.ReactNode; accent?: boolean }) {
  return (
    <div className={accent ? "bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border border-gold/25 rounded-xl p-4" : "bg-white border border-gray-200 rounded-xl p-4"}>
      <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-navy">{value}</p>
      {note && <p className="text-[11px] text-gray-500 mt-0.5">{note}</p>}
    </div>
  );
}

/** "+12 vs. 30 dias antes" a verde/vermelho. */
function Delta({ now, before, rate }: { now: number | null; before: number | null; rate?: boolean }) {
  if (now === null || before === null) return <span>sem período anterior</span>;
  const diff = rate ? Math.round((now - before) * 100) : now - before;
  const sign = diff > 0 ? "+" : "";
  const color = diff > 0 ? "text-green-700" : diff < 0 ? "text-red-600" : "text-gray-500";
  return <span className={color}>{sign}{diff}{rate ? " p.p." : ""} vs. período anterior</span>;
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);

const ClientsPanel = () => {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [services, setServices] = useState<StrategyService[]>([]);
  const [touches, setTouches] = useState<ClientTouch[]>([]);
  const [touchesReady, setTouchesReady] = useState(true);
  const [spend, setSpend] = useState<SpendRow[]>([]);
  const [lastDigest, setLastDigest] = useState<{ day: string; items: number; error: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("hoje");
  const [filters, setFilters] = useState<ClientFilters>(emptyFilters());
  const [period, setPeriod] = useState<StatPeriod>(30);
  const [openId, setOpenId] = useState<string | null>(null);
  const [limit, setLimit] = useState(60);
  // As regras dependem da hora (seguimento "a partir das 15h", noite): recalcula de 5 em 5 minutos.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5 * 60_000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const since = new Date(Date.now() - 400 * 86_400_000).toISOString();
      const spendSince = lisbonDay(new Date(Date.now() - 60 * 86_400_000));
      const [c, s, t, d, sp] = await Promise.all([
        db.from("clients").select("*").order("last_contact_at", { ascending: false, nullsFirst: false }),
        db.from("service_requests").select("id, request_date, description, billed_value, client_name, city, phone, locality, booked_at, created_at, source, calendar_missing_since"),
        db.from("client_touches").select(TOUCH_COLUMNS).gte("created_at", since).order("created_at", { ascending: false }),
        db.from("follow_up_digests").select("day, items, error").order("day", { ascending: false }).limit(1),
        db.from("ad_spend_daily").select("platform, spend_date, amount").gte("spend_date", spendSince),
      ]);
      if (c.error) throw c.error;
      if (s.error) throw s.error;
      setClients(c.data ?? []);
      setServices(s.data ?? []);
      // O registo de envios é de 06/10/2026: sem a migração, o resto do separador funciona na mesma.
      setTouchesReady(!t.error);
      setTouches(t.error ? [] : t.data ?? []);
      setLastDigest(d.error ? null : d.data?.[0] ?? null);
      setSpend(sp.error ? [] : sp.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Um evento apagado do calendário não é um serviço (como no separador Google Ads).
  const liveServices = useMemo(() => services.filter(s => !s.calendar_missing_since), [services]);

  const enriched = useMemo<Enriched[]>(() => {
    const byPhone = servicesByPhone(liveServices);
    const today = lisbonDay(new Date());
    return clients.map(client => {
      const summary = summarizeClient(client, byPhone, today);
      return { client, summary, status: effectiveStatus(client, summary) };
    });
  }, [clients, liveServices]);

  const followUpData = useMemo(() => ({ clients, services, touches }), [clients, services, touches]);
  const planned = useMemo<PlannedClient[]>(
    () => planAll(followUpData, { now: new Date() }),
    [followUpData, tick], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const todayCount = planned.filter(p => p.plan.today.some(a => a.kind !== "campanha")).length;

  const filtered = useMemo(() => enriched.filter(e => matchesFilters(e.client, e.summary, filters)), [enriched, filters]);
  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(CLIENT_STATUSES.map(s => [s, 0])) as Record<ClientStatus, number>;
    for (const e of enriched) counts[e.status]++;
    return counts;
  }, [enriched]);

  const exportCsv = () => {
    const blob = new Blob(["﻿" + clientsCsv(filtered)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `kyro-clientes-${lisbonDay(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveClient = async (id: string, patch: ClientPatch) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any).from("clients").update(patch).eq("id", id);
    if (err) { setError(err.message); return false; }
    setClients(list => list.map(c => (c.id === id ? { ...c, ...patch } : c)));
    return true;
  };

  const logTouch = async (clientId: string, p: TouchPayload) => {
    if (!touchesReady) {
      setError("O registo de envios ainda não está instalado na base de dados (migração 20261006210000).");
      return false;
    }
    const row = {
      client_id: clientId, kind: p.kind, campaign: p.campaign ?? null, template: p.template ?? null,
      skipped: !!p.skipped, message: p.message ? p.message.slice(0, 4000) : null, note: p.note ?? null, channel: "painel",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: err } = await (supabase as any).from("client_touches").insert(row).select(TOUCH_COLUMNS).single();
    if (err) { setError(err.message); return false; }
    setTouches(list => [data as ClientTouch, ...list]);
    return true;
  };

  const sendDigest = async () => {
    const { data, error: err } = await supabase.functions.invoke("follow-up-digest", { body: { send: true } });
    if (err) return "Não foi possível mandar o email.";
    load();
    return data?.sent ? `Email enviado (${data.count} pessoas).` : "Nada para seguir hoje: email não enviado.";
  };

  const open = enriched.find(e => e.client.id === openId) ?? null;
  const openPlan = planned.find(p => p.client.id === openId) ?? null;
  const handlers = { onLog: logTouch, onSave: saveClient, onOpen: setOpenId };

  const VIEWS: [View, string][] = [
    ["hoje", `Hoje${todayCount ? ` (${todayCount})` : ""}`],
    ["campanhas", "Campanhas"],
    ["estrategia", "Estratégia"],
    ["fichas", "Fichas"],
    ["evolucao", "Evolução"],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-playfair text-xl font-bold text-navy">Clientes</h2>
          <p className="text-sm text-gray-500">Todos os contactos do WhatsApp com etiqueta, à parte do CRM de vendas.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-white overflow-x-auto" role="group">
            {VIEWS.map(([id, label]) => (
              <button key={id} onClick={() => setView(id)} aria-pressed={view === id}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${view === id ? "bg-navy text-white" : "text-navy hover:bg-gray-50"}`}>{label}</button>
            ))}
          </div>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-navy hover:border-navy/30">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
      {!touchesReady && !loading && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
          O registo de envios ainda não está na base de dados: as sugestões aparecem, mas "Enviei" não grava.
        </p>
      )}

      {view === "hoje" ? (
        <ClientsToday planned={planned} snapshot={snapshotAt(clients)} lastDigest={lastDigest} onSendDigest={sendDigest}
          onShowCampaigns={() => setView("campanhas")} {...handlers} />
      ) : view === "campanhas" ? (
        <ClientsCampaigns data={followUpData} {...handlers} />
      ) : view === "estrategia" ? (
        <ClientsStrategy planned={planned} data={followUpData} spend={spend} services={services} />
      ) : view === "fichas" ? (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                placeholder="Nome, telefone, nota ou serviço"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-navy/40" />
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mr-1">Estado</span>
              {CLIENT_STATUSES.filter(s => statusCounts[s] > 0).map(s => (
                <Chip key={s} active={filters.statuses.includes(s)} onClick={() => setFilters(f => ({ ...f, statuses: toggle(f.statuses, s) }))}>
                  {STATUS_LABEL[s]} ({statusCounts[s]})
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mr-1">Artigo</span>
              {CLIENT_SERVICES.map(s => (
                <Chip key={s} active={filters.services.includes(s)} onClick={() => setFilters(f => ({ ...f, services: toggle(f.services, s) }))}>{s}</Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mr-1">Região</span>
              {CLIENT_REGIONS.map(r => (
                <Chip key={r} active={filters.regions.includes(r)} onClick={() => setFilters(f => ({ ...f, regions: toggle(f.regions, r) }))}>{r}</Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mr-1">Origem</span>
              <Chip active={filters.googleAds === "yes"} onClick={() => setFilters(f => ({ ...f, googleAds: f.googleAds === "yes" ? "all" : "yes" }))}>Anúncio Google</Chip>
              <Chip active={filters.googleAds === "no"} onClick={() => setFilters(f => ({ ...f, googleAds: f.googleAds === "no" ? "all" : "no" }))}>Sem anúncio</Chip>
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider ml-2 mr-1">Avaliação</span>
              <Chip active={filters.review === "yes"} onClick={() => setFilters(f => ({ ...f, review: f.review === "yes" ? "all" : "yes" }))}>Já deu</Chip>
              <Chip active={filters.review === "no"} onClick={() => setFilters(f => ({ ...f, review: f.review === "no" ? "all" : "no" }))}>Ainda não</Chip>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-navy"><strong>{filtered.length}</strong> de {enriched.length} contactos</p>
            <div className="flex gap-2">
              {JSON.stringify(filters) !== JSON.stringify(emptyFilters()) && (
                <button onClick={() => setFilters(emptyFilters())} className="px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-navy">Limpar filtros</button>
              )}
              <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-navy hover:border-navy/30">
                <Download className="w-3.5 h-3.5" /> Exportar lista (CSV)
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {filtered.slice(0, limit).map(({ client: c, summary: s, status }) => (
              <button key={c.id} onClick={() => setOpenId(c.id)} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-navy truncate">{displayName(c, s.services)}</span>
                    <span className={`text-[10.5px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>
                    {c.from_google_ads && <span className="text-[10.5px] px-2 py-0.5 rounded-full border border-gold/40 text-[#8B6914]">Google</span>}
                    {c.contact_preference === "nao_contactar" && <span className="text-[10.5px] px-2 py-0.5 rounded-full border border-red-200 text-red-700">Não contactar</span>}
                    {c.on_hold_reason && <span className="text-[10.5px] px-2 py-0.5 rounded-full border border-amber-200 text-amber-800">Em pausa</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {formatPhone(c.phone)}{c.region ? ` · ${c.region}` : ""}{c.services.length ? ` · ${c.services.join(", ")}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-navy">{s.totalBilled ? money(s.totalBilled) : ""}</p>
                  <p className="text-[11px] text-gray-500">{s.lastServiceDate ? `serviço ${dayLabel(s.lastServiceDate)}` : `contacto ${dayLabel(c.last_contact_at)}`}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-sm text-gray-500 text-center py-8">{loading ? "A carregar…" : "Nenhum contacto com estes filtros."}</p>}
          </div>
          {filtered.length > limit && (
            <button onClick={() => setLimit(l => l + 100)} className="w-full py-2 text-xs rounded-lg border border-gray-200 bg-white text-navy">
              Mostrar mais ({filtered.length - limit})
            </button>
          )}
        </>
      ) : (
        <Evolution rows={enriched} period={period} setPeriod={setPeriod} />
      )}

      {open && (
        <ClientCard key={open.client.id} item={open} plan={openPlan} touches={touches.filter(t => t.client_id === open.client.id)}
          onClose={() => setOpenId(null)} onSave={saveClient} />
      )}
    </div>
  );
};

function Evolution({ rows, period, setPeriod }: { rows: Enriched[]; period: StatPeriod; setPeriod: (p: StatPeriod) => void }) {
  const now = new Date();
  const current = contactStats(inWindow(rows, now, period));
  const before = contactStats(inWindow(rows, now, period, 1));
  const hasBefore = before.contacts > 0;
  const months = monthlyStats(rows);
  const weeks = weeklyStats(rows);
  const undated = rows.filter(r => !r.client.first_contact_at).length;
  const thisMonth = contactMonth(now.toISOString());
  const thisWeek = contactWeek(now.toISOString());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-white w-fit" role="group" aria-label="Período">
        {STAT_PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)} aria-pressed={period === p}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${period === p ? "bg-navy text-white" : "text-navy hover:bg-gray-50"}`}>{p} dias</button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi accent label="Contactos novos" value={String(current.contacts)} note={<Delta now={current.contacts} before={hasBefore ? before.contacts : null} />} />
        <Kpi label="Fecharam" value={String(current.closed)} note={`serviço feito ou marcado · ${current.notInterested} não interessados`} />
        <Kpi label="Taxa de fecho" value={pct(current.closeRate)} note={<Delta now={current.closeRate} before={hasBefore ? before.closeRate : null} rate />} />
        <Kpi label="Mensagem recebida vs fecho" value={pct(current.messageCloseRate)}
          note={<>{current.closedWhoWrote} de {current.wrote} que escreveram · <Delta now={current.messageCloseRate} before={hasBefore ? before.messageCloseRate : null} rate /></>} />
      </div>

      <StatsTable title="Por mês" note="Cada contacto conta no mês do primeiro contacto. Todos os meses, seja qual for o período escolhido em cima."
        firstColumn="Mês" rows={months} label={monthLabel} running={thisMonth} />
      <StatsTable title="Por semana" note="De segunda a domingo, pela semana do primeiro contacto. Todas as semanas, da mais recente para a mais antiga."
        firstColumn="Semana" rows={[...weeks].reverse()} label={weekLabel} running={thisWeek} newestFirst />

      <p className="text-[11px] text-gray-500">
        Fecharam = etiqueta Concluído, Deu Avaliação ou Serviço Marcado, ou um serviço no CRM com o mesmo telefone. "Mensagem recebida vs fecho" conta só quem
        chegou a escrever (há conversas que começaram por nós). A etiqueta de um contacto recente pode ainda mudar, por isso o mês e a semana em curso tendem a subir.
        {undated > 0 && ` ${undated} contactos antigos não têm data de primeiro contacto (o WhatsApp não guardava o início da conversa) e ficam fora destas contas.`}
      </p>
    </div>
  );
}

type StatRow = ReturnType<typeof monthlyStats>[number];

function StatsTable({ title, note, firstColumn, rows, label, running, newestFirst }: {
  title: string; note: string; firstColumn: string; rows: StatRow[]; label: (key: string) => string; running: string; newestFirst?: boolean;
}) {
  const maxContacts = Math.max(1, ...rows.map(r => r.contacts));
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 pb-3">
        <p className="text-sm font-bold text-navy">{title}</p>
        <p className="text-[11px] text-gray-500">{note}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-y border-gray-200 bg-gray-50">
              {[firstColumn, "Contactos", "Escreveram", "Fecharam", "Taxa de fecho", "Msg recebida vs fecho", "Do anúncio Google"].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const prev = rows[newestFirst ? i + 1 : i - 1];
              const isRunning = r.key === running;
              const change = prev ? Math.round((r.closeRate ?? 0) * 100) - Math.round((prev.closeRate ?? 0) * 100) : 0;
              return (
                <tr key={r.key} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 text-navy font-medium whitespace-nowrap first-letter:uppercase">
                    {label(r.key)}{isRunning && <span className="text-gray-500 font-normal"> (até hoje)</span>}
                  </td>
                  <td className="px-3 py-2 min-w-[110px]">
                    <span className="font-semibold text-navy">{r.contacts}</span>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(r.contacts / maxContacts) * 100}%`, background: GOLD }} />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-navy">{r.wrote}</td>
                  <td className="px-3 py-2 text-navy">{r.closed}</td>
                  <td className="px-3 py-2 text-navy font-semibold whitespace-nowrap">
                    {pct(r.closeRate)}
                    {!isRunning && change !== 0 && <span className={`ml-1 text-[10.5px] ${change > 0 ? "text-green-700" : "text-red-600"}`}>{change > 0 ? "▲" : "▼"}</span>}
                  </td>
                  <td className="px-3 py-2 text-navy">{pct(r.messageCloseRate)}</td>
                  <td className="px-3 py-2 text-navy">{r.googleAds}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={7} className="text-center text-gray-500 py-6">Sem contactos com data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const field = "mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-navy/40";
const fieldLabel = "text-[10.5px] font-bold text-gray-500 uppercase tracking-wider";

function ClientCard({ item, plan, touches, onClose, onSave }: {
  item: Enriched;
  plan: PlannedClient | null;
  touches: ClientTouch[];
  onClose: () => void;
  onSave: (id: string, patch: ClientPatch) => Promise<boolean>;
}) {
  const { client: c, summary: s, status } = item;
  const initial = {
    name: c.name ?? "",
    notes: c.notes ?? "",
    followAt: c.follow_up_at ?? "",
    followWhy: c.follow_up_reason ?? "",
    pref: (c.contact_preference ?? "normal") as ContactPreference,
    prefNote: c.contact_note ?? "",
    hold: c.on_hold_reason ?? "",
    referredBy: c.referred_by ?? "",
  };
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) => setForm(f => ({ ...f, [key]: value }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const save = async () => {
    setSaving(true);
    const ok = await onSave(c.id, {
      name: form.name.trim() || null,
      notes: form.notes.trim() || null,
      follow_up_at: form.followAt || null,
      follow_up_reason: form.followAt ? form.followWhy.trim() || null : null,
      contact_preference: form.pref,
      contact_note: form.pref === "normal" ? null : form.prefNote.trim() || null,
      on_hold_reason: form.hold.trim() || null,
      referred_by: form.referredBy.trim() || null,
    });
    setSaving(false);
    if (ok) onClose();
  };

  const stage = plan ? STAGE_INFO[plan.plan.stage] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-playfair text-lg font-bold text-navy truncate">{displayName(c, s.services)}</h3>
            <p className="text-sm text-gray-500">{formatPhone(c.phone)}{c.whatsapp_name ? ` · WhatsApp: ${c.whatsapp_name}` : ""}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="p-1 text-gray-400 hover:text-navy"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>
          {c.region && <span className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 text-navy">{c.region}</span>}
          {c.services.map(x => <span key={x} className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 text-navy">{x}</span>)}
          {c.from_google_ads && <span className="text-[11px] px-2 py-0.5 rounded-full border border-gold/40 text-[#8B6914]">Anúncio Google</span>}
          {c.reviewed_google && <span className="text-[11px] px-2 py-0.5 rounded-full border border-green-200 text-green-800">Deu avaliação</span>}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="border border-gray-200 rounded-lg p-2"><p className="text-[10px] text-gray-500 uppercase">Serviços</p><p className="font-bold text-navy">{s.services.length}</p></div>
          <div className="border border-gray-200 rounded-lg p-2"><p className="text-[10px] text-gray-500 uppercase">Total</p><p className="font-bold text-navy">{money(s.totalBilled)}</p></div>
          <div className="border border-gray-200 rounded-lg p-2"><p className="text-[10px] text-gray-500 uppercase">Último</p><p className="font-bold text-navy">{s.daysSinceLastService === null ? "-" : s.daysSinceLastService <= 0 ? "hoje" : `há ${s.daysSinceLastService} d`}</p></div>
        </div>

        {plan && stage && (
          <div className="border border-gold/30 bg-gold/[0.05] rounded-xl p-3 space-y-1.5">
            <p className="text-xs text-navy"><strong>{stage.label}.</strong> {stage.stance}</p>
            {plan.plan.today.map(a => <p key={a.kind} className="text-xs text-navy">Hoje: <strong>{a.title}</strong> · {a.why}</p>)}
            {plan.plan.soon.map(a => <p key={a.kind} className="text-xs text-gray-700">{dayLabel(a.due)}: {a.title}</p>)}
            {plan.plan.blocked.map(b => <p key={`${b.kind}:${b.campaignId ?? ""}`} className="text-xs text-gray-600">Não enviar {ACTION_LABEL[b.kind].toLowerCase()}: {b.reason}</p>)}
            {!plan.plan.today.length && !plan.plan.soon.length && !plan.plan.blocked.length && <p className="text-xs text-gray-600">Nada a fazer por agora.</p>}
          </div>
        )}

        <div>
          <p className={`${fieldLabel} mb-1`}>Serviços no CRM</p>
          {s.services.length === 0 ? <p className="text-sm text-gray-500">Nenhum serviço com este telefone no CRM.</p> : (
            <ul className="space-y-1.5">
              {[...s.services].reverse().map(r => (
                <li key={r.id} className="text-sm text-navy flex justify-between gap-3">
                  <span className="min-w-0"><span className="text-gray-500">{dayLabel(r.request_date)}</span> {r.description}</span>
                  <span className="font-semibold shrink-0">{money(Number(r.billed_value || 0))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-0.5">
          <p>Primeiro contacto: {dayLabel(c.first_contact_at)} · Último contacto: {dayLabel(c.last_contact_at)} · Última mensagem do cliente: {dayLabel(c.last_client_message_at)}</p>
          {c.labels.length > 0 && <p>Etiquetas: {c.labels.join(", ")}</p>}
        </div>

        <label className="block">
          <span className={fieldLabel}>Nome a usar nas mensagens</span>
          <input value={form.name} onChange={e => set("name", e.target.value)} placeholder={firstName(c, s.services) || "Ex.: Ana Silva"} className={field} />
        </label>
        <label className="block">
          <span className={fieldLabel}>Notas</span>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Ex.: tem 2 gatos, sofá cinza de 3 lugares, prefere manhãs" className={field} />
        </label>

        <div className="grid grid-cols-[auto_1fr] gap-2 items-end">
          <label className="block">
            <span className={fieldLabel}>Lembrar em</span>
            <input type="date" value={form.followAt} onChange={e => set("followAt", e.target.value)}
              className="mt-1 block px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-navy/40" />
          </label>
          <label className="block">
            <span className={fieldLabel}>Porquê</span>
            <input value={form.followWhy} onChange={e => set("followWhy", e.target.value)} placeholder="Ex.: o sofá novo chega em novembro" className={field} />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="block">
            <span className={fieldLabel}>Mensagens</span>
            <select value={form.pref} onChange={e => set("pref", e.target.value as ContactPreference)} className={field}>
              {CONTACT_PREFERENCES.map(p => <option key={p} value={p}>{CONTACT_PREFERENCE_LABEL[p]}</option>)}
            </select>
          </label>
          {form.pref !== "normal" && (
            <label className="block">
              <span className={fieldLabel}>Porquê</span>
              <input value={form.prefNote} onChange={e => set("prefNote", e.target.value)} placeholder="Ex.: pediu a 06/10" className={field} />
            </label>
          )}
        </div>
        <label className="block">
          <span className={fieldLabel}>Em pausa: queixa ou problema em aberto</span>
          <input value={form.hold} onChange={e => set("hold", e.target.value)} placeholder="Ex.: mancha voltou, equipa volta dia 9 (vazio = sem pausa)" className={field} />
        </label>
        <label className="block">
          <span className={fieldLabel}>Recomendado por</span>
          <input value={form.referredBy} onChange={e => set("referredBy", e.target.value)} placeholder="Nome ou telefone de quem recomendou" className={field} />
        </label>

        {touches.length > 0 && (
          <div>
            <p className={`${fieldLabel} mb-1`}>Seguimentos registados</p>
            <ul className="space-y-1">
              {touches.map(t => (
                <li key={t.id} className="text-xs text-navy">
                  <span className="text-gray-500">{dayLabel(lisbonDay(t.created_at))}</span>{" "}
                  {t.kind === "outro" ? "Outro" : ACTION_LABEL[t.kind]}{t.campaign ? ` (${t.campaign})` : ""}
                  <span className="text-gray-500"> · {t.skipped ? "decidido não enviar" : t.channel === "bot" ? "enviado pelo bot" : "enviado"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <a href={`https://wa.me/${normalizePhone(c.phone)}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm rounded-lg border border-gray-200 text-navy hover:border-navy/30">
            <MessageCircle className="w-4 h-4" /> Abrir conversa
          </a>
          <button onClick={save} disabled={!dirty || saving}
            className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-navy text-white disabled:opacity-40">{saving ? "A gravar…" : "Gravar"}</button>
        </div>
      </div>
    </div>
  );
}

export default ClientsPanel;
