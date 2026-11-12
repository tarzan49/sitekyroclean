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
import { locationPrices, EXTENDED_TRIP_CITIES, calculateTravelFee } from '../constants/travel';
import { isBlackFriday } from '../constants/campaigns';
import { rugPickupFee, RUG_PICKUP_FEE_RULE, RUG_PICKUP_MIN_AREA_M2 } from '../constants/commercialPolicy';
import { rugSide, RUG_SIDE_MAX_METERS } from '../constants/rugMeasure';
import { rugComboEstimate, rugEstimate } from './botRugEstimate';
import { closeNowOffer } from './botCloseNow';
import { freguesiaToMunicipio, parishPartToMunicipio } from './parishMunicipality';
import { askedDiscountFor, type AskedDiscount } from './botAskedDiscount';
import { whatsappChairCleanUnit } from '../constants/chairPricing';

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
  // the photo, `look` compacto 129€ / medio 139€ / grande 149€ (travel apart); with waterproofing +170€ / +110€
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
  return { id: String(index), kind, size, qty, extra, primary, width, length, ...(unitPrice ? { unitPrice } : {}) };
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
  const travel = isBlackFriday() ? 0 : baseFee > WATERPROOFING_TRAVEL_MAX || aloneSmall ? WATERPROOFING_TRAVEL_MAX : Math.min(premium.travel, WATERPROOFING_TRAVEL_MAX);
  return {
    travel,
    premium: premium.quote ? null : cents(premium.subtotal + travel),
    essencial: essencial.quote ? null : cents(essencial.subtotal + travel),
  };
}

