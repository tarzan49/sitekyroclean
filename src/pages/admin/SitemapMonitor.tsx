import { getTreatmentRoutes } from '../../data/treatmentSeoData';
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Map, AlertTriangle, Globe, FileText, Shield, Zap, Star, Target, ChevronDown, ChevronRight, ExternalLink, Search, Layers, MapPin, Sofa } from "lucide-react";
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
type FamilyGroup = "local" | "conteudo" | "marcas" | "base";

const GROUPS: Record<FamilyGroup, { label: string; hint: string; color: string }> = {
  local:    { label: "Páginas locais",  hint: "serviço × cidade, freguesia, preço, packs", color: "#0f3d3a" },
  conteudo: { label: "Conteúdo",        hint: "problemas, materiais, tratamentos, blog",    color: "#D4AF37" },
  marcas:   { label: "Marcas",          hint: "marca × cidade",                              color: "#7c9a92" },
  base:     { label: "Base e nichos",   hint: "serviços, inglês, empresas",                  color: "#c9ccd3" },
};

const FAMILY_GROUP: Record<string, FamilyGroup> = {
  "sitemap-location.xml": "local", "sitemap-freguesia.xml": "local", "sitemap-keyword-variants.xml": "local",
  "sitemap-price.xml": "local", "sitemap-packs.xml": "local",
  "sitemap-problem.xml": "conteudo", "sitemap-material.xml": "conteudo", "sitemap-tratamentos.xml": "conteudo", "sitemap-resources.xml": "conteudo",
  "sitemap-marcas-sofa": "marcas", "sitemap-marcas-colchao": "marcas", "sitemap-marcas-cadeiras": "marcas",
  "sitemap-core.xml": "base", "sitemap-en.xml": "base", "sitemap-comercial.xml": "base",
};

// Serviço a que cada URL pertence, lido do próprio caminho. A impermeabilização
// vem primeiro porque /impermeabilizacao-sofas-porto também diz "sofas".
const SERVICE_MATCHERS: { label: string; test: RegExp }[] = [
  { label: "Impermeabilização", test: /imperme/ },
  { label: "Sofás",     test: /sofa|estofo|chaise/ },
  { label: "Colchões",  test: /colch/ },
  { label: "Tapetes",   test: /tapete/ },
  { label: "Cadeiras",  test: /cadeira/ },
  { label: "Alcatifas", test: /alcatifa/ },
];
const OTHER_SERVICE = "Vários / outros";

function serviceOfPath(path: string): string {
  for (const m of SERVICE_MATCHERS) if (m.test.test(path)) return m.label;
  return OTHER_SERVICE;
}

const SITEMAPS = [
  { id: "sitemap-tratamentos.xml", file: "sitemap-tratamentos.xml", name: "Tratamentos", description: "Anti-ácaros e desbacterização por cidade", icon: Shield },
  { id: "sitemap.xml",              file: "sitemap.xml",              name: "Sitemap Index", description: "Índice principal", icon: Globe },
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
  { id: "sitemap-en.xml",           file: "sitemap-en.xml",           name: "Inglês (Turismo)", description: "Páginas /en/ para turistas, com namespace isolado do PT", icon: Globe },
  { id: "sitemap-comercial.xml",    file: "sitemap-comercial.xml",    name: "Comercial (B2B)", description: "Restaurantes/hotéis/escritórios × concelho", icon: Star },
];

