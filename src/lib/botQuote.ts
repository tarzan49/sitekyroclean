/**
 * The WhatsApp bot's quote. The bot never does its own arithmetic: it sends
 * the items and the locality to the `bot-api` Edge Function, which runs this
 * file, which prices through the same engine as the pack configurator
 * (`calculateCustomPack`) and so through the same numbers as the quiz. A price
 * changed on the site changes in the bot's replies on the next deploy.
 *
 * The input comes from outside (the bot's server), so every field is checked
 * here, not trusted. The Edge Function cannot import `src/` directly (Deno
 * wants file extensions and only bundles `supabase/functions/`), so this file
 * is bundled into `supabase/functions/_shared/botEngine.generated.js` by
 * `npm run build:bot-engine`; `botEngineBundle.test.ts` fails when the bundle
 * is out of date.
 */
import { calculateCustomPack, type CustomPackItem, type PackExtra, type PackKind } from './customPack';
import { sofaPrices, mattressPrices } from '../components/quiz/QuizTypes';
import { locationPrices, EXTENDED_TRIP_CITIES, calculateTravelFee, isSmallOrderFarPlace, SMALL_ORDER_FAR_MIN, SMALL_ORDER_FAR_SURCHARGE, SMALL_ORDER_FAR_RULE } from '../constants/travel';
import { isBlackFriday, blackFridayPricesActive, BLACK_FRIDAY_PRICES } from '../constants/campaigns';
import { rugPickupFee, rugPickupOffered, NO_RUG_PICKUP_RULE, RUG_PICKUP_ASKED_RULE, RUG_PICKUP_FEE_RULE, RUG_PICKUP_MIN_AREA_M2 } from '../constants/commercialPolicy';
import { rugSide, RUG_SIDE_MAX_METERS } from '../constants/rugMeasure';
import { rugComboEstimate, rugEstimate } from './botRugEstimate';
import { closeNowOffer } from './botCloseNow';
import { freguesiaToMunicipio, parishPartToMunicipio } from './parishMunicipality';
import { type AskedDiscount } from './botAskedDiscount';
import { chairPackWas, CHAIR_WATERPROOF_SMALL_MAX, CHAIR_WATERPROOF_SMALL_PREMIUM, CHAIR_WATERPROOF_SMALL_ESSENTIAL, CHAIR_WATERPROOF_PREMIUM, CHAIR_WATERPROOF_ESSENTIAL } from '../constants/chairPricing';

export const BOT_TREATMENTS = ['clean', 'clean+essencial', 'clean+premium', 'clean+anti-acaros', 'essencial', 'premium'] as const;
export type BotTreatment = typeof BOT_TREATMENTS[number];
const KINDS: readonly PackKind[] = ['sofa', 'mattress', 'chairs', 'rug', 'carpet'];
const MAX_ITEMS = 20;

const TREATMENT_TO_ITEM: Record<BotTreatment, { extra: PackExtra; primary: 'cleaning' | 'waterproofing' }> = {
  clean: { extra: 'none', primary: 'cleaning' },
  'clean+essencial': { extra: 'essencial', primary: 'cleaning' },
  'clean+premium': { extra: 'premium', primary: 'cleaning' },
  'clean+anti-acaros': { extra: 'anti-acaros', primary: 'cleaning' },
  essencial: { extra: 'essencial', primary: 'waterproofing' },
  premium: { extra: 'premium', primary: 'waterproofing' },
};

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
const CITY_BY_FOLDED = new Map(Object.keys(locationPrices).map(name => [fold(name), name]));

/**
 * The served locality as the site writes it ("Vila Nova de Gaia"), or null.
 * A freguesia resolves to its municipality, as in the quiz's location step:
 * on 16 Oct 2026 a client wrote "Ericeira", the quote came back without a
 * locality and "sob orçamento", and the bot held a 4-chair quote for the owner
 * instead of pricing it (Mafra, 10€). "Ericeira, Mafra" works part by part.
 */
export function resolveBotCity(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  for (const part of [input, ...input.split(/[,()/]/)]) {
    const key = fold(part);
    if (!key) continue;
    const city = CITY_BY_FOLDED.get(key) ?? freguesiaToMunicipio.get(key) ?? parishPartToMunicipio.get(key);
    if (city) return city;
  }
  return null;
}

/** Every served locality with its travel fee, for the bot to match names. */
export function listBotCities() {
  return Object.entries(locationPrices).map(([name, travelFee]) => ({ name, travelFee, extendedTrip: EXTENDED_TRIP_CITIES.has(name) }));
}

/** Cleaning of a 6 or 7 seat sofa, judged on the photo (owner, 9 Nov 2026), travel apart. */
export const SEAT6_LOOK_PRICES = { compacto: 129, medio: 139, grande: 149 } as const;
export const SEAT6_LOOK_GUIDE = 'compacto (129€: assentos normais, braços finos, peça simples), medio (139€: assentos fundos ou almofadas soltas), grande (149€: modular com módulos soltos, peça extra ao centro ou chaise, assentos muito fundos, ou ocupa a sala)';

export const BOT_SIZES = {
  sofa: sofaPrices.map(p => p.id),
  mattress: mattressPrices.map(p => p.id),
};

type Fail = { ok: false; error: string };
const fail = (error: string): Fail => ({ ok: false, error });

function toItem(raw: unknown, index: number): CustomPackItem | Fail {
  if (!raw || typeof raw !== 'object') return fail(`items[${index}] tem de ser um objeto`);
  const r = raw as Record<string, unknown>;
  const kind = r.kind as PackKind;
  if (!KINDS.includes(kind)) return fail(`items[${index}].kind tem de ser um de: ${KINDS.join(', ')}`);
  const treatment = (r.treatment ?? 'clean') as BotTreatment;
  if (!BOT_TREATMENTS.includes(treatment)) return fail(`items[${index}].treatment tem de ser um de: ${BOT_TREATMENTS.join(', ')}`);
  const qty = r.qty ?? 1;
  if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > 100) return fail(`items[${index}].qty tem de ser um inteiro entre 1 e 100`);
  const { extra, primary } = TREATMENT_TO_ITEM[treatment];
  if (kind === 'mattress' && (extra === 'premium' || extra === 'essencial')) return fail(`items[${index}]: colchões não se impermeabilizam`);
  if (kind === 'rug' && (treatment === 'premium' || treatment === 'essencial')) return fail(`items[${index}]: a impermeabilização de tapete precisa de width e length em metros (ou centímetros, a partir de ${RUG_SIDE_MAX_METERS + 1})`);
  if ((kind === 'rug' || kind === 'carpet') && treatment !== 'clean') return fail(`items[${index}]: tapetes e alcatifas só têm limpeza`);
  if (r.odor !== undefined && typeof r.odor !== 'boolean') return fail(`items[${index}].odor tem de ser true ou false`);
  if (r.odor === true && !(kind === 'rug' || kind === 'carpet')) return fail(`items[${index}].odor: o anti-odor só se junta à limpeza de um tapete ou alcatifa`);
  // `leather`: a leather sofa (owner, 16 Nov 2026): never waterproofed; the leather treatment is +40€ per sofa, +60€ on 5 or 6 seats (owner, 20 Nov).
  if (r.leather !== undefined && (typeof r.leather !== 'boolean' || (r.leather && kind !== 'sofa'))) return fail(`items[${index}].leather só serve para sofás (true ou false)`);
  if (r.leather === true && treatment !== 'clean') return fail(`items[${index}]: um sofá de pele nunca leva impermeabilização nem anti-ácaros; vai com treatment clean e o tratamento da pele (+${LEATHER_TREATMENT}€, +${LEATHER_TREATMENT_LARGE}€ em 5 ou 6 lugares) junta-se sozinho`);
  // `seatOnly`: chairs whose only upholstery is the seat top (owner, 14 Nov 2026): waterproofing 18€/12€ each.
  if (r.seatOnly !== undefined && (typeof r.seatOnly !== 'boolean' || (r.seatOnly && kind !== 'chairs'))) return fail(`items[${index}].seatOnly só serve para cadeiras (true ou false)`);
  let size = '';
  let unitPrice: number | undefined;
  if (kind === 'sofa' && r.size === 'u') {
    // A U sofa is counted by its seats in the photo (owner, 16 Oct 2026): the cleaning costs as 4 lugares
    // up to 4 seats and as 5+ at 5. Waterproofing and anti-mites on a U stay with him (sob orçamento).
    const seats = r.seats;
    if (typeof seats !== 'number' || !Number.isInteger(seats) || seats < 2 || seats > 15) return fail(`items[${index}].seats (lugares contados na fotografia, 2 a 15) é obrigatório num sofá em U`);
    size = treatment !== 'clean' ? '4+-lugares' : seats <= 4 ? '4-lugares' : '5-lugares';
  } else if (kind === 'sofa' || kind === 'mattress') {
    size = typeof r.size === 'string' ? r.size : '';
    if (!BOT_SIZES[kind].includes(size)) return fail(`items[${index}].size tem de ser um de: ${BOT_SIZES[kind].join(', ')}${kind === 'sofa' ? ', ou u (sofá em U, com seats)' : ''}`);
  }
  // 6 or more seats (owner, 9 Nov 2026, Helena: a modular 3+3 with a centre piece went out at 119€ + travel;
  // "um sofá de 6 lugares tem que ser entre 129 e 149, tens que saber perceber"): the cleaning is judged on
  // the photo, `look` compacto 129€ / medio 139€ / grande 149€ (travel apart); with waterproofing +180€ / +120€
  // (customPack SEAT6_WATERPROOFING_EXTRA). 8+ seats go to the owner.
  const seats = typeof r.seats === 'number' && Number.isInteger(r.seats) ? r.seats : 0;
  if (kind === 'sofa' && size === '5-lugares' && ['clean', 'clean+premium', 'clean+essencial'].includes(treatment) && seats >= 6) {
    if (seats >= 8) size = '4+-lugares';
    else {
      const look = r.look as keyof typeof SEAT6_LOOK_PRICES;
      if (!(look in SEAT6_LOOK_PRICES)) return fail(`items[${index}].look é obrigatório num sofá de 6 ou 7 lugares: ${SEAT6_LOOK_GUIDE}`);
      unitPrice = SEAT6_LOOK_PRICES[look];
    }
  }
  // Same reading as the quiz (rugSide): "230" is 2,30 m, never a 230 m rug.
  const dim = (v: unknown) => { const side = typeof v === 'number' ? rugSide(v) : null; return side ? String(side.meters) : ''; };
  const width = kind === 'rug' || kind === 'carpet' ? dim(r.width) : '';
  const length = kind === 'rug' || kind === 'carpet' ? dim(r.length) : '';
  if ((kind === 'rug' || kind === 'carpet') && (!width || !length)) return fail(`items[${index}]: tapetes e alcatifas precisam de width e length em metros (ou centímetros, a partir de ${RUG_SIDE_MAX_METERS + 1})`);
  return { id: String(index), kind, size, qty, extra, primary, width, length, ...(unitPrice ? { unitPrice } : {}), ...(r.seatOnly === true ? { seatOnly: true } : {}) };
}

