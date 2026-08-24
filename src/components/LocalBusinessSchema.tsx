import { useEffect } from "react";
import { cities } from "@/data/locationSeoData";
import { SITE_URL } from "@/constants/business";
import { buildLocalBusinessNode, clearPrerenderedSchema } from "@/lib/seoSchema";

const LocalBusinessSchema = () => {
  useEffect(() => {
    clearPrerenderedSchema();
  }, []);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...buildLocalBusinessNode(cities.map(city => ({ "@type": "City" as const, "name": city.name }))),
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
