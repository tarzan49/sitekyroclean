interface Props {
  serviceName: string;
  serviceBaseUrl: string;
  placeName: string;
  parentPlace?: string;
  description: string;
  pageUrl: string;
  priceFrom: string;
}

const ServiceLocationSchema = ({ serviceName, serviceBaseUrl, placeName, parentPlace, description, pageUrl, priceFrom }: Props) => {
  const priceNum = /\d+/.exec(priceFrom)?.[0] ?? "39";
  const base = "https://www.cleansolutions.com.pt";
  const fullUrl = `${base}${pageUrl}`;

  const areaServed = parentPlace
    ? [{ "@type": "City", "name": parentPlace }, { "@type": "Place", "name": placeName }]
    : { "@type": "City", "name": placeName };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${fullUrl}#webpage`,
        "url": fullUrl,
        "name": `${serviceName} em ${placeName} | Kyro Clean Solutions`,
        "description": description,
        "inLanguage": "pt-PT",
        "isPartOf": { "@id": `${base}/#website` },
        "publisher": { "@id": `${base}/#business` },
        "breadcrumb": { "@id": `${fullUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${fullUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Início", "item": base },
          { "@type": "ListItem", "position": 2, "name": serviceName, "item": `${base}${serviceBaseUrl}` },
          { "@type": "ListItem", "position": 3, "name": placeName, "item": fullUrl },
        ],
      },
      {
        "@type": ["LocalBusiness", "CleaningService"],
        "@id": `${base}/#business`,
        "name": "Kyro Clean Solutions",
        "url": base,
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
        "areaServed": areaServed,
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
        "name": `${serviceName} em ${placeName}`,
        "description": description,
        "url": fullUrl,
        "provider": { "@id": `${base}/#business` },
        "areaServed": areaServed,
        "serviceType": serviceName,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "EUR",
          "price": priceNum,
          "availability": "https://schema.org/InStock",
          "validFrom": "2025-01-01",
        },
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

export default ServiceLocationSchema;
