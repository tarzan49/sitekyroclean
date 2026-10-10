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

/** The served locality as the site writes it ("Vila Nova de Gaia"), or null. */
export function resolveBotCity(input: unknown): string | null {
  return typeof input === 'string' ? CITY_BY_FOLDED.get(fold(input)) ?? null : null;
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
  if (kind === 'sofa' || kind === 'mattress') {
    size = typeof r.size === 'string' ? r.size : '';
    if (!BOT_SIZES[kind].includes(size)) return fail(`items[${index}].size tem de ser um de: ${BOT_SIZES[kind].join(', ')}`);
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
function rugPickupFor(items: CustomPackItem[]) {
  const rugs = items.filter(i => i.kind === 'rug');
  if (!rugs.length) return null;
  const areaM2 = Math.round(rugs.reduce((sum, i) => sum + i.qty * Number(i.width) * Number(i.length), 0) * 100) / 100;
  return { areaM2, minAreaM2: RUG_PICKUP_MIN_AREA_M2, fee: rugPickupFee(areaM2), rule: RUG_PICKUP_FEE_RULE };
}

/**
 * `handToOwner` is true whenever the bot must not close the price itself: an
 * item "sob orçamento" (rugs, carpets, 4+ seats, 10+ chairs), a locality that
 * is not served, or one where availability is confirmed case by case.
 */
export function botQuote(input: unknown) {
  if (!input || typeof input !== 'object') return fail('O pedido tem de ter items e city');
  const { items: rawItems, city: rawCity } = input as Record<string, unknown>;
  if (!Array.isArray(rawItems) || rawItems.length === 0) return fail('items tem de ser uma lista com pelo menos um artigo');
  if (rawItems.length > MAX_ITEMS) return fail(`No máximo ${MAX_ITEMS} artigos por orçamento`);
  const items: CustomPackItem[] = [];
  for (const [i, raw] of rawItems.entries()) {
    const item = toItem(raw, i);
    if ('ok' in item) return item;
    items.push(item);
  }
  const city = resolveBotCity(rawCity);
  const result = calculateCustomPack(items, city ?? '');
  const extendedTrip = city !== null && EXTENDED_TRIP_CITIES.has(city);
  return {
    ok: true as const,
    city,
    cityKnown: city !== null,
    extendedTrip,
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
    travel: result.travel,
    total: result.total,
    quote: result.quote,
    handToOwner: result.quote || city === null || extendedTrip,
    rugPickup: rugPickupFor(items),
  };
}
