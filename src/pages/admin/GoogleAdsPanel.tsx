import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Info, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, lisbonDay } from "@/lib/crmClosings";
import { syncCalendarIntoCrm } from "@/lib/crmCalendarSync";
import {
  ADS_START_DAY, closedDay, computeGoogleAdsResults, safeDiv, shareOf,
  type AdsStatRow, type ContactRow, type ServiceRow,
} from "@/lib/googleAdsResults";

// Separador "Google Ads" (dono, 2026-10-06): o que o anúncio custa e o que traz
// de verdade, sem depender de cookies. Substitui o painel antigo de atribuição
// (que só via quem aceitava as cookies, cerca de 60%). As regras de quem conta
// como Google estão em googleAdsResults.ts.

const money = (n: number) => `${n.toLocaleString("pt-PT", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`;
const money0 = (n: number) => `${Math.round(n).toLocaleString("pt-PT")}€`;
const pct = (r: number | null) => (r === null ? "–" : `${Math.round(r * 100)}%`);
const maybeMoney = (n: number | null) => (n === null ? "–" : money(Math.round(n * 100) / 100));
const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;
const WEEKDAY = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const weekday = (day: string) => WEEKDAY[new Date(`${day}T12:00:00Z`).getUTCDay()];
const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

type PeriodId = "hoje" | "ontem" | "7" | "30" | "tudo";
const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "ontem", label: "Ontem" },
  { id: "7", label: "7 dias" },
  { id: "30", label: "30 dias" },
  { id: "tudo", label: "Desde o início" },
];

function periodRange(id: PeriodId, today: string): { from: string; to: string } {
  switch (id) {
    case "hoje": return { from: today, to: today };
    case "ontem": return { from: addDays(today, -1), to: addDays(today, -1) };
    case "7": return { from: addDays(today, -6), to: today };
    case "30": return { from: addDays(today, -29), to: today };
    case "tudo": return { from: ADS_START_DAY, to: today };
  }
}

function Kpi({ label, value, note, tone }: { label: string; value: string; note?: React.ReactNode; tone?: "gold" | "green" | "red" }) {
  const box = tone === "gold" ? "bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border-gold/25"
    : tone === "green" ? "bg-green-50 border-green-200"
    : tone === "red" ? "bg-red-50 border-red-200"
    : "bg-white border-gray-200";
  return (
    <div className={`border rounded-xl p-3 sm:p-4 ${box}`}>
      <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-navy tabular-nums">{value}</p>
      {note && <p className="text-[11px] text-gray-500 mt-0.5">{note}</p>}
    </div>
  );
}

const Th = ({ children, right }: { children?: React.ReactNode; right?: boolean }) => (
  <th className={`${right ? "text-right" : "text-left"} px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap`}>{children}</th>
);
const Td = ({ children, right, strong, muted }: { children?: React.ReactNode; right?: boolean; strong?: boolean; muted?: boolean }) => (
  <td className={`${right ? "text-right tabular-nums" : "text-left"} px-3 py-2 text-sm whitespace-nowrap ${strong ? "font-bold text-navy" : muted ? "text-gray-400" : "text-navy"}`}>{children}</td>
);

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-navy text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

