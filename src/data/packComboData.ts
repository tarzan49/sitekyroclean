import { cities, services, cityPrep } from './serviceCatalog';
import { locationPrices } from '../constants/travel';
import { PACK_PERK_MATTRESS_OFF, PACK_PERK_CHAIRS_SET, PACK_PERK_LIMIT, PACK_PERK_RULE, PACK_PERK_MIN_ORDER, PACK_PERK_RUG_NOTE } from '../constants/packPerks';
import { RESPONSE_PROMISE, DRYING_PROMISE, SATISFACTION_PROMISE } from '../constants/commercialPolicy';
import type { PackKind, PackExtra } from '../lib/customPack';
import { formatEuro, SOFA_CLEAN_AND_PROTECT_FROM, SOFA_PROTECT_WITH_CLEANING_FROM, CHAIR_CLEANING_FROM, CHAIR_WATERPROOF_SMALL_PREMIUM_UNIT, CHAIR_WATERPROOF_SMALL_ESSENCIAL_UNIT, CHAIR_WATERPROOF_PREMIUM_UNIT, CHAIR_WATERPROOF_ESSENCIAL_UNIT } from './enginePrices';
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
  { id: 'cadeiras-impermeabilizacao', name: 'Limpeza e Impermeabilização de Cadeiras', slug: 'pack-cadeiras-impermeabilizacao', tagline: 'Limpe e proteja as cadeiras da sala de jantar', description: 'Escolha o número de cadeiras e a impermeabilização Premium até 10 anos, ou Essencial de 1 a 2 anos. O preço por cadeira desce com a quantidade.', service1Slug: 'limpeza-cadeiras', service2Slug: 'impermeabilizacao' },
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
  'cadeiras-impermeabilizacao': ['chairs'],
  'sala-completa': ['sofa', 'chairs', 'rug'],
  'quarto-completo': ['mattress', 'rug'],
};
export const PACK_INITIAL_EXTRA: Record<string, PackExtra> = { 'sofa-impermeabilizacao': 'premium', 'cadeiras-impermeabilizacao': 'premium' };

/** Frase curta que diz o que se ganha com cada combinação, para os blocos que
 * levam às páginas de pack (serviços, localidades, blog). Os números vêm de
 * packPerks.ts, nunca escritos à mão. O preço de pack é só para artigos de
 * outro tipo que o principal: um segundo colchão num pack de colchão paga
 * tabela (priceWithPackPerks), por isso nenhuma frase o pode prometer. */
export const PACK_HOOK: Record<string, string> = {
  'sofa-colchao': `A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, o colchão acrescentado fica ${PACK_PERK_MATTRESS_OFF}€ mais barato. Uma só deslocação.`,
  'sofa-impermeabilizacao': 'Limpeza e proteção contra nódoas na mesma visita, até 10 anos com a Premium.',
  'cadeiras-impermeabilizacao': 'Limpeza e proteção contra nódoas nas cadeiras, na mesma visita. Ideal para a mesa onde se come todos os dias.',
  'sala-completa': `Sofá, cadeiras e tapete numa só visita. A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, uma cadeira oferecida por cada ${PACK_PERK_CHAIRS_SET}.`,
  'quarto-completo': `Colchão e tapete numa só visita. A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, no tapete acrescentado: ${PACK_PERK_RUG_NOTE.toLowerCase()}.`,
};

/** Preço de partida do pack: o mais baixo dos serviços que o compõem. */
export function packPriceFrom(pack: PackCombo): string {
  // Packs de impermeabilização: o "desde" é o da limpeza + proteção, nunca o de um serviço sozinho.
  if (pack.id === 'sofa-impermeabilizacao') return formatEuro(SOFA_CLEAN_AND_PROTECT_FROM);
  if (pack.id === 'cadeiras-impermeabilizacao') return `${formatEuro(CHAIR_CLEANING_FROM + CHAIR_WATERPROOF_ESSENCIAL_UNIT)}/cadeira`;
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
    ...(WATERPROOF_PACK_FAQS[pack.id] ?? []),
  ];
}

/** Perguntas próprias dos packs com impermeabilização. Preços do motor (enginePrices). */
const WATERPROOF_COMMON = [
  {
    question: 'Qual a diferença entre a impermeabilização Premium e a Essencial?',
    answer: 'A Premium é à base de solvente e protege até 10 anos, aguentando até 5 lavagens. A Essencial é à base de água e dá a mesma proteção contra líquidos e nódoas durante 1 a 2 anos. Nas duas, os líquidos ficam à superfície e limpam-se com um pano.',
  },
  {
    question: 'Porque se limpa antes de impermeabilizar?',
    answer: 'O produto tem de ficar agarrado às fibras limpas. Impermeabilizar por cima de sujidade fecha essa sujidade no tecido; por isso a limpeza vem sempre primeiro, na mesma visita.',
  },
  {
    question: 'Quando posso voltar a usar depois da impermeabilização?',
    answer: 'A limpeza seca em 2 a 5 horas. Com impermeabilização, deixe 24 horas sem usar para o produto atuar.',
  },
  {
    question: 'Fazem impermeabilização em pele ou tecidos sintéticos?',
    answer: 'A impermeabilização é só para tecido. Em pele, pele sintética, napa ou tecidos já tratados de fábrica fazemos a limpeza e, na pele, o tratamento próprio de limpeza e hidratação.',
  },
];
const WATERPROOF_PACK_FAQS: Record<string, { question: string; answer: string }[]> = {
  'sofa-impermeabilizacao': [
    {
      question: 'Quanto custa limpar e impermeabilizar um sofá?',
      answer: `A limpeza com impermeabilização começa nos ${formatEuro(SOFA_CLEAN_AND_PROTECT_FROM)}, e a impermeabilização acrescentada à limpeza desde ${formatEuro(SOFA_PROTECT_WITH_CLEANING_FROM)}. O valor depende do número de lugares e da versão (Premium ou Essencial), e aparece no configurador desta página.`,
    },
    ...WATERPROOF_COMMON,
  ],
  'cadeiras-impermeabilizacao': [
    {
      question: 'Quanto custa limpar e impermeabilizar cadeiras?',
      answer: `A limpeza é desde ${formatEuro(CHAIR_CLEANING_FROM)} por cadeira. A impermeabilização custa ${formatEuro(CHAIR_WATERPROOF_SMALL_PREMIUM_UNIT)} (Premium) ou ${formatEuro(CHAIR_WATERPROOF_SMALL_ESSENCIAL_UNIT)} (Essencial) por cadeira até 4 cadeiras, e desce para ${formatEuro(CHAIR_WATERPROOF_PREMIUM_UNIT)} ou ${formatEuro(CHAIR_WATERPROOF_ESSENCIAL_UNIT)} a partir da 5.ª.`,
    },
    ...WATERPROOF_COMMON,
  ],
};

/** Os outros packs, para a página se ligar aos irmãos na mesma cidade. */
export function otherPacksInCity(packId: string, citySlug: string) {
  return packs.filter(pack => pack.id !== packId).map(pack => ({ label: pack.name, href: `/${pack.slug}-${citySlug}` }));
}
