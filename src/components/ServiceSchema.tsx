import { SITE_URL } from "@/constants/business";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildLocalBusinessNode,
  buildServiceNode,
  buildOfferNode,
  type ServiceReview,
} from "@/lib/seoSchema";

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

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageNode({ url: fullUrl, name: `${serviceName} | Kyro Clean Solutions`, description }),
      buildBreadcrumbNode(`${fullUrl}#breadcrumb`, [
        { name: "Início", item: SITE_URL },
        { name: breadcrumbLabel || serviceName, item: fullUrl },
      ]),
      buildLocalBusinessNode(),
      buildServiceNode({
        url: fullUrl,
        name: serviceName,
        description,
        imageUrl,
        serviceType: serviceName,
        areaServed: [
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
        offers: buildOfferNode(priceNumeric, { validFrom: "2025-01-01", priceValidUntil: "2026-12-31" }),
        reviews,
      }),
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
