import { useState, useCallback, useEffect } from "react";
import {
  RefreshCw, Trash2, Activity, TrendingUp, Users, DollarSign, Target,
  Clock, CheckCircle, Globe, Zap, Star, MessageCircle, Map, BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface QuizEvent {
  id: string;
  created_at: string;
  session_id: string;
  step: number;
  action: string;
  service: string | null;
  city: string | null;
  value: number | null;
  service_type: string | null;
  page_path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device: string | null;
}

interface QuizMetrics {
  totalStarts: number;
  totalCompletes: number;
  completionRate: number;
  avgValue: number;
  topService: string;
  topCity: string;
  stepFunnel: { step: number; label: string; count: number; rate: number }[];
  todayStarts: number;
  weekStarts: number;
  cityBreakdown: { city: string; count: number }[];
  pageBreakdown: { path: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  waClicks: number;
  waClicksBySource: { source: string; count: number }[];
  avgSessionSeconds: number;
}

interface WaChartPoint { date: Date; count: number; }
type WaRange = 30 | 90 | 365;
const WA_RANGES: { days: WaRange; label: string }[] = [
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
  { days: 365, label: "1 ano" },
];

// Today (UTC midnight, matching how Postgres timestamptz / created_at.slice(0,10) buckets days)
// minus `days-1` through today, oldest first.
function buildDateRange(days: WaRange): Date[] {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dates: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(new Date(todayUTC.getTime() - i * 86400000));
  }
  return dates;
}

const QuizMetricsPanel = () => {
  const [metrics, setMetrics] = useState<QuizMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const [waRange, setWaRange] = useState<WaRange>(30);
  const [waChartData, setWaChartData] = useState<WaChartPoint[] | null>(null);
  const [waChartLoading, setWaChartLoading] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("quiz_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;

      const events: QuizEvent[] = data ?? [];
      if (events.length === 0) {
        setMetrics({
          totalStarts: 0, totalCompletes: 0, completionRate: 0,
          avgValue: 0, topService: "-", topCity: "-",
          stepFunnel: [], todayStarts: 0, weekStarts: 0,
          cityBreakdown: [], pageBreakdown: [], deviceBreakdown: [], sourceBreakdown: [],
          waClicks: 0, waClicksBySource: [], avgSessionSeconds: 0,
        });
        return;
      }

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 86400000);

      const starts = events.filter(e => e.action === "start" && e.step === 0);
      const completes = events.filter(e => e.action === "complete");
      const todayStarts = starts.filter(e => e.created_at.startsWith(todayStr)).length;
      const weekStarts = starts.filter(e => new Date(e.created_at) >= weekAgo).length;

      const completedValues = completes.map(e => e.value).filter(Boolean) as number[];
      const avgValue = completedValues.length > 0
        ? completedValues.reduce((a, b) => a + b, 0) / completedValues.length
        : 0;

      // Top service
      const serviceCounts: Record<string, number> = {};
      completes.forEach(e => { if (e.service) serviceCounts[e.service] = (serviceCounts[e.service] ?? 0) + 1; });
      const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

      // Top city + full breakdown
      const cityCounts: Record<string, number> = {};
      events.filter(e => e.action !== "abandon").forEach(e => { if (e.city) cityCounts[e.city] = (cityCounts[e.city] ?? 0) + 1; });
      const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
      const topCity = sortedCities[0]?.[0] ?? "-";
      const cityBreakdown = sortedCities.slice(0, 10).map(([city, count]) => ({ city, count }));

      // Page path breakdown (which page triggered quiz open)
      const pathCounts: Record<string, number> = {};
      starts.forEach(e => { const p = e.page_path ?? "/"; pathCounts[p] = (pathCounts[p] ?? 0) + 1; });
      const pageBreakdown = Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count]) => ({ path, count }));

      // Device breakdown
      const deviceCounts: Record<string, number> = {};
      starts.forEach(e => { const d = e.device ?? "unknown"; deviceCounts[d] = (deviceCounts[d] ?? 0) + 1; });
      const deviceBreakdown = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]).map(([device, count]) => ({ device, count }));

      // Source breakdown (utm_source or inferred from referrer)
      const sourceCounts: Record<string, number> = {};
      starts.forEach(e => {
        const src = e.utm_source ?? (e.referrer?.includes("google") ? "google" : e.referrer ? "referral" : "direto");
        sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
      });
      const sourceBreakdown = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count }));

      // Step funnel (steps 0-4)
      const STEP_LABELS = ["Localização", "Serviço", "Tipo", "Quantidades", "Contacto"];
      const stepFunnel = STEP_LABELS.map((label, step) => {
        const count = events.filter(e => e.step === step && e.action !== "abandon").length;
        const rate = starts.length > 0 ? (count / starts.length) * 100 : 0;
        return { step, label, count, rate };
      });

      // WhatsApp clicks
      const waEvents = events.filter(e => e.action === "whatsapp_click");
      const waSourceCounts: Record<string, number> = {};
      waEvents.forEach(e => { const s = e.service ?? "unknown"; waSourceCounts[s] = (waSourceCounts[s] ?? 0) + 1; });
      const waClicksBySource = Object.entries(waSourceCounts).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count }));

      // Average session time
      const sessionEvents = events.filter(e => e.action === "session_time" && e.value != null);
      const avgSessionSeconds = sessionEvents.length > 0
        ? Math.round(sessionEvents.reduce((sum, e) => sum + (e.value ?? 0), 0) / sessionEvents.length)
        : 0;

      setMetrics({
        totalStarts: starts.length,
        totalCompletes: completes.length,
        completionRate: starts.length > 0 ? (completes.length / starts.length) * 100 : 0,
        avgValue,
        topService,
        topCity,
        stepFunnel,
        todayStarts,
        weekStarts,
        cityBreakdown,
        pageBreakdown,
        deviceBreakdown,
        sourceBreakdown,
        waClicks: waEvents.length,
        waClicksBySource,
        avgSessionSeconds,
      });
    } catch (e: unknown) {
      setMetricsError(e instanceof Error ? e.message : "Erro ao carregar métricas. Cria a tabela quiz_events no Supabase primeiro.");
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // Fetch weekly WhatsApp clicks fresh per range, not limited to the last 5000 events.
  const fetchWaChart = useCallback(async (days: WaRange) => {
    setWaChartLoading(true);
    try {
      const range = buildDateRange(days);
      const rangeStart = range[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("quiz_events")
        .select("created_at")
        .eq("action", "whatsapp_click")
        .gte("created_at", rangeStart.toISOString());
      if (error) throw error;

      const countByDay: Record<string, number> = {};
      (data ?? []).forEach((e: { created_at: string }) => {
        const key = e.created_at.slice(0, 10); // YYYY-MM-DD
        countByDay[key] = (countByDay[key] ?? 0) + 1;
      });
      const points: WaChartPoint[] = range.map(date => ({
        date,
        count: countByDay[date.toISOString().slice(0, 10)] ?? 0,
      }));
      setWaChartData(points);
    } catch {
      setWaChartData(null);
    } finally {
      setWaChartLoading(false);
    }
  }, []);

  const resetMetrics = async () => {
    if (!confirm("Apagar TODOS os dados de métricas do quiz? Esta ação é irreversível.")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("quiz_events")
      .delete()
      .gte("created_at", "2000-01-01");
    if (error) {
      alert(`Erro ao apagar: ${error.message}\n\nSolução: vai ao Supabase Dashboard → Table Editor → quiz_events → seleciona tudo → Delete rows.`);
      return;
    }
    setMetrics(null);
    fetchMetrics();
    fetchWaChart(waRange);
    alert("Dados apagados com sucesso.");
  };

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchWaChart(waRange);
  }, [waRange, fetchWaChart]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-navy">Métricas do Quiz</h2>
          <p className="text-sm text-gray-500">Funil de conversão e dados de comportamento · localhost excluído</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchMetrics(); fetchWaChart(waRange); }}
            disabled={metricsLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${metricsLoading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button
            onClick={resetMetrics}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Apagar dados
          </button>
        </div>
      </div>

      {metricsError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Tabela não encontrada</p>
          <p>{metricsError}</p>
          <p className="mt-2 text-xs text-amber-600">
            Corre o SQL em <code>supabase/migrations/20240101_admin_tables.sql</code> no teu projeto Supabase.
          </p>
        </div>
      )}

      {metricsLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!metricsLoading && !metricsError && metrics && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Início hoje", value: metrics.todayStarts, icon: Activity, color: "text-blue-500" },
              { label: "Total iniciados", value: metrics.totalStarts, icon: Users, color: "text-navy" },
              { label: "Concluídos", value: metrics.totalCompletes, icon: CheckCircle, color: "text-green-500" },
              { label: "Taxa conclusão", value: `${metrics.completionRate.toFixed(1)}%`, icon: Target, color: "text-gold" },
              { label: "Valor médio orçamento", value: `${metrics.avgValue.toFixed(0)}€`, icon: DollarSign, color: "text-emerald-600" },
              { label: "Clicks WhatsApp", value: metrics.waClicks, icon: MessageCircle, color: "text-[#25D366]" },
              { label: "Tempo médio no site", value: metrics.avgSessionSeconds >= 60 ? `${Math.floor(metrics.avgSessionSeconds/60)}m ${metrics.avgSessionSeconds%60}s` : `${metrics.avgSessionSeconds}s`, icon: Clock, color: "text-purple-500" },
              { label: "Início esta semana", value: metrics.weekStarts, icon: TrendingUp, color: "text-purple-400" },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <kpi.icon className={`w-5 h-5 mx-auto mb-2 ${kpi.color}`} />
                <p className="text-xl font-bold text-navy font-playfair">{kpi.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* WhatsApp clicks por origem */}
          {metrics.waClicksBySource.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp clicks por origem
              </h3>
              <div className="space-y-2">
                {metrics.waClicksBySource.map(({ source, count }) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{source}</span>
                    <span className="text-sm font-bold text-navy">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top service + city */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-gold" /> Serviço mais pedido
              </h3>
              <p className="text-2xl font-bold text-navy font-playfair capitalize">{metrics.topService}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Map className="w-4 h-4 text-gold" /> Cidade com mais leads
              </h3>
              <p className="text-2xl font-bold text-navy font-playfair capitalize">{metrics.topCity}</p>
            </div>
          </div>

          {/* Step funnel */}
          {metrics.stepFunnel.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gold" /> Funil por step (onde abandonam)
              </h3>
              <div className="space-y-3">
                {metrics.stepFunnel.map(step => (
                  <div key={step.step}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-navy/70 font-medium">Step {step.step} · {step.label}</span>
                      <span className="text-gray-400">{step.count} ({step.rate.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold to-[#d4c57b] transition-all duration-500"
                        style={{ width: `${Math.min(step.rate, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp clicks chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
              <h3 className="text-sm font-semibold text-navy flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" /> Clicks WhatsApp
              </h3>
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                {WA_RANGES.map(r => (
                  <button
                    key={r.days}
                    onClick={() => setWaRange(r.days)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      waRange === r.days ? "bg-white text-navy shadow-sm" : "text-navy/50 hover:text-navy/80"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {waChartLoading ? (
              <p className="text-sm text-gray-400 py-16 text-center">A carregar...</p>
            ) : waChartData ? (
              (() => {
                const total = waChartData.reduce((s, d) => s + d.count, 0);
                const max = Math.max(...waChartData.map(d => d.count), 1);
                const n = waChartData.length;
                const W = 800, H = 180, padL = 24, padR = 8, padT = 12, padB = 4;
                const innerW = W - padL - padR, innerH = H - padT - padB;
                const xAt = (i: number) => padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
                const yAt = (count: number) => padT + innerH - (count / max) * innerH;
                const linePath = waChartData.map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)},${yAt(d.count).toFixed(1)}`).join(" ");
                const areaPath = `${linePath} L ${xAt(n - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L ${xAt(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z`;
                const labelCount = Math.min(7, n);
                const labelStep = Math.max(1, Math.round((n - 1) / Math.max(labelCount - 1, 1)));
                const labelIndices = new Set<number>();
                for (let i = 0; i < n; i += labelStep) labelIndices.add(i);
                labelIndices.add(n - 1);

                return (
                  <>
                    <div className="mt-2 mb-3">
                      <span className="text-3xl font-bold text-navy font-playfair">{total}</span>
                      <span className="text-sm text-gray-400 ml-2">clicks nos últimos {waRange} dias</span>
                    </div>
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[180px]" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="waGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#25D366" />
                          <stop offset="100%" stopColor="#25D366" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      {[0, 0.5, 1].map(f => (
                        <line key={f} x1={padL} x2={W - padR} y1={padT + innerH * f} y2={padT + innerH * f} stroke="#F1F1F1" strokeWidth={1} />
                      ))}
                      <text x={2} y={padT + 4} fontSize={9} fill="#9CA3AF">{max}</text>
                      <text x={2} y={padT + innerH} fontSize={9} fill="#9CA3AF">0</text>
                      <path d={areaPath} fill="url(#waGradient)" stroke="none" />
                      <path d={linePath} fill="none" stroke="#128C7E" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                      {n <= 31 && waChartData.map((d, i) => (
                        <circle key={i} cx={xAt(i)} cy={yAt(d.count)} r={d.count > 0 ? 2.5 : 1.5} fill={d.count > 0 ? "#128C7E" : "#E5E7EB"}>
                          <title>{`${d.date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })}: ${d.count} clicks`}</title>
                        </circle>
                      ))}
                    </svg>
                    <div className="relative h-4 mt-1">
                      {waChartData.map((d, i) => labelIndices.has(i) && (
                        <span
                          key={i}
                          className="absolute text-[10px] text-gray-400 -translate-x-1/2"
                          style={{ left: `${(xAt(i) / W) * 100}%` }}
                        >
                          {d.date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-3 text-right">Fuso horário: UTC</p>
                  </>
                );
              })()
            ) : (
              <p className="text-sm text-gray-400 py-16 text-center">Sem dados para este período.</p>
            )}
          </div>

          {/* Breakdown grid */}
          {metrics.totalStarts > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Cities */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                  <Map className="w-4 h-4 text-gold" /> Cidades dos clientes
                </h3>
                <div className="space-y-2">
                  {metrics.cityBreakdown.length === 0 && <p className="text-xs text-gray-400">Sem dados de cidade ainda</p>}
                  {metrics.cityBreakdown.map(({ city, count }) => (
                    <div key={city} className="flex items-center justify-between">
                      <span className="text-sm text-navy/80 capitalize">{city}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gold" style={{ width: `${(count / (metrics.cityBreakdown[0]?.count || 1)) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pages that triggered quiz open */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gold" /> Páginas que abrem o quiz
                </h3>
                <div className="space-y-2">
                  {metrics.pageBreakdown.length === 0 && <p className="text-xs text-gray-400">Sem dados de página ainda (requer colunas novas no Supabase)</p>}
                  {metrics.pageBreakdown.map(({ path, count }) => (
                    <div key={path} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-navy/70 truncate font-mono">{path}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-kyro-green/60" style={{ width: `${(count / (metrics.pageBreakdown[0]?.count || 1)) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold" /> Dispositivo
                </h3>
                <div className="space-y-2">
                  {metrics.deviceBreakdown.length === 0 && <p className="text-xs text-gray-400">Sem dados de dispositivo ainda</p>}
                  {metrics.deviceBreakdown.map(({ device, count }) => {
                    const total = metrics.deviceBreakdown.reduce((a, d) => a + d.count, 0);
                    return (
                      <div key={device} className="flex items-center justify-between">
                        <span className="text-sm text-navy/80 capitalize">{device}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-400" style={{ width: `${(count / total) * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-12 text-right">{count} ({Math.round((count / total) * 100)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Source */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold" /> Origem do tráfego
                </h3>
                <div className="space-y-2">
                  {metrics.sourceBreakdown.length === 0 && <p className="text-xs text-gray-400">Sem dados de origem ainda</p>}
                  {metrics.sourceBreakdown.map(({ source, count }) => {
                    const total = metrics.sourceBreakdown.reduce((a, d) => a + d.count, 0);
                    return (
                      <div key={source} className="flex items-center justify-between">
                        <span className="text-sm text-navy/80 capitalize">{source}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-purple-400" style={{ width: `${(count / total) * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-12 text-right">{count} ({Math.round((count / total) * 100)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {metrics.totalStarts === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-navy font-semibold">Sem dados ainda</p>
              <p className="text-sm text-gray-400 mt-1">Os eventos do quiz aparecem aqui assim que alguém iniciar o quiz (em produção, não em localhost).</p>
            </div>
          )}
        </>
      )}

      {/* Tracking info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-gold" />
          Como funciona o tracking
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          O quiz regista eventos na tabela <code className="bg-gray-100 px-1 rounded">quiz_events</code> do Supabase
          em cada step. <strong>Localhost está excluído</strong>: só conta tráfego real de produção.
          Novos campos: <code className="bg-gray-100 px-1 rounded">page_path</code>, <code className="bg-gray-100 px-1 rounded">device</code>, <code className="bg-gray-100 px-1 rounded">utm_source</code>, <code className="bg-gray-100 px-1 rounded">referrer</code>.
        </p>
        <p className="text-xs text-amber-600 font-medium">
          Para ativar os novos campos, corre no Supabase SQL Editor:
          <code className="block bg-amber-50 border border-amber-200 rounded p-2 mt-1 font-mono text-[11px] whitespace-pre">ALTER TABLE quiz_events{'\n'}  ADD COLUMN IF NOT EXISTS page_path text,{'\n'}  ADD COLUMN IF NOT EXISTS referrer text,{'\n'}  ADD COLUMN IF NOT EXISTS utm_source text,{'\n'}  ADD COLUMN IF NOT EXISTS utm_medium text,{'\n'}  ADD COLUMN IF NOT EXISTS utm_campaign text,{'\n'}  ADD COLUMN IF NOT EXISTS device text;</code>
        </p>
      </div>
    </div>
  );
};

export default QuizMetricsPanel;