/**
 * Rug pickup and delivery (owner, 5 Oct 2026), from the same function the quiz
 * uses: summed area of the order's rugs, fee null below the minimum (washed at
 * home only). Carpets are fixed to the floor and never picked up. Returned so
 * the bot quotes it from the tool and its guard can check it like any price.
 */
/**
 * Travel on an order with waterproofing (owner, 15 Oct 2026, after the bot
 * quoted Premium 139€ / Essencial 114€ in Setúbal): the client always sees the
 * two versions side by side, so both carry the SAME travel, and never more than
 * 10€. The bot asks for each version in a separate call, and the site waiver
 * (calculateTravelFee) used to read each subtotal on its own: the Premium passed
 * the threshold and went out without travel, the Essencial paid 15€ more.
 * Now every call reads the waiver from the Premium version of the same order,
 * so the Premium call and the Essencial call return the same travel.
 */
export const WATERPROOFING_TRAVEL_MAX = 10;
const isWaterproofing = (i: CustomPackItem) => i.extra === 'essencial' || i.extra === 'premium';
const withTier = (items: CustomPackItem[], tier: 'essencial' | 'premium') =>
  items.map(i => (isWaterproofing(i) ? { ...i, extra: tier } : i));
const cents = (n: number) => Math.round(n * 100) / 100;

function waterproofingTiers(items: CustomPackItem[], city: string) {
  const premium = calculateCustomPack(withTier(items, 'premium'), city);
  const essencial = calculateCustomPack(withTier(items, 'essencial'), city);
  if (premium.travel === null) return null;
  // Waterproofing alone (no cleaning in the order) always carries 10€ on both versions, in every town,
  // up to a 200€ Premium (owner, 30 Oct 2026, Rio Meão: the bot sent "Premium 149€ com deslocação
  // incluída"; "tens que fazer 159€ e a outra 99€"). Farther towns carry 10€ on any order (owner,
  // 15 Oct 2026, Setúbal 149/109); otherwise 10€ towns read the waiver from the Premium.
  const baseFee = locationPrices[city] ?? 0;
  const aloneSmall = items.every(i => i.primary === 'waterproofing' || !isWaterproofing(i)) && !items.some(i => i.primary === 'cleaning') && premium.subtotal <= 200;
  // Owner, 18 Nov 2026 (Altieres, sofá 3L + cadeiras with "Deslocação: 10€"): waterproofing of several pieces
  // (two or more lines in the order) never carries travel in 10€ towns; one piece alone keeps the rule above.
  // A chairs waterproofing row that only covers chairs cleaned in another row (the quiz sends it like that)
  // is the same piece, not a second one: it must price like one clean+waterproofing row (owner, 24 Nov 2026).
  const cleanedChairs = items.some(i => i.kind === 'chairs' && i.primary !== 'waterproofing');
  const pieces = items.filter(i => !(cleanedChairs && i.kind === 'chairs' && i.primary === 'waterproofing')).length;
  const severalPieces = pieces > 1 && items.some(isWaterproofing);
  // Hugo rule (19 Nov, chairs with another piece at the 5+ rate) retired 24 Nov 2026: chairs priced by position.
  const chairBulk = (_tier: 'premium' | 'essencial') => 0;
  const travel = isBlackFriday() || (severalPieces && baseFee <= WATERPROOFING_TRAVEL_MAX) ? 0 : baseFee > WATERPROOFING_TRAVEL_MAX || aloneSmall ? WATERPROOFING_TRAVEL_MAX : Math.min(premium.travel, WATERPROOFING_TRAVEL_MAX);
  return {
    travel,
    premium: premium.quote ? null : cents(premium.subtotal - chairBulk('premium') + travel),
    essencial: essencial.quote ? null : cents(essencial.subtotal - chairBulk('essencial') + travel),
  };
}

function rugPickupFor(items: CustomPackItem[], city: string | null) {
  const rugs = items.filter(i => i.kind === 'rug');
  if (!rugs.length) return null;
  const areaM2 = Math.round(rugs.reduce((sum, i) => sum + i.qty * Number(i.width) * Number(i.length), 0) * 100) / 100;
  return { areaM2, minAreaM2: RUG_PICKUP_MIN_AREA_M2, fee: rugPickupFee(areaM2, city), rule: `${rugPickupOffered(city) ? RUG_PICKUP_FEE_RULE : NO_RUG_PICKUP_RULE} ${RUG_PICKUP_ASKED_RULE}` };
}

/**
 * `handToOwner` is true whenever the bot must not close the price itself: an
 * item "sob orçamento" (carpets, 4+ seats, rugs the bot cannot price
 * by rule: see botRugEstimate), a locality that
 * is not served, or one where availability is confirmed case by case.
 */
/**
 * Puffs (owner, 21 Oct 2026: "puff 25€", "mete a 20 o puff como condição especial"):
 * 25€ each on its own, 20€ each when it goes in the same visit as other items.
 * Bot only: the site keeps puffs sob orçamento.
 */
export const PUFF_PRICE = 25;
export const PUFF_SAME_VISIT_PRICE = 20;
/**
 * Armchairs, "cadeirão" (owner, 1 Nov 2026, Ana: the bot quoted 49€, the 1-seater sofa price; "o cadeirão ficam 29€").
 * His own quotes: 39€ on its own (15 Oct), 29€ when it goes in the same visit as other items. Bot only.
 */
export const ARMCHAIR_PRICE = 39;
export const ARMCHAIR_SAME_VISIT_PRICE = 29;
/** 4 or more armchairs: 25€ each, alone or with other items (owner, 18 Nov 2026: 29€ up to 3, then a special condition). */
export const ARMCHAIR_BULK_MIN = 4;
export const ARMCHAIR_BULK_PRICE = 25;
/** Large armchairs (high back, wide arms, look like a 1-seater sofa): 35€ each, travel apart; 4 or more 30€ each (owner, 18 Nov 2026). */
export const ARMCHAIR_LARGE_PRICE = 35;
export const ARMCHAIR_LARGE_BULK_PRICE = 30;

/**
 * Upholstered headboards, "cabeceira" (owner, 4 Nov 2026, +351 936 376 201: the bot stayed silent because the
 * headboard was sob orçamento; "solteiro 29 casal 39 queen e king 45"). By bed size, travel as for the others.
 * The "desconto se tiver muitas peças" he mentioned has no number yet: none is coded. Bot only.
 */
export const HEADBOARD_PRICES = { solteiro: 29, casal: 39, queen: 45, king: 45 } as const;
export type HeadboardSize = keyof typeof HEADBOARD_PRICES;

function extraQuote(qty: number, tablePrice: number, sameVisitPrice: number, city: string | null, withOthers: boolean, othersTotal: number | null) {
  const unitPrice = withOthers ? sameVisitPrice : tablePrice;
  const amount = qty * unitPrice;
  const travel = withOthers ? 0 : city !== null ? (locationPrices[city] === undefined ? null : isBlackFriday() ? 0 : locationPrices[city]) : null;
  return {
    qty,
    tablePrice,
    unitPrice,
    specialCondition: withOthers,
    amount,
    travel,
    // Order total with these items; null when the rest of the order has no price.
    total: withOthers ? (othersTotal === null ? null : cents(othersTotal + amount)) : travel === null ? null : amount + travel,
  };
}
const puffQuote = (qty: number, city: string | null, withOthers: boolean, othersTotal: number | null) =>
  extraQuote(qty, PUFF_PRICE, PUFF_SAME_VISIT_PRICE, city, withOthers, othersTotal);
const armchairQuote = (qty: number, city: string | null, withOthers: boolean, othersTotal: number | null, large = false) => {
  if (!large) return normalArmchairQuote(qty, city, withOthers, othersTotal);
  const unit = qty >= ARMCHAIR_BULK_MIN ? ARMCHAIR_LARGE_BULK_PRICE : ARMCHAIR_LARGE_PRICE;
  const q = extraQuote(qty, unit, unit, city, false, null);
  return { ...q, tablePrice: ARMCHAIR_LARGE_PRICE, specialCondition: unit !== ARMCHAIR_LARGE_PRICE, large: true,
    ...(withOthers ? { travel: 0, total: othersTotal === null ? null : cents(othersTotal + q.amount) } : {}) };
};
const normalArmchairQuote = (qty: number, city: string | null, withOthers: boolean, othersTotal: number | null) =>
  qty >= ARMCHAIR_BULK_MIN
    ? { ...extraQuote(qty, ARMCHAIR_BULK_PRICE, ARMCHAIR_BULK_PRICE, city, withOthers, othersTotal), tablePrice: ARMCHAIR_SAME_VISIT_PRICE, specialCondition: true }
    : extraQuote(qty, ARMCHAIR_PRICE, ARMCHAIR_SAME_VISIT_PRICE, city, withOthers, othersTotal);
const headboardQuote = (sizes: HeadboardSize[], city: string | null, withOthers: boolean, othersTotal: number | null) => {
  const amount = sizes.reduce((sum, size) => sum + HEADBOARD_PRICES[size], 0);
  return { ...extraQuote(1, amount, amount, city, withOthers, othersTotal), qty: sizes.length, sizes, specialCondition: false };
};

