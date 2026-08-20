import { cities } from "@/data/locationSeoData";
import { GOOGLE_MAPS_URL } from "@/constants/google";
import {
  SITE_URL,
  PHONE_E164,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS,
  BUSINESS_GEO,
  REVIEW_RATING,
  REVIEW_COUNT,
} from "@/constants/business";

const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
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
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/og-image.jpg`,
          "width": 1200,
          "height": 630,
        },
        "image": `${SITE_URL}/og-image.jpg`,
        "address": BUSINESS_ADDRESS,
        "geo": BUSINESS_GEO,
        "areaServed": cities.map(city => ({
          "@type": "City",
          "name": city.name,
        })),
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "08:00",
            "closes": "00:00",
          },
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": REVIEW_RATING,
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": REVIEW_COUNT,
          "ratingCount": REVIEW_COUNT,
        },
        "sameAs": [
          SITE_URL,
          GOOGLE_MAPS_URL,
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Serviços de Limpeza Profissional",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Limpeza de Sofás" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Limpeza de Colchões" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Limpeza de Tapetes" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Limpeza de Cadeiras" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Limpeza de Alcatifas" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Impermeabilização" } },
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "Kyro Clean Solutions",
        "description": "Limpeza profissional de estofos ao domicílio em Portugal",
        "publisher": { "@id": `${SITE_URL}/#business` },
        "inLanguage": "pt-PT",
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

export default LocalBusinessSchema;
