import { CHAIR_WATERPROOF_ESSENTIAL, CHAIR_WATERPROOF_PREMIUM } from '../constants/chairPricing';
import { sofaPrices, mattressPrices } from '../components/quiz/QuizTypes';
import { formatEuro, chairTierRows, SOFA_CLEAN_AND_PROTECT_FROM, SOFA_PROTECT_WITH_CLEANING_FROM } from './enginePrices';
// Programmatic SEO: Price pages data engine
// Targets searches like "preço limpeza sofá porto", "quanto custa limpar colchão"

import { cities, services, cityPrep } from "./serviceCatalog";
import { getLandingFaqs, type LandingService } from './landingFaqPool';
import { getLandingEditorial } from './landingEditorial';
import { PRICE_FACTORS } from './priceFactors';

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

// ── Preços das tabelas das páginas de preço ─────────────────────────────────
// Saem da mesma fonte que o quiz (QuizTypes.ts), pelo mesmo padrão já usado em
// blogData.ts: estes números estavam escritos à mão e alimentam as ~6.000
// páginas /preco-*, que são das poucas onde um preço errado é o próprio
// conteúdo da página. Um id que desapareça rebenta no build em vez de deixar
// um número desatualizado publicado. QuizTypes.ts não tem imports com alias
// "@/", por isso o scripts/prerender.ts continua a conseguir ler este ficheiro.
const eur = (value: number | string) => (typeof value === "number" ? `${value}€` : String(value));

const sofaSize = (id: string) => {
  const size = sofaPrices.find(item => item.id === id);
  if (!size) throw new Error(`priceSeoData: sofá "${id}" não existe em sofaPrices`);
  return size;
};
const mattressSize = (id: string) => {
  const size = mattressPrices.find(item => item.id === id);
  if (!size) throw new Error(`priceSeoData: colchão "${id}" não existe em mattressPrices`);
  return size;
};

const desde = (value: number | string) => `Desde ${eur(value)}`;

// Price tables per service
const priceTables: Record<string, { item: string; price: string; note?: string }[]> = {
  "limpeza-sofas": [
    { item: "Sofá 1 lugar", price: desde(sofaSize("1-lugar").cleaningPrice) },
    { item: "Sofá 2 lugares", price: desde(sofaSize("2-lugares").cleaningPrice) },
    { item: "Sofá 3 lugares", price: desde(sofaSize("3-lugares").cleaningPrice) },
    { item: "Sofá 4 lugares", price: desde(sofaSize("4-lugares").cleaningPrice) },
    { item: "Sofá 5+ lugares", price: desde(sofaSize("5-lugares").cleaningPrice) },
    { item: "Sofá de canto, em U ou modular", price: "Sob orçamento" },
    { item: "Sofá em L", price: "Sob orçamento" },
    // Acrescentada à limpeza, a impermeabilização não custa o preço de
    // tabela (esse é o do serviço sozinho): custa a diferença que o quiz cobra
    // pelo pack de limpeza + Essencial no mesmo sofá.
    { item: "Impermeabilização Essencial com a limpeza (1 lugar)", price: `+${formatEuro(SOFA_PROTECT_WITH_CLEANING_FROM)}`, note: `${formatEuro(SOFA_CLEAN_AND_PROTECT_FROM)} no total` },
  ],
  "limpeza-colchoes": [
    { item: "Colchão Solteiro", price: desde(mattressSize("solteiro").cleaningPrice) },
    { item: "Colchão Casal", price: desde(mattressSize("casal").cleaningPrice) },
    { item: "Colchão King Size", price: desde(mattressSize("king").cleaningPrice) },
    // Berço/criança não é um tamanho do quiz: cobra como o solteiro, o mais pequeno.
    { item: "Colchão berço/criança", price: desde(mattressSize("solteiro").cleaningPrice) },
    { item: "Cabeceira estofada", price: "Sob orçamento", note: "add-on" },
  ],
  "limpeza-tapetes": [
    { item: "Tapetes (qualquer dimensão)", price: "Sob orçamento", note: "medido à peça, largura x comprimento" },
    { item: "Tapete persa/oriental", price: "Sob orçamento", note: "tratamento premium" },
  ],
  "limpeza-cadeiras": [
    // Os escalões lidos do próprio calcChairClean do quiz.
    ...chairTierRows(),
  ],
  "limpeza-alcatifas": [
    { item: "Alcatifas (qualquer dimensão)", price: "Sob orçamento", note: "medida no local, à área" },
  ],
  "impermeabilizacao": [
    { item: "Sofá 1 lugar", price: desde(sofaSize("1-lugar").waterproofingPrice), note: `Essencial, ${eur(sofaSize("1-lugar").waterproofingPremiumPrice!)} na Premium` },
    { item: "Sofá 2 lugares", price: desde(sofaSize("2-lugares").waterproofingPrice), note: `Essencial, ${eur(sofaSize("2-lugares").waterproofingPremiumPrice!)} na Premium` },
    { item: "Sofá 3 lugares", price: desde(sofaSize("3-lugares").waterproofingPrice), note: `Essencial, ${eur(sofaSize("3-lugares").waterproofingPremiumPrice!)} na Premium` },
    { item: "Sofá 4 lugares", price: desde(sofaSize("4-lugares").waterproofingPrice), note: `Essencial, ${eur(sofaSize("4-lugares").waterproofingPremiumPrice!)} na Premium` },
    { item: "Sofá 5+ lugares, de canto, em U ou modular", price: "Sob orçamento" },
    { item: "Cadeiras (por unidade)", price: `${CHAIR_WATERPROOF_ESSENTIAL}€/un`, note: `Essencial, ${CHAIR_WATERPROOF_PREMIUM}€/un na Premium` },
    { item: "Cabeceira", price: "Sob orçamento" },
  ],
};


// ── Generate price page data ──

export function getPricePageData(serviceSlug: string, citySlug: string): PricePageData | null {
  const service = services.find(s => s.slug === serviceSlug);
  const city = cities.find(c => c.slug === citySlug);
  if (!service || !city) return null;

  const table = priceTables[serviceSlug] || [];
  // Os mesmos fatores dos cartões "Como é calculado o preço?", não uma lista à parte.
  const factors = (PRICE_FACTORS[serviceSlug] ?? []).flatMap(factor => factor.examples);
  const prep = cityPrep(city.name);
  const faqs = getLandingFaqs({ serviceSlug: serviceSlug as LandingService, pageKey: `/preco-${serviceSlug}-${citySlug}`, municipality: city.name, family: 'preco' });

  return {
    serviceSlug: service.slug,
    serviceName: service.name,
    citySlug: city.slug,
    cityName: city.name,
    title: `Preço ${service.name} ${city.name} | Tabela de Preços | Kyro Clean Solutions`,
    ...getLandingEditorial({ family: 'preco', serviceSlug: serviceSlug as LandingService, serviceLabel: service.name, place: city.name, municipality: city.name }),
    h1: `Preço de ${service.name} ${prep} ${city.name}`,
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
