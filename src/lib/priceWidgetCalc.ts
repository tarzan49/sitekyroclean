import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import type { UpsellItemConfig, CarpetItem } from "@/components/quiz/QuizTypes";
import { sofaPrices, mattressPrices } from "@/components/quiz/QuizTypes";
import { calcPackPricing, calcChairWaterproof, calcChairWaterproofPremium } from "@/components/quiz/quizHelpers";

export type WidgetTier = 'essencial' | 'premium';

// Anti Ácaros para sofás: addon plano por tamanho (sem tiers Essencial/Premium,
// ao contrário da impermeabilização) — pedido explícito 2026-08-31.
export const SOFA_ANTI_ACAROS_PRICE: Record<string, number> = {
  '1-lugar': 20,
  '2-lugares': 40,
  '3-lugares': 50,
};

export function calcSofaAntiAcarosDelta(cfg: PriceRowQuizConfig): number | null {
  if (cfg.service !== 'sofa' || !cfg.sofaSizeId) return null;
  return SOFA_ANTI_ACAROS_PRICE[cfg.sofaSizeId] ?? null;
}

// Addon de impermeabilização para cadeiras (quando limpeza é o serviço
// primário) — reaproveita os preços já existentes de calcChairWaterproof(Premium).
export function calcChairAddonWaterproofTotal(qty: number, tier: WidgetTier): number | null {
  return tier === 'premium' ? calcChairWaterproofPremium(qty) : calcChairWaterproof(qty);
}

// Anti Ácaros para cadeiras: 1ª cadeira 10€, seguintes 7,5€ cada, mudado de
// preço fixo (7,5€ sempre, confirmado 2026-08-31) para escalão em 2026-09-02
// a pedido do dono, para que 1 cadeira + Impermeabilização + Anti Ácaros feche
// exatamente no mínimo de pedido (35€ base + 15€ + 10€ = 60€).
export const CHAIR_ANTI_ACAROS_FIRST_PRICE = 10;
export const CHAIR_ANTI_ACAROS_UNIT_PRICE = 7.5;

export function calcChairAntiAcarosTotal(qty: number): number | null {
  if (qty <= 0) return 0;
  if (qty > 10) return null;
  return Math.round((CHAIR_ANTI_ACAROS_FIRST_PRICE + (qty - 1) * CHAIR_ANTI_ACAROS_UNIT_PRICE) * 10) / 10;
}

// Delta por unidade (preço com protecção - preço só limpeza) para uma linha
// sofá/colchão do widget, espelhando exactamente calcPackPricing do quiz modal
// (mesmo fallbackDelta: 40 para sofás, 30 para colchões).
export function calcRowAddonDelta(cfg: PriceRowQuizConfig, tier: WidgetTier): number | null {
  if (cfg.service === 'sofa' && cfg.sofaSizeId) {
    const opt = sofaPrices.find(p => p.id === cfg.sofaSizeId);
    if (!opt) return null;
    const { basePrice, packPrice } = calcPackPricing(opt, true, false, 40, tier);
    return basePrice !== null && packPrice !== null ? packPrice - basePrice : null;
  }
  if (cfg.service === 'mattress' && cfg.mattressSizeId) {
    const opt = mattressPrices.find(p => p.id === cfg.mattressSizeId);
    if (!opt) return null;
    const { basePrice, packPrice } = calcPackPricing(opt, true, false, 30, tier);
    return basePrice !== null && packPrice !== null ? packPrice - basePrice : null;
  }
  return null;
}

function parseRowPrice(price: string): number {
  if (price.includes('/m²') || price.toLowerCase().includes('orçamento')) return 0;
  const m = price.replace('+', '').match(/^(\d+(?:\.\d+)?)€/);
  return m ? parseFloat(m[1]) : 0;
}

