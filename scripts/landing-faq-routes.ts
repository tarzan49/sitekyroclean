// Read-only inventory of precisely the four families covered by this migration.
import { cities, services, getAllLocationRoutes, getLocationServiceData } from '../src/data/locationSeoData';
import { getAllFreguesiaRoutes, getFreguesia, generateFreguesiaContent } from '../src/data/freguesiaSeoData';
import { getAllPriceRoutes, getPricePageData } from '../src/data/priceSeoData';
import { getAllKeywordVariantRoutes, getKeywordVariantData } from '../src/data/keywordVariantData';
import type { LandingFaq, LandingFaqContext, LandingService } from '../src/data/landingFaqPool';

export interface LandingFaqRoute {
  path: string;
  context: LandingFaqContext;
  faqs: LandingFaq[];
}

export function getLandingFaqRoutes(): LandingFaqRoute[] {
  const records: LandingFaqRoute[] = [];
  for (const route of getAllLocationRoutes()) {
    const data = getLocationServiceData(route.serviceSlug, route.citySlug);
    if (!data) throw new Error(`Missing location: ${route.path}`);
    records.push({ path: route.path, faqs: data.faqs, context: { serviceSlug: route.serviceSlug as LandingService, family: 'localidade', pageKey: route.path, municipality: data.city } });
  }
  for (const route of getAllFreguesiaRoutes()) {
    const parish = getFreguesia(route.citySlug, route.freguesiaSlug);
    const service = services.find(item => item.slug === route.serviceSlug);
    if (!parish || !service) throw new Error(`Missing parish: ${route.path}`);
    const data = generateFreguesiaContent(service.name, service.slug, service.priceFrom, parish.name, parish.slug, parish.municipio);
    records.push({ path: route.path, faqs: data.faqs, context: { serviceSlug: service.slug as LandingService, family: 'freguesia', pageKey: `freguesia|${service.slug}|${parish.municipio}|${parish.slug}`, municipality: parish.municipio } });
  }
  for (const route of getAllPriceRoutes()) {
    const data = getPricePageData(route.serviceSlug, route.citySlug);
    if (!data) throw new Error(`Missing price: ${route.path}`);
    records.push({ path: route.path, faqs: data.faqs, context: { serviceSlug: route.serviceSlug as LandingService, family: 'preco', pageKey: route.path, municipality: data.cityName } });
  }
  for (const route of getAllKeywordVariantRoutes()) {
    const data = getKeywordVariantData(route.variantKey, route.serviceKey, route.locationPart);
    if (!data) throw new Error(`Missing variant: ${route.path}`);
    const municipality = cities.find(item => item.slug === route.locationPart)?.name
      ?? data.locationName.slice(data.locationName.lastIndexOf(', ') + 2);
    const serviceSlug: LandingService = route.variantKey === 'impermeabilizacao' ? 'impermeabilizacao' : ({ sofa: 'limpeza-sofas', colchao: 'limpeza-colchoes', tapetes: 'limpeza-tapetes', cadeiras: 'limpeza-cadeiras', alcatifas: 'limpeza-alcatifas' } as const)[route.serviceKey];
    records.push({ path: route.path, faqs: data.faqs, context: { serviceSlug, family: 'variante', pageKey: route.path, municipality } });
  }
  return records;
}
