import { useState } from "react";
import { ADS_FROM, type ExtraWeek } from "@/lib/adsVsOrganic";
import type { MetaView, TotalView } from "@/lib/adsByChannel";
import { dm, dmy, euro, euro2, signedEuro } from "./format";

// Lucro dos anúncios por canal (dono, 2026-11-18: "ter lá o lucro de anúncios de
// Google e o lucro de anúncios Meta desde, e vais meter as datas. E eu consigo
// trocar entre um e o outro"). Três vistas: Google (critério de sempre, já sem o
// que a Meta trouxe), Meta (desde 18/11/2026) e Total. Em cada uma os números da
// conta aparecem antes do lucro; sem a Marketing API ligada o gasto Meta diz
// "por ligar", nunca 0€. Contas em src/lib/adsByChannel.ts.

const GOLD = "#D4AF37";
const OFF = "por ligar";

type Channel = "google" | "meta" | "total";
const CHANNELS: { id: Channel; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "meta", label: "Meta" },
  { id: "total", label: "Total" },
];

interface Props {
  google: { rows: ExtraWeek[]; total: Omit<ExtraWeek, "week" | "partial"> };
  meta: MetaView;
  total: TotalView;
}

function Stat({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-2.5 py-2 min-w-0">
      <p className="text-[10.5px] text-white/50 truncate">{label}</p>
      <p className={`text-sm font-bold tabular-nums truncate ${muted ? "text-amber-200/90 font-semibold" : ""}`}>{value}</p>
    </div>
  );
}

function Equation({ parts, result }: { parts: string[]; result: number | null }) {
  return (
    <p className="text-xs text-white/70 tabular-nums">
      {parts.join(" − ")} = <span className="font-semibold text-white">{result === null ? OFF : signedEuro(result)}</span>
    </p>
  );
}

function Headline({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>{label}</p>
      {value === null
        ? <p className="font-playfair text-2xl font-bold mt-1 text-amber-200">Gasto Meta {OFF}</p>
        : <p className={`font-playfair text-4xl font-bold mt-1 tabular-nums ${value >= 0 ? "text-emerald-300" : "text-red-300"}`}>{signedEuro(value)}</p>}
    </div>
  );
}

