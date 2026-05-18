import { cities } from "@/data/locationSeoData";

const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "CleaningService"],
    "name": "Kyro Clean Solutions",
    "description": "Serviço profissional de limpeza e lavagem de estofos, sofás, colchões, tapetes, cadeiras e alcatifas. Impermeabilização e remoção de manchas ao domicílio.",
    "url": "https://www.cleansolutions.com.pt",
    "telephone": "+351925530647",
    "email": "cleansolutions.pt25@gmail.com",
    "priceRange": "€€",
    "currenciesAccepted": "EUR",
    "paymentAccepted": "Cash, Credit Card, MB Way, Bank Transfer",
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
      "reviewCount": "50",
      "ratingCount": "50",
    },
    "sameAs": [
      "https://www.cleansolutions.com.pt",
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default LocalBusinessSchema;