/**
 * Waterproofing on a U sofa, bot only.
 * - With cleaning (owner, 22 Oct 2026: "a imper fica mais 150 premium e mais 100 essencial"): the U's
 *   cleaning price plus 150€ (Premium) or 90€ (Essencial; 100€ until 25 Oct, when every Essencial
 *   went down 10€) per U, travel as in the cleaning.
 * - Alone (owner, 25 Oct 2026: "em U fica 179eur e essencial 129 eur"): 179€ / 129€ per U, travel
 *   included, whatever the seats.
 * Other waterproofed items in the same order still go to the owner.
 */
export const U_WATERPROOFING_EXTRA = { premium: 150, essencial: 90 } as const;
export const U_WATERPROOFING_ALONE = { premium: 179, essencial: 129 } as const;
/** 5-seat sofa (dono, 22 Nov 2026, Rosângela): alone 219/159€ travel included; with the cleaning (119€) +190/+130€ = 309/249€. */
export const SEAT5_WATERPROOFING_ALONE = { premium: 219, essencial: 159 } as const;
export const SEAT5_WATERPROOFING_EXTRA = { premium: 190, essencial: 130 } as const;
/** 6 or 7 seat sofa waterproofed alone (dono, 22 Nov 2026, Rosângela): 249/189€ travel included. */
export const SEAT6_WATERPROOFING_ALONE = { premium: 249, essencial: 189 } as const;

function uWaterproofingQuote(input: Record<string, unknown>) {
  const raw = input.items;
  if (!Array.isArray(raw)) return null;
  const treatmentOf = (r: unknown) => String((r as Record<string, unknown>).treatment ?? '');
  const isRealU = (r: unknown) => !!r && typeof r === 'object' && (r as Record<string, unknown>).kind === 'sofa' && (r as Record<string, unknown>).size === 'u';
  // A corner sofa waterproofed alone: 199€ / 139€ travel included (owner, 22 Nov 2026: "fica em 199 e 139 sofa de canto"; was 179/129 as a U).
  const CANTO_WATERPROOFING_ALONE = { premium: 199, essencial: 139 } as const;
  const isCantoAlone = (r: unknown) => !!r && typeof r === 'object' && (r as Record<string, unknown>).kind === 'sofa' && (r as Record<string, unknown>).size === 'canto' && ['premium', 'essencial'].includes(treatmentOf(r));
  const cantoAsU = !raw.some(isRealU);
  // A 5, 6 or 7 seat sofa waterproofed alone: same travel-included path, own price (dono, 22 Nov 2026, Rosângela).
  const seatsOf = (r: unknown) => { const v = (r as Record<string, unknown>).seats; return typeof v === 'number' && Number.isInteger(v) ? v : 5; };
  const isFiveAlone = (r: unknown) => !!r && typeof r === 'object' && (r as Record<string, unknown>).kind === 'sofa' && (r as Record<string, unknown>).size === '5-lugares' && ['premium', 'essencial'].includes(treatmentOf(r)) && seatsOf(r) <= 7;
  const aloneFixed = (r: unknown) => (isCantoAlone(r) ? CANTO_WATERPROOFING_ALONE : isFiveAlone(r) ? (seatsOf(r) >= 6 ? SEAT6_WATERPROOFING_ALONE : SEAT5_WATERPROOFING_ALONE) : U_WATERPROOFING_ALONE);
  const isU = (r: unknown) => isRealU(r) || (cantoAsU && isCantoAlone(r)) || isFiveAlone(r);
  const isUw = (r: unknown) => isU(r) && ['clean+premium', 'clean+essencial', 'premium', 'essencial'].includes(treatmentOf(r));
  const uItems = raw.filter(isUw) as Record<string, unknown>[];
  if (!uItems.length) return null;
  // Other waterproofed items in the same order: keep the old path (owner prices it).
  if (raw.some(r => !isUw(r) && r && typeof r === 'object' && /premium|essencial/.test(treatmentOf(r)))) return null;
  const alone = uItems.every(r => !treatmentOf(r).startsWith('clean'));
  if (!alone && uItems.some(r => !treatmentOf(r).startsWith('clean'))) return null;
  const n = uItems.reduce((sum, r) => sum + (typeof r.qty === 'number' ? r.qty : 1), 0);
  const tier = /premium/.test(treatmentOf(uItems[0])) ? 'premium' : 'essencial';
  const others = raw.filter(r => !isUw(r));
  if (alone) {
    // Travel included: price the rest of the order (if any) as usual, then add the U at its fixed price.
    const city = resolveBotCity(input.city);
    if (city === null || EXTENDED_TRIP_CITIES.has(city)) return null;
    const base = others.length ? botQuoteCore({ ...input, items: others }) as ReturnType<typeof botQuoteInner> : null;
    if (base && (!base.ok || base.quote || base.total === null)) return null;
    const rest = base && base.ok && base.total !== null ? base.total : 0;
    const sumOf = (t: 'premium' | 'essencial') => uItems.reduce((sum, r) => sum + aloneFixed(r)[t] * (typeof r.qty === 'number' ? r.qty : 1), 0);
    const premium = cents(rest + sumOf('premium'));
    const essencial = cents(rest + sumOf('essencial'));
    const total = tier === 'premium' ? premium : essencial;
    const amount = sumOf(tier);
    const aloneLabel = uItems.every(isCantoAlone) ? 'sofá de canto' : uItems.every(isFiveAlone) ? (uItems.every(r => seatsOf(r) >= 6) ? 'sofá de 6 ou 7 lugares' : 'sofá de 5 lugares') : 'sofá em U';
    const line = { label: `Impermeabilização ${tier === 'premium' ? 'Premium' : 'Essencial'} ${aloneLabel}`, amount, tablePrice: amount, perkApplied: false, perkNote: undefined as string | undefined, quote: false };
    return {
      ok: true as const, city, cityKnown: true, extendedTrip: false, sharedTrip: false,
      lines: [...(base && base.ok ? base.lines : []), line],
      subtotal: cents((base && base.ok ? base.subtotal : 0) + amount), savings: 0, perkEligible: false,
      travel: base && base.ok ? base.travel : 0, total, waterproofingTiers: { travel: base && base.ok ? base.travel : 0, premium, essencial },
      quote: false, handToOwner: false, rugPickup: null, rugEstimate: null, rugCombo: null,
      puff: base && base.ok ? base.puff : null,
      armchair: base && base.ok ? base.armchair : null,
      headboard: base && base.ok ? base.headboard : null,
      rugOdor: base && base.ok ? base.rugOdor : null,
      closeNow: closeNowOffer({ total, waterproofing: true, handToOwner: false, rug: null }),
    };
  }
  const base = botQuoteCore({ ...input, items: raw.map(r => (isUw(r) ? { ...(r as object), treatment: 'clean' } : r)) }) as ReturnType<typeof botQuoteInner>;
  if (!base.ok || base.quote || base.total === null) return null;
  const premium = cents(base.total + U_WATERPROOFING_EXTRA.premium * n);
  const essencial = cents(base.total + U_WATERPROOFING_EXTRA.essencial * n);
  const total = tier === 'premium' ? premium : essencial;
  return {
    ...base,
    lines: [...base.lines, { label: `Impermeabilização ${tier === 'premium' ? 'Premium' : 'Essencial'} sofá em U`, amount: U_WATERPROOFING_EXTRA[tier] * n, tablePrice: U_WATERPROOFING_EXTRA[tier] * n, perkApplied: false, perkNote: undefined as string | undefined, quote: false }],
    subtotal: cents(base.subtotal + U_WATERPROOFING_EXTRA[tier] * n),
    total,
    waterproofingTiers: { travel: base.travel, premium, essencial },
    closeNow: closeNowOffer({ total, waterproofing: true, handToOwner: base.handToOwner, rug: null }),
  };
}

/**
 * Rug waterproofing, bot only (owner, 30 Oct 2026: Premium 15€/m², Essencial 10€/m², rounded down;
 * 200x300 = 90€ Premium).
 * - In the same visit as other items (passed in the same call): no extra travel.
 * - On its own (owner, 12 Nov 2026: "o bot dá o preço, 15€ o metro quadrado"): the town's travel
 *   (locationPrices), waived as in the rest of the engine (calculateTravelFee), read from the Premium so
 *   both versions carry the same travel.
 */
export const RUG_WATERPROOFING_PER_M2 = { premium: 15, essencial: 10 } as const;

type QuoteLine = { label: string; amount: number | null; tablePrice: number | null; perkApplied: boolean; perkNote?: string; quote: boolean };
const plus = <V,>(v: V, a: number): V => (typeof v === 'number' ? (cents(v + a) as V) : v);

/**
 * Adds an amount priced in the same visit to every price the quote gives (total, the rug prices,
 * both waterproofing versions, the extras' totals), with its own lines. A quote whose items are
 * sob orçamento (`quote`) keeps its total: there the price lives in rugEstimate / rugCombo.
 */
function addToPrices<T extends object>(r: T, amount: number, lines: QuoteLine[], tierAmounts?: { premium: number; essencial: number }): T {
  const q = r as Record<string, unknown>;
  const re = q.rugEstimate as { ok?: boolean; homePrice?: number; pickupPrice?: number | null } | null | undefined;
  const rc = q.rugCombo as { ok?: boolean; comboPrice?: number; usualPrice?: number } | null | undefined;
  const tiers = q.waterproofingTiers as { travel: number; premium: number | null; essencial: number | null } | null | undefined;
  const extra = (e: unknown) => (e && typeof e === 'object' ? { ...(e as object), total: plus((e as { total?: unknown }).total, amount) } : e);
  return {
    ...r,
    lines: [...((q.lines as QuoteLine[] | undefined) ?? []), ...lines],
    subtotal: q.quote ? q.subtotal : plus(q.subtotal, amount),
    total: q.quote ? q.total : plus(q.total, amount),
    rugEstimate: re && re.ok ? { ...re, homePrice: plus(re.homePrice, amount), pickupPrice: plus(re.pickupPrice, amount) } : re,
    rugCombo: rc && rc.ok ? { ...rc, comboPrice: plus(rc.comboPrice, amount), usualPrice: plus(rc.usualPrice, amount) } : rc,
    waterproofingTiers: tiers ? { ...tiers, premium: plus(tiers.premium, tierAmounts?.premium ?? amount), essencial: plus(tiers.essencial, tierAmounts?.essencial ?? amount) } : tiers,
    puff: extra(q.puff), armchair: extra(q.armchair), headboard: extra(q.headboard),
  };
}

