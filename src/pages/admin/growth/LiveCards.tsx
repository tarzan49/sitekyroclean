import { useState } from "react";
import { AlertTriangle, ArrowRight, Bell, Lightbulb, Megaphone, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { ADS_FROM } from "@/lib/adsVsOrganic";
import { serviceTotal, WEEKDAY_SHORT } from "@/lib/crmClosings";
import { campaignLabel, timeAgo, type CampaignTrend, type LiveClosing, type LiveWeek, type Pace, type SinceVisit } from "@/lib/growthLive";
import type { Insight } from "@/lib/growthInsights";
import { dm, dmy, euro, euro2, one, signedPct } from "./format";

// Cartões do separador Crescimento: a semana em curso ao vivo, as novidades, as dicas, os últimos fechos e as campanhas. As contas vêm
// de src/lib/growthLive.ts e src/lib/growthInsights.ts.

const GOLD = "#D4AF37";

/** Variação colorida. `goodWhenUp` null = neutro (o gasto não é bom nem mau por subir). */
export function DeltaPill({ value, goodWhenUp = true, small = false }: { value: number | null; goodWhenUp?: boolean | null; small?: boolean }) {
  if (value === null || !Number.isFinite(value)) return <span className="text-[11px] text-gray-400">–</span>;
  const flat = Math.abs(value) < 0.03;
  const good = goodWhenUp === null ? null : goodWhenUp ? value > 0 : value < 0;
  const tone = flat || good === null ? "bg-gray-100 text-gray-600" : good ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700";
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold tabular-nums ${tone} ${small ? "px-1.5 py-0.5 text-[10.5px]" : "px-2 py-0.5 text-[11px]"}`}>
      {!flat && <Icon className="w-3 h-3" aria-hidden="true" />}
      {signedPct(value)}
    </span>
  );
}

function PaceRow({ label, now, then, fmt, change, goodWhenUp = true, note }: {
  label: string; now: number; then: number; fmt: (n: number) => string; change: number | null; goodWhenUp?: boolean | null; note?: string;
}) {
  const max = Math.max(now, then, 1);
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold text-gray-500">{label}</p>
        <DeltaPill value={change} goodWhenUp={goodWhenUp} small />
      </div>
      <p className="text-2xl font-bold text-navy tabular-nums mt-0.5">{fmt(now)}</p>
      <div className="mt-2 space-y-1" aria-hidden="true">
        <div className="h-1.5 rounded-full bg-gray-200/70 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(now / max) * 100}%`, background: GOLD }} /></div>
        <div className="h-1.5 rounded-full bg-gray-200/70 overflow-hidden"><div className="h-full rounded-full bg-gray-400" style={{ width: `${(then / max) * 100}%` }} /></div>
      </div>
      <p className="text-[11px] text-gray-500 mt-1.5">semana passada: <span className="font-semibold text-gray-700 tabular-nums">{fmt(then)}</span>{note ? ` · ${note}` : ""}</p>
    </div>
  );
}

/**
 * Gasto Meta da semana em curso. Sem a Marketing API ligada diz "por ligar", nunca 0€; e
 * só compara com a semana passada quando ela já é toda depois de `from` (o gasto de antes
 * dos 500€ ficou para trás e não está gravado).
 */
function MetaSpendTile({ pace, from, compare }: { pace: Pace | null; from: string; compare: boolean }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold text-gray-500">Gasto Meta</p>
        {pace && compare && <DeltaPill value={pace.change} goodWhenUp={null} small />}
      </div>
      {pace
        ? <p className="text-2xl font-bold text-navy tabular-nums mt-0.5">{euro(pace.now)}</p>
        : <p className="text-base font-bold text-amber-700 mt-1.5">por ligar</p>}
      <p className="text-[11px] text-gray-500 mt-1.5">
        {pace && compare ? <>semana passada: <span className="font-semibold text-gray-700 tabular-nums">{euro(pace.then)}</span></> : `desde ${dmy(from)}`}
      </p>
    </div>
  );
}

