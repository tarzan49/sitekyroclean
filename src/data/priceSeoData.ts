// Programmatic SEO: Price pages data engine
// Targets searches like "preço limpeza sofá porto", "quanto custa limpar colchão"

import { cities, services, cityPrep } from "./locationSeoData";

export interface PricePageData {
  serviceSlug: string;
  serviceName: string;
  citySlug: string;
  cityName: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  priceTable: { item: string; price: string; note?: string }[];
  factors: string[];
  faqs: { question: string; answer: string }[];
}

// Price tables per service
const priceTables: Record<string, { item: string; price: string; note?: string }[]> = {
  "limpeza-sofas": [
    { item: "Sofá 1 lugar", price: "Desde 49€" },
    { item: "Sofá 2 lugares", price: "Desde 69€" },
    { item: "Sofá 3 lugares", price: "Desde 79€" },
    { item: "Sofá 4-5 lugares", price: "Desde 89€" },
    { item: "Sofá em L", price: "Desde 99€" },
    { item: "Impermeabilização", price: "Desde 49€", note: "add-on recomendado" },
  ],
  "limpeza-colchoes": [
    { item: "Colchão Solteiro", price: "Desde 49€" },
    { item: "Colchão Casal", price: "Desde 59€" },
    { item: "Colchão King Size", price: "Desde 69€" },
    { item: "Colchão berço/criança", price: "Desde 39€" },
    { item: "Cabeceira estofada", price: "Desde 20€", note: "add-on" },
  ],
  "limpeza-tapetes": [
    { item: "Tapete até 5m²", price: "12€/m²" },
    { item: "Tapete até 10m²", price: "10€/m²" },
    { item: "Tapete até 15m²", price: "9€/m²" },
    { item: "Tapete +15m²", price: "Sob consulta" },
    { item: "Tapete persa/oriental", price: "Sob consulta", note: "tratamento premium" },
  ],
  "limpeza-cadeiras": [
    { item: "Cadeira simples", price: "Desde 10€" },
    { item: "Cadeira de escritório", price: "Desde 15€" },
    { item: "Poltrona", price: "Desde 25€" },
    { item: "Cadeirão", price: "Desde 30€" },
    { item: "Pack 4 cadeiras", price: "Desde 35€" },
    { item: "Pack 6 cadeiras", price: "Desde 50€" },
  ],
  "limpeza-alcatifas": [
    { item: "Alcatifa até 10m²", price: "Desde 30€" },
    { item: "Alcatifa 10-20m²", price: "Desde 50€" },
    { item: "Alcatifa 20-40m²", price: "Desde 80€" },
    { item: "Alcatifa +40m²", price: "Sob consulta" },
  ],
  "impermeabilizacao": [
    { item: "Sofá 1 lugar", price: "Desde 49€" },
    { item: "Sofá 2-3 lugares", price: "Desde 69€" },
    { item: "Sofá 4-5 lugares", price: "Desde 89€" },
    { item: "Cadeiras (por unidade)", price: "Desde 8€" },
    { item: "Tapete (por m²)", price: "Desde 5€/m²" },
    { item: "Cabeceira", price: "Desde 15€" },
  ],
};

const priceFactors: Record<string, string[]> = {
  "limpeza-sofas": [
    "Tamanho e número de lugares do sofá",
    "Tipo de tecido (pele, veludo, microfibra, etc.)",
    "Gravidade e tipo de manchas",
    "Necessidade de desodorização extra",
    "Impermeabilização adicional",
  ],
  "limpeza-colchoes": [
    "Dimensão do colchão (solteiro, casal, king)",
    "Estado geral e tipo de manchas",
    "Necessidade de anti-ácaros extra",
    "Limpeza de cabeceira incluída ou não",
  ],
  "limpeza-tapetes": [
    "Dimensão em metros quadrados",
    "Material (lã, sintético, seda, sisal)",
    "Tapetes artesanais ou persas requerem tratamento especial",
    "Estado das manchas e sujidade acumulada",
  ],
  "limpeza-cadeiras": [
    "Tipo de cadeira (simples, escritório, poltrona)",
    "Material do estofamento",
    "Número de cadeiras (descontos por quantidade)",
    "Manchas e estado geral",
  ],
  "limpeza-alcatifas": [
    "Área total em metros quadrados",
    "Tipo de alcatifa e fibra",
    "Acessibilidade do espaço",
    "Estado e nível de sujidade",
  ],
  "impermeabilizacao": [
    "Tipo de peça a impermeabilizar",
    "Tamanho da superfície",
    "Material do tecido",
    "Combinação com limpeza (pack com desconto)",
  ],
};

