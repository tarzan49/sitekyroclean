import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addDays } from "@/lib/crmClosings";
import type { ServiceRow } from "@/lib/googleAdsResults";
import { computeServiceRanking, computeWeeklyReview, RANKING_MIN_CONTACTS, type RankingClient, type ServiceRankRow, type WeekRow } from "@/lib/weeklyReview";

// Aba "Métricas" do CRM (dono, 2026-10-13: "consegues colocar estas métricas
// dentro do admin panel numa aba do CRM?", "eu tenho que fechar mais"). Os
// mesmos números da revisão de segunda-feira do email (weeklyReview.ts), mais a
// meta de 70% de fecho por serviço: quantos fechos faltavam para lá chegar.

const GOAL = 0.7;
const WEEKS = 12;
const WINDOWS = [30, 60, 90, 180] as const;

const euro = (n: number | null) => (n === null ? "–" : `${Math.round(n).toLocaleString("pt-PT")}€`);
const pct = (r: number) => `${Math.round(r * 100)}%`;
const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

function Delta({ cur, prev, unit = "", lowerIsBetter = false }: { cur: number | null; prev: number | null; unit?: string; lowerIsBetter?: boolean }) {
  if (cur === null || prev === null) return null;
  const d = Math.round(cur - prev);
  if (d === 0) return <span className="text-xs text-gray-400">igual à anterior</span>;
  const good = lowerIsBetter ? d < 0 : d > 0;
  return <span className={`text-xs font-semibold ${good ? "text-emerald-600" : "text-red-600"}`}>{d > 0 ? "+" : ""}{d.toLocaleString("pt-PT")}{unit} vs anterior</span>;
}

/** Fechos que faltavam para a taxa chegar à meta, com os mesmos contactos. */
const missingForGoal = (r: ServiceRankRow) => Math.max(0, Math.ceil(GOAL * r.contacts - r.closed));

