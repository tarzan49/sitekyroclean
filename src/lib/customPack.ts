import { SOFA_ANTI_ACAROS_PRICE } from './priceWidgetCalc';
import { sofaPrices, mattressPrices, sofaChaisePrice } from '../components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, calcPackPricing } from '../components/quiz/quizHelpers';
import { locationPrices, calculateTravelFee } from '../constants/travel';
import { PACK_PERK_MATTRESS_OFF, PACK_PERK_MIN_ORDER, perkChairsFree, perkChairsPrice, perkMattressPrice, perkSofaPrice } from '../constants/packPerks';
export type PackKind = 'sofa' | 'mattress' | 'chairs' | 'rug' | 'carpet';
// Sem desbacterização: é o mesmo tratamento que o anti-ácaros e vendê-los
// como dois confundia (dono, 2026-09-24).
export type PackExtra = 'none' | 'premium' | 'essencial' | 'anti-acaros';
export interface CustomPackItem { id: string; kind: PackKind; size: string; qty: number; chaise: boolean; extra: PackExtra; width: string; length: string; }
export const PACK_KIND_LABEL: Record<PackKind, string> = { sofa: 'Sofá', mattress: 'Colchão', chairs: 'Cadeiras', rug: 'Tapete', carpet: 'Alcatifa' };
export const EXTRA_LABEL: Record<PackExtra, string> = { none: 'Só limpeza', premium: 'Limpeza + impermeabilização Premium (até 10 anos)', essencial: 'Limpeza + impermeabilização Essencial (1 a 2 anos)', 'anti-acaros': 'Limpeza + tratamento anti-ácaros' };
export function makePackItem(kind: PackKind, id: string): CustomPackItem {
  return { id, kind, size: kind === 'mattress' ? 'solteiro' : '1-lugar', qty: 1, chaise: false, extra: 'none', width: '', length: '' };
}
const dimension = (s: string) => Number(s.trim().replace(',', '.'));
export function packItemValid(item: CustomPackItem) {
  if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 100) return false;
  if (item.kind === 'rug' || item.kind === 'carpet') return [item.width, item.length].every(s => Number.isFinite(dimension(s)) && dimension(s) > 0);
  return item.kind === 'chairs' || (item.kind === 'sofa' ? sofaPrices : mattressPrices).some(p => p.id === item.size);
}
// `perk` = este artigo foi acrescentado a outro na mesma visita, e por isso
// entra com preço de pack. A regalia é sobre a limpeza, tal como no upsell do
// quiz: um artigo acrescentado com tratamento mantém o preço de tabela.
export function customPackLine(item: CustomPackItem, perk = false) {
  const options = item.kind === 'sofa' ? sofaPrices : mattressPrices;
  const option = options.find(p => p.id === item.size);
  let amount: number | null = null;
  let extraQuote = false;
  const size = item.kind === 'rug' || item.kind === 'carpet' ? `${item.width} × ${item.length} m` : item.kind === 'chairs' ? `${item.qty} unidades` : option?.label ?? 'Tamanho a confirmar';
  if (item.kind === 'chairs') {
    amount = calcChairClean(item.qty);
    if (amount !== null) {
      if (item.extra === 'premium') amount += calcChairWaterproofPremium(item.qty) ?? 0;
      if (item.extra === 'essencial') amount += calcChairWaterproof(item.qty) ?? 0;
      if (item.extra === 'anti-acaros') amount += item.qty * 5;
    }
  } else if ((item.kind === 'sofa' || item.kind === 'mattress') && option) {
    const packOn = item.extra === 'premium' || item.extra === 'essencial' || (item.kind === 'mattress' && item.extra === 'anti-acaros');
    const price = calcPackPricing(option, packOn, false, null, item.extra === 'premium' ? 'premium' : 'essencial');
    amount = packOn ? price.packPrice : price.basePrice;
    if (item.kind === 'sofa' && item.extra === 'anti-acaros' && amount !== null) {
      const extra = SOFA_ANTI_ACAROS_PRICE[item.size];
      if (extra === undefined) extraQuote = true; else amount += extra;
    }
    if (amount !== null) {
      if (item.kind === 'sofa' && item.chaise) amount += sofaChaisePrice.cleaning + (packOn ? sofaChaisePrice.waterproofing : 0);
      amount *= item.qty;
    }
  }
  const tablePrice = amount;
  if (perk && amount !== null) {
    if (item.extra === 'none') {
      if (item.kind === 'chairs') amount = perkChairsPrice(amount, item.qty);
      else if (option && typeof option.cleaningPrice === 'number') {
        const unit = item.kind === 'sofa'
          ? perkSofaPrice(item.size, option.cleaningPrice) + (item.chaise ? sofaChaisePrice.cleaning : 0)
          : perkMattressPrice(option.cleaningPrice);
        amount = Math.round(unit * item.qty * 100) / 100;
      }
    } else if (item.kind === 'mattress' && item.extra === 'anti-acaros' && tablePrice !== null) {
      // Colchão acrescentado com anti-ácaros: mantém o desconto de pack
      // sobre o preço com tratamento (pedido do dono, 2026-09-24 — exceção à
      // regra geral de PACK_PERK_LIMIT, que só continua a valer para
      // impermeabilização e para o anti-ácaros de sofá/cadeiras).
      amount = tablePrice - PACK_PERK_MATTRESS_OFF * item.qty;
    }
  }
  const perkApplied = tablePrice !== null && amount !== null && amount < tablePrice;
  const perkNote = !perkApplied ? null
    : item.kind === 'chairs' ? `${perkChairsFree(item.qty)} oferecida${perkChairsFree(item.qty) > 1 ? 's' : ''}`
    : 'preço de pack';
  return {
    label: `${PACK_KIND_LABEL[item.kind]} · ${size}${item.kind !== 'chairs' ? ` · ${item.qty} un.` : ''}${item.chaise && item.kind === 'sofa' ? ' · com chaise longue' : ''} · ${EXTRA_LABEL[item.extra]}`,
    amount,
    tablePrice,
    perkApplied,
    perkNote,
    quote: amount === null || extraQuote,
  };
}

