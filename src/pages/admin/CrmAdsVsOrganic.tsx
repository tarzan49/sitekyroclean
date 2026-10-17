import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addDays } from "@/lib/crmClosings";
import {
  ADS_FROM, adsExtra, buildWeeks, ORGANIC_FROM, ORGANIC_TO, organicBaseline,
  type ClosingInput, type SpendInput, type WeeklyConversationRow,
} from "@/lib/adsVsOrganic";

// Aba "Anúncios vs orgânico" do CRM (dono, 2026-10-17). Por semana: gasto, pedidos de
// orçamento, pessoas que escreveram, fechos, faturado e a parte do dono; a média de
// agosto e setembro antes dos anúncios; e o que cada semana com anúncios trouxe a
// mais do que essa média, com o lucro depois do gasto. Contas em src/lib/adsVsOrganic.ts.

const euro = (n: number) => `${Math.round(n).toLocaleString("pt-PT")}€`;
const signed = (n: number, unit = "") => `${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n)).toLocaleString("pt-PT")}${unit}`;
const one = (n: number) => n.toLocaleString("pt-PT", { maximumFractionDigits: 1 });
const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

const CrmAdsVsOrganic = () => {
  const [closings, setClosings] = useState<ClosingInput[] | null>(null);
  const [spend, setSpend] = useState<SpendInput[]>([]);
  const [conversations, setConversations] = useState<WeeklyConversationRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    Promise.all([
      sb.from("service_requests").select("booked_at, billed_value, upsell_value, my_cut").gte("booked_at", `${ORGANIC_FROM}T00:00:00Z`).limit(20000),
      sb.from("ads_daily_stats").select("stat_date, cost"),
      sb.from("whatsapp_weekly_stats").select("week, source, new_people, people_wrote, counted_at"),
    ]).then(([c, a, w]) => {
      if (c.error) setError(c.error.message); else setClosings(c.data ?? []);
      if (!a.error) setSpend((a.data ?? []).map((x: SpendInput) => ({ stat_date: x.stat_date, cost: Number(x.cost) })));
      if (!w.error) setConversations(w.data ?? []);
    });
  }, []);

  const data = useMemo(() => {
    if (!closings) return null;
    const weeks = buildWeeks(closings, spend, conversations, ORGANIC_FROM);
    const base = organicBaseline(weeks);
    const extra = adsExtra(weeks, base);
    return { weeks, base, extra };
  }, [closings, spend, conversations]);

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">Anúncios vs orgânico: {error}</div>;
  if (!data) return <p className="text-sm text-gray-500">A carregar…</p>;
  const { weeks, base, extra } = data;
  const isOrganic = (week: string) => week >= ORGANIC_FROM && addDays(week, 6) <= ORGANIC_TO;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Pedidos de orçamento a mais", value: extra.total.extraNewPeople === null ? "–" : signed(extra.total.extraNewPeople), sub: `média orgânica ${base.newPeople === null ? "–" : one(base.newPeople)} por semana` },
          { label: "Fechos a mais", value: signed(extra.total.extraClosings), sub: `média orgânica ${one(base.closings)} por semana` },
          { label: "A mais para ti", value: signed(extra.total.extraShare, "€"), sub: `faturado a mais ${signed(extra.total.extraBilled, "€")}` },
          { label: "Lucro dos anúncios", value: signed(extra.total.profit, "€"), sub: `depois de ${euro(extra.total.spend)} gastos` },
        ].map(c => (
          <div key={c.label} className="border border-gray-200 rounded-xl p-3">
            <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
            <p className="text-xl font-bold text-navy">{c.value}</p>
            <p className="text-[11px] text-gray-500">{c.sub}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-500 -mt-2">Desde {dm(ADS_FROM)}, contra a média de agosto e setembro antes dos anúncios.</p>

      <section className="border border-gray-200 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-navy">Por semana</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] text-gray-500">
              <th className="py-1 pr-3">Semana</th><th className="pr-3">Gasto anúncios</th><th className="pr-3">Pedidos de orçamento</th><th className="pr-3">Todas que escreveram</th>
              <th className="pr-3">Fechos</th><th className="pr-3">Faturado</th><th>Para ti</th>
            </tr></thead>
            <tbody>
              {weeks.map(w => (
                <tr key={w.week} className={`border-t border-gray-100 ${isOrganic(w.week) ? "text-gray-600" : ""}`}>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{dm(w.week)}{w.daysElapsed < 7 ? <span className="text-[10px] text-gray-500"> (em curso)</span> : null}</td>
                  <td className="pr-3">{w.spend ? euro(w.spend) : "0€"}</td>
                  <td className="pr-3 font-semibold">{w.newPeople ?? "–"}{w.conversationsSource === "servidor" ? <span className="text-[10px] font-normal text-gray-500"> prov.</span> : null}</td>
                  <td className="pr-3">{w.peopleWrote ?? "–"}</td>
                  <td className="pr-3 font-semibold">{w.closings}</td>
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
                <td className="pr-3">{euro(base.billed)}</td>
                <td>{euro(base.share)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Média orgânica = média das {base.weeks} semanas de {dm(ORGANIC_FROM)} a {dm(ORGANIC_TO)}, antes dos anúncios. A semana de 21/09 fica de fora das duas contas: os anúncios começaram no sábado 26/09.
          Pedidos de orçamento = pessoas que te escreveram pela primeira vez nessa semana; todas que escreveram = novas e antigas, sem contactos guardados no telemóvel nem parceiros (contadas no WhatsApp Web; "prov." = contagem provisória do servidor).
          Fechos, faturado e "para ti" vêm do CRM, pela semana em que o serviço foi fechado (as regras da aba Fechos); "para ti" é a tua parte em cada serviço, sem a tua parte nos upsells. O gasto é só o do Google Ads.
        </p>
      </section>

      <section className="border border-gray-200 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-navy">O que os anúncios trouxeram a mais do que a média orgânica</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] text-gray-500">
              <th className="py-1 pr-3">Semana</th><th className="pr-3">Pedidos a mais</th><th className="pr-3">Fechos a mais</th><th className="pr-3">Faturado a mais</th>
              <th className="pr-3">A mais para ti</th><th className="pr-3">Gasto</th><th>Lucro dos anúncios</th>
            </tr></thead>
            <tbody>
              {extra.rows.map(r => (
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
                <td className="py-1.5 pr-3">Total</td>
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
          Na semana em curso, a média conta só os dias que já passaram. O orgânico estava a crescer em agosto e setembro, por isso parte do que aparece "a mais" pode ser esse crescimento e não os anúncios.
        </p>
      </section>
    </div>
  );
};

export default CrmAdsVsOrganic;
