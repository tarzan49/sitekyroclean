import { sofaPrices, mattressPrices } from '../components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, calcSofaUnitPrice, calcMattressUnitPrice } from '../components/quiz/quizHelpers';
import { chairAntiAcarosTotal } from '../constants/antiAcarosPricing';
import { locationPrices, calculateTravelFee } from '../constants/travel';
import { priceWithPackPerks, type PerkTreatment } from '../constants/packPerks';
export type PackKind = 'sofa' | 'mattress' | 'chairs' | 'rug' | 'carpet';
// Sem desbacterização: é o mesmo tratamento que o anti-ácaros e vendê-los
// como dois confundia (dono, 2026-09-24).
export type PackExtra = 'none' | 'premium' | 'essencial' | 'anti-acaros';
export interface CustomPackItem { id: string; kind: PackKind; size: string; qty: number; extra: PackExtra; width: string; length: string; }
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

const PERK_TREATMENT: Record<PackExtra, PerkTreatment> = { none: 'none', premium: 'waterproofing', essencial: 'waterproofing', 'anti-acaros': 'anti-acaros' };

/** Preço de tabela de um artigo, com o tratamento escolhido. As contas por
 * unidade são as mesmas do quiz (calcSofaUnitPrice, calcMattressUnitPrice e
 * os preços das cadeiras), e o anti-ácaros vem de constants/antiAcarosPricing.ts. */
export function customPackLine(item: CustomPackItem) {
  const options = item.kind === 'sofa' ? sofaPrices : mattressPrices;
  const option = options.find(p => p.id === item.size);
  let amount: number | null = null;
  const size = item.kind === 'rug' || item.kind === 'carpet' ? `${item.width} × ${item.length} m` : item.kind === 'chairs' ? `${item.qty} unidades` : option?.label ?? 'Tamanho a confirmar';
  if (item.kind === 'chairs') {
    amount = calcChairClean(item.qty);
    if (amount !== null) {
      if (item.extra === 'premium') amount += calcChairWaterproofPremium(item.qty) ?? 0;
      if (item.extra === 'essencial') amount += calcChairWaterproof(item.qty) ?? 0;
      if (item.extra === 'anti-acaros') amount += chairAntiAcarosTotal(item.qty) ?? 0;
    }
  } else if (item.kind === 'sofa' && option) {
    const unit = calcSofaUnitPrice(option, item.extra !== 'none', 'cleaning', item.extra === 'premium' ? 'premium' : 'essencial', item.extra === 'anti-acaros');
    amount = unit === null ? null : unit * item.qty;
  } else if (item.kind === 'mattress' && option) {
    const unit = calcMattressUnitPrice(option, item.extra === 'anti-acaros', 'cleaning');
    amount = unit === null ? null : unit * item.qty;
  }
  return {
    label: `${PACK_KIND_LABEL[item.kind]} · ${size}${item.kind !== 'chairs' ? ` · ${item.qty} un.` : ''} · ${EXTRA_LABEL[item.extra]}`,
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
  const totalChairs = items.filter(i => i.kind === 'chairs').reduce((sum, i) => sum + i.qty, 0);
  const table = items.map(item => {
    const line = customPackLine(item);
    // Dez ou mais cadeiras, mesmo em linhas separadas: sempre sob orçamento.
    return item.kind === 'chairs' && totalChairs >= 10 ? { ...line, amount: null, tablePrice: null, quote: true } : line;
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
