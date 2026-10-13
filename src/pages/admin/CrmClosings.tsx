import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Target, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, closingsOnDay, lisbonDay, monthBounds, shiftMonth, summarizeClosings, WEEKDAY_LONG, WEEKDAY_SHORT, type ClosingRow } from "@/lib/crmClosings";
import { closedDay, type ServiceRow } from "@/lib/googleAdsResults";
import { computeWeeklyReview, mondayOf, RANKING_MIN_CONTACTS, type RankingClient, type ServiceRankRow, type WeekRow } from "@/lib/weeklyReview";
import { closeRateRankRows, computeServiceCloseRates, missingFor, QUIZ_CLOSE_RATE_GOAL, type CloseRateCount } from "@/lib/crmServiceCloseRate";
import type { QuizSummary } from "@/lib/crmQuizLeads";
import { atStake, CLOSE_RATE_GOAL, computeWeekInsights, missingForGoal } from "@/lib/weeklyInsights";

// Aba "Fechos" do CRM. Desde 2026-10-13 junta a antiga aba "Métricas" (dono:
// "as métricas deviam estar integradas na página de fechos", "algo visual e
// com sentido que dê para aprender todas as segundas-feiras"):
//  - a semana escolhe-se como o mês (setas), e é o período por omissão;
//  - na semana, a revisão de segunda-feira: os 4 números com a tendência de
//    12 semanas, e o que está a correr bem e o que melhorar (weeklyInsights.ts);
//  - fechos por semana, taxa de fecho (fechos ÷ orçamentos de qualquer canal,
//    crmServiceCloseRate.ts) com as metas do dono, 50% no questionário e 70%
//    em cada serviço, e o dinheiro em jogo, e os fechos por dia da semana e
//    dia a dia.
// O dourado não chega a 3:1 sobre branco: cada coluna leva o valor escrito.

const GOLD = "#D4AF37";
const GOLD_HOVER = "#E3C45F";
const GOLD_FADED = "#EADFB4";

// "Mês" = o que foi fechado nesse mês de calendário, incluindo serviços marcados
// para meses seguintes (pedido do dono, 27/09/2026).
const PERIODS = [
  { id: "week", label: "Semana", days: null },
  { id: "month", label: "Mês", days: null },
  { id: "30", label: "30 dias", days: 30 },
  { id: "90", label: "90 dias", days: 90 },
  { id: "120", label: "120 dias", days: 120 },
  { id: "365", label: "365 dias", days: 365 },
] as const;
type PeriodId = (typeof PERIODS)[number]["id"];