const GoogleAdsPanel = () => {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [contacts, setContacts] = useState<(ContactRow & { updated_at: string })[]>([]);
  const [stats, setStats] = useState<AdsStatRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodId>("hoje");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const fetchServices = async (): Promise<ServiceRow[]> => {
      const { data, error: err } = await db.from("service_requests").select("*");
      if (err) throw err;
      return data ?? [];
    };
    try {
      let rows = await fetchServices();
      // O CRM só se atualiza com o calendário quando alguém o abre: corre-se
      // aqui também, senão os fechos de hoje faltavam.
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await syncCalendarIntoCrm(rows as any);
        if (result.status === "done" && result.changed) rows = await fetchServices();
        setSyncNote(result.status === "not-configured" ? "Google Calendar por ligar: os fechos podem estar incompletos." : null);
      } catch (e: unknown) {
        setSyncNote(`Não foi possível ler o calendário agora (${e instanceof Error ? e.message : String(e)}): os fechos podem estar incompletos.`);
      }
      const [c, s] = await Promise.all([
        db.from("clients").select("phone, from_google_ads, first_contact_at, status, updated_at"),
        db.from("ads_daily_stats").select("*").gte("stat_date", addDays(ADS_START_DAY, -3)),
      ]);
      if (c.error) throw c.error;
      if (s.error) throw s.error;
      setServices(rows);
      setContacts(c.data ?? []);
      setStats(s.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = lisbonDay(new Date());
  const { from, to } = periodRange(period, today);
  const r = useMemo(() => computeGoogleAdsResults(services, contacts, stats, from, to), [services, contacts, stats, from, to]);
  const whatsappReadAt = useMemo(
    () => contacts.reduce<string | null>((max, c) => (c.updated_at && (!max || c.updated_at > max) ? c.updated_at : max), null),
    [contacts],
  );

  const profit = r.google.share - r.cost;
  const multiple = safeDiv(r.google.share, r.cost);
  // Sem gasto carregado, "0€ por cliente" seria mentira: fica "–".
  const perClient = r.cost > 0 ? safeDiv(r.cost, r.google.services) : null;
  const perContact = r.cost > 0 ? safeDiv(r.cost, r.google.contacts) : null;
  const totalServices = r.google.services + r.other.services;
  const singleDay = from === to;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-navy">Google Ads</h2>
          <p className="text-sm text-gray-500">
            Clientes reais do anúncio, contados pelo WhatsApp e pelo calendário. Não depende das cookies.
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-medium text-navy px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-navy/30 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PERIODS.map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} aria-pressed={period === p.id}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${period === p.id ? "bg-navy text-white border-navy" : "bg-white text-navy border-gray-200 hover:border-navy/30"}`}>
            {p.label}
          </button>
        ))}
        <span className="self-center text-xs text-gray-400 ml-1">{singleDay ? dm(from) : `${dm(from)} a ${dm(to)}`}</span>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}
      {syncNote && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {syncNote}
        </div>
      )}
      {!loading && stats.length === 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          O script do Google Ads ainda não enviou gastos. Corre de hora a hora na conta ("Kyro | Exportar estatísticas").
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <Kpi label="Gasto no Google" value={money(r.cost)}
          note={`${r.clicks} cliques · ${maybeMoney(safeDiv(r.cost, r.clicks))}/clique`} />
        <Kpi label="Clientes fechados do Google" value={String(r.google.services)} tone="gold"
          note={totalServices ? `${pct(safeDiv(r.google.services, totalServices))} de todos os ${totalServices} fechos` : "sem fechos no período"} />
        <Kpi label="A tua parte (Google)" value={money0(r.google.share)} tone="gold"
          note={`faturado ${money0(r.google.billed)}`} />
        <Kpi label="Fica depois do anúncio" value={`${profit >= 0 ? "" : "−"}${money0(Math.abs(profit))}`}
          tone={r.cost === 0 && r.google.share === 0 ? undefined : profit >= 0 ? "green" : "red"}
          note={multiple === null ? "sem gasto no período" : `a tua parte é ${multiple.toFixed(1).replace(".", ",")}× o gasto`} />
        <Kpi label="Custo por cliente fechado" value={maybeMoney(perClient)} />
        <Kpi label="Contactos do Google" value={String(r.google.contacts)}
          note={perContact === null ? "conversas novas no WhatsApp" : `${maybeMoney(perContact)} por contacto`} />
        <Kpi label="Taxa de fecho (Google)" value={pct(safeDiv(r.google.contactsClosed, r.google.contacts))}
          note={`${r.google.contactsClosed} de ${r.google.contacts} contactos do período fecharam`} />
        <Kpi label="Fechos sem Google" value={String(r.other.services)}
          note={`parte ${money0(r.other.share)} · faturado ${money0(r.other.billed)}`} />
      </div>

      <Section title="Google vs. o resto" subtitle="Contactos pelo dia da primeira mensagem; fechos pelo dia em que foram marcados.">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr><Th /><Th right>Contactos</Th><Th right>Fecharam</Th><Th right>Taxa</Th><Th right>Fechos</Th><Th right>Faturado</Th><Th right>Tua parte</Th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {([["Google", r.google], ["Sem Google", r.other]] as const).map(([label, s]) => (
                <tr key={label}>
                  <Td strong>{label}</Td>
                  <Td right>{s.contacts}</Td>
                  <Td right>{s.contactsClosed}</Td>
                  <Td right>{pct(safeDiv(s.contactsClosed, s.contacts))}</Td>
                  <Td right>{s.services}</Td>
                  <Td right>{money0(s.billed)}</Td>
                  <Td right strong>{money0(s.share)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={`Clientes do Google fechados (${r.googleServicesList.length})`}>
        {r.googleServicesList.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">Nenhum cliente do Google fechado neste período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><Th>Fechado</Th><Th>Cliente</Th><Th>Serviço</Th><Th>Dia do serviço</Th><Th right>Faturado</Th><Th right>Tua parte</Th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {r.googleServicesList.map(s => (
                  <tr key={s.id}>
                    <Td>{dm(closedDay(s))}</Td>
                    <Td>{s.client_name || s.phone || "–"}</Td>
                    <td className="px-3 py-2 text-sm text-navy max-w-[18rem] truncate" title={s.description}>{s.description}</td>
                    <Td muted>{dm(s.request_date)}</Td>
                    <Td right>{money(Number(s.billed_value) || 0)}</Td>
                    <Td right strong>{money(shareOf(s))}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {!singleDay && (
        <Section title="Dia a dia">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><Th>Dia</Th><Th right>Gasto</Th><Th right>Cliques</Th><Th right>Contactos</Th><Th right>Fechos Google</Th><Th right>Tua parte</Th><Th right>Fica</Th><Th right>Outros fechos</Th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {r.days.map(d => {
                  const left = d.googleShare - d.cost;
                  return (
                    <tr key={d.day}>
                      <Td>{weekday(d.day)} {dm(d.day)}</Td>
                      <Td right>{d.cost ? money(Math.round(d.cost * 100) / 100) : <span className="text-gray-300">0€</span>}</Td>
                      <Td right>{d.clicks}</Td>
                      <Td right>{d.googleContacts}</Td>
                      <Td right strong>{d.googleServices}</Td>
                      <Td right>{money0(d.googleShare)}</Td>
                      <td className={`px-3 py-2 text-sm text-right tabular-nums whitespace-nowrap font-semibold ${left >= 0 ? "text-green-700" : "text-red-600"}`}>
                        {left >= 0 ? "" : "−"}{money0(Math.abs(left))}
                      </td>
                      <Td right muted>{d.otherServices}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Section title="Campanhas" subtitle="Números do Google Ads. As &quot;conversões&quot; do Google são cliques no WhatsApp e formulários, não clientes.">
        {r.campaigns.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">Sem gasto neste período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><Th>Campanha</Th><Th right>Gasto</Th><Th right>Cliques</Th><Th right>Custo/clique</Th><Th right>CTR</Th><Th right>Conv. Google</Th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {r.campaigns.map(c => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 text-sm text-navy max-w-[16rem] truncate" title={c.name}>{c.name.replace(/^Kyro \| /, "")}</td>
                    <Td right strong>{money(Math.round(c.cost * 100) / 100)}</Td>
                    <Td right>{c.clicks}</Td>
                    <Td right>{maybeMoney(safeDiv(c.cost, c.clicks))}</Td>
                    <Td right>{pct(safeDiv(c.clicks, c.impressions))}</Td>
                    <Td right muted>{Math.round(c.conversions * 10) / 10}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900 leading-relaxed">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <b>Quem conta como Google:</b> a conversa no WhatsApp começou com "Vi o vosso anúncio no Google" ou tem a etiqueta Google,
            ou o serviço tem "(anúncio)" no título do calendário. Quem recusa as cookies conta na mesma.
          </p>
          <p>
            <b>Atualizado:</b> gastos {r.lastStatsUpdate ? `às ${timeLabel(r.lastStatsUpdate)}` : "nunca"} (script da conta, de hora a hora);
            fechos agora, a partir do calendário; contactos do WhatsApp lidos {whatsappReadAt ? `a ${timeLabel(whatsappReadAt)}` : "nunca"}.
            {r.contactsWithoutDate > 0 && ` ${r.contactsWithoutDate} contactos antigos sem data ficam fora das contas de contactos.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAdsPanel;
