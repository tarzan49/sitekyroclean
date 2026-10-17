import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, lisbonDay } from "@/lib/crmClosings";
import { syncCalendarIntoCrm } from "@/lib/crmCalendarSync";
import {
  ADS_FROM, adsExtra, buildWeeks, ORGANIC_FROM, ORGANIC_TO, organicBaseline,
  type ClosingInput, type WeekStats, type WeeklyConversationRow,
} from "@/lib/adsVsOrganic";

// Separador "Crescimento" do painel (dono, 2026-10-17: "quero apenas dados que me
// farão crescer e tirar boas conclusões de crescimento"). Abre aqui. Uma conta só:
// pedidos de orçamento × taxa de fecho × ticket médio = faturado, menos o gasto em
// anúncios, comparado com a média de agosto e setembro antes dos anúncios. Tudo o
// que uma semana com anúncios tem acima dessa média conta como trazido pelos
// anúncios (dono: não só os marcados com "(anúncio)"). Contas em src/lib/adsVsOrganic.ts.

interface AdsRow { stat_date: string; cost: number; clicks: number; conversions: number; campaign_name: string }

const euro = (n: number) => `${Math.round(n).toLocaleString("pt-PT")}€`;
const signed = (n: number, unit = "") => `${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n)).toLocaleString("pt-PT")}${unit}`;
const one = (n: number) => n.toLocaleString("pt-PT", { maximumFractionDigits: 1 });
const pct = (n: number | null) => (n === null ? "–" : `${Math.round(n * 100)}%`);
const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;
/** Fechos ÷ pedidos de orçamento da mesma semana. */
const rateOf = (w: Pick<WeekStats, "closings" | "newPeople">) => (w.newPeople ? w.closings / w.newPeople : null);
const ticketOf = (w: Pick<WeekStats, "closings" | "billed">) => (w.closings ? w.billed / w.closings : null);

function Stat({ label, value, organic, previous }: { label: string; value: string; organic: string; previous: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white">
      <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-navy">{value}</p>
      <p className="text-[11px] text-gray-500">média orgânica {organic}</p>
      <p className="text-[11px] text-gray-500">semana anterior {previous}</p>
    </div>
  );
}

