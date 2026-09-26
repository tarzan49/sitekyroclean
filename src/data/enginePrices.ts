// Preços de partida tirados do motor de preços, para o texto das páginas.
//
// Existe porque o mesmo preço estava escrito à mão em sítios diferentes e cada
// cópia foi divergindo: o pack de limpeza + impermeabilização aparecia a 99€
// (o `bothPrice` de tabela) quando o quiz cobra 89€ (o `packPrice` de
// `calcPackPricing`, com o desconto do upsell); as páginas de marca mostravam
// "Desde 12.5€" em cadeiras, que é o preço da 7.ª à 9.ª cadeira e não o de
// partida; e a FAQ de preços das cadeiras punha "de 7 a 10 a 12,50€" quando o
// motor põe a 10.ª cadeira sob orçamento. Aqui não há números: tudo vem das
// mesmas funções e tabelas que o quiz usa para fazer a conta.
//
// Sem imports com alias `@/`: o `scripts/prerender.ts` lê este ficheiro em Node
// (ver a armadilha das constantes duplicadas no CLAUDE.md).
import { sofaPrices, mattressPrices, type PriceOption } from '../components/quiz/QuizTypes';
import { calcChairClean, calcPackPricing } from '../components/quiz/quizHelpers';
import { CHAIR_WATERPROOF_ESSENTIAL, CHAIR_WATERPROOF_PREMIUM } from '../constants/chairPricing';
import { SOFA_ANTI_ACAROS_PRICE, CHAIR_ANTI_ACAROS_UNIT_LABEL, mattressAntiAcarosPrice } from '../constants/antiAcarosPricing';

/** `49` → "49€"; `12.5` → "12,50€". Vírgula decimal, como em todo o site. */
export function formatEuro(value: number): string {
  return Number.isInteger(value) ? `${value}€` : `${value.toFixed(2).replace('.', ',')}€`;
}

function option(options: PriceOption[], id: string, table: string): PriceOption {
  const found = options.find(item => item.id === id);
  if (!found) throw new Error(`enginePrices: "${id}" não existe em ${table}`);
  return found;
}

function cheapest(options: PriceOption[], field: keyof PriceOption, table: string): number {
  const values = options.map(item => item[field]).filter((value): value is number => typeof value === 'number');
  if (!values.length) throw new Error(`enginePrices: ${table} não tem nenhum ${String(field)} numérico`);
  return Math.min(...values);
}

const required = (value: number | null, what: string): number => {
  if (value === null) throw new Error(`enginePrices: o motor deixou de ter preço para ${what}`);
  return value;
};

/** Limpeza do sofá mais barato da tabela (1 lugar). */
export const SOFA_CLEANING_FROM = cheapest(sofaPrices, 'cleaningPrice', 'sofaPrices');
/** Limpeza do colchão mais barato da tabela (solteiro). */
export const MATTRESS_CLEANING_FROM = cheapest(mattressPrices, 'cleaningPrice', 'mattressPrices');
/** Uma cadeira sozinha: é o preço de partida, não o de escalão. */
export const CHAIR_CLEANING_FROM = required(calcChairClean(1), 'uma cadeira');

/** Impermeabilização sozinha (sem limpeza), sofá mais barato. */
export const SOFA_WATERPROOF_ESSENCIAL_FROM = cheapest(sofaPrices, 'waterproofingPrice', 'sofaPrices');
export const SOFA_WATERPROOF_PREMIUM_FROM = cheapest(sofaPrices, 'waterproofingPremiumPrice', 'sofaPrices');
export const CHAIR_WATERPROOF_ESSENCIAL_UNIT = CHAIR_WATERPROOF_ESSENTIAL;
export const CHAIR_WATERPROOF_PREMIUM_UNIT = CHAIR_WATERPROOF_PREMIUM;

