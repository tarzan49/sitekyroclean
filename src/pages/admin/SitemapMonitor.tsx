import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Map, AlertTriangle, Globe, FileText, Shield, Zap, Star, Target, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { getAllLocationRoutes, services } from "@/data/locationSeoData";
import { getAllFreguesiaRoutes } from "@/data/freguesiaSeoData";
import { getAllMaterialRoutes, getAllMaterialCityRoutes } from "@/data/materialSeoData";
import { getAllPriceRoutes } from "@/data/priceSeoData";
import { getAllProblemCityRoutes } from "@/data/problemCitySeoData";
import { getAllProblems } from "@/data/problemSeoData";
import { getAllKeywordVariantRoutes } from "@/data/keywordVariantData";
import { getAllPackComboRoutes } from "@/data/packComboData";
import { getAllMarcaSofaRoutes } from "@/data/marcaSofaData";
import { getAllMarcaColchaoRoutes } from "@/data/marcaColchaoData";
import { getAllMarcaCadeirasRoutes } from "@/data/marcaCadeirasData";
import { getAllPosts } from "@/data/blogData";
import { getAllEnRoutes } from "@/data/enTouristSeoData";
import { getAllCommercialRoutes } from "@/data/commercialSeoData";
import { getAdminRegion, getRegionForLocationPart, ADMIN_REGIONS, ADMIN_REGION_LABELS, type AdminRegion } from "@/data/regionUtils";

// "Marcas de Sofá" e "Marcas de Colchão" partilham o mesmo ficheiro físico
// (sitemap-marcas.xml) mas aparecem como cartões separados aqui — por isso
// têm um `id` próprio distinto de `file` (usado só para o link/preview do XML).
const SITEMAPS = [
  { id: "sitemap.xml",              file: "sitemap.xml",              name: "Sitemap Index", description: "Índice principal (12 sub-sitemaps)", icon: Globe },
  { id: "sitemap-core.xml",         file: "sitemap-core.xml",         name: "Core (Serviços + Páginas principais)", description: "6 serviços + páginas institucionais", icon: Zap },
  { id: "sitemap-location.xml",     file: "sitemap-location.xml",     name: "Localidade × Serviço", description: "Concelhos × 6 serviços: Porto/Norte, Lisboa/AML, Algarve", icon: Map },
  { id: "sitemap-freguesia.xml",    file: "sitemap-freguesia.xml",    name: "Freguesia × Serviço", description: "Freguesias × 6 serviços: Porto/Norte, Lisboa/AML, Algarve", icon: Map },
  { id: "sitemap-material.xml",     file: "sitemap-material.xml",     name: "Material", description: "Material + Material×Cidade", icon: FileText },
  { id: "sitemap-price.xml",        file: "sitemap-price.xml",        name: "Preço", description: "Preço × concelho", icon: FileText },
  { id: "sitemap-problem.xml",      file: "sitemap-problem.xml",      name: "Problemas", description: "Problema + Problema×Cidade", icon: AlertTriangle },
  { id: "sitemap-keyword-variants.xml", file: "sitemap-keyword-variants.xml", name: "Variantes Keyword", description: "higienização/lavagem/impermeabilização × serviços × locais", icon: Target },
  { id: "sitemap-resources.xml",    file: "sitemap-resources.xml",    name: "Recursos (Blog/FAQ)", description: "Blog + FAQ + Glossário", icon: FileText },
  { id: "sitemap-packs.xml",        file: "sitemap-packs.xml",        name: "Packs", description: "Packs combo × concelho", icon: Target },
  { id: "sitemap-marcas-sofa",      file: "sitemap-marcas.xml",       name: "Marcas de Sofá", description: "8 marcas × 34 concelhos (cidades mais povoadas)", icon: Shield },
  { id: "sitemap-marcas-colchao",   file: "sitemap-marcas.xml",       name: "Marcas de Colchão", description: "6 marcas × 34 concelhos (cidades mais povoadas)", icon: Shield },
  { id: "sitemap-marcas-cadeiras",  file: "sitemap-marcas.xml",       name: "Marcas de Cadeiras", description: "6 marcas × 34 concelhos (cidades mais povoadas)", icon: Shield },
  { id: "sitemap-en.xml",           file: "sitemap-en.xml",           name: "Inglês (Turismo)", description: "Páginas /en/ para turistas — namespace isolado do PT", icon: Globe },
  { id: "sitemap-comercial.xml",    file: "sitemap-comercial.xml",    name: "Comercial (B2B)", description: "Restaurantes/hotéis/escritórios × concelho", icon: Star },
];

function getSitemapUrls(id: string): string[] {
  switch (id) {
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
    case "sitemap-marcas-sofa":
      return getAllMarcaSofaRoutes().map(r => r.path);
    case "sitemap-marcas-colchao":
      return getAllMarcaColchaoRoutes().map(r => r.path);
    case "sitemap-marcas-cadeiras":
      return getAllMarcaCadeirasRoutes().map(r => r.path);
    case "sitemap-en.xml":
      return [
        ...getAllEnRoutes().map(r => r.path),
        "/en/airbnb-portugal-cleaning-guide",
      ];
    case "sitemap-comercial.xml":
      return getAllCommercialRoutes().map(r => r.path);
    default:
      return [];
  }
}

