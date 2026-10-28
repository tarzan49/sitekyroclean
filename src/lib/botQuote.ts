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
import { locationPrices, EXTENDED_TRIP_CITIES } from '../constants/travel';
import { rugPickupFee, RUG_PICKUP_FEE_RULE, RUG_PICKUP_MIN_AREA_M2 } from '../constants/commercialPolicy';
import { rugSide, RUG_SIDE_MAX_METERS } from '../constants/rugMeasure';
import { rugComboEstimate, rugEstimate } from './botRugEstimate';
import { closeNowOffer } from './botCloseNow';
import { freguesiaToMunicipio, parishPartToMunicipio } from './parishMunicipality';

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
  if ((kind === 'rug' || kind === 'carpet') && treatment !== 'clean') return fail(`items[${index}]: tapetes e alcatifas só têm limpeza`);
  let size = '';
  if (kind === 'sofa' && r.size === 'u') {
    // A U sofa is counted by its seats in the photo (owner, 16 Oct 2026): the cleaning costs as 4 lugares
    // up to 4 seats and as 5+ from 5. Waterproofing and anti-mites on a U stay with him (sob orçamento).
    const seats = r.seats;
    if (typeof seats !== 'number' || !Number.isInteger(seats) || seats < 2 || seats > 15) return fail(`items[${index}].seats (lugares contados na fotografia, 2 a 15) é obrigatório num sofá em U`);
    size = treatment !== 'clean' ? '4+-lugares' : seats <= 4 ? '4-lugares' : '5-lugares';
  } else if (kind === 'sofa' || kind === 'mattress') {
    size = typeof r.size === 'string' ? r.size : '';
    if (!BOT_SIZES[kind].includes(size)) return fail(`items[${index}].size tem de ser um de: ${BOT_SIZES[kind].join(', ')}${kind === 'sofa' ? ', ou u (sofá em U, com seats)' : ''}`);
  }
  // Same reading as the quiz (rugSide): "230" is 2,30 m, never a 230 m rug.
  const dim = (v: unknown) => { const side = typeof v === 'number' ? rugSide(v) : null; return side ? String(side.meters) : ''; };
  const width = kind === 'rug' || kind === 'carpet' ? dim(r.width) : '';
  const length = kind === 'rug' || kind === 'carpet' ? dim(r.length) : '';
  if ((kind === 'rug' || kind === 'carpet') && (!width || !length)) return fail(`items[${index}]: tapetes e alcatifas precisam de width e length em metros (ou centímetros, a partir de ${RUG_SIDE_MAX_METERS + 1})`);
  return { id: String(index), kind, size, qty, extra, primary, width, length };
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
  // Farther towns (15€ and 20€) always carry 10€ on both versions (owner, 15 Oct 2026: "em Setúbal, que já é
  // mais longe, podes fazer a 149 e a 109"); 10€ towns keep the waiver, read from the Premium.
  const baseFee = locationPrices[city] ?? 0;
  const travel = baseFee > WATERPROOFING_TRAVEL_MAX ? WATERPROOFING_TRAVEL_MAX : Math.min(premium.travel, WATERPROOFING_TRAVEL_MAX);
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
 * item "sob orçamento" (carpets, 4+ seats, 10+ chairs, rugs the bot cannot price
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

function puffQuote(qty: number, city: string | null, withOthers: boolean, othersTotal: number | null) {
  const unitPrice = withOthers ? PUFF_SAME_VISIT_PRICE : PUFF_PRICE;
  const amount = qty * unitPrice;
  const travel = withOthers ? 0 : city !== null ? (locationPrices[city] ?? null) : null;
  return {
    qty,
    tablePrice: PUFF_PRICE,
    unitPrice,
    specialCondition: withOthers,
    amount,
    travel,
    // Order total with the puffs; null when the rest of the order has no price.
    total: withOthers ? (othersTotal === null ? null : cents(othersTotal + amount)) : travel === null ? null : amount + travel,
  };
}

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
    const base = others.length ? botQuote({ ...input, items: others }) : null;
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
      closeNow: closeNowOffer({ total, waterproofing: true, handToOwner: false, rug: null }),
    };
  }
  const base = botQuote({ ...input, items: raw.map(r => (isUw(r) ? { ...(r as object), treatment: 'clean' } : r)) });
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

export function botQuote(input: unknown) {
  if (input && typeof input === 'object') {
    const u = uWaterproofingQuote(input as Record<string, unknown>);
    if (u) return withBigOrder(u);
  }
  return withBigOrder(botQuoteInner(input));
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
  const { items: rawItemsIn, city: rawCity, sharedTrip: rawShared, puffs: rawPuffs } = input as Record<string, unknown>;
  const puffs = rawPuffs ?? 0;
  if (typeof puffs !== 'number' || !Number.isInteger(puffs) || puffs < 0 || puffs > 20) return fail('puffs tem de ser um inteiro entre 0 e 20');
  const rawItems = rawItemsIn ?? [];
  if (Array.isArray(rawItems) && rawItems.length === 0 && puffs > 0) {
    const city = resolveBotCity(rawCity);
    const puff = puffQuote(puffs, city, false, null);
    const extendedTrip = city !== null && EXTENDED_TRIP_CITIES.has(city);
    return {
      ok: true as const, city, cityKnown: city !== null, extendedTrip, sharedTrip: false,
      lines: [] as { label: string; amount: number | null; tablePrice: number | null; perkApplied: boolean; perkNote?: string; quote: boolean }[],
      subtotal: puff.amount, savings: 0, perkEligible: false, travel: puff.travel ?? 0, total: puff.total ?? puff.amount,
      waterproofingTiers: null, quote: false, handToOwner: city === null || extendedTrip,
      rugPickup: null, rugEstimate: null, rugCombo: null, puff, closeNow: closeNowOffer({ total: puff.total, waterproofing: false, handToOwner: city === null || extendedTrip, rug: null }),
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
  return {
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
    // Discount to close now, only when the client said the price is the problem (owner, 13 Oct 2026).
    closeNow: closeNowOffer({
      total: result.quote ? null : total,
      waterproofing: items.some(isWaterproofing),
      handToOwner: handToOwner && !rugPriced,
      rug: rugPrice?.ok ? { homePrice: rugPrice.homePrice, pickupPrice: rugPrice.pickupPrice } : rugCombo?.ok ? { homePrice: rugCombo.comboPrice, pickupPrice: null } : null,
    }),
  };
}
