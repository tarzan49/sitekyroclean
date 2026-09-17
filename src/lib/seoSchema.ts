import {
  SITE_URL,
  PHONE_E164,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS,
  BUSINESS_GEO,
  REVIEW_RATING,
  REVIEW_COUNT,
  BUSINESS_TAX_ID,
  BUSINESS_PROFILES,
} from "../constants/business";
import { GOOGLE_MAPS_URL } from "../constants/google";

export interface AreaServedItem {
  "@type": "City" | "Place" | "Country";
  name: string;
}
export type AreaServed = AreaServedItem | AreaServedItem[];

/** Metro-area cities used by Service nodes that don't target a single place. */
export const DEFAULT_AREA_SERVED: AreaServedItem[] = [
  { "@type": "City", "name": "Porto" },
  { "@type": "City", "name": "Matosinhos" },
  { "@type": "City", "name": "Maia" },
  { "@type": "City", "name": "Vila Nova de Gaia" },
  { "@type": "City", "name": "Gondomar" },
  { "@type": "City", "name": "Braga" },
  { "@type": "City", "name": "Lisboa" },
  { "@type": "City", "name": "Cascais" },
  { "@type": "City", "name": "Sintra" },
  { "@type": "City", "name": "Faro" },
  { "@type": "City", "name": "Loulé" },
  { "@type": "City", "name": "Albufeira" },
];

/**
 * Site-wide LocalBusiness node — the single canonical definition, used both
 * client-side (React components) and by scripts/prerender.ts (static HTML).
 * Optionally scoped to an areaServed for pages targeting one city/region.
 */
export function buildLocalBusinessNode(areaServed?: AreaServed) {
  return {
    "@type": ["LocalBusiness", "CleaningService"],
    "@id": `${SITE_URL}/#business`,
    "name": "Kyro Clean Solutions",
    "description": "Serviço profissional de limpeza e lavagem de estofos, sofás, colchões, tapetes, cadeiras e alcatifas. Impermeabilização de sofás e cadeiras e remoção de manchas ao domicílio.",
    "url": SITE_URL,
    "telephone": PHONE_E164,
    "email": BUSINESS_EMAIL,
    "priceRange": "€€",
    "currenciesAccepted": "EUR",
    "paymentAccepted": "Cash, Credit Card, MB Way, Bank Transfer",
    "address": BUSINESS_ADDRESS,
    "geo": BUSINESS_GEO,
    "logo": { "@type": "ImageObject", "url": `${SITE_URL}/og-image.jpg`, "width": 1200, "height": 630 },
    "image": `${SITE_URL}/og-image.jpg`,
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "08:00",
        "closes": "00:00",
      },
    ],
    // O proprio SITE_URL saiu daqui: `sameAs` serve para apontar perfis da
    // empresa noutros sitios, e o site a apontar para si mesmo nao corrobora
    // nada (o campo `url` acima ja diz qual e). Ficou so a ficha do Google.
    // Perfis proprios noutras plataformas (Instagram, Facebook, LinkedIn)
    // acrescentam-se a esta lista quando existirem: e o sinal que permite a um
    // motor confirmar que a empresa e real fora do seu proprio dominio.
    "sameAs": [GOOGLE_MAPS_URL, ...BUSINESS_PROFILES],
    ...(BUSINESS_TAX_ID && { "vatID": BUSINESS_TAX_ID, "taxID": BUSINESS_TAX_ID }),
    ...(areaServed && { "areaServed": areaServed }),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": REVIEW_RATING,
      "bestRating": "5",
      "worstRating": "1",
      "reviewCount": REVIEW_COUNT,
      "ratingCount": REVIEW_COUNT,
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function buildBreadcrumbNode(id: string | undefined, items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    ...(id && { "@id": id }),
    "itemListElement": items.map((it, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": it.name,
      "item": it.item,
    })),
  };
}

export function buildWebPageNode(opts: { url: string; name: string; description: string }) {
  return {
    "@type": "WebPage",
    "@id": `${opts.url}#webpage`,
    "url": opts.url,
    "name": opts.name,
    "description": opts.description,
    "inLanguage": "pt-PT",
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "publisher": { "@id": `${SITE_URL}/#business` },
    "breadcrumb": { "@id": `${opts.url}#breadcrumb` },
  };
}

export function buildOfferNode(
  price: string,
  opts?: { validFrom?: string; priceValidUntil?: string; areaServed?: AreaServed },
) {
  return {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "price": price,
    // `price` sozinho afirma que o serviço custa exatamente este valor, o que é
    // falso: 49€ é o ponto de partida de um sofá de 1 lugar, e a página inteira
    // diz "Desde 49€". `minPrice` é a forma correta de exprimir isso, e deixa um
    // leitor automático perceber que há valores acima sem os inventar.
    // `price` fica porque é o campo que a maioria dos consumidores lê.
    "priceSpecification": {
      "@type": "PriceSpecification",
      "priceCurrency": "EUR",
      "minPrice": price,
    },
    "availability": "https://schema.org/InStock",
    ...(opts?.validFrom && { "validFrom": opts.validFrom }),
    ...(opts?.priceValidUntil && { "priceValidUntil": opts.priceValidUntil }),
    ...(opts?.areaServed && { "areaServed": opts.areaServed }),
  };
}

