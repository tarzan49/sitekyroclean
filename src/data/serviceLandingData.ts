import { cities, services, getLocationServiceData, type LocationService } from './locationSeoData';
import { municipiosComFreguesias, getFreguesia, generateFreguesiaContent } from './freguesiaSeoData';
import { getPricePageData } from './priceSeoData';
import { getKeywordVariantData, type ServiceKey, type VariantKey } from './keywordVariantData';
import { getExpansionPage, getExpansionRoutes } from './treatmentSeoData';
import { buildVariantWaMessage } from '../lib/whatsappMessages';
import { SERVICEKEY_TO_QUIZ } from '../constants/serviceToQuiz';

export interface ServiceLandingData extends LocationService {
  family: 'location' | 'parish' | 'price' | 'variant' | 'expansion';
  quoteCity: string;
  locationSlug: string;
  parentPlace?: string;
  breadcrumbs: { label: string; to?: string }[];
  waMessage?: string;
  quizService?: string;
  processSteps?: { label: string; desc: string }[];
  coverageNote?: string;
  generalService?: boolean;
}

const serviceSlugs: Record<ServiceKey, string> = {
  sofa: 'limpeza-sofas', colchao: 'limpeza-colchoes', tapetes: 'limpeza-tapetes',
  cadeiras: 'limpeza-cadeiras', alcatifas: 'limpeza-alcatifas',
};
const labels: Record<VariantKey, string> = {
  higienizacao: 'Higienização', lavagem: 'Lavagem', impermeabilizacao: 'Impermeabilização',
};
const furniture: Record<ServiceKey, string> = {
  sofa: 'sofás', colchao: 'colchões', tapetes: 'tapetes', cadeiras: 'cadeiras', alcatifas: 'alcatifas',
};

function wrap(base: LocationService, family: ServiceLandingData['family']): ServiceLandingData {
  return { ...base, family, quoteCity: base.city, locationSlug: base.citySlug,
    breadcrumbs: [{ label: 'Início', to: '/' }, { label: base.service, to: `/${base.serviceSlug}` }, { label: base.city }],
  };
}

// Resolve content separately from presentation. Every supported family uses
// the same template; these adapters retain the page's own search intent.
export function getServiceLandingData(pathname: string): ServiceLandingData | null {
  const path = pathname.replace(/^\//, '').replace(/\/$/, '');
  const expansionRoute = getExpansionRoutes().find(route => route.path === `/${path}`);
  if (expansionRoute) {
    const page = getExpansionPage(`/${path}`)!;
    const slug = expansionRoute.serviceSlug || 'limpeza-sofas';
    const base = getLocationServiceData(slug, page.city.slug, { ...page.city, description: page.city.context })!;
    const general = !expansionRoute.serviceSlug;
    return { ...wrap(base, 'expansion'), title: page.title, metaDescription: page.metaDescription,
      h1: page.h1, intro: general ? page.intro : `${base.intro} ${page.intro}`,
      service: general ? 'Limpeza de estofos' : base.service,
      generalService: general, priceFrom: general ? 'Sob orçamento' : base.priceFrom,
      localSection: page.detail, faqs: [...page.faqs, ...base.faqs.filter(f => !page.faqs.some(p => p.question === f.question))],
      coverageNote: `Atendimento em ${page.city.name} sob consulta. Confirme a disponibilidade, a morada e a deslocação antes da marcação.`,
      breadcrumbs: [{ label: 'Início', to: '/' }, { label: page.h1 }],
    };
  }

  for (const variant of Object.keys(labels) as VariantKey[]) {
    for (const key of Object.keys(serviceSlugs) as ServiceKey[]) {
      const prefix = `${variant}-${key}-`;
      if (!path.startsWith(prefix)) continue;
      const locationSlug = path.slice(prefix.length);
      const source = getKeywordVariantData(variant, key, locationSlug);
      if (!source) return null;
      const city = cities.find(c => c.slug === locationSlug);
      const municipality = city ?? municipiosComFreguesias.find(m => locationSlug.startsWith(`${m.slug}-`));
      if (!municipality) return null;
      const slug = variant === 'impermeabilizacao' ? 'impermeabilizacao' : serviceSlugs[key];
      const base = getLocationServiceData(slug, municipality.slug)!;
      return { ...wrap(base, 'variant'), ...source, serviceSlug: slug,
        city: source.locationName, citySlug: municipality.slug, quoteCity: municipality.name,
        locationSlug, parentPlace: city ? undefined : municipality.name,
        service: `${labels[variant]} de ${furniture[key]}`, quizService: SERVICEKEY_TO_QUIZ[key],
        intro: source.intro, howItWorks: source.whatIs,
        processSteps: source.processSteps.map(s => ({ label: s.title, desc: s.description })),
        waMessage: buildVariantWaMessage(false, furniture[key], labels[variant], source.locationName),
        breadcrumbs: [{ label: 'Início', to: '/' }, { label: base.service, to: `/${slug}` },
          { label: source.locationName, to: source.canonical }, { label: labels[variant] }],
      };
    }
  }

  for (const service of services) {
    const pricePrefix = `preco-${service.slug}-`;
    if (path.startsWith(pricePrefix)) {
      const citySlug = path.slice(pricePrefix.length);
      const source = getPricePageData(service.slug, citySlug);
      const base = getLocationServiceData(service.slug, citySlug);
      if (!source || !base) return null;
      return { ...wrap(base, 'price'), ...source, city: source.cityName, service: source.serviceName,
        breadcrumbs: [{ label: 'Início', to: '/' }, { label: service.name, to: `/${service.slug}` },
          { label: source.cityName, to: `/${service.slug}-${citySlug}` }, { label: 'Preços' }],
      };
    }
    const prefix = `${service.slug}-`;
    if (!path.startsWith(prefix)) continue;
    const locationSlug = path.slice(prefix.length);
    const base = getLocationServiceData(service.slug, locationSlug);
    if (base) return wrap(base, 'location');
    for (const municipality of municipiosComFreguesias) {
      if (!locationSlug.startsWith(`${municipality.slug}-`)) continue;
      const parish = getFreguesia(municipality.slug, locationSlug.slice(municipality.slug.length + 1));
      if (!parish) continue;
      const cityBase = getLocationServiceData(service.slug, municipality.slug)!;
      const content = generateFreguesiaContent(service.name, service.slug, service.priceFrom, parish.name, parish.slug, municipality.name);
      return { ...wrap(cityBase, 'parish'), ...content, city: parish.name, parentPlace: municipality.name,
        quoteCity: municipality.name, locationSlug,
        breadcrumbs: [{ label: 'Início', to: '/' }, { label: service.name, to: `/${service.slug}` },
          { label: municipality.name, to: `/${service.slug}-${municipality.slug}` }, { label: parish.name }],
      };
    }
  }
  return null;
}
