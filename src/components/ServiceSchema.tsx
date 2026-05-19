const BASE_URL = "https://www.cleansolutions.com.pt";

interface ServiceSchemaProps {
  serviceName: string;
  description: string;
  url: string;
  priceFrom: string;
  imageUrl?: string;
  breadcrumbLabel?: string;
}

const ServiceSchema = ({ serviceName, description, url, priceFrom, imageUrl, breadcrumbLabel }: ServiceSchemaProps) => {
  const fullUrl = `${BASE_URL}${url}`;
  const priceNumeric = priceFrom.replace(/[^0-9]/g, '') || "39";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${fullUrl}#webpage`,
        "url": fullUrl,
        "name": `${serviceName} | Kyro Clean Solutions`,
        "description": description,
        "isPartOf": { "@id": `${BASE_URL}/#website` },
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
