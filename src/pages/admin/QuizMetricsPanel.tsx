import { useState, useCallback, useEffect } from "react";
import {
  RefreshCw, Trash2, Activity, TrendingUp, Users, DollarSign, Target,
  Clock, CheckCircle, Globe, Zap, MessageCircle, Map, BarChart3,
  ChevronLeft, ChevronRight, Phone, Inbox, LucideIcon,
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

interface ChartPoint { date: Date; count: number; }

interface WeekMetrics {
  totalStarts: number;
  totalCompletes: number;
  completionRate: number;
  avgValue: number;
  topService: string;
  topCity: string;
  stepFunnel: { step: number; label: string; count: number; rate: number }[];
  cityBreakdown: { city: string; count: number }[];
  pageBreakdown: { path: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  waClicks: number;
  waClicksBySource: { source: string; count: number }[];
  callClicks: number;
  callClicksBySource: { source: string; count: number }[];
  avgSessionSeconds: number;
  leadsCount: number;
  waChart: ChartPoint[];
  callChart: ChartPoint[];
  leadsChart: ChartPoint[];
}

const WEEKDAY_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// ── Date helpers (all UTC-based, matching how created_at.slice(0,10) buckets days
//    in Postgres timestamptz). Week = Monday 00:00 UTC through Sunday 23:59 UTC. ──

function addDaysUTC(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86400000);
}

function getWeekStartUTC(d: Date): Date {
  const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = utc.getUTCDay(); // 0 = Sunday .. 6 = Saturday
  const diff = day === 0 ? -6 : 1 - day;
  return addDaysUTC(utc, diff);
}

// Click sources are page-specific event labels (ex: `price_hero_sofa_porto`,
// `marca_cadeiras_hero_bosch`) — with 9000+ SEO pages on this site, showing them raw
// would explode into dozens of near-unique rows. Bucket into readable zones instead.
function groupClickOrigin(raw: string): string {
  const s = raw.toLowerCase();
  if (s === "desconhecido") return "Desconhecido";
  if (s === "header_mobile_menu") return "Menu mobile";
  if (s === "header_mobile") return "Cabeçalho (mobile)";
  if (s === "header_desktop" || s === "en_header") return "Cabeçalho (desktop)";
  if (s.startsWith("footer") || s === "en_footer") return "Rodapé";
  if (s === "sticky_bar") return "Barra fixa (mobile)";
  if (s === "final_cta") return "CTA final";
  if (s === "not_found_page") return "Página 404";
  if (s.startsWith("marca_")) return "Páginas de marca";
  if (s.startsWith("problem_city_hero") || s.startsWith("problem_hero")) return "Páginas de problema";
  if (s.startsWith("price_hero")) return "Páginas de preço";
  if (s.startsWith("location_hero") || s.startsWith("freguesia_hero")) return "Páginas de localização";
  if (s.startsWith("material_hero")) return "Páginas de material";
  if (s.startsWith("variant_hero")) return "Páginas de variante";
  if (s.startsWith("service_hero")) return "Hero de serviço";
  if (s === "hero" || s.includes("hero_mobile")) return "Hero principal";
  return "Outra página";
}

function buildWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDaysUTC(weekStart, i));
}

function formatWeekLabel(weekStart: Date): string {
  const weekEnd = addDaysUTC(weekStart, 6);
  const sameMonth = weekStart.getUTCMonth() === weekEnd.getUTCMonth() && weekStart.getUTCFullYear() === weekEnd.getUTCFullYear();
  const endStr = `${weekEnd.getUTCDate()} de ${weekEnd.toLocaleDateString("pt-PT", { month: "long", timeZone: "UTC" })} de ${weekEnd.getUTCFullYear()}`;
  if (sameMonth) {
    return `${weekStart.getUTCDate()} – ${endStr}`;
  }
  const startStr = weekStart.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", timeZone: "UTC" }).replace(/\.$/, "");
  return `${startStr} – ${endStr}`;
}

// ── Count-up animation for the clicked-day badge ──────────────────────────────

function useCountUp(target: number, trigger: number | null): number {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    if (trigger === null) return;
    let raf = 0;
    const start = performance.now();
    const duration = 400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, target]);
  return display;
}