export interface ServiceReview {
  author: string;
  city: string;
  text: string;
  date: string;
}

export function buildServiceNode(opts: {
  url?: string;
  name: string;
  description?: string;
  areaServed?: AreaServed;
  serviceType?: string;
  imageUrl?: string;
  offers?: Record<string, unknown>;
  reviews?: ServiceReview[];
}) {
  const reviewNodes = (opts.reviews ?? []).map((r) => ({
    "@type": "Review",
    "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5", "worstRating": "1" },
    "author": { "@type": "Person", "name": r.author, "address": { "@type": "PostalAddress", "addressLocality": r.city, "addressCountry": "PT" } },
    "reviewBody": r.text,
    "datePublished": r.date,
  }));
  const hasReviews = reviewNodes.length > 0;

  return {
    "@type": "Service",
    ...(opts.url && { "@id": `${opts.url}#service` }),
    "name": opts.name,
    ...(opts.description && { "description": opts.description }),
    ...(opts.url && { "url": opts.url }),
    ...(opts.imageUrl && { "image": opts.imageUrl }),
    "provider": { "@id": `${SITE_URL}/#business` },
    ...(opts.areaServed && { "areaServed": opts.areaServed }),
    ...(opts.serviceType && { "serviceType": opts.serviceType }),
    ...(opts.offers && { "offers": opts.offers }),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": REVIEW_RATING,
      "bestRating": "5",
      "worstRating": "1",
      "reviewCount": REVIEW_COUNT,
      "ratingCount": REVIEW_COUNT,
    },
    ...(hasReviews && { "review": reviewNodes }),
  };
}

export function buildFaqNode(faqs: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
    })),
  };
}

/**
 * Every JSON-LD <script> injected statically by scripts/prerender.ts (and
 * the LocalBusiness block in index.html) carries data-ssr-schema="true".
 * Client-side schema components call this once on mount, right before
 * rendering their own JSON-LD, so the page never ends up with two
 * overlapping structured-data blocks after hydration or SPA navigation.
 */
export function clearPrerenderedSchema() {
  document.querySelectorAll('script[data-ssr-schema]').forEach((el) => el.remove());
}

/** Replace only the standalone FAQ node; keep server business/service metadata. */
export function clearPrerenderedFaqSchema() {
  document.querySelectorAll('script[data-ssr-schema]').forEach(el => {
    try {
      if (JSON.parse(el.textContent || '{}')['@type'] === 'FAQPage') el.remove();
    } catch {
      // Unrelated malformed metadata must not prevent a page from rendering.
    }
  });
}

/**
 * HowTo — o processo do serviço em passos numerados.
 *
 * Não é para rich results: a Google retirou-os para HowTo em 2023. Serve para
 * o processo deixar de ser apenas uma lista de parágrafos e passar a ter
 * ordem, título e texto por passo de forma legível por máquina, que é o que
 * um motor generativo precisa para responder "como é que limpam um sofá" sem
 * ter de adivinhar onde começa e acaba cada etapa.
 *
 * O conteúdo já existia em serviceProcessGuides/sofaProcessGuide e já era
 * escrito no HTML; isto só o marca.
 */
export function buildHowToNode(name: string, steps: { title: string; description: string }[]) {
  return {
    "@type": "HowTo",
    "name": name,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description,
    })),
  };
}

/**
 * AboutPage da página /sobre.
 *
 * Não redefine a empresa: aponta com `@id` para o nó LocalBusiness que já
 * existe em todas as páginas. Duas definições da mesma entidade obrigariam um
 * leitor a decidir qual delas vale, e é assim que uma delas fica para trás.
 */
export function buildAboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/sobre#webpage`,
    "url": `${SITE_URL}/sobre`,
    "name": "Sobre a Kyro Clean Solutions",
    "description": "Quem somos, onde trabalhamos e como trabalhamos: limpeza e higienização de estofos ao domicílio.",
    "inLanguage": "pt-PT",
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "mainEntity": { "@id": `${SITE_URL}/#business` },
    "publisher": { "@id": `${SITE_URL}/#business` },
  };
}

export interface PersonSchemaInput {
  slug: string;
  name: string;
  jobTitle: string;
  summary: string;
}

/**
 * Nó da pessoa que assina o conteúdo.
 *
 * `worksFor` aponta para o nó do negócio por `@id` em vez de o redescrever:
 * é o mesmo princípio da página /sobre, uma entidade descrita num sítio só e
 * referenciada em todos os outros.
 */
export function buildPersonNode(author: PersonSchemaInput) {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/autor/${author.slug}#person`,
    "name": author.name,
    "jobTitle": author.jobTitle,
    "description": author.summary,
    "url": `${SITE_URL}/autor/${author.slug}`,
    "worksFor": { "@id": `${SITE_URL}/#business` },
  };
}

export function buildProfilePageSchema(author: PersonSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/autor/${author.slug}#webpage`,
        "url": `${SITE_URL}/autor/${author.slug}`,
        "name": `${author.name} | Kyro Clean Solutions`,
        "description": author.summary,
        "inLanguage": "pt-PT",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "mainEntity": { "@id": `${SITE_URL}/autor/${author.slug}#person` },
        "publisher": { "@id": `${SITE_URL}/#business` },
      },
      buildPersonNode(author),
    ],
  };
}