/** Semanas no gráfico e nas tendências dos cartões. */
const CHART_WEEKS = 12;
/** Até onde se pode recuar: dois anos de semanas. */
const HISTORY_WEEKS = 104;

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€`;
const euro = (n: number | null) => (n === null ? "–" : `${Math.round(n).toLocaleString("pt-PT")}€`);
const pct = (r: number) => `${Math.round(r * 100)}%`;
const decimal = (n: number) => n.toLocaleString("pt-PT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;
const MONTH_FMT = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" });
const monthName = (month: string) => MONTH_FMT.format(new Date(`${month}-15T12:00:00Z`));
const DAY_FMT = new Intl.DateTimeFormat("pt-PT", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const dayLabel = (day: string) => DAY_FMT.format(new Date(`${day}T12:00:00Z`));
const DAY_LONG_FMT = new Intl.DateTimeFormat("pt-PT", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const TIME_FMT = new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Lisbon" });
const noon = (day: string) => new Date(`${day}T12:00:00Z`);
const daysBetween = (from: string, to: string) => Math.round((noon(to).getTime() - noon(from).getTime()) / 86_400_000);

interface Hover { chart: "weekday" | "day" | "week"; index: number }

function Delta({ cur, prev, unit = "", lowerIsBetter = false }: { cur: number | null; prev: number | null; unit?: string; lowerIsBetter?: boolean }) {
  if (cur === null || prev === null) return <span className="text-[11px] text-gray-400">sem comparação</span>;
  const d = Math.round(cur - prev);
  if (d === 0) return <span className="text-[11px] text-gray-400">igual à anterior</span>;
  const good = lowerIsBetter ? d < 0 : d > 0;
  return <span className={`text-[11px] font-semibold ${good ? "text-emerald-600" : "text-red-600"}`}>{d > 0 ? "+" : ""}{d.toLocaleString("pt-PT")}{unit} vs semana anterior</span>;
}

/** Tendência das últimas semanas; o último ponto é a semana escolhida. */
function Sparkline({ values }: { values: (number | null)[] }) {
  const pts = values.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v !== null);
  if (pts.length < 2) return <div className="h-8" />;
  const max = Math.max(...pts.map(p => p.v));
  const min = Math.min(...pts.map(p => p.v));
  const x = (i: number) => (i / (values.length - 1)) * 100;
  const y = (v: number) => (max === min ? 14 : 26 - ((v - min) / (max - min)) * 22);
  const last = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-8" aria-hidden="true">
      <polyline points={pts.map(p => `${x(p.i)},${y(p.v)}`).join(" ")} fill="none" stroke={GOLD} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      {last.i === values.length - 1 && <circle cx={x(last.i)} cy={y(last.v)} r="2.5" fill={GOLD} vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

/** Taxa de fecho de um canal, com a meta (quando há) e a variação contra o período anterior. */
function RateCard({ label, now, before, goal }: { label: string; now: CloseRateCount; before: CloseRateCount; goal?: number }) {
  const rate = now.quotes ? now.closed / now.quotes : null;
  const prev = before.quotes ? before.closed / before.quotes : null;
  const change = rate !== null && prev !== null ? Math.round((rate - prev) * 100) : null;
  const missing = goal !== undefined ? missingFor(now, goal) : 0;
  const hit = goal !== undefined && rate !== null && rate >= goal;
  return (
    <div className="border border-gray-200 rounded-xl p-3">
      <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}{goal !== undefined && ` · meta ${pct(goal)}`}</p>
      <p className={`text-xl font-bold ${hit ? "text-emerald-600" : "text-navy"}`}>{rate === null ? "–" : pct(rate)}</p>
      <p className="text-[11px] text-gray-500">{now.closed} fecho{now.closed === 1 ? "" : "s"} de {now.quotes} orçamento{now.quotes === 1 ? "" : "s"}</p>
      {goal !== undefined && rate !== null && (
        <>
          <div className="relative h-1.5 mt-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, rate * 100)}%`, background: GOLD }} />
            <div className="absolute inset-y-0 w-px bg-navy/60" style={{ left: `${goal * 100}%` }} />
          </div>
          <p className="text-[11px] mt-1 text-gray-600">{hit ? "Meta atingida" : `Faltam ${missing} fecho${missing === 1 ? "" : "s"} para a meta`}</p>
        </>
      )}
      {change !== null && (
        <p className={`text-[11px] font-semibold ${change === 0 ? "text-gray-400" : change > 0 ? "text-emerald-600" : "text-red-600"}`}>
          {change === 0 ? "igual ao período anterior" : `${change > 0 ? "+" : ""}${change} pp vs período anterior`}
        </p>
      )}
    </div>
  );
}