function getSitemapUrls(id: string): string[] {
  switch (id) {
    case "sitemap-tratamentos.xml": return getTreatmentRoutes().map(r => r.path);
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


const FAMILIES = SITEMAPS.filter(sm => sm.id !== "sitemap.xml");
const SUB_SITEMAP_COUNT = new Set(FAMILIES.map(sm => sm.file)).size;
const fmt = (n: number) => n.toLocaleString("pt-PT");
const pct = (n: number, total: number) => total ? `${((n / total) * 100).toLocaleString("pt-PT", { maximumFractionDigits: 1 })}%` : "0%";

const SitemapMonitor = () => {
  const [expandedSitemap, setExpandedSitemap] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<FamilyGroup | null>(null);

  const urlsByFamily = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const sm of FAMILIES) out[sm.id] = getSitemapUrls(sm.id);
    return out;
  }, []);

  const total = useMemo(() => Object.values(urlsByFamily).reduce((a, u) => a + u.length, 0), [urlsByFamily]);

  const groupTotals = useMemo(() => {
    const t: Record<FamilyGroup, number> = { local: 0, conteudo: 0, marcas: 0, base: 0 };
    for (const sm of FAMILIES) t[FAMILY_GROUP[sm.id] ?? "base"] += urlsByFamily[sm.id].length;
    return t;
  }, [urlsByFamily]);

  const serviceTotals = useMemo(() => {
    const t: Record<string, number> = {};
    for (const urls of Object.values(urlsByFamily)) for (const u of urls) {
      const s = serviceOfPath(u);
      t[s] = (t[s] ?? 0) + 1;
    }
    return [...SERVICE_MATCHERS.map(m => m.label), OTHER_SERVICE]
      .map(label => ({ label, count: t[label] ?? 0 }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [urlsByFamily]);

  const regionTotals = useMemo(() => {
    const t: Record<AdminRegion, number> = { amp: 0, norte: 0, centro: 0, lisboa: 0, algarve: 0 };
    for (const sm of FAMILIES) {
      const b = getSitemapRegionBreakdown(sm.id);
      if (b) for (const r of b) t[r.region] += r.count;
    }
    return ADMIN_REGIONS.map(region => ({ region, count: t[region] }));
  }, []);
  const regionSum = regionTotals.reduce((a, r) => a + r.count, 0);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;
    const hits: { url: string; family: string }[] = [];
    let count = 0;
    for (const sm of FAMILIES) for (const u of urlsByFamily[sm.id]) {
      if (!u.toLowerCase().includes(q)) continue;
      count++;
      if (hits.length < 60) hits.push({ url: u, family: sm.name });
    }
    return { hits, count };
  }, [query, urlsByFamily]);

  const families = FAMILIES
    .filter(sm => !groupFilter || FAMILY_GROUP[sm.id] === groupFilter)
    .map(sm => ({ ...sm, count: urlsByFamily[sm.id].length }))
    .sort((a, b) => b.count - a.count);
  const maxFamily = Math.max(1, ...families.map(f => f.count));
  const maxService = Math.max(1, ...serviceTotals.map(s => s.count));
  const maxRegion = Math.max(1, ...regionTotals.map(r => r.count));

  return (
    <div className="space-y-5">
      {/* ── Cabeçalho ── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy">Sitemaps</h2>
          <p className="text-sm text-gray-500">O que o Google recebe para indexar, gerado a partir dos mesmos dados das páginas.</p>
        </div>
        <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy/70 border border-gray-200 bg-white rounded-lg px-3 py-2 hover:border-gold/40 hover:text-navy">
          <Globe className="w-3.5 h-3.5" /> sitemap.xml (índice) <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* ── Totais + composição ── */}
      <div className="bg-[#0f3d3a] text-white rounded-2xl p-5 sm:p-6 shadow-sm overflow-hidden relative">
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {[
            { label: "URLs no sitemap", value: fmt(total), icon: Layers },
            { label: "Ficheiros XML",   value: String(SUB_SITEMAP_COUNT), icon: FileText },
            { label: "Famílias",        value: String(FAMILIES.length), icon: Map },
          ].map(s => (
            <div key={s.label}>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/50"><s.icon className="w-3.5 h-3.5" />{s.label}</div>
              <div className="text-2xl sm:text-4xl font-bold font-playfair text-[#D4AF37] mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex h-4 rounded-full overflow-hidden bg-white/10">
            {(Object.keys(GROUPS) as FamilyGroup[]).map(g => (
              <button key={g} type="button" onClick={() => setGroupFilter(groupFilter === g ? null : g)}
                title={`${GROUPS[g].label}: ${fmt(groupTotals[g])}`}
                style={{ width: `${(groupTotals[g] / Math.max(total, 1)) * 100}%`, background: GROUPS[g].color, opacity: groupFilter && groupFilter !== g ? 0.3 : 1 }}
                className="h-full transition-opacity border-r border-[#0f3d3a] last:border-r-0" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {(Object.keys(GROUPS) as FamilyGroup[]).map(g => {
              const active = groupFilter === g;
              return (
                <button key={g} type="button" onClick={() => setGroupFilter(active ? null : g)}
                  className={`text-left rounded-xl px-3 py-2 border transition-colors ${active ? "border-[#D4AF37] bg-white/10" : "border-white/10 hover:border-white/30"}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-white/30" style={{ background: GROUPS[g].color }} />
                    <span className="text-xs font-semibold">{GROUPS[g].label}</span>
                  </div>
                  <div className="text-sm font-bold mt-0.5">{fmt(groupTotals[g])} <span className="text-white/50 font-normal text-xs">· {pct(groupTotals[g], total)}</span></div>
                  <div className="text-[10px] text-white/45 leading-tight mt-0.5">{GROUPS[g].hint}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Por serviço e por região ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-navy text-sm flex items-center gap-2"><Sofa className="w-4 h-4 text-[#D4AF37]" />Páginas por serviço</h3>
          <p className="text-[11px] text-gray-400 mb-4">Lido do endereço de cada página. Packs e páginas gerais ficam em "Vários".</p>
          <div className="space-y-2.5">
            {serviceTotals.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-navy/80 font-medium">{s.label}</span>
                  <span className="text-gray-500"><b className="text-navy">{fmt(s.count)}</b> · {pct(s.count, total)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(s.count / maxService) * 100}%`, background: s.label === OTHER_SERVICE ? "#c9ccd3" : "#D4AF37" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-navy text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-[#D4AF37]" />Páginas locais por região</h3>
          <p className="text-[11px] text-gray-400 mb-4">Localidade, freguesia e variantes ({fmt(regionSum)} páginas).</p>
          <div className="space-y-2.5">
            {regionTotals.map(r => (
              <div key={r.region}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-navy/80 font-medium">{ADMIN_REGION_LABELS[r.region]}</span>
                  <span className="text-gray-500"><b className="text-navy">{fmt(r.count)}</b> · {pct(r.count, regionSum)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#0f3d3a]" style={{ width: `${(r.count / maxRegion) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pesquisa ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <label className="relative block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Procurar uma página: ex. sofa-braga, paranhos, natuzzi"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D4AF37]" />
        </label>
        {searchResults && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">
              {searchResults.count === 0 ? "Nenhuma página com esse texto no sitemap." : `${fmt(searchResults.count)} páginas${searchResults.count > searchResults.hits.length ? `, a mostrar ${searchResults.hits.length}` : ""}`}
            </p>
            <div className="max-h-72 overflow-y-auto space-y-0.5">
              {searchResults.hits.map(h => (
                <Link key={h.url} to={h.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 group">
                  <code className="flex-1 text-[11px] font-mono text-gray-600 group-hover:text-navy truncate">{h.url}</code>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 hidden sm:inline">{h.family}</span>
                  <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-[#D4AF37] flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Famílias ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-2">
          <h3 className="font-semibold text-navy text-sm">
            Famílias de páginas{groupFilter && <span className="text-gray-400 font-normal"> · {GROUPS[groupFilter].label}</span>}
          </h3>
          {groupFilter && <button type="button" onClick={() => setGroupFilter(null)} className="text-xs text-[#8B6914] hover:underline">Ver todas</button>}
        </div>
        <div className="divide-y divide-gray-100">
          {families.map(sm => {
            const group = FAMILY_GROUP[sm.id] ?? "base";
            const open = expandedSitemap === sm.id || expandedSitemap?.startsWith(`${sm.id}::`);
            const activeRegion = expandedSitemap?.startsWith(`${sm.id}::`) ? expandedSitemap.split("::")[1] as AdminRegion : null;
            const breakdown = getSitemapRegionBreakdown(sm.id);
            const urls = open ? (activeRegion ? getSitemapUrlsForRegion(sm.id, activeRegion) : urlsByFamily[sm.id]) : [];
            return (
              <div key={sm.id}>
                <button type="button" onClick={() => setExpandedSitemap(open ? null : sm.id)}
                  className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors ${open ? "bg-gray-50" : "hover:bg-gray-50/60"}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${GROUPS[group].color}1f` }}>
                    <sm.icon className="w-4 h-4" style={{ color: group === "base" ? "#6b7280" : GROUPS[group].color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-navy truncate">{sm.name}</span>
                      <span className="text-sm font-bold text-navy flex-shrink-0">{fmt(sm.count)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 mt-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(sm.count / maxFamily) * 100}%`, background: GROUPS[group].color }} />
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 truncate">{sm.description} · {pct(sm.count, total)} do total</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="px-5 pb-5 bg-gray-50">
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {breakdown && (
                        <>
                          <button type="button" onClick={() => setExpandedSitemap(sm.id)}
                            className={`text-[11px] px-2.5 py-1 rounded-full border ${!activeRegion ? "bg-[#0f3d3a] text-white border-[#0f3d3a]" : "bg-white border-gray-200 text-gray-600"}`}>Todas</button>
                          {breakdown.map(rb => (
                            <button key={rb.region} type="button" onClick={() => setExpandedSitemap(`${sm.id}::${rb.region}`)}
                              className={`text-[11px] px-2.5 py-1 rounded-full border ${activeRegion === rb.region ? "bg-[#0f3d3a] text-white border-[#0f3d3a]" : "bg-white border-gray-200 text-gray-600 hover:border-[#D4AF37]"}`}>
                              {ADMIN_REGION_LABELS[rb.region]} · {fmt(rb.count)}
                            </button>
                          ))}
                        </>
                      )}
                      <a href={`/${sm.file}`} target="_blank" rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 hover:text-navy">
                        /{sm.file} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-0.5 bg-white rounded-xl border border-gray-100 p-2">
                      {urls.slice(0, 100).map(url => (
                        <Link key={url} to={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 group">
                          <code className="flex-1 text-[11px] font-mono text-gray-500 group-hover:text-navy truncate">{url}</code>
                          <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-[#D4AF37] flex-shrink-0" />
                        </Link>
                      ))}
                      {urls.length > 100 && (
                        <p className="text-center text-xs text-gray-400 py-2">+ {fmt(urls.length - 100)} páginas (usa a pesquisa acima para encontrar uma)</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Ligações úteis ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Google Search Console", sub: "Submeter e ver indexação", url: "https://search.google.com/search-console" },
          { label: "Bing Webmaster Tools", sub: "Bing e Copilot", url: "https://www.bing.com/webmasters" },
          { label: "Teste de resultados avançados", sub: "Validar o JSON-LD", url: "https://search.google.com/test/rich-results" },
        ].map(link => (
          <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-[#D4AF37]/40 group">
            <span>
              <span className="block text-sm font-medium text-navy">{link.label}</span>
              <span className="block text-[11px] text-gray-400">{link.sub}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#D4AF37]" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SitemapMonitor;