function rugPickupFor(items: CustomPackItem[]) {
  const rugs = items.filter(i => i.kind === 'rug');
  if (!rugs.length) return null;
  const areaM2 = Math.round(rugs.reduce((sum, i) => sum + i.qty * Number(i.width) * Number(i.length), 0) * 100) / 100;
  return { areaM2, minAreaM2: RUG_PICKUP_MIN_AREA_M2, fee: rugPickupFee(areaM2), rule: RUG_PICKUP_FEE_RULE };
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
const armchairQuote = (qty: number, city: string | null, withOthers: boolean, othersTotal: number | null) =>
  extraQuote(qty, ARMCHAIR_PRICE, ARMCHAIR_SAME_VISIT_PRICE, city, withOthers, othersTotal);
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

function uWaterproofingQuote(input: Record<string, unknown>) {
  const raw = input.items;
  if (!Array.isArray(raw)) return null;
  const treatmentOf = (r: unknown) => String((r as Record<string, unknown>).treatment ?? '');
  const isU = (r: unknown) => !!r && typeof r === 'object' && (r as Record<string, unknown>).kind === 'sofa' && (r as Record<string, unknown>).size === 'u';
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
    const premium = cents(rest + U_WATERPROOFING_ALONE.premium * n);
    const essencial = cents(rest + U_WATERPROOFING_ALONE.essencial * n);
    const total = tier === 'premium' ? premium : essencial;
    const amount = U_WATERPROOFING_ALONE[tier] * n;
    const line = { label: `Impermeabilização ${tier === 'premium' ? 'Premium' : 'Essencial'} sofá em U`, amount, tablePrice: amount, perkApplied: false, perkNote: undefined as string | undefined, quote: false };
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
 * Anti-odour on a rug or carpet (cheiro, urina), bot only (owner, 12 Nov 2026: "+15€ de anti-odor;
 * dependendo dos m², 5€ o m²"): per rug, the larger of 15€ and 5€ × its m², rounded down. Item flag
 * `odor: true` on the rug's cleaning item; its own line, already summed into the prices.
 */
export const RUG_ODOR = { min: 15, perM2: 5 } as const;
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
  return withAskedDiscount(input, botQuoteCore(input));
}

function botQuoteCore(input: unknown) {
  if (input && typeof input === 'object') {
    const rw = rugWaterproofingQuote(input as Record<string, unknown>);
    if (rw) return rw.ok ? withAntiMiteGiftKept(withBigOrder(rw)) : rw;
    const u = uWaterproofingQuote(input as Record<string, unknown>);
    if (u) return withBigOrder(u);
  }
  return withAntiMiteGift(input, withBigOrder(botQuoteInner(input)));
}
/** The rug-waterproofing result keeps the anti-mites gift of the rest of the order (or null). */
const withAntiMiteGiftKept = <T extends object>(r: T) => ({ ...r, antiMiteGift: ((r as { antiMiteGift?: number | null }).antiMiteGift ?? null) as number | null });

/**
 * The price cut the bot may give when the client asks for one (botAskedDiscount.ts, owner 12 Nov 2026):
 * on the price the bot quotes (total, or the rug price), null when the quote is sob orçamento, goes to the
 * owner, or already carries a special condition (big order, anti-mites gift).
 */
function withAskedDiscount<T extends { ok: boolean }>(input: unknown, r: T): T & { askedDiscount: AskedDiscount | null } {
  const q = r as unknown as {
    ok: boolean; total?: number | null; quote?: boolean; handToOwner?: boolean; bigOrder?: unknown; antiMiteGift?: unknown;
    waterproofingTiers?: unknown; rugWaterproofing?: unknown;
    rugEstimate?: { ok?: boolean; homePrice?: number } | null; rugCombo?: { ok?: boolean; comboPrice?: number } | null;
  };
  if (!q.ok || q.handToOwner || q.bigOrder || q.antiMiteGift) return { ...r, askedDiscount: null };
  const price = !q.quote && typeof q.total === 'number' ? q.total
    : q.rugCombo?.ok && typeof q.rugCombo.comboPrice === 'number' ? q.rugCombo.comboPrice
    : q.rugEstimate?.ok && typeof q.rugEstimate.homePrice === 'number' ? q.rugEstimate.homePrice
    : null;
  if (price === null) return { ...r, askedDiscount: null };
  const raw = (input as { items?: unknown } | null)?.items;
  const waterproofing = !!q.waterproofingTiers || !!q.rugWaterproofing
    || (Array.isArray(raw) && raw.some(i => /premium|essencial/.test(String((i as Record<string, unknown> | null)?.treatment ?? ''))));
  return { ...r, askedDiscount: askedDiscountFor(price, waterproofing) };
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
  const { items: rawItemsIn, city: rawCity, sharedTrip: rawShared, puffs: rawPuffs, armchairs: rawArmchairs, headboards: rawHeadboards, site: rawSite } = input as Record<string, unknown>;
  const puffs = rawPuffs ?? 0;
  if (typeof puffs !== 'number' || !Number.isInteger(puffs) || puffs < 0 || puffs > 20) return fail('puffs tem de ser um inteiro entre 0 e 20');
  const armchairs = rawArmchairs ?? 0;
  if (typeof armchairs !== 'number' || !Number.isInteger(armchairs) || armchairs < 0 || armchairs > 20) return fail('armchairs tem de ser um inteiro entre 0 e 20');
  const headboards = rawHeadboards ?? [];
  if (!Array.isArray(headboards) || headboards.length > 20 || headboards.some(h => typeof h !== 'string' || !(h in HEADBOARD_PRICES))) return fail('headboards tem de ser uma lista de tamanhos: solteiro, casal, queen ou king');
  const rawItems = rawItemsIn ?? [];
  if (Array.isArray(rawItems) && rawItems.length === 0 && [puffs > 0, armchairs > 0, headboards.length > 0].filter(Boolean).length > 1) return fail('Puffs, cadeirões e cabeceiras sem outro artigo: orçamenta cada um à parte');
  if (Array.isArray(rawItems) && rawItems.length === 0 && (puffs > 0 || armchairs > 0 || headboards.length > 0)) {
    const city = resolveBotCity(rawCity);
    const puff = puffs > 0 ? puffQuote(puffs, city, false, null) : null;
    const armchair = armchairs > 0 ? armchairQuote(armchairs, city, false, null) : null;
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
    // Waterproofing an L sofa = a 3-seater plus a 2-seater (owner, 25 Oct 2026: "SOFÁ EM L … É UM SOFÁ
    // DE 3+2 LUGARES"; 28 Oct 2026, "adiciona tb": impermeabilizar em L = 3 lugares + 2 lugares). Only
    // the cleaning of an L has its own price (canto, 109€); before this the bot handed every waterproofing
    // of an L to the owner as sob orçamento.
    if (item.kind === 'sofa' && item.size === 'canto' && (item.extra === 'premium' || item.extra === 'essencial')) {
      items.push({ ...item, id: `${item.id}a`, size: '3-lugares' }, { ...item, id: `${item.id}b`, size: '2-lugares' });
      rawOf.push(raw, raw);
      continue;
    }
    items.push(item);
    rawOf.push(raw);
  }
  // Chairs on WhatsApp (owner, 12 Nov 2026): 25€ each up to 3, 20€ from 4, 18€ from 8, counted over all
  // the chairs to clean in the order; travel apart. The site's tiers (20/15/12,50€) are the site's only:
  // an order from the site's questionnaire (`site: true`, quizOrder quoteRequest) keeps the price it showed.
  const chairsToClean = items.filter(i => i.kind === 'chairs' && i.primary !== 'waterproofing').reduce((sum, i) => sum + i.qty, 0);
  const chairUnit = rawSite === true ? null : whatsappChairCleanUnit(chairsToClean);
  if (chairUnit) for (const [n, i] of items.entries()) if (i.kind === 'chairs' && i.primary !== 'waterproofing') items[n] = { ...i, unitPrice: chairUnit };
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
  const rugsOnly = items.every(i => i.kind === 'rug');
  const rugPrice = rugsOnly
    ? rugEstimate(items.map((i, n) => ({ width: Number(i.width), length: Number(i.length), qty: i.qty, material: (rawOf[n] as Record<string, unknown>).material })), city)
    : null;
  // Rugs mixed with priced items: one visit, travel offered (owner, 17 Oct 2026).
  const rugIdx = items.flatMap((i, n) => (i.kind === 'rug' ? [n] : []));
  const others = items.filter(i => i.kind !== 'rug');
  const othersResult = !rugsOnly && rugIdx.length && others.length ? calculateCustomPack(others, city ?? '') : null;
  const rugCombo = othersResult && !othersResult.quote
    ? rugComboEstimate(rugIdx.map(n => ({ width: Number(items[n].width), length: Number(items[n].length), qty: items[n].qty, material: (rawOf[n] as Record<string, unknown>).material })), othersResult.subtotal, city)
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
    rugPickup: rugPickupFor(items),
    rugEstimate: rugPrice,
    rugCombo,
    // Puffs on the same visit: 20€ each (special condition). Add puff.amount to the price you quote.
    puff: puffs > 0 ? puffQuote(puffs, city, true, rugCombo?.ok ? rugCombo.comboPrice : rugPrice?.ok ? rugPrice.homePrice : result.quote ? null : total) : null,
    // Armchairs (cadeirões) on the same visit: 29€ each. Add armchair.amount to the price you quote.
    armchair: armchairs > 0 ? armchairQuote(armchairs, city, true, rugCombo?.ok ? rugCombo.comboPrice : rugPrice?.ok ? rugPrice.homePrice : result.quote ? null : total) : null,
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
  if (!odor) return { ...out, rugOdor: null as { amount: number; min: number; perM2: number; rule: string } | null };
  return { ...addToPrices(out, odor.amount, odor.lines), rugOdor: { amount: odor.amount, min: RUG_ODOR.min, perM2: RUG_ODOR.perM2, rule: RUG_ODOR_RULE } };
}
