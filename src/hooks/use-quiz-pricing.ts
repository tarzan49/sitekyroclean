import { splitTreatmentItems } from '@/components/quiz/quizHelpers';
import { useMemo } from 'react';
import type { QuizFormData, SofaItem, MattressItem, CarpetItem, UpsellItemConfig } from '@/components/quiz';
import { sofaPrices, mattressPrices, locationPrices } from '@/components/quiz';
import { calcPackPricing, calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, carpetHasValidItems } from '@/components/quiz/quizHelpers';

export function useQuizPricing(
  formData: QuizFormData,
  sofaItems: SofaItem[],
  mattressItems: MattressItem[],
  upsellItems: UpsellItemConfig[],
  carpetItems: CarpetItem[],
) {
  // Calculate total price early for analytics (moved up for hook dependency).
  const calculateServicePrice = useMemo(() => {
    let price = 0;

    switch (formData.service) {
      case 'sofa': {
        splitTreatmentItems(sofaItems).forEach(item => {
          if (item.qty <= 0) return;
          const opt = sofaPrices.find(p => p.id === item.sizeId);
          if (!opt) return;
          const isWaterproofBase = formData.serviceType === 'waterproofing';
          const unitPrice = calcPackPricing(opt, item.packEnabled, isWaterproofBase, null, formData.waterproofingTier).displayPrice ?? 0;
          if (unitPrice > 0) price += unitPrice * item.qty;
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
          if (unitPrice > 0) price += unitPrice * item.qty;
        });
        break;
      }

      case 'chairs': {
        const isPremium = formData.waterproofingTier === 'premium';
        const calcWaterproof = isPremium ? calcChairWaterproofPremium : calcChairWaterproof;
        const chairQty = parseInt(formData.chairQuantity);
        if (!isNaN(chairQty) && chairQty > 0) {
          price += formData.serviceType === 'waterproofing'
            ? (calcWaterproof(chairQty) ?? 0)
            : (calcChairClean(chairQty) ?? 0);
        }
        const addonQty = formData.chairWaterproofQty;
        if (addonQty > 0) {
          price += formData.serviceType === 'waterproofing'
            ? (calcChairClean(addonQty) ?? 0)
            : (calcWaterproof(addonQty) ?? 0);
        }
        // Anti Ácaros das cadeiras (upsell pós-quantidade, 2026-09-06): sempre
        // 5€/cadeira fixo, mutuamente exclusivo com o addon de impermeabilização
        // acima (a UI do upsell garante nunca terem os dois ligados ao mesmo tempo).
        if (formData.chairAntiAcaros && formData.serviceType !== 'waterproofing' && !formData.chairWaterproofing && addonQty <= 0 && !isNaN(chairQty) && chairQty > 0) {
          price += chairQty * 5;
        }
        break;
      }

      case 'carpet': {
        // Sem preço fixo (2026-09-06): tapetes ficam sempre sob orçamento (ver hasSobOrcamento).
        break;
      }
    }

    return price;
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

  return {
    calculateServicePrice,
    travelCost,
    finalTravelCost,
    totalPrice,
    hasSobOrcamento,
    hasUpsellSobItem,
  };
}
