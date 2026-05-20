import { cities } from "@/data/locationSeoData";
import { GOOGLE_MAPS_URL } from "@/constants/google";

const BASE_URL = "https://www.cleansolutions.com.pt";

const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "CleaningService"],
        "@id": `${BASE_URL}/#business`,
        "name": "Kyro Clean Solutions",
        "description": "Serviço profissional de limpeza e lavagem de estofos, sofás, colchões, tapetes, cadeiras e alcatifas. Impermeabilização e remoção de manchas ao domicílio.",
        "url": BASE_URL,
        "telephone": "+351925530647",
        "email": "cleansolutions.pt25@gmail.com",
        "priceRange": "€€",
        "currenciesAccepted": "EUR",
        "paymentAccepted": "Cash, Credit Card, MB Way, Bank Transfer",
        "logo": {
          "@type": "ImageObject",
          "url": `${BASE_URL}/og-image.jpg`,
          "width": 1200,
          "height": 630,
        },
        "image": `${BASE_URL}/og-image.jpg`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "R. de António Cardoso 263",
          "addressLocality": "Porto",
          "postalCode": "4150-081",
          "addressCountry": "PT",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 41.1496,
          "longitude": -8.6109,
        },
        "areaServed": cities.map(city => ({
          "@type": "City",
          "name": city.name,
        })),
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "09:00",
            "closes": "19:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "09:00",
            "closes": "17:00",
          },
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "5.0",
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": "51",
          "ratingCount": "51",
        },
        "sameAs": [
          BASE_URL,
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
        "@id": `${BASE_URL}/#website`,
        "url": BASE_URL,
        "name": "Kyro Clean Solutions",
        "description": "Limpeza profissional de estofos ao domicílio em Portugal",
        "publisher": { "@id": `${BASE_URL}/#business` },
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
