import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface PageMeta {
  title: string;
  description: string;
}

const routeMeta: Record<string, { pt: PageMeta; en: PageMeta; es: PageMeta }> = {
  "/": {
    pt: {
      title: "Kyro Clean Solutions | Limpeza de Sofás, Colchões e Tapetes ao Domicílio",
      description: "O seu sofá, colchão ou tapete como novo em 1h, ao domicílio, sem sair de casa. Avaliação 5.0 Google. Extração profissional. Porto, Gaia, Lisboa e todo o país. Orçamento grátis.",
    },
    en: {
      title: "Kyro Clean Solutions | Professional Sofa, Mattress & Rug Cleaning at Home",
      description: "Your sofa, mattress or rug like new in 1h, at your home, no hassle. 5.0 Google rating. Professional extraction. Porto, Lisbon and nationwide. Free quote.",
    },
    es: {
      title: "Kyro Clean Solutions | Limpieza de Sofás, Colchones y Alfombras a Domicilio",
      description: "Su sofá, colchón o alfombra como nuevo en 1h, a domicilio, sin salir de casa. Valoración 5.0 Google. Extracción profesional. Presupuesto gratis.",
    },
  },
  "/limpeza-sofas": {
    pt: {
      title: "Limpeza e Lavagem de Sofás ao Domicílio | Desde 39€ | Kyro Clean Solutions",
      description: "Limpeza e lavagem profissional de sofás ao domicílio. Remoção de manchas, ácaros e odores com extração profissional. Resultados visíveis no momento. Porto, Lisboa e todo o país.",
    },
    en: {
      title: "Sofa Cleaning & Washing Service | From €39 | Kyro Clean Solutions",
      description: "Professional sofa cleaning and washing at your home. Stain, mite and odour removal with professional extraction equipment. Visible results on the spot.",
    },
    es: {
      title: "Limpieza y Lavado de Sofás a Domicilio | Desde 39€ | Kyro Clean Solutions",
      description: "Limpieza y lavado profesional de sofás a domicilio. Eliminación de manchas, ácaros y olores con extracción profesional.",
    },
  },
  "/limpeza-colchoes": {
    pt: {
      title: "Limpeza e Higienização de Colchões | Desde 39€ | Kyro Clean Solutions",
      description: "Higienização e lavagem profunda de colchões ao domicílio. Eliminamos ácaros, bactérias e odores para noites mais saudáveis. Porto, Lisboa e todo o país.",
    },
    en: {
      title: "Mattress Cleaning & Sanitization | From €39 | Kyro Clean Solutions",
      description: "Deep mattress cleaning and sanitization at your home. We eliminate mites, bacteria and odours for healthier nights.",
    },
    es: {
      title: "Limpieza e Higienización de Colchones | Desde 39€ | Kyro Clean Solutions",
      description: "Higienización y lavado profundo de colchones a domicilio. Eliminamos ácaros, bacterias y olores.",
    },
  },
  "/limpeza-tapetes": {
    pt: {
      title: "Limpeza e Lavagem de Tapetes | Desde 5€/m² | Kyro Clean Solutions",
      description: "Lavagem profissional de tapetes com extração profunda. Removemos sujidade, manchas e alergénios. Recolha e entrega disponível em todo o país.",
    },
    en: {
      title: "Rug Cleaning & Washing | From €5/m² | Kyro Clean Solutions",
      description: "Professional rug cleaning with deep professional extraction. We remove dirt, stains and allergens. Pick-up and delivery available.",
    },
    es: {
      title: "Limpieza y Lavado de Alfombras | Desde 5€/m² | Kyro Clean Solutions",
      description: "Lavado profesional de alfombras con extracción profunda. Eliminamos suciedad, manchas y alérgenos.",
    },
  },
  "/limpeza-cadeiras": {
    pt: {
      title: "Limpeza e Lavagem de Cadeiras Estofadas | Desde 10€ | Kyro Clean Solutions",
      description: "Limpeza e lavagem profissional de cadeiras estofadas ao domicílio. Ideal para escritórios, restaurantes e residências. Resultados no momento.",
    },
    en: {
      title: "Upholstered Chair Cleaning | From €10 | Kyro Clean Solutions",
      description: "Professional upholstered chair cleaning at your location. Ideal for offices, restaurants and homes. Instant results.",
    },
    es: {
      title: "Limpieza y Lavado de Sillas Tapizadas | Desde 10€ | Kyro Clean Solutions",
      description: "Limpieza profesional de sillas tapizadas a domicilio. Ideal para oficinas, restaurantes y hogares.",
    },
  },
  "/limpeza-alcatifas": {
    pt: {
      title: "Limpeza e Lavagem de Alcatifas | Desde 3€/m² | Kyro Clean Solutions",
      description: "Limpeza e lavagem profunda de alcatifas com extração profissional. Removemos sujidade acumulada e alergénios. Secagem rápida. Porto, Lisboa e todo o país.",
    },
    en: {
      title: "Carpet Cleaning & Deep Wash | From €3/m² | Kyro Clean Solutions",
      description: "Deep carpet cleaning and washing with professional extraction equipment. We remove accumulated dirt and allergens. Fast drying.",
    },
    es: {
      title: "Limpieza y Lavado de Moquetas | Desde 3€/m² | Kyro Clean Solutions",
      description: "Limpieza y lavado profundo de moquetas con extracción profesional. Eliminamos suciedad acumulada y alérgenos.",
    },
  },
  "/impermeabilizacao": {
    pt: {
      title: "Impermeabilização de Estofos | Kyro Clean Solutions | Proteção até 10 anos",
      description: "Impermeabilização profissional de sofás, cadeiras e tapetes. Proteção invisível contra manchas e líquidos com garantia até 10 anos.",
    },
    en: {
      title: "Upholstery Waterproofing | Kyro Clean Solutions | Up to 10-Year Protection",
      description: "Professional waterproofing for sofas, chairs and rugs. Invisible protection against stains and liquids with up to 10-year guarantee.",
    },
    es: {
      title: "Impermeabilización de Tapizados | Kyro Clean Solutions | Protección hasta 10 años",
      description: "Impermeabilización profesional de sofás, sillas y alfombras. Protección invisible contra manchas y líquidos.",
    },
  },
  "/packs": {
    pt: {
      title: "Packs Limpeza + Impermeabilização | Kyro Clean Solutions | Até 15% Desconto",
      description: "Packs exclusivos de limpeza e impermeabilização com até 15% de desconto. Proteja os seus estofos com o melhor preço.",
    },
    en: {
      title: "Cleaning + Waterproofing Packs | Kyro Clean Solutions | Up to 15% Off",
      description: "Exclusive cleaning and waterproofing packs with up to 15% discount. Protect your upholstery at the best price.",
    },
    es: {
      title: "Packs Limpieza + Impermeabilización | Kyro Clean Solutions | Hasta 15% Descuento",
      description: "Packs exclusivos de limpieza e impermeabilización con hasta 15% de descuento.",
    },
  },
  "/blog": {
    pt: {
      title: "Blog Limpeza de Estofos | Dicas, Guias e Preços | Kyro Clean",
      description: "Artigos especializados sobre limpeza de sofás, tapetes e colchões. Dicas profissionais, guias de manutenção e preços reais.",
    },
    en: {
      title: "Upholstery Cleaning Blog | Tips, Guides & Prices | Kyro Clean",
      description: "Expert articles on sofa, rug and mattress cleaning. Professional tips, maintenance guides and real prices.",
    },
    es: {
      title: "Blog Limpieza de Tapizados | Consejos, Guías y Precios | Kyro Clean",
      description: "Artículos especializados sobre limpieza de sofás, alfombras y colchones.",
    },
  },
  "/perguntas-frequentes-limpeza-estofos": {
    pt: {
      title: "Perguntas Frequentes |Limpeza de Estofos | Kyro Clean Solutions",
      description: "Respostas às 12 perguntas mais comuns sobre limpeza profissional de sofás, colchões e tapetes. Preços, duração, materiais e mais.",
    },
    en: {
      title: "FAQ |Upholstery Cleaning | Kyro Clean Solutions",
      description: "Answers to the 12 most common questions about professional sofa, mattress and rug cleaning.",
    },
    es: {
      title: "Preguntas Frecuentes |Limpieza de Tapizados | Kyro Clean Solutions",
      description: "Respuestas a las 12 preguntas más comunes sobre limpieza profesional.",
    },
  },
  "/glossario-limpeza-estofos": {
    pt: {
      title: "Glossário de Limpeza de Estofos | Termos Técnicos | Kyro Clean",
      description: "Dicionário completo com 15 termos técnicos de limpeza profissional de estofos. Saiba o que significa extração, impermeabilização e muito mais.",
    },
    en: {
      title: "Upholstery Cleaning Glossary | Technical Terms | Kyro Clean",
      description: "Complete dictionary with 15 technical terms for professional upholstery cleaning.",
    },
    es: {
      title: "Glosario de Limpieza de Tapizados | Términos Técnicos | Kyro Clean",
      description: "Diccionario completo con términos técnicos de limpieza profesional.",
    },
  },
  "/politica-de-privacidade": {
    pt: {
      title: "Política de Privacidade | Kyro Clean Solutions",
      description: "Consulte a Política de Privacidade da Kyro Clean Solutions. Saiba como recolhemos, utilizamos e protegemos os seus dados pessoais.",
    },
    en: {
      title: "Privacy Policy | Kyro Clean Solutions",
      description: "Read the Kyro Clean Solutions Privacy Policy. Learn how we collect, use and protect your personal data.",
    },
    es: {
      title: "Política de Privacidad | Kyro Clean Solutions",
      description: "Consulte la Política de Privacidad de Kyro Clean Solutions.",
    },
  },
  "/antes-depois-limpeza": {
    pt: {
      title: "Antes e Depois | Resultados Reais de Limpeza Profissional | Kyro Clean",
      description: "Veja os resultados reais da limpeza profissional de sofás, colchões, tapetes e cadeiras. Antes e depois de cada serviço. Sem filtros, sem retoques.",
    },
    en: {
      title: "Before & After | Real Professional Cleaning Results | Kyro Clean",
      description: "See the real results of professional sofa, mattress, rug and chair cleaning. Before and after each service. No filters, no retouching.",
    },
    es: {
      title: "Antes y Después | Resultados Reales de Limpieza Profesional | Kyro Clean",
      description: "Vea los resultados reales de la limpieza profesional de sofás, colchones, alfombras y sillas.",
    },
  },
  "/areas-de-servico": {
    pt: {
      title: "Áreas de Serviço | Porto, Lisboa e Todo o País | Kyro Clean Solutions",
      description: "Serviços de limpeza profissional de estofos disponíveis em todo o país. Porto, Gaia, Matosinhos, Lisboa, Braga e muito mais.",
    },
    en: {
      title: "Service Areas | Porto, Lisbon & Nationwide | Kyro Clean Solutions",
      description: "Professional upholstery cleaning services available nationwide. Porto, Gaia, Matosinhos, Lisbon, Braga and more.",
    },
    es: {
      title: "Áreas de Servicio | Porto, Lisboa y Todo el País | Kyro Clean Solutions",
      description: "Servicios de limpieza profesional de tapizados disponibles en todo el país.",
    },
  },
  "/guia-de-packs": {
    pt: {
      title: "Guia de Packs de Limpeza | Kyro Clean Solutions",
      description: "Escolha o pack de limpeza ideal para a sua casa. Packs com desconto para sofá, colchão, tapetes e mais. Orçamento grátis.",
    },
    en: {
      title: "Cleaning Packs Guide | Kyro Clean Solutions",
      description: "Choose the ideal cleaning pack for your home. Discounted packs for sofa, mattress, rugs and more. Free quote.",
    },
    es: {
      title: "Guía de Packs de Limpieza | Kyro Clean Solutions",
      description: "Elija el pack de limpieza ideal para su hogar. Packs con descuento para sofá, colchón, alfombras y más.",
    },
  },
  "/testemunhos": {
    pt: {
      title: "Testemunhos de Clientes | Kyro Clean Solutions | 5.0 Google",
      description: "Veja o que dizem os nossos clientes. Avaliação 5.0 no Google com mais de 1000 clientes satisfeitos.",
    },
    en: {
      title: "Client Testimonials | Kyro Clean Solutions | 5.0 Google",
      description: "See what our clients say. 5.0 Google rating with over 1000 satisfied clients.",
    },
    es: {
      title: "Testimonios de Clientes | Kyro Clean Solutions | 5.0 Google",
      description: "Vea lo que dicen nuestros clientes. Valoración 5.0 en Google con más de 1000 clientes satisfechos.",
    },
  },
  "/nosso-processo": {
    pt: {
      title: "O Nosso Processo | Kyro Clean Solutions",
      description: "Conheça o nosso processo de limpeza profissional. Tecnologia avançada, produtos certificados e resultados garantidos.",
    },
    en: {
      title: "Our Process | Kyro Clean Solutions",
      description: "Learn about our professional cleaning process. Advanced technology, certified products and guaranteed results.",
    },
    es: {
      title: "Nuestro Proceso | Kyro Clean Solutions",
      description: "Conozca nuestro proceso de limpieza profesional. Tecnología avanzada, productos certificados y resultados garantizados.",
    },
  },
};

