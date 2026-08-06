import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ExternalLink, Eye, EyeOff, FileText, MapPin, AlertTriangle, Settings2, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAllProblems, problemCategories } from "@/data/problemSeoData";
import { getAllLocationRoutes, services, cities } from "@/data/locationSeoData";
import { getAllFreguesiaRoutes, municipiosComFreguesias } from "@/data/freguesiaSeoData";
import { getAllKeywordVariantRoutes } from "@/data/keywordVariantData";
import { getAdminRegion, getRegionForLocationPart, ADMIN_REGIONS, ADMIN_REGION_LABELS, type AdminRegion } from "@/data/regionUtils";

type PageType = 'service' | 'location' | 'problem' | 'freguesia' | 'variant';

interface PageEntry {
  type: PageType;
  title: string;
  url: string;
  keyword: string;
  visible: boolean;
  category?: string;
  region?: AdminRegion;
}

const AdminSeoPages = ({ embedded = false }: { embedded?: boolean }) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PageType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<AdminRegion | 'all'>('all');

  const allPages = useMemo(() => {
    const pages: PageEntry[] = [];

    // Service pages
    services.forEach(svc => {
      pages.push({
        type: 'service',
        title: `${svc.name}: Página Principal`,
        url: svc.baseRoute,
        keyword: svc.name.toLowerCase(),
        visible: true,
        category: 'Serviço Principal',
      });
    });

    // Location pages
    const locationRoutes = getAllLocationRoutes();
    locationRoutes.forEach(route => {
      const svc = services.find(s => s.slug === route.serviceSlug);
      const city = cities.find(c => c.slug === route.citySlug);
      if (svc && city) {
        pages.push({
          type: 'location',
          title: `${svc.name} em ${city.name}`,
          url: route.path,
          keyword: `${svc.name.toLowerCase()} ${city.name.toLowerCase()}`,
          visible: true,
          category: city.name,
          region: getAdminRegion(city.slug) ?? undefined,
        });
      }
    });

    // Problem pages
    const problems = getAllProblems();
    problems.forEach(p => {
      pages.push({
        type: 'problem',
        title: p.h1,
        url: `/problemas/${p.slug}`,
        keyword: p.keyword,
        visible: p.visible,
        category: problemCategories[p.category],
      });
    });

    // Freguesia pages
    const freguesiaRoutes = getAllFreguesiaRoutes();
    freguesiaRoutes.forEach(route => {
      const svc = services.find(s => s.slug === route.serviceSlug);
      const m = municipiosComFreguesias.find(m => m.slug === route.citySlug);
      const f = m?.freguesias.find(f => f.slug === route.freguesiaSlug);
      if (svc && m && f) {
        pages.push({
          type: 'freguesia',
          title: `${svc.name} em ${f.name}, ${m.name}`,
          url: route.path,
          keyword: `${svc.name.toLowerCase()} ${f.name.toLowerCase()}`,
          visible: true,
          category: m.name,
          region: getAdminRegion(m.slug) ?? undefined,
        });
      }
    });

    // Keyword variant pages (higienização/lavagem/impermeabilização × services × locations)
    const VARIANT_LABEL: Record<string, string> = {
      higienizacao: 'Higienização',
      lavagem: 'Lavagem',
      impermeabilizacao: 'Impermeabilização',
    };
    const variantRoutes = getAllKeywordVariantRoutes();
    variantRoutes.forEach(route => {
      const variantLabel = VARIANT_LABEL[route.variantKey] ?? route.variantKey;
      pages.push({
        type: 'variant',
        title: `${variantLabel} ${route.serviceKey}: ${route.locationPart}`,
        url: route.path,
        keyword: `${route.variantKey} ${route.serviceKey} ${route.locationPart}`,
        visible: true,
        category: variantLabel,
        region: getRegionForLocationPart(route.locationPart) ?? undefined,
      });
    });

    return pages;
  }, []);

  const filtered = useMemo(() => {
    let result = allPages;
    if (typeFilter !== 'all') {
      result = result.filter(p => p.type === typeFilter);
    }
    if (regionFilter !== 'all') {
      result = result.filter(p => p.region === regionFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.url.toLowerCase().includes(q) ||
        p.keyword.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allPages, typeFilter, regionFilter, categoryFilter, search]);

  const categories = useMemo(() => {
    const cats = new Set(allPages.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allPages]);

  const stats = useMemo(() => ({
    total: allPages.length,
    service: allPages.filter(p => p.type === 'service').length,
    location: allPages.filter(p => p.type === 'location').length,
    problem: allPages.filter(p => p.type === 'problem').length,
    freguesia: allPages.filter(p => p.type === 'freguesia').length,
    variant: allPages.filter(p => p.type === 'variant').length,
    visible: allPages.filter(p => p.visible).length,
  }), [allPages]);

  const regionStats = useMemo(() => {
    const regionable = allPages.filter(p => p.region);
    return ADMIN_REGIONS.map(region => ({
      region,
      label: ADMIN_REGION_LABELS[region],
      count: regionable.filter(p => p.region === region).length,
    }));
  }, [allPages]);

  const typeLabels: Record<PageType, string> = {
    service: 'Serviço',
    location: 'Localização',
    problem: 'Problema',
    freguesia: 'Freguesia',
    variant: 'Variante',
  };

  const typeColors: Record<PageType, string> = {
    service: 'bg-[#0B2F2A]/10 text-[#0B2F2A] border-[#0B2F2A]/20',
    location: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    problem: 'bg-[#D4AF37]/10 text-[#B8912A] border-[#D4AF37]/20',
    freguesia: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    variant: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-[#FDFDF9]"}>
      {/* Header */}
      {!embedded && (
        <div className="bg-gradient-to-r from-[#071a12] to-[#0B2F2A] text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-[#D4AF37]" />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold font-playfair">Gestão SEO: Páginas</h1>
                  <p className="text-sm text-white/60">Kyro Clean Solutions</p>
                </div>
              </div>
              <Link to="/" className="text-sm text-[#D4AF37] hover:underline">← Voltar ao site</Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={embedded ? "py-4" : "container mx-auto px-4 py-6"}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[
            { label: 'Total páginas', value: stats.total, icon: FileText },
            { label: 'Serviços', value: stats.service, icon: FileText },
            { label: 'Localização', value: stats.location, icon: MapPin },
            { label: 'Freguesias', value: stats.freguesia, icon: MapPin },
            { label: 'Problemas', value: stats.problem, icon: AlertTriangle },
            { label: 'Variantes', value: stats.variant, icon: Zap },
            { label: 'Visíveis', value: stats.visible, icon: Eye },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-[#0B2F2A]/10 text-center">
              <stat.icon className="w-5 h-5 mx-auto mb-1 text-[#0B2F2A]/50" />
              <p className="text-2xl font-bold text-[#111111]">{stat.value}</p>
              <p className="text-xs text-[#111111]/50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Region stats (Localização / Freguesia / Variante only) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {regionStats.map(rs => (
            <button
              key={rs.region}
              type="button"
              onClick={() => setRegionFilter(regionFilter === rs.region ? 'all' : rs.region)}
              className={`rounded-xl p-3 border text-left transition-colors ${regionFilter === rs.region ? 'bg-[#0B2F2A] border-[#0B2F2A] text-white' : 'bg-white border-[#0B2F2A]/10 hover:border-[#D4AF37]/40'}`}
            >
              <p className={`text-lg font-bold ${regionFilter === rs.region ? 'text-white' : 'text-[#111111]'}`}>{rs.count}</p>
              <p className={`text-xs ${regionFilter === rs.region ? 'text-white/70' : 'text-[#111111]/50'}`}>{rs.label}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por título, URL ou keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as PageType | 'all')}
            className="px-3 py-2 rounded-lg border border-[#0B2F2A]/20 bg-white text-sm text-[#111111]"
          >
            <option value="all">Todos os tipos</option>
            <option value="service">Serviço</option>
            <option value="location">Localização</option>
            <option value="freguesia">Freguesia</option>
            <option value="problem">Problema</option>
            <option value="variant">Variante (higienização/lavagem/impermeabilização)</option>
          </select>
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value as AdminRegion | 'all')}
            className="px-3 py-2 rounded-lg border border-[#0B2F2A]/20 bg-white text-sm text-[#111111]"
          >
            <option value="all">Todas as regiões</option>
            {ADMIN_REGIONS.map(region => (
              <option key={region} value={region}>{ADMIN_REGION_LABELS[region]}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#0B2F2A]/20 bg-white text-sm text-[#111111]"
          >
            <option value="all">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-[#111111]/50 mb-4">
          {filtered.length} de {allPages.length} páginas
        </p>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#0B2F2A]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#0B2F2A]/10 bg-[#FDFDF9]">
                  <th className="text-left px-4 py-3 font-semibold text-[#111111]">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#111111]">Título</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#111111] hidden md:table-cell">URL</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#111111] hidden lg:table-cell">Keyword</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#111111] hidden lg:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#111111] hidden xl:table-cell">Região</th>
                  <th className="text-center px-4 py-3 font-semibold text-[#111111] w-20">Visível</th>
                  <th className="text-center px-4 py-3 font-semibold text-[#111111] w-16">Link</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((page, idx) => (
                  <tr key={idx} className="border-b border-[#0B2F2A]/5 hover:bg-[#FDFDF9] transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${typeColors[page.type]}`}>
                        {typeLabels[page.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#111111] max-w-[300px] truncate">
                      {page.title}
                    </td>
                    <td className="px-4 py-3 text-[#111111]/50 hidden md:table-cell font-mono text-xs max-w-[200px] truncate">
                      {page.url}
                    </td>
                    <td className="px-4 py-3 text-[#111111]/50 hidden lg:table-cell text-xs max-w-[180px] truncate">
                      {page.keyword}
                    </td>
                    <td className="px-4 py-3 text-[#111111]/50 hidden lg:table-cell text-xs">
                      {page.category}
                    </td>
                    <td className="px-4 py-3 text-[#111111]/50 hidden xl:table-cell text-xs">
                      {page.region ? ADMIN_REGION_LABELS[page.region] : "N/D"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {page.visible ? (
                        <Eye className="w-4 h-4 text-[#0B2F2A] mx-auto" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[#111111]/30 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link to={page.url} target="_blank" className="text-[#D4AF37] hover:text-[#0B2F2A] transition-colors">
                        <ExternalLink className="w-4 h-4 mx-auto" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSeoPages;
