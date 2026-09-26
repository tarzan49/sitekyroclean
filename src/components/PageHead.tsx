import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_URL } from "@/constants/business";
import { LEGAL_PAGES } from "@/data/legalPages";

interface PageMeta {
  title: string;
  description: string;
}

const routeMeta: Record<string, { pt: PageMeta; en: PageMeta; es: PageMeta }> = {
  "/": {
    pt: {
      title: "Kyro Clean Solutions | Limpeza de Sofás, Colchões e Tapetes ao Domicílio",
      description: "Limpeza profissional de sofás, colchões e tapetes ao domicílio. Equipas em Braga, Porto, Lisboa e Algarve. Orçamento claro e resposta em menos de 10 minutos.",
    },
    en: {
      title: "Kyro Clean Solutions | Professional Sofa, Mattress & Rug Cleaning at Home",
      description: "Professional sofa, mattress and rug cleaning at home. Teams in Braga, Porto, Lisbon and Algarve. Clear quotes and a response in under 10 minutes.",
    },
    es: {
      title: "Kyro Clean Solutions | Limpieza de Sofás, Colchones y Alfombras a Domicilio",
      description: "Limpieza profesional de sofás, colchones y alfombras a domicilio. Equipos en Braga, Oporto, Lisboa y Algarve. Presupuesto claro y respuesta en menos de 10 minutos.",
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
      description: "Escolha o pack de limpeza ideal para a sua casa. Sofá, colchão, tapetes e mais na mesma visita, com preço de pack no artigo acrescentado. Orçamento grátis.",
    },
    en: {
      title: "Cleaning Packs Guide | Kyro Clean Solutions",
      description: "Choose the ideal cleaning pack for your home. Sofa, mattress, rugs and more in the same visit, with a pack price on each added item. Free quote.",
    },
    es: {
      title: "Guía de Packs de Limpieza | Kyro Clean Solutions",
      description: "Elija el pack de limpieza ideal para su hogar. Sofá, colchón, alfombras y más en la misma visita, con precio de pack en cada artículo añadido.",
    },
  },
};

// As três páginas legais tiram o título e a descrição de `src/data/legalPages.ts`,
// a mesma fonte que o `scripts/prerender.ts` usa para o HTML estático. Antes
// disto só a de privacidade tinha entrada aqui: `/termos-e-condicoes` e
// `/politica-de-devolucoes` não tinham título nem descrição próprios e ficavam
// com os do `404.html`, que era o ficheiro que o Cloudflare lhes servia.
// As traduções en/es já escritas são preservadas.
for (const page of LEGAL_PAGES) {
  const meta: PageMeta = { title: page.title, description: page.description };
  const existing = routeMeta[page.path];
  routeMeta[page.path] = { pt: meta, en: existing?.en ?? meta, es: existing?.es ?? meta };
}

// As seis páginas-pilar não estão em `routeMeta`: o título e a descrição vêm
// de `src/data/pillarPages.ts`, a mesma fonte do h1, das FAQs e do HTML
// estático (`scripts/prerender.ts`). Antes havia aqui uma terceira cópia, e os
// títulos divergiam do HTML estático em quatro das seis páginas.
// O módulo é importado só nestes caminhos: traz as FAQs e o motor de preços, e
// o PageHead está no pacote inicial de todas as páginas. A página-pilar já o
// carregou, por isso a importação não faz novo pedido.
// `pillarPages.test.ts` confirma que esta lista é a de PILLAR_PAGES.
const PILLAR_PATHS = new Set(["/limpeza-sofas", "/limpeza-colchoes", "/limpeza-tapetes", "/limpeza-cadeiras", "/limpeza-alcatifas", "/impermeabilizacao"]);

const applyMeta = (path: string, meta: PageMeta) => {
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
  if (ogUrl) ogUrl.setAttribute("content", `${SITE_URL}${path}`);

  // Twitter tags
  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute("content", meta.title);
  const twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute("content", meta.description);

  // Canonical
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", `${SITE_URL}${path}`);
};

const PageHead = () => {
  const location = useLocation();
  const lang = "pt" as "pt" | "en" | "es";

  useEffect(() => {
    const path = location.pathname;
    let cancelled = false;

    if (PILLAR_PATHS.has(path)) {
      import("@/data/pillarPages").then(({ getPillarPage }) => {
        if (cancelled) return;
        const page = getPillarPage(path);
        applyMeta(path, { title: page.title, description: page.description });
      });
    } else {
      const meta = routeMeta[path]?.[lang] || routeMeta[path]?.pt;
      if (meta) applyMeta(path, meta);
    }

    return () => { cancelled = true; };
  }, [location.pathname, lang]);

  return null;
};

export default PageHead;
