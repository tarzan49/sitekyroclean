import { cityPrep } from './serviceCatalog';
import { formatEuro, startingPriceLabel, SOFA_CLEANING_FROM, MATTRESS_CLEANING_FROM, CHAIR_CLEANING_FROM } from './enginePrices';

// Lista partilhada de cidades para todas as páginas Marca × Item × Cidade
// (sofá, colchão, cadeiras, tapetes). As 34 cidades mais povoadas do país
// entre as que o site já cobre em locationSeoData.ts — ranking real de
// população INE/Censos via Wikipédia:
// https://pt.wikipedia.org/wiki/Lista_de_munic%C3%ADpios_de_Portugal_por_popula%C3%A7%C3%A3o
// Aveiro/Coimbra ficam de fora: população elevada mas sem páginas de
// localização no site (ficariam órfãs). Barcelos foi adicionado em
// 2026-08-25 (expansão Braga) — já tem página de localização própria.
export const MARCA_CITIES = [
  // Porto/Norte
  { name: "Porto", slug: "porto" },
  { name: "Vila Nova de Gaia", slug: "vila-nova-de-gaia" },
  { name: "Braga", slug: "braga" },
  { name: "Matosinhos", slug: "matosinhos" },
  { name: "Gondomar", slug: "gondomar" },
  { name: "Guimarães", slug: "guimaraes" },
  { name: "Maia", slug: "maia" },
  { name: "Valongo", slug: "valongo" },
  { name: "Paredes", slug: "paredes" },
  { name: "Vila do Conde", slug: "vila-do-conde" },
  { name: "Póvoa de Varzim", slug: "povoa-de-varzim" },
  { name: "Penafiel", slug: "penafiel" },
  { name: "Santo Tirso", slug: "santo-tirso" },
  { name: "Vila Nova de Famalicão", slug: "vila-nova-de-famalicao" },
  { name: "Barcelos", slug: "barcelos" },
  { name: "Viana do Castelo", slug: "viana-do-castelo" },
  { name: "Póvoa de Lanhoso", slug: "povoa-de-lanhoso" },
  { name: "Fafe", slug: "fafe" },
  { name: "Esposende", slug: "esposende" },
  // Lisboa / Área Metropolitana
  { name: "Lisboa", slug: "lisboa" },
  { name: "Sintra", slug: "sintra" },
  { name: "Cascais", slug: "cascais" },
  { name: "Loures", slug: "loures" },
  { name: "Amadora", slug: "amadora" },
  { name: "Almada", slug: "almada" },
  { name: "Seixal", slug: "seixal" },
  { name: "Oeiras", slug: "oeiras" },
  { name: "Odivelas", slug: "odivelas" },
  { name: "Vila Franca de Xira", slug: "vila-franca-de-xira" },
  { name: "Setúbal", slug: "setubal" },
  { name: "Mafra", slug: "mafra" },
  { name: "Barreiro", slug: "barreiro" },
  { name: "Moita", slug: "moita" },
  { name: "Montijo", slug: "montijo" },
  { name: "Palmela", slug: "palmela" },
  { name: "Sesimbra", slug: "sesimbra" },
  // Algarve
  { name: "Faro", slug: "faro" },
  { name: "Loulé", slug: "loule" },
  { name: "Portimão", slug: "portimao" },
  { name: "Albufeira", slug: "albufeira" },
] as const;

export const MARCA_CITY_SLUGS = MARCA_CITIES.map(c => c.slug);

// ─── Texto partilhado das páginas de marca ──────────────────────────────────
// As páginas de marca eram escritas duas vezes, no componente React e no
// scripts/prerender.ts, e cada lado dizia coisas diferentes: "no Porto" num e
// "em Porto" no outro, um <h1> diferente, uma migalha com três nomes
// diferentes, "Desde 12.5€" (o preço da 7.ª cadeira, com ponto) no hero e um
// intervalo de preços inventado por marca na meta description e no schema.
// Nas cadeiras, o preço diz-se por cadeira ("Limpeza a 20€ por cadeira"),
// nunca "desde": ver `startingPriceLabel` em enginePrices.ts.
// Tudo o que as duas versões mostram sai daqui. Sem imports com alias `@/`.

export type MarcaKind = 'sofa' | 'colchao' | 'cadeiras';

