// Programmatic SEO: Price pages data engine
// Targets searches like "preço limpeza sofá porto", "quanto custa limpar colchão"

import { cities, services, cityPrep } from "./locationSeoData";
import { getLandingFaqs, type LandingService } from './landingFaqPool';

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
    { item: "Sofá 4-5 lugares", price: "Sob orçamento" },
    { item: "Sofá em L", price: "Sob orçamento" },
    { item: "Impermeabilização", price: "Desde 59€", note: "add-on recomendado" },
  ],
  "limpeza-colchoes": [
    { item: "Colchão Solteiro", price: "Desde 59€" },
    { item: "Colchão Casal", price: "Desde 69€" },
    { item: "Colchão King Size", price: "Desde 79€" },
    { item: "Colchão berço/criança", price: "Desde 59€" },
    { item: "Cabeceira estofada", price: "Desde 20€", note: "add-on" },
  ],
  "limpeza-tapetes": [
    { item: "Tapetes (qualquer dimensão)", price: "Sob orçamento", note: "medido à peça, largura x comprimento" },
    { item: "Tapete persa/oriental", price: "Sob orçamento", note: "tratamento premium" },
  ],
  "limpeza-cadeiras": [
    { item: "1ª a 4ª cadeira", price: "20€/un" },
    { item: "5ª a 6ª cadeira", price: "15€/un" },
    { item: "7ª a 9ª cadeira", price: "12,50€/un" },
    { item: "10+ cadeiras", price: "Sob orçamento" },
  ],
  "limpeza-alcatifas": [
    { item: "Alcatifas (qualquer dimensão)", price: "Sob orçamento", note: "medida no local, à área" },
  ],
  "impermeabilizacao": [
    { item: "Sofá 1 lugar", price: "Desde 59€", note: "Essencial, 89€ na Premium" },
    { item: "Sofá 2 lugares", price: "Desde 79€", note: "Essencial, 109€ na Premium" },
    { item: "Sofá 3 lugares", price: "Desde 99€", note: "Essencial, 139€ na Premium" },
    { item: "Cadeiras (por unidade)", price: "Desde 20€", note: "Essencial, 30€ na Premium" },
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
    "Presença de chaise longue ou módulos extra",
  ],
  "limpeza-colchoes": [
    "Dimensão do colchão (solteiro, casal, king)",
    "Estado geral e tipo de manchas",
    "Necessidade de anti-ácaros extra",
    "Limpeza de cabeceira incluída ou não",
    "Tipo de colchão (espuma, molas, viscoelástico)",
    "Tempo desde a última higienização profissional",
  ],
  "limpeza-tapetes": [
    "Dimensão em metros quadrados",
    "Material (lã, sintético, seda, sisal)",
    "Tapetes artesanais ou persas requerem tratamento especial",
    "Estado das manchas e sujidade acumulada",
    "Necessidade de recolha e entrega",
    "Idade e fragilidade das fibras",
  ],
  "limpeza-cadeiras": [
    "Tipo de cadeira (simples, escritório, poltrona)",
    "Material do estofamento",
    "Número de cadeiras (descontos por quantidade)",
    "Manchas e estado geral",
    "Local do serviço (residência, escritório, restaurante)",
    "Acesso e disponibilidade do espaço",
  ],
  "limpeza-alcatifas": [
    "Área total em metros quadrados",
    "Tipo de alcatifa e fibra",
    "Acessibilidade do espaço",
    "Estado e nível de sujidade",
    "Necessidade de tratamento anti-fúngico",
    "Frequência de manutenção anterior",
  ],
  "impermeabilizacao": [
    "Tipo de peça a impermeabilizar",
    "Tamanho da superfície",
    "Material do tecido",
    "Combinação com limpeza (pack com desconto)",
    "Exposição a crianças ou animais domésticos",
    "Nível de proteção desejado (padrão ou reforçada)",
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
  const faqs = getLandingFaqs({ serviceSlug: serviceSlug as LandingService, pageKey: `/preco-${serviceSlug}-${citySlug}`, municipality: city.name, family: 'preco' });

  return {
    serviceSlug: service.slug,
    serviceName: service.name,
    citySlug: city.slug,
    cityName: city.name,
    title: `Preço ${service.name} ${city.name} | Tabela de Preços | Kyro Clean Solutions`,
    metaDescription: `Preços de ${service.name.toLowerCase()} ${prep} ${city.name}. Tabela de preços atualizada.${/^\d/.test(service.priceFrom) ? ` Desde ${service.priceFrom}.` : ''} Orçamento gratuito e sem compromisso.`,
    h1: `Preço de ${service.name} ${prep} ${city.name}`,
    intro: `Consulte os preços de ${service.name.toLowerCase()} ${prep} ${city.name}. Preços transparentes, sem custos escondidos: a deslocação é calculada consoante a localização, equipamento de extração profissional e produtos certificados. Orçamento gratuito e sem compromisso.`,
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
