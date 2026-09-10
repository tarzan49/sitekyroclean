import { splitTreatmentItems } from '@/components/quiz/quizHelpers';
import { useMemo } from 'react';
import type { QuizFormData, SofaItem, MattressItem, CarpetItem, UpsellItemConfig } from '@/components/quiz';
import { sofaPrices, mattressPrices, locationPrices } from '@/components/quiz';
import { calcPackPricing, calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, carpetHasValidItems } from '@/components/quiz/quizHelpers';
import { PACK_DISCOUNT_MIN_UPSELL_ITEM, PACK_DISCOUNT_MIN_TOTAL } from '@/lib/priceWidgetCalc';

export function useQuizPricing(
  formData: QuizFormData,
  sofaItems: SofaItem[],
  mattressItems: MattressItem[],
  upsellItems: UpsellItemConfig[],
  carpetItems: CarpetItem[],
  offerPreview = false,
) {
  // Calculate total price early for analytics (moved up for hook dependency).
  // Em paralelo, calcula também o "artigo base" de cada item (preço SEM addon,
  // por unidade) — usado só para decidir se o Pack Família qualifica (ver
  // packDiscountActive mais abaixo), nunca para o preço real cobrado.
  const { calculateServicePrice, articleBaseTotal, minQualifyingArticle } = useMemo(() => {
    let price = 0;
    let baseTotal = 0;
    let minQualifying: number | null = null;
    const noteCandidate = (p: number) => {
      if (p >= PACK_DISCOUNT_MIN_UPSELL_ITEM && (minQualifying === null || p < minQualifying)) minQualifying = p;
    };

    switch (formData.service) {
      case 'sofa': {
        splitTreatmentItems(sofaItems).forEach(item => {
          if (item.qty <= 0) return;
          const opt = sofaPrices.find(p => p.id === item.sizeId);
          if (!opt) return;
          const isWaterproofBase = formData.serviceType === 'waterproofing';
          const unitPrice = calcPackPricing(opt, item.packEnabled, isWaterproofBase, null, formData.waterproofingTier).displayPrice ?? 0;
          if (unitPrice > 0) { price += unitPrice * item.qty; baseTotal += unitPrice * item.qty; noteCandidate(unitPrice); }
        });
        break;
      }

      case 'mattress': {
        splitTreatmentItems(mattressItems).forEach(item => {
          if (item.qty <= 0) return;
          const opt = mattressPrices.find(p => p.id === item.sizeId);
          if (!opt) return;
          const isWaterproofBase = formData.serviceType === 'waterproofing';
          const baseP = isWaterproofBase
            ? (typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : 0)
            : (typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : 0);
          const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : baseP + 30;
          const unitPrice = item.packEnabled ? bothP : baseP;
          if (unitPrice > 0) { price += unitPrice * item.qty; baseTotal += unitPrice * item.qty; noteCandidate(unitPrice); }
        });
        break;
      }

      case 'chairs': {
        const isPremium = formData.waterproofingTier === 'premium';
        const calcWaterproof = isPremium ? calcChairWaterproofPremium : calcChairWaterproof;
        const chairQty = parseInt(formData.chairQuantity);
        let primaryChairPrice = 0;
        if (!isNaN(chairQty) && chairQty > 0) {
          primaryChairPrice = formData.serviceType === 'waterproofing'
            ? (calcWaterproof(chairQty) ?? 0)
            : (calcChairClean(chairQty) ?? 0);
          price += primaryChairPrice;
        }
        const addonQty = formData.chairWaterproofQty;
        let addonChairPrice = 0;
        if (addonQty > 0) {
          addonChairPrice = formData.serviceType === 'waterproofing'
            ? (calcChairClean(addonQty) ?? 0)
            : (calcWaterproof(addonQty) ?? 0);
          price += addonChairPrice;
        }
        // Anti Ácaros das cadeiras (upsell pós-quantidade, 2026-09-06): sempre
        // 5€/cadeira fixo, mutuamente exclusivo com o addon de impermeabilização
        // acima (a UI do upsell garante nunca terem os dois ligados ao mesmo tempo).
        let antiAcarosChairPrice = 0;
        if (formData.chairAntiAcaros && formData.serviceType !== 'waterproofing' && !formData.chairWaterproofing && addonQty <= 0 && !isNaN(chairQty) && chairQty > 0) {
          antiAcarosChairPrice = chairQty * 5;
          price += antiAcarosChairPrice;
        }
        // Cadeiras (serviço principal + addon de impermeabilização ou Anti
        // Ácaros, quando ligado) contam como 1 artigo só, ao preço total do
        // lote incluindo o addon — os addons contam para o Pack Família (2026-09-01).
        const totalChairArticle = primaryChairPrice + addonChairPrice + antiAcarosChairPrice;
        if (totalChairArticle > 0) { baseTotal += totalChairArticle; noteCandidate(totalChairArticle); }
        break;
      }

      case 'carpet': {
        // Sem preço fixo (2026-09-06): tapetes nunca contam para o preço nem
        // para o Pack Família, ficam sempre sob orçamento (ver hasSobOrcamento).
        break;
      }
    }

    return { calculateServicePrice: price, articleBaseTotal: baseTotal, minQualifyingArticle: minQualifying };
  }, [formData, sofaItems, mattressItems, carpetItems]);

  // Calculate travel cost: uses expanded locationPrices from QuizTypes.
  // Mínimo é sempre 10€ (sem zona grátis). Antes de escolher localização não há
  // preço nenhum a mostrar (0), evitando um "10€" enganoso logo no 1º passo do quiz.
  // "other" (localização fora da tabela) usa o mínimo garantido do site (10€).
  const travelCost = useMemo(() => {
    if (!formData.location) return 0;
    if (formData.location === 'other') return 10;
    return locationPrices[formData.location] ?? 10;
  }, [formData.location]);

  const finalTravelCost = travelCost;

  const safePrice = (n: number) => (isNaN(n) || n == null) ? 0 : n;
  const upsellItemsTotal = upsellItems.reduce((sum, item) => sum + safePrice(item.price), 0);
  const totalPrice = safePrice(calculateServicePrice) + safePrice(upsellItemsTotal) + safePrice(finalTravelCost) + 0;
  // True when the user has qty>0 of the "4+ lugares" sofa, or any measured
  // carpet (carpets never have a fixed price anymore — always a custom quote,
  // see carpetHasValidItems) — without this, calculateServicePrice silently
  // fell back to 0 for those cases, so totalPrice ended up as travel cost
  // alone with nothing flagging it as a custom quote.
  // Cadeiras: primário e addon podem ter limiares "sob orçamento" diferentes
  // (limpeza até 10, impermeabilização a partir de 10) — usa sempre a função
  // de preço real em vez de repetir um limiar numérico à mão, para não
  // desalinhar outra vez (bug real 2026-08-31: 10 cadeiras + impermeabilização
  // mostrava 170€ no topo do quiz, cobrando só a limpeza, addon ignorado em
  // silêncio, porque o limiar hardcoded aqui era ">10" em vez de ">=10").
  const isChairService = formData.service === 'chairs';
  const chairQtyNum = parseInt(formData.chairQuantity);
  const chairPrimaryCalc = formData.serviceType === 'waterproofing'
    ? (formData.waterproofingTier === 'premium' ? calcChairWaterproofPremium : calcChairWaterproof)
    : calcChairClean;
  const chairPrimaryNeedsQuote = isChairService && !isNaN(chairQtyNum) && chairQtyNum > 0 && chairPrimaryCalc(chairQtyNum) === null;
  const chairAddonQty = formData.chairWaterproofQty;
  const chairAddonCalc = formData.serviceType === 'waterproofing'
    ? calcChairClean
    : (formData.waterproofingTier === 'premium' ? calcChairWaterproofPremium : calcChairWaterproof);
  const chairAddonNeedsQuote = isChairService && chairAddonQty > 0 && chairAddonCalc(chairAddonQty) === null;
  const hasSobOrcamento =
    (formData.service === 'sofa' && sofaItems.some(i => i.sizeId === '4+-lugares' && i.qty > 0)) ||
    (formData.service === 'carpet' && carpetHasValidItems(carpetItems)) ||
    chairPrimaryNeedsQuote ||
    chairAddonNeedsQuote;
  // Any upsell item with price=0 is a SOB item (chairs ≥10, tapetes (sempre), sofa 4+ lugares)
  const hasUpsellSobItem = upsellItems.some(i => i.price === 0);
  // Regra comercial 2026-09-10: pelo menos dois artigos tabelados, soma >149€
  // e um artigo >=49€. Cadeiras contam como um lote; tratamento não é artigo.
  // Artigos sob orçamento nunca desbloqueiam um desconto por terem preço zero.
  const NON_ARTICLE_UPSELL_IDS = new Set(['sofa-anti-acaros', 'chairs-anti-acaros']);
  const articleUpsellItems = upsellItems.filter(i => !NON_ARTICLE_UPSELL_IDS.has(i.id));
  const upsellArticleTotal = articleUpsellItems.reduce((sum, item) => sum + safePrice(item.price), 0);
  const hasSubstantialUpsellArticle = articleUpsellItems.some(i => i.price >= PACK_DISCOUNT_MIN_UPSELL_ITEM);
  const totalArticleValue = articleBaseTotal + upsellArticleTotal;
  const hasSubstantialArticle = minQualifyingArticle !== null || hasSubstantialUpsellArticle;
  const primaryArticleCount = formData.service === 'sofa' ? sofaItems.reduce((sum, i) => sum + (i.qty > 0 && i.sizeId !== '4+-lugares' ? i.qty : 0), 0)
    : formData.service === 'mattress' ? mattressItems.reduce((sum, i) => sum + Math.max(0, i.qty), 0)
    : formData.service === 'chairs' && !chairPrimaryNeedsQuote && chairQtyNum > 0 ? 1 : 0;
  const articleCount = primaryArticleCount + articleUpsellItems.reduce((sum, i) => sum + (i.price <= 0 ? 0 : i.id === 'chairs' ? 1 : (i.qty ?? 1)), 0);
  const previewDiscount = offerPreview;
  const packDiscountActive = previewDiscount
    ? false // Local fixed-price offer already includes its saving; never stack 10%.
    : (articleCount >= 2 && totalArticleValue > PACK_DISCOUNT_MIN_TOTAL && hasSubstantialArticle);
  const packDiscountPct = packDiscountActive ? 0.10 : 0;
  const serviceOnlyTotal = calculateServicePrice + upsellItemsTotal + 0;
  const discountedPrice = Math.round(totalPrice);
  const packDiscountedPrice = packDiscountActive && totalPrice > 0
    ? (previewDiscount ? Math.round(serviceOnlyTotal * 90) / 100 : Math.round(serviceOnlyTotal * 0.9)) + finalTravelCost
    : discountedPrice;

  return {
    calculateServicePrice,
    travelCost,
    finalTravelCost,
    totalPrice,
    hasSobOrcamento,
    hasUpsellSobItem,
    packDiscountActive,
    packDiscountPct,
    serviceOnlyTotal,
    discountedPrice,
    packDiscountedPrice,
  };
}
