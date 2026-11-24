import { sofaPrices, mattressPrices } from '../components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, calcSofaUnitPrice, calcMattressUnitPrice } from '../components/quiz/quizHelpers';
import { chairWaterproofTotal, endIn9Down, endIn9Up, chairCleanTotal, CHAIR_CLEAN_WATERPROOF_FACTOR } from '../constants/chairPricing';
import { chairAntiAcarosTotal } from '../constants/antiAcarosPricing';
import { locationPrices, calculateTravelFee } from '../constants/travel';
import { priceWithPackPerks, type PerkTreatment } from '../constants/packPerks';
export type PackKind = 'sofa' | 'mattress' | 'chairs' | 'rug' | 'carpet';
// Sem desbacterização: é o mesmo tratamento que o anti-ácaros e vendê-los
// como dois confundia (dono, 2026-09-24).
export type PackExtra = 'none' | 'premium' | 'essencial' | 'anti-acaros';
/** `primary: 'waterproofing'` is the waterproofing alone, without the
 * cleaning (sofas and chairs, with `extra` premium or essencial). The
 * configurator never sets it; the WhatsApp bot's quote uses it
 * (`src/lib/botQuote.ts`), so both price through this one engine. */
export interface CustomPackItem { id: string; kind: PackKind; size: string; qty: number; extra: PackExtra; width: string; length: string; primary?: 'cleaning' | 'waterproofing'; unitPrice?: number; seatOnly?: boolean; waterproofingFixed?: { premium: number; essencial: number }; travelIncluded?: boolean; }
export const PACK_KIND_LABEL: Record<PackKind, string> = { sofa: 'Sofá', mattress: 'Colchão', chairs: 'Cadeiras', rug: 'Tapete', carpet: 'Alcatifa' };
export const EXTRA_LABEL: Record<PackExtra, string> = { none: 'Só limpeza', premium: 'Limpeza + impermeabilização Premium (até 10 anos)', essencial: 'Limpeza + impermeabilização Essencial (1 a 2 anos)', 'anti-acaros': 'Limpeza + tratamento anti-ácaros' };
export function makePackItem(kind: PackKind, id: string): CustomPackItem {
  return { id, kind, size: kind === 'mattress' ? 'solteiro' : '1-lugar', qty: 1, extra: 'none', width: '', length: '' };
}
const dimension = (s: string) => Number(s.trim().replace(',', '.'));
export function packItemValid(item: CustomPackItem) {
  if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 100) return false;
  if (item.kind === 'rug' || item.kind === 'carpet') return [item.width, item.length].every(s => Number.isFinite(dimension(s)) && dimension(s) > 0);
  return item.kind === 'chairs' || (item.kind === 'sofa' ? sofaPrices : mattressPrices).some(p => p.id === item.size);
}

/** Waterproofing on top of the cleaning of a 6 or 7 seat sofa, bot only (dono, 22 Nov 2026, Rosângela: compacto 349/289€). */
export const SEAT6_WATERPROOFING_EXTRA = { premium: 220, essencial: 160 } as const;

const PERK_TREATMENT: Record<PackExtra, PerkTreatment> = { none: 'none', premium: 'waterproofing', essencial: 'waterproofing', 'anti-acaros': 'anti-acaros' };

/** Preço de tabela de um artigo, com o tratamento escolhido. As contas por
 * unidade são as mesmas do quiz (calcSofaUnitPrice, calcMattressUnitPrice e
 * os preços das cadeiras), e o anti-ácaros vem de constants/antiAcarosPricing.ts. */
