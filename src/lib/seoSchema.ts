import {
  SITE_URL,
  PHONE_E164,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS,
  BUSINESS_GEO,
  REVIEW_RATING,
  REVIEW_COUNT,
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
    "sameAs": [SITE_URL, GOOGLE_MAPS_URL],
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