const CrmWeekly = ({ records }: { records: ServiceRow[] }) => {
  const [clients, setClients] = useState<(RankingClient & { from_google_ads: boolean })[] | null>(null);
  const [adsStats, setAdsStats] = useState<{ stat_date: string; cost: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<(typeof WINDOWS)[number]>(90);

  useEffect(() => {
    // Os tipos gerados do Supabase não conhecem estas tabelas: mesmo padrão das outras abas.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    Promise.all([
      sb.from("clients").select("phone, status, services, first_contact_at, from_google_ads"),
      sb.from("ads_daily_stats").select("stat_date, cost"),
    ]).then(([c, a]) => {
      if (c.error) setError(`Fichas de clientes: ${c.error.message}`);
      else setClients(c.data ?? []);
      if (!a.error) setAdsStats(a.data ?? []);
    });
  }, []);

  const now = useMemo(() => new Date(), []);
  const weeks: WeekRow[] = useMemo(
    () => computeWeeklyReview({ services: records, clients: clients ?? [], adsStats }, now, WEEKS),
    [records, clients, adsStats, now],
  );
  const ranking = useMemo(
    () => (clients ? computeServiceRanking({ services: records, clients }, now, days) : []),
    [records, clients, now, days],
  );

  const last = weeks[weeks.length - 1];
  const prev = weeks[weeks.length - 2] ?? null;
  const ranked = ranking.filter(r => r.contacts >= RANKING_MIN_CONTACTS);
  const bestRate = ranked[0];
  const bestValue = [...ranked].filter(r => r.valuePerContact !== null).sort((a, b) => b.valuePerContact! - a.valuePerContact!)[0];

  const cards = last && [
    { label: "Fechos da semana", value: String(last.closes), sub: `${euro(last.billed)} faturado · ${euro(last.share)} teus`, delta: <Delta cur={last.closes} prev={prev?.closes ?? null} /> },
    { label: "Ticket médio", value: euro(last.ticket), sub: "faturado ÷ fechos", delta: <Delta cur={last.ticket} prev={prev?.ticket ?? null} unit="€" /> },
    {
      label: "Custo por cliente Google",
      value: last.spend ? euro(last.costPerGoogleClient) : "–",
      sub: last.spend ? `${last.googleCloses} clientes · ${euro(last.spend)} gastos` : "sem gasto nesta semana",
      delta: <Delta cur={last.costPerGoogleClient} prev={prev?.costPerGoogleClient ?? null} unit="€" lowerIsBetter />,
    },
    { label: "Avaliações novas", value: "Conta na ficha", sub: "ainda não há registo com data", delta: null },
  ];

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      {last && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-navy">Última semana completa · {dm(last.week)} a {dm(addDays(last.week, 6))}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards!.map(c => (
              <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
                <p className="text-xl font-bold text-navy">{c.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.sub}</p>
                <div className="mt-1">{c.delta}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-navy">Taxa de fecho por serviço · meta {pct(GOAL)}</h3>
          <div className="flex gap-1" role="group" aria-label="Janela">
            {WINDOWS.map(w => (
              <button key={w} onClick={() => setDays(w)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${days === w ? "border-[#D4AF37] bg-[#D4AF37]/10 text-navy" : "border-gray-200 text-gray-500 hover:text-navy"}`}>
                {w} dias
              </button>
            ))}
          </div>
        </div>
        {bestRate && (
          <p className="text-sm text-gray-600">
            Maior taxa: <strong>{bestRate.service}</strong> ({pct(bestRate.rate)}).
            {bestValue && <> Mais dinheiro por conversa: <strong>{bestValue.service}</strong> ({euro(bestValue.valuePerContact)}).</>}
          </p>
        )}
        {!clients && !error && <p className="text-sm text-gray-400">A carregar as fichas…</p>}
        {clients && (
          <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                <tr>
                  {["#", "Serviço", "Contactos", "Fecharam", "Taxa", "Até 70%", "Ticket", "Valor/contacto"].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranking.map(r => {
                  const pos = r.contacts >= RANKING_MIN_CONTACTS ? ranked.indexOf(r) + 1 : null;
                  const missing = missingForGoal(r);
                  return (
                    <tr key={r.service} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-bold text-navy">{pos ?? "–"}</td>
                      <td className="px-3 py-2 font-semibold text-navy whitespace-nowrap">{r.service}</td>
                      <td className="px-3 py-2">{r.contacts}</td>
                      <td className="px-3 py-2">{r.closed}</td>
                      <td className="px-3 py-2 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${r.rate >= GOAL ? "text-emerald-600" : "text-navy"}`}>{pct(r.rate)}</span>
                          <div className="relative h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-[#D4AF37] rounded-full" style={{ width: `${Math.min(100, r.rate * 100)}%` }} />
                            <div className="absolute inset-y-0 w-px bg-navy/60" style={{ left: `${GOAL * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{missing ? `+${missing} fechos` : "atingida"}</td>
                      <td className="px-3 py-2">{euro(r.ticket)}</td>
                      <td className="px-3 py-2 font-semibold">{euro(r.valuePerContact)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-gray-500">
          Contactos = fichas com essa etiqueta e o primeiro contacto nos últimos {days} dias; um contacto conta em cada serviço que pediu.
          Fechou = cliente ou marcado, ou serviço no CRM com esse telefone. "Até 70%" = fechos que faltavam com os mesmos contactos.
          Ticket = linhas do CRM só desse serviço. Com menos de {RANKING_MIN_CONTACTS} contactos o serviço fica sem posição. Depende das etiquetas do WhatsApp estarem em dia.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-navy">Últimas {WEEKS} semanas</h3>
        <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
              <tr>
                {["Semana", "Fechos", "Faturado", "Teu", "Ticket", "Gasto Google", "Clientes Google", "Custo/cliente"].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...weeks].reverse().map(w => (
                <tr key={w.week} className={`border-t border-gray-100 ${w === last ? "font-bold" : ""}`}>
                  <td className="px-3 py-2 whitespace-nowrap">{dm(w.week)}</td>
                  <td className="px-3 py-2">{w.closes}</td>
                  <td className="px-3 py-2">{euro(w.billed)}</td>
                  <td className="px-3 py-2 text-gold">{euro(w.share)}</td>
                  <td className="px-3 py-2">{euro(w.ticket)}</td>
                  <td className="px-3 py-2">{w.spend ? euro(w.spend) : "–"}</td>
                  <td className="px-3 py-2">{w.spend || w.googleCloses ? w.googleCloses : "–"}</td>
                  <td className="px-3 py-2">{euro(w.costPerGoogleClient)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500">
          Semana de segunda a domingo, pelo dia em que o serviço foi fechado. Antes de 26/09 conta o dia em que a linha entrou no CRM, por isso essas semanas são aproximadas.
          Cliente Google = "(anúncio)" no calendário ou contacto que veio do anúncio.
        </p>
      </section>
    </div>
  );
};

export default CrmWeekly;