/**
 * Anti-odour on a rug or carpet (cheiro, urina), bot only (owner, 24 Nov 2026: "anti odor sera sempre
 * 5 euros m2"; the 15€ floor of 12 Nov is gone): per rug, 5€ × its m², rounded down. Item flag
 * `odor: true` on the rug's cleaning item; its own line, already summed into the prices.
 */
export const RUG_ODOR = { min: 0, perM2: 5 } as const;
export const RUG_ODOR_RULE = 'Já está somado ao preço (total, ou homePrice/pickupPrice/comboPrice nos tapetes): não somes outra vez. Diz o anti-odor numa linha à parte.';
const rugOdorUnit = (w: number, l: number) => Math.max(RUG_ODOR.min, Math.floor(w * l * RUG_ODOR.perM2 + 1e-9));

function rugOdorFor(items: CustomPackItem[], rawOf: unknown[]): { amount: number; lines: QuoteLine[] } | null {
  const lines: QuoteLine[] = [];
  let amount = 0;
  items.forEach((i, n) => {
    if ((i.kind !== 'rug' && i.kind !== 'carpet') || (rawOf[n] as Record<string, unknown>)?.odor !== true) return;
    const w = Number(i.width), l = Number(i.length);
    const a = rugOdorUnit(w, l) * i.qty;
    amount += a;
    lines.push({ label: `Tratamento anti-odor ${i.kind === 'carpet' ? 'alcatifa' : 'tapete'} ${w} x ${l} m${i.qty > 1 ? ` (${i.qty} un.)` : ''}`, amount: a, tablePrice: a, perkApplied: false, perkNote: undefined, quote: false });
  });
  return amount ? { amount, lines } : null;
}

/**
 * Leather treatment (tratamento da pele: limpeza e hidratação do couro), owner 20 Nov 2026: +40€ per
 * leather sofa, +60€ on a 5 or 6 seater (size 5-lugares, U with 5+ seats included). A leather sofa is
 * never waterproofed. Item flag `leather: true` on the sofa's cleaning.
 */
export const LEATHER_TREATMENT = 40;
export const LEATHER_TREATMENT_LARGE = 60;
const leatherUnit = (size: string) => (size === '5-lugares' ? LEATHER_TREATMENT_LARGE : LEATHER_TREATMENT);
export const LEATHER_RULE = 'Já está somado ao total: não somes outra vez. Diz o tratamento da pele numa linha à parte. Nunca ofereças impermeabilização a um sofá de pele.';

function leatherFor(items: CustomPackItem[], rawOf: unknown[]): { amount: number; lines: QuoteLine[] } | null {
  const lines: QuoteLine[] = [];
  let amount = 0;
  items.forEach((i, n) => {
    if (i.kind !== 'sofa' || (rawOf[n] as Record<string, unknown>)?.leather !== true) return;
    const a = leatherUnit(i.size) * i.qty;
    amount += a;
    lines.push({ label: `Tratamento da pele (limpeza e hidratação)${i.qty > 1 ? ` (${i.qty} un.)` : ''}`, amount: a, tablePrice: a, perkApplied: false, perkNote: undefined, quote: false });
  });
  return amount ? { amount, lines } : null;
}

type InnerOk = Extract<ReturnType<typeof botQuoteInner>, { ok: true }>;
type RugWpResult = InnerOk & { rugWaterproofing: { amount: number; sameVisit: boolean; travelExtra: number } };

function rugWaterproofingQuote(input: Record<string, unknown>): RugWpResult | Fail | null {
  const raw = input.items;
  if (!Array.isArray(raw)) return null;
  const isRw = (r: unknown) => !!r && typeof r === 'object' && (r as Record<string, unknown>).kind === 'rug' && ['premium', 'essencial'].includes(String((r as Record<string, unknown>).treatment));
  const rugs = raw.filter(isRw) as Record<string, unknown>[];
  if (!rugs.length) return null;
  const others = raw.filter(r => !isRw(r));
  const hasExtras = [input.puffs, input.armchairs].some(v => typeof v === 'number' && v > 0) || (Array.isArray(input.headboards) && input.headboards.length > 0);
  const sameVisit = others.length > 0 || hasExtras;
  const lines: QuoteLine[] = [];
  let amount = 0;
  const byTier = { premium: 0, essencial: 0 };
  for (const r of rugs) {
    const w = typeof r.width === 'number' ? rugSide(r.width) : null;
    const l = typeof r.length === 'number' ? rugSide(r.length) : null;
    if (!w || !l) return fail(`impermeabilização de tapete: width e length em metros (ou centímetros, a partir de ${RUG_SIDE_MAX_METERS + 1})`);
    if (r.odor === true) return fail('odor: o anti-odor vai no artigo de limpeza do tapete (treatment clean), não na impermeabilização');
    const qty = typeof r.qty === 'number' && Number.isInteger(r.qty) && r.qty > 0 ? r.qty : 1;
    const tier = r.treatment as 'premium' | 'essencial';
    const at = (t: 'premium' | 'essencial') => Math.floor(qty * w.meters * l.meters * RUG_WATERPROOFING_PER_M2[t] + 1e-9);
    const a = at(tier);
    amount += a;
    byTier.premium += at('premium');
    byTier.essencial += at('essencial');
    lines.push({ label: `Impermeabilização ${tier === 'premium' ? 'Premium' : 'Essencial'} tapete ${w.meters} x ${l.meters} m${sameVisit ? ' (mesma visita, sem deslocação extra)' : ''}`, amount: a, tablePrice: a, perkApplied: false, perkNote: undefined, quote: false });
  }
  if (sameVisit) {
    const base = botQuoteCore({ ...input, items: others }) as ReturnType<typeof botQuoteInner>;
    if (!base.ok) return base;
    const rugPriced = base.rugEstimate?.ok === true || base.rugCombo?.ok === true;
    if (base.handToOwner || (base.quote ? !rugPriced : base.total === null)) return fail('a impermeabilização de tapete na mesma visita só tem preço quando os outros artigos têm preço: passa ao dono');
    const out = addToPrices(base, amount, lines, byTier);
    return {
      ...out,
      rugWaterproofing: { amount, sameVisit: true, travelExtra: 0 },
      closeNow: closeNowOffer({ total: out.quote ? null : out.total, waterproofing: true, handToOwner: false, rug: null }),
    };
  }
  const city = resolveBotCity(input.city);
  const extendedTrip = city !== null && EXTENDED_TRIP_CITIES.has(city);
  const baseFee = city === null ? undefined : locationPrices[city];
  const travel = baseFee === undefined ? null : calculateTravelFee(baseFee, byTier.premium);
  const handToOwner = travel === null || extendedTrip;
  const total = travel === null ? null : cents(amount + travel);
  return {
    ok: true as const, city, cityKnown: city !== null, extendedTrip, sharedTrip: false,
    lines, subtotal: amount, savings: 0, perkEligible: false, travel: travel ?? 0, total: total as number,
    waterproofingTiers: travel === null ? null : { travel, premium: cents(byTier.premium + travel), essencial: cents(byTier.essencial + travel) },
    quote: false, handToOwner, rugPickup: null, rugEstimate: null, rugCombo: null, puff: null, armchair: null, headboard: null,
    closeNow: closeNowOffer({ total, waterproofing: true, handToOwner, rug: null }),
    rugOdor: null,
    rugWaterproofing: { amount, sameVisit: false, travelExtra: travel ?? 0 },
  } as RugWpResult;
}

export function botQuote(input: unknown) {
  return withChairsWas(input, withMattressMitePack(input, withAskedDiscount(input, withSmallOrderFarSurcharge(input, withSeparatePrice(input, withBlackFridayPrices(input, botQuoteCore(input)))))));
}

/**
 * Colchão com anti-ácaros: o anti-ácaros feito à parte custa 40€ por colchão (dono, 24 Nov 2026: "sim 40€ nos
 * colchões"). `separate` = o mesmo pedido só com a limpeza + 40€ por colchão com anti-ácaros; é o preço riscado
 * ("em vez de") do pack limpeza + anti-ácaros, no site e no WhatsApp.
 */
export const MATTRESS_MITES_SEPARATE = 40;
export const MATTRESS_MITE_PACK_RULE = 'Colchão com anti-ácaros: mostra o pack com o preço riscado, ex.: "Limpeza + anti-ácaros (produto Bactran): ~~separate€~~ total€, com a deslocação incluída." O separate é a limpeza mais o anti-ácaros feito à parte (40€ por colchão). Nunca chamar desconto.';
function withMattressMitePack<T extends { ok: boolean }>(input: unknown, r: T): T & { mattressMitePack: { separate: number; total: number; perMattress: number; rule: string } | null } {
  const none = { ...r, mattressMitePack: null };
  const q = r as unknown as { ok: boolean; total?: number | null; quote?: boolean; handToOwner?: boolean };
  const items = (input as { items?: unknown } | null)?.items;
  if (!q.ok || q.quote || q.handToOwner || typeof q.total !== 'number' || !Array.isArray(items)) return none;
  const isMite = (i: unknown) => { const x = (i ?? {}) as Record<string, unknown>; return x.kind === 'mattress' && x.treatment === 'clean+anti-acaros'; };
  const n = items.filter(isMite).reduce((s: number, i) => s + (Number((i as Record<string, unknown>).qty) || 1), 0);
  if (!n) return none;
  const clean = botQuote({ ...(input as object), items: items.map(i => (isMite(i) ? { ...(i as object), treatment: 'clean' } : i)) }) as { ok: boolean; total?: number | null; quote?: boolean };
  if (!clean.ok || clean.quote || typeof clean.total !== 'number') return none;
  const separate = clean.total + MATTRESS_MITES_SEPARATE * n;
  return separate > q.total ? { ...r, mattressMitePack: { separate, total: q.total, perMattress: MATTRESS_MITES_SEPARATE, rule: MATTRESS_MITE_PACK_RULE } } : none;
}

