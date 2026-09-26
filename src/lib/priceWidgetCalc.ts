import { calculateTravelFee } from '../constants/travel';
import { carpetAllItemsValid } from '@/components/quiz/quizHelpers';
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import type { UpsellItemConfig, CarpetItem } from "@/components/quiz/QuizTypes";
import { sofaPrices } from "@/components/quiz/QuizTypes";
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium } from "@/components/quiz/quizHelpers";

export type WidgetTier = 'essencial' | 'premium';

// O anti-ácaros não se escolhe no widget (decide-se no ecrã de tratamento do
// quiz, a seguir ao "Continuar"). O preço do sofá vive em
// constants/antiAcarosPricing.ts e fica reexportado aqui para quem já o lia
// deste módulo.
export { SOFA_ANTI_ACAROS_PRICE } from '../constants/antiAcarosPricing';

// Impermeabilização de cadeiras no widget de impermeabilização: os mesmos
// preços de calcChairWaterproof(Premium) do quiz.
export function calcChairAddonWaterproofTotal(qty: number, tier: WidgetTier): number | null {
  return tier === 'premium' ? calcChairWaterproofPremium(qty) : calcChairWaterproof(qty);
}

function parseRowPrice(price: string): number {
  if (price.includes('/m²') || price.toLowerCase().includes('orçamento')) return 0;
  const m = price.replace('+', '').match(/^(\d+(?:\.\d+)?)€/);
  return m ? parseFloat(m[1]) : 0;
}

export function calcChairBracket(qty: number, waterproof: boolean, tier: WidgetTier = 'essencial'): number | null {
  if (qty <= 0) return 0;
  return waterproof ? calcChairAddonWaterproofTotal(qty, tier) : calcChairClean(qty);
}

export function widgetWaterproofPrice(cfg: PriceRowQuizConfig, tier: WidgetTier): number | null {
  if (cfg.service === 'chairs') return calcChairAddonWaterproofTotal(1, tier);
  const option = sofaPrices.find(p => p.id === cfg.sofaSizeId);
  const price = tier === 'premium' ? option?.waterproofingPremiumPrice : option?.waterproofingPrice;
  return typeof price === 'number' ? price : null;
}

export function calcWidgetTotal(
  serviceSlug: string,
  rowQuantities: Record<number, number>,
  addonTier: WidgetTier = 'essencial',
): number {
  const rows = PRICE_TABLE[serviceSlug] ?? [];
  const configs = PRICE_TABLE_QUIZ_CONFIG[serviceSlug] ?? [];
  const isWaterproof = serviceSlug === 'impermeabilizacao';
  let total = 0;

  rows.forEach((row, i) => {
    const qty = rowQuantities[i] ?? 0;
    if (qty <= 0) return;
    const cfg = configs[i];
    if (!cfg) return;
    if (cfg.service === 'chairs') {
      const c = calcChairBracket(qty, isWaterproof, addonTier);
      if (c !== null) total += c;
      return;
    }
    if (cfg.service === 'carpet') return; // sempre sob orçamento (tapete e alcatifa)
    const unitPrice = isWaterproof ? (widgetWaterproofPrice(cfg, addonTier) ?? 0) : parseRowPrice(row.price);
    if (unitPrice > 0) total += unitPrice * qty;
  });

  return Math.round(total * 10) / 10;
}

export interface WidgetPricing {
  serviceTotal: number;
  travelFee: number;
  grandTotal: number;
}

export function calcWidgetPricing(serviceTotal: number, travelFee: number): WidgetPricing {
  const finalTravelFee = calculateTravelFee(travelFee, serviceTotal);
  return { serviceTotal, travelFee: finalTravelFee, grandTotal: serviceTotal + finalTravelFee };
}

/**
 * Constrói a config do quiz a partir do estado do widget.
 * Funciona genericamente para qualquer serviço — não hardcoded por slug.
 */
export function buildWidgetQuizConfig(
  serviceSlug: string,
  rowQuantities: Record<number, number>,
  addonTier: WidgetTier = 'essencial',
  carpetItemsByRow: Record<number, CarpetItem[]> = {}
): PriceRowQuizConfig | null {
  const configs = PRICE_TABLE_QUIZ_CONFIG[serviceSlug] ?? [];
  const isWaterproof = serviceSlug === 'impermeabilizacao';
  const svcType: 'cleaning' | 'waterproofing' = isWaterproof ? 'waterproofing' : 'cleaning';

  // Agrupar linhas seleccionadas por serviço
  const sofaRows:    { sizeId: string; qty: number; packEnabled: boolean }[]     = [];
  const mattressRows:{ sizeId: string; qty: number; packEnabled: boolean }[]     = [];
  let   chairTotal = 0;
  let   carpetCfg: PriceRowQuizConfig | null = null;
  let   carpetRowIndex = -1;

  configs.forEach((cfg, i) => {
    if (!cfg) return;
    const qty = rowQuantities[i] ?? 0;
    if (cfg.service === 'sofa'    && cfg.sofaSizeId    && qty > 0) sofaRows.push({ sizeId: cfg.sofaSizeId, qty, packEnabled: false });
    if (cfg.service === 'mattress'&& cfg.mattressSizeId&& qty > 0) mattressRows.push({ sizeId: cfg.mattressSizeId, qty, packEnabled: false });
    if (cfg.service === 'chairs'  && qty > 0) chairTotal += qty;
    if (cfg.service === 'carpet'  && qty > 0) { carpetCfg = cfg; carpetRowIndex = i; }
  });

  // Sofás (primário) + cadeiras como extra (só no widget de impermeabilização,
  // o único com sofás e cadeiras na mesma tabela)
  if (sofaRows.length > 0) {
    const upsells: UpsellItemConfig[] = [];
    if (chairTotal > 0) upsells.push({
      id: 'chairs', chairQty: String(chairTotal), qty: chairTotal,
      price: calcChairBracket(chairTotal, isWaterproof, addonTier) ?? 0,
      label: `${chairTotal} cadeira${chairTotal > 1 ? 's' : ''}${isWaterproof ? ` (Impermeabilização ${addonTier === 'premium' ? 'Premium' : 'Essencial'})` : ''}`,
      waterproofingTier: addonTier,
      waterproof: isWaterproof, waterproofPrice: 0,
    });

    return { service: 'sofa', serviceType: svcType, sofaItems: sofaRows, waterproofingTier: addonTier, initialUpsellItems: upsells.length ? upsells : undefined };
  }

  // Colchões
  if (mattressRows.length > 0) {
    return { service: 'mattress', serviceType: svcType, mattressItems: mattressRows, waterproofingTier: addonTier };
  }

  // Cadeiras (sem sofás)
  if (chairTotal > 0) {
    return { service: 'chairs', serviceType: svcType, chairQty: String(chairTotal), waterproofingTier: addonTier };
  }

  // Tapetes E alcatifa: várias peças medidas (largura×comprimento), sempre
  // sob orçamento (2026-09-09, pedido explícito: "limpeza de alcatifa e
  // sempre sob orçamento assim como tapete" — alcatifa deixou de ter preço
  // fixo por m², mesma lógica do simulador do quiz para as duas, para o
  // "Continuar" já levar as peças que a pessoa mediu aqui em vez de abrir o
  // passo do quiz vazio).
  const carpetItems = carpetRowIndex >= 0 ? (carpetItemsByRow[carpetRowIndex] ?? []) : [];
  if (carpetCfg && carpetAllItemsValid(carpetItems)) {
    return { ...(carpetCfg as PriceRowQuizConfig), carpetArea: undefined, carpetItems };
  }

  return null;
}
