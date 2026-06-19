import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG } from "@/data/locationPriceTestimonialsData";

function parseRowPrice(price: string): number {
  if (price.includes('/m²') || price.toLowerCase().includes('orçamento')) return 0;
  const m = price.replace('+', '').match(/^(\d+(?:\.\d+)?)€/);
  return m ? parseFloat(m[1]) : 0;
}

export function calcChairBracket(qty: number, waterproof: boolean): number | null {
  if (qty <= 0) return 0;
  if (waterproof) {
    if (qty > 10) return null;
    return qty <= 4 ? qty * 17.5 : 4 * 17.5 + (qty - 4) * 15;
  }
  if (qty >= 10) return null; // limpeza: 10+ cadeiras = sob orçamento
  if (qty <= 3) return qty * 17.5;
  if (qty <= 6) return 52.5 + (qty - 3) * 12.5;
  return 90 + (qty - 6) * 10;
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

  const chaisePriceUnit = isWaterproof ? 20 : 10;
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
  if (area <= 5)  return area * 10;
  if (area <= 10) return 50 + (area - 5) * 8;
  return 90 + (area - 10) * 7;
}

export const WIDGET_DISCOUNT_THRESHOLD = 149;