/** Chairs alone with cleaning + waterproofing, 5 or more: the "em vez de" = the price of one chair × the quantity
 * (owner, 24 Nov 2026: "em vez de pagar 39 vezes 12, paga 359"). `chairsWas` is null otherwise. */
function withChairsWas<T extends object>(input: unknown, r: T): T & { chairsWas: number | null } {
  const raw = (input as { items?: unknown })?.items;
  const only = Array.isArray(raw) && raw.length === 1 ? raw[0] as Record<string, unknown> : null;
  const tier = only?.treatment === 'clean+premium' ? 'premium' : only?.treatment === 'clean+essencial' ? 'essencial' : null;
  const qty = Number(only?.qty);
  const total = (r as { total?: unknown }).total;
  const was = only?.kind === 'chairs' && tier && !only.seatOnly && Number.isSafeInteger(qty) && qty >= 5 && typeof total === 'number' ? chairPackWas(qty, tier) : null;
  return { ...r, chairsWas: was !== null && typeof total === 'number' && was > total ? was : null };
}

/**
 * Small order far from Odivelas (dono, 23 Nov 2026): a service under 49€ (travel apart) in a place more than
 * 20 km by car from Odivelas gets +10€, unless another piece joins the visit. Each option is judged on its own
 * (the Premium can be above 49€ and the Essencial below).
 */
function withSmallOrderFarSurcharge<T extends { ok: boolean }>(input: unknown, r: T): T & { smallOrderSurcharge: { amount: number; min: number; rule: string } | null } {
  const none = { ...r, smallOrderSurcharge: null };
  const inp = (input ?? {}) as Record<string, unknown>;
  const q = r as unknown as { ok: boolean; total?: number | null; travel?: number | null; quote?: boolean; handToOwner?: boolean; sharedTrip?: boolean; waterproofingTiers?: { travel: number; premium: number | null; essencial: number | null } | null };
  if (!q.ok || q.quote || q.handToOwner || q.sharedTrip || !isSmallOrderFarPlace(resolveBotCity(inp.city), typeof inp.city === 'string' ? inp.city : '')) return none;
  const add = (price: number | null | undefined, travel: number) => typeof price === 'number' && price - travel < SMALL_ORDER_FAR_MIN;
  const travel = q.travel ?? 0;
  const t = q.waterproofingTiers;
  const totalHit = add(q.total, travel);
  const premiumHit = !!t && add(t.premium, t.travel);
  const essencialHit = !!t && add(t.essencial, t.travel);
  if (!totalHit && !premiumHit && !essencialHit) return none;
  const out = { ...r } as Record<string, unknown>;
  if (totalHit) out.total = cents((q.total as number) + SMALL_ORDER_FAR_SURCHARGE);
  if (t) out.waterproofingTiers = {
    ...t,
    premium: premiumHit ? cents((t.premium as number) + SMALL_ORDER_FAR_SURCHARGE) : t.premium,
    essencial: essencialHit ? cents((t.essencial as number) + SMALL_ORDER_FAR_SURCHARGE) : t.essencial,
  };
  return { ...(out as T), smallOrderSurcharge: { amount: SMALL_ORDER_FAR_SURCHARGE, min: SMALL_ORDER_FAR_MIN, rule: SMALL_ORDER_FAR_RULE } };
}


export const BLACK_FRIDAY_RULE = 'Preço Black Friday (até 30/11, conta a data da marcação; o serviço pode ser em dezembro), deslocação incluída: mostra o antes e o agora, "Sofá de 3 lugares: antes [normal]€, agora [total]€ (Black Friday, deslocação incluída)". Sem condição especial por cima. As impermeabilizações não mudam.';
/**
 * Black Friday 2026 table (owner, 19 Nov 2026): cleaning-only orders get the BF price, travel included;
 * several pieces = sum of the table rounded DOWN to end in 9 (69 + 59 = 128 → 119). Waterproofing,
 * carpets, anti-mites, leather, rug odour, 6+ seats and site chairs keep today's price. Rugs alone: about
 * −20% on today's home price, ending in 9. Active 27–30/11 for everyone, or with `campaign: 'BFGTA'` until 30/11.
 */
function withBlackFridayPrices<T extends { ok: boolean }>(input: unknown, r: T): T & { blackFriday: { normal: number; total: number; until: string; rule: string } | null } {
  const none = { ...r, blackFriday: null };
  const inp = (input ?? {}) as Record<string, unknown>;
  const q = r as unknown as { ok: boolean; total?: number | null; quote?: boolean; handToOwner?: boolean; sharedTrip?: boolean; rugEstimate?: { ok: boolean; homePrice?: number; pickupPrice?: number | null } | null; rugCombo?: { ok: boolean } | null };
  const raw = Array.isArray(inp.items) ? (inp.items as Record<string, unknown>[]) : [];
  const rugsOnly = raw.length > 0 && raw.every(i => i?.kind === 'rug');
  if (!q.ok || (q.quote && !rugsOnly) || q.handToOwner || q.sharedTrip || !blackFridayPricesActive(inp.campaign)) return none;
  if (!raw.length || q.rugCombo?.ok) return none;
  const end9 = (v: number) => Math.floor((v + 1) / 10) * 10 - 1;
  let bf: number;
  if (rugsOnly) {
    if (raw.some(i => i.odor === true || (i.treatment ?? 'clean') !== 'clean') || !q.rugEstimate?.ok || typeof q.rugEstimate.homePrice !== 'number') return none;
    bf = end9(q.rugEstimate.homePrice * BLACK_FRIDAY_PRICES.rugFactor);
  } else {
    const chairs = raw.filter(i => i?.kind === 'chairs').reduce((s, i) => s + (typeof i.qty === 'number' ? i.qty : 1), 0);
    let sum = 0, pieces = 0;
    for (const i of raw) {
      if (!i || (i.treatment ?? 'clean') !== 'clean' || i.leather === true) return none;
      const qty = typeof i.qty === 'number' ? i.qty : 1;
      let unit: number | undefined;
      if (i.kind === 'sofa') {
        const size = i.size === 'u' ? (typeof i.seats === 'number' && i.seats <= 4 ? '4-lugares' : '') : String(i.size);
        unit = typeof i.seats === 'number' && i.seats >= 6 ? undefined : BLACK_FRIDAY_PRICES.sofa[size];
      } else if (i.kind === 'mattress') unit = BLACK_FRIDAY_PRICES.mattress[String(i.size)];
      else if (i.kind === 'chairs' && inp.site !== true && i.seatOnly !== true) unit = BLACK_FRIDAY_PRICES.chairUnit(chairs);
      if (unit === undefined) return none;
      sum += unit * qty;
      pieces += i.kind === 'chairs' ? 1 : qty;
    }
    bf = pieces > 1 || raw.some(i => i.kind === 'chairs') ? end9(sum) : sum;
  }
  const normal = rugsOnly ? q.rugEstimate!.homePrice! : q.total;
  if (typeof normal !== 'number' || bf >= normal) return none;
  const out = { ...r, total: bf, subtotal: bf, travel: 0, bigOrder: null, closeNow: null, antiMiteGift: null, mattressMiteOffer: null, visitGifts: null } as unknown as T;
  const rug = q.rugEstimate;
  if (rug?.ok && rugsOnly) (out as unknown as { rugEstimate: unknown }).rugEstimate = { ...rug, homePrice: bf, pickupPrice: rug.pickupPrice == null ? null : bf + (rug.pickupPrice - (rug.homePrice ?? 0)) };
  return { ...out, blackFriday: { normal, total: bf, until: '2026-11-30', rule: BLACK_FRIDAY_RULE } };
}

// Explicit return type: uWaterproofingQuote and withMattressMitePack call back into the engine, and an inferred
// type here is circular (it broke `npm run typecheck`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- read as JSON by the bot and the site, like before the cycle
type CoreQuote = any;
function botQuoteCore(input: unknown): CoreQuote {
  if (input && typeof input === 'object') {
    const rw = rugWaterproofingQuote(input as Record<string, unknown>);
    if (rw) return (rw.ok ? withAntiMiteGiftKept(withBigOrder(rw)) : rw) as unknown as CoreQuote;
    const u: unknown = uWaterproofingQuote(input as Record<string, unknown>);
    if (u) return withBigOrder(u as ReturnType<typeof botQuoteInner>) as unknown as CoreQuote;
  }
  return withVisitGifts(input, withAntiMiteGift(input, withBigOrder(botQuoteInner(input))));
}

/**
 * Pieces joined in the same visit (owner, 24 Nov 2026, "escada A"): the total never goes down; instead a
 * treatment is offered, always shown with the struck-through price ("dizes sempre o preço riscado").
 * One gift per piece beyond the first: the mattress anti-mites first, then each time the cheapest
 * treatment left in the visit (anti-mites on chairs or a sofa, anti-odor on a rug or carpet). Armchairs,
 * puffs and headboards count as pieces. A mattress order of 150€ or more keeps its gift (19 Nov). A mattress
 * or chairs the client already asked with anti-mites can be the gift (the base is cleaning only). The mattress
 * anti-mites shows its separate price, 40€ per mattress (owner, 24 Nov 2026: "sim, muda para 40€").
 * `usual` = price with the offered treatments (the struck price); `total` = what the client pays, up to the
 * next price ending in 9. Same gifts on the Premium / Essencial options (`tiers`). Above 300€ it replaces
 * the big-order cut. Works with a rug in the order (rugCombo).
 */
