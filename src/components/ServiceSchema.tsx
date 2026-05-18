interface ServiceSchemaProps {
  serviceName: string;
  description: string;
  url: string;
  priceFrom: string;
  imageUrl?: string;
}

const ServiceSchema = ({ serviceName, description, url, priceFrom, imageUrl }: ServiceSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "description": description,
    "url": `https://www.cleansolutions.com.pt${url}`,
    ...(imageUrl && { "image": imageUrl }),
    "provider": {
      "@type": "LocalBusiness",
      "name": "Kyro Clean Solutions",
      "url": "https://www.cleansolutions.com.pt",
      "telephone": "+351925530647",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "50",
      },
    },
    "areaServed": [
      { "@type": "City", "name": "Porto" },
      { "@type": "City", "name": "Matosinhos" },
      { "@type": "City", "name": "Maia" },
      { "@type": "City", "name": "Vila Nova de Gaia" },
      { "@type": "City", "name": "Braga" },
      { "@type": "City", "name": "Lisboa" },
    ],
    "serviceType": serviceName,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": priceFrom.replace(/[^0-9]/g, ''),
      "availability": "https://schema.org/InStock",
      "validFrom": "2025-01-01",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default ServiceSchema;
