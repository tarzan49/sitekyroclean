import { sofaPrices, mattressPrices } from '../components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, calcSofaUnitPrice, calcMattressUnitPrice } from '../components/quiz/quizHelpers';
import { chairWaterproofTotal, whatsappChairCleanUnit, CHAIR_WATERPROOF_BIG_FROM, WHATSAPP_CHAIR_CLEAN_WITH_WATERPROOF_BIG } from '../constants/chairPricing';
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
export interface CustomPackItem { id: string; kind: PackKind; size: string; qty: number; extra: PackExtra; width: string; length: string; primary?: 'cleaning' | 'waterproofing'; unitPrice?: number; seatOnly?: boolean; waterproofingFixed?: { premium: number; essencial: number }; }
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
export function customPackLine(item: CustomPackItem) {
  const options = item.kind === 'sofa' ? sofaPrices : mattressPrices;
  const option = options.find(p => p.id === item.size);
  let amount: number | null = null;
  const size = item.kind === 'rug' || item.kind === 'carpet' ? `${item.width} × ${item.length} m` : item.kind === 'chairs' ? `${item.qty} unidades` : option?.label ?? 'Tamanho a confirmar';
  const waterproofingOnly = item.primary === 'waterproofing' && (item.extra === 'premium' || item.extra === 'essencial') && (item.kind === 'sofa' || item.kind === 'chairs');
  if (waterproofingOnly && item.kind === 'chairs') {
    amount = item.seatOnly ? chairWaterproofTotal(item.qty, item.extra === 'premium' ? 'premium' : 'essencial', true) : (item.extra === 'premium' ? calcChairWaterproofPremium(item.qty) : calcChairWaterproof(item.qty)) ?? null;
  } else if (waterproofingOnly && item.waterproofingFixed) {
    // Bot only: a corner sofa is waterproofed as a 5-seat sofa (owner, 20 Nov 2026), fixed price per sofa.
    amount = item.waterproofingFixed[item.extra === 'premium' ? 'premium' : 'essencial'] * item.qty;
  } else if (waterproofingOnly && option) {
    const unit = calcSofaUnitPrice(option, false, 'waterproofing', item.extra === 'premium' ? 'premium' : 'essencial', false);
    amount = unit === null ? null : unit * item.qty;
  } else if (item.kind === 'chairs') {
    // Bot only: `unitPrice` = the WhatsApp price per chair (chairPricing whatsappChairCleanUnit, owner 12 Nov 2026).
    // 9 or more chairs cleaned and waterproofed (bot): the cleaning drops to 12,50€ each (owner, 19 Nov 2026).
    const bigPack = !!item.unitPrice && !item.seatOnly && (item.extra === 'premium' || item.extra === 'essencial') && item.qty >= CHAIR_WATERPROOF_BIG_FROM;
    // The pack total never falls below that of 8 chairs at the 8-chair prices (owner's rule: one more never costs less).
    const eight = CHAIR_WATERPROOF_BIG_FROM - 1;
    const eightPack = bigPack ? (whatsappChairCleanUnit(eight) ?? 0) * eight + (chairWaterproofTotal(eight, item.extra === 'premium' ? 'premium' : 'essencial') ?? 0) : 0;
    const bigWp = bigPack ? (chairWaterproofTotal(item.qty, item.extra === 'premium' ? 'premium' : 'essencial') ?? 0) : 0;
    amount = bigPack ? Math.max(WHATSAPP_CHAIR_CLEAN_WITH_WATERPROOF_BIG * item.qty + bigWp, eightPack) - bigWp : item.unitPrice ? item.unitPrice * item.qty : calcChairClean(item.qty);
    if (amount !== null) {
      if (item.extra === 'premium') amount += (item.seatOnly ? chairWaterproofTotal(item.qty, 'premium', true) : calcChairWaterproofPremium(item.qty)) ?? 0;
      if (item.extra === 'essencial') amount += (item.seatOnly ? chairWaterproofTotal(item.qty, 'essencial', true) : calcChairWaterproof(item.qty)) ?? 0;
      if (item.extra === 'anti-acaros') amount += chairAntiAcarosTotal(item.qty) ?? 0;
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
  // Dez ou mais cadeiras a LIMPAR, mesmo em linhas separadas: sob orçamento.
  // A impermeabilização sem limpeza tem preço por cadeira com qualquer
  // quantidade (dono, 2026-10-09: 10 cadeiras a 25€ Premium / 18€ Essencial),
  // como no quiz, por isso não conta nem fica sob orçamento.
  const waterproofingOnly = (item: CustomPackItem) => item.primary === 'waterproofing' && (item.extra === 'premium' || item.extra === 'essencial');
  const chairsToClean = items.filter(i => i.kind === 'chairs' && !waterproofingOnly(i)).reduce((sum, i) => sum + i.qty, 0);
  const table = items.map(item => {
    const line = customPackLine(item);
    // The WhatsApp bot prices any number of chairs (unitPrice, owner 12 Nov 2026); the site keeps 10+ sob orçamento.
    return item.kind === 'chairs' && !waterproofingOnly(item) && !item.unitPrice && chairsToClean >= 10 ? { ...line, amount: null, tablePrice: null, quote: true } : line;
  });
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