export const MATTRESS_MITE_OFFER_MIN = 150;
export type VisitGift = { piece: 'mattress' | 'chairs' | 'rug' | 'carpet' | 'sofa'; treatment: 'anti-acaros' | 'anti-odor'; normal: number };
export const VISIT_GIFTS_RULE = 'Já está tudo calculado: dá o total (total) e mostra SEMPRE o preço riscado (usual), uma linha por oferta com o valor normal, ex.: "Oferecemos o anti-ácaros no colchão (normalmente 40€)." e "Total: ~~usual€~~ total€, com a deslocação incluída." Nas opções Premium / Essencial, o mesmo com tiers (~~usual€~~ total€ em cada uma). Nunca chamar desconto; o total é o de tabela.';
type Priced = { ok: boolean; total?: number | null; quote?: boolean; handToOwner?: boolean; bigOrder?: unknown; rugCombo?: { comboPrice?: number | null } | null };
const innerPriced = (x: unknown): Priced => (botQuoteInner as (i: unknown) => unknown)(x) as Priced;
const pricedTotal = (r: Priced): number | null => {
  if (!r.ok || r.handToOwner) return null;
  if (typeof r.rugCombo?.comboPrice === 'number') return r.rugCombo.comboPrice;
  return !r.quote && typeof r.total === 'number' ? r.total : null;
};
type TierGift = { usual: number; total: number };
function withVisitGifts<T extends { ok: boolean }>(input: unknown, r: T): T & { visitGifts: { gifts: VisitGift[]; usual: number; total: number; tiers: { premium: TierGift | null; essencial: TierGift | null } | null; rule: string } | null; mattressMiteOffer: { normal: number; total: number } | null } {
  const none = { ...r, visitGifts: null, mattressMiteOffer: null };
  const q = r as unknown as Priced;
  const inp = (input ?? {}) as Record<string, unknown>;
  const rawIn = inp.items;
  // Above 300€ the ladder replaces the big-order cut (owner, 24 Nov 2026: the total never goes down); with no gift the big order stays.
  if (pricedTotal({ ...q, total: q.bigOrder ? (q.bigOrder as { normal: number }).normal : q.total }) === null || !Array.isArray(rawIn)) return none;
  const rec = (i: unknown) => (i ?? {}) as Record<string, unknown>;
  const price = (items: unknown[]) => pricedTotal(innerPriced({ ...inp, items }));
  const treat = (i: unknown) => rec(i).treatment as string | undefined;
  const clean = (i: unknown) => treat(i) === undefined || treat(i) === 'clean';
  // A mattress or chairs already asked with anti-mites: candidates on a cleaning base; restored (paid) when not offered.
  const asked = new Set<number>();
  const base = rawIn.map((i, n) => (['mattress', 'chairs'].includes(rec(i).kind as string) && treat(i) === 'clean+anti-acaros' ? (asked.add(n), { ...rec(i), treatment: 'clean' }) : i));
  const extras = ['armchairs', 'largeArmchairs', 'puffs', 'headboards'].filter(k => typeof inp[k] === 'number' && (inp[k] as number) > 0).length;
  const pieces = rawIn.length + extras;
  const candidate = (i: unknown): { piece: VisitGift['piece']; treatment: VisitGift['treatment']; apply: unknown } | null => {
    const x = rec(i);
    if (!clean(i)) return null;
    if (x.kind === 'mattress') return { piece: 'mattress', treatment: 'anti-acaros', apply: { ...x, treatment: 'clean+anti-acaros' } };
    if (x.kind === 'chairs' && !x.seatOnly) return { piece: 'chairs', treatment: 'anti-acaros', apply: { ...x, treatment: 'clean+anti-acaros' } };
    if (x.kind === 'sofa' && !x.leather) return { piece: 'sofa', treatment: 'anti-acaros', apply: { ...x, treatment: 'clean+anti-acaros' } };
    if ((x.kind === 'rug' || x.kind === 'carpet') && x.odor !== true) return { piece: x.kind, treatment: 'anti-odor', apply: { ...x, odor: true } };
    return null;
  };
  const baseTotal = price(base);
  if (baseTotal === null) return none;
  const giftsAllowed = Math.max(pieces - 1, baseTotal >= MATTRESS_MITE_OFFER_MIN && base.some(i => rec(i).kind === 'mattress') ? 1 : 0);
  const gifted = new Map<number, VisitGift>();
  let withGifts = base.slice();
  let usualBase = baseTotal;
  while (gifted.size < giftsAllowed) {
    let best: { n: number; gift: VisitGift; items: unknown[]; priced: number } | null = null;
    for (const [n, i] of withGifts.entries()) {
      if (gifted.has(n)) continue;
      const c = candidate(i);
      if (!c) continue;
      const items = withGifts.map((y, k) => (k === n ? c.apply : y));
      const priced = price(items);
      if (priced === null || priced <= usualBase) continue;
      const mattresses = c.piece === 'mattress' ? Number(rec(i).qty) || 1 : 0;
      const gift: VisitGift = { piece: c.piece, treatment: c.treatment, normal: c.piece === 'mattress' ? MATTRESS_MITES_SEPARATE * mattresses : cents(priced - usualBase) };
      // The mattress goes first (owner's ladder), then the cheapest treatment left.
      const better = !best || (c.piece === 'mattress') !== (best.gift.piece === 'mattress') ? !best || c.piece === 'mattress' : gift.normal < best.gift.normal;
      if (better) best = { n, gift, items, priced };
    }
    if (!best) break;
    gifted.set(best.n, best.gift);
    withGifts = best.items;
    usualBase = best.priced;
  }
  if (!gifted.size) return none;
  // Paid = cleaning base plus the anti-mites the client asked and was not offered; usual = paid plus the gifts.
  const restore = (items: unknown[]) => items.map((i, n) => (asked.has(n) && !gifted.has(n) ? rawIn[n] : i));
  const total = price(restore(base));
  if (total === null || price(restore(withGifts)) === null) return none;
  const gifts = [...gifted.entries()].sort((x, y) => x[0] - y[0]).map(([, g]) => g);
  // Owner, 24 Nov 2026 (sofá 3L + colchão casal = 89 + 79 = 168 -> 169): with a gift the total never falls under
  // the pieces quoted each on its own (each with its travel); without the gift the visit price stays (149).
  const EXTRA_KEYS = ['armchairs', 'largeArmchairs', 'puffs', 'headboards'];
  const noExtras = Object.fromEntries(Object.entries(inp).filter(([k]) => !EXTRA_KEYS.includes(k)));
  const aloneOf = (x: Record<string, unknown>): number | null => {
    const one = innerPriced({ ...noExtras, ...x }) as Priced & { rugEstimate?: { homePrice?: number | null } | null };
    return pricedTotal(one) ?? (typeof one.rugEstimate?.homePrice === 'number' ? one.rugEstimate.homePrice : null);
  };
  const parts = [...restore(base).map(i => aloneOf({ items: [i] })), ...EXTRA_KEYS.filter(k => (typeof inp[k] === 'number' && (inp[k] as number) > 0) || (Array.isArray(inp[k]) && (inp[k] as unknown[]).length > 0)).map(k => aloneOf({ items: [], [k]: inp[k] }))];
  const sumAlone = parts.every((v): v is number => typeof v === 'number') ? cents(parts.reduce((a, v) => a + v, 0)) : total;
  const lift = Math.max(0, cents(sumAlone - total));
  const paid = cents(total + lift);
  const usual = cents(paid + gifts.reduce((n, g) => n + g.normal, 0));
  // Owner, 24 Nov 2026: with a gift the total goes up to the next price ending in 9 (148 -> 149, 253 -> 259, 312 -> 319).
  const up9 = (x: number) => { const n = Math.ceil(x); return n % 10 === 9 ? n : Math.floor(n / 10) * 10 + 9; };
  const final = up9(paid);
  const out = { ...r } as Record<string, unknown>;
  const rc = q.rugCombo;
  if (rc && typeof rc.comboPrice === 'number') out.rugCombo = { ...rc, comboPrice: final };
  else out.total = final;
  // Premium / Essencial options: the same gifts on top, the price up to the next 9, the struck price beside it.
  const giftSum = cents(usual - paid);
  const t = (r as unknown as { waterproofingTiers?: { travel: number; premium: number | null; essencial: number | null } | null }).waterproofingTiers;
  const tier = (v: number | null): TierGift | null => (typeof v === 'number' ? { usual: cents(v + lift + giftSum), total: up9(v + lift) } : null);
  const tiers = t ? { premium: tier(t.premium), essencial: tier(t.essencial) } : null;
  if (t && tiers) out.waterproofingTiers = { ...t, premium: tiers.premium?.total ?? t.premium, essencial: tiers.essencial?.total ?? t.essencial };
  if (q.bigOrder) { out.bigOrder = null; out.antiMiteGift = null; }
  const m = gifts.find(g => g.piece === 'mattress');
  return { ...(out as T), visitGifts: { gifts, usual, total: final, tiers, rule: VISIT_GIFTS_RULE }, mattressMiteOffer: m ? { normal: m.normal, total: final } : null };
}
/** The rug-waterproofing result keeps the anti-mites gift of the rest of the order (or null). */
const withAntiMiteGiftKept = <T extends object>(r: T) => ({ ...r, antiMiteGift: ((r as { antiMiteGift?: number | null }).antiMiteGift ?? null) as number | null });

/**
 * The price cut the bot may give when the client asks for one (botAskedDiscount.ts, owner 12 Nov 2026):
 * on the price the bot quotes (total, or the rug price), null when the quote is sob orçamento, goes to the
 * owner, or already carries a special condition (big order, anti-mites gift).
 */
export const WATERPROOFING_ONLY_NO_DISCOUNT_RULE = 'Só impermeabilização: nunca desconto nem percentagem, e nunca explicar ao cliente que não fazemos desconto. Se o preço for a objeção, oferecer a deslocação (travelOffer) uma vez, como condição especial; sem deslocação, a opção Essencial.';

// Dono, 23 Nov 2026 (Antónia, 69€ → 62€ porque pediu): "parar com essa regra de merda de dar desconto às pessoas só porque elas te pedem".
// O preço nunca desce a pedido: sem askedDiscount e sem oferta da deslocação na impermeabilização.
function withAskedDiscount<T extends { ok: boolean }>(_input: unknown, r: T): T & { askedDiscount: AskedDiscount | null } {
  return { ...r, askedDiscount: null };
}

/**
 * Big order with anti-mites: the special condition is the anti-mites offered, not the % cut (owner,
 * 30 Oct 2026, Flávio, sofá + 3 colchões com desinfeção, 384€: "numa situação destas ofereces como brinde o
 * tratamento anti ácaros"). Gift = the quote with anti-mites minus the same quote with cleaning only; the
 * travel stays as quoted.
 */
