import {
  SITE_URL,
  PHONE_E164,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS,
  REVIEW_RATING,
  REVIEW_COUNT,
} from "@/constants/business";

interface ServiceReview {
  author: string;
  city: string;
  text: string;
  date: string;
}

interface ServiceSchemaProps {
  serviceName: string;
  description: string;
  url: string;
  priceFrom: string;
  imageUrl?: string;
  breadcrumbLabel?: string;
  reviews?: ServiceReview[];
}

const ServiceSchema = ({ serviceName, description, url, priceFrom, imageUrl, breadcrumbLabel, reviews }: ServiceSchemaProps) => {
  const fullUrl = `${SITE_URL}${url}`;
  const priceNumeric = priceFrom.replace(/[^0-9]/g, '') || "39";

  // Reviews inline (no @id, no itemReviewed — context is the Service node itself)
  const reviewNodes = (reviews ?? []).map((r) => ({
    "@type": "Review",
    "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5", "worstRating": "1" },
    "author": { "@type": "Person", "name": r.author, "address": { "@type": "PostalAddress", "addressLocality": r.city, "addressCountry": "PT" } },
    "reviewBody": r.text,
    "datePublished": r.date,
  }));

  const hasReviews = reviewNodes.length > 0;
  const avgRating = REVIEW_RATING;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${fullUrl}#webpage`,
        "url": fullUrl,
        "name": `${serviceName} | Kyro Clean Solutions`,
        "description": description,
        "inLanguage": "pt-PT",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "publisher": { "@id": `${SITE_URL}/#business` },
        "breadcrumb": { "@id": `${fullUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${fullUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": breadcrumbLabel || serviceName, "item": fullUrl },
        ],
      },
      {
        "@type": ["LocalBusiness", "CleaningService"],
        "@id": `${SITE_URL}/#business`,
        "name": "Kyro Clean Solutions",
        "url": SITE_URL,
        "telephone": PHONE_E164,
        "email": BUSINESS_EMAIL,
        "priceRange": "€€",
        "address": BUSINESS_ADDRESS,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": REVIEW_RATING,
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": REVIEW_COUNT,
          "ratingCount": REVIEW_COUNT,
        },
      },
      {
        "@type": "Service",
        "@id": `${fullUrl}#service`,
        "name": serviceName,
        "description": description,
        "url": fullUrl,
        ...(imageUrl && { "image": imageUrl }),
        "provider": { "@id": `${SITE_URL}/#business` },
        "areaServed": [
          { "@type": "City", "name": "Porto" },
          { "@type": "City", "name": "Matosinhos" },
          { "@type": "City", "name": "Maia" },
          { "@type": "City", "name": "Vila Nova de Gaia" },
          { "@type": "City", "name": "Gondomar" },
          { "@type": "City", "name": "Braga" },
          { "@type": "City", "name": "Guimarães" },
          { "@type": "City", "name": "Lisboa" },
          { "@type": "Country", "name": "Portugal" },
        ],
        "serviceType": serviceName,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "EUR",
          "price": priceNumeric,
          "availability": "https://schema.org/InStock",
          "validFrom": "2025-01-01",
          "priceValidUntil": "2026-12-31",
        },
        ...(hasReviews && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": avgRating,
            "bestRating": "5",
            "worstRating": "1",
            "reviewCount": String(reviewNodes.length),
            "ratingCount": String(reviewNodes.length),
          },
          "review": reviewNodes,
        }),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default ServiceSchema;
