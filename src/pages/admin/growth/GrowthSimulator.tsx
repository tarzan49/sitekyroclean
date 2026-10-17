import { useEffect, useMemo, useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import type { RecentWindow } from "@/lib/growthInsights";
import { euro, pct, signedEuro } from "./format";

// Simulador do separador Crescimento: para ti por semana = pedidos × taxa de fecho
// × ticket médio × a tua parte do faturado, a partir das últimas 4 semanas. Os
// pedidos a mais descontam o custo dos anúncios por pedido a mais das semanas
// completas com anúncios, quando existe.

const WEEKS_PER_MONTH = 52 / 12;

function Slider({ label, value, min, max, step = 1, fmt, onChange, base }: {
  label: string; value: number; min: number; max: number; step?: number; fmt: (n: number) => string; onChange: (n: number) => void; base: number;
}) {
  const id = `sim-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-gray-600">{label}</label>
        <span className="text-sm font-bold text-navy tabular-nums">
          {fmt(value)}
          {value !== base && <span className="ml-1 text-[11px] font-normal text-gray-400">(hoje {fmt(base)})</span>}
        </span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-[#D4AF37]" />
    </div>
  );
}

export default function GrowthSimulator({ win, costPerExtraRequest }: { win: RecentWindow; costPerExtraRequest: number | null }) {
  const start = useMemo(() => ({
    requests: Math.round(win.requests),
    rate: Math.round((win.rate ?? 0) * 100),
    ticket: Math.round(win.ticket ?? 0),
  }), [win.requests, win.rate, win.ticket]);
  const [requests, setRequests] = useState(start.requests);
  const [rate, setRate] = useState(start.rate);
  const [ticket, setTicket] = useState(start.ticket);
  const reset = () => { setRequests(start.requests); setRate(start.rate); setTicket(start.ticket); };
  // Os valores de partida mudam quando a semana acaba e a janela das 4 semanas anda.
  useEffect(reset, [start]);

  if (win.rate === null || win.ticket === null || win.shareRatio === null) return null;
  const share = win.shareRatio;
  const today = start.requests * (start.rate / 100) * start.ticket * share;
  const gross = requests * (rate / 100) * ticket * share;
  const extraRequests = requests - start.requests;
  const adsCost = costPerExtraRequest !== null && extraRequests > 0 ? extraRequests * costPerExtraRequest : 0;
  const net = gross - adsCost;
  const diff = net - today;

  const presets = [
    { label: "+5 pontos de taxa", apply: () => { reset(); setRate(start.rate + 5); } },
    { label: "+10€ de ticket", apply: () => { reset(); setTicket(start.ticket + 10); } },
    { label: "+10 pedidos", apply: () => { reset(); setRequests(start.requests + 10); } },
  ];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
      <div>
        <h3 className="flex items-center gap-2 font-playfair text-lg font-bold text-navy"><Calculator className="w-5 h-5" aria-hidden="true" /> E se…?</h3>
        <p className="text-xs text-gray-500">Mexe nos três números e vê quanto ficas a ganhar por semana. Parte das últimas {win.weeks} semanas.</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map(p => (
          <button key={p.label} type="button" onClick={p.apply} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-navy hover:border-[#D4AF37] hover:bg-[#D4AF37]/10">{p.label}</button>
        ))}
        <button type="button" onClick={reset} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-navy">
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Repor
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <Slider label="Pedidos de orçamento por semana" value={requests} min={10} max={Math.max(200, start.requests * 2)} fmt={n => String(n)} onChange={setRequests} base={start.requests} />
          <Slider label="Taxa de fecho" value={rate} min={10} max={90} fmt={n => `${n}%`} onChange={setRate} base={start.rate} />
          <Slider label="Ticket médio" value={ticket} min={60} max={Math.max(300, start.ticket * 2)} fmt={n => `${n}€`} onChange={setTicket} base={start.ticket} />
        </div>
        <div className="rounded-2xl bg-[#0B2F2A] text-white p-4 flex flex-col justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">Para ti por semana</p>
            <p className="font-playfair text-4xl font-bold tabular-nums">{euro(net)}</p>
            <p className="text-sm text-white/70 tabular-nums">≈ {euro(net * WEEKS_PER_MONTH)} por mês</p>
          </div>
          <div className={`rounded-xl px-3 py-2 text-sm font-semibold tabular-nums ${Math.abs(diff) < 1 ? "bg-white/10 text-white/80" : diff > 0 ? "bg-emerald-400/15 text-emerald-200" : "bg-red-400/15 text-red-200"}`}>
            {Math.abs(diff) < 1 ? `Igual ao ritmo das últimas ${win.weeks} semanas` : `${signedEuro(diff)} por semana (${signedEuro(diff * WEEKS_PER_MONTH)} por mês) face a hoje`}
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div><dt className="text-white/50">Fechos por semana</dt><dd className="font-bold tabular-nums">{Math.round(requests * rate / 100)}</dd></div>
            <div><dt className="text-white/50">Faturado por semana</dt><dd className="font-bold tabular-nums">{euro(requests * rate / 100 * ticket)}</dd></div>
            {adsCost > 0 && (
              <div className="col-span-2"><dt className="text-white/50">Anúncios para os {extraRequests} pedidos a mais</dt><dd className="font-bold tabular-nums">−{euro(adsCost)} (≈ {euro(costPerExtraRequest!)} cada, já descontados)</dd></div>
            )}
          </dl>
        </div>
      </div>
      <p className="text-[11px] text-gray-500">Conta: pedidos × taxa de fecho × ticket × a tua parte ({pct(share)} do faturado nas últimas {win.weeks} semanas). Hoje: {start.requests} pedidos, {start.rate}% de fecho, {start.ticket}€ por serviço = {euro(today)} por semana.</p>
    </section>
  );
}