function withAntiMiteGift<T extends { ok: boolean; bigOrder: unknown }>(input: unknown, r: T): T & { antiMiteGift: number | null } {
  const b = r.bigOrder as { normal: number; special: number; savings: number; tiers: unknown } | null;
  const raw = (input as { items?: unknown }).items;
  if (!b || !Array.isArray(raw) || !raw.some(i => (i as Record<string, unknown>)?.treatment === 'clean+anti-acaros')) return { ...r, antiMiteGift: null };
  const clean = botQuoteInner({ ...(input as object), items: raw.map(i => ((i as Record<string, unknown>).treatment === 'clean+anti-acaros' ? { ...(i as object), treatment: 'clean' } : i)) }) as { ok: boolean; total?: number | null };
  if (!clean.ok || typeof clean.total !== 'number') return { ...r, antiMiteGift: null };
  const gift = cents(b.normal - clean.total);
  if (gift <= 0) return { ...r, antiMiteGift: null };
  return { ...r, antiMiteGift: gift, bigOrder: { ...b, special: cents(b.normal - gift), savings: gift } };
}

/**
 * Orders above 300€: the bot answers them itself with the owner's own special condition (owner, 25 Oct
 * 2026: "quero que respondas as coisas de 300 mas que analises as conversas que tenho e vejas maneiras boas
 * de dar condições especiais inteligentes"). Read from his replies of Sep and Oct: he always shows the
 * normal value first, then a condition "pelo conjunto", 6 to 10% under it, ending in 9, with the travel
 * offered (441 → 399, 415 → 389, 412 → 379, 522 → 489, 299 → 269), and he barely touches waterproofing
 * ("o produto é caro e a margem não me permite"). So: travel off, then 7% off a cleaning order or 4% off an
 * order with waterproofing, rounded down to end in 9, never less than 20€ of saving.
 */
export const BIG_ORDER_MIN = 300;
const BIG_ORDER_CUT = { cleaning: 0.07, waterproofing: 0.04 } as const;
const BIG_ORDER_MIN_SAVING = 20;
const endIn9 = (v: number) => Math.floor((v + 1) / 10) * 10 - 1;
export function bigOrderPrice(total: number, travel: number, waterproofing: boolean): number {
  const cut = waterproofing ? BIG_ORDER_CUT.waterproofing : BIG_ORDER_CUT.cleaning;
  const special = endIn9((total - travel) * (1 - cut));
  return total - special >= BIG_ORDER_MIN_SAVING ? special : endIn9(total - BIG_ORDER_MIN_SAVING);
}
function withBigOrder<T extends { ok: boolean }>(r: T): T & { bigOrder: { normal: number; special: number; savings: number; tiers: { premium: number | null; essencial: number | null } | null } | null } {
  const q = r as unknown as { ok: boolean; total?: number | null; travel?: number | null; quote?: boolean; handToOwner?: boolean; waterproofingTiers?: { travel: number; premium: number | null; essencial: number | null } | null };
  if (!q.ok || q.quote || q.handToOwner || typeof q.total !== 'number' || q.total <= BIG_ORDER_MIN) return { ...r, bigOrder: null };
  const wp = !!q.waterproofingTiers;
  const travel = q.travel ?? 0;
  const special = bigOrderPrice(q.total, travel, wp);
  const t = q.waterproofingTiers;
  const tierPrice = (v: number | null) => (v === null ? null : v > BIG_ORDER_MIN ? bigOrderPrice(v, t!.travel, true) : v);
  return { ...r, bigOrder: { normal: q.total, special, savings: cents(q.total - special), tiers: t ? { premium: tierPrice(t.premium), essencial: tierPrice(t.essencial) } : null } };
}

function botQuoteInner(input: unknown) {
  if (!input || typeof input !== 'object') return fail('O pedido tem de ter items e city');
  const { items: rawItemsIn, city: rawCity, sharedTrip: rawShared, puffs: rawPuffs, armchairs: rawArmchairs, largeArmchairs: rawLarge, headboards: rawHeadboards } = input as Record<string, unknown>;
  const puffs = rawPuffs ?? 0;
  if (typeof puffs !== 'number' || !Number.isInteger(puffs) || puffs < 0 || puffs > 20) return fail('puffs tem de ser um inteiro entre 0 e 20');
  const armchairs = rawArmchairs ?? 0;
  const largeArmchairs = rawLarge === true;
  if (typeof armchairs !== 'number' || !Number.isInteger(armchairs) || armchairs < 0 || armchairs > 20) return fail('armchairs tem de ser um inteiro entre 0 e 20');
  const headboards = rawHeadboards ?? [];
  if (!Array.isArray(headboards) || headboards.length > 20 || headboards.some(h => typeof h !== 'string' || !(h in HEADBOARD_PRICES))) return fail('headboards tem de ser uma lista de tamanhos: solteiro, casal, queen ou king');
  const rawItems = rawItemsIn ?? [];
  if (Array.isArray(rawItems) && rawItems.length === 0 && [puffs > 0, armchairs > 0, headboards.length > 0].filter(Boolean).length > 1) return fail('Puffs, cadeirões e cabeceiras sem outro artigo: orçamenta cada um à parte');
  if (Array.isArray(rawItems) && rawItems.length === 0 && (puffs > 0 || armchairs > 0 || headboards.length > 0)) {
    const city = resolveBotCity(rawCity);
    const puff = puffs > 0 ? puffQuote(puffs, city, false, null) : null;
    const armchair = armchairs > 0 ? armchairQuote(armchairs, city, false, null, largeArmchairs) : null;
    const headboard = headboards.length > 0 ? headboardQuote(headboards as HeadboardSize[], city, false, null) : null;
    const extra = (puff ?? armchair ?? headboard)!;
    const extendedTrip = city !== null && EXTENDED_TRIP_CITIES.has(city);
    return {
      ok: true as const, city, cityKnown: city !== null, extendedTrip, sharedTrip: false,
      lines: [] as { label: string; amount: number | null; tablePrice: number | null; perkApplied: boolean; perkNote?: string; quote: boolean }[],
      subtotal: extra.amount, savings: 0, perkEligible: false, travel: extra.travel ?? 0, total: extra.total ?? extra.amount,
      waterproofingTiers: null, quote: false, handToOwner: city === null || extendedTrip,
      rugPickup: null, rugEstimate: null, rugCombo: null, puff, armchair, headboard, rugOdor: null as { amount: number; min: number; perM2: number; rule: string } | null,
      closeNow: closeNowOffer({ total: extra.total, waterproofing: false, handToOwner: city === null || extendedTrip, rug: null }),
    };
  }
  if (!Array.isArray(rawItems) || rawItems.length === 0) return fail('items tem de ser uma lista com pelo menos um artigo');
  if (rawItems.length > MAX_ITEMS) return fail(`No máximo ${MAX_ITEMS} artigos por orçamento`);
  const items: CustomPackItem[] = [];
  /** The raw item behind each priced item (an L sofa with waterproofing becomes two). */
  const rawOf: unknown[] = [];
  for (const [i, raw] of rawItems.entries()) {
    const item = toItem(raw, i);
    if ('ok' in item) return item;
    // Waterproofing a corner (L) sofa = waterproofing a 5-seat sofa (owner, 20 Nov 2026, Ana Marques: "o sofá de
    // canto é um sofá de 5 lugares"; replaces the 3+2 of 25 and 28 Oct). There is no 5-seat waterproofing price
    // (sob orçamento in the quiz), so it takes the U rule up to 5 seats: with the cleaning, the canto's cleaning
    // (119€) plus 150€ Premium / 90€ Essencial; alone, 179€ / 129€.
    if (item.kind === 'sofa' && item.size === 'canto' && (item.extra === 'premium' || item.extra === 'essencial')) {
      items.push({ ...item, waterproofingFixed: item.primary === 'waterproofing' ? U_WATERPROOFING_ALONE : U_WATERPROOFING_EXTRA });
      rawOf.push(raw);
      continue;
    }
    // 5-seat sofa cleaned alone, nothing else in the order (dono, 22 Nov 2026, Rosângela): 119€ final with the
    // 10€ travel included, so the base is 109€ (travel added as usual); in a bigger order it stays 119€.
    if (rawItems.length === 1 && (raw as Record<string, unknown>)?.size === '5-lugares' && item.kind === 'sofa' && item.size === '5-lugares' && !item.unitPrice && item.extra === 'none' && item.primary !== 'waterproofing') {
      const fee = locationPrices[resolveBotCity(rawCity) ?? ''];
      items.push(fee === 10 ? { ...item, unitPrice: 109 } : item);
      rawOf.push(raw);
      continue;
    }
    // 5-seat sofa with the cleaning (dono, 22 Nov 2026, Rosângela): 119€ + 190/130€ = 309/249€.
    if (item.kind === 'sofa' && item.size === '5-lugares' && !item.unitPrice && item.primary !== 'waterproofing' && (item.extra === 'premium' || item.extra === 'essencial')) {
      items.push({ ...item, waterproofingFixed: SEAT5_WATERPROOFING_EXTRA });
      rawOf.push(raw);
      continue;
    }
    items.push(item);
    rawOf.push(raw);
  }
  // Chairs: one table for site and bot (owner, 24 Nov 2026), chairPricing.chairCleanTotal via customPack.
  const city = resolveBotCity(rawCity);
  const result = calculateCustomPack(items, city ?? '');
  const tiers = items.some(isWaterproofing) ? waterproofingTiers(items, city ?? '') : null;
  const extendedTrip = city !== null && EXTENDED_TRIP_CITIES.has(city);
  // Far zone, on a day a booked team is already there (availability.sharedTrip): no travel fee,
  // and the price is the bot's (owner, 19 Oct 2026: Santo André 139€ → 119€).
  const sharedTrip = extendedTrip && rawShared === true && !result.quote;
  const tiersOut = tiers && sharedTrip
    ? { travel: 0, premium: tiers.premium === null ? null : cents(tiers.premium - tiers.travel), essencial: tiers.essencial === null ? null : cents(tiers.essencial - tiers.travel) }
    : tiers;
  const travel = sharedTrip ? 0 : tiers ? tiers.travel : result.travel;
  const total = sharedTrip ? cents(result.subtotal) : tiers ? cents(result.subtotal + tiers.travel) : result.total;
  // Rugs only: the bot quotes them itself with the owner's rule (10 Oct 2026).
  // Anything mixed with other items still goes to the owner.
  // Alcatifas pelo mesmo motor, 7€/m² (dono, 24 Nov 2026).
  const isRugLike = (k: string) => k === 'rug' || k === 'carpet';
  const matOf = (n: number) => (items[n].kind === 'carpet' ? 'alcatifa' : (rawOf[n] as Record<string, unknown>).material);
  const rugsOnly = items.every(i => isRugLike(i.kind));
  const rugPrice = rugsOnly
    ? rugEstimate(items.map((i, n) => ({ width: Number(i.width), length: Number(i.length), qty: i.qty, material: matOf(n) })), city)
    : null;
  // Rugs mixed with priced items: one visit, travel offered (owner, 17 Oct 2026).
  const rugIdx = items.flatMap((i, n) => (isRugLike(i.kind) ? [n] : []));
  const others = items.filter(i => !isRugLike(i.kind));
  const othersResult = !rugsOnly && rugIdx.length && others.length ? calculateCustomPack(others, city ?? '') : null;
  const rugCombo = othersResult && !othersResult.quote
    ? rugComboEstimate(rugIdx.map(n => ({ width: Number(items[n].width), length: Number(items[n].length), qty: items[n].qty, material: matOf(n) })), othersResult.subtotal, city)
    : null;
  const rugPriced = rugPrice?.ok === true || rugCombo?.ok === true;
  const handToOwner = (result.quote && !rugPriced) || city === null || (extendedTrip && !sharedTrip);
  const out = {
    ok: true as const,
    city,
    cityKnown: city !== null,
    extendedTrip,
    sharedTrip,
    lines: result.lines.map(line => ({
      label: line.label,
      amount: line.amount,
      tablePrice: line.tablePrice,
      perkApplied: line.perkApplied,
      perkNote: line.perkNote,
      quote: line.quote,
    })),
    subtotal: result.subtotal,
    savings: result.savings,
    perkEligible: result.perkEligible,
    travel,
    total,
    // Both versions of the same order, same travel: quote them from here.
    waterproofingTiers: tiersOut,
    quote: result.quote,
    handToOwner,
    rugPickup: rugPickupFor(items, city),
    rugEstimate: rugPrice,
    rugCombo,
    // Puffs on the same visit: 20€ each (special condition). Add puff.amount to the price you quote.
    puff: puffs > 0 ? puffQuote(puffs, city, true, rugCombo?.ok ? rugCombo.comboPrice : rugPrice?.ok ? rugPrice.homePrice : result.quote ? null : total) : null,
    // Armchairs (cadeirões) on the same visit: 29€ each (4 or more: 25€ each, also alone). Add armchair.amount to the price you quote.
    armchair: armchairs > 0 ? armchairQuote(armchairs, city, true, rugCombo?.ok ? rugCombo.comboPrice : rugPrice?.ok ? rugPrice.homePrice : result.quote ? null : total, largeArmchairs) : null,
    // Headboards (cabeceiras) on the same visit: 29€ solteiro, 39€ casal, 45€ queen/king, no travel. Add headboard.amount to the price you quote.
    headboard: headboards.length > 0 ? headboardQuote(headboards as HeadboardSize[], city, true, rugCombo?.ok ? rugCombo.comboPrice : rugPrice?.ok ? rugPrice.homePrice : result.quote ? null : total) : null,
    // Discount to close now, only when the client said the price is the problem (owner, 13 Oct 2026).
    closeNow: closeNowOffer({
      total: result.quote ? null : total,
      waterproofing: items.some(isWaterproofing),
      handToOwner: handToOwner && !rugPriced,
      rug: rugPrice?.ok ? { homePrice: rugPrice.homePrice, pickupPrice: rugPrice.pickupPrice } : rugCombo?.ok ? { homePrice: rugCombo.comboPrice, pickupPrice: null } : null,
    }),
  };
  // Anti-odour on rugs and carpets (owner, 12 Nov 2026): own lines, summed into every price.
  const odor = rugOdorFor(items, rawOf);
  const withOdor = odor
    ? { ...addToPrices(out, odor.amount, odor.lines), rugOdor: { amount: odor.amount, min: RUG_ODOR.min, perM2: RUG_ODOR.perM2, rule: RUG_ODOR_RULE } as { amount: number; min: number; perM2: number; rule: string } | null }
    : { ...out, rugOdor: null as { amount: number; min: number; perM2: number; rule: string } | null };
  // Leather treatment (owner, 16 Nov 2026): own line, summed into the price; never waterproofing tiers.
  const leather = leatherFor(items, rawOf);
  if (!leather) return { ...withOdor, leatherTreatment: null as { amount: number; perSofa: number; rule: string } | null };
  return { ...addToPrices(withOdor, leather.amount, leather.lines), waterproofingTiers: null, leatherTreatment: { amount: leather.amount, perSofa: leather.amount / items.filter((i, n) => i.kind === 'sofa' && (rawOf[n] as Record<string, unknown>)?.leather === true).reduce((q, i) => q + i.qty, 0), rule: LEATHER_RULE } as { amount: number; perSofa: number; rule: string } | null };
}

