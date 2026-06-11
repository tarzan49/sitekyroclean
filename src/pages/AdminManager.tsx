import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Search,
  ExternalLink,
  Home,
  MapPin,
  Layers,
  FileText,
  AlertTriangle,
  DollarSign,
  ChevronRight,
  Globe,
  Settings2,
  Sparkles,
  Star,
  Shield,
  Zap,
  Tag,
  CheckCircle,
  Info,
  BarChart3,
  Activity,
} from "lucide-react";
import { getAllLocationRoutes, services, cities } from "@/data/locationSeoData";
import { getAllFreguesiaRoutes } from "@/data/freguesiaSeoData";
import { getAllMaterialRoutes, getAllMaterialCityRoutes } from "@/data/materialSeoData";
import { getAllPriceRoutes } from "@/data/priceSeoData";
import { getAllProblemCityRoutes } from "@/data/problemCitySeoData";
import { getAllProblems } from "@/data/problemSeoData";
import { getAllKeywordVariantRoutes } from "@/data/keywordVariantData";

// ─── Pre-compute route counts (run once) ─────────────────────────────────────
const locationRoutes = getAllLocationRoutes();
const freguesiaRoutes = getAllFreguesiaRoutes();
const materialRoutes = getAllMaterialRoutes();
const materialCityRoutes = getAllMaterialCityRoutes();
const priceRoutes = getAllPriceRoutes();
const problemCityRoutes = getAllProblemCityRoutes();
const allProblems = getAllProblems();
const keywordVariantRoutes = getAllKeywordVariantRoutes();

const STATS = [
  {
    label: "Serviços Principais",
    value: services.length,
    icon: Sparkles,
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
  },
  {
    label: "Localidade × Serviço",
    value: locationRoutes.length,
    icon: MapPin,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    label: "Freguesia × Serviço",
    value: freguesiaRoutes.length,
    icon: Layers,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    label: "Páginas de Problema",
    value: allProblems.length,
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    label: "Problema × Cidade",
    value: problemCityRoutes.length,
    icon: Tag,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    label: "Material × Serviço",
    value: materialRoutes.length + materialCityRoutes.length,
    icon: FileText,
    color: "text-teal",
    bg: "bg-teal/10",
    border: "border-teal/20",
  },
  {
    label: "Páginas de Preço",
    value: priceRoutes.length,
    icon: DollarSign,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    label: "Variantes Keyword",
    value: keywordVariantRoutes.length,
    icon: Zap,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    label: "TOTAL URLs Geradas",
    value:
      services.length +
      locationRoutes.length +
      freguesiaRoutes.length +
      allProblems.length +
      problemCityRoutes.length +
      materialRoutes.length +
      materialCityRoutes.length +
      priceRoutes.length +
      keywordVariantRoutes.length,
    icon: Globe,
    color: "text-navy",
    bg: "bg-navy/10",
    border: "border-navy/20",
    highlight: true,
  },
];

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "limpeza-sofas": <Sparkles className="w-5 h-5" />,
  "limpeza-colchoes": <Star className="w-5 h-5" />,
  "limpeza-tapetes": <Layers className="w-5 h-5" />,
  "limpeza-cadeiras": <Zap className="w-5 h-5" />,
  "limpeza-alcatifas": <Shield className="w-5 h-5" />,
  impermeabilizacao: <CheckCircle className="w-5 h-5" />,
};

const SERVICE_FILES: Record<string, string> = {
  "limpeza-sofas": "src/pages/LimpezaSofas.tsx",
  "limpeza-colchoes": "src/pages/LimpezaColchoes.tsx",
  "limpeza-tapetes": "src/pages/LimpezaTapetes.tsx",
  "limpeza-cadeiras": "src/pages/LimpezaCadeiras.tsx",
  "limpeza-alcatifas": "src/pages/LimpezaAlcatifas.tsx",
  impermeabilizacao: "src/pages/Impermeabilizacao.tsx",
};

// ─── Location Explorer ────────────────────────────────────────────────────────
interface LocationResult {
  label: string;
  url: string;
  type: string;
  typeColor: string;
}

