import { useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { ADS_FROM, ORGANIC_FROM, ORGANIC_TO, type Baseline, type ExtraWeek } from "@/lib/adsVsOrganic";
import { addDays } from "@/lib/crmClosings";
import type { WeekWithEstimate } from "@/lib/growthLive";
import { change, dm, euro, one, pct, signedEuro, signedNum } from "./format";
import { DeltaPill } from "./LiveCards";

// Explorador semana a semana do separador Crescimento: escolhe-se o número
// (pedidos, fechos, taxa, ticket, faturado, para ti, gasto, lucro) e carrega-se
// numa semana para ver o funil dela contra agosto e setembro e contra a semana
// anterior. Barras em HTML, sem biblioteca de gráficos: o painel não tem nenhuma.

const GOLD = "#D4AF37";
/** Semanas no gráfico; a tabela em baixo tem todas. */
const MAX_BARS = 14;

type Kind = "organic" | "mixed" | "ads" | "current";
type MetricId = "pedidos" | "fechos" | "taxa" | "ticket" | "faturado" | "paraTi" | "gasto" | "lucro";

const rateOf = (w: Pick<WeekWithEstimate, "closings" | "newPeople">) => (w.newPeople ? w.closings / w.newPeople : null);
const ticketOf = (w: Pick<WeekWithEstimate, "closings" | "billed">) => (w.closings ? w.billed / w.closings : null);
const count = (n: number) => String(Math.round(n));

interface Metric {
  id: MetricId;
  label: string;
  value: (w: WeekWithEstimate, x: ExtraWeek | undefined) => number | null;
  /** Média orgânica por semana; null = sem linha de referência. */
  base: (b: Baseline) => number | null;
  fmt: (n: number) => string;
  /** Contagens e dinheiro: a semana em curso compara com a média proporcional aos dias passados. */
  additive: boolean;
}

const METRICS: Metric[] = [
  { id: "pedidos", label: "Pedidos", value: w => w.newPeople, base: b => b.newPeople, fmt: count, additive: true },
  { id: "fechos", label: "Fechos", value: w => w.closings, base: b => b.closings, fmt: count, additive: true },
  { id: "taxa", label: "Taxa de fecho", value: rateOf, base: b => (b.newPeople ? b.closings / b.newPeople : null), fmt: n => pct(n), additive: false },
  { id: "ticket", label: "Ticket médio", value: ticketOf, base: b => (b.closings ? b.billed / b.closings : null), fmt: euro, additive: false },
  { id: "faturado", label: "Faturado", value: w => w.billed, base: b => b.billed, fmt: euro, additive: true },
  { id: "paraTi", label: "Para ti", value: w => w.share, base: b => b.share, fmt: euro, additive: true },
  { id: "gasto", label: "Gasto Google", value: w => w.spend, base: () => null, fmt: euro, additive: true },
  { id: "lucro", label: "Lucro dos anúncios", value: (_w, x) => (x ? x.profit : null), base: () => null, fmt: signedEuro, additive: true },
];

function kindOf(w: WeekWithEstimate): Kind {
  if (w.daysElapsed < 7) return "current";
  if (w.week >= ORGANIC_FROM && addDays(w.week, 6) <= ORGANIC_TO) return "organic";
  return w.week < ADS_FROM ? "mixed" : "ads";
}

const BAR_CLASS: Record<Kind, string> = {
  organic: "bg-gray-300",
  mixed: "bg-navy/40",
  ads: "bg-navy",
  current: "",
};
const KIND_LABEL: Record<Kind, string> = {
  organic: "sem anúncios",
  mixed: "anúncios desde sábado 26/09",
  ads: "com anúncios",
  current: "em curso",
};

function Bars({ weeks, extraByWeek, metric, base, selected, onSelect }: {
  weeks: WeekWithEstimate[]; extraByWeek: Map<string, ExtraWeek>; metric: Metric; base: Baseline; selected: string; onSelect: (week: string) => void;
}) {
  const items = weeks.map(w => ({ w, kind: kindOf(w), value: metric.value(w, extraByWeek.get(w.week)) }));
  const avg = metric.base(base);
  const values = items.map(i => i.value).filter((v): v is number => v !== null);
  const max = Math.max(0, ...values, avg ?? 0);
  const min = Math.min(0, ...values);
  const range = (max - min) * 1.18 || 1;
  const y = (v: number) => ((v - min) / range) * 100;
  const zero = y(0);
  return (
    <div>
      <div className="relative h-48 sm:h-60">
        {min < 0 && <div className="absolute inset-x-0 border-t border-gray-300" style={{ bottom: `${zero}%` }} />}
        {avg !== null && (
          <div className="absolute inset-x-0 border-t-2 border-dashed border-gray-400 pointer-events-none z-10" style={{ bottom: `${y(avg)}%` }}>
            <span className="absolute left-0 -top-5 rounded bg-white/90 px-1 text-[10.5px] font-semibold text-gray-500 tabular-nums">média ago/set {metric.fmt(avg)}</span>
          </div>
        )}
        <div className="absolute inset-0 flex gap-1 sm:gap-1.5">
          {items.map(({ w, kind, value }) => {
            const isSel = w.week === selected;
            const negative = value !== null && value < 0;
            const bottom = value === null ? zero : negative ? y(value) : zero;
            const height = value === null ? 0 : Math.max(0.8, Math.abs(y(value) - zero));
            const color = metric.id === "lucro" ? (negative ? "bg-red-400" : "bg-emerald-500") : BAR_CLASS[kind];
            return (
              <button
                key={w.week}
                type="button"
                onClick={() => onSelect(w.week)}
                aria-pressed={isSel}
                aria-label={`Semana de ${dm(w.week)}: ${value === null ? "sem dados" : metric.fmt(value)}`}
                className="relative flex-1 min-w-0 h-full rounded-md hover:bg-gray-100/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              >
                {value !== null && (
                  <>
                    <span
                      className={`absolute left-[14%] right-[14%] rounded-[5px] transition-all duration-300 ${color} ${isSel ? "ring-2 ring-offset-2 ring-[#D4AF37]" : ""} ${kind === "current" && metric.id === "lucro" ? "opacity-60" : ""}`}
                      style={{ bottom: `${bottom}%`, height: `${height}%`, ...(kind === "current" && metric.id !== "lucro" ? { background: GOLD } : {}) }}
                    />
                    <span
                      className={`absolute inset-x-0 text-center text-[10px] font-semibold tabular-nums leading-none ${isSel ? "block text-navy" : "hidden sm:block text-gray-500"}`}
                      style={{ bottom: `calc(${negative ? zero : y(value)}% + 4px)` }}
                    >
                      {metric.fmt(value)}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-1 sm:gap-1.5 mt-1.5">
        {items.map(({ w }, i) => {
          // No telemóvel, uma data sim, uma não (a mais recente e a escolhida aparecem sempre).
          const sel = items.findIndex(x => x.w.week === selected);
          const selOffBeat = sel >= 0 && (items.length - 1 - sel) % 2 === 1;
          const onPhone = i === sel || ((items.length - 1 - i) % 2 === 0 && !(selOffBeat && Math.abs(i - sel) === 1));
          return (
            <span key={w.week} className={`flex-1 min-w-0 text-center text-[10px] sm:text-[11px] tabular-nums whitespace-nowrap ${w.week === selected ? "font-bold text-navy" : "text-gray-400"} ${onPhone ? "" : "invisible sm:visible"}`}>{dm(w.week)}</span>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ lucro }: { lucro: boolean }) {
  const items = lucro
    ? [{ c: "bg-emerald-500", l: "Lucro" }, { c: "bg-red-400", l: "Prejuízo" }]
    : [{ c: "bg-gray-300", l: "Sem anúncios" }, { c: "bg-navy/40", l: "21/09 (misto)" }, { c: "bg-navy", l: "Com anúncios" }, { c: "", l: "Em curso", gold: true }];
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
      {items.map(i => (
        <span key={i.l} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-sm ${i.c}`} style={"gold" in i && i.gold ? { background: GOLD } : undefined} />{i.l}
        </span>
      ))}
      {!lucro && <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-gray-400" />Média ago/set</span>}
    </div>
  );
}

function FunnelStep({ label, value, sub, delta, prev }: { label: string; value: string; sub?: string; delta: number | null; prev?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <p className="text-[11px] font-semibold text-gray-500">{label}</p>
      <p className="text-xl font-bold text-navy tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
        <DeltaPill value={delta} small /> <span>vs ago/set</span>
      </div>
      {prev && <p className="text-[11px] text-gray-400 mt-1">semana anterior: {prev}</p>}
    </div>
  );
}

function WeekDetail({ w, prev, base, extra }: { w: WeekWithEstimate; prev: WeekWithEstimate | null; base: Baseline; extra: ExtraWeek | undefined }) {
  const kind = kindOf(w);
  const k = w.daysElapsed / 7;
  const rate = rateOf(w);
  const ticket = ticketOf(w);
  const baseRate = base.newPeople ? base.closings / base.newPeople : null;
  const baseTicket = base.closings ? base.billed / base.closings : null;
  const showPrev = kind !== "current" && prev;
  const cpr = extra && extra.extraNewPeople && extra.extraNewPeople > 0 ? extra.spend / extra.extraNewPeople : null;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h4 className="text-sm font-bold text-navy">Semana de {dm(w.week)} a {dm(addDays(w.week, 6))}</h4>
        <span className="text-[11px] text-gray-500">{KIND_LABEL[kind]}{kind === "current" ? `, ${one(w.daysElapsed)} de 7 dias: comparada com a média proporcional` : ""}</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <FunnelStep label="Pedidos de orçamento" value={w.newPeople === null ? "–" : String(w.newPeople)} sub={w.requestsEstimated ? "estimativa do servidor do bot" : `${w.peopleWrote ?? "–"} escreveram no total`}
          delta={change(w.newPeople, base.newPeople === null ? null : base.newPeople * k)} prev={showPrev ? String(prev.newPeople ?? "–") : undefined} />
        <FunnelStep label="Fechos" value={String(w.closings)} sub={`${pct(rate)} fecharam`}
          delta={change(w.closings, base.closings * k)} prev={showPrev ? `${prev.closings} (${pct(rateOf(prev))})` : undefined} />
        <FunnelStep label="Faturado" value={euro(w.billed)} sub={ticket === null ? undefined : `${euro(ticket)} por serviço${baseTicket ? ` (ago/set ${euro(baseTicket)})` : ""}`}
          delta={change(w.billed, base.billed * k)} prev={showPrev ? euro(prev.billed) : undefined} />
        <FunnelStep label="Para ti" value={euro(w.share)} sub={w.billed ? `${pct(w.share / w.billed)} do faturado` : undefined}
          delta={change(w.share, base.share * k)} prev={showPrev ? euro(prev.share) : undefined} />
      </div>
      {baseRate !== null && rate !== null && (
        <p className="text-xs text-gray-500">Taxa de fecho {pct(rate)} contra {pct(baseRate)} em agosto e setembro. Nesta conta um fecho conta na semana em que foi marcado, por isso uma semana com muitos pedidos no fim costuma fechar mais na seguinte.</p>
      )}
      {extra && (
        <div className="rounded-xl bg-[#0B2F2A] text-white px-3.5 py-3 text-sm flex flex-wrap gap-x-4 gap-y-1.5">
          <span><span className="text-white/50">Gasto</span> <b className="tabular-nums">{euro(extra.spend)}</b></span>
          {extra.extraNewPeople !== null && <span><span className="text-white/50">Pedidos a mais</span> <b className="tabular-nums">{signedNum(extra.extraNewPeople)}</b></span>}
          <span><span className="text-white/50">Fechos a mais</span> <b className="tabular-nums">{signedNum(extra.extraClosings)}</b></span>
          <span><span className="text-white/50">A mais para ti</span> <b className="tabular-nums">{signedEuro(extra.extraShare)}</b></span>
          <span><span className="text-white/50">Lucro</span> <b className={`tabular-nums ${extra.profit >= 0 ? "text-emerald-300" : "text-red-300"}`}>{signedEuro(extra.profit)}</b></span>
          {cpr !== null && <span><span className="text-white/50">Por pedido a mais</span> <b className="tabular-nums">{euro(cpr)}</b></span>}
        </div>
      )}
    </div>
  );
}

export default function WeekExplorer({ weeks, base, extraRows }: { weeks: WeekWithEstimate[]; base: Baseline; extraRows: ExtraWeek[] }) {
  const [metricId, setMetricId] = useState<MetricId>("pedidos");
  const shown = useMemo(() => weeks.slice(-MAX_BARS), [weeks]);
  const extraByWeek = useMemo(() => new Map(extraRows.map(r => [r.week, r])), [extraRows]);
  const lastComplete = [...weeks].reverse().find(w => w.daysElapsed >= 7)?.week ?? weeks[weeks.length - 1]?.week ?? "";
  const [selected, setSelected] = useState(lastComplete);
  useEffect(() => { if (!weeks.some(w => w.week === selected)) setSelected(lastComplete); }, [weeks, selected, lastComplete]);
  const metric = METRICS.find(m => m.id === metricId)!;
  const idx = weeks.findIndex(w => w.week === selected);
  const week = idx >= 0 ? weeks[idx] : null;
  const prev = idx > 0 ? weeks[idx - 1] : null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
      <div>
        <h3 className="flex items-center gap-2 font-playfair text-lg font-bold text-navy"><BarChart3 className="w-5 h-5" aria-hidden="true" /> Semana a semana</h3>
        <p className="text-xs text-gray-500">Escolhe o número e carrega numa semana para ver o funil dela.</p>
      </div>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-hide" role="tablist" aria-label="Número no gráfico">
        {METRICS.map(m => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={m.id === metricId}
            onClick={() => setMetricId(m.id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${m.id === metricId ? "border-[#D4AF37] bg-[#D4AF37]/15 text-navy" : "border-gray-200 text-gray-600 hover:border-navy/30"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <Bars weeks={shown} extraByWeek={extraByWeek} metric={metric} base={base} selected={selected} onSelect={setSelected} />
      <Legend lucro={metric.id === "lucro"} />
      {week && <div className="border-t border-gray-100 pt-4"><WeekDetail w={week} prev={prev} base={base} extra={extraByWeek.get(week.week)} /></div>}
    </section>
  );
}