// Limpeza + impermeabilização Essencial no mesmo sofá de 1 lugar, tal como o
// quiz a cobra. `packPrice` já tem o desconto do upsell; `packDelta` é o que a
// impermeabilização acrescenta à limpeza nessa mesma visita.
const sofaPack = calcPackPricing(option(sofaPrices, '1-lugar', 'sofaPrices'), true, false);
export const SOFA_CLEAN_AND_PROTECT_FROM = required(sofaPack.packPrice, 'limpeza + impermeabilização');
export const SOFA_PROTECT_WITH_CLEANING_FROM = required(sofaPack.packDelta, 'a impermeabilização acrescentada à limpeza');

// Anti-ácaros, pela tabela única do quiz e do configurador
// (constants/antiAcarosPricing.ts). Colchão de solteiro: o acréscimo sobre a
// limpeza e o total dos dois na mesma visita.
const mattressSingle = option(mattressPrices, 'solteiro', 'mattressPrices');
export const MATTRESS_ANTI_MITE_WITH_CLEANING_FROM = required(mattressAntiAcarosPrice(mattressSingle), 'o anti-ácaros acrescentado à limpeza do colchão');
export const MATTRESS_CLEAN_AND_ANTI_MITE_FROM = MATTRESS_CLEANING_FROM + MATTRESS_ANTI_MITE_WITH_CLEANING_FROM;
/** Sofá: o acréscimo mais baixo (1 lugar) sobre a limpeza. */
export const SOFA_ANTI_MITE_WITH_CLEANING_FROM = Math.min(...Object.values(SOFA_ANTI_ACAROS_PRICE));
/** Cadeiras: sempre a taxa unitária, "5€/un.", nunca um total (decisão do dono). */
export const CHAIR_ANTI_MITE_UNIT_LABEL = CHAIR_ANTI_ACAROS_UNIT_LABEL;

/** "59€ (1 lugar), 79€ (2 lugares) e 99€ (3 lugares)": só os tamanhos com preço. */
export function sofaSizeList(field: 'cleaningPrice' | 'waterproofingPrice' | 'waterproofingPremiumPrice'): string {
  const parts = sofaPrices
    .filter(size => typeof size[field] === 'number')
    .map(size => `${formatEuro(size[field] as number)} (${size.label.toLowerCase()})`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}` : parts.join('');
}

export interface ChairTier { first: number; last: number; unit: number }

/**
 * Os escalões de limpeza de cadeiras, lidos do próprio `calcChairClean`: o
 * preço de cada cadeira é a diferença entre o total com ela e sem ela, e os
 * escalões são as sequências com o mesmo preço. Acaba quando o motor passa a
 * devolver `null` (sob orçamento).
 */
export function chairCleaningTiers(): { tiers: ChairTier[]; quoteFrom: number } {
  const tiers: ChairTier[] = [];
  let qty = 1;
  for (; qty < 100; qty++) {
    const total = calcChairClean(qty);
    if (total === null) break;
    const unit = Math.round((total - (calcChairClean(qty - 1) ?? 0)) * 100) / 100;
    const last = tiers[tiers.length - 1];
    if (last && last.unit === unit) last.last = qty;
    else tiers.push({ first: qty, last: qty, unit });
  }
  return { tiers, quoteFrom: qty };
}

const ordinal = (n: number) => `${n}.ª`;

/** "As primeiras 4 cadeiras custam 20€ cada, a 5.ª e a 6.ª 15€ cada, ..." */
export function chairTierSentence(): string {
  const { tiers, quoteFrom } = chairCleaningTiers();
  const parts = tiers.map((tier, index) => {
    const price = `${formatEuro(tier.unit)} cada`;
    if (index === 0) return `as primeiras ${tier.last} cadeiras custam ${price}`;
    if (tier.first === tier.last) return `a ${ordinal(tier.first)} ${price}`;
    if (tier.last === tier.first + 1) return `a ${ordinal(tier.first)} e a ${ordinal(tier.last)} ${price}`;
    return `da ${ordinal(tier.first)} à ${ordinal(tier.last)} ${price}`;
  });
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}` : parts[0];
  return `${list.charAt(0).toUpperCase()}${list.slice(1)}. A partir de ${quoteFrom} cadeiras, o preço é sob orçamento.`;
}