function buildLocationIndex(): LocationResult[] {
  const results: LocationResult[] = [];

  // City × service
  locationRoutes.forEach((r) => {
    const svc = services.find((s) => s.slug === r.serviceSlug);
    const city = cities.find((c) => c.slug === r.citySlug);
    if (svc && city) {
      results.push({
        label: `${svc.name} em ${city.name}`,
        url: r.path,
        type: "Localidade",
        typeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      });
    }
  });

  // Freguesia × service
  freguesiaRoutes.slice(0, 800).forEach((r) => {
    const svc = services.find((s) => s.slug === r.serviceSlug);
    results.push({
      label: `${svc?.name ?? r.serviceSlug} · ${r.freguesiaSlug} (${r.citySlug})`,
      url: r.path,
      type: "Freguesia",
      typeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    });
  });

  // Price pages
  priceRoutes.forEach((r) => {
    results.push({
      label: `Preço: ${r.serviceSlug} em ${r.citySlug}`,
      url: r.path,
      type: "Preço",
      typeColor: "bg-green-500/10 text-green-700 border-green-500/20",
    });
  });

  return results;
}

const locationIndex = buildLocationIndex();

// ─── Component ────────────────────────────────────────────────────────────────
// Keyword variant service key mapping
const SERVICE_VARIANT_KEY: Record<string, string> = {
  "limpeza-sofas": "sofa",
  "limpeza-colchoes": "colchao",
  "limpeza-tapetes": "tapetes",
  "limpeza-cadeiras": "cadeiras",
  "limpeza-alcatifas": "alcatifas",
};

