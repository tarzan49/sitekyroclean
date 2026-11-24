import { cities, services, cityPrep } from './serviceCatalog';
import { locationPrices } from '../constants/travel';
import { PACK_PERK_MATTRESS_OFF, PACK_PERK_CHAIRS_SET, PACK_PERK_LIMIT, PACK_PERK_RULE, PACK_PERK_MIN_ORDER, PACK_PERK_RUG_NOTE } from '../constants/packPerks';
import { RESPONSE_PROMISE, DRYING_PROMISE, SATISFACTION_PROMISE } from '../constants/commercialPolicy';
import type { PackKind, PackExtra } from '../lib/customPack';
import { botQuote } from '../lib/botQuote';
import { formatEuro, SOFA_CLEAN_AND_PROTECT_FROM, SOFA_PROTECT_WITH_CLEANING_FROM, CHAIR_CLEANING_FROM, CHAIR_WATERPROOF_SMALL_PREMIUM_UNIT, CHAIR_WATERPROOF_SMALL_ESSENCIAL_UNIT, CHAIR_WATERPROOF_PREMIUM_UNIT, CHAIR_WATERPROOF_ESSENCIAL_UNIT } from './enginePrices';
// These are editable starting combinations, not separate price lists.
// Live amounts come from the same article tables used by the quote form.
// `name` é o título da página e começa sempre por "Limpeza": é o que as
// pessoas pesquisam ("limpeza de sofá e colchão"), "pack" quase não tem
// procura (dono, 2026-09-24). A FAQ usa "Quanto custa a ${name}", por isso um
// nome novo tem de manter esse arranque. Os slugs `pack-*` não mudam.
export interface PackCombo { id: string; name: string; slug: string; tagline: string; description: string; service1Slug: string; service2Slug: string; }
export const packs: PackCombo[] = [
  { id: 'sofa-colchao', name: 'Limpeza de Sofá e Colchão', slug: 'pack-sofa-e-colchao', tagline: 'Sala e quarto na mesma visita', description: 'Escolha os lugares do sofá, o tamanho do colchão e o tratamento de cada um. O total já vem com a deslocação.', service1Slug: 'limpeza-sofas', service2Slug: 'limpeza-colchoes' },
  { id: 'sofa-impermeabilizacao', name: 'Limpeza e Impermeabilização de Sofá', slug: 'pack-sofa-impermeabilizacao', tagline: 'O seu sofá já não é novo, mas gostava que voltasse a parecer?', description: 'Tiramos a sujidade das fibras com uma limpeza profunda e protegemo-lo a seguir: vinho, café ou sumo ficam à superfície e saem com um pano. Proteção Premium até 10 anos, ou Essencial de 1 a 2 anos, na mesma visita.', service1Slug: 'limpeza-sofas', service2Slug: 'impermeabilizacao' },
  { id: 'cadeiras-impermeabilizacao', name: 'Limpeza e Impermeabilização de Cadeiras', slug: 'pack-cadeiras-impermeabilizacao', tagline: 'As cadeiras da mesa são as primeiras a sofrer com cada refeição?', description: 'Limpamos o tecido a fundo e protegemo-lo a seguir: molho, vinho ou sumo ficam à superfície e saem com um pano. Proteção Premium até 10 anos, ou Essencial de 1 a 2 anos, e o preço por cadeira desce com a quantidade.', service1Slug: 'limpeza-cadeiras', service2Slug: 'impermeabilizacao' },
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
  'quarto-completo': `Colchão e tapete numa só visita, cada um ao preço de tabela e com uma só deslocação.`,
};