const GrowthPanel = () => {
  const [closings, setClosings] = useState<ClosingInput[] | null>(null);
  const [ads, setAds] = useState<AdsRow[]>([]);
  const [conversations, setConversations] = useState<WeeklyConversationRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const fetchServices = async () => {
      const { data, error: err } = await db.from("service_requests").select("*");
      if (err) throw err;
      return data ?? [];
    };
    try {
      let rows = await fetchServices();
      // Os fechos do calendário só entram no CRM quando alguém o sincroniza: faz-se aqui também.
      try {
        const result = await syncCalendarIntoCrm(rows);
        if (result.status === "done" && result.changed) rows = await fetchServices();
        setSyncNote(result.status === "not-configured" ? "Google Calendar por ligar: os fechos podem estar incompletos." : null);
      } catch (e: unknown) {
        setSyncNote(`Não foi possível ler o calendário agora (${e instanceof Error ? e.message : String(e)}): os fechos podem estar incompletos.`);
      }
      const [w, a] = await Promise.all([
        db.from("whatsapp_weekly_stats").select("week, source, new_people, people_wrote, counted_at"),
        db.from("ads_daily_stats").select("stat_date, cost, clicks, conversions, campaign_name"),
      ]);
      if (w.error) throw w.error;
      if (a.error) throw a.error;
      setClosings(rows);
      setConversations(w.data ?? []);
      setAds((a.data ?? []).map((x: AdsRow) => ({ ...x, cost: Number(x.cost) || 0, clicks: Number(x.clicks) || 0, conversions: Number(x.conversions) || 0 })));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const data = useMemo(() => {
    if (!closings) return null;
    const weeks = buildWeeks(closings, ads, conversations, ORGANIC_FROM);
    const base = organicBaseline(weeks);
    const extra = adsExtra(weeks, base);
    const done = weeks.filter(w => w.daysElapsed >= 7);
    const last = done[done.length - 1] ?? null;
    const prev = done[done.length - 2] ?? null;
    const lastExtra = last ? extra.rows.find(r => r.week === last.week) ?? null : null;
    const prevExtra = prev ? extra.rows.find(r => r.week === prev.week) ?? null : null;
    // Campanhas do Google: os últimos 7 dias e desde que os anúncios começaram.
    const today = lisbonDay(new Date());
    const since7 = addDays(today, -6);
    const byCampaign = new Map<string, { name: string; cost7: number; clicks7: number; conv7: number; cost: number; clicks: number; conv: number }>();
    for (const r of ads) {
      if (r.stat_date < ADS_FROM) continue;
      const c = byCampaign.get(r.campaign_name) ?? { name: r.campaign_name, cost7: 0, clicks7: 0, conv7: 0, cost: 0, clicks: 0, conv: 0 };
      c.cost += r.cost; c.clicks += r.clicks; c.conv += r.conversions;
      if (r.stat_date >= since7) { c.cost7 += r.cost; c.clicks7 += r.clicks; c.conv7 += r.conversions; }
      byCampaign.set(r.campaign_name, c);
    }
    const campaigns = [...byCampaign.values()].filter(c => c.cost > 0).sort((a, b) => b.cost7 - a.cost7 || b.cost - a.cost);
    return { weeks, base, extra, last, prev, lastExtra, prevExtra, campaigns };
  }, [closings, ads, conversations]);

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">Crescimento: {error}</div>;
  if (!data) return <p className="text-sm text-gray-500">A carregar…</p>;
  const { weeks, base, extra, last, prev, lastExtra, prevExtra, campaigns } = data;
  const isOrganic = (week: string) => week >= ORGANIC_FROM && addDays(week, 6) <= ORGANIC_TO;
  const baseRate = base.newPeople ? base.closings / base.newPeople : null;
  const baseTicket = base.closings ? base.billed / base.closings : null;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-playfair text-xl font-bold text-navy">Crescimento</h2>
          <p className="text-sm text-gray-500">Pedidos de orçamento × taxa de fecho × ticket médio, e o que os anúncios trazem a mais do que agosto e setembro.</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-navy hover:border-navy/30">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </button>
      </div>
      {syncNote && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">{syncNote}</p>}

      {last && (
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-navy">Última semana completa: {dm(last.week)} a {dm(addDays(last.week, 6))}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <Stat label="Pedidos de orçamento" value={last.newPeople === null ? "–" : String(last.newPeople)}
              organic={base.newPeople === null ? "–" : one(base.newPeople)} previous={prev?.newPeople == null ? "–" : String(prev.newPeople)} />
            <Stat label="Fechos" value={String(last.closings)} organic={one(base.closings)} previous={prev ? String(prev.closings) : "–"} />
            <Stat label="Taxa de fecho" value={pct(rateOf(last))} organic={pct(baseRate)} previous={prev ? pct(rateOf(prev)) : "–"} />
            <Stat label="Ticket médio" value={ticketOf(last) === null ? "–" : euro(ticketOf(last)!)} organic={baseTicket === null ? "–" : euro(baseTicket)} previous={prev && ticketOf(prev) !== null ? euro(ticketOf(prev)!) : "–"} />
            <Stat label="Para ti" value={euro(last.share)} organic={euro(base.share)} previous={prev ? euro(prev.share) : "–"} />
            <Stat label="Lucro dos anúncios" value={lastExtra ? signed(lastExtra.profit, "€") : "–"} organic="0€" previous={prevExtra ? signed(prevExtra.profit, "€") : "–"} />
          </div>
        </section>
      )}

      <section className="border border-gray-200 rounded-xl p-4 space-y-2 bg-white">
        <h3 className="text-sm font-bold text-navy">Por semana</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] text-gray-500">
              <th className="py-1 pr-3">Semana</th><th className="pr-3">Gasto anúncios</th><th className="pr-3">Pedidos de orçamento</th><th className="pr-3">Todas que escreveram</th>
              <th className="pr-3">Fechos</th><th className="pr-3">Taxa de fecho</th><th className="pr-3">Ticket médio</th><th className="pr-3">Faturado</th><th>Para ti</th>
            </tr></thead>
            <tbody>
              {[...weeks].reverse().map(w => (
                <tr key={w.week} className={`border-t border-gray-100 ${isOrganic(w.week) ? "text-gray-600" : ""}`}>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{dm(w.week)}{w.daysElapsed < 7 ? <span className="text-[10px] text-gray-500"> (em curso)</span> : null}</td>
                  <td className="pr-3">{w.spend ? euro(w.spend) : "0€"}</td>
                  <td className="pr-3 font-semibold">{w.newPeople ?? "–"}{w.conversationsSource === "servidor" ? <span className="text-[10px] font-normal text-gray-500"> prov.</span> : null}</td>
                  <td className="pr-3">{w.peopleWrote ?? "–"}</td>
                  <td className="pr-3 font-semibold">{w.closings}</td>
                  <td className="pr-3">{pct(rateOf(w))}</td>
                  <td className="pr-3">{ticketOf(w) === null ? "–" : euro(ticketOf(w)!)}</td>
                  <td className="pr-3">{euro(w.billed)}</td>
                  <td>{euro(w.share)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-navy/20 font-semibold text-navy bg-gray-50">
                <td className="py-1.5 pr-3">Média orgânica</td>
                <td className="pr-3">0€</td>
                <td className="pr-3">{base.newPeople === null ? "–" : one(base.newPeople)}</td>
                <td className="pr-3">{base.peopleWrote === null ? "–" : one(base.peopleWrote)}</td>
                <td className="pr-3">{one(base.closings)}</td>
                <td className="pr-3">{pct(baseRate)}</td>
                <td className="pr-3">{baseTicket === null ? "–" : euro(baseTicket)}</td>
                <td className="pr-3">{euro(base.billed)}</td>
                <td>{euro(base.share)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Média orgânica = média das {base.weeks} semanas de {dm(ORGANIC_FROM)} a {dm(ORGANIC_TO)}, antes dos anúncios (a de 21/09 fica de fora: os anúncios começaram no sábado 26/09).
          Pedidos de orçamento = pessoas que te escreveram pela primeira vez nessa semana; todas que escreveram = novas e antigas, sem contactos guardados nem parceiros. Contados no WhatsApp Web todas as segundas; "prov." = contagem provisória.
          Fechos, faturado e "para ti" vêm do CRM, pela semana em que o serviço foi fechado; revisitas a 0€ não contam. Taxa de fecho = fechos ÷ pedidos de orçamento da mesma semana. "Para ti" é a tua parte em cada serviço, sem a tua parte nos upsells. O gasto é só o do Google Ads.
        </p>
      </section>

      <section className="border border-gray-200 rounded-xl p-4 space-y-2 bg-white">
        <h3 className="text-sm font-bold text-navy">O que os anúncios trouxeram a mais do que a média orgânica</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] text-gray-500">
              <th className="py-1 pr-3">Semana</th><th className="pr-3">Pedidos a mais</th><th className="pr-3">Fechos a mais</th><th className="pr-3">Faturado a mais</th>
              <th className="pr-3">A mais para ti</th><th className="pr-3">Gasto</th><th>Lucro dos anúncios</th>
            </tr></thead>
            <tbody>
              {[...extra.rows].reverse().map(r => (
                <tr key={r.week} className="border-t border-gray-100">
                  <td className="py-1.5 pr-3 whitespace-nowrap">{dm(r.week)}{r.partial ? <span className="text-[10px] text-gray-500"> (em curso)</span> : null}</td>
                  <td className="pr-3">{r.extraNewPeople === null ? "–" : signed(r.extraNewPeople)}</td>
                  <td className="pr-3">{signed(r.extraClosings)}</td>
                  <td className="pr-3">{signed(r.extraBilled, "€")}</td>
                  <td className="pr-3">{signed(r.extraShare, "€")}</td>
                  <td className="pr-3">{euro(r.spend)}</td>
                  <td className={`font-semibold ${r.profit >= 0 ? "text-emerald-700" : "text-red-600"}`}>{signed(r.profit, "€")}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-navy/20 font-semibold text-navy bg-gray-50">
                <td className="py-1.5 pr-3">Total desde {dm(ADS_FROM)}</td>
                <td className="pr-3">{extra.total.extraNewPeople === null ? "–" : signed(extra.total.extraNewPeople)}</td>
                <td className="pr-3">{signed(extra.total.extraClosings)}</td>
                <td className="pr-3">{signed(extra.total.extraBilled, "€")}</td>
                <td className="pr-3">{signed(extra.total.extraShare, "€")}</td>
                <td className="pr-3">{euro(extra.total.spend)}</td>
                <td className={extra.total.profit >= 0 ? "text-emerald-700" : "text-red-600"}>{signed(extra.total.profit, "€")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Tudo o que uma semana com anúncios tem acima da média orgânica conta como trazido pelos anúncios, marcado com "(anúncio)" ou não. Lucro = a mais para ti menos o gasto.
          Na semana em curso, a média conta só os dias que já passaram. O orgânico estava a crescer em agosto e setembro, por isso parte do que aparece "a mais" pode ser esse crescimento.
        </p>
      </section>

      {campaigns.length > 0 && (
        <section className="border border-gray-200 rounded-xl p-4 space-y-2 bg-white">
          <h3 className="text-sm font-bold text-navy">Campanhas do Google Ads</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] text-gray-500">
                <th className="py-1 pr-3">Campanha</th><th className="pr-3">Gasto 7 dias</th><th className="pr-3">Cliques 7 dias</th><th className="pr-3">€/clique</th>
                <th className="pr-3">Gasto desde {dm(ADS_FROM)}</th><th>Conversões Google desde {dm(ADS_FROM)}</th>
              </tr></thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.name} className="border-t border-gray-100">
                    <td className="py-1.5 pr-3">{c.name.replace(/^Kyro \| /, "").replace(/ \| Limpeza e Proteção de Sofás/, "")}</td>
                    <td className="pr-3">{euro(c.cost7)}</td>
                    <td className="pr-3">{c.clicks7}</td>
                    <td className="pr-3">{c.clicks7 ? `${(c.cost7 / c.clicks7).toFixed(2).replace(".", ",")}€` : "–"}</td>
                    <td className="pr-3">{euro(c.cost)}</td>
                    <td>{one(c.conv)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-500">As "conversões" do Google são cliques no WhatsApp e formulários, não clientes. Os clientes a mais estão na tabela de cima.</p>
        </section>
      )}
    </div>
  );
};

export default GrowthPanel;