/** Linhas de tabela: "1ª a 4ª cadeira · 20€/un", ..., "10+ cadeiras · Sob orçamento". */
export function chairTierRows(): { item: string; price: string }[] {
  const { tiers, quoteFrom } = chairCleaningTiers();
  return [
    ...tiers.map(tier => ({
      item: tier.first === tier.last ? `${tier.first}ª cadeira` : `${tier.first}ª a ${tier.last}ª cadeira`,
      price: `${formatEuro(tier.unit)}/un`,
    })),
    { item: `${quoteFrom}+ cadeiras`, price: 'Sob orçamento' },
  ];
}

// ─── Rótulo do preço de partida ─────────────────────────────────────
// As cadeiras cobram-se por cadeira, com o preço a descer a partir da 5.ª.
// "Desde 20€" lia-se como o total do serviço e não fazia sentido a quem o lia
// (pedido do dono, 26/09/2026: "não digas desde em cadeiras"). Nas cadeiras o
// preço diz-se sempre por unidade, "20€ por cadeira"; os outros serviços
// mantêm o "Desde". Qualquer rótulo de preço de partida passa por aqui, para
// não voltar a haver um "Desde" de cadeiras escrito num canto.

/** `20` → "20€ por cadeira". Também aceita um rótulo já formatado ("18€"). */
export const perChairPrice = (unit: number | string): string =>
  `${typeof unit === 'number' ? formatEuro(unit) : unit} por cadeira`;
/** "20€ por cadeira": a limpeza de uma cadeira, tal como o motor a cobra. */
export const CHAIR_PRICE_LABEL = perChairPrice(CHAIR_CLEANING_FROM);
/** "20€ por Cadeira", para títulos em maiúsculas iniciais. */
export const CHAIR_PRICE_TITLE = CHAIR_PRICE_LABEL.replace(/cadeira$/, 'Cadeira');

/**
 * Onde o rótulo entra: `start` num rótulo solto ou a abrir a frase, `mid` a
 * meio da frase, `title` num título com maiúsculas iniciais.
 */
export type PriceLabelPosition = 'start' | 'mid' | 'title';

const PER_CHAIR = / por cadeira$/;

/** O serviço cujo preço se diz por cadeira. */
export const isPricedPerChair = (serviceSlug: string | undefined): boolean => serviceSlug === 'limpeza-cadeiras';

/**
 * O preço de partida de um serviço, pronto a escrever:
 *
 * | posição | outros serviços | cadeiras            |
 * |---------|-----------------|---------------------|
 * | start   | "Desde 49€"     | "20€ por cadeira"   |
 * | mid     | "desde 49€"     | "a 20€ por cadeira" |
 * | title   | "Desde 49€"     | "20€ por Cadeira"   |
 *
 * `price` é o rótulo numérico do catálogo ("49€"). Um preço que já venha por
 * cadeira ("18€ por cadeira", a impermeabilização das cadeiras) é tratado como
 * cadeira seja qual for o serviço. Os preços sob orçamento ficam a cargo de
 * quem chama, porque cada sítio os escreve à sua maneira.
 */
export function startingPriceLabel(serviceSlug: string | undefined, price: string, position: PriceLabelPosition = 'start'): string {
  const alreadyPerChair = PER_CHAIR.test(price);
  if (!isPricedPerChair(serviceSlug) && !alreadyPerChair) return `${position === 'mid' ? 'desde' : 'Desde'} ${price}`;
  const label = alreadyPerChair ? price : perChairPrice(price);
  if (position === 'title') return label.replace(/cadeira$/, 'Cadeira');
  return position === 'mid' ? `a ${label}` : label;
}

/** Preço de partida da limpeza por serviço, como o hero e o schema o mostram. */
export const CLEANING_FROM_BY_SERVICE: Record<string, number | null> = {
  'limpeza-sofas': SOFA_CLEANING_FROM,
  'limpeza-colchoes': MATTRESS_CLEANING_FROM,
  'limpeza-cadeiras': CHAIR_CLEANING_FROM,
  'limpeza-tapetes': null,
  'limpeza-alcatifas': null,
  impermeabilizacao: SOFA_WATERPROOF_ESSENCIAL_FROM,
};
