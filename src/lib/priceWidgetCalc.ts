import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import type { UpsellItemConfig } from "@/components/quiz/QuizTypes";

function parseRowPrice(price: string): number {
  if (price.includes('/m²') || price.toLowerCase().includes('orçamento')) return 0;
  const m = price.replace('+', '').match(/^(\d+(?:\.\d+)?)€/);
  return m ? parseFloat(m[1]) : 0;
}

export function calcChairBracket(qty: number, waterproof: boolean): number | null {
  if (qty <= 0) return 0;
  if (qty > 10) return null; // 11+ cadeiras = sob orçamento
  if (waterproof) {
    return qty <= 4 ? qty * 25 : 4 * 25 + (qty - 4) * 20;
  }
  if (qty <= 4) return qty * 20;
  if (qty <= 6) return 4 * 20 + (qty - 4) * 15;
  return 4 * 20 + 2 * 15 + (qty - 6) * 12.5;
}

export function calcWidgetTotal(
  serviceSlug: string,
  rowQuantities: Record<number, number>,
  chaiseLongueAddon: number
): number {
  const rows = PRICE_TABLE[serviceSlug] ?? [];
  const configs = PRICE_TABLE_QUIZ_CONFIG[serviceSlug] ?? [];
  const isWaterproof = serviceSlug === 'impermeabilizacao';
  let total = 0;

  rows.forEach((row, i) => {
    const qty = rowQuantities[i] ?? 0;
    if (qty <= 0) return;
    const cfg = configs[i];
    if (cfg?.service === 'chairs') {
      const c = calcChairBracket(qty, isWaterproof);
      if (c !== null) total += c;
      return;
    }
    if (cfg?.service === 'carpet') {
      const isAlcatifa = serviceSlug === 'limpeza-alcatifas';
      const p = calcCarpetWidget(qty, isAlcatifa);
      if (p !== null && p > 0) total += p;
      return;
    }
    const unitPrice = parseRowPrice(row.price);
    if (unitPrice > 0) total += unitPrice * qty;
  });

  const chaisePriceUnit = isWaterproof ? 25 : 10;
  if (chaiseLongueAddon > 0) total += chaisePriceUnit * chaiseLongueAddon;

  return Math.round(total * 10) / 10;
}

export function calcCarpetWidget(area: number, alcatifa = false): number | null {
  if (area <= 0) return 0;
  if (alcatifa) {
    if (area > 50) return null;
    return area * 3;
  }
  if (area > 15) return null;
  if (area <= 3)  return area * 15;
  if (area <= 5)  return 45 + (area - 3) * 12.5;
  if (area <= 8)  return 70 + (area - 5) * 11.5;
  if (area <= 10) return 104.5 + (area - 8) * 10.5;
  return 125.5 + (area - 10) * 10;
}

export const WIDGET_DISCOUNT_THRESHOLD = 149;

/**
 * Constrói a config do quiz a partir do estado do widget.
 * Funciona genericamente para qualquer serviço — não hardcoded por slug.
 */
export function buildWidgetQuizConfig(
  serviceSlug: string,
  rowQuantities: Record<number, number>,
  chaiseLongueAddon: number
): PriceRowQuizConfig | null {
  const configs = PRICE_TABLE_QUIZ_CONFIG[serviceSlug] ?? [];
  const isWaterproof = serviceSlug === 'impermeabilizacao';
  const svcType: 'cleaning' | 'waterproofing' = isWaterproof ? 'waterproofing' : 'cleaning';

  // Agrupar linhas seleccionadas por serviço
  const sofaRows:    { sizeId: string; qty: number }[]     = [];
  const mattressRows:{ sizeId: string; qty: number }[]     = [];
  let   chairTotal = 0;
  let   carpetArea = 0;
  let   carpetCfg: PriceRowQuizConfig | null = null;

  configs.forEach((cfg, i) => {
    if (!cfg) return;
    const qty = rowQuantities[i] ?? 0;
    if (cfg.service === 'sofa'    && cfg.sofaSizeId    && qty > 0) sofaRows.push({ sizeId: cfg.sofaSizeId, qty });
    if (cfg.service === 'mattress'&& cfg.mattressSizeId&& qty > 0) mattressRows.push({ sizeId: cfg.mattressSizeId, qty });
    if (cfg.service === 'chairs'  && qty > 0) chairTotal += qty;
    if (cfg.service === 'carpet'  && qty > 0) { carpetArea = qty; carpetCfg = cfg; }
  });

  // Sofás (primário) + cadeiras como upsell
  if (sofaRows.length > 0) {
    const sofaItems = sofaRows.map(r => ({ ...r, chaiseLongue: false as boolean }));
    if (chaiseLongueAddon > 0) sofaItems[0].chaiseLongue = true;

    const chairUpsell: UpsellItemConfig[] = chairTotal > 0 ? [{
      id: 'chairs', chairQty: String(chairTotal), qty: chairTotal,
      price: Math.round(((isWaterproof
        ? (chairTotal <= 4 ? chairTotal * 25 : 4 * 25 + (chairTotal - 4) * 20)
        : (chairTotal <= 4 ? chairTotal * 20 : chairTotal <= 6 ? 4 * 20 + (chairTotal - 4) * 15 : 4 * 20 + 2 * 15 + (chairTotal - 6) * 12.5)
      )) * 10) / 10,
      label: `${chairTotal} cadeira${chairTotal > 1 ? 's' : ''}`,
      waterproof: isWaterproof, waterproofPrice: 0,
    }] : [];

    return { service: 'sofa', serviceType: svcType, sofaItems, initialUpsellItems: chairUpsell.length ? chairUpsell : undefined };
  }

  // Colchões
  if (mattressRows.length > 0) {
    return { service: 'mattress', serviceType: svcType, mattressItems: mattressRows };
  }

  // Cadeiras (sem sofás)
  if (chairTotal > 0) {
    return { service: 'chairs', serviceType: svcType, chairQty: String(chairTotal) };
  }

  // Tapetes / alcatifas
  if (carpetArea > 0 && carpetCfg) {
    return { ...(carpetCfg as PriceRowQuizConfig), carpetArea: String(carpetArea) };
  }

  return null;
}