function WeekBars({ rows }: { rows: { week: string; partial: boolean; profit: number | null }[] }) {
  if (!rows.length) return null;
  const max = Math.max(1, ...rows.map(r => Math.abs(r.profit ?? 0)));
  return (
    <div className="space-y-1.5">
      <p className="text-[10.5px] text-white/50">Lucro por semana</p>
      {rows.map(r => (
        <div key={r.week} className="flex items-center gap-2 text-xs">
          <span className="w-11 shrink-0 text-white/60 tabular-nums">{dm(r.week)}</span>
          <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
            {r.profit !== null && <div className={`h-full rounded-full ${r.profit >= 0 ? "bg-emerald-400" : "bg-red-400"} ${r.partial ? "opacity-60" : ""}`} style={{ width: `${Math.max(3, (Math.abs(r.profit) / max) * 100)}%` }} />}
          </div>
          <span className="w-24 shrink-0 text-right font-semibold tabular-nums">
            {r.profit === null ? <span className="font-normal text-amber-200/90">{OFF}</span> : signedEuro(r.profit)}
            {r.profit !== null && r.partial && <span className="font-normal text-white/50"> até agora</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function GoogleView({ google, meta }: Pick<Props, "google" | "meta">) {
  const t = google.total;
  const perEuro = t.spend > 0 ? t.extraShare / t.spend : null;
  return (
    <>
      <Headline label={`Lucro dos anúncios Google desde ${dmy(ADS_FROM)}`} value={t.profit} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Gasto Google" value={euro(t.spend)} />
        <Stat label="A mais para ti" value={signedEuro(t.extraShare)} />
        <Stat label="Por cada 1€" value={perEuro === null ? "–" : euro2(perEuro)} />
      </div>
      <Equation parts={[`${signedEuro(t.extraShare)} a mais para ti`, `${euro(t.spend)} gasto Google`]} result={t.profit} />
      <WeekBars rows={google.rows} />
      <p className="text-[11px] text-white/50 leading-relaxed">
        Acima da média de agosto e setembro, já sem o gasto. Desde {dmy(meta.from)} a subida é sem os pedidos e os fechos da Meta
        ({meta.requests} pedidos, {meta.closings} fechos, {euro(meta.share)} para ti), para a Meta não inflacionar o Google.
      </p>
    </>
  );
}

function MetaPanel({ meta }: Pick<Props, "meta">) {
  const spend = meta.spend === null ? OFF : euro(meta.spend);
  return (
    <>
      <Headline label={`Lucro dos anúncios Meta desde ${dmy(meta.from)}`} value={meta.profit} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Stat label="Gasto Meta" value={spend} muted={meta.spend === null} />
        <Stat label="Pedidos Meta" value={String(meta.requests)} />
        <Stat label="Fechos Meta" value={String(meta.closings)} />
        <Stat label="Faturação" value={euro(meta.billed)} />
        <Stat label="Para ti" value={euro(meta.share)} />
        <Stat label="Custo por conversa" value={meta.costPerRequest === null ? (meta.spend === null ? OFF : "–") : euro2(meta.costPerRequest)} muted={meta.spend === null} />
        <Stat label="Custo por fecho" value={meta.costPerClosing === null ? (meta.spend === null ? OFF : "–") : euro2(meta.costPerClosing)} muted={meta.spend === null} />
      </div>
      <Equation parts={[`${euro(meta.share)} para ti`, `${spend} gasto Meta`]} result={meta.profit} />
      {meta.syncError && <p className="text-[11px] text-amber-200 bg-amber-200/10 border border-amber-200/20 rounded-lg px-2.5 py-1.5">A última leitura da Meta falhou: {meta.syncError}</p>}
      <p className="text-[11px] text-white/50 leading-relaxed">
        Só conta a partir de {dmy(meta.from)}: o gasto e os clientes de antes ficam para trás.
        Pedidos Meta = pessoas que escreveram pela primeira vez vindas de um anúncio da Meta (servidor do bot).
        Fechos Meta = fechos desses clientes no primeiro contacto ou depois (pelos últimos 9 dígitos do telefone) e os marcados "Meta Ads" no CRM, cada um uma vez{meta.byCrmOnly ? ` (${meta.byCrmOnly} só pela marca do CRM)` : ""}.
        {meta.connected
          ? ` A Meta conta ${meta.metaConversations ?? 0} conversas iniciadas e ${meta.clicks ?? 0} cliques.`
          : " O gasto chega da Marketing API de hora a hora, falta ligar o token com ads_read."}
      </p>
    </>
  );
}

function TotalPanel({ total }: Pick<Props, "total">) {
  const metaSpend = total.metaSpend === null ? OFF : euro(total.metaSpend);
  return (
    <>
      <Headline label={`Lucro dos anúncios, Google desde ${dmy(total.from)} e Meta desde ${dmy(total.metaFrom)}`} value={total.profit} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="A mais para ti" value={signedEuro(total.extraShare)} />
        <Stat label="Gasto Google" value={euro(total.googleSpend)} />
        <Stat label="Gasto Meta" value={metaSpend} muted={total.metaSpend === null} />
      </div>
      <Equation parts={[`${signedEuro(total.extraShare)} a mais para ti`, `${euro(total.googleSpend)} Google`, `${metaSpend} Meta`]} result={total.profit} />
      <WeekBars rows={total.rows} />
      <p className="text-[11px] text-white/50 leading-relaxed">Tudo o que ficou para ti acima da média de agosto e setembro, com os clientes do Google e da Meta, menos o gasto dos dois. Google + Meta = Total.</p>
    </>
  );
}

export default function AdsProfitCard({ google, meta, total }: Props) {
  const [channel, setChannel] = useState<Channel>("google");
  return (
    <section className="rounded-2xl bg-[#0B2F2A] text-white p-5 flex flex-col gap-4">
      <div className="flex rounded-full bg-white/5 border border-white/10 p-1" role="tablist" aria-label="Lucro dos anúncios por canal">
        {CHANNELS.map(c => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === channel}
            onClick={() => setChannel(c.id)}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${c.id === channel ? "text-navy" : "text-white/70 hover:text-white"}`}
            style={c.id === channel ? { background: GOLD } : undefined}
          >
            {c.label}
          </button>
        ))}
      </div>
      {channel === "google" && <GoogleView google={google} meta={meta} />}
      {channel === "meta" && <MetaPanel meta={meta} />}
      {channel === "total" && <TotalPanel total={total} />}
    </section>
  );
}