const CrmClosings = ({ records, services, quiz = null }: { records: ClosingRow[]; services: ServiceRow[]; quiz?: QuizSummary | null }) => {
  const now = useMemo(() => new Date(), []);
  const today = lisbonDay(now);
  const thisMonday = mondayOf(today);
  const currentMonth = today.slice(0, 7);
  const [period, setPeriod] = useState<PeriodId>("week");
  // Por omissão a semana em curso (dono, 13/10); a revisão de segunda-feira está a uma seta.
  const [week, setWeek] = useState(thisMonday);
  const [month, setMonth] = useState(currentMonth);
  const [hover, setHover] = useState<Hover | null>(null);
  // Dia aberto no "Dia a dia" (dono, 13/10: "quando clico na terça, vejo o que se fechou").
  const [openDay, setOpenDay] = useState<string | null>(null);

  const [clients, setClients] = useState<(RankingClient & { from_google_ads: boolean })[] | null>(null);
  const [adsStats, setAdsStats] = useState<{ stat_date: string; cost: number }[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Os tipos gerados do Supabase não conhecem estas tabelas: mesmo padrão das outras abas.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    Promise.all([
      sb.from("clients").select("phone, status, services, first_contact_at, from_google_ads"),
      sb.from("ads_daily_stats").select("stat_date, cost"),
    ]).then(([c, a]) => {
      if (c.error) setLoadError(`Fichas de clientes: ${c.error.message}`);
      else setClients(c.data ?? []);
      if (!a.error) setAdsStats(a.data ?? []);
    });
  }, []);

  // Período escolhido: de `from` a `to` (nunca depois de hoje).
  const { from, to, aheadAfter } = useMemo(() => {
    if (period === "week") return { from: week, to: addDays(week, 6) < today ? addDays(week, 6) : today, aheadAfter: undefined };
    if (period === "month") {
      // O mês corrente conta só até hoje, para a média por dia não contar dias que ainda não passaram.
      const { first, last } = monthBounds(month);
      return { from: first, to: last < today ? last : today, aheadAfter: last };
    }
    const n = PERIODS.find(p => p.id === period)!.days!;
    return { from: addDays(today, -(n - 1)), to: today, aheadAfter: undefined };
  }, [period, week, month, today]);

  const summary = useMemo(() => summarizeClosings(records, from, to, aheadAfter ?? to), [records, from, to, aheadAfter]);
  const shownDay = openDay && openDay >= from && openDay <= to ? openDay : null;
  const dayRows = useMemo(() => (shownDay ? closingsOnDay(records, shownDay) : []), [records, shownDay]);

  // Todas as semanas até à em curso (inclusive), da mais antiga para a mais recente.
  const allWeeks: WeekRow[] = useMemo(
    () => computeWeeklyReview({ services, clients: clients ?? [], adsStats }, noon(addDays(thisMonday, 7)), HISTORY_WEEKS),
    [services, clients, adsStats, thisMonday],
  );
  const firstWeekWithData = allWeeks.find(w => w.closes > 0 || w.spend > 0)?.week ?? thisMonday;
  const endWeek = period === "week" ? week : mondayOf(to);
  const endIndex = allWeeks.findIndex(w => w.week === endWeek);
  const chartWeeks = endIndex < 0 ? [] : allWeeks.slice(Math.max(0, endIndex - CHART_WEEKS + 1), endIndex + 1);
  const selectedWeek = period === "week" ? chartWeeks[chartWeeks.length - 1] : undefined;
  const previousWeek = period === "week" ? chartWeeks[chartWeeks.length - 2] ?? null : null;

  // Taxa de fecho: fechos ÷ orçamentos de qualquer canal (questionário + WhatsApp), pelo dia do
  // primeiro pedido de cada pessoa, e o período anterior do mesmo tamanho. Só vê o estado de hoje:
  // fecha o que até hoje fechou, e só com serviços fechados até ao fim do período.
  const ratesFor = (start: string, end: string) => {
    const upTo = services.filter(s => closedDay(s) <= end);
    const rates = computeServiceCloseRates({ from: start, to: end }, quiz, clients, upTo);
    // Ticket de cada serviço: linhas do CRM fechadas em pelo menos 90 dias até ao fim do período.
    const ticketFrom = addDays(end, -Math.max(89, daysBetween(start, end)));
    const live = upTo.filter(s => !s.calendar_missing_since);
    const rows = closeRateRankRows(rates, live.filter(s => closedDay(s) >= ticketFrom), live);
    const big = (r: ServiceRankRow) => r.contacts >= RANKING_MIN_CONTACTS;
    return { rates, rows: rows.sort((a, b) => Number(big(b)) - Number(big(a)) || b.rate - a.rate || b.contacts - a.contacts) };
  };
  const span = daysBetween(from, to);
  const ready = !!clients || !!quiz;
  const current = useMemo(() => ratesFor(from, to), [clients, quiz, services, from, to]); // eslint-disable-line react-hooks/exhaustive-deps
  const previous = useMemo(() => ratesFor(addDays(from, -span - 1), addDays(from, -1)), [clients, quiz, services, from, span]); // eslint-disable-line react-hooks/exhaustive-deps
  const ranking = ready ? current.rows : [];
  const previousRanking = previous.rows;
  // A leitura da semana olha para 90 dias: uma semana só tem poucos orçamentos por serviço.
  const last90 = useMemo(() => (period === "week" && ready ? ratesFor(addDays(to, -89), to) : null), [clients, quiz, services, to, period]); // eslint-disable-line react-hooks/exhaustive-deps
  const insights = useMemo(
    () => (period === "week" && endIndex >= 0 ? computeWeekInsights(allWeeks.slice(0, endIndex + 1), last90?.rows ?? [], last90?.rates.quiz) : null),
    [period, allWeeks, endIndex, last90],
  );

  const ranked = ranking.filter(r => r.contacts >= RANKING_MIN_CONTACTS);
  const previousRate = new Map(previousRanking.map(r => [r.service, r]));

  const days = summary.perDay.length;
  const maxAverage = Math.max(...summary.byWeekday.map(w => w.average));
  const best = maxAverage > 0 ? summary.byWeekday.filter(w => w.average === maxAverage) : [];
  const maxDay = Math.max(1, ...summary.perDay.map(d => d.count));
  const labelEvery = days <= 7 ? 1 : days <= 45 ? 7 : 14;
  const maxWeekCloses = Math.max(1, ...chartWeeks.map(w => w.closes));

  const weekdayHover = hover?.chart === "weekday" ? summary.byWeekday[hover.index] : null;
  const dayHover = hover?.chart === "day" ? summary.perDay[hover.index] : null;
  const weekHover = hover?.chart === "week" ? chartWeeks[hover.index] : null;

  const pickWeek = (w: string) => { setPeriod("week"); setWeek(w); };
  const trend = (f: (w: WeekRow) => number | null) => chartWeeks.map(f);
  const periodLabel = period === "week" ? `semana de ${dm(from)} a ${dm(addDays(from, 6))}` : period === "month" ? monthName(month) : `${dm(from)} a ${dm(to)}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          Dia em que cada serviço foi fechado (criado no calendário ou metido no CRM), não o dia do serviço.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {period === "week" && (
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-white">
              <button onClick={() => setWeek(w => addDays(w, -7))} disabled={week <= firstWeekWithData} aria-label="Semana anterior"
                className="p-1.5 text-navy hover:bg-gray-50 rounded-l-lg disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-1 text-xs font-semibold text-navy min-w-[120px] text-center">{dm(week)} a {dm(addDays(week, 6))}</span>
              <button onClick={() => setWeek(w => addDays(w, 7))} disabled={week >= thisMonday} aria-label="Semana seguinte"
                className="p-1.5 text-navy hover:bg-gray-50 rounded-r-lg disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {period === "month" && (
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-white">
              <button onClick={() => setMonth(m => shiftMonth(m, -1))} aria-label="Mês anterior" className="p-1.5 text-navy hover:bg-gray-50 rounded-l-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-1 text-xs font-semibold text-navy capitalize min-w-[120px] text-center">{monthName(month)}</span>
              <button onClick={() => setMonth(m => shiftMonth(m, 1))} disabled={month >= currentMonth} aria-label="Mês seguinte"
                className="p-1.5 text-navy hover:bg-gray-50 rounded-r-lg disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-white overflow-x-auto" role="group" aria-label="Período">
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)} aria-pressed={period === p.id}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${period === p.id ? "bg-navy text-white" : "text-navy hover:bg-gray-50"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loadError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{loadError}</p>}

      {/* Semana: os 4 números da revisão, cada um com a tendência das últimas semanas */}
      {selectedWeek ? (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-navy">
            {week === thisMonday ? "Semana em curso" : week === addDays(thisMonday, -7) ? "Última semana completa" : "Semana"} · {dm(week)} a {dm(addDays(week, 6))}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Fechos", value: String(selectedWeek.closes), sub: `${euro(selectedWeek.billed)} faturado`,
                delta: <Delta cur={selectedWeek.closes} prev={previousWeek?.closes ?? null} />, trend: trend(w => w.closes) },
              { label: "A tua parte", value: euro(selectedWeek.share), sub: "parte da empresa + upsell",
                delta: <Delta cur={selectedWeek.share} prev={previousWeek?.share ?? null} unit="€" />, trend: trend(w => w.share) },
              { label: "Ticket médio", value: euro(selectedWeek.ticket), sub: "faturado ÷ fechos",
                delta: <Delta cur={selectedWeek.ticket} prev={previousWeek?.ticket ?? null} unit="€" />, trend: trend(w => w.ticket) },
              { label: "Custo por cliente Google", value: selectedWeek.spend ? euro(selectedWeek.costPerGoogleClient) : "–",
                sub: selectedWeek.spend ? `${selectedWeek.googleCloses} clientes · ${euro(selectedWeek.spend)} gastos` : "sem gasto nesta semana",
                delta: <Delta cur={selectedWeek.costPerGoogleClient} prev={previousWeek?.costPerGoogleClient ?? null} unit="€" lowerIsBetter />,
                trend: trend(w => w.costPerGoogleClient) },
            ].map((c, i) => (
              <div key={c.label} className={`rounded-xl p-4 border ${i === 0 ? "bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border-gold/25" : "bg-white border-gray-200"}`}>
                <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
                <p className="text-xl font-bold text-navy">{c.value}</p>
                <p className="text-[11px] text-gray-500">{c.sub}</p>
                <div className="mt-1">{c.delta}</div>
                <div className="mt-2"><Sparkline values={c.trend} /></div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500">A linha de cada cartão são as últimas {chartWeeks.length} semanas; o ponto é a semana escolhida. Avaliações novas: contar na ficha da Google (ainda não há registo com data).</p>
        </section>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border border-gold/25 rounded-xl p-4">
            <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Serviços fechados</p>
            <p className="text-xl font-bold text-navy">{summary.count}</p>
            <p className="text-[11px] text-gray-500">em {days} dia{days === 1 ? "" : "s"}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Média por dia</p>
            <p className="text-xl font-bold text-navy">{decimal(days ? summary.count / days : 0)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Melhor dia</p>
            <p className="text-xl font-bold text-navy capitalize">{best.length ? best.map(w => WEEKDAY_LONG[w.weekday]).join(", ") : "-"}</p>
            {best.length > 0 && <p className="text-[11px] text-gray-500">{decimal(maxAverage)} fechos por {WEEKDAY_LONG[best[0].weekday]}</p>}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ticket médio</p>
            <p className="text-xl font-bold text-navy">{money(summary.count ? summary.billed / summary.count : 0)}</p>
            <p className="text-[11px] text-gray-500">{money(summary.count ? summary.cut / summary.count : 0)} para ti</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Faturado / a tua parte</p>
            <p className="text-xl font-bold text-navy">{money(summary.billed)}</p>
            <p className="text-[11px] text-gray-500">{money(summary.cut)} para ti</p>
            {period === "month" && summary.ahead.count > 0 && (
              <p className="text-[11px] text-gray-500">
                inclui {summary.ahead.count} para depois de {monthName(month).split(" ")[0]} ({money(summary.ahead.billed)})
              </p>
            )}
          </div>
        </div>
      )}

      {/* Revisão de segunda-feira: o que manter e o que trabalhar esta semana */}
      {insights && (
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-navy/[0.03]">
            <p className="text-sm font-bold text-navy">Revisão de segunda-feira</p>
            <p className="text-[11px] text-gray-500">
              Escolhe um ponto a melhorar e trabalha só esse durante a semana. Na segunda seguinte, vê aqui se mexeu.
            </p>
          </div>
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-4 space-y-3">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">Está a correr bem · manter</p>
              {insights.good.length === 0 && <p className="text-sm text-gray-400">Nada acima do normal nesta semana.</p>}
              {insights.good.map(g => (
                <div key={g.title} className="flex gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-navy">{g.title}</p>
                    <p className="text-xs text-gray-600">{g.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700">Para melhorar · trabalhar esta semana</p>
              {insights.improve.length === 0 && <p className="text-sm text-gray-400">Nada abaixo do normal nesta semana.</p>}
              {insights.improve.map(m => (
                <div key={m.title} className="flex gap-2.5">
                  <Target className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-navy">{m.title}</p>
                    <p className="text-xs text-gray-600">{m.detail}</p>
                    {m.action && (
                      <p className="text-xs text-navy mt-1 flex gap-1"><ArrowRight className="w-3.5 h-3.5 shrink-0 mt-px text-[#D4AF37]" />{m.action}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="px-4 py-2 text-[11px] text-gray-500 border-t border-gray-100">
            {insights.baselineWeeks
              ? `Comparado com a média das ${insights.baselineWeeks} semanas anteriores com fechos (conta como diferente a partir de 10%).`
              : "Ainda não há semanas anteriores para comparar."}{" "}
            Os serviços olham para os 90 dias até {dm(to)}, porque numa semana só há poucos contactos de cada.
          </p>
        </section>
      )}

      {/* Fechos por semana: carregar numa coluna abre essa semana */}
      {chartWeeks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-bold text-navy">Fechos por semana</p>
          <p className="text-[11px] text-gray-500 mb-4">As últimas {chartWeeks.length} semanas até {dm(endWeek)}. Carrega numa coluna para ver essa semana.</p>
          <div className="relative">
            <div className="flex items-end gap-1.5 h-36 border-b border-gray-200">
              {chartWeeks.map((w, i) => {
                const active = hover?.chart === "week" && hover.index === i;
                const chosen = period === "week" && w.week === week;
                return (
                  <button key={w.week} type="button" onClick={() => pickWeek(w.week)}
                    onPointerEnter={() => setHover({ chart: "week", index: i })} onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover({ chart: "week", index: i })} onBlur={() => setHover(null)}
                    aria-label={`Semana de ${dm(w.week)}: ${w.closes} fechos`}
                    className="flex-1 min-w-0 h-full flex flex-col justify-end items-center focus:outline-none">
                    <span className={`text-[10px] mb-1 ${chosen ? "font-bold text-navy" : "text-gray-500"}`}>{w.closes}</span>
                    <span className="w-full max-w-[28px] rounded-t transition-colors"
                      style={{ height: `calc((100% - 18px) * ${w.closes / maxWeekCloses})`, minHeight: w.closes ? 2 : 0,
                        background: active ? GOLD_HOVER : chosen || period !== "week" ? GOLD : GOLD_FADED }} />
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {chartWeeks.map((w, i) => (
                <span key={w.week} className={`flex-1 min-w-0 text-center text-[10px] ${period === "week" && w.week === week ? "font-bold text-navy" : "text-gray-400"} ${i % 2 && chartWeeks.length > 8 ? "hidden sm:block" : ""}`}>
                  {dm(w.week)}
                </span>
              ))}
            </div>
            {weekHover && (
              <div className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-white px-3 py-2 text-xs shadow-lg border border-gray-200 whitespace-nowrap"
                style={{ left: `${Math.min(85, Math.max(15, ((hover!.index + 0.5) / chartWeeks.length) * 100))}%` }}>
                <p className="font-bold text-navy">{weekHover.closes} fecho{weekHover.closes === 1 ? "" : "s"} · {dm(weekHover.week)} a {dm(addDays(weekHover.week, 6))}</p>
                <p className="text-gray-500">{euro(weekHover.billed)} faturado · {euro(weekHover.share)} para ti</p>
                <p className="text-gray-500">Ticket {euro(weekHover.ticket)}{weekHover.spend ? ` · Google ${euro(weekHover.costPerGoogleClient)}/cliente` : ""}</p>
              </div>
            )}
          </div>
          <details className="mt-3">
            <summary className="text-xs font-semibold text-navy cursor-pointer">Ver a tabela das semanas</summary>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {["Semana", "Fechos", "Faturado", "Teu", "Ticket", "Gasto Google", "Clientes Google", "Custo/cliente"].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...chartWeeks].reverse().map(w => (
                    <tr key={w.week} onClick={() => pickWeek(w.week)}
                      className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 ${period === "week" && w.week === week ? "font-bold" : ""}`}>
                      <td className="px-3 py-2 whitespace-nowrap text-navy">{dm(w.week)}</td>
                      <td className="px-3 py-2">{w.closes}</td>
                      <td className="px-3 py-2">{euro(w.billed)}</td>
                      <td className="px-3 py-2">{euro(w.share)}</td>
                      <td className="px-3 py-2">{euro(w.ticket)}</td>
                      <td className="px-3 py-2">{w.spend ? euro(w.spend) : "–"}</td>
                      <td className="px-3 py-2">{w.spend || w.googleCloses ? w.googleCloses : "–"}</td>
                      <td className="px-3 py-2">{euro(w.costPerGoogleClient)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              Antes de 26/09 conta o dia em que a linha entrou no CRM, por isso essas semanas são aproximadas.
              Cliente Google = "(anúncio)" no calendário ou contacto que veio do anúncio.
            </p>
          </details>
        </div>
      )}

      {/* Taxa de fecho por serviço, com a meta e o dinheiro que fica por fechar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-bold text-navy">Taxa de fecho · meta {pct(QUIZ_CLOSE_RATE_GOAL)} no questionário, {pct(CLOSE_RATE_GOAL)} em cada serviço</p>
        <p className="text-[11px] text-gray-500 mb-3">Fechos ÷ orçamentos recebidos em qualquer canal, de quem pediu preço pela primeira vez na {periodLabel}, comparados com o período anterior do mesmo tamanho.</p>
        {!ready && !loadError && <p className="text-sm text-gray-400">A carregar os orçamentos…</p>}
        {ready && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <RateCard label="Total" now={current.rates.total} before={previous.rates.total} />
            <RateCard label="Questionário" now={current.rates.quiz} before={previous.rates.quiz} goal={QUIZ_CLOSE_RATE_GOAL} />
            <RateCard label="WhatsApp" now={current.rates.whatsApp} before={previous.rates.whatsApp} />
          </div>
        )}
        {ready && ranking.length === 0 && <p className="text-sm text-gray-400">Sem orçamentos com serviço identificado neste período.</p>}
        {ranking.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["#", "Serviço", "Orçamentos", "Fecharam", "Taxa", "vs anterior", "Até 70%", "Ticket", "Em jogo"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranking.map(r => {
                  const pos = r.contacts >= RANKING_MIN_CONTACTS ? ranked.indexOf(r) + 1 : null;
                  const missing = missingForGoal(r);
                  const before = previousRate.get(r.service);
                  const change = before && before.contacts ? Math.round((r.rate - before.rate) * 100) : null;
                  return (
                    <tr key={r.service} className="border-b border-gray-100 last:border-0">
                      <td className="px-3 py-2 font-bold text-navy">{pos ?? "–"}</td>
                      <td className="px-3 py-2 font-semibold text-navy whitespace-nowrap">{r.service}</td>
                      <td className="px-3 py-2">{r.contacts}</td>
                      <td className="px-3 py-2">{r.closed}</td>
                      <td className="px-3 py-2 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold w-9 ${r.rate >= CLOSE_RATE_GOAL ? "text-emerald-600" : "text-navy"}`}>{pct(r.rate)}</span>
                          <div className="relative h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, r.rate * 100)}%`, background: GOLD }} />
                            <div className="absolute inset-y-0 w-px bg-navy/60" style={{ left: `${CLOSE_RATE_GOAL * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className={`px-3 py-2 whitespace-nowrap font-semibold ${change === null || change === 0 ? "text-gray-400" : change > 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {change === null ? "–" : `${change > 0 ? "+" : ""}${change} pp`}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{missing ? `+${missing} fechos` : "atingida"}</td>
                      <td className="px-3 py-2">{euro(r.ticket)}</td>
                      <td className="px-3 py-2 font-semibold whitespace-nowrap">{atStake(r) ? euro(atStake(r)) : "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[11px] text-gray-500 mt-2">
          Orçamento = pessoa que pediu preço no questionário do site ou no WhatsApp, uma vez, no dia do primeiro pedido (quem fez os dois conta pelo questionário). Fechou = serviço no CRM a partir desse dia, ou etiqueta cliente ou marcado no WhatsApp (o estado de hoje, por isso semanas antigas ficam um pouco acima).
          Uma pessoa conta em cada serviço que pediu. Em jogo = fechos que faltavam para {pct(CLOSE_RATE_GOAL)} × ticket. Ticket = média desse serviço nas linhas do CRM de pelo menos 90 dias, como na aba Serviços. Com menos de {RANKING_MIN_CONTACTS} orçamentos o serviço fica sem posição. Depende das etiquetas do WhatsApp estarem em dia.
        </p>
      </div>

      {/* Por dia da semana: média por ocorrência, para comparar dias que calham 4 e 5 vezes no período */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-bold text-navy">Fechos por dia da semana</p>
        <p className="text-[11px] text-gray-500 mb-4">Média de serviços fechados por cada segunda, terça… do período</p>
        <div className="relative">
          <div className="flex items-end gap-2 h-40 border-b border-gray-200">
            {summary.byWeekday.map((w, i) => {
              const active = hover?.chart === "weekday" && hover.index === i;
              return (
                <button key={w.weekday} type="button"
                  onPointerEnter={() => setHover({ chart: "weekday", index: i })} onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover({ chart: "weekday", index: i })} onBlur={() => setHover(null)}
                  aria-label={`${WEEKDAY_LONG[w.weekday]}: ${decimal(w.average)} por dia, ${w.count} fechos`}
                  className="flex-1 min-w-0 h-full flex flex-col justify-end items-center focus:outline-none">
                  <span className="text-[11px] font-semibold text-navy mb-1">{decimal(w.average)}</span>
                  <span className="w-full max-w-[24px] rounded-t transition-colors"
                    style={{ height: `calc((100% - 20px) * ${maxAverage ? w.average / maxAverage : 0})`, minHeight: w.count ? 2 : 0, background: active ? GOLD_HOVER : GOLD }} />
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-1.5">
            {summary.byWeekday.map(w => <span key={w.weekday} className="flex-1 min-w-0 text-center text-[11px] text-gray-500">{WEEKDAY_SHORT[w.weekday]}</span>)}
          </div>
          {weekdayHover && (
            <div className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-white px-3 py-2 text-xs shadow-lg border border-gray-200 whitespace-nowrap"
              style={{ left: `${((hover!.index + 0.5) / 7) * 100}%` }}>
              <p className="font-bold text-navy">{decimal(weekdayHover.average)} por {WEEKDAY_LONG[weekdayHover.weekday]}</p>
              <p className="text-gray-500">{weekdayHover.count} fechos em {weekdayHover.occurrences} {WEEKDAY_LONG[weekdayHover.weekday]}{weekdayHover.occurrences === 1 ? "" : "s"}</p>
              <p className="text-gray-500">{money(weekdayHover.billed)} faturado · {money(weekdayHover.cut)} para ti</p>
            </div>
          )}
        </div>
        <details className="mt-3">
          <summary className="text-xs font-semibold text-navy cursor-pointer">Ver os números por dia da semana</summary>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Dia", "Fechos", "Vezes no período", "Média", "Faturado", "A tua parte"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.byWeekday.map(w => (
                  <tr key={w.weekday} className="border-b border-gray-100 last:border-0">
                    <td className="px-3 py-2 text-navy font-medium capitalize">{WEEKDAY_LONG[w.weekday]}</td>
                    <td className="px-3 py-2 text-navy">{w.count}</td>
                    <td className="px-3 py-2 text-gray-500">{w.occurrences}</td>
                    <td className="px-3 py-2 font-semibold text-navy">{decimal(w.average)}</td>
                    <td className="px-3 py-2 text-navy whitespace-nowrap">{money(w.billed)}</td>
                    <td className="px-3 py-2 text-navy whitespace-nowrap">{money(w.cut)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      {/* Dia a dia, com os dias sem fechos a zero: são eles que mostram o padrão */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-bold text-navy">Dia a dia</p>
        <p className="text-[11px] text-gray-500 mb-4">Serviços fechados em cada dia, de {dayLabel(summary.from)} a {dayLabel(summary.to)}. Carrega num dia para ver o que se fechou.</p>
        <div className="relative">
          <div className="flex items-end gap-[2px] h-28 border-b border-gray-200">
            {summary.perDay.map((d, i) => {
              const active = hover?.chart === "day" && hover.index === i;
              return (
                <button key={d.day} type="button"
                  onPointerEnter={() => setHover({ chart: "day", index: i })} onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover({ chart: "day", index: i })} onBlur={() => setHover(null)}
                  onClick={() => setOpenDay(o => (o === d.day ? null : d.day))}
                  aria-label={`${dayLabel(d.day)}: ${d.count} fechos. Ver os fechos deste dia`} aria-pressed={shownDay === d.day}
                  className="flex-1 min-w-0 h-full flex items-end justify-center focus:outline-none cursor-pointer">
                  <span className="w-full max-w-[24px] rounded-t-sm transition-colors"
                    style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count ? 2 : 0, background: active || shownDay === d.day ? GOLD_HOVER : shownDay ? GOLD_FADED : GOLD }} />
                </button>
              );
            })}
          </div>
          {/* Datas soltas, posicionadas por cima do eixo: não ocupam largura, por isso 365 dias cabem num telemóvel */}
          <div className="relative h-4 mt-1.5">
            {summary.perDay.map((d, i) => i % (days > 120 ? 30 : labelEvery) === 0 && (
              <span key={d.day} className="absolute top-0 text-[10px] text-gray-400 whitespace-nowrap"
                style={{ left: `${(i / days) * 100}%` }}>
                {dm(d.day)}
              </span>
            ))}
          </div>
          {dayHover && (
            <div className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-white px-3 py-2 text-xs shadow-lg border border-gray-200 whitespace-nowrap"
              style={{ left: `${Math.min(90, Math.max(10, ((hover!.index + 0.5) / days) * 100))}%` }}>
              <p className="font-bold text-navy">{dayHover.count} fecho{dayHover.count === 1 ? "" : "s"}</p>
              <p className="text-gray-500 capitalize">{dayLabel(dayHover.day)}</p>
              {dayHover.count > 0 && <p className="text-gray-500">{money(dayHover.billed)} faturado · {money(dayHover.cut)} para ti</p>}
            </div>
          )}
        </div>
        {shownDay && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-bold text-navy first-letter:uppercase">{DAY_LONG_FMT.format(noon(shownDay))}</p>
                <p className="text-[11px] text-gray-500">
                  {dayRows.length} fecho{dayRows.length === 1 ? "" : "s"}
                  {dayRows.length > 0 && <> · {money(dayRows.reduce((t, r) => t + (Number(r.billed_value) || 0), 0))} faturado · {money(dayRows.reduce((t, r) => t + (Number(r.my_cut) || 0), 0))} para ti</>}
                </p>
              </div>
              <button type="button" onClick={() => setOpenDay(null)} aria-label="Fechar o dia" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-navy">
                <X className="w-4 h-4" />
              </button>
            </div>
            {dayRows.length === 0 ? (
              <p className="text-xs text-gray-500">Nenhum serviço fechado neste dia.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {dayRows.map((r, i) => (
                  <li key={r.id ?? i} className="py-2 flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy truncate">
                        <span className="text-gray-400 font-normal mr-1.5">{TIME_FMT.format(new Date(r.booked_at!))}</span>
                        {r.client_name || "Sem nome"}
                        {(r.city || r.locality) && <span className="text-gray-500 font-normal"> · {r.city || r.locality}</span>}
                      </p>
                      {r.description && <p className="text-gray-600 break-words">{r.description}</p>}
                      <p className="text-[11px] text-gray-400">
                        Serviço a {r.request_date ? dm(r.request_date) : "?"}{r.source ? ` · ${r.source}` : ""}
                        {r.calendar_missing_since && <span className="text-red-600"> · já não está no calendário</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-navy">{money(Number(r.billed_value) || 0)}</p>
                      <p className="text-[11px] text-gray-500">{money(Number(r.my_cut) || 0)} para ti</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {summary.withoutDate > 0 && (
        <p className="text-[11px] text-gray-500">
          {summary.withoutDate} pedido{summary.withoutDate === 1 ? "" : "s"} sem data de fecho não entra{summary.withoutDate === 1 ? "" : "m"} nestas contas: são linhas antigas que não têm evento correspondente no calendário.
        </p>
      )}
    </div>
  );
};

export default CrmClosings;
