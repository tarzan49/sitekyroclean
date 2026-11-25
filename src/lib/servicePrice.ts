// Preço do serviço e deslocação à parte (dono, 25 Nov 2026): em todo o site o número que se lê é o do serviço; a
// deslocação vem à parte, discreta, só junto do total. O total é sempre o do motor do bot (botQuote), nunca muda:
// aqui só se separa (serviço = total − deslocação) e se põem os riscados na mesma base (serviço contra serviço).
import { botQuote, MATTRESS_MITES_SEPARATE } from './botQuote';
import { chairPackWas } from '../constants/chairPricing';
import { SOFA_ANTI_ACAROS_PRICE } from '../constants/antiAcarosPricing';
import { formatEuro } from '../data/enginePrices';

export type EngineItem = Record<string, unknown> & { kind?: unknown; qty?: unknown; treatment?: unknown };
type Gift = { piece: string; treatment: string; normal: number };
interface Raw {
  ok: boolean; quote?: boolean; total?: number | null; travel?: number | null;
  rugEstimate?: { ok: boolean; homePrice?: number; travelFee?: number } | null;
  rugCombo?: { ok: boolean; comboPrice?: number } | null;
  smallOrderSurcharge?: { amount: number } | null;
  visitGifts?: { gifts: Gift[]; usual: number } | null;
  separatePrice?: { separate?: number } | null; mattressMitePack?: { separate?: number } | null; chairsWas?: number | null;
}
export interface PriceSplit {
  /** Total do motor, o que o cliente paga. */
  total: number;
  /** Deslocação desse total (com o acréscimo de serviço pequeno longe, que é pela distância). */
  travel: number;
  /** total − deslocação: o número que o site mostra. */
  service: number;
  /** Várias peças: o motor soma cada peça com a sua deslocação e não a cobra à parte. Aqui a deslocação não é "grátis". */
  included: boolean;
  /** Riscado na base do serviço, só quando o motor tem um; null sem poupança de 5€ ou mais. */
  struck: number | null;
}

const cents = (n: number) => Math.round(n * 100) / 100;
const up9 = (n: number) => { const v = Math.ceil(n - 1e-9); return v % 10 === 9 ? v : Math.floor(v / 10) * 10 + 9; };
const isRug = (i: EngineItem) => i.kind === 'rug' || i.kind === 'carpet';
const qtyOf = (i: EngineItem) => Number(i.qty) || 1;
/** Sofás e colchões contam-se um a um; cadeiras, tapetes e alcatifas são um conjunto (escalões e m²). */
const byUnit = (i: EngineItem) => i.kind === 'sofa' || i.kind === 'mattress';

const cache = new Map<string, Raw>();
function quote(city: string, items: EngineItem[]): Raw {
  const key = `${city}|${JSON.stringify(items)}`;
  let r = cache.get(key);
  if (!r) { if (cache.size > 4000) cache.clear(); r = botQuote({ city, items }) as unknown as Raw; cache.set(key, r); }
  return r;
}
function raw(city: string, items: EngineItem[]): { r: Raw; total: number; travel: number } | null {
  if (!items.length || !city) return null;
  const r = quote(city, items);
  if (!r.ok) return null;
  const rugs = items.filter(isRug).length;
  const total = rugs === items.length ? (r.rugEstimate?.ok ? r.rugEstimate.homePrice : null)
    : rugs ? (r.rugCombo?.ok ? r.rugCombo.comboPrice : null)
      : r.quote ? null : r.total;
  if (typeof total !== 'number') return null;
  const base = rugs === items.length ? r.rugEstimate?.travelFee ?? r.travel : r.travel;
  if (typeof base !== 'number') return null;
  const travel = cents(base + (rugs ? 0 : r.smallOrderSurcharge?.amount ?? 0));
  // Tapete minúsculo: o total mínimo do motor é menor do que a deslocação; não se separa.
  return { r, total, travel: travel < total ? travel : 0 };
}
/** Uma linha pedida sozinha, sem deslocação, e quanto de deslocação leva sozinha (sofás e colchões: cada um). */
function alone(city: string, item: EngineItem): { net: number; travel: number } | null {
  const n = byUnit(item) ? qtyOf(item) : 1;
  const x = raw(city, [n > 1 ? { ...item, qty: 1 } : item]);
  return x && { net: cents((x.total - x.travel) * n), travel: cents(x.travel * n) };
}
/** Um tratamento pedido que o motor oferece (linha própria "Oferecido"): a peça fica só com a limpeza, para não contar duas vezes. */
function withoutGifted(items: EngineItem[], gifts: Gift[]): EngineItem[] {
  const left = gifts.slice();
  return items.map(i => {
    const at = left.findIndex(g => g.piece === i.kind && (g.treatment === 'anti-odor' ? i.odor === true : i.treatment === 'clean+anti-acaros'));
    if (at < 0) return i;
    const [g] = left.splice(at, 1);
    const plain: EngineItem = { ...i };
    if (g.treatment === 'anti-odor') delete plain.odor; else plain.treatment = 'clean';
    return plain;
  });
}
/** A linha com cada serviço em separado (limpeza, impermeabilização, anti-ácaros), sem deslocação. */
function separate(city: string, i: EngineItem): number | null {
  const a = alone(city, i);
  if (!a) return null;
  const n = qtyOf(i), t = String(i.treatment ?? 'clean');
  const tier = t === 'clean+premium' ? 'premium' : t === 'clean+essencial' ? 'essencial' : null;
  if (tier && (i.kind === 'sofa' || i.kind === 'chairs')) {
    const clean = alone(city, { ...i, treatment: 'clean' }), wp = alone(city, { ...i, treatment: tier });
    if (!clean || !wp) return a.net;
    if (i.kind === 'chairs') return n >= 4 ? Math.max(a.net, Math.min(up9(clean.net + wp.net), chairPackWas(n, tier))) : a.net;
    const units = byUnit(i) ? n : 1;
    return Math.max(a.net, up9((clean.net + wp.net) / units) * units);
  }
  if (t === 'clean+anti-acaros' && (i.kind === 'mattress' || i.kind === 'sofa')) {
    const clean = alone(city, { ...i, treatment: 'clean' });
    const mites = i.kind === 'mattress' ? MATTRESS_MITES_SEPARATE : SOFA_ANTI_ACAROS_PRICE[String(i.size)];
    if (clean && typeof mites === 'number') return Math.max(a.net, cents(clean.net + mites * n));
  }
  return a.net;
}
/** O riscado de uma linha, na base do serviço (para os extras e as opções). */
export const separateService = separate;

