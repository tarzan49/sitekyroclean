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
  const perDay = [...summary.perDay].reverse();
  const maxBilled = Math.max(1, ...perDay.map(d => d.billed));
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

      <ul className="divide-y divide-gray-100">
        {perDay.map(d => {
          const isOpen = open === d.day;
          return (
            <li key={d.day}>
              <button onClick={() => setOpen(isOpen ? null : d.day)} className="w-full py-2 flex items-center gap-3 text-left">
                <span className={`w-20 shrink-0 text-xs ${d.day === today ? "font-bold text-navy" : "text-gray-600"}`}>
                  {d.day === today ? "Hoje" : `${WEEKDAY_SHORT[weekdayOf(d.day)]} ${dm(d.day)}`}
                </span>
                <span className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <span className="block h-full rounded-full" style={{ width: `${(d.billed / maxBilled) * 100}%`, background: "#D4AF37" }} />
                </span>
                <span className="w-8 text-right text-xs text-gray-600 tabular-nums">{d.count}</span>
                <span className="w-16 text-right text-sm font-bold text-navy tabular-nums">{euro(d.billed)}</span>
                <span className="w-16 text-right text-[11px] text-gray-500 tabular-nums">{euro(d.cut)}</span>
              </button>
              {isOpen && (
                <div className="pb-2 pl-2">
                  {dayRows.length === 0 ? <p className="text-xs text-gray-500">Nenhum serviço fechado neste dia.</p> : (
                    <ul className="space-y-1.5">
                      {dayRows.map((r, i) => (
                        <li key={r.id ?? i} className="flex items-start gap-3 rounded-lg bg-gray-50 px-2.5 py-1.5">
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
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-gray-500">Colunas: fechos · faturado · para ti. Um fecho conta no dia em que foi marcado (não no dia do serviço); revisitas a 0€ não contam.</p>
    </section>
  );
}