// O primeiro artigo paga tabela; os seguintes entram com preço de pack — mas
// só a partir de PACK_PERK_MIN_ORDER de subtotal de tabela (2026-09-24,
// pedido explícito do dono): sem este mínimo, um pedido pequeno "ganhava"
// vantagem sobre a mesma pessoa a pedir um orçamento normal, só por ter
// passado pelo configurador. Abaixo do mínimo, todos os artigos ficam ao
// preço de tabela. É a mesma ordem do quiz (serviço principal + extras do
// ecrã de upsell), e é o que a página promete.
export function calculateCustomPack(items: CustomPackItem[], city: string) {
  const totalChairs = items.filter(i => i.kind === 'chairs').reduce((sum, i) => sum + i.qty, 0);
  // tablePrice não depende do parâmetro `perk` (é calculado antes desse
  // ramo em customPackLine), por isso dá para somar a tabela toda sem
  // decidir já quem tem direito ao preço reduzido.
  const tablePricedTotal = items.reduce((sum, item) => sum + (customPackLine(item).tablePrice ?? 0), 0);
  const perkEligible = tablePricedTotal >= PACK_PERK_MIN_ORDER;
  const lines = items.map((item, index) => {
    const line = customPackLine(item, perkEligible && index > 0);
    return item.kind === 'chairs' && totalChairs >= 10 ? { ...line, amount: null, tablePrice: null, perkApplied: false, perkNote: null, quote: true } : line;
  });
  const subtotal = lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
  const tableSubtotal = lines.reduce((sum, line) => sum + (line.tablePrice ?? 0), 0);
  const savings = Math.round((tableSubtotal - subtotal) * 100) / 100;
  const baseTravel = locationPrices[city] ?? null;
  // A isenção de deslocação lê o que a pessoa paga pelos serviços.
  const travel = baseTravel === null ? null : calculateTravelFee(baseTravel, subtotal);
  return {
    lines,
    subtotal,
    tableSubtotal,
    savings,
    perkEligible,
    travel,
    total: Math.round((subtotal + (travel ?? 0)) * 100) / 100,
    quote: lines.some(l => l.quote) || travel === null,
    valid: items.length > 0 && items.every(packItemValid) && Boolean(city.trim()),
  };
}