/** `chairsBefore`: chairs to clean in earlier rows of the order (each chair pays its position's price, owner 24 Nov 2026). */
export function customPackLine(item: CustomPackItem, chairsBefore = 0) {
  const options = item.kind === 'sofa' ? sofaPrices : mattressPrices;
  const option = options.find(p => p.id === item.size);
  let amount: number | null = null;
  const size = item.kind === 'rug' || item.kind === 'carpet' ? `${item.width} × ${item.length} m` : item.kind === 'chairs' ? `${item.qty} unidades` : option?.label ?? 'Tamanho a confirmar';
  const waterproofingOnly = item.primary === 'waterproofing' && (item.extra === 'premium' || item.extra === 'essencial') && (item.kind === 'sofa' || item.kind === 'chairs');
  if (waterproofingOnly && item.kind === 'chairs') {
    amount = item.seatOnly ? chairWaterproofTotal(item.qty, item.extra === 'premium' ? 'premium' : 'essencial', true) : (item.extra === 'premium' ? calcChairWaterproofPremium(item.qty) : calcChairWaterproof(item.qty)) ?? null;
    // Impermeabilização sozinha: acaba em 9, para cima (dono, 24 Nov 2026: "Sim, acaba em 9 [...] é na vida real").
    if (amount !== null && !item.seatOnly) amount = endIn9Up(amount);
  } else if (waterproofingOnly && item.waterproofingFixed) {
    // Bot only: a corner sofa is waterproofed as a 5-seat sofa (owner, 20 Nov 2026), fixed price per sofa.
    amount = item.waterproofingFixed[item.extra === 'premium' ? 'premium' : 'essencial'] * item.qty;
  } else if (waterproofingOnly && option) {
    const unit = calcSofaUnitPrice(option, false, 'waterproofing', item.extra === 'premium' ? 'premium' : 'essencial', false);
    amount = unit === null ? null : unit * item.qty;
  } else if (item.kind === 'chairs') {
    // One table for site and bot (owner, 24 Nov 2026): chairPricing.chairCleanTotal; each chair that is also
    // waterproofed costs 5€ less to clean.
    const withWp = item.extra === 'premium' || item.extra === 'essencial';
    amount = chairCleanTotal(item.qty, withWp ? item.qty : 0, chairsBefore);
    if (amount !== null) {
      if (item.extra === 'premium') amount += (item.seatOnly ? chairWaterproofTotal(item.qty, 'premium', true) : calcChairWaterproofPremium(item.qty)) ?? 0;
      if (item.extra === 'essencial') amount += (item.seatOnly ? chairWaterproofTotal(item.qty, 'essencial', true) : calcChairWaterproof(item.qty)) ?? 0;
      if (item.extra === 'anti-acaros') amount += chairAntiAcarosTotal(item.qty) ?? 0;
      if ((item.extra === 'premium' || item.extra === 'essencial') && item.primary !== 'waterproofing') amount = endIn9Down(amount);
    }
  } else if (item.kind === 'sofa' && item.unitPrice && item.primary !== 'waterproofing' && item.extra !== 'anti-acaros') {
    // Bot only: a sofa of 6 or 7 seats, cleaning judged on the photo (botQuote SEAT6_LOOK_PRICES), plus
    // the waterproofing the owner gave for one (18 Nov 2026: +180€ Premium / +120€ Essencial).
    const wp = item.extra === 'premium' || item.extra === 'essencial' ? SEAT6_WATERPROOFING_EXTRA[item.extra] : 0;
    amount = (item.unitPrice + wp) * item.qty;
  } else if (item.kind === 'sofa' && option && item.waterproofingFixed && (item.extra === 'premium' || item.extra === 'essencial')) {
    // Bot only: the sofa's own cleaning plus a fixed waterproofing (corner sofa = 5 seats, owner 20 Nov 2026).
    const unit = calcSofaUnitPrice(option, false, 'cleaning', 'premium', false);
    amount = unit === null ? null : (unit + item.waterproofingFixed[item.extra]) * item.qty;
  } else if (item.kind === 'sofa' && option) {
    const unit = calcSofaUnitPrice(option, item.extra !== 'none', 'cleaning', item.extra === 'premium' ? 'premium' : 'essencial', item.extra === 'anti-acaros');
    amount = unit === null ? null : unit * item.qty;
  } else if (item.kind === 'mattress' && option) {
    const unit = calcMattressUnitPrice(option, item.extra === 'anti-acaros', 'cleaning');
    amount = unit === null ? null : unit * item.qty;
  }
  return {
    label: `${PACK_KIND_LABEL[item.kind]} · ${size}${item.kind !== 'chairs' ? ` · ${item.qty} un.` : ''} · ${waterproofingOnly ? `Só impermeabilização ${item.extra === 'premium' ? 'Premium (até 10 anos)' : 'Essencial (1 a 2 anos)'}` : EXTRA_LABEL[item.extra]}`,
    amount,
    tablePrice: amount,
    quote: amount === null,
  };
}