const DOMAIN = "https://cleansolutions.com.pt";

const PageHead = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const lang = (i18n.language || "pt").substring(0, 2) as "pt" | "en" | "es";

  useEffect(() => {
    const path = location.pathname;
    const meta = routeMeta[path]?.[lang] || routeMeta[path]?.pt;

    if (meta) {
      document.title = meta.title;

      // Meta description
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag) descTag.setAttribute("content", meta.description);

      // OG tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", meta.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", meta.description);
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", `${DOMAIN}${path}`);

      // Twitter tags
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute("content", meta.title);
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute("content", meta.description);

      // Canonical
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `${DOMAIN}${path}`);
    }

    // Hreflang tags
    const hreflangLangs = ["pt", "en", "es"];
    // Remove old hreflang tags
    document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
    
    // Add new hreflang tags
    hreflangLangs.forEach(lng => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = lng;
      link.href = `${DOMAIN}${path}${lng !== "pt" ? `?lang=${lng}` : ""}`;
      document.head.appendChild(link);
    });

    // x-default
    const xDefault = document.createElement("link");
    xDefault.rel = "alternate";
    xDefault.setAttribute("hreflang", "x-default");
    xDefault.href = `${DOMAIN}${path}`;
    document.head.appendChild(xDefault);

    return () => {
      document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
    };
  }, [location.pathname, lang]);

  return null;
};

export default PageHead;