/**
 * "Poupa X€" (owner, 24 Nov 2026, same logic as the site's pack widgets): with several pieces or cleaning +
 * waterproofing, the struck price is the SAME order done separately (each service alone with its own travel;
 * waterproofing alone as a visit of its own), priced by this engine, never an invented value. The total and the
 * struck price both go up to the next price ending in 9; `saving` = the difference. Gifts of the visit (escada A)
 * are added to the separate price at their normal value. Also on the Premium / Essencial options (`tiers`).
 */
export const SEPARATE_PRICE_RULE = 'Já está tudo calculado: mostra o total (total) com o preço em separado riscado e a poupança, ex.: "Total: 449€ (em vez de 529€ em separado). Poupa 80€." Nas opções Premium / Essencial, o mesmo com tiers. Com withoutGift (há uma oferta da visita): primeiro o total com a oferta e, numa linha à parte, "Sem o [tratamento oferecido], fica em [withoutGift]€." Nunca outro valor riscado, nunca chamar desconto.';
const up9Total = (x: number) => { const n = Math.ceil(x - 1e-9); return n % 10 === 9 ? n : Math.floor(n / 10) * 10 + 9; };
type SepTier = { separate: number; total: number; saving: number };
function withSeparatePrice<T extends { ok: boolean }>(input: unknown, r: T): T {
  const none = { ...r, separatePrice: null } as T;
  const q = r as unknown as Priced & { blackFriday?: unknown; waterproofingTiers?: { premium: number | null; essencial: number | null } | null; visitGifts?: { gifts: VisitGift[] } | null };
  const inp = (input ?? {}) as Record<string, unknown>;
  const items = inp.items;
  if (!Array.isArray(items) || !items.length || q.blackFriday || q.bigOrder || q.rugCombo) return none;
  if (['armchairs', 'largeArmchairs', 'puffs', 'headboards'].some(k => typeof inp[k] === 'number' && (inp[k] as number) > 0)) return none;
  // Chairs alone: their struck price is chairsWas (1 chair × quantity; owner, 24 Nov 2026), never this one.
  if (items.every(i => (i as Record<string, unknown>)?.kind === 'chairs')) return none;
  const total = pricedTotal(q);
  if (total === null) return none;
  const alone = (i: unknown) => pricedTotal(innerPriced({ ...inp, items: [i] }));
  const rec = (i: unknown) => (i ?? {}) as Record<string, unknown>;
  // One item split into its separate visits: cleaning alone + waterproofing alone.
  const visits = (i: unknown, tier?: 'premium' | 'essencial'): unknown[] | null => {
    const raw = (rec(i).treatment as string | undefined) ?? 'clean';
    const t = tier && /^clean\+(premium|essencial)$/.test(raw) ? 'clean' : raw;
    const wp = tier && t === 'clean' ? tier : t.startsWith('clean+') && (t.endsWith('premium') || t.endsWith('essencial')) ? t.slice(6) : null;
    if (!wp) return [i];
    const asWp = alone({ ...rec(i), treatment: wp }) === null ? null : { ...rec(i), treatment: wp };
    if (tier && !asWp) return [i]; // not waterproofable (mattress, rug): only its cleaning
    return asWp ? [{ ...rec(i), treatment: 'clean' }, asWp] : null;
  };
  const giftSum = (q.visitGifts?.gifts ?? []).reduce((a, g) => a + g.normal, 0);
  const sepOf = (tier?: 'premium' | 'essencial'): number | null => {
    const parts: unknown[] = [];
    for (const i of items) { const v = visits(i, tier); if (!v) return null; parts.push(...v); }
    if (parts.length < 2) return null;
    let sum = 0;
    for (const p of parts) { const v = alone(p); if (v === null) return null; sum += v; }
    return sum + giftSum;
  };
  const make = (sep: number | null, tot: number | null): SepTier | null => {
    if (sep === null || tot === null) return null;
    const t9 = up9Total(tot), s9 = up9Total(sep);
    return s9 > t9 ? { separate: s9, total: t9, saving: s9 - t9 } : null;
  };
  const main = make(sepOf(), total);
  const wt = q.waterproofingTiers;
  const tiers = wt ? { premium: make(sepOf('premium'), wt.premium), essencial: make(sepOf('essencial'), wt.essencial) } : null;
  if (!main && !(tiers && (tiers.premium || tiers.essencial))) return none;
  const out = { ...r } as Record<string, unknown>;
  if (main) out.total = main.total;
  if (wt && tiers) out.waterproofingTiers = { ...wt, premium: tiers.premium?.total ?? wt.premium, essencial: tiers.essencial?.total ?? wt.essencial };
  // Typed as T (the result is read as JSON by the bot): a wider type here makes botQuote's type circular.
  // With a gift of the visit (escada A), the price without it (owner, 24 Nov 2026: "se ele não quiser, faço por 149").
  const plain = q.visitGifts?.gifts?.length ? pricedTotal(innerPriced(inp)) : null;
  const withoutGift = plain === null ? null : up9Total(plain);
  return { ...(out as T), separatePrice: { ...(main ?? { separate: 0, total, saving: 0 }), tiers, withoutGift: withoutGift !== null && withoutGift < (main?.total ?? total) ? withoutGift : null, rule: SEPARATE_PRICE_RULE } } as T;
}
