import { useMemo, useState } from "react";
import { addDays, lisbonDay, summarizeClosings, WEEKDAY_LONG, WEEKDAY_SHORT, type ClosingRow } from "@/lib/crmClosings";

// Aba "Fechos" do CRM: em que dias da semana se fecham mais serviços.
// Uma só série, por isso sem legenda: o título diz o que está desenhado. O
// dourado não chega a 3:1 sobre branco, por isso cada coluna leva o valor
// escrito e a tabela por baixo tem todos os números.

const GOLD = "#D4AF37";
const GOLD_HOVER = "#E3C45F";

const PERIODS = [
  { id: "7", label: "7 dias", days: 7 },
  { id: "30", label: "30 dias", days: 30 },
  { id: "90", label: "90 dias", days: 90 },
  { id: "all", label: "Tudo", days: null },
] as const;
type PeriodId = (typeof PERIODS)[number]["id"];

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€`;
const decimal = (n: number) => n.toLocaleString("pt-PT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const DAY_FMT = new Intl.DateTimeFormat("pt-PT", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const dayLabel = (day: string) => DAY_FMT.format(new Date(`${day}T12:00:00Z`));

interface Hover { chart: "weekday" | "day"; index: number }

const CrmClosings = ({ records }: { records: ClosingRow[] }) => {
  const [period, setPeriod] = useState<PeriodId>("30");
  const [hover, setHover] = useState<Hover | null>(null);

  const summary = useMemo(() => {
    const to = lisbonDay(new Date());
    const chosen = PERIODS.find(p => p.id === period)!;
    let from: string;
    if (chosen.days) from = addDays(to, -(chosen.days - 1));
    else {
      const first = records.filter(r => r.booked_at).map(r => lisbonDay(r.booked_at!)).sort()[0];
      from = first && first < to ? first : to;
    }
    return summarizeClosings(records, from, to);
  }, [records, period]);

  const days = summary.perDay.length;
  const maxAverage = Math.max(...summary.byWeekday.map(w => w.average));
  const best = maxAverage > 0 ? summary.byWeekday.filter(w => w.average === maxAverage) : [];
  const maxDay = Math.max(1, ...summary.perDay.map(d => d.count));
  const labelEvery = days <= 7 ? 1 : days <= 45 ? 7 : 14;

  const weekdayHover = hover?.chart === "weekday" ? summary.byWeekday[hover.index] : null;
  const dayHover = hover?.chart === "day" ? summary.perDay[hover.index] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          Dia em que cada serviço foi fechado (criado no calendário ou metido no CRM), não o dia do serviço.
        </p>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5" role="group" aria-label="Período">
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)} aria-pressed={period === p.id}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${period === p.id ? "bg-navy text-white" : "text-navy hover:bg-gray-50"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Faturado / a tua parte</p>
          <p className="text-xl font-bold text-navy">{money(summary.billed)}</p>
          <p className="text-[11px] text-gray-500">{money(summary.cut)} para ti</p>
        </div>
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
      </div>

      {/* Dia a dia, com os dias sem fechos a zero: são eles que mostram o padrão */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-bold text-navy">Dia a dia</p>
        <p className="text-[11px] text-gray-500 mb-4">Serviços fechados em cada dia, de {dayLabel(summary.from)} a {dayLabel(summary.to)}</p>
        <div className="relative">
          <div className="flex items-end gap-[2px] h-28 border-b border-gray-200">
            {summary.perDay.map((d, i) => {
              const active = hover?.chart === "day" && hover.index === i;
              return (
                <button key={d.day} type="button"
                  onPointerEnter={() => setHover({ chart: "day", index: i })} onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover({ chart: "day", index: i })} onBlur={() => setHover(null)}
                  aria-label={`${dayLabel(d.day)}: ${d.count} fechos`}
                  className="flex-1 min-w-0 h-full flex items-end justify-center focus:outline-none">
                  <span className="w-full max-w-[24px] rounded-t-sm transition-colors"
                    style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count ? 2 : 0, background: active ? GOLD_HOVER : GOLD }} />
                </button>
              );
            })}
          </div>
          {/* Datas soltas, posicionadas por cima do eixo: não ocupam largura, por isso 90 dias cabem num telemóvel */}
          <div className="relative h-4 mt-1.5">
            {summary.perDay.map((d, i) => i % labelEvery === 0 && (
              <span key={d.day} className="absolute top-0 text-[10px] text-gray-400 whitespace-nowrap"
                style={{ left: `${(i / days) * 100}%` }}>
                {d.day.slice(8, 10)}/{d.day.slice(5, 7)}
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
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
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
