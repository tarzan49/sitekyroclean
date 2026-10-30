import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, lisbonDay, serviceTotal } from "@/lib/crmClosings";
import { syncCalendarIntoCrm } from "@/lib/crmCalendarSync";
import { ADS_FROM, adsExtra, buildWeeks, ORGANIC_FROM, ORGANIC_TO, organicBaseline, type WeeklyConversationRow } from "@/lib/adsVsOrganic";
import {
  campaignTrends, conversationFactor, liveWeek, recentClosings, SERVER_CONVERSATIONS_FROM, sinceVisit, withConversationEstimates,
  type LiveClosing, type ServerConversation, type WeekWithEstimate,
} from "@/lib/growthLive";
import { costPerExtraRequest, growthInsights, recentWindow } from "@/lib/growthInsights";
import { AdsHero, CampaignList, InsightList, LiveWeekCard, RecentClosingsList, SinceVisitStrip } from "./growth/LiveCards";
import WeekExplorer from "./growth/WeekExplorer";
import GrowthSimulator from "./growth/GrowthSimulator";
import DailyClosings from "./growth/DailyClosings";
import { dm, euro, one, pct } from "./growth/format";

// Separador "Crescimento" do painel (dono, 2026-10-17: "quero apenas dados que me
// farão crescer e tirar boas conclusões de crescimento"; mais tarde no mesmo dia:
// "um excelente design, que me faça ter noção dos dados de uma forma mais
// interativa e que vá constantemente dando updates e dicas de melhoria e
// crescimento"). Abre aqui e atualiza-se sozinho a cada 5 minutos com a página
// aberta e visível.
//
// Uma conta só: pedidos de orçamento × taxa de fecho × ticket médio = faturado,
// menos o gasto em anúncios, comparado com a média de agosto e setembro antes dos
// anúncios (contas em src/lib/adsVsOrganic.ts). A semana em curso compara com a
// semana passada à mesma hora (src/lib/growthLive.ts) e as dicas saem de regras
// fixas sobre estes números (src/lib/growthInsights.ts).

interface AdsRow { stat_date: string; cost: number; clicks: number; conversions: number; campaign_name: string }

const REFRESH_MS = 5 * 60_000;
const LAST_VISIT_KEY = "kyro.growth.lastVisit";
/** As conversas do servidor bastam das últimas 9 semanas: a razão usa 4 semanas completas. */
const SERVER_WINDOW_DAYS = 63;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Query = any;
/** Lê todas as linhas, em páginas de 1000 (o limite do Supabase por pedido). */
async function fetchAll<T>(make: () => Query, page = 1000): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += page) {
    const { data, error } = await make().range(from, from + page - 1);
    if (error) throw error;
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < page) return out;
  }
}

function readLastVisit(): number | null {
  try {
    const v = Number(window.localStorage.getItem(LAST_VISIT_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch { return null; }
}
function writeLastVisit(ms: number) {
  try { window.localStorage.setItem(LAST_VISIT_KEY, String(ms)); } catch { /* sem armazenamento: só perde o "desde a última visita" */ }
}

function useTicker(ms: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), ms); return () => window.clearInterval(id); }, [ms]);
  return now;
}

interface Loaded {
  at: Date;
  closings: LiveClosing[];
  ads: AdsRow[];
  weekly: WeeklyConversationRow[];
  server: ServerConversation[];
}

