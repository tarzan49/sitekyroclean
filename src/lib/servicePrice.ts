// Preço do serviço e deslocação à parte (dono, 25 Nov 2026): em todo o site o número que se lê é o do serviço; a
// deslocação vem à parte, discreta, só junto do total. O total é sempre o do motor do bot (botQuote), nunca muda:
// aqui só se separa (serviço = total − deslocação).
import { botQuote } from './botQuote';
import { formatEuro } from '../data/enginePrices';

export type EngineItem = Record<string, unknown> & { kind?: unknown; qty?: unknown; treatment?: unknown };
type Gift = { piece: string; treatment: string; normal: number };
interface Raw {
  ok: boolean; quote?: boolean; total?: number | null; travel?: number | null;
  rugEstimate?: { ok: boolean; homePrice?: number; travelFee?: number } | null;
  rugCombo?: { ok: boolean; comboPrice?: number } | null;
  oneTravel?: { service: number; travel: number } | null;
  smallOrderSurcharge?: { amount: number } | null;
  visitGifts?: { gifts: Gift[]; usual: number } | null;
  separatePrice?: { separate?: number } | null; mattressMitePack?: { separate?: number } | null; chairsWas?: number | null;
}
export interface PriceSplit {
  /** Total do motor, o que o cliente paga. */
  total: number;
  /** total − serviço (com o acréscimo de serviço pequeno longe, que é pela distância). */
  travel: number;
  /** O número que o site mostra. Uma peça: total − deslocação do motor. Várias peças: o `oneTravel` do motor
   *  (o serviço de cada peça sozinha, somado e acabado em 9 para cima, e UMA deslocação; dono, 25 Nov 2026). */
  service: number;
  /** Riscado do motor (o pedido em separado) menos a deslocação deste; null sem poupança de 5€ ou mais. */
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
    const at = left.findIndex(g => g.piece === i.kind && (g.treatment === 'tratamento-pele' ? i.leather === true : g.treatment === 'anti-odor' ? i.odor === true : i.treatment === 'clean+anti-acaros'));
    if (at < 0) return i;
    const [g] = left.splice(at, 1);
    const plain: EngineItem = { ...i };
    if (g.treatment === 'tratamento-pele') delete plain.leather; else if (g.treatment === 'anti-odor') delete plain.odor; else plain.treatment = 'clean';
    return plain;
  });
}
/** As peças de um pedido (sem o que o motor oferece) e o serviço de cada uma sozinha; null = uma peça só ou por calcular. */
function visit(city: string, items: EngineItem[], x: { r: Raw; total: number }): { plain: EngineItem[]; nets: number[]; service: number } | null {
  // Sem `oneTravel` é uma peça só (duas linhas de cadeiras são um conjunto).
  const one = x.r.oneTravel;
  if (!one) return null;
  const plain = withoutGifted(items, x.r.visitGifts?.gifts ?? []);
  const nets = plain.map(i => alone(city, i)?.net ?? null);
  if (!nets.every((v): v is number => v !== null)) return null;
  return { plain, nets, service: one.service };
}

/** Total do motor separado em serviço e deslocação; null sob orçamento ou em localidade que o motor não conhece. */
export function priceSplit(city: string, items: EngineItem[]): PriceSplit | null {
  const x = raw(city, items);
  if (!x) return null;
  const v = visit(city, items, x);
  const service = v ? v.service : cents(x.total - x.travel), travel = cents(x.total - service);
  // O riscado é o do motor: o mesmo pedido em separado, com as deslocações de cada visita e as ofertas (dono, 25 Nov 2026).
  // Com deslocação a pagar nos dois, tira-se ao riscado a mesma que se tira ao total: a poupança mostrada é a verdadeira.
  const was = x.r.visitGifts?.usual ?? x.r.separatePrice?.separate ?? x.r.mattressMitePack?.separate ?? x.r.chairsWas ?? null;
  const struck = was !== null && was - x.total >= 5 ? cents(was - travel) : null;
  return { total: x.total, travel, service, struck };
}

/** As linhas de um pedido, somadas = serviço: cada peça ao seu preço de serviço, que nunca sobe quando se junta outra;
 *  o arredondamento ao 9 fica na última. */
export function serviceLines(city: string, items: EngineItem[]): number[] | null {
  const x = raw(city, items), split = priceSplit(city, items);
  if (!x || !split) return null;
  const v = visit(city, items, x);
  if (!v && items.length === 1) return [split.service];
  const nets = v ? v.nets : items.map(i => alone(city, i)?.net ?? null);
  if (!nets.every((n): n is number => n !== null)) return null;
  const lines = nets.slice();
  let gap = cents(split.service - lines.reduce((s, n) => s + n, 0));
  if (gap > 0) lines[lines.length - 1] = cents(lines[lines.length - 1] + gap);
  while (gap < 0) {
    const k = lines.indexOf(Math.max(...lines)), cut = Math.min(-gap, lines[k]);
    if (cut <= 0) break;
    lines[k] = cents(lines[k] - cut); gap = cents(gap + cut);
  }
  return lines;
}

/** O texto discreto ao lado de um total: "+ 10€ deslocação", ou "deslocação grátis". */
export const travelLabel = (s: Pick<PriceSplit, 'travel'>): string =>
  s.travel > 0 ? `+ ${formatEuro(s.travel)} deslocação` : 'deslocação grátis';
/** Para as mensagens: "79€ + 10€ de deslocação, total 89€". */
export const splitText = (s: PriceSplit): string =>
  s.travel > 0 ? `${formatEuro(s.service)} + ${formatEuro(s.travel)} de deslocação, total ${formatEuro(s.total)}` : `${formatEuro(s.total)}, ${travelLabel(s)}`;