// A mesma regra do ecrã de extras do quiz (priceWithPackPerks, em
// constants/packPerks.ts): o tipo do primeiro artigo é o serviço principal e
// fica ao preço de tabela em todas as unidades e tamanhos; os artigos de
// outro tipo entram com preço de pack, só a partir de PACK_PERK_MIN_ORDER de
// subtotal de tabela (2026-09-24, pedido explícito do dono). Até 2026-09-26 o
// preço de pack ia para tudo o que viesse depois da primeira linha, incluindo
// um segundo sofá, e o mesmo pedido custava menos aqui do que no quiz.
export function calculateCustomPack(items: CustomPackItem[], city: string) {
  // Cadeiras: qualquer quantidade tem preço (tabela única do dono, 24 Nov 2026; 8+ a 15€ cada).
  // Chair positions are counted waterproofed rows first, then the rest, each in the order given: the same chairs
  // in another order give the same price (24 Nov 2026 audit).
  const chairOrder = items.map((it, n) => n).filter(n => items[n].kind === 'chairs' && items[n].primary !== 'waterproofing')
    .sort((a, b) => Number(!(items[a].extra === 'premium' || items[a].extra === 'essencial')) - Number(!(items[b].extra === 'premium' || items[b].extra === 'essencial'))
      || items[a].extra.localeCompare(items[b].extra) || items[b].qty - items[a].qty || a - b);
  const chairsBeforeOf = new Map<number, number>();
  chairOrder.reduce((seen, n) => (chairsBeforeOf.set(n, seen), seen + items[n].qty), 0);
  const table = items.map((item, n) => {
    if (item.kind !== 'chairs' || item.primary === 'waterproofing') return customPackLine(item);
    return customPackLine(item, chairsBeforeOf.get(n) ?? 0);
  });
  // Waterproofing sent as its own chairs row (the quiz does this): the cleaned chairs it covers clean at half,
  // and cleaning + waterproofing ends in 9 like a combined row (owner, 24 Nov 2026).
  const wpRows = items.map((i, n) => i.kind === 'chairs' && i.primary === 'waterproofing' && (i.extra === 'premium' || i.extra === 'essencial') ? n : -1).filter(n => n >= 0);
  let wpLeft = wpRows.reduce((sum, n) => sum + items[n].qty, 0);
  if (wpLeft > 0) {
    let covered = 0;
    chairOrder.forEach(n => {
      const item = items[n];
      const line = table[n];
      const before = chairsBeforeOf.get(n) ?? 0;
      if (wpLeft <= 0 || item.extra === 'premium' || item.extra === 'essencial' || line.amount == null) return;
      const off = Math.min(wpLeft, item.qty);
      wpLeft -= off;
      covered += off;
      const amount = chairCleanTotal(item.qty, off, before)!;
      table[n] = { ...line, amount, ...('tablePrice' in line && typeof line.tablePrice === 'number' ? { tablePrice: amount } : {}) };
    });
    const wpRow = wpRows[0];
    // Covering cleaned chairs, the waterproofing row is part of one pack: start from its exact price (not the
    // alone-price rounded up to 9), then the pack rounds to the nearest 9 below.
    if (covered > 0) for (const n of wpRows) {
      const it = items[n];
      const exact = chairWaterproofTotal(it.qty, it.extra === 'premium' ? 'premium' : 'essencial', !!it.seatOnly);
      if (exact !== null && table[n].amount != null) table[n] = { ...table[n], amount: exact, ...('tablePrice' in table[n] && typeof table[n].tablePrice === 'number' ? { tablePrice: exact } : {}) };
    }
    const sum = table.filter((_, n) => items[n].kind === 'chairs').reduce((s2, l) => s2 + (l.amount ?? 0), 0);
    const diff = sum - endIn9Down(sum);
    // Waterproofing alone (no cleaned chairs it covers) keeps its exact price.
    if (covered > 0 && diff !== 0 && table[wpRow].amount != null) {
      // tablePrice too: priceWithPackPerks below rebuilds each line's amount from its tablePrice.
      const wpLine = table[wpRow];
      table[wpRow] = { ...wpLine, amount: wpLine.amount! - diff, ...('tablePrice' in wpLine && typeof wpLine.tablePrice === 'number' ? { tablePrice: wpLine.tablePrice - diff } : {}) };
    }
  }
  // Chairs cleaned + waterproofed in several rows: the waterproofing keeps counting positions across the rows and
  // the chairs end in 9 once, like one row (24 Nov 2026 audit: 4 + 2 Premium = 208€, one row of 6 = 199€).
  const wpCleanRows = items.map((i, n) => (i.kind === 'chairs' && i.primary !== 'waterproofing' && !i.seatOnly && (i.extra === 'premium' || i.extra === 'essencial') && table[n].amount != null ? n : -1)).filter(n => n >= 0);
  if (wpCleanRows.length > 1 && wpRows.length === 0) {
    const wpBefore = { premium: 0, essencial: 0 };
    const exact = new Map<number, number>();
    chairOrder.forEach(n => {
      const it = items[n];
      const before = chairsBeforeOf.get(n) ?? 0;
      if (!wpCleanRows.includes(n)) return;
      const t = it.extra === 'premium' ? 'premium' : 'essencial';
      const wp = chairWaterproofTotal(wpBefore[t] + it.qty, t)! - (wpBefore[t] ? chairWaterproofTotal(wpBefore[t], t)! : 0);
      wpBefore[t] += it.qty;
      exact.set(n, chairCleanTotal(it.qty, it.qty, before)! + wp);
    });
    const sum = [...exact.values()].reduce((a, v) => a + v, 0);
    const diff = Math.round((sum - endIn9Down(sum)) * 100) / 100;
    const last = [...exact.keys()].pop()!;
    for (const [n, v] of exact) {
      const amount = Math.round((v - (n === last ? diff : 0)) * 100) / 100;
      table[n] = { ...table[n], amount, ...('tablePrice' in table[n] && typeof table[n].tablePrice === 'number' ? { tablePrice: amount } : {}) };
    }
  }
  const mainKind = items[0]?.kind;
  const perks = priceWithPackPerks(items.map((item, i) => ({
    kind: item.kind, sizeId: item.size, qty: item.qty, tablePrice: table[i].tablePrice, treatment: PERK_TREATMENT[item.extra],
  })), mainKind);
  const lines = table.map((line, i) => ({ ...line, ...perks.lines[i] }));
  const subtotal = Math.round(lines.reduce((sum, line) => sum + (line.amount ?? 0), 0) * 100) / 100;
  const tableSubtotal = perks.tableSubtotal;
  const savings = Math.round((tableSubtotal - subtotal) * 100) / 100;
  const baseTravel = locationPrices[city] ?? null;
  // A isenção de deslocação lê o que a pessoa paga pelos serviços.
  const travel = baseTravel === null ? null : calculateTravelFee(baseTravel, subtotal);
  return {
    lines,
    mainKind,
    subtotal,
    tableSubtotal,
    savings,
    perkEligible: perks.eligible,
    travel,
    total: Math.round((subtotal + (travel ?? 0)) * 100) / 100,
    quote: lines.some(l => l.quote) || travel === null,
    valid: items.length > 0 && items.every(packItemValid) && Boolean(city.trim()),
  };
}
