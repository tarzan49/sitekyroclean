import { SOFA_ANTI_ACAROS_PRICE, PACK_DISCOUNT_MIN_TOTAL, PACK_DISCOUNT_MIN_UPSELL_ITEM } from './priceWidgetCalc';
import { sofaPrices, mattressPrices, sofaChaisePrice } from '../components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, calcPackPricing } from '../components/quiz/quizHelpers';
import { locationPrices } from '../constants/travel';
export type PackKind = 'sofa' | 'mattress' | 'chairs' | 'rug' | 'carpet';
export type PackExtra = 'none' | 'premium' | 'essencial' | 'anti-acaros' | 'desbacterizacao';
export interface CustomPackItem { id: string; kind: PackKind; size: string; qty: number; chaise: boolean; extra: PackExtra; width: string; length: string; }
export const PACK_KIND_LABEL: Record<PackKind, string> = { sofa: 'Sofá', mattress: 'Colchão', chairs: 'Cadeiras', rug: 'Tapete', carpet: 'Alcatifa' };
export const EXTRA_LABEL: Record<PackExtra, string> = { none: 'Só limpeza', premium: 'Limpeza + impermeabilização Premium (até 10 anos)', essencial: 'Limpeza + impermeabilização Essencial (1 a 2 anos)', 'anti-acaros': 'Limpeza + tratamento anti-ácaros', desbacterizacao: 'Limpeza + desbacterização (extra sob orçamento)' };
export function makePackItem(kind: PackKind, id: string): CustomPackItem {
  return { id, kind, size: kind === 'mattress' ? 'solteiro' : '1-lugar', qty: 1, chaise: false, extra: 'none', width: '', length: '' };
}
const dimension = (s: string) => Number(s.trim().replace(',', '.'));
export function packItemValid(item: CustomPackItem) {
  if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 100) return false;
  if (item.kind === 'rug' || item.kind === 'carpet') return [item.width, item.length].every(s => Number.isFinite(dimension(s)) && dimension(s) > 0);
  return item.kind === 'chairs' || (item.kind === 'sofa' ? sofaPrices : mattressPrices).some(p => p.id === item.size);
}
export function customPackLine(item: CustomPackItem) {
  const options = item.kind === 'sofa' ? sofaPrices : mattressPrices;
  const option = options.find(p => p.id === item.size);
  let amount: number | null = null;
  let extraQuote = item.extra === 'desbacterizacao';
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
  return { label: `${PACK_KIND_LABEL[item.kind]} · ${size}${item.kind !== 'chairs' ? ` · ${item.qty} un.` : ''}${item.chaise && item.kind === 'sofa' ? ' · com chaise longue' : ''} · ${EXTRA_LABEL[item.extra]}`, amount, quote: amount === null || extraQuote };
}
export function calculateCustomPack(items: CustomPackItem[], city: string) {
  const totalChairs = items.filter(i => i.kind === 'chairs').reduce((sum, i) => sum + i.qty, 0);
  const lines = items.map(item => item.kind === 'chairs' && totalChairs >= 10 ? { ...customPackLine(item), amount: null, quote: true } : customPackLine(item));
  const subtotal = lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
  const articleCount = items.reduce((sum, item, i) => sum + (lines[i].amount === null || item.kind === 'chairs' ? 0 : item.qty), 0) + (totalChairs > 0 && totalChairs < 10 ? 1 : 0);
  // Existing live Pack Família threshold. A new configurator does not authorise changing the promotion.
  const discountActive = articleCount >= 2 && subtotal > PACK_DISCOUNT_MIN_TOTAL && lines.some(l => (l.amount ?? 0) >= PACK_DISCOUNT_MIN_UPSELL_ITEM);
  const servicesTotal = discountActive ? Math.round(subtotal * 0.9) : subtotal;
  const travel = locationPrices[city] ?? null;
  return { lines, subtotal, discountActive, discount: subtotal - servicesTotal, servicesTotal, travel, total: servicesTotal + (travel ?? 0), quote: lines.some(l => l.quote) || travel === null, valid: items.length > 0 && items.every(packItemValid) && Boolean(city.trim()) };
}
