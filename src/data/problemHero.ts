import { buildProblemWaMessage } from '../lib/whatsappMessages';
import type { ProblemPage } from './problemSeoData';
import { services, cityPrep, headingWithCity } from './serviceCatalog';
import { locationPrices } from '../constants/travel';
import { WHATSAPP_BASE } from '../constants/business';
import { RESPONSE_PROMISE } from '../constants/commercialPolicy';
import { startingPriceLabel } from './enginePrices';

const introductions: Record<ProblemPage['category'], string> = {
  manchas: 'Cuidados profissionais para as manchas no seu estofo.',
  odores: 'Avaliamos a origem do odor e o cuidado adequado ao tecido.',
  saude: 'Limpeza e tratamentos opcionais, de acordo com o cuidado pretendido.',
  materiais: 'Cuidados específicos para o material do seu estofo.',
  animais: 'Cuidado profissional para estofos que fazem parte da vida dos seus animais.',
  preco: 'Conheça o orçamento para cuidar dos seus estofos.',
  urgencia: 'Disponibilidade para o próprio dia ou seguinte, sob confirmação.',
  metodo: 'Limpeza profissional adaptada ao tecido e ao estado do artigo.',
  protecao: 'Proteção do tecido para facilitar os cuidados do dia a dia.',
};

/** Um passo da migalha: o texto e a página para onde aponta. */
export interface BreadcrumbStep { name: string; path: string }

/**
 * A migalha das páginas de problema, a mesma para quem vê o hero e para o
 * BreadcrumbList do JSON-LD (React e scripts/prerender.ts, que desenha a
 * migalha do HTML estático a partir desse schema).
 *
 * Página nacional: Início › serviço › problema. Problema × cidade: Início ›
 * problema › cidade, a subir para a página nacional do problema. Até 30/09/2026
 * o hero das 1.678 páginas de cidade mostrava "Início › serviço › cidade"
 * (o que o CommercialHero monta sozinho quando não recebe migalha) enquanto
 * declarava "Início › problema › cidade", e o das páginas nacionais parava no
 * serviço. Cada passo é uma página que existe: nunca um "/problemas" sem slug.
 */
export function problemBreadcrumb(problem: ProblemPage, city?: { name: string; slug: string }): BreadcrumbStep[] {
  const home = { name: 'Início', path: '/' };
  const page = { name: problem.h1, path: `/problemas/${problem.slug}` };
  if (city) return [home, page, { name: city.name, path: `/${problem.slug}-${city.slug}` }];
  const service = services.find(item => item.slug === problem.relatedServices[0]);
  return [home, ...(service ? [{ name: service.name, path: service.baseRoute }] : []), page];
}

/** Hero content shared by both problem templates and initial HTML. */
export function getProblemHero(problem: ProblemPage, city?: string) {
  const service = services.find(item => item.slug === problem.relatedServices[0])!;
  const location = city ? `${cityPrep(city)} ${city}` : '';
  const price = service.priceFrom;
  const isQuote = /orçamento/i.test(price);
  const fee = city ? locationPrices[city] : undefined;
  // "Limpeza desde 49€"; nas cadeiras "Limpeza a 20€ por cadeira" (ver `startingPriceLabel`).
  const priceLabel = isQuote ? 'Sob orçamento' : `${service.slug === 'impermeabilizacao' ? 'Proteção' : 'Limpeza'} ${startingPriceLabel(service.slug, price, 'mid')}`;
  const travelLabel = fee === undefined ? 'Deslocação a partir de 10€' : `Deslocação ${fee}€`;
  return {
    // Nas perguntas (páginas de preço) a cidade entra antes do "?".
    heading: city ? headingWithCity(problem.h1, city) : problem.h1,
    title: problem.h1,
    location,
    intro: introductions[problem.category],
    eyebrow: 'Cuidado profissional ao domicílio',
    priceLabel,
    travelLabel,
    response: RESPONSE_PROMISE,
    priceLinkLabel: isQuote ? 'Como pedir orçamento' : 'Ver preços',
    service,
    waHref: `${WHATSAPP_BASE}?text=${encodeURIComponent(buildProblemWaMessage(problem.slug, city))}`,
  };
}
