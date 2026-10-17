import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, lisbonDay, monthBounds, shiftMonth, WEEKDAY_SHORT } from "@/lib/crmClosings";
import { mondayOf } from "@/lib/weeklyReview";
import {
  ADS_START, COHORT_CLOSE_DAYS, compareEras, ORIGIN_LABEL, ORIGINS, summarizeConversations, weeklyCloseRate, weeklyConversations,
  type ClosingRow, type ConversationOrigin, type ConversationRow, type SpendRow,
} from "@/lib/whatsappConversations";

// Aba "Conversas" do CRM (dono, 2026-10-16): conversas novas do WhatsApp por dia e
// por semana, por origem, contra o gasto do Google Ads e contra a altura orgânica
// (antes de 26/09). Dados: whatsapp_conversations, alimentada de hora a hora pelo
// servidor do bot (kyro-bot scripts/conversations-export.ts).

const COLORS: Record<ConversationOrigin, string> = { google: "#D4AF37", meta: "#6B7FD7", questionario: "#2E9D7A", organico: "#1B2A4A" };
const PERIODS = [
  { id: "week", label: "Semana", days: null },
  { id: "month", label: "Mês", days: null },
  { id: "30", label: "30 dias", days: 30 },
  { id: "90", label: "90 dias", days: 90 },
  { id: "120", label: "120 dias", days: 120 },
  { id: "365", label: "365 dias", days: 365 },
] as const;
type PeriodId = (typeof PERIODS)[number]["id"];
const CHART_WEEKS = 12;
/** Antes disto o histórico do servidor do bot é incompleto (só as conversas que o WhatsApp sincronizou). */
const ORGANIC_FROM = "2026-08-17";

const euro = (n: number | null) => (n === null ? "–" : `${n.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€`);
const one = (n: number) => n.toLocaleString("pt-PT", { maximumFractionDigits: 1 });
const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;
const pct = (n: number | null) => (n === null ? "–" : `${Math.round(n * 100)}%`);
/** Semanas de contacto mostradas na tabela de fecho: as do servidor com telefone fiável. */
const COHORT_FROM = "2026-09-14";