const GrowthPanel = () => {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fresh, setFresh] = useState<{ count: number; billed: number } | null>(null);
  // A visita anterior lê-se uma vez ao abrir; a desta fica gravada para a próxima.
  const [prevVisit] = useState<number | null>(() => { const v = readLastVisit(); writeLastVisit(Date.now()); return v; });
  const lastLoadRef = useRef<number | null>(null);
  const inFlight = useRef(false);
  const tick = useTicker(30_000);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    const db = supabase as Query;
    const fetchServices = () => fetchAll<LiveClosing>(() => db.from("service_requests").select("*"));
    try {
      let rows = await fetchServices();
      // Os fechos do calendário só entram no CRM quando alguém o sincroniza: faz-se aqui também.
      try {
        const result = await syncCalendarIntoCrm(rows as unknown as Parameters<typeof syncCalendarIntoCrm>[0]);
        if (result.status === "done" && result.changed) rows = await fetchServices();
        setSyncNote(result.status === "not-configured" ? "Google Calendar por ligar: os fechos podem estar incompletos." : null);
      } catch (e: unknown) {
        setSyncNote(`Não foi possível ler o calendário agora (${e instanceof Error ? e.message : String(e)}): os fechos podem estar incompletos.`);
      }
      const at = new Date();
      const serverFrom = [SERVER_CONVERSATIONS_FROM, addDays(lisbonDay(at), -SERVER_WINDOW_DAYS)].sort().pop()!;
      const [weekly, ads, server] = await Promise.all([
        fetchAll<WeeklyConversationRow>(() => db.from("whatsapp_weekly_stats").select("week, source, new_people, people_wrote, counted_at")),
        fetchAll<AdsRow>(() => db.from("ads_daily_stats").select("stat_date, cost, clicks, conversions, campaign_name")),
        fetchAll<ServerConversation>(() => db.from("whatsapp_conversations").select("first_at, started_by_us, origin, updated_at").gte("first_at", `${serverFrom}T00:00:00Z`)),
      ]);
      // Fechos que entraram desde a atualização anterior (não na primeira).
      if (lastLoadRef.current !== null) {
        const since = lastLoadRef.current;
        const added = rows.filter(r => r.booked_at && Date.parse(r.booked_at) > since && ((Number(r.billed_value) || 0) > 0 || (Number(r.upsell_value) || 0) > 0));
        setFresh(added.length ? { count: added.length, billed: added.reduce((s, r) => s + serviceTotal(r), 0) } : null);
      }
      lastLoadRef.current = at.getTime();
      setLoaded({
        at,
        closings: rows,
        weekly,
        server,
        ads: ads.map(x => ({ ...x, cost: Number(x.cost) || 0, clicks: Number(x.clicks) || 0, conversions: Number(x.conversions) || 0 })),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  // Sozinho: a cada 5 minutos com a página visível, e ao voltar à página se já passaram 2 minutos.
  useEffect(() => {
    const visible = () => typeof document === "undefined" || document.visibilityState === "visible";
    const id = window.setInterval(() => { if (visible()) load(); }, REFRESH_MS);
    const onVisible = () => { if (visible() && lastLoadRef.current !== null && Date.now() - lastLoadRef.current > 2 * 60_000) load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [load]);

  const data = useMemo(() => {
    if (!loaded) return null;
    const { at, closings, ads, weekly, server } = loaded;
    const factor = conversationFactor(weekly, server, at);
    const weeks: WeekWithEstimate[] = withConversationEstimates(buildWeeks(closings, ads, weekly, ORGANIC_FROM, at), server, factor, at);
    const base = organicBaseline(weeks);
    const extra = adsExtra(weeks, base);
    const live = liveWeek({ closings, spend: ads, server, factor, now: at });
    const campaigns = campaignTrends(ads, ADS_FROM, at);
    const insights = growthInsights({ weeks, base, extra, live, campaigns, now: at });
    const win = recentWindow(weeks);
    return { weeks, base, extra, live, campaigns, insights, win, cpr: costPerExtraRequest(extra.rows), recent: recentClosings(closings), since: prevVisit ? sinceVisit(closings, server, prevVisit, at) : null };
  }, [loaded, prevVisit]);

  if (error && !data) return <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">Crescimento: {error}</div>;
  if (!data || !loaded) return <p className="text-sm text-gray-500">A carregar…</p>;
  const { weeks, base, extra, live, campaigns, insights, win, cpr, recent, since } = data;
  const isOrganic = (week: string) => week >= ORGANIC_FROM && addDays(week, 6) <= ORGANIC_TO;
  const rateOf = (w: WeekWithEstimate) => (w.newPeople ? w.closings / w.newPeople : null);
  const ticketOf = (w: WeekWithEstimate) => (w.closings ? w.billed / w.closings : null);
  const baseRate = base.newPeople ? base.closings / base.newPeople : null;
  const baseTicket = base.closings ? base.billed / base.closings : null;
  const minutesAgo = Math.max(0, Math.floor((tick.getTime() - loaded.at.getTime()) / 60_000));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-navy">Crescimento</h2>
          <p className="text-sm text-gray-500">Pedidos × taxa de fecho × ticket, e o que os anúncios trazem a mais do que agosto e setembro.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-gray-600" title="Atualiza sozinho a cada 5 minutos com a página aberta">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Ao vivo · {minutesAgo === 0 ? "atualizado agora" : `há ${minutesAgo} min`}
          </span>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white text-navy hover:border-navy/30">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /> Atualizar
          </button>
        </div>
      </div>
      {syncNote && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">{syncNote}</p>}
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">A última atualização falhou ({error}); estás a ver os números de há {minutesAgo} min.</p>}

      <SinceVisitStrip since={since && since.hours >= 2 / 60 ? since : null} fresh={fresh} />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2"><AdsHero rows={extra.rows} total={extra.total} /></div>
        <div className="lg:col-span-3"><LiveWeekCard live={live} /></div>
      </div>

      <DailyClosings rows={loaded.closings} now={tick} />

      <InsightList insights={insights} />

      <WeekExplorer weeks={weeks} base={base} extraRows={extra.rows} />

      <GrowthSimulator win={win} costPerExtraRequest={cpr} />

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentClosingsList rows={recent} now={tick} newSince={prevVisit} />
        <CampaignList campaigns={campaigns} />
      </div>

      <details className="group rounded-2xl border border-gray-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-sm font-bold text-navy">
          Tabela semana a semana
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="px-4 pb-4 space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] text-gray-500">
                <th className="py-1 pr-3">Semana</th><th className="pr-3">Gasto</th><th className="pr-3">Pedidos</th><th className="pr-3">Escreveram</th>
                <th className="pr-3">Fechos</th><th className="pr-3">Taxa</th><th className="pr-3">Ticket</th><th className="pr-3">Faturado</th><th>Para ti</th>
              </tr></thead>
              <tbody>
                {[...weeks].reverse().map(w => (
                  <tr key={w.week} className={`border-t border-gray-100 ${isOrganic(w.week) ? "text-gray-600" : ""}`}>
                    <td className="py-1.5 pr-3 whitespace-nowrap">{dm(w.week)}{w.daysElapsed < 7 ? <span className="text-[10px] text-gray-500"> (em curso)</span> : null}</td>
                    <td className="pr-3">{euro(w.spend)}</td>
                    <td className="pr-3 font-semibold">{w.newPeople ?? "–"}{w.requestsEstimated ? <span className="text-[10px] font-normal text-gray-500"> est.</span> : null}</td>
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
        </div>
      </details>

      <p className="text-[11px] text-gray-500 leading-relaxed">
        Média orgânica = média das {base.weeks} semanas de {dm(ORGANIC_FROM)} a {dm(ORGANIC_TO)}, antes dos anúncios (a de 21/09 fica de fora: os anúncios começaram no sábado 26/09). Tudo o que uma semana com anúncios tem acima dela conta como trazido pelos anúncios, marcado com "(anúncio)" ou não; o orgânico já estava a crescer, por isso parte disso pode ser esse crescimento.
        Pedidos de orçamento = pessoas que te escreveram pela primeira vez nessa semana, contadas no WhatsApp Web às segundas; a semana em curso (e uma semana ainda por contar) é uma estimativa do servidor do bot, que perde cerca de 20% das conversas e por isso é corrigida pela razão das últimas semanas.
        Fechos, faturado e "para ti" vêm do CRM, pela semana em que o serviço foi fechado; revisitas a 0€ não contam. Taxa de fecho = fechos ÷ pedidos de orçamento. "Para ti" é a tua parte em cada serviço, sem a tua parte nos upsells. O gasto é só o do Google Ads.
      </p>
    </div>
  );
};

export default GrowthPanel;