const priceFaqs: Record<string, { question: string; answer: string }[]> = {
  "limpeza-sofas": [
    { question: "Quanto custa limpar um sofá em {city}?", answer: "A limpeza de sofás em {city} começa a partir de 69€ para sofás de 2 lugares. O preço final depende do tamanho, tipo de tecido e estado do sofá. Peça um orçamento grátis para saber o preço exato." },
    { question: "O orçamento é gratuito?", answer: "Sim, todos os nossos orçamentos são 100% gratuitos e sem compromisso. Pode pedir por WhatsApp, telefone ou através do nosso formulário online." },
    { question: "Há custos adicionais de deslocação em {city}?", answer: "Não. A deslocação em {city} e arredores está incluída no preço do serviço. Não cobramos taxa de deslocação." },
    { question: "Oferecem descontos para múltiplas peças?", answer: "Sim! Se combinar vários serviços (ex: sofá + colchão + cadeiras) aplicamos desconto no valor total. Peça um orçamento personalizado." },
  ],
  "limpeza-colchoes": [
    { question: "Quanto custa limpar um colchão em {city}?", answer: "A limpeza de colchões em {city} começa a partir de 49€ para colchões de solteiro e 59€ para colchões de casal. O preço depende do tamanho e estado do colchão." },
    { question: "O preço inclui anti-ácaros?", answer: "Sim, o nosso serviço standard inclui tratamento anti-ácaros. Para tratamentos intensivos, pode haver um suplemento." },
    { question: "A deslocação em {city} tem custo?", answer: "Não. A deslocação está incluída no preço do serviço em {city} e arredores." },
  ],
  "limpeza-tapetes": [
    { question: "Quanto custa limpar um tapete em {city}?", answer: "A limpeza de tapetes em {city} começa a partir de 12€/m². Tapetes artesanais, persas ou de seda podem ter preços especiais. Peça orçamento gratuito." },
    { question: "Recolhem e entregam tapetes em {city}?", answer: "Sim, podemos recolher o tapete em {city}, limpá-lo no nosso centro e entregá-lo limpo na sua casa. O serviço de recolha e entrega está incluído." },
  ],
  "limpeza-cadeiras": [
    { question: "Quanto custa limpar cadeiras em {city}?", answer: "A limpeza de cadeiras em {city} começa a partir de 10€ por cadeira. Oferecemos packs com desconto para 4 ou mais cadeiras." },
    { question: "Limpam cadeiras de escritório?", answer: "Sim, limpamos todo o tipo de cadeiras estofadas: cadeiras de jantar, de escritório, poltronas e cadeirões." },
  ],
  "limpeza-alcatifas": [
    { question: "Quanto custa limpar alcatifas em {city}?", answer: "A limpeza de alcatifas em {city} começa a partir de 3€/m². O preço depende da área total e estado da alcatifa." },
  ],
  "impermeabilizacao": [
    { question: "Quanto custa impermeabilizar um sofá em {city}?", answer: "A impermeabilização de sofás em {city} custa desde 49€ (1 lugar), 69€ (2-3 lugares) e 89€ (4-5 lugares). Recomendamos combinar com limpeza para melhor resultado e preço especial." },
    { question: "A impermeabilização vale a pena?", answer: "Sim. A impermeabilização protege contra manchas de líquidos e prolonga a vida útil do estofamento. É especialmente recomendada para famílias com crianças ou animais." },
  ],
};

// ── Generate price page data ──

export function getPricePageData(serviceSlug: string, citySlug: string): PricePageData | null {
  const service = services.find(s => s.slug === serviceSlug);
  const city = cities.find(c => c.slug === citySlug);
  if (!service || !city) return null;

  const table = priceTables[serviceSlug] || [];
  const factors = priceFactors[serviceSlug] || [];
  const prep = cityPrep(city.name);
  const faqs = (priceFaqs[serviceSlug] || []).map(faq => ({
    question: faq.question.replace(/em \{city\}/g, `${prep} ${city.name}`),
    answer: faq.answer.replace(/em \{city\}/g, `${prep} ${city.name}`),
  }));

  return {
    serviceSlug: service.slug,
    serviceName: service.name,
    citySlug: city.slug,
    cityName: city.name,
    title: `Preço ${service.name} ${city.name} | Tabela de Preços | Kyro Clean Solutions`,
    metaDescription: `Preços de ${service.name.toLowerCase()} ${prep} ${city.name}. Tabela de preços atualizada. Desde ${service.priceFrom}. Orçamento gratuito e sem compromisso.`,
    h1: `Preço de ${service.name} ${prep} ${city.name}`,
    intro: `Consulte os preços de ${service.name.toLowerCase()} ${prep} ${city.name}. Todos os nossos preços incluem deslocação, equipamento de extração profissional e produtos certificados. Orçamento gratuito e sem compromisso.`,
    priceTable: table,
    factors,
    faqs,
  };
}

export function getAllPriceRoutes(): { path: string; serviceSlug: string; citySlug: string }[] {
  const routes: { path: string; serviceSlug: string; citySlug: string }[] = [];
  for (const service of services) {
    for (const city of cities) {
      routes.push({
        path: `/preco-${service.slug}-${city.slug}`,
        serviceSlug: service.slug,
        citySlug: city.slug,
      });
    }
  }
  return routes;
}