export function calcChairBracket(qty: number, waterproof: boolean): number | null {
  if (qty <= 0) return 0;
  if (qty >= 10) return null; // 10+ cadeiras = sempre sob orçamento (2026-09-01)
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
  chaiseLongueAddon: number,
  addonRows: Set<number> = new Set(),
  addonTier: WidgetTier = 'essencial',
  antiAcarosRows: Set<number> = new Set()
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
      // Addons só fazem sentido quando cadeiras não são já o serviço de
      // impermeabilização primário (mesma lógica do sofá/colchão).
      if (!isWaterproof) {
        if (addonRows.has(i)) {
          const wp = calcChairAddonWaterproofTotal(qty, addonTier);
          if (wp !== null) total += wp;
        }
        if (antiAcarosRows.has(i)) {
          const aa = calcChairAntiAcarosTotal(qty);
          if (aa !== null) total += aa;
        }
      }
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
    if (cfg && addonRows.has(i)) {
      const delta = calcRowAddonDelta(cfg, addonTier);
      if (delta !== null) total += delta * qty;
    }
    if (cfg && antiAcarosRows.has(i)) {
      const delta = calcSofaAntiAcarosDelta(cfg);
      if (delta !== null) total += delta * qty;
    }
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
  // Tapetes (não-alcatifa): sempre sob orçamento, sem preço por m² (2026-09-06,
  // espelha a remoção da estimativa de preço no simulador de tapetes do quiz).
  return null;
}

// 2026-08-31 (reformulado x4, confirmado com 3 exemplos concretos) — espelha
// use-quiz-pricing.ts: conta-se cada UNIDADE de mobília (sofá, colchão,
// cadeiras-como-lote, tapete) como um artigo ao seu preço BASE (sem addon).
// Regra final: soma de todos os artigos > 160€ (100€ de base + 60€ do artigo
// extra, não sobrepostos) E pelo menos um artigo, sozinho, vale 60€ ou mais.
// Testado: 3 colchões casal 69€ (207€) qualifica; 2 colchões casal 69€
// (138€) não qualifica; 2×sofá 1L 49€ + 1×sofá 2L 69€ (167€) qualifica.
export const PACK_DISCOUNT_MIN_SERVICE = 100;
export const PACK_DISCOUNT_MIN_UPSELL_ITEM = 60;
export const PACK_DISCOUNT_MIN_TOTAL = PACK_DISCOUNT_MIN_SERVICE + PACK_DISCOUNT_MIN_UPSELL_ITEM;

export interface WidgetArticleInfo {
  articleTotal: number;
  minQualifyingArticle: number | null;
}

export function calcWidgetArticles(
  serviceSlug: string,
  rowQuantities: Record<number, number>,
  addonRows: Set<number> = new Set(),
  addonTier: WidgetTier = 'essencial',
  antiAcarosRows: Set<number> = new Set()
): WidgetArticleInfo {
  const rows = PRICE_TABLE[serviceSlug] ?? [];
  const configs = PRICE_TABLE_QUIZ_CONFIG[serviceSlug] ?? [];
  const isWaterproof = serviceSlug === 'impermeabilizacao';
  let articleTotal = 0;
  let minQualifyingArticle: number | null = null;
  const noteCandidate = (p: number) => {
    if (p >= PACK_DISCOUNT_MIN_UPSELL_ITEM && (minQualifyingArticle === null || p < minQualifyingArticle)) minQualifyingArticle = p;
  };

  rows.forEach((row, i) => {
    const qty = rowQuantities[i] ?? 0;
    if (qty <= 0) return;
    const cfg = configs[i];
    if (!cfg) return; // chaise longue: addon, não é um artigo próprio
    if (cfg.service === 'chairs') {
      let total = calcChairBracket(qty, isWaterproof) ?? 0;
      // Addons contam para o artigo (pedido explícito 2026-09-01: o valor
      // do addon ligado tem de entrar na conta do Pack Família, tal como já
      // acontece no total realmente cobrado — mesma lógica do modal).
      if (!isWaterproof) {
        if (addonRows.has(i)) total += calcChairAddonWaterproofTotal(qty, addonTier) ?? 0;
        if (antiAcarosRows.has(i)) total += calcChairAntiAcarosTotal(qty) ?? 0;
      }
      if (total > 0) { articleTotal += total; noteCandidate(total); }
      return;
    }
    if (cfg.service === 'carpet') {
      const isAlcatifa = serviceSlug === 'limpeza-alcatifas';
      const total = calcCarpetWidget(qty, isAlcatifa);
      if (total !== null && total > 0) { articleTotal += total; noteCandidate(total); }
      return;
    }
    // Sofá / colchão: cada unidade é um artigo separado ao preço da linha,
    // incluindo o addon quando está ligado (mesma lógica do chairs acima).
    let unitPrice = parseRowPrice(row.price);
    if (addonRows.has(i)) unitPrice += calcRowAddonDelta(cfg, addonTier) ?? 0;
    if (antiAcarosRows.has(i)) unitPrice += calcSofaAntiAcarosDelta(cfg) ?? 0;
    if (unitPrice > 0) {
      articleTotal += unitPrice * qty;
      noteCandidate(unitPrice);
    }
  });

  return { articleTotal, minQualifyingArticle };
}

