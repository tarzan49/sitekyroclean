import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  Map, AlertTriangle, BarChart3, RefreshCw, ExternalLink, Trash2,
  Home, Settings2, Lock, ChevronRight, ChevronDown, Activity, TrendingUp,
  Users, DollarSign, Target, Clock, CheckCircle,
  FileText, Globe, Shield, Zap, Star, Copy, MessageCircle,
  Upload, Search, Lightbulb,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAllLocationRoutes, services } from "@/data/locationSeoData";
import { getAllFreguesiaRoutes } from "@/data/freguesiaSeoData";
import { getAllMaterialRoutes, getAllMaterialCityRoutes } from "@/data/materialSeoData";
import { getAllPriceRoutes } from "@/data/priceSeoData";
import { getAllProblemCityRoutes } from "@/data/problemCitySeoData";
import { getAllProblems } from "@/data/problemSeoData";
import { getAllKeywordVariantRoutes } from "@/data/keywordVariantData";
import { getAllPackComboRoutes } from "@/data/packComboData";
import { getAllMarcaSofaRoutes } from "@/data/marcaSofaData";
import { getAllPosts } from "@/data/blogData";
import { SITE_URL } from "@/constants/business";
import { getAdminRegion, getRegionForLocationPart, ADMIN_REGIONS, ADMIN_REGION_LABELS, type AdminRegion } from "@/data/regionUtils";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const AdminImport   = lazy(() => import("./AdminImport"));
const AdminManager  = lazy(() => import("./AdminManager"));
const AdminSeoPages = lazy(() => import("./AdminSeoPages"));

// ── Auth ─────────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || 'kyro2025';

// ── Sitemap config (mirrors scripts/generate-sitemap.ts output — 10 real sub-sitemaps) ──
const SITEMAPS = [
  { name: "Sitemap Index", file: "sitemap-index.xml", description: "Índice principal (10 sub-sitemaps)", icon: Globe },
  { name: "Core (Serviços + Páginas principais)", file: "sitemap-core.xml", description: "6 serviços + páginas institucionais", icon: Zap },
  { name: "Localidade × Serviço", file: "sitemap-location.xml", description: "Concelhos × 6 serviços — Porto/Norte, Lisboa/AML, Algarve", icon: Map },
  { name: "Freguesia × Serviço", file: "sitemap-freguesia.xml", description: "Freguesias × 6 serviços — Porto/Norte, Lisboa/AML, Algarve", icon: Map },
  { name: "Material", file: "sitemap-material.xml", description: "Material + Material×Cidade", icon: FileText },
  { name: "Preço", file: "sitemap-price.xml", description: "Preço × concelho", icon: FileText },
  { name: "Problemas", file: "sitemap-problem.xml", description: "Problema + Problema×Cidade", icon: AlertTriangle },
  { name: "Variantes Keyword", file: "sitemap-keyword-variants.xml", description: "higienização/lavagem/impermeabilização × serviços × locais", icon: Target },
  { name: "Recursos (Blog/FAQ)", file: "sitemap-resources.xml", description: "Blog + FAQ + Glossário", icon: FileText },
  { name: "Packs", file: "sitemap-packs.xml", description: "Packs combo × concelho", icon: Target },
  { name: "Marcas", file: "sitemap-marcas.xml", description: "Marcas de sofá × concelho", icon: Shield },
];

// ── Sitemap URL Generators ────────────────────────────────────────────────────
function getSitemapUrls(file: string): string[] {
  switch (file) {
    case "sitemap-core.xml":
      return services.map(s => s.baseRoute);
    case "sitemap-location.xml":
      return getAllLocationRoutes().map(r => r.path);
    case "sitemap-freguesia.xml":
      return getAllFreguesiaRoutes().map(r => r.path);
    case "sitemap-material.xml":
      return [
        ...getAllMaterialRoutes().map(r => r.path),
        ...getAllMaterialCityRoutes().map(r => r.path),
      ];
    case "sitemap-price.xml":
      return getAllPriceRoutes().map(r => r.path);
    case "sitemap-problem.xml":
      return [
        ...getAllProblems().map(p => `/problemas/${p.slug}`),
        ...getAllProblemCityRoutes().map(r => r.path),
      ];
    case "sitemap-keyword-variants.xml":
      return getAllKeywordVariantRoutes().map(r => r.path);
    case "sitemap-resources.xml":
      return [
        "/blog",
        ...getAllPosts().map(p => `/blog/${p.slug}`),
        "/perguntas-frequentes-limpeza-estofos",
        "/glossario-limpeza-estofos",
      ];
    case "sitemap-packs.xml":
      return getAllPackComboRoutes().map(r => r.path);
    case "sitemap-marcas.xml":
      return getAllMarcaSofaRoutes().map(r => r.path);
    default:
      return [];
  }
}