export function LiveWeekCard({ live, meta }: { live: LiveWeek; meta: { pace: Pace | null; from: string; compare: boolean } }) {
  const n = (x: number) => String(Math.round(x));
  const projection = [
    live.requests.projection !== null ? `~${n(live.requests.projection)} pedidos` : null,
    live.closings.projection !== null ? `~${n(live.closings.projection)} fechos` : null,
    live.share.projection !== null ? `~${euro(live.share.projection)} para ti` : null,
  ].filter(Boolean);
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="flex items-center gap-2 font-playfair text-lg font-bold text-navy">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Esta semana, ao vivo
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Até {live.moment}, contra a semana passada à mesma hora.</p>
        </div>
      </div>
      <div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${live.fraction * 100}%`, background: GOLD }} /></div>
        <div className="mt-1 grid grid-cols-7 text-[10px] text-gray-400">
          {WEEKDAY_SHORT.map((d, i) => <span key={d} className={`text-center ${i === live.weekday ? "font-bold text-navy" : ""}`}>{d}</span>)}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
        <PaceRow label="Pedidos" now={live.requests.now} then={live.requests.then} fmt={n} change={live.requests.change} note={live.requests.estimated ? "estimativa" : undefined} />
        <PaceRow label="Fechos" now={live.closings.now} then={live.closings.then} fmt={n} change={live.closings.change} />
        <PaceRow label="Para ti" now={live.share.now} then={live.share.then} fmt={euro} change={live.share.change} />
        <PaceRow label="Gasto Google" now={live.spend.now} then={live.spend.then} fmt={euro} change={live.spend.change} goodWhenUp={null} />
        <MetaSpendTile {...meta} />
      </div>
      {projection.length > 0 && (
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-navy">Ao ritmo atual</span>, a semana fecha com {projection.join(", ")}.
          {live.requests.google > 0 && <span className="text-gray-500"> {live.requests.google} pessoas desta semana escreveram "Vi o vosso anúncio no Google" (é um mínimo).</span>}
        </p>
      )}
    </section>
  );
}

export function SinceVisitStrip({ since, fresh }: { since: SinceVisit | null; fresh: { count: number; billed: number } | null }) {
  if (!since && !fresh) return null;
  const ago = since ? (since.hours < 1 ? `há ${Math.max(1, Math.round(since.hours * 60))} min` : since.hours < 48 ? `há ${Math.round(since.hours)} h` : `há ${Math.round(since.hours / 24)} dias`) : "";
  const nothing = since && !since.closings && !since.conversations;
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {fresh && fresh.count > 0 && (
        <div className="flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm text-navy bg-white" style={{ borderColor: GOLD }} role="status">
          <Bell className="w-4 h-4 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
          <span><b>{fresh.count === 1 ? "Entrou um fecho novo" : `Entraram ${fresh.count} fechos novos`}</b> agora: {euro(fresh.billed)} faturados.</span>
        </div>
      )}
      {since && (
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
          <Receipt className="w-4 h-4 shrink-0 text-navy" aria-hidden="true" />
          {nothing ? (
            <span>Sem novidades desde a tua última visita ({ago}).</span>
          ) : (
            <span>
              <b className="text-navy">Desde a tua última visita ({ago}):</b> {since.closings} {since.closings === 1 ? "fecho" : "fechos"}
              {since.closings > 0 && <> ({euro(since.billed)} faturados, {euro(since.share)} para ti)</>}
              {" · "}{since.conversations} {since.conversations === 1 ? "conversa nova" : "conversas novas"} no WhatsApp
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const TONE = {
  alerta: { label: "Alerta", icon: AlertTriangle, iconClass: "bg-red-50 text-red-600", ring: "border-red-100" },
  oportunidade: { label: "Oportunidade", icon: Lightbulb, iconClass: "bg-[#D4AF37]/15 text-[#D4AF37]", ring: "border-[#D4AF37]/30" },
  bom: { label: "Bom sinal", icon: TrendingUp, iconClass: "bg-emerald-50 text-emerald-600", ring: "border-emerald-100" },
} as const;
const TONE_TEXT = { alerta: "text-red-700", oportunidade: "text-[#8B6914]", bom: "text-emerald-700" } as const;

export function InsightList({ insights }: { insights: Insight[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? insights : insights.slice(0, 6);
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-playfair text-lg font-bold text-navy">
            <Lightbulb className="w-5 h-5" style={{ color: GOLD }} aria-hidden="true" /> Dicas para crescer
          </h3>
          <p className="text-xs text-gray-500">Calculadas com os teus números, e voltam a ser calculadas a cada atualização. São sugestões.</p>
        </div>
      </div>
      {insights.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">Tudo dentro do normal: nada que valha um alerta agora.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {shown.map(i => {
            const t = TONE[i.tone];
            return (
              <article key={i.id} className={`rounded-2xl border bg-white p-4 flex gap-3 ${t.ring}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.iconClass}`}><t.icon className="w-[18px] h-[18px]" aria-hidden="true" /></span>
                <div className="min-w-0 space-y-1">
                  <p className={`text-[10.5px] font-bold uppercase tracking-wider ${TONE_TEXT[i.tone]}`}>{t.label}</p>
                  <h4 className="text-sm font-bold text-navy leading-snug">{i.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{i.detail}</p>
                  {i.action && (
                    <p className="flex gap-1.5 text-sm font-medium text-navy pt-0.5">
                      <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{i.action}</span>
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {insights.length > 6 && (
        <button onClick={() => setAll(v => !v)} className="text-sm font-medium text-navy underline underline-offset-2">
          {all ? "Mostrar menos" : `Ver mais ${insights.length - 6}`}
        </button>
      )}
    </section>
  );
}

export function RecentClosingsList({ rows, now, newSince }: { rows: LiveClosing[]; now: Date; newSince: number | null }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-navy"><Receipt className="w-4 h-4" aria-hidden="true" /> Últimos fechos</h3>
      {rows.length === 0 ? <p className="text-sm text-gray-500">Ainda sem fechos.</p> : (
        <ul className="divide-y divide-gray-100">
          {rows.map((r, i) => {
            const isNew = newSince !== null && Date.parse(r.booked_at!) > newSince;
            const place = r.locality || r.city;
            return (
              <li key={r.id ?? i} className="py-2.5 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-navy font-medium line-clamp-1">{r.description || "Serviço"}</p>
                  <p className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span>{timeAgo(r.booked_at!, now)}</span>
                    {place && <span>· {place}</span>}
                    {r.source === "Google Ads" && <span className="rounded bg-blue-50 px-1.5 py-px font-semibold text-blue-700">Google Ads</span>}
                    {r.source === "Meta Ads" && <span className="rounded bg-indigo-50 px-1.5 py-px font-semibold text-indigo-700">Meta Ads</span>}
                    {isNew && <span className="rounded px-1.5 py-px font-bold text-[#0B2F2A]" style={{ background: GOLD }}>novo</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-navy tabular-nums">{euro(serviceTotal(r))}</p>
                  <p className="text-[11px] text-gray-500 tabular-nums">{euro(Number(r.my_cut) || 0)} para ti</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function CampaignList({ campaigns }: { campaigns: CampaignTrend[] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-navy"><Megaphone className="w-4 h-4" aria-hidden="true" /> Campanhas do Google Ads</h3>
      {campaigns.length === 0 ? <p className="text-sm text-gray-500">Sem gasto registado.</p> : (
        <ul className="divide-y divide-gray-100">
          {campaigns.map(c => {
            const cpc = c.clicks7 ? c.cost7 / c.clicks7 : null;
            const cpcPrev = c.clicksPrev7 ? c.costPrev7 / c.clicksPrev7 : null;
            const cpcChange = cpc !== null && cpcPrev ? cpc / cpcPrev - 1 : null;
            return (
              <li key={c.name} className="py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-navy">{campaignLabel(c.name)}</p>
                  <p className="text-sm font-bold text-navy tabular-nums shrink-0">{euro(c.cost7)}</p>
                </div>
                <p className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                  <span>{c.clicks7} cliques em 7 dias</span>
                  {cpc !== null && <span className="flex items-center gap-1">{euro2(cpc)}/clique <DeltaPill value={cpcChange} goodWhenUp={false} small /></span>}
                  <span>{one(c.conversions7)} conversões Google</span>
                  <span>· {euro(c.cost)} desde {dm(ADS_FROM)}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[11px] text-gray-500">€/clique comparado com os 7 dias anteriores. As "conversões" do Google são cliques no WhatsApp e formulários, não clientes.</p>
    </section>
  );
}
