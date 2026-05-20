const BASE_URL = "https://www.cleansolutions.com.pt";

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
  const fullUrl = `${BASE_URL}${url}`;
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
  const avgRating = "5.0";

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
        "isPartOf": { "@id": `${BASE_URL}/#website` },
        "publisher": { "@id": `${BASE_URL}/#business` },
        "breadcrumb": { "@id": `${fullUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${fullUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Início", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": breadcrumbLabel || serviceName, "item": fullUrl },
        ],
      },
      {
        "@type": ["LocalBusiness", "CleaningService"],
        "@id": `${BASE_URL}/#business`,
        "name": "Kyro Clean Solutions",
        "url": BASE_URL,
        "telephone": "+351925530647",
        "email": "cleansolutions.pt25@gmail.com",
        "priceRange": "€€",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "R. de António Cardoso 263",
          "addressLocality": "Porto",
          "postalCode": "4150-081",
          "addressCountry": "PT",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "5.0",
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": "51",
          "ratingCount": "51",
        },
      },
      {
        "@type": "Service",
        "@id": `${fullUrl}#service`,
        "name": serviceName,
        "description": description,
        "url": fullUrl,
        ...(imageUrl && { "image": imageUrl }),
        "provider": { "@id": `${BASE_URL}/#business` },
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