/** Total do motor separado em serviço e deslocação; null sob orçamento ou em localidade que o motor não conhece. */
export function priceSplit(city: string, items: EngineItem[]): PriceSplit | null {
  const x = raw(city, items);
  if (!x) return null;
  const service = cents(x.total - x.travel);
  const gifts = x.r.visitGifts?.gifts ?? [];
  const plain = withoutGifted(items, gifts);
  const nets = plain.map(i => alone(city, i));
  const gap = nets.every(n => n) ? cents(service - nets.reduce((s, n) => s + n!.net, 0)) : 0;
  const pieces = items.length > 1 || items.some(i => byUnit(i) && qtyOf(i) > 1);
  const engineWas = x.r.visitGifts?.usual ?? x.r.separatePrice?.separate ?? x.r.mattressMitePack?.separate ?? x.r.chairsWas ?? null;
  let struck: number | null = null;
  if (engineWas !== null && engineWas > x.total) {
    const each = plain.map(i => separate(city, i));
    if (each.every((v): v is number => v !== null)) {
      const sum = each.reduce((s, v) => s + v, 0) + gifts.reduce((s, g) => s + g.normal, 0);
      // Nunca uma poupança maior do que a do motor (que ainda conta as deslocações em separado).
      const was = Math.min(service + engineWas - x.total, items.length > 1 || gifts.length ? up9(sum) : sum);
      if (was - service >= 5) struck = cents(was);
    }
  }
  return { total: x.total, travel: x.travel, service, included: pieces && x.travel === 0 && gap > 9 && nets.some(n => n!.travel > 0), struck };
}

/** As linhas de uma visita, somadas = serviço. Cada peça ao seu preço de serviço; o que o motor soma a mais nas visitas
 *  de várias peças (a deslocação de cada uma, o arredondamento ao 9) entra nas peças que a pagam, da última para a primeira. */
export function serviceLines(city: string, items: EngineItem[]): number[] | null {
  const split = priceSplit(city, items);
  if (!split) return null;
  const plain = withoutGifted(items, quote(city, items).visitGifts?.gifts ?? []);
  const nets = plain.map(i => alone(city, i));
  if (!nets.every(n => n)) return null;
  const lines = nets.map(n => n!.net);
  let gap = cents(split.service - lines.reduce((s, v) => s + v, 0));
  for (let k = lines.length - 1; k >= 0 && gap > 0; k--) { const add = Math.min(nets[k]!.travel, gap); lines[k] = cents(lines[k] + add); gap = cents(gap - add); }
  if (gap > 0) lines[lines.length - 1] = cents(lines[lines.length - 1] + gap);
  while (gap < 0) {
    const k = lines.indexOf(Math.max(...lines)), cut = Math.min(-gap, lines[k]);
    if (cut <= 0) break;
    lines[k] = cents(lines[k] - cut); gap = cents(gap + cut);
  }
  return lines;
}

/** O texto discreto ao lado de um total: "+ 10€ deslocação", "deslocação grátis" ou "deslocação incluída" (várias peças). */
export const travelLabel = (s: Pick<PriceSplit, 'travel' | 'included'>): string =>
  s.travel > 0 ? `+ ${formatEuro(s.travel)} deslocação` : s.included ? 'deslocação incluída' : 'deslocação grátis';
/** Para as mensagens: "79€ + 10€ de deslocação, total 89€". */
export const splitText = (s: PriceSplit): string =>
  s.travel > 0 ? `${formatEuro(s.service)} + ${formatEuro(s.travel)} de deslocação, total ${formatEuro(s.total)}` : `${formatEuro(s.total)}, ${travelLabel(s)}`;