// ── Shared weekly line chart (WhatsApp / Pedidos / Chamadas all reuse this) ───

interface WeekLineChartProps {
  icon: LucideIcon;
  iconColorClass: string;
  title: string;
  helper?: string;
  data: ChartPoint[];
  loading: boolean;
  error: boolean;
  totalSuffix: string;
  lineColor: string;
  areaColor: string;
  gradientId: string;
}

function WeekLineChart({
  icon: Icon, iconColorClass, title, helper, data, loading, error, totalSuffix, lineColor, areaColor, gradientId,
}: WeekLineChartProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.count, 0);
  const max = Math.max(...data.map(d => d.count), 1);
  const n = data.length;
  const W = 700, H = 180, padL = 24, padR = 8, padT = 16, padB = 4;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const xAt = (i: number) => padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = (count: number) => padT + innerH - (count / max) * innerH;
  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)},${yAt(d.count).toFixed(1)}`).join(" ");
  const areaPath = n > 0 ? `${linePath} L ${xAt(n - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L ${xAt(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z` : "";
  const colWidth = n > 0 ? innerW / n : innerW;

  const selectedCount = selected !== null ? data[selected]?.count ?? 0 : 0;
  const animatedCount = useCountUp(selectedCount, selected);
  const selectedLeftPct = selected !== null ? Math.min(88, Math.max(12, (xAt(selected) / W) * 100)) : 50;

  const toggleDay = (i: number) => setSelected(prev => (prev === i ? null : i));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col">
      {/* Fixed-height header block so a 2-line title (ex: "Pedidos de orçamento") reserves the
          same vertical space as a 1-line one — otherwise the number below starts at a different
          y-offset per card and the row of three cards looks unaligned. */}
      <div className="min-h-[2.5rem] flex items-start gap-2 mb-1">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColorClass}`} />
        <h3 className="text-sm font-semibold text-navy leading-snug">{title}</h3>
      </div>
      {helper && <p className="text-[11px] text-gray-400 mb-2 min-h-[1rem]">{helper}</p>}

      {loading ? (
        <p className="text-sm text-gray-400 py-16 text-center">A carregar...</p>
      ) : error ? (
        <p className="text-sm text-red-400 py-16 text-center">Erro ao carregar dados.</p>
      ) : (
        <>
          <div className="mt-2 mb-1">
            <span className="text-3xl font-bold text-navy font-playfair">{total}</span>
            <span className="text-sm text-gray-400 ml-2">{totalSuffix}</span>
          </div>
          <p className="text-xs text-gray-400 mb-2 min-h-[1rem]">{total === 0 ? "Sem dados nesta semana." : " "}</p>

          <div className="relative mt-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[180px] touch-manipulation" preserveAspectRatio="none">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={areaColor} />
                  <stop offset="100%" stopColor={areaColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              {[0, 0.5, 1].map(f => (
                <line key={f} x1={padL} x2={W - padR} y1={padT + innerH * f} y2={padT + innerH * f} stroke="#F1F1F1" strokeWidth={1} />
              ))}
              <text x={2} y={padT + 4} fontSize={9} fill="#9CA3AF">{max}</text>
              <text x={2} y={padT + innerH} fontSize={9} fill="#9CA3AF">0</text>
              {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
              <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {selected !== null && (
                <line
                  x1={xAt(selected)} x2={xAt(selected)} y1={padT} y2={padT + innerH}
                  stroke={lineColor} strokeWidth={1} strokeDasharray="3 3" opacity={0.5}
                />
              )}
              {data.map((d, i) => (
                <g key={i}>
                  {/* Generous invisible tap target so days are comfortable to hit on mobile. */}
                  <rect
                    x={xAt(i) - colWidth / 2} y={0} width={colWidth} height={H}
                    fill="transparent" className="cursor-pointer"
                    onClick={() => toggleDay(i)}
                  />
                  <circle
                    cx={xAt(i)} cy={yAt(d.count)}
                    r={selected === i ? 5 : d.count > 0 ? 2.5 : 1.5}
                    fill={selected === i ? lineColor : d.count > 0 ? lineColor : "#E5E7EB"}
                    stroke={selected === i ? "#FFFFFF" : "none"}
                    strokeWidth={selected === i ? 2 : 0}
                    className="pointer-events-none transition-all duration-150"
                  />
                </g>
              ))}
            </svg>

            {selected !== null && (
              <div
                key={selected}
                className="absolute -top-1 -translate-x-1/2 pointer-events-none kyro-pop z-10"
                style={{ left: `${selectedLeftPct}%` }}
              >
                <div className="bg-navy text-white rounded-xl px-3 py-1.5 shadow-lg text-center whitespace-nowrap">
                  <p className="text-[10px] text-white/60 leading-none mb-0.5">
                    {WEEKDAY_SHORT[selected]} · {data[selected].date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", timeZone: "UTC" })}
                  </p>
                  <p className="text-lg font-bold font-playfair leading-none">{animatedCount}</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative h-4 mt-1">
            {data.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`absolute text-[10px] -translate-x-1/2 px-1 transition-colors ${selected === i ? "text-navy font-bold" : "text-gray-400 hover:text-navy/60"}`}
                style={{ left: `${(xAt(i) / W) * 100}%` }}
              >
                {WEEKDAY_SHORT[i]}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-3 text-right">Fuso horário: UTC · toca num dia para ver o número exato</p>
        </>
      )}
    </div>
  );
}

const QuizMetricsPanel = () => {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStartUTC(new Date()));
  const [data, setData] = useState<WeekMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentWeekStart = getWeekStartUTC(new Date());
  const isCurrentWeek = weekStart.getTime() >= currentWeekStart.getTime();

  const fetchWeek = useCallback(async (ws: Date) => {
    setLoading(true);
    setError(null);
    try {
      const weekDays = buildWeekDays(ws);
      const startISO = ws.toISOString();
      const endISO = addDaysUTC(ws, 7).toISOString();

      const [eventsRes, leadsRes] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("quiz_events").select("*").gte("created_at", startISO).lt("created_at", endISO),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("leads").select("id, created_at").gte("created_at", startISO).lt("created_at", endISO),
      ]);
      if (eventsRes.error) throw eventsRes.error;
      if (leadsRes.error) throw leadsRes.error;

      const events: QuizEvent[] = eventsRes.data ?? [];
      const leadsRows: { id: string; created_at: string }[] = leadsRes.data ?? [];

      const countByDay = (rows: { created_at: string }[]): ChartPoint[] => {
        const map: Record<string, number> = {};
        rows.forEach(r => { const k = r.created_at.slice(0, 10); map[k] = (map[k] ?? 0) + 1; });
        return weekDays.map(d => ({ date: d, count: map[d.toISOString().slice(0, 10)] ?? 0 }));
      };

      const starts = events.filter(e => e.action === "start" && e.step === 0);
      const completes = events.filter(e => e.action === "complete");
      const waEvents = events.filter(e => e.action === "whatsapp_click");
      const callEvents = events.filter(e => e.action === "call_click");

      const completedValues = completes.map(e => e.value).filter((v): v is number => typeof v === "number");
      const avgValue = completedValues.length > 0
        ? completedValues.reduce((a, b) => a + b, 0) / completedValues.length
        : 0;

      const serviceCounts: Record<string, number> = {};
      completes.forEach(e => { if (e.service) serviceCounts[e.service] = (serviceCounts[e.service] ?? 0) + 1; });
      const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

      const cityCounts: Record<string, number> = {};
      events.filter(e => e.action !== "abandon").forEach(e => { if (e.city) cityCounts[e.city] = (cityCounts[e.city] ?? 0) + 1; });
      const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
      const topCity = sortedCities[0]?.[0] ?? "-";
      const cityBreakdown = sortedCities.slice(0, 10).map(([city, count]) => ({ city, count }));

      const pathCounts: Record<string, number> = {};
      starts.forEach(e => { const p = e.page_path ?? "/"; pathCounts[p] = (pathCounts[p] ?? 0) + 1; });
      const pageBreakdown = Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count]) => ({ path, count }));

      const deviceCounts: Record<string, number> = {};
      starts.forEach(e => { const d = e.device ?? "unknown"; deviceCounts[d] = (deviceCounts[d] ?? 0) + 1; });
      const deviceBreakdown = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]).map(([device, count]) => ({ device, count }));

      const sourceCounts: Record<string, number> = {};
      starts.forEach(e => {
        const src = e.utm_source ?? (e.referrer?.includes("google") ? "google" : e.referrer ? "referral" : "direto");
        sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
      });
      const sourceBreakdown = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count }));

      const STEP_LABELS = ["Localização", "Serviço", "Tipo", "Quantidades", "Contacto"];
      const stepFunnel = STEP_LABELS.map((label, step) => {
        const count = events.filter(e => e.step === step && e.action !== "abandon").length;
        const rate = starts.length > 0 ? (count / starts.length) * 100 : 0;
        return { step, label, count, rate };
      });

      const waSourceCounts: Record<string, number> = {};
      waEvents.forEach(e => { const s = groupClickOrigin(e.service ?? "desconhecido"); waSourceCounts[s] = (waSourceCounts[s] ?? 0) + 1; });
      const waClicksBySource = Object.entries(waSourceCounts).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count }));

      const callSourceCounts: Record<string, number> = {};
      callEvents.forEach(e => { const s = groupClickOrigin(e.service ?? "desconhecido"); callSourceCounts[s] = (callSourceCounts[s] ?? 0) + 1; });
      const callClicksBySource = Object.entries(callSourceCounts).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count }));

      const sessionEvents = events.filter(e => e.action === "session_time" && e.value != null);
      const avgSessionSeconds = sessionEvents.length > 0
        ? Math.round(sessionEvents.reduce((sum, e) => sum + (e.value ?? 0), 0) / sessionEvents.length)
        : 0;

      setData({
        totalStarts: starts.length,
        totalCompletes: completes.length,
        completionRate: starts.length > 0 ? (completes.length / starts.length) * 100 : 0,
        avgValue,
        topService,
        topCity,
        stepFunnel,
        cityBreakdown,
        pageBreakdown,
        deviceBreakdown,
        sourceBreakdown,
        waClicks: waEvents.length,
        waClicksBySource,
        callClicks: callEvents.length,
        callClicksBySource,
        avgSessionSeconds,
        leadsCount: leadsRows.length,
        waChart: countByDay(waEvents),
        callChart: countByDay(callEvents),
        leadsChart: countByDay(leadsRows),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar métricas. Confirma que as tabelas quiz_events e leads existem no Supabase.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeek(weekStart);
  }, [weekStart, fetchWeek]);

  const goPrevWeek = () => setWeekStart(ws => addDaysUTC(ws, -7));
  const goNextWeek = () => {
    if (isCurrentWeek) return;
    setWeekStart(ws => {
      const next = addDaysUTC(ws, 7);
      return next.getTime() > currentWeekStart.getTime() ? currentWeekStart : next;
    });
  };
  const goThisWeek = () => setWeekStart(currentWeekStart);

  const resetMetrics = async () => {
    if (!confirm("Apagar TODOS os dados de métricas do quiz (todas as semanas)? Esta ação é irreversível.")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: delError } = await (supabase as any)
      .from("quiz_events")
      .delete()
      .gte("created_at", "2000-01-01");
    if (delError) {
      alert(`Erro ao apagar: ${delError.message}\n\nSolução: vai ao Supabase Dashboard → Table Editor → quiz_events → seleciona tudo → Delete rows.`);
      return;
    }
    setData(null);
    fetchWeek(weekStart);
    alert("Dados apagados com sucesso.");
  };

  return (
    <div className="space-y-4">
      {/* Local keyframes for the "clicked day" badge pop-in. */}
      <style>{`
        @keyframes kyroPop {
          0% { opacity: 0; transform: translateX(-50%) scale(0.7) translateY(6px); }
          60% { opacity: 1; transform: translateX(-50%) scale(1.06) translateY(0); }
          100% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
        }
        .kyro-pop { animation: kyroPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy">Métricas do Quiz</h2>
          <p className="text-sm text-gray-500">Navega por semana · localhost excluído</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchWeek(weekStart)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
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

      {/* Weekly navigation bar, controls every section below */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center justify-between gap-2">
        <button
          onClick={goPrevWeek}
          aria-label="Semana anterior"
          className="flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-xl border border-gray-200 text-navy hover:border-gold/50 hover:bg-gold/5 active:scale-95 transition-all flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center min-w-0">
          <p className="text-sm sm:text-base font-bold text-navy font-playfair truncate">{formatWeekLabel(weekStart)}</p>
          {!isCurrentWeek ? (
            <button onClick={goThisWeek} className="text-[11px] text-gold hover:text-gold/70 font-medium underline underline-offset-2">
              Voltar à semana atual
            </button>
          ) : (
            <p className="text-[11px] text-gray-400">Semana atual</p>
          )}
        </div>

        <button
          onClick={goNextWeek}
          disabled={isCurrentWeek}
          aria-label="Semana seguinte"
          className="flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-xl border border-gray-200 text-navy hover:border-gold/50 hover:bg-gold/5 active:scale-95 transition-all disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:cursor-not-allowed flex-shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Erro ao carregar dados</p>
          <p>{error}</p>
          <p className="mt-2 text-xs text-amber-600">
            Corre o SQL em <code>supabase/migrations/20240101_admin_tables.sql</code> no teu projeto Supabase.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* KPI cards, all scoped to the selected week */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total iniciados", value: data.totalStarts, icon: Users, color: "text-navy" },
              { label: "Concluídos", value: data.totalCompletes, icon: CheckCircle, color: "text-green-500" },
              { label: "Taxa conclusão", value: `${data.completionRate.toFixed(1)}%`, icon: Target, color: "text-gold" },
              { label: "Valor médio orçamento", value: `${data.avgValue.toFixed(0)}€`, icon: DollarSign, color: "text-emerald-600" },
              { label: "Pedidos recebidos", value: data.leadsCount, icon: Inbox, color: "text-gold" },
              { label: "Clicks WhatsApp", value: data.waClicks, icon: MessageCircle, color: "text-[#25D366]" },
              { label: "Cliques em ligar", value: data.callClicks, icon: Phone, color: "text-blue-500" },
              { label: "Tempo médio no site", value: data.avgSessionSeconds >= 60 ? `${Math.floor(data.avgSessionSeconds / 60)}m ${data.avgSessionSeconds % 60}s` : `${data.avgSessionSeconds}s`, icon: Clock, color: "text-purple-500" },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <kpi.icon className={`w-5 h-5 mx-auto mb-2 ${kpi.color}`} />
                <p className="text-xl font-bold text-navy font-playfair">{kpi.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Three weekly charts, visually consistent, each with click-to-reveal per day */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <WeekLineChart
              icon={MessageCircle}
              iconColorClass="text-[#25D366]"
              title="Clicks WhatsApp"
              data={data.waChart}
              loading={false}
              error={false}
              totalSuffix="clicks nesta semana"
              lineColor="#128C7E"
              areaColor="#25D366"
              gradientId="chartWa"
            />
            <WeekLineChart
              icon={Inbox}
              iconColorClass="text-gold"
              title="Pedidos de orçamento"
              helper="Pedidos submetidos com sucesso pelo quiz (tabela leads)."
              data={data.leadsChart}
              loading={false}
              error={false}
              totalSuffix="pedidos nesta semana"
              lineColor="#8a7326"
              areaColor="#D4AF37"
              gradientId="chartLeads"
            />
            <WeekLineChart
              icon={Phone}
              iconColorClass="text-blue-500"
              title="Cliques em ligar"
              helper="Cliques no botão de ligar, não chamadas efetivamente atendidas."
              data={data.callChart}
              loading={false}
              error={false}
              totalSuffix="cliques nesta semana"
              lineColor="#2563EB"
              areaColor="#3B82F6"
              gradientId="chartCall"
            />
          </div>

          {/* WhatsApp + call clicks por origem */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.waClicksBySource.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp clicks por origem (esta semana)
                </h3>
                <div className="space-y-2">
                  {data.waClicksBySource.map(({ source, count }) => (
                    <div key={source} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-navy/80 truncate">{source}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-[#25D366]" style={{ width: `${(count / (data.waClicksBySource[0]?.count || 1)) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.callClicksBySource.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" /> Cliques em ligar por origem (esta semana)
                </h3>
                <div className="space-y-2">
                  {data.callClicksBySource.map(({ source, count }) => (
                    <div key={source} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-navy/80 truncate">{source}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${(count / (data.callClicksBySource[0]?.count || 1)) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top service + city (this week) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-gold" /> Serviço mais pedido (esta semana)
              </h3>
              <p className="text-2xl font-bold text-navy font-playfair capitalize">{data.topService}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Map className="w-4 h-4 text-gold" /> Cidade com mais leads (esta semana)
              </h3>
              <p className="text-2xl font-bold text-navy font-playfair capitalize">{data.topCity}</p>
            </div>
          </div>

          {data.totalStarts > 0 ? (
            <>
              {/* Step funnel */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gold" /> Funil por step (onde abandonam, esta semana)
                </h3>
                <div className="space-y-3">
                  {data.stepFunnel.map(step => (
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

              {/* Breakdown grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Cities */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                    <Map className="w-4 h-4 text-gold" /> Cidades dos clientes
                  </h3>
                  <div className="space-y-2">
                    {data.cityBreakdown.length === 0 && <p className="text-xs text-gray-400">Sem dados de cidade nesta semana</p>}
                    {data.cityBreakdown.map(({ city, count }) => (
                      <div key={city} className="flex items-center justify-between">
                        <span className="text-sm text-navy/80 capitalize">{city}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-gold" style={{ width: `${(count / (data.cityBreakdown[0]?.count || 1)) * 100}%` }} />
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
                    {data.pageBreakdown.length === 0 && <p className="text-xs text-gray-400">Sem dados de página nesta semana</p>}
                    {data.pageBreakdown.map(({ path, count }) => (
                      <div key={path} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-navy/70 truncate font-mono">{path}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-kyro-green/60" style={{ width: `${(count / (data.pageBreakdown[0]?.count || 1)) * 100}%` }} />
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
                    {data.deviceBreakdown.length === 0 && <p className="text-xs text-gray-400">Sem dados de dispositivo nesta semana</p>}
                    {data.deviceBreakdown.map(({ device, count }) => {
                      const total = data.deviceBreakdown.reduce((a, d) => a + d.count, 0);
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
                    {data.sourceBreakdown.length === 0 && <p className="text-xs text-gray-400">Sem dados de origem nesta semana</p>}
                    {data.sourceBreakdown.map(({ source, count }) => {
                      const total = data.sourceBreakdown.reduce((a, d) => a + d.count, 0);
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
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-navy font-semibold">Sem dados de quiz nesta semana</p>
              <p className="text-sm text-gray-400 mt-1">
                Ninguém iniciou o quiz entre {formatWeekLabel(weekStart)}. Isto pode ser normal (semana calma)
                ou indicar um problema de tracking, não é necessariamente um bug.
              </p>
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
          em cada step, e os pedidos de orçamento submetidos com sucesso ficam na tabela <code className="bg-gray-100 px-1 rounded">leads</code>.
          <strong> Localhost está excluído</strong>: só conta tráfego real de produção.
          O painel mostra sempre uma semana de cada vez (segunda a domingo, fuso UTC) e navega com as setas no topo.
        </p>
        <p className="text-xs text-gray-500">
          <code className="bg-gray-100 px-1 rounded">call_click</code> conta cliques no botão de ligar, não chamadas
          efetivamente atendidas, um site não tem forma de saber se a chamada foi mesmo atendida.
        </p>
        <p className="text-xs text-amber-600 font-medium mt-2">
          Para ativar campos novos, corre no Supabase SQL Editor as migrações em <code className="bg-amber-50 border border-amber-200 rounded px-1">supabase/migrations/</code>,
          incluindo <code className="bg-amber-50 border border-amber-200 rounded px-1">20260826000000_widen_quiz_events_action_check_call_click.sql</code> (liberta a coluna <code className="bg-amber-50 border border-amber-200 rounded px-1">action</code> para aceitar <code className="bg-amber-50 border border-amber-200 rounded px-1">call_click</code>).
          Até correres essa migração, "Cliques em ligar" mostra 0, não é um bug do painel.
        </p>
      </div>
    </div>
  );
};

export default QuizMetricsPanel;