const AdminManager = ({ embedded = false }: { embedded?: boolean }) => {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const filteredLocations = useMemo(() => {
    if (!search.trim() || search.length < 2) return [];
    const q = search.toLowerCase();
    return locationIndex
      .filter(
        (r) =>
          r.label.toLowerCase().includes(q) ||
          r.url.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [search]);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-[#f4f5f7] font-sans"}>
      {!embedded && (
        <>
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-amber-800">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">Acesso Restrito à Gestão CleanSolutions</span>
            <span className="text-amber-600 hidden sm:inline">- Painel interno, não indexado</span>
          </div>
          <header className="bg-[#0B2F2A] text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center">
                  <Settings2 className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h1 className="font-playfair text-lg font-bold text-white leading-tight">Manager Dashboard</h1>
                  <p className="text-xs text-white/40">Kyro Clean Solutions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/admin-seo-pages" className="hidden sm:flex items-center gap-1.5 text-xs text-white/50 hover:text-gold transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-gold/30">
                  <BarChart3 className="w-3.5 h-3.5" /> SEO Explorer
                </Link>
                <Link to="/" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-gold transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-gold/30">
                  <Home className="w-3.5 h-3.5" /> Ver Site
                </Link>
              </div>
            </div>
          </header>
        </>
      )}

      <main className={embedded ? "space-y-8" : "max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8"}>

        {/* ── SEO Status Cards ──────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-navy/50" />
            <h2 className="text-sm font-bold text-navy/60 uppercase tracking-widest">
              Status das Páginas SEO
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border text-center transition-shadow hover:shadow-md ${
                  stat.highlight
                    ? "col-span-2 bg-[#0B2F2A] border-gold/30"
                    : `bg-white ${stat.border}`
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center ${
                    stat.highlight ? "bg-gold/20" : stat.bg
                  }`}
                >
                  <stat.icon
                    className={`w-4 h-4 ${stat.highlight ? "text-gold" : stat.color}`}
                  />
                </div>
                <p
                  className={`text-2xl font-bold leading-tight ${
                    stat.highlight ? "text-gold font-playfair" : "text-navy"
                  }`}
                >
                  {stat.value.toLocaleString("pt-PT")}
                </p>
                <p
                  className={`text-[11px] font-medium mt-0.5 leading-tight ${
                    stat.highlight ? "text-white/50" : "text-gray-500"
                  }`}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Serviços Principais ───────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-navy/50" />
            <h2 className="text-sm font-bold text-navy/60 uppercase tracking-widest">
              Serviços Principais
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc) => {
              const cityCount = locationRoutes.filter(r => r.serviceSlug === svc.slug).length;
              const materialCount = materialRoutes.filter(r => r.serviceSlug === svc.slug).length
                + materialCityRoutes.filter(r => r.serviceSlug === svc.slug).length;
              const priceCount = priceRoutes.filter(r => r.serviceSlug === svc.slug).length;
              const variantKey = SERVICE_VARIANT_KEY[svc.slug];
              const variantCount = variantKey
                ? keywordVariantRoutes.filter(r => r.serviceKey === variantKey).length
                : 0;
              const isExpanded = expandedService === svc.slug;
              const totalVariants = cityCount + materialCount + priceCount + variantCount;
              return (
                <div
                  key={svc.slug}
                  className={`bg-white rounded-2xl border shadow-sm transition-all group overflow-hidden ${isExpanded ? "border-gold/30 shadow-md" : "border-gray-100 hover:shadow-md"}`}
                >
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center text-navy/60 group-hover:bg-gold/10 group-hover:text-gold group-hover:border-gold/20 transition-all">
                          {SERVICE_ICONS[svc.slug]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-navy text-sm leading-tight">{svc.name}</h3>
                          <span className="text-xs text-gold font-medium">{svc.priceFrom}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                        {cityCount} cidades
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 border border-gray-100">
                      <p className="text-[11px] text-gray-400 mb-0.5">Ficheiro</p>
                      <p className="text-xs font-mono text-navy/70 truncate">{SERVICE_FILES[svc.slug]}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 truncate">
                        {svc.baseRoute}
                      </code>
                      <button
                        type="button"
                        onClick={() => setExpandedService(isExpanded ? null : svc.slug)}
                        title={isExpanded ? "Fechar variantes" : "Ver variantes SEO"}
                        className={`p-1.5 rounded-lg border transition-colors ${isExpanded ? "bg-gold/10 border-gold/30 text-gold" : "border-gray-200 text-gray-400 hover:text-navy hover:border-navy/20"}`}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        to={svc.baseRoute}
                        target="_blank"
                        title="Abrir página"
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gold hover:border-gold/30 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* ── Variant drill-down ── */}
                  {isExpanded && (
                    <div className="border-t border-gold/10 bg-gold/[0.03] px-5 py-4">
                      <p className="text-[10px] font-bold text-navy/40 uppercase tracking-widest mb-3">
                        Variantes SEO: {totalVariants.toLocaleString("pt-PT")} páginas no total
                      </p>
                      <div className="space-y-2">
                        {[
                          { label: "Localidade × Serviço", count: cityCount, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
                          { label: "Material / Cidade", count: materialCount, color: "bg-teal-500/10 text-teal-700 border-teal-500/20" },
                          { label: "Preço × Cidade", count: priceCount, color: "bg-green-500/10 text-green-700 border-green-500/20" },
                          { label: "Higienização / Lavagem", count: variantCount, color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
                        ].map(row => (
                          <div key={row.label} className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${row.color}`}>
                              {row.label}
                            </span>
                            <span className="text-sm font-bold text-navy tabular-nums">
                              {row.count.toLocaleString("pt-PT")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Explorador de Localidades ─────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-navy/50" />
            <h2 className="text-sm font-bold text-navy/60 uppercase tracking-widest">
              Explorador de Localidades
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {locationRoutes.length + priceRoutes.length + Math.min(800, freguesiaRoutes.length)} páginas indexadas
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {/* Search input */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar cidade, freguesia ou serviço... (ex: Porto, Paranhos, sofás)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none text-sm text-navy placeholder:text-gray-400 transition-colors"
              />
            </div>

            {/* City quick pills */}
            {!search && (
              <div>
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  Cidades disponíveis
                </p>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <button
                      key={city.slug}
                      type="button"
                      onClick={() => setSearch(city.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-navy/70 hover:bg-gold/10 hover:border-gold/30 hover:text-navy transition-all"
                    >
                      <MapPin className="w-3 h-3 text-gold" />
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {search.length >= 2 && (
              <div>
                {filteredLocations.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhuma página encontrada para "{search}"</p>
                    <p className="text-xs mt-1">Tente um nome de cidade ou serviço diferente</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-3">
                      {filteredLocations.length} resultados
                      {filteredLocations.length === 40 && " (primeiros 40)"}
                    </p>
                    <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                      {filteredLocations.map((r, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-gold/20 hover:bg-gold/5 transition-all group"
                        >
                          <span
                            className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md border ${r.typeColor}`}
                          >
                            {r.type}
                          </span>
                          <span className="flex-1 text-sm text-navy/80 truncate">
                            {r.label}
                          </span>
                          <code className="hidden sm:inline text-[11px] text-gray-400 font-mono truncate max-w-[200px]">
                            {r.url}
                          </code>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => copyUrl(r.url)}
                              className="p-1 rounded text-gray-300 hover:text-navy transition-colors"
                              title="Copiar URL"
                            >
                              {copied === r.url ? (
                                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <Info className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <Link
                              to={r.url}
                              target="_blank"
                              className="p-1 rounded text-gray-300 hover:text-gold transition-colors"
                              title="Abrir página"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Acesso Rápido ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-navy/50" />
            <h2 className="text-sm font-bold text-navy/60 uppercase tracking-widest">
              Acesso Rápido
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pages internas */}
            {[
              {
                title: "Homepage",
                url: "/",
                desc: "Página principal do site",
                icon: Home,
                color: "text-navy",
              },
              {
                title: "Antes & Depois",
                url: "/antes-depois-limpeza",
                desc: "Galeria de resultados",
                icon: Star,
                color: "text-gold",
              },
              {
                title: "FAQ Estofos",
                url: "/perguntas-frequentes-limpeza-estofos",
                desc: "Perguntas frequentes sobre limpeza",
                icon: Info,
                color: "text-blue-500",
              },
              {
                title: "Glossário",
                url: "/glossario-limpeza-estofos",
                desc: "Termos técnicos de estofos",
                icon: FileText,
                color: "text-emerald-600",
              },
              {
                title: "Áreas de Serviço",
                url: "/areas-de-servico",
                desc: "Mapa de cobertura",
                icon: MapPin,
                color: "text-teal",
              },
              {
                title: "SEO Explorer",
                url: "/admin-seo-pages",
                desc: "Tabela completa de todas as páginas",
                icon: BarChart3,
                color: "text-purple-500",
              },
            ].map((item) => (
              <Link
                key={item.url}
                to={item.url}
                target={item.url.startsWith("/admin") ? undefined : "_blank"}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gold/20 transition-all group p-4"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/20 transition-all flex-shrink-0">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-navy text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gold ml-auto flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── Páginas Long-tail por Categoria ───────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-navy/50" />
            <h2 className="text-sm font-bold text-navy/60 uppercase tracking-widest">
              Amostras de Páginas Long-Tail
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Localidade */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  Localidade × Serviço
                </span>
                <span className="text-xs text-gray-400">{locationRoutes.length} páginas</span>
              </div>
              <div className="space-y-1.5">
                {locationRoutes.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <code className="text-xs text-gray-500 font-mono">{r.path}</code>
                    <Link to={r.path} target="_blank" className="text-gray-300 hover:text-gold transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
              <Link
                to="/admin-seo-pages"
                className="mt-3 flex items-center gap-1 text-xs text-gold hover:underline font-medium"
              >
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Freguesia */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  Freguesia × Serviço
                </span>
                <span className="text-xs text-gray-400">{freguesiaRoutes.length} páginas</span>
              </div>
              <div className="space-y-1.5">
                {freguesiaRoutes.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <code className="text-xs text-gray-500 font-mono truncate max-w-[260px]">{r.path}</code>
                    <Link to={r.path} target="_blank" className="text-gray-300 hover:text-gold transition-colors ml-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
              <Link
                to="/admin-seo-pages"
                className="mt-3 flex items-center gap-1 text-xs text-gold hover:underline font-medium"
              >
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Preço */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2 py-1 rounded-md bg-green-500/10 text-green-700 border border-green-500/20">
                  Preço × Cidade
                </span>
                <span className="text-xs text-gray-400">{priceRoutes.length} páginas</span>
              </div>
              <div className="space-y-1.5">
                {priceRoutes.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <code className="text-xs text-gray-500 font-mono">{r.path}</code>
                    <Link to={r.path} target="_blank" className="text-gray-300 hover:text-gold transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Problema */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2 py-1 rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/20">
                  Problema × Keyword
                </span>
                <span className="text-xs text-gray-400">{allProblems.length} páginas</span>
              </div>
              <div className="space-y-1.5">
                {allProblems.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <code className="text-xs text-gray-500 font-mono truncate max-w-[260px]">/problemas/{p.slug}</code>
                    <Link to={`/problemas/${p.slug}`} target="_blank" className="text-gray-300 hover:text-gold transition-colors ml-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="pb-8 text-center">
          <p className="text-xs text-gray-400">
            Kyro Clean Solutions: Manager Dashboard interno &middot; Não indexado
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminManager;