/** Preço de partida do pack: o mais baixo dos serviços que o compõem. */
export function packPriceFrom(pack: PackCombo, cityName = 'Lisboa'): string {
  // Packs de limpeza + impermeabilização: o total mais baixo que o bot dá (dono, 24 Nov: preços iguais aos do bot),
  // limpeza + Essencial de 1 lugar ou de 1 cadeira, com a deslocação da cidade.
  if (pack.id === 'sofa-impermeabilizacao' || pack.id === 'cadeiras-impermeabilizacao') {
    const item = pack.id === 'sofa-impermeabilizacao' ? { kind: 'sofa', size: '1-lugar', treatment: 'clean+essencial' } : { kind: 'chairs', qty: 1, treatment: 'clean+essencial' };
    const r = botQuote({ city: cityName, items: [item] }) as { ok: boolean; quote?: boolean; total?: number | null; travel?: number | null };
    // Cadeiras: a deslocação é à parte, por isso o "desde" é 1 cadeira + Essencial sem ela (dono, 24 Nov: 25 + 23 = 48€).
    const travel = pack.id === 'cadeiras-impermeabilizacao' ? (r.travel ?? 0) : 0;
    if (r.ok && !r.quote && typeof r.total === 'number') return formatEuro(r.total - travel);
  }
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
  // Packs de limpeza + impermeabilização: só as 5 perguntas próprias (dono, 24 Nov: as genéricas ninguém lê).
  if (WATERPROOF_PACK_FAQS[pack.id]) return [waterproofPriceFaq(pack.id, cityName), ...WATERPROOF_COMMON];
  return [
    {
      question: `Quanto custa a ${pack.name.toLowerCase()} ${cityPrep(cityName)} ${cityName}?`,
      answer: `Depende dos artigos, dos tamanhos e do tratamento que escolher. A escolha de preço desta página mostra o total enquanto escolhe, e ${travel}, cobrada uma única vez para a visita toda. O valor é confirmado antes da marcação.`,
    },
    {
      question: 'O que muda por ser um pack e não pedidos separados?',
      answer: `${PACK_PERK_RULE} A deslocação também é uma só. ${PACK_PERK_LIMIT}`,
    },
    {
      question: 'Posso acrescentar ou tirar artigos depois de pedir?',
      answer: `Pode. O pack é um ponto de partida editável: acrescente tapetes, alcatifas ou cadeiras na mensagem de WhatsApp. Qualquer alteração ao pedido é orçamentada antes de avançarmos. ${RESPONSE_PROMISE.toLowerCase()}.`,
    },
    {
      question: 'Quanto tempo demora e quando posso voltar a usar tudo?',
      answer: `Uma visita de pack demora normalmente entre uma e três horas, conforme o número de artigos. ${DRYING_PROMISE} ${SATISFACTION_PROMISE}`,
    },
    ...(WATERPROOF_PACK_FAQS[pack.id] ?? []),
  ];
}

/** Pergunta do preço com os totais do bot (botQuote), com a deslocação da cidade (dono, 24 Nov). */
function waterproofPriceFaq(packId: string, cityName: string) {
  const t = (item: Record<string, unknown>) => {
    const r = botQuote({ city: cityName, items: [item] }) as { ok: boolean; quote?: boolean; total?: number | null };
    return r.ok && !r.quote && typeof r.total === 'number' ? formatEuro(r.total) : 'sob orçamento';
  };
  const where = `${cityPrep(cityName)} ${cityName}`;
  if (packId === 'sofa-impermeabilizacao') {
    const s3 = (tr: string) => t({ kind: 'sofa', size: '3-lugares', treatment: tr });
    return {
      question: 'Quanto custa limpar e impermeabilizar um sofá?',
      answer: `${where}, com a deslocação incluída: um sofá de 3 lugares fica em ${s3('clean+premium')} com a Premium ou ${s3('clean+essencial')} com a Essencial (só a limpeza, ${s3('clean')}). A partir de ${t({ kind: 'sofa', size: '1-lugar', treatment: 'clean+essencial' })} num sofá de 1 lugar. Escolha os lugares no início da página para ver o seu valor.`,
    };
  }
  const c = (q: number, tr: string) => t({ kind: 'chairs', qty: q, treatment: tr });
  return {
    question: 'Quanto custa limpar e impermeabilizar cadeiras?',
    answer: `${where}, com a deslocação incluída: 6 cadeiras ficam em ${c(6, 'clean+premium')} com a Premium ou ${c(6, 'clean+essencial')} com a Essencial (só a limpeza, ${c(6, 'clean')}). Uma cadeira com a Essencial, desde ${packPriceFrom(packs.find(p => p.id === 'cadeiras-impermeabilizacao')!, cityName)} mais a deslocação. Escolha o número de cadeiras no início da página para ver o seu valor.`,
  };
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
      answer: `A limpeza com impermeabilização começa nos ${formatEuro(SOFA_CLEAN_AND_PROTECT_FROM)}, e a impermeabilização acrescentada à limpeza desde ${formatEuro(SOFA_PROTECT_WITH_CLEANING_FROM)}. O valor depende do número de lugares e da versão (Premium ou Essencial), e aparece na escolha de preço desta página.`,
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

/** Junta a frase de abertura e a descrição sem pôr ponto depois de uma pergunta. */
export function packIntro(pack: PackCombo, text = pack.description): string {
  return /[?!.]$/.test(pack.tagline) ? `${pack.tagline} ${text}` : `${pack.tagline}. ${text}`;
}

/** Os outros packs, para a página se ligar aos irmãos na mesma cidade. */
export function otherPacksInCity(packId: string, citySlug: string) {
  return packs.filter(pack => pack.id !== packId).map(pack => ({ label: pack.name, href: `/${pack.slug}-${citySlug}` }));
}
