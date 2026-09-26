import { useEffect } from "react";
import {
  buildServicePageSchema,
  clearPrerenderedSchema,
  type ServiceReview,
} from "@/lib/seoSchema";

interface ServiceSchemaProps {
  serviceName: string;
  description: string;
  url: string;
  /** Rótulo de preço ("49€", "Sob orçamento"). Sem número, não há oferta. */
  priceFrom: string;
  imageUrl?: string;
  breadcrumbLabel?: string;
  reviews?: ServiceReview[];
}

// O grafo é o mesmo que o scripts/prerender.ts escreve no HTML estático destas
// páginas (buildServicePageSchema), por isso substituir um pelo outro depois de
// montar não muda o que a página declara.
const ServiceSchema = ({ serviceName, description, url, priceFrom, imageUrl, breadcrumbLabel, reviews }: ServiceSchemaProps) => {
  useEffect(() => {
    clearPrerenderedSchema();
  }, []);

  const schema = buildServicePageSchema({ url, serviceName, description, priceFrom, imageUrl, breadcrumbLabel, reviews });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default ServiceSchema;