// ── Regional breakdown (only for the 3 sitemaps that carry a citySlug/locationPart) ──
function getSitemapRegionBreakdown(file: string): { region: AdminRegion; count: number }[] | null {
  let regions: (AdminRegion | null)[];
  switch (file) {
    case "sitemap-location.xml":
      regions = getAllLocationRoutes().map(r => getAdminRegion(r.citySlug));
      break;
    case "sitemap-freguesia.xml":
      regions = getAllFreguesiaRoutes().map(r => getAdminRegion(r.citySlug));
      break;
    case "sitemap-keyword-variants.xml":
      regions = getAllKeywordVariantRoutes().map(r => getRegionForLocationPart(r.locationPart));
      break;
    default:
      return null;
  }
  return ADMIN_REGIONS.map(region => ({ region, count: regions.filter(r => r === region).length }));
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ErrorLog {
  id: string;
  created_at: string;
  message: string;
  source: string | null;
  url: string | null;
  line_number: number | null;
  col_number: number | null;
  stack: string | null;
  user_agent: string | null;
  severity: string;
}

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

// ── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = "sitemap" | "errors" | "metrics" | "reviews" | "crm" | "import" | "seo-stats" | "seo-pages";

// ── Component ─────────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("sitemap");
  const [expandedSitemap, setExpandedSitemap] = useState<string | null>(null);
  const [sitemapUrlCache, setSitemapUrlCache] = useState<Record<string, string[]>>({});

  const sitemapCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sm of SITEMAPS) {
      if (sm.file === "sitemap-index.xml") continue;
      counts[sm.file] = getSitemapUrls(sm.file).length;
    }
    return counts;
  }, []);

  const sitemapRegionBreakdowns = useMemo(() => {
    const breakdowns: Record<string, { region: AdminRegion; count: number }[]> = {};
    for (const sm of SITEMAPS) {
      const breakdown = getSitemapRegionBreakdown(sm.file);
      if (breakdown) breakdowns[sm.file] = breakdown;
    }
    return breakdowns;
  }, []);

  // Error Log state
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [errorsLoading, setErrorsLoading] = useState(false);
  const [errorsError, setErrorsError] = useState<string | null>(null);

  // Quiz Metrics state
  const [metrics, setMetrics] = useState<QuizMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // ── Fetch Error Logs ────────────────────────────────────────────────────────
  const fetchErrors = useCallback(async () => {
    setErrorsLoading(true);
    setErrorsError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setErrors(data ?? []);
    } catch (e: unknown) {
      setErrorsError(e instanceof Error ? e.message : "Erro ao carregar logs. Cria a tabela error_logs no Supabase primeiro.");
    } finally {
      setErrorsLoading(false);
    }
  }, []);

  // ── Fetch Quiz Metrics ──────────────────────────────────────────────────────
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
    alert("Dados apagados com sucesso.");
  };

  // Load data when tab changes
  useEffect(() => {
    if (!authed) return;
    if (activeTab === "errors") fetchErrors();
    if (activeTab === "metrics") fetchMetrics();
  }, [authed, activeTab, fetchErrors, fetchMetrics]);

  // ── Delete error log ────────────────────────────────────────────────────────
  const deleteError = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("error_logs").delete().eq("id", id);
    if (error) {
      alert(`Erro ao apagar: ${error.message}\n\nSolução: vai ao Supabase Dashboard → SQL Editor e corre:\nCREATE POLICY "allow_delete" ON public.error_logs FOR DELETE USING (true);`);
      return;
    }
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  const clearAllErrors = async () => {
    if (!confirm("Apagar todos os logs de erro?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("error_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      alert(`Erro ao apagar: ${error.message}\n\nSolução: vai ao Supabase Dashboard → SQL Editor e corre:\nCREATE POLICY "allow_delete" ON public.error_logs FOR DELETE USING (true);`);
      return;
    }
    setErrors([]);
    alert("Logs apagados com sucesso.");
  };

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#12121e] flex items-center justify-center p-4">
        <div className="bg-[#13132B] border border-gold/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="font-playfair text-white font-bold">Admin Panel</h1>
              <p className="text-xs text-white/40">Kyro Clean Solutions</p>
            </div>
          </div>
          <input
            type="password"
            placeholder="Password de acesso"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && pwd === ADMIN_PASSWORD) { sessionStorage.setItem('kyro_admin', '1'); setAuthed(true); } }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-gold/50 mb-4 text-sm"
          />
          <button
            onClick={() => {
              if (pwd === ADMIN_PASSWORD) {
                sessionStorage.setItem('kyro_admin', '1');
                setAuthed(true);
              } else {
                alert("Password incorreta");
              }
            }}
            className="w-full bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // ── Main panel ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f5f7] font-sans">
      {/* Top Bar */}
      <header className="bg-[#0B2F2A] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h1 className="font-playfair text-lg font-bold text-white leading-tight">Admin Panel</h1>
              <p className="text-xs text-white/40">Kyro Clean Solutions</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-gold transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-gold/30">
            <Home className="w-3.5 h-3.5" /> Ver Site
          </Link>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 pb-0 overflow-x-auto scrollbar-none">
          {([
            { id: "crm",       label: "CRM",          icon: Users },
            { id: "import",    label: "Importar BD",   icon: Upload },
            { id: "sitemap",   label: "Sitemaps",      icon: Globe },
            { id: "errors",    label: "Error Log",     icon: AlertTriangle },
            { id: "metrics",   label: "Métricas Quiz", icon: BarChart3 },
            { id: "reviews",   label: "Reviews",       icon: Star },
            { id: "seo-stats", label: "SEO Stats",     icon: Activity },
            { id: "seo-pages", label: "SEO Páginas",   icon: Search },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-t border-x -mb-px ${
                activeTab === tab.id
                  ? "bg-[#f4f5f7] text-navy border-white/20 border-b-[#f4f5f7]"
                  : "text-white/50 hover:text-white border-transparent"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── SITEMAP MONITOR ────────────────────────────────────────── */}
        {activeTab === "sitemap" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-navy">Sitemap Monitor</h2>
                <p className="text-sm text-gray-500">10 sub-sitemaps · {Object.values(sitemapCounts).reduce((a, c) => a + c, 0).toLocaleString("pt-PT")} URLs indexadas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SITEMAPS.map((sm) => {
                const isExpanded = expandedSitemap === sm.file;
                const cachedUrls = sitemapUrlCache[sm.file];
                return (
                  <div key={sm.file} className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${isExpanded ? "border-gold/30 shadow-md col-span-full" : "border-gray-100 hover:shadow-md"}`}>
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center flex-shrink-0">
                          <sm.icon className="w-4 h-4 text-navy/60" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-navy text-sm leading-tight">{sm.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{sm.description}</p>
                        </div>
                        {sm.file !== "sitemap-index.xml" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (isExpanded) {
                                setExpandedSitemap(null);
                              } else {
                                if (!cachedUrls) {
                                  setSitemapUrlCache(prev => ({ ...prev, [sm.file]: getSitemapUrls(sm.file) }));
                                }
                                setExpandedSitemap(sm.file);
                              }
                            }}
                            className={`p-1.5 rounded-lg border transition-colors flex-shrink-0 ${isExpanded ? "bg-gold/10 border-gold/30 text-gold" : "border-gray-200 text-gray-400 hover:text-gold hover:border-gold/30"}`}
                            title={isExpanded ? "Fechar drill-down" : "Ver URLs"}
                          >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>

                      {sitemapCounts[sm.file] != null && (
                        <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center justify-between border border-gray-100">
                          <span className="text-xs text-gray-500">URLs</span>
                          <span className="text-xl font-bold text-navy font-playfair">{sitemapCounts[sm.file].toLocaleString("pt-PT")}</span>
                        </div>
                      )}

                      {sitemapRegionBreakdowns[sm.file] && (
                        <div className="grid grid-cols-2 gap-1.5 mb-4">
                          {sitemapRegionBreakdowns[sm.file].map(rb => (
                            <div key={rb.region} className="bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100 flex items-center justify-between">
                              <span className="text-[10px] text-gray-500 truncate">{ADMIN_REGION_LABELS[rb.region]}</span>
                              <span className="text-xs font-bold text-navy flex-shrink-0 ml-1">{rb.count.toLocaleString("pt-PT")}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 truncate">
                          /{sm.file}
                        </code>
                        <a
                          href={`/${sm.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir XML"
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gold hover:border-gold/30 transition-colors flex-shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* ── Drill-down URL list ── */}
                    {isExpanded && cachedUrls && (
                      <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-navy/60 uppercase tracking-widest">
                            {cachedUrls.length.toLocaleString("pt-PT")} URLs geradas
                          </p>
                          <span className="text-[10px] text-gray-400">a mostrar primeiras 100</span>
                        </div>
                        <div className="max-h-72 overflow-y-auto space-y-0.5 pr-1">
                          {cachedUrls.slice(0, 100).map((url, i) => (
                            <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white transition-colors group">
                              <code className="flex-1 text-[11px] font-mono text-gray-500 truncate">{url}</code>
                              <Link
                                to={url}
                                target="_blank"
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gold transition-all flex-shrink-0"
                                title="Abrir"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          ))}
                          {cachedUrls.length > 100 && (
                            <p className="text-center text-xs text-gray-400 py-2">
                              + {(cachedUrls.length - 100).toLocaleString("pt-PT")} URLs adicionais
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* GSC links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-4">
              <h3 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gold" />
                Links úteis para indexação
              </h3>
              <div className="space-y-2">
                {[
                  { label: "Google Search Console: Submeter sitemap", url: "https://search.google.com/search-console" },
                  { label: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters" },
                  { label: "Google Rich Results Test", url: "https://search.google.com/test/rich-results" },
                ].map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-100 hover:border-gold/20 hover:bg-gold/5 transition-all group"
                  >
                    <span className="text-sm text-navy/80">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gold transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ERROR LOG ──────────────────────────────────────────────── */}
        {activeTab === "errors" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy">Error Log</h2>
                <p className="text-sm text-gray-500">Últimos 50 erros registados no site</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchErrors}
                  disabled={errorsLoading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${errorsLoading ? "animate-spin" : ""}`} />
                  Atualizar
                </button>
                {errors.length > 0 && (
                  <button
                    onClick={clearAllErrors}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar todos
                  </button>
                )}
              </div>
            </div>

            {errorsError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">Tabela não encontrada</p>
                <p>{errorsError}</p>
                <p className="mt-2 text-xs text-amber-600">
                  Corre o SQL em <code>supabase/migrations/20240101_admin_tables.sql</code> no teu projeto Supabase.
                </p>
              </div>
            )}

            {errorsLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!errorsLoading && !errorsError && errors.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-60" />
                <p className="text-navy font-semibold">Sem erros registados</p>
                <p className="text-sm text-gray-400 mt-1">O site está a funcionar sem erros detectados.</p>
              </div>
            )}

            {!errorsLoading && errors.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gravidade</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mensagem</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">URL</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Data</th>
                        <th className="w-10 px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {errors.map(err => (
                        <tr key={err.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                              err.severity === "error"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : err.severity === "warning"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}>
                              {err.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-navy font-medium text-xs max-w-[300px] truncate">{err.message}</p>
                            {err.source && (
                              <p className="text-gray-400 text-[10px] font-mono mt-0.5 truncate max-w-[300px]">
                                {err.source}{err.line_number ? `:${err.line_number}` : ""}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs text-gray-400 font-mono truncate max-w-[200px] block">{err.url ?? "-"}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-xs text-gray-400">
                              {new Date(err.created_at).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => deleteError(err.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Setup instructions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold" />
                Rastreamento de erros ativo
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                O site captura automaticamente <code className="bg-gray-100 px-1 rounded">window.onerror</code> e <code className="bg-gray-100 px-1 rounded">unhandledrejection</code>
                e guarda na tabela <code className="bg-gray-100 px-1 rounded">error_logs</code> do Supabase.
              </p>
              <p className="text-xs text-gray-400">
                Se a tabela ainda não existe, corre o ficheiro <code className="bg-gray-100 px-1 rounded">supabase/migrations/20240101_admin_tables.sql</code> no teu Supabase.
              </p>
            </div>
          </div>
        )}

        {/* ── QUIZ METRICS ───────────────────────────────────────────── */}
        {activeTab === "metrics" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy">Métricas do Quiz</h2>
                <p className="text-sm text-gray-500">Funil de conversão e dados de comportamento · localhost excluído</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchMetrics}
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
        )}

        {/* ── REVIEWS TOOL ───────────────────────────────────────────── */}
        {activeTab === "reviews" && <ReviewsTab />}

        {/* ── CRM ────────────────────────────────────────────────────── */}
        {activeTab === "crm" && (
          <div className="bg-[#071a12] rounded-2xl p-4 -mx-2">
            <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>}>
              <AdminDashboard embedded />
            </Suspense>
          </div>
        )}

        {/* ── IMPORTAR BD ────────────────────────────────────────────── */}
        {activeTab === "import" && (
          <div className="bg-[#071a12] rounded-2xl p-6 max-w-2xl">
            <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>}>
              <AdminImport embedded />
            </Suspense>
          </div>
        )}

        {/* ── SEO STATS ──────────────────────────────────────────────── */}
        {activeTab === "seo-stats" && (
          <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminManager embedded />
          </Suspense>
        )}

        {/* ── SEO PÁGINAS ────────────────────────────────────────────── */}
        {activeTab === "seo-pages" && (
          <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminSeoPages embedded />
          </Suspense>
        )}

      </main>
    </div>
  );
};

// ── Reviews WhatsApp Generator ────────────────────────────────────────────────
const serviceOptions = [
  { value: "sofa", label: "Sofá" },
  { value: "colchao", label: "Colchão" },
  { value: "tapete", label: "Tapete" },
  { value: "cadeiras", label: "Cadeiras" },
  { value: "alcatifa", label: "Alcatifa" },
  { value: "impermeabilizacao", label: "Impermeabilização" },
];

const ReviewsTab = () => {
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("Porto");
  const [servico, setServico] = useState("sofa");
  const [copied, setCopied] = useState(false);

  const reviewPageUrl = `${SITE_URL}/obrigado-pelo-servico?nome=${encodeURIComponent(nome || "Cliente")}&cidade=${encodeURIComponent(cidade)}&servico=${encodeURIComponent(servico)}`;

  const servicoLabel = serviceOptions.find(s => s.value === servico)?.label ?? servico;

  const whatsappMsg = `Olá ${nome || "Cliente"}! Obrigado por escolher a Kyro Clean para a limpeza do seu ${servicoLabel.toLowerCase()} em ${cidade}. Esperamos que tenha ficado completamente satisfeito! Se tiver 1 minuto, uma avaliação no Google ajuda-nos muito a chegar a mais clientes em ${cidade}: ${reviewPageUrl}`;

  const copyMsg = async () => {
    await navigator.clipboard.writeText(whatsappMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-navy">Gerador de Pedido de Review</h2>
        <p className="text-sm text-gray-500 mt-1">Preenche os dados do cliente → copia a mensagem → envia no WhatsApp.</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1">Nome do cliente</label>
            <input
              type="text"
              placeholder="ex: Ana Silva"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1">Cidade</label>
            <input
              type="text"
              placeholder="ex: Porto"
              value={cidade}
              onChange={e => setCidade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1">Serviço</label>
            <select
              value={servico}
              onChange={e => setServico(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold/50 transition-colors bg-white"
            >
              {serviceOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview URL */}
        <div>
          <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1">Link da página de review</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 truncate text-gray-600">
              {reviewPageUrl}
            </code>
            <a
              href={reviewPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gold hover:border-gold/30 transition-colors flex-shrink-0"
              title="Pré-visualizar"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Message preview */}
        <div>
          <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1">Mensagem para WhatsApp</label>
          <div className="bg-[#DCF8C6] rounded-2xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap border border-gray-100">
            {whatsappMsg}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={copyMsg}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${copied ? "bg-green-500 text-white" : "bg-gold text-navy hover:bg-[#d4c57b]"}`}
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado!" : "Copiar mensagem"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Abrir WhatsApp
          </a>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" />Impacto</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          O pack dos 3 resultados Google (Local Pack) gera 40-60% de todos os cliques em pesquisas locais.
          Cada review aumenta o rating e a visibilidade. Envia esta mensagem após cada serviço concluído.
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
