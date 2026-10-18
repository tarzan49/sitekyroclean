import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { addDays, closingsOnDay, lisbonDay, summarizeClosings, WEEKDAY_SHORT, weekdayOf } from "@/lib/crmClosings";
import type { LiveClosing } from "@/lib/growthLive";
import { dm, euro } from "./format";

// Dia a dia (dono, 2026-10-18: "já não tenho nenhuma aba em que veja os serviços
// fechados no dia a dia e o dinheiro que se faz por dia"). Era a parte "dia a
// dia" da antiga aba Fechos: fechos pelo dia de `booked_at` (Lisboa), faturado e
// a parte do dono, e carregar num dia mostra os serviços desse dia.

const RANGES = [14, 30, 60] as const;

export default function DailyClosings({ rows, now }: { rows: LiveClosing[]; now: Date }) {
  const [days, setDays] = useState<(typeof RANGES)[number]>(14);
  const today = lisbonDay(now);
  const [open, setOpen] = useState<string | null>(today);

  const summary = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = rows as any[];
    return summarizeClosings(r, addDays(today, -(days - 1)), today);
  }, [rows, today, days]);
  const maxBilled = Math.max(1, ...summary.perDay.map(d => d.billed));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dayRows = open ? closingsOnDay(rows as any[], open) as unknown as LiveClosing[] : [];
  const avg = summary.billed / days;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-navy"><CalendarDays className="w-4 h-4" aria-hidden="true" /> Dia a dia</h3>
          <p className="text-[11px] text-gray-500">Serviços fechados em cada dia e o dinheiro desse dia. Carrega num dia para ver os serviços.</p>
        </div>
        <div className="flex gap-1">
          {RANGES.map(n => (
            <button key={n} onClick={() => setDays(n)}
              className={`px-2.5 py-1 text-xs rounded-full border ${days === n ? "bg-navy text-white border-navy" : "bg-white text-navy border-gray-200"}`}>{n} dias</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-gray-50 p-2.5"><p className="text-[11px] text-gray-500">Fechos</p><p className="text-lg font-bold text-navy tabular-nums">{summary.count}</p></div>
        <div className="rounded-xl bg-gray-50 p-2.5"><p className="text-[11px] text-gray-500">Faturado</p><p className="text-lg font-bold text-navy tabular-nums">{euro(summary.billed)}</p></div>
        <div className="rounded-xl bg-gray-50 p-2.5"><p className="text-[11px] text-gray-500">Para ti</p><p className="text-lg font-bold text-navy tabular-nums">{euro(summary.cut)}</p></div>
      </div>
      <p className="text-[11px] text-gray-500">Média: {euro(avg)} faturados e {(summary.count / days).toLocaleString("pt-PT", { maximumFractionDigits: 1 })} fechos por dia.</p>

      <div className="pt-6">
        <div className="flex items-end gap-[3px] sm:gap-1.5 h-40 border-b border-gray-200">
          {summary.perDay.map(d => {
            const sel = open === d.day;
            const h = d.billed > 0 ? Math.max(4, (d.billed / maxBilled) * 100) : 0;
            return (
              <button key={d.day} onClick={() => setOpen(sel ? null : d.day)}
                title={`${d.count} fechos · ${euro(d.billed)} faturado · ${euro(d.cut)} para ti`}
                className="group relative flex-1 h-full flex flex-col justify-end items-center min-w-0">
                {days <= 14 && d.billed > 0 && (
                  <span className={`absolute text-[10px] tabular-nums whitespace-nowrap ${sel ? "font-bold text-navy" : "text-gray-500"}`} style={{ bottom: `calc(${h}% + 4px)`, top: "auto" }}>{euro(d.billed)}</span>
                )}
                <span className={`w-full max-w-[34px] rounded-t-md transition-all ${sel ? "" : "opacity-80 group-hover:opacity-100"}`}
                  style={{ height: `${h}%`, background: sel ? "#0B2F2A" : "#D4AF37" }} />
              </button>
            );
          })}
        </div>
        <div className="flex gap-[3px] sm:gap-1.5 mt-1">
          {summary.perDay.map((d, i) => {
            const step = days <= 14 ? 1 : days <= 30 ? 3 : 7;
            const show = (summary.perDay.length - 1 - i) % step === 0;
            return (
              <span key={d.day} className={`flex-1 min-w-0 text-center text-[10px] leading-tight ${open === d.day ? "font-bold text-navy" : "text-gray-400"}`}>
                {show ? <>{d.day === today ? "Hoje" : WEEKDAY_SHORT[weekdayOf(d.day)]}<br />{dm(d.day)}</> : null}
              </span>
            );
          })}
        </div>
      </div>

      {open && (() => {
        const d = summary.perDay.find(x => x.day === open);
        return (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <p className="text-sm font-bold text-navy">{open === today ? "Hoje" : `${WEEKDAY_SHORT[weekdayOf(open)]} ${dm(open)}`}</p>
              <p className="text-xs text-gray-600 tabular-nums">{d?.count ?? 0} fechos · <b className="text-navy">{euro(d?.billed ?? 0)}</b> faturado · {euro(d?.cut ?? 0)} para ti</p>
            </div>
            {dayRows.length === 0 ? <p className="text-xs text-gray-500">Nenhum serviço fechado neste dia.</p> : (
              <ul className="space-y-1.5">
                {dayRows.map((r, i) => (
                  <li key={r.id ?? i} className="flex items-start gap-3 rounded-lg bg-white px-2.5 py-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-navy font-medium line-clamp-1">{r.description || "Serviço"}</p>
                      <p className="text-[11px] text-gray-500">
                        {new Date(r.booked_at!).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Lisbon" })}
                        {(r.locality || r.city) && ` · ${r.locality || r.city}`}
                        {r.source === "Google Ads" && " · Google Ads"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-navy tabular-nums">{euro(Number(r.billed_value) || 0)}</p>
                      <p className="text-[11px] text-gray-500 tabular-nums">{euro(Number(r.my_cut) || 0)} para ti</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })()}
      <p className="text-[11px] text-gray-500">Barras = faturado em cada dia. Um fecho conta no dia em que foi marcado (não no dia do serviço); revisitas a 0€ não contam.</p>
    </section>
  );
}
