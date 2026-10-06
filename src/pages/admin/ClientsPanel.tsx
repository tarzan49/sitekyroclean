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
  followUpKind,
  type FollowUpKind,
  formatPhone,
  inWindow,
  matchesFilters,
  monthlyStats,
  normalizePhone,
  servicesByPhone,
  summarizeClient,
  type ClientFilters,
  type ClientRow,
  type ClientService,
  type ClientStatus,
  type ClientSummary,
  type StatPeriod,
  weeklyStats,
} from "@/lib/clientRecords";

// Separador "Clientes" (dono, 2026-10-06): fichas de todos os contactos do
// WhatsApp Business (os que fecharam, os por marcar e os não interessados), à
// parte do CRM de vendas. Os serviços de cada ficha leem-se do CRM pelo telefone.
// Serve para escolher grupos (Natal, Black Friday…) e para ver a evolução dos
// contactos e da taxa de fecho.

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
  const [services, setServices] = useState<ClientService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"fichas" | "seguimentos" | "evolucao">("fichas");
  const [filters, setFilters] = useState<ClientFilters>(emptyFilters());
  const [period, setPeriod] = useState<StatPeriod>(30);
  const [openId, setOpenId] = useState<string | null>(null);
  const [limit, setLimit] = useState(60);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const [c, s] = await Promise.all([
        db.from("clients").select("*").order("last_contact_at", { ascending: false, nullsFirst: false }),
        db.from("service_requests").select("id, request_date, description, billed_value, client_name, city, phone"),
      ]);
      if (c.error) throw c.error;
      if (s.error) throw s.error;
      setClients(c.data ?? []);
      setServices(s.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const enriched = useMemo<Enriched[]>(() => {
    const byPhone = servicesByPhone(services);
    const today = lisbonDay(new Date());
    return clients.map(client => {
      const summary = summarizeClient(client, byPhone, today);
      return { client, summary, status: effectiveStatus(client, summary) };
    });
  }, [clients, services]);

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

  const saveClient = async (id: string, patch: Partial<Pick<ClientRow, "name" | "notes" | "follow_up_at" | "follow_up_reason">>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any).from("clients").update(patch).eq("id", id);
    if (err) { setError(err.message); return false; }
    setClients(list => list.map(c => (c.id === id ? { ...c, ...patch } : c)));
    return true;
  };

  const open = enriched.find(e => e.client.id === openId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-playfair text-xl font-bold text-navy">Clientes</h2>
          <p className="text-sm text-gray-500">Todos os contactos do WhatsApp com etiqueta, à parte do CRM de vendas.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-white" role="group">
            {([["fichas", "Fichas"], ["seguimentos", "Seguimentos"], ["evolucao", "Evolução"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setView(id)} aria-pressed={view === id}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${view === id ? "bg-navy text-white" : "text-navy hover:bg-gray-50"}`}>{label}</button>
            ))}
          </div>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-navy hover:border-navy/30">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

      {view === "fichas" ? (
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
      ) : view === "seguimentos" ? (
        <FollowUps rows={enriched} onOpen={setOpenId} onSave={saveClient} />
      ) : (
        <Evolution rows={enriched} period={period} setPeriod={setPeriod} />
      )}

      {open && <ClientCard item={open} onClose={() => setOpenId(null)} onSave={saveClient} />}
    </div>
  );
};

const FOLLOW_UP_GROUPS: { kind: FollowUpKind; title: string; note: string }[] = [
  { kind: "lembrete", title: "Avisos com data", note: "Contactos que ficaram para mais tarde. Aparecem 7 dias antes do dia marcado na ficha." },
  { kind: "a_espera", title: "À espera de nós", note: "O cliente escreveu por último e ninguém lhe respondeu." },
  { kind: "seguimento", title: "Seguimento sugerido", note: "Por marcar, a última mensagem foi nossa. Antes de escrever, conta quantas ficaram sem resposta: com duas ou mais, melhor parar." },
  { kind: "epoca", title: "Para o Natal e a Black Friday", note: "Não interessados ou parados há mais de 40 dias: uma mensagem de época, não um seguimento." },
];

function addDays(day: string, n: number) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function FollowUps({ rows, onOpen, onSave }: {
  rows: Enriched[];
  onOpen: (id: string) => void;
  onSave: (id: string, patch: Partial<Pick<ClientRow, "follow_up_at" | "follow_up_reason">>) => Promise<boolean>;
}) {
  const today = lisbonDay(new Date());
  const items = rows
    .map(r => ({ r, f: followUpKind(r, today) }))
    .filter((x): x is { r: Enriched; f: NonNullable<ReturnType<typeof followUpKind>> } => x.f !== null);
  const upcoming = rows
    .filter(r => r.client.follow_up_at && r.client.follow_up_at > addDays(today, 7))
    .sort((a, b) => a.client.follow_up_at!.localeCompare(b.client.follow_up_at!));

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Calculado a partir das datas das fichas. As fichas atualizam-se quando o WhatsApp é lido de novo; até lá, o que aconteceu depois da última leitura não aparece aqui.
      </p>
      {FOLLOW_UP_GROUPS.map(g => {
        const list = items.filter(x => x.f.kind === g.kind).sort((a, b) => g.kind === "lembrete" ? a.f.days - b.f.days : a.f.days - b.f.days);
        if (list.length === 0 && g.kind !== "lembrete") return null;
        return (
          <div key={g.kind} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 pb-2">
              <p className="text-sm font-bold text-navy">{g.title} ({list.length})</p>
              <p className="text-[11px] text-gray-500">{g.note}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {list.length === 0 && <p className="px-4 pb-4 text-sm text-gray-500">Nenhum aviso para os próximos 7 dias.</p>}
              {list.map(({ r, f }) => (
                <div key={r.client.id} className="px-4 py-3 flex items-start gap-3">
                  <button onClick={() => onOpen(r.client.id)} className="min-w-0 flex-1 text-left">
                    <p className="font-medium text-navy truncate">{displayName(r.client, r.summary.services)}
                      <span className="ml-2 text-[11px] text-gray-500 font-normal">{formatPhone(r.client.phone)}{r.client.region ? ` · ${r.client.region}` : ""}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      {g.kind === "lembrete"
                        ? `${f.days < 0 ? `Passou há ${-f.days} d` : f.days === 0 ? "É hoje" : `Daqui a ${f.days} d`} (${dayLabel(r.client.follow_up_at!)}): ${r.client.follow_up_reason ?? ""}`
                        : `${f.days} d sem novidades · ${r.client.services.join(", ") || STATUS_LABEL[r.status]}`}
                    </p>
                  </button>
                  <div className="flex gap-1.5 shrink-0">
                    <a href={`https://wa.me/${normalizePhone(r.client.phone)}`} target="_blank" rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 text-navy hover:border-navy/30">WhatsApp</a>
                    {g.kind === "lembrete" && (
                      <button onClick={() => onSave(r.client.id, { follow_up_at: null, follow_up_reason: null })}
                        className="px-2.5 py-1.5 text-xs rounded-lg bg-navy text-white">Feito</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {upcoming.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-bold text-navy mb-2">Próximos avisos ({upcoming.length})</p>
          <ul className="space-y-1">
            {upcoming.map(r => (
              <li key={r.client.id} className="text-xs text-navy">
                <button onClick={() => onOpen(r.client.id)} className="text-left">
                  <strong>{dayLabel(r.client.follow_up_at!)}</strong> · {displayName(r.client, r.summary.services)}: <span className="text-gray-600">{r.client.follow_up_reason}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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

function ClientCard({ item, onClose, onSave }: { item: Enriched; onClose: () => void; onSave: (id: string, patch: Partial<Pick<ClientRow, "name" | "notes" | "follow_up_at" | "follow_up_reason">>) => Promise<boolean> }) {
  const { client: c, summary: s, status } = item;
  const [name, setName] = useState(c.name ?? "");
  const [notes, setNotes] = useState(c.notes ?? "");
  const [followAt, setFollowAt] = useState(c.follow_up_at ?? "");
  const [followWhy, setFollowWhy] = useState(c.follow_up_reason ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = name !== (c.name ?? "") || notes !== (c.notes ?? "") || followAt !== (c.follow_up_at ?? "") || followWhy !== (c.follow_up_reason ?? "");

  const save = async () => {
    setSaving(true);
    const ok = await onSave(c.id, { name: name.trim() || null, notes: notes.trim() || null, follow_up_at: followAt || null, follow_up_reason: followAt ? followWhy.trim() || null : null });
    setSaving(false);
    if (ok) onClose();
  };

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

        <div>
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Serviços no CRM</p>
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
          <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">Nome a usar nas mensagens</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={firstName(c, s.services) || "Ex.: Ana Silva"}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-navy/40" />
        </label>
        <label className="block">
          <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">Notas</span>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Ex.: tem 2 gatos, sofá cinza de 3 lugares, prefere manhãs"
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-navy/40" />
        </label>

        <div className="grid grid-cols-[auto_1fr] gap-2 items-end">
          <label className="block">
            <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">Lembrar em</span>
            <input type="date" value={followAt} onChange={e => setFollowAt(e.target.value)}
              className="mt-1 block px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-navy/40" />
          </label>
          <label className="block">
            <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">Porquê</span>
            <input value={followWhy} onChange={e => setFollowWhy(e.target.value)} placeholder="Ex.: o sofá novo chega em novembro"
              className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-navy/40" />
          </label>
        </div>

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
