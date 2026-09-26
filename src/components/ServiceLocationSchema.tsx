import { useEffect } from "react";
import { SITE_URL } from "@/constants/business";
import { cityPrep } from "@/data/serviceCatalog";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildLocalBusinessNode,
  buildServiceNode,
  offerForPriceLabel,
  clearPrerenderedSchema,
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
  /** Passos da migalha, quando a página não é "serviço › localidade" (ex.:
   * packs, que passam por /guia-de-packs). Tem de ser a mesma migalha que a
   * página desenha, senão o que se declara e o que se mostra discordam. */
  breadcrumb?: { name: string; path: string }[];
}

const ServiceLocationSchema = ({ serviceName, serviceBaseUrl, placeName, parentPlace, description, pageUrl, priceFrom, breadcrumb }: Props) => {
  useEffect(() => {
    clearPrerenderedSchema();
  }, []);

  // Sem número no rótulo ("Sob orçamento"), não há oferta. Antes caía para
  // preço por omissão do catálogo (49€), e todas as páginas de tapetes e alcatifas por cidade
  // declaravam uma oferta de 49€ num serviço que nunca tem preço fixo.
  const offers = offerForPriceLabel(priceFrom);
  const fullUrl = `${SITE_URL}${pageUrl}`;

  const prep = cityPrep(placeName);

  const areaServed: AreaServed = parentPlace
    ? [{ "@type": "City", "name": parentPlace }, { "@type": "Place", "name": placeName }]
    : { "@type": "City", "name": placeName };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageNode({ url: fullUrl, name: `${serviceName} ${prep} ${placeName} | Kyro Clean Solutions`, description }),
      buildBreadcrumbNode(`${fullUrl}#breadcrumb`, breadcrumb
        ? breadcrumb.map(step => ({ name: step.name, item: `${SITE_URL}${step.path}` }))
        : [
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
        ...(offers && { offers }),
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
