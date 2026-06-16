import { SITE_URL } from "@/constants/business";
import { DEFAULT_PRICE_FROM, cityPrep } from "@/data/locationSeoData";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildLocalBusinessNode,
  buildServiceNode,
  buildOfferNode,
  type AreaServed,
} from "@/lib/seoSchema";

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
  const priceNum = /\d+/.exec(priceFrom)?.[0] ?? DEFAULT_PRICE_FROM.replace(/[^0-9]/g, '');
  const fullUrl = `${SITE_URL}${pageUrl}`;

  const prep = cityPrep(placeName);

  const areaServed: AreaServed = parentPlace
    ? [{ "@type": "City", "name": parentPlace }, { "@type": "Place", "name": placeName }]
    : { "@type": "City", "name": placeName };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageNode({ url: fullUrl, name: `${serviceName} ${prep} ${placeName} | Kyro Clean Solutions`, description }),
      buildBreadcrumbNode(`${fullUrl}#breadcrumb`, [
        { name: "Início", item: SITE_URL },
        { name: serviceName, item: `${SITE_URL}${serviceBaseUrl}` },
        { name: placeName, item: fullUrl },
      ]),
      buildLocalBusinessNode(areaServed),
      buildServiceNode({
        url: fullUrl,
        name: `${serviceName} ${prep} ${placeName}`,
        description,
        areaServed,
        serviceType: serviceName,
        offers: buildOfferNode(priceNum, { validFrom: "2025-01-01", priceValidUntil: "2026-12-31" }),
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

export default ServiceLocationSchema;