// Only for the 3 sitemaps that carry a citySlug/locationPart.
function getSitemapRegionBreakdown(id: string): { region: AdminRegion; count: number }[] | null {
  let regions: (AdminRegion | null)[];
  switch (id) {
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

// Same URLs as getSitemapUrls(), filtered down to a single region — powers the
// per-region drill-down on the Localidade/Freguesia/Variantes Keyword cards.
function getSitemapUrlsForRegion(id: string, region: AdminRegion): string[] {
  switch (id) {
    case "sitemap-location.xml":
      return getAllLocationRoutes().filter(r => getAdminRegion(r.citySlug) === region).map(r => r.path);
    case "sitemap-freguesia.xml":
      return getAllFreguesiaRoutes().filter(r => getAdminRegion(r.citySlug) === region).map(r => r.path);
    case "sitemap-keyword-variants.xml":
      return getAllKeywordVariantRoutes().filter(r => getRegionForLocationPart(r.locationPart) === region).map(r => r.path);
    default:
      return [];
  }
}

const SitemapMonitor = () => {
  const [expandedSitemap, setExpandedSitemap] = useState<string | null>(null);
  const [sitemapUrlCache, setSitemapUrlCache] = useState<Record<string, string[]>>({});

  const sitemapCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sm of SITEMAPS) {
      if (sm.id === "sitemap.xml") continue;
      counts[sm.id] = getSitemapUrls(sm.id).length;
    }
    return counts;
  }, []);

  const sitemapRegionBreakdowns = useMemo(() => {
    const breakdowns: Record<string, { region: AdminRegion; count: number }[]> = {};
    for (const sm of SITEMAPS) {
      const breakdown = getSitemapRegionBreakdown(sm.id);
      if (breakdown) breakdowns[sm.id] = breakdown;
    }
    return breakdowns;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-navy">Sitemap Monitor</h2>
          <p className="text-sm text-gray-500">12 sub-sitemaps · {Object.values(sitemapCounts).reduce((a, c) => a + c, 0).toLocaleString("pt-PT")} URLs indexadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SITEMAPS.map((sm) => {
          const isExpanded = expandedSitemap === sm.id || expandedSitemap?.startsWith(`${sm.id}::`);
          const activeKey = isExpanded ? expandedSitemap! : null;
          const cachedUrls = activeKey ? sitemapUrlCache[activeKey] : undefined;
          const activeRegion = activeKey?.includes("::") ? activeKey.split("::")[1] as AdminRegion : null;

          const expand = (key: string, loader: () => string[]) => {
            if (expandedSitemap === key) {
              setExpandedSitemap(null);
              return;
            }
            if (!sitemapUrlCache[key]) {
              setSitemapUrlCache(prev => ({ ...prev, [key]: loader() }));
            }
            setExpandedSitemap(key);
          };

          return (
            <div key={sm.id} className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${isExpanded ? "border-gold/30 shadow-md col-span-full" : "border-gray-100 hover:shadow-md"}`}>
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
                  {sm.id !== "sitemap.xml" && (
                    <button
                      type="button"
                      onClick={() => expand(sm.id, () => getSitemapUrls(sm.id))}
                      className={`p-1.5 rounded-lg border transition-colors flex-shrink-0 ${expandedSitemap === sm.id ? "bg-gold/10 border-gold/30 text-gold" : "border-gray-200 text-gray-400 hover:text-gold hover:border-gold/30"}`}
                      title={expandedSitemap === sm.id ? "Fechar drill-down" : "Ver todos os URLs"}
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSitemap === sm.id ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>

                {sitemapCounts[sm.id] != null && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center justify-between border border-gray-100">
                    <span className="text-xs text-gray-500">URLs</span>
                    <span className="text-xl font-bold text-navy font-playfair">{sitemapCounts[sm.id].toLocaleString("pt-PT")}</span>
                  </div>
                )}

                {sitemapRegionBreakdowns[sm.id] && (
                  <div className="grid grid-cols-2 gap-1.5 mb-4">
                    {sitemapRegionBreakdowns[sm.id].map(rb => {
                      const key = `${sm.id}::${rb.region}`;
                      const active = expandedSitemap === key;
                      return (
                        <button
                          key={rb.region}
                          type="button"
                          onClick={() => expand(key, () => getSitemapUrlsForRegion(sm.id, rb.region))}
                          className={`rounded-lg px-2 py-1.5 border flex items-center justify-between transition-colors ${active ? "bg-gold/10 border-gold/30" : "bg-gray-50 border-gray-100 hover:border-gold/30"}`}
                          title={`Ver URLs de ${ADMIN_REGION_LABELS[rb.region]}`}
                        >
                          <span className={`text-[10px] truncate ${active ? "text-gold" : "text-gray-500"}`}>{ADMIN_REGION_LABELS[rb.region]}</span>
                          <span className={`text-xs font-bold flex-shrink-0 ml-1 ${active ? "text-gold" : "text-navy"}`}>{rb.count.toLocaleString("pt-PT")}</span>
                        </button>
                      );
                    })}
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
                      {cachedUrls.length.toLocaleString("pt-PT")} URLs {activeRegion ? `· ${ADMIN_REGION_LABELS[activeRegion]}` : "geradas"}
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
  );
};

export default SitemapMonitor;