const MARCA_KINDS = {
  sofa: { serviceSlug: 'limpeza-sofas', serviceName: 'Limpeza de Sofás', routePrefix: 'limpeza-sofa', titleNoun: 'Sofá', item: 'Sofá', plural: 'sofás', from: SOFA_CLEANING_FROM, cityLink: 'Ver todos os materiais e preços' },
  colchao: { serviceSlug: 'limpeza-colchoes', serviceName: 'Limpeza de Colchões', routePrefix: 'limpeza-colchao', titleNoun: 'Colchão', item: 'Colchão', plural: 'colchões', from: MATTRESS_CLEANING_FROM, cityLink: 'Ver todos os tamanhos e preços' },
  cadeiras: { serviceSlug: 'limpeza-cadeiras', serviceName: 'Limpeza de Cadeiras', routePrefix: 'limpeza-cadeiras', titleNoun: 'Cadeiras', item: 'Cadeiras', plural: 'cadeiras', from: CHAIR_CLEANING_FROM, cityLink: 'Ver tabela completa de preços' },
} as const;

/**
 * Título, descrição, <h1>, migalha e preço de uma página de marca. O preço é
 * o de partida do serviço no motor (a marca não muda a tabela do quiz): sofá
 * de 1 lugar, colchão de solteiro, uma cadeira.
 */
export function marcaPageCopy(kind: MarcaKind, marca: { name: string; slug: string; material: string }, city: { name: string; slug: string }) {
  const k = MARCA_KINDS[kind];
  const where = `${cityPrep(city.name)} ${city.name}`;
  const priceFrom = formatEuro(k.from);
  return {
    serviceSlug: k.serviceSlug,
    serviceName: k.serviceName,
    serviceBaseRoute: `/${k.serviceSlug}`,
    path: `/${k.routePrefix}-${marca.slug}-${city.slug}`,
    title: `Limpeza ${k.titleNoun} ${marca.name} ${where}, Especialistas | Kyro Clean`,
    description: `Especialistas em limpeza de ${k.plural} ${marca.name} ${where}. ${marca.material}. Limpeza ${startingPriceLabel(k.serviceSlug, priceFrom, 'mid')}. Serviço ao domicílio.`,
    h1: `Limpeza de ${k.item} ${marca.name} ${where}`,
    breadcrumbName: `${k.item} ${marca.name} ${where}`,
    /** Rótulo do preço de partida ("49€", "20€"), com vírgula quando for preciso. */
    priceFrom,
    /** Ligação para a tabela de preços do serviço nesta cidade. */
    cityServiceHref: `/${k.serviceSlug}-${city.slug}`,
    cityServiceLabel: `${k.cityLink} ${where}`,
  };
}

/** "Outras marcas de sofás": o nome real de cada marca, não o slug. */
export function otherMarcaLinks(kind: MarcaKind, brands: readonly { name: string; slug: string }[], marcaSlug: string, citySlug: string) {
  const k = MARCA_KINDS[kind];
  return brands
    .filter(brand => brand.slug !== marcaSlug)
    .map(brand => ({ href: `/${k.routePrefix}-${brand.slug}-${citySlug}`, label: brand.name }));
}

/** Os quatro passos do bloco "O nosso processo", por tipo de artigo. */
export const MARCA_PROCESS_STEPS: Record<MarcaKind, { title: string; desc: string }[]> = {
  sofa: [
    { title: 'Inspeção do tecido', desc: 'Avaliação do material, estado das fibras e manchas antes de qualquer intervenção.' },
    { title: 'Pré-tratamento', desc: 'Aplicação de produto específico para dissolver manchas e sujidade incrustada.' },
    { title: 'Extração profissional', desc: 'Limpeza em profundidade com equipamento de vapor e água quente calibrado ao tecido.' },
    { title: 'Verificação final', desc: 'Inspeção do resultado, escovagem e recolocação das almofadas.' },
  ],
  colchao: [
    { title: 'Inspeção do colchão', desc: 'Avaliação do tipo de núcleo (espuma ou molas), tecido exterior e manchas antes de qualquer intervenção.' },
    { title: 'Pré-tratamento', desc: 'Aplicação de produto específico para dissolver manchas e sujidade incrustada no tecido acolchoado.' },
    { title: 'Extração profissional', desc: 'Vapor de baixa humidade calibrado ao núcleo interior, com tratamento anti-ácaros certificado.' },
    { title: 'Secagem e verificação', desc: 'Ventilação assistida e inspeção final antes de o colchão voltar a estar pronto a usar.' },
  ],
  cadeiras: [
    { title: 'Inspeção das cadeiras', desc: 'Avaliação do tipo de estofo (tecido, mesh ou couro) e manchas antes de qualquer intervenção.' },
    { title: 'Pré-tratamento', desc: 'Aplicação de produto específico para dissolver manchas e sujidade incrustada no estofo.' },
    { title: 'Extração profissional', desc: 'Vapor calibrado ao tipo de material, com atenção redobrada a costuras e rodízios.' },
    { title: 'Secagem e verificação', desc: 'Ventilação assistida e inspeção final antes de as cadeiras voltarem a estar prontas a usar.' },
  ],
};