export interface WidgetPricing {
  serviceTotal: number;
  travelFee: number;
  grandTotal: number;
  discountActive: boolean;
  discountedTotal: number;
  remaining: number;
}

export function calcWidgetPricing(serviceTotal: number, travelFee: number, articles: WidgetArticleInfo): WidgetPricing {
  const grandTotal = serviceTotal + travelFee;
  const discountActive = articles.minQualifyingArticle !== null
    && articles.articleTotal > PACK_DISCOUNT_MIN_TOTAL;
  const discountedTotal = discountActive ? Math.round(serviceTotal * 0.9) + travelFee : grandTotal;
  return { serviceTotal, travelFee, grandTotal, discountActive, discountedTotal, remaining: 0 };
}

/**
 * Constrói a config do quiz a partir do estado do widget.
 * Funciona genericamente para qualquer serviço — não hardcoded por slug.
 */
export function buildWidgetQuizConfig(
  serviceSlug: string,
  rowQuantities: Record<number, number>,
  chaiseLongueAddon: number,
  addonRows: Set<number> = new Set(),
  addonTier: WidgetTier = 'essencial',
  antiAcarosRows: Set<number> = new Set(),
  carpetItemsByRow: Record<number, CarpetItem[]> = {}
): PriceRowQuizConfig | null {
  const configs = PRICE_TABLE_QUIZ_CONFIG[serviceSlug] ?? [];
  const isWaterproof = serviceSlug === 'impermeabilizacao';
  const svcType: 'cleaning' | 'waterproofing' = isWaterproof ? 'waterproofing' : 'cleaning';

  // Agrupar linhas seleccionadas por serviço
  const sofaRows:    { sizeId: string; qty: number; packEnabled: boolean }[]     = [];
  const mattressRows:{ sizeId: string; qty: number; packEnabled: boolean }[]     = [];
  let   chairTotal = 0;
  let   chairWaterproofOn = false;
  let   chairAntiAcarosOn = false;
  let   carpetArea = 0;
  let   carpetCfg: PriceRowQuizConfig | null = null;
  let   carpetRowIndex = -1;
  const isAlcatifa = serviceSlug === 'limpeza-alcatifas';
  let   antiAcarosQty = 0;
  let   antiAcarosPrice = 0;

  configs.forEach((cfg, i) => {
    if (!cfg) return;
    const qty = rowQuantities[i] ?? 0;
    const packEnabled = addonRows.has(i);
    if (cfg.service === 'sofa'    && cfg.sofaSizeId    && qty > 0) sofaRows.push({ sizeId: cfg.sofaSizeId, qty, packEnabled });
    if (cfg.service === 'mattress'&& cfg.mattressSizeId&& qty > 0) mattressRows.push({ sizeId: cfg.mattressSizeId, qty, packEnabled });
    if (cfg.service === 'chairs'  && qty > 0) {
      chairTotal += qty;
      if (packEnabled) chairWaterproofOn = true;
      if (antiAcarosRows.has(i)) chairAntiAcarosOn = true;
    }
    if (cfg.service === 'carpet'  && qty > 0) { carpetArea = qty; carpetCfg = cfg; carpetRowIndex = i; }
    if (cfg.service === 'sofa'    && qty > 0 && antiAcarosRows.has(i)) {
      const delta = calcSofaAntiAcarosDelta(cfg);
      if (delta !== null) { antiAcarosQty += qty; antiAcarosPrice += delta * qty; }
    }
  });

  // Sofás (primário) + cadeiras/anti-ácaros como upsell
  if (sofaRows.length > 0) {
    const sofaItems = sofaRows.map(r => ({ ...r, chaiseLongue: false as boolean }));
    if (chaiseLongueAddon > 0) sofaItems[0].chaiseLongue = true;

    const upsells: UpsellItemConfig[] = [];
    if (chairTotal > 0) upsells.push({
      id: 'chairs', chairQty: String(chairTotal), qty: chairTotal,
      price: Math.round(((isWaterproof
        ? (chairTotal <= 4 ? chairTotal * 25 : 4 * 25 + (chairTotal - 4) * 20)
        : (chairTotal <= 4 ? chairTotal * 20 : chairTotal <= 6 ? 4 * 20 + (chairTotal - 4) * 15 : 4 * 20 + 2 * 15 + (chairTotal - 6) * 12.5)
      )) * 10) / 10,
      label: `${chairTotal} cadeira${chairTotal > 1 ? 's' : ''}`,
      waterproof: isWaterproof, waterproofPrice: 0,
    });
    if (antiAcarosQty > 0) upsells.push({
      id: 'sofa-anti-acaros', qty: antiAcarosQty,
      price: Math.round(antiAcarosPrice * 10) / 10,
      label: 'Anti Ácaros (sofá)',
    });

    return { service: 'sofa', serviceType: svcType, sofaItems, waterproofingTier: addonTier, initialUpsellItems: upsells.length ? upsells : undefined };
  }

  // Colchões
  if (mattressRows.length > 0) {
    return { service: 'mattress', serviceType: svcType, mattressItems: mattressRows, waterproofingTier: addonTier };
  }

  // Cadeiras (sem sofás)
  if (chairTotal > 0) {
    const chairAntiAcarosUpsell: UpsellItemConfig[] = chairAntiAcarosOn ? [{
      id: 'chairs-anti-acaros', qty: chairTotal,
      price: Math.round((calcChairAntiAcarosTotal(chairTotal) ?? 0) * 10) / 10,
      label: 'Anti Ácaros (cadeiras)',
    }] : [];
    return {
      service: 'chairs', serviceType: svcType, chairQty: String(chairTotal),
      chairWaterproofing: chairWaterproofOn, waterproofingTier: addonTier,
      initialUpsellItems: chairAntiAcarosUpsell.length ? chairAntiAcarosUpsell : undefined,
    };
  }

  // Alcatifas: continuam com o modelo de área única (preço real por m²).
  if (carpetArea > 0 && carpetCfg && isAlcatifa) {
    return { ...(carpetCfg as PriceRowQuizConfig), carpetArea: String(carpetArea) };
  }
  // Tapetes: várias peças medidas (largura×comprimento), sempre sob orçamento
  // — mesma lógica do simulador do quiz, para o "Continuar" já levar os
  // tapetes que a pessoa mediu aqui em vez de abrir o passo do quiz vazio.
  const carpetItems = carpetRowIndex >= 0 ? (carpetItemsByRow[carpetRowIndex] ?? []) : [];
  const validCarpetItems = carpetItems.filter(it => {
    const l = parseFloat((it.largura + '').replace(',', '.'));
    const c = parseFloat((it.comprimento + '').replace(',', '.'));
    return !isNaN(l) && !isNaN(c) && l > 0 && c > 0;
  });
  if (carpetCfg && validCarpetItems.length > 0) {
    return { ...(carpetCfg as PriceRowQuizConfig), carpetArea: undefined, carpetItems: validCarpetItems };
  }

  return null;
}