function Stacked({ items, onPick, selected }: { items: { label: string; byOrigin: Record<ConversationOrigin, number>; key: string; note?: string }[]; onPick?: (key: string) => void; selected?: string }) {
  const max = Math.max(1, ...items.map(i => ORIGINS.reduce((s, o) => s + i.byOrigin[o], 0)));
  return (
    <div className="flex items-end gap-1 h-40">
      {items.map(i => {
        const total = ORIGINS.reduce((s, o) => s + i.byOrigin[o], 0);
        return (
          <button key={i.key} type="button" onClick={() => onPick?.(i.key)} disabled={!onPick}
            title={`${i.label}: ${total} (${ORIGINS.map(o => `${ORIGIN_LABEL[o]} ${i.byOrigin[o]}`).join(", ")})${i.note ? ` · ${i.note}` : ""}`}
            className={`flex-1 min-w-0 flex flex-col items-center justify-end h-full ${selected === i.key ? "opacity-100" : selected ? "opacity-60" : ""}`}>
            <span className="text-[10px] font-semibold text-navy">{total || ""}</span>
            <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${(total / max) * 100}%` }}>
              {ORIGINS.map(o => i.byOrigin[o] ? <div key={o} style={{ height: `${(i.byOrigin[o] / total) * 100}%`, background: COLORS[o] }} /> : null)}
            </div>
            <span className="text-[9.5px] text-gray-500 mt-1 truncate w-full text-center">{i.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-gray-600">
      {ORIGINS.map(o => <span key={o} className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[o] }} />{ORIGIN_LABEL[o]}</span>)}
    </div>
  );
}

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return <div className="h-8" />;
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${max === min ? 14 : 26 - ((v - min) / (max - min)) * 22}`).join(" ");
  return <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-8" aria-hidden="true"><polyline points={pts} fill="none" stroke="#D4AF37" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>;
}

const CrmConversations = () => {
  const today = lisbonDay(new Date());
  const [rows, setRows] = useState<ConversationRow[] | null>(null);
  const [spend, setSpend] = useState<SpendRow[]>([]);
  const [closings, setClosings] = useState<ClosingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodId>("week");
  const [week, setWeek] = useState(mondayOf(today));
  const [month, setMonth] = useState(today.slice(0, 7));

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    Promise.all([
      sb.from("whatsapp_conversations").select("first_at, origin, is_lid, contact_key").order("first_at").limit(20000),
      sb.from("ads_daily_stats").select("stat_date, cost"),
      sb.from("service_requests").select("phone, booked_at, billed_value").not("booked_at", "is", null).limit(20000),
    ]).then(([c, a, s]) => {
      if (c.error) setError(c.error.message); else setRows(c.data ?? []);
      if (!a.error) setSpend((a.data ?? []).map((x: SpendRow) => ({ stat_date: x.stat_date, cost: Number(x.cost) })));
      if (!s.error) setClosings(s.data ?? []);
    });
  }, []);

  const { from, to } = useMemo(() => {
    if (period === "week") return { from: week, to: addDays(week, 6) < today ? addDays(week, 6) : today };
    if (period === "month") { const b = monthBounds(month); return { from: b.first, to: b.last < today ? b.last : today }; }
    const days = PERIODS.find(p => p.id === period)!.days!;
    return { from: addDays(today, -(days - 1)), to: today };
  }, [period, week, month, today]);
  const length = Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000) + 1;

  const data = useMemo(() => {
    if (!rows) return null;
    const cur = summarizeConversations(rows, spend, from, to);
    const prev = summarizeConversations(rows, spend, addDays(from, -length), addDays(from, -1));
    const weeks = weeklyConversations(rows, spend, period === "week" ? week : to, CHART_WEEKS);
    const allWeeks = weeklyConversations(rows, spend, today, Math.ceil((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${ORGANIC_FROM}T12:00:00Z`)) / 604_800_000) + 1);
    const eras = compareEras(rows, spend, ORGANIC_FROM, today);
    const cohortCount = Math.floor((Date.parse(`${mondayOf(today)}T12:00:00Z`) - Date.parse(`${COHORT_FROM}T12:00:00Z`)) / 604_800_000) + 1;
    const cohorts = weeklyCloseRate(rows, closings, today, cohortCount);
    // Taxa de fecho dos contactos que entraram nas semanas do período escolhido.
    const inPeriod = (a: string, b: string) => cohorts.filter(c => c.week >= mondayOf(a) && c.week <= b);
    const rateOf = (list: typeof cohorts) => {
      const contacts = list.reduce((s, c) => s + c.contacts, 0);
      return { contacts, closed: list.reduce((s, c) => s + c.closed, 0), rate: contacts ? list.reduce((s, c) => s + c.closed, 0) / contacts : null, open: list.some(c => c.open) };
    };
    const curRate = rateOf(inPeriod(from, to));
    const prevRate = rateOf(inPeriod(addDays(from, -length), addDays(from, -1)));
    return { cur, prev, weeks, allWeeks, eras, cohorts, curRate, prevRate };
  }, [rows, spend, closings, from, to, length, period, week, today]);

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">Conversas: {error}</div>;
  if (!data) return <p className="text-sm text-gray-500">A carregar conversas…</p>;
  const { cur, prev, weeks, allWeeks, eras, cohorts, curRate, prevRate } = data;
  const cohortByWeek = new Map(cohorts.map(c => [c.week, c]));
  const delta = (a: number, b: number) => { const d = a - b; return d === 0 ? "igual ao período anterior" : `${d > 0 ? "+" : ""}${d} vs período anterior`; };
  const cards = [
    { label: "Conversas novas", value: String(cur.total), sub: delta(cur.total, prev.total), spark: weeks.map(w => w.total) },
    { label: "Taxa de fecho", value: pct(curRate.rate), sub: `${curRate.closed} de ${curRate.contacts} fecharam${curRate.open ? " (ainda a subir)" : ""} · antes ${pct(prevRate.rate)}`, spark: weeks.map(w => cohortByWeek.get(w.week)?.rate ?? 0) },
    { label: "Do anúncio Google", value: String(cur.byOrigin.google), sub: delta(cur.byOrigin.google, prev.byOrigin.google), spark: weeks.map(w => w.byOrigin.google) },
    { label: "Gasto Google", value: euro(Math.round(cur.googleCost)), sub: `${euro(prev.googleCost ? Math.round(prev.googleCost) : 0)} no período anterior`, spark: weeks.map(w => w.cost) },
    { label: "Custo por conversa Google", value: euro(cur.costPerGoogle === null ? null : Math.round(cur.costPerGoogle)), sub: `gasto ÷ conversas que dizem "Vi o vosso anúncio no Google"`, spark: weeks.map(w => (w.byOrigin.google ? w.cost / w.byOrigin.google : 0)) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map(p => (
          <button key={p.id} type="button" onClick={() => setPeriod(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${period === p.id ? "bg-navy text-white border-navy" : "border-gray-200 text-gray-600 hover:border-navy"}`}>{p.label}</button>
        ))}
        {(period === "week" || period === "month") && (
          <div className="flex items-center gap-1 ml-auto">
            <button type="button" aria-label="Anterior" className="p-1.5 rounded-lg border border-gray-200" onClick={() => period === "week" ? setWeek(addDays(week, -7)) : setMonth(shiftMonth(month, -1))}><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-semibold text-navy px-2">{dm(from)} a {dm(to)}</span>
            <button type="button" aria-label="Seguinte" className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
              disabled={period === "week" ? addDays(week, 7) > today : shiftMonth(month, 1) > today.slice(0, 7)}
              onClick={() => period === "week" ? setWeek(addDays(week, 7)) : setMonth(shiftMonth(month, 1))}><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map(c => (
          <div key={c.label} className="border border-gray-200 rounded-xl p-3">
            <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
            <p className="text-xl font-bold text-navy">{c.value}</p>
            <p className="text-[11px] text-gray-500">{c.sub}</p>
            <Spark values={c.spark} />
          </div>
        ))}
      </div>

      <section className="border border-gray-200 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-navy">Por semana: conversas novas e taxa de fecho</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] text-gray-500">
              <th className="py-1 pr-3">Semana</th><th className="pr-3">Conversas novas</th><th className="pr-3">Fecharam</th><th className="pr-3">Taxa de fecho</th>
              <th className="pr-3">Fecharam em 7 dias</th><th className="pr-3">Faturado</th><th className="pr-3">Do Google</th><th>Gasto Google</th>
            </tr></thead>
            <tbody>
              {[...cohorts].reverse().map(c => (
                <tr key={c.week} className={`border-t border-gray-100 ${c.week === (period === "week" ? week : "") ? "bg-amber-50" : ""}`}>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{dm(c.week)}{c.week === mondayOf(today) ? " (em curso)" : ""}</td>
                  <td className="pr-3 font-semibold">{c.contacts}</td>
                  <td className="pr-3">{c.closed}</td>
                  <td className="pr-3 font-semibold text-navy">{pct(c.rate)}{c.open ? <span className="text-[10px] font-normal text-gray-500"> a subir</span> : null}</td>
                  <td className="pr-3">{c.closedIn7} <span className="text-[11px] text-gray-500">({pct(c.rateIn7)})</span></td>
                  <td className="pr-3">{euro(Math.round(c.revenue))}</td>
                  <td className="pr-3">{c.google}</td>
                  <td>{euro(Math.round(spend.filter(s => s.stat_date >= c.week && s.stat_date <= addDays(c.week, 6)).reduce((s, x) => s + x.cost, 0)))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Cada pessoa conta na semana da primeira mensagem. Fechou se tem um serviço no CRM marcado a partir dessa mensagem e até {COHORT_CLOSE_DAYS} dias depois (pelos últimos 9 dígitos do telefone; revisitas a 0€ não contam), e o faturado é o desses serviços.
          Uma semana com contactos de há menos de 7 dias ainda está "a subir": compara-a com as outras pela coluna dos 7 dias quando fechar.
          Contactos que o WhatsApp mostra sem número (@lid) contam nas conversas mas não se ligam ao CRM, por isso a taxa sai um pouco por baixo. Começa a 14/09: antes disso o servidor não tem os telefones.
        </p>
      </section>

      <section className="border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-navy">Por origem, neste período</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ORIGINS.map(o => (
            <div key={o} className="rounded-lg bg-gray-50 p-2">
              <p className="text-[11px] text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: COLORS[o] }} />{ORIGIN_LABEL[o]}</p>
              <p className="text-lg font-bold text-navy">{cur.byOrigin[o]} <span className="text-[11px] font-normal text-gray-500">{cur.total ? Math.round((cur.byOrigin[o] / cur.total) * 100) : 0}%</span></p>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-navy">Orgânico vs com anúncios (média por semana)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] text-gray-500"><th className="py-1 pr-3">Altura</th><th className="pr-3">Semanas</th><th className="pr-3">Conversas/semana</th>{ORIGINS.map(o => <th key={o} className="pr-3">{ORIGIN_LABEL[o]}</th>)}<th>Gasto Google/semana</th></tr></thead>
            <tbody>
              {([["Orgânico", `${dm(ORGANIC_FROM)} a ${dm(addDays(mondayOf(ADS_START), -1))}`, eras.organic], ["Com anúncios", `desde ${dm(addDays(mondayOf(ADS_START), 7))}`, eras.ads]] as const).map(([name, range, e]) => (
                <tr key={name} className="border-t border-gray-100">
                  <td className="py-1.5 pr-3 font-semibold text-navy">{name} <span className="text-[11px] font-normal text-gray-500">{range}</span></td>
                  <td className="pr-3">{one(e.weeks)}</td>
                  <td className="pr-3 font-semibold">{one(e.perWeek)}</td>
                  {ORIGINS.map(o => <td key={o} className="pr-3">{one(e.perWeekByOrigin[o])}</td>)}
                  <td>{euro(Math.round(e.costPerWeek))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-500">A semana de 21/09 (os anúncios começaram a 26/09) fica de fora das duas médias.</p>
      </section>

      <section className="border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-navy">Conversas novas por semana</h3><Legend /></div>
        <Stacked items={weeks.map(w => ({ key: w.week, label: dm(w.week), byOrigin: w.byOrigin, note: `gasto Google ${euro(Math.round(w.cost))}` }))}
          selected={period === "week" ? week : undefined} onPick={k => { setPeriod("week"); setWeek(k); }} />
        <p className="text-[11px] text-gray-500">Carrega numa coluna para abrir essa semana.</p>
      </section>

      <section className="border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-navy">Dia a dia</h3>
        <Stacked items={cur.days.map(d => ({ key: d.day, label: length <= 31 ? dm(d.day) : "", byOrigin: d.byOrigin }))} />
      </section>

      <section className="border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-navy">Por dia da semana (média por semana no período)</h3>
        <div className="grid grid-cols-7 gap-2 text-center">
          {cur.weekdays.map(w => (
            <div key={w.weekday} className="rounded-lg bg-gray-50 p-2">
              <p className="text-[11px] text-gray-500">{WEEKDAY_SHORT[w.weekday]}</p>
              <p className="text-base font-bold text-navy">{one(w.perWeek)}</p>
              <p className="text-[10px] text-gray-400">{w.total} no total</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-gray-200 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-navy">Todas as semanas: conversas novas vs gasto Google</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] text-gray-500"><th className="py-1 pr-3">Semana</th><th className="pr-3">Total</th>{ORIGINS.map(o => <th key={o} className="pr-3">{ORIGIN_LABEL[o]}</th>)}<th className="pr-3">Gasto Google</th><th>€/conversa Google</th></tr></thead>
            <tbody>
              {[...allWeeks].reverse().map(w => (
                <tr key={w.week} className={`border-t border-gray-100 ${w.withAds ? "" : "text-gray-600"}`}>
                  <td className="py-1 pr-3">{dm(w.week)}{w.week === mondayOf(today) ? " (em curso)" : ""}</td>
                  <td className="pr-3 font-semibold">{w.total}</td>
                  {ORIGINS.map(o => <td key={o} className="pr-3">{w.byOrigin[o]}</td>)}
                  <td className="pr-3">{w.cost ? euro(Math.round(w.cost)) : "–"}</td>
                  <td>{w.byOrigin.google ? euro(Math.round(w.cost / w.byOrigin.google)) : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-[11px] text-gray-500 leading-relaxed">
        Conversa nova = primeiro contacto de um número que nos escreveu (ou a quem o bot escreveu a seguir a um pedido do questionário). Fora: grupos, equipas, parceiros, o próprio número e conversas que começámos nós (campanhas, seguimentos) sem resposta.
        A origem lê-se das primeiras mensagens: "Vi o vosso anúncio no Google/Facebook/Instagram" ou "Acabei de enviar o pedido #". Quem vem do anúncio e escreve a sua própria mensagem conta como orgânico, por isso o Google é um mínimo.
        Antes de meados de setembro o servidor do bot só tem as conversas que o WhatsApp sincronizou, e mensagens enviadas do telemóvel às vezes não chegam: os números antigos são por baixo. Atualiza de hora a hora.
      </p>
    </div>
  );
};

export default CrmConversations;
