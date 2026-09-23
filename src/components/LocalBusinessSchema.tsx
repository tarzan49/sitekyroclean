import { useEffect } from "react";
import { SITE_URL } from "@/constants/business";
import { buildHomepageBusinessNode, clearPrerenderedSchema } from "@/lib/seoSchema";

const LocalBusinessSchema = () => {
  useEffect(() => {
    clearPrerenderedSchema();
  }, []);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      // Partilhado com o prerender (dist/index.html): mesma entidade, mesmas
      // cidades, mesmos preços "a partir de".
      buildHomepageBusinessNode(),
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
