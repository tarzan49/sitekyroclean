// Hyper-local SEO: Freguesia (neighborhood) level pages
// Each freguesia × service generates a unique landing page

import { services } from "./serviceCatalog";
import { getLandingEditorial } from './landingEditorial';
import type { LandingService } from './landingFaqPool';

import { municipiosComFreguesias, type Freguesia, type MunicipioGroup } from './freguesiaList';

export { municipiosComFreguesias };
export type { Freguesia, MunicipioGroup };

// ─── Route generation ─────────────────────────────────────────────
export interface FreguesiaRoute {
  path: string;
  serviceSlug: string;
  citySlug: string;
  freguesiaSlug: string;
}

export function getAllFreguesiaRoutes(): FreguesiaRoute[] {
  const routes: FreguesiaRoute[] = [];
  for (const m of municipiosComFreguesias) {
    for (const f of m.freguesias) {
      for (const svc of services) {
        routes.push({
          path: `/${svc.slug}-${m.slug}-${f.slug}`,
          serviceSlug: svc.slug,
          citySlug: m.slug,
          freguesiaSlug: f.slug,
        });
      }
    }
  }
  return routes;
}

// ─── Get freguesia data ───────────────────────────────────────────
export function getFreguesia(municipioSlug: string, freguesiaSlug: string): Freguesia | null {
  const m = municipiosComFreguesias.find(m => m.slug === municipioSlug);
  if (!m) return null;
  const f = m.freguesias.find(f => f.slug === freguesiaSlug);
  if (!f) return null;
  return {
    name: f.name,
    slug: f.slug,
    municipio: m.name,
    municipioSlug: m.slug,
    nearby: f.nearby,
  };
}

// ─── Get nearby freguesias with full data ─────────────────────────
export function getNearbyFreguesias(municipioSlug: string, nearbySlugs: string[]): Freguesia[] {
  const m = municipiosComFreguesias.find(m => m.slug === municipioSlug);
  if (!m) return [];
  return nearbySlugs
    .map(slug => {
      const f = m.freguesias.find(f => f.slug === slug);
      return f ? { name: f.name, slug: f.slug, municipio: m.name, municipioSlug: m.slug, nearby: f.nearby } : null;
    })
    .filter(Boolean) as Freguesia[];
}

// ─── Content generator for freguesia pages (uses dynamic spintax engine) ────
import { getDynamicContent } from "./freguesiaContentEngine";

const parishMunicipalities = new Map<string, Set<string>>();
for (const municipality of municipiosComFreguesias) {
  for (const parish of municipality.freguesias) {
    const owners = parishMunicipalities.get(parish.name) ?? new Set<string>();
    owners.add(municipality.name);
    parishMunicipalities.set(parish.name, owners);
  }
}

export function generateFreguesiaContent(
  serviceName: string,
  serviceSlug: string,
  priceFrom: string,
  freguesia: string,
  freguesiaSlug: string,
  municipio: string,
) {
  const content = getDynamicContent(serviceName, serviceSlug, priceFrom, freguesia, freguesiaSlug, municipio);
  return {
    ...content,
    h1: (parishMunicipalities.get(freguesia)?.size ?? 0) > 1 ? `${content.h1}, ${municipio}` : content.h1,
    ...getLandingEditorial({ family: 'freguesia', serviceSlug: serviceSlug as LandingService, serviceLabel: serviceName, place: freguesia, municipality: municipio }),
  };
}

// ─── Stats ────────────────────────────────────────────────────────
export function getFreguesiaStats() {
  let totalFreguesias = 0;
  for (const m of municipiosComFreguesias) {
    totalFreguesias += m.freguesias.length;
  }
  return {
    municipios: municipiosComFreguesias.length,
    freguesias: totalFreguesias,
    totalPages: totalFreguesias * services.length,
  };
}
