import { cities, services, cityPrep } from './serviceCatalog';
import { locationPrices } from '../constants/travel';
import { PACK_PERK_MATTRESS_OFF, PACK_PERK_CHAIRS_SET, PACK_PERK_LIMIT, PACK_PERK_RULE, PACK_PERK_MIN_ORDER } from '../constants/packPerks';
import { RESPONSE_PROMISE, DRYING_PROMISE, SATISFACTION_PROMISE } from '../constants/commercialPolicy';
import type { PackKind, PackExtra } from '../lib/customPack';
// These are editable starting combinations, not separate price lists.
// Live amounts come from the same article tables used by the quote form.
// `name` é o título da página e começa sempre por "Limpeza": é o que as
// pessoas pesquisam ("limpeza de sofá e colchão"), "pack" quase não tem
// procura (dono, 2026-09-24). A FAQ usa "Quanto custa a ${name}", por isso um
// nome novo tem de manter esse arranque. Os slugs `pack-*` não mudam.
export interface PackCombo { id: string; name: string; slug: string; tagline: string; description: string; service1Slug: string; service2Slug: string; }
export const packs: PackCombo[] = [
  { id: 'sofa-colchao', name: 'Limpeza de Sofá e Colchão', slug: 'pack-sofa-e-colchao', tagline: 'Sala e quarto na mesma visita', description: 'Comece com sofá e colchão e adapte os tamanhos, quantidades e tratamentos. A estimativa e a deslocação aparecem no resumo.', service1Slug: 'limpeza-sofas', service2Slug: 'limpeza-colchoes' },
  { id: 'sofa-impermeabilizacao', name: 'Limpeza e Impermeabilização de Sofá', slug: 'pack-sofa-impermeabilizacao', tagline: 'Limpe e proteja o seu sofá', description: 'Escolha limpeza com impermeabilização Premium até 10 anos, ou Essencial de 1 a 2 anos. O preço acompanha o tamanho e a versão escolhida.', service1Slug: 'limpeza-sofas', service2Slug: 'impermeabilizacao' },
  { id: 'sala-completa', name: 'Limpeza de Sofá, Cadeiras e Tapete', slug: 'pack-sala-completa', tagline: 'Sofá, cadeiras e tapetes à sua medida', description: 'Escolha os artigos da sala. Os tapetes ficam sempre sob orçamento: indique largura e comprimento de cada peça.', service1Slug: 'limpeza-sofas', service2Slug: 'limpeza-tapetes' },
  { id: 'quarto-completo', name: 'Limpeza de Colchão e Tapete', slug: 'pack-quarto-completo', tagline: 'Personalize os cuidados do quarto', description: 'Combine colchões e tapetes e acrescente, se pretender, o tratamento anti-ácaros. Tapetes sempre sob orçamento, mediante medidas.', service1Slug: 'limpeza-colchoes', service2Slug: 'limpeza-tapetes' },
];
export const packCities = cities;
export function getAllPackComboRoutes() { return packs.flatMap(pack => packCities.map(city => ({ path: `/${pack.slug}-${city.slug}`, packId: pack.id, citySlug: city.slug }))); }
export function getPackByCityAndId(packId: string, citySlug: string) {
  const pack = packs.find(p => p.id === packId); const city = packCities.find(c => c.slug === citySlug);
  return pack && city ? { pack, city } : null;
}

// Artigos com que cada pack abre o configurador, e o tratamento de partida.
// Estavam escritos dentro da página; vivem aqui para o prerender poder dizer o
// mesmo que a página mostra.
export const PACK_KINDS: Record<string, PackKind[]> = {
  'sofa-colchao': ['sofa', 'mattress'],
  'sofa-impermeabilizacao': ['sofa'],
  'sala-completa': ['sofa', 'chairs', 'rug'],
  'quarto-completo': ['mattress', 'rug'],
};
export const PACK_INITIAL_EXTRA: Record<string, PackExtra> = { 'sofa-impermeabilizacao': 'premium' };

/** Frase curta que diz o que se ganha com cada combinação, para os blocos que
 * levam às páginas de pack (serviços, localidades, blog). Os números vêm de
 * packPerks.ts, nunca escritos à mão. */
export const PACK_HOOK: Record<string, string> = {
  'sofa-colchao': `A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, o colchão acrescentado fica ${PACK_PERK_MATTRESS_OFF}€ mais barato. Uma só deslocação.`,
  'sofa-impermeabilizacao': 'Limpeza e proteção contra nódoas na mesma visita, até 10 anos com a Premium.',
  'sala-completa': `Sofá, cadeiras e tapete numa só visita. A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, uma cadeira oferecida por cada ${PACK_PERK_CHAIRS_SET}.`,
  'quarto-completo': `Colchão e tapete numa só visita. A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, o segundo colchão fica ${PACK_PERK_MATTRESS_OFF}€ mais barato.`,
};

/** Preço de partida do pack: o mais baixo dos serviços que o compõem. */
export function packPriceFrom(pack: PackCombo): string {
  const amounts = [pack.service1Slug, pack.service2Slug]
    .map(slug => services.find(s => s.slug === slug)?.priceFrom ?? '')
    .map(value => Number(value.replace('€', '').trim()))
    .filter(value => Number.isFinite(value) && value > 0);
  return amounts.length ? `${Math.min(...amounts)}€` : 'Sob orçamento';
}

/** Quatro perguntas por pack e por cidade. A deslocação sai de travel.ts. */
export function packFaqs(pack: PackCombo, cityName: string): { question: string; answer: string }[] {
  const fee = locationPrices[cityName];
  const travel = fee === undefined ? 'a deslocação é confirmada pela morada, a partir de 10€' : `a deslocação é de ${fee}€`;
  return [
    {
      question: `Quanto custa a ${pack.name.toLowerCase()} ${cityPrep(cityName)} ${cityName}?`,
      answer: `Depende dos artigos, dos tamanhos e do tratamento que escolher. O configurador desta página mostra a estimativa enquanto escolhe, e ${travel}, cobrada uma única vez para a visita toda. O valor é confirmado antes da marcação.`,
    },
    {
      question: 'O que muda por ser um pack e não pedidos separados?',
      answer: `${PACK_PERK_RULE} A deslocação também é uma só. ${PACK_PERK_LIMIT}`,
    },
    {
      question: 'Posso acrescentar ou tirar artigos depois de pedir?',
      answer: `Pode. O pack é um ponto de partida editável: acrescente tapetes, alcatifas ou cadeiras no configurador, ou diga-nos na mensagem. Qualquer alteração ao pedido é orçamentada antes de avançarmos. ${RESPONSE_PROMISE.toLowerCase()}.`,
    },
    {
      question: 'Quanto tempo demora e quando posso voltar a usar tudo?',
      answer: `Uma visita de pack demora normalmente entre uma e três horas, conforme o número de artigos. ${DRYING_PROMISE} ${SATISFACTION_PROMISE}`,
    },
  ];
}

/** Os outros packs, para a página se ligar aos irmãos na mesma cidade. */
export function otherPacksInCity(packId: string, citySlug: string) {
  return packs.filter(pack => pack.id !== packId).map(pack => ({ label: pack.name, href: `/${pack.slug}-${citySlug}` }));
}
