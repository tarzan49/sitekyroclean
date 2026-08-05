import { useMemo } from 'react';
import type { QuizFormData, SofaItem, MattressItem, UpsellItemConfig } from '@/components/quiz';
import { sofaPrices, mattressPrices, locationPrices } from '@/components/quiz';
import { calcCarpetPrice, calcChairClean, calcChairWaterproof } from '@/components/quiz/quizHelpers';

export function useQuizPricing(
  formData: QuizFormData,
  sofaItems: SofaItem[],
  mattressItems: MattressItem[],
  upsellItems: UpsellItemConfig[],
) {
  // Calculate total price early for analytics (moved up for hook dependency)
  const calculateServicePrice = useMemo(() => {
    let price = 0;

    switch (formData.service) {
      case 'sofa': {
        sofaItems.forEach(item => {
          if (item.qty <= 0) return;
          const opt = sofaPrices.find(p => p.id === item.sizeId);
          if (!opt) return;
          const isWaterproofBase = formData.serviceType === 'waterproofing';
          const baseP = isWaterproofBase
            ? (typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : 0)
            : (typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : 0);
          const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : baseP + 40;
          const unitPrice = item.packEnabled ? bothP : baseP;
          if (unitPrice > 0) price += unitPrice * item.qty;
        });
        break;
      }

      case 'mattress': {
        mattressItems.forEach(item => {
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
        const chairQty = parseInt(formData.chairQuantity);
        if (!isNaN(chairQty) && chairQty > 0) {
          price = formData.serviceType === 'waterproofing'
            ? (calcChairWaterproof(chairQty) ?? 0)
            : (calcChairClean(chairQty) ?? 0);
        }
        const addonQty = formData.chairWaterproofQty;
        if (addonQty > 0) {
          price += formData.serviceType === 'waterproofing'
            ? (calcChairClean(addonQty) ?? 0)
            : (calcChairWaterproof(addonQty) ?? 0);
        }
        break;
      }

      case 'carpet': {
        const carpetArea = parseFloat(formData.carpetArea);
        if (!isNaN(carpetArea) && carpetArea > 0) {
          price = calcCarpetPrice(carpetArea) ?? 0;
        }
        break;
      }
    }

    return price;
  }, [formData, sofaItems, mattressItems]);

  // Calculate travel cost: uses expanded locationPrices from QuizTypes.
  // Mínimo é sempre 5€ (sem zona grátis) — usado também como fallback para
  // localização ainda não escolhida ou "outra" fora da tabela de zonas.
  const travelCost = useMemo(() => {
    if (!formData.location || formData.location === 'other') return 5;
    return locationPrices[formData.location] ?? 5;
  }, [formData.location]);

  const finalTravelCost = travelCost;

  const safePrice = (n: number) => (isNaN(n) || n == null) ? 0 : n;
  const upsellItemsTotal = upsellItems.reduce((sum, item) => sum + safePrice(item.price), 0);
  const totalPrice = safePrice(calculateServicePrice) + safePrice(upsellItemsTotal) + safePrice(finalTravelCost) + 0;
  // True when the user has qty>0 of the "4+ lugares" sofa (no fixed price → custom quote)
  const hasSobOrcamento = sofaItems.some(i => i.sizeId === '4+-lugares' && i.qty > 0);
  // Any upsell item with price=0 is a SOB item (chairs ≥10, carpet >15m², sofa 4+ lugares)
  const hasUpsellSobItem = upsellItems.some(i => i.price === 0);
  // Pack 10% activates: cart ≥149€ in known prices, OR cart >100€ + any SOB item
  const packDiscountActive = totalPrice >= 149 || (totalPrice > 100 && (hasUpsellSobItem || hasSobOrcamento));
  const packDiscountPct = packDiscountActive ? 0.10 : 0;
  const serviceOnlyTotal = calculateServicePrice + upsellItemsTotal + 0;
  const discountedPrice = Math.round(totalPrice);
  const packDiscountedPrice = packDiscountActive && totalPrice > 0
    ? Math.round(serviceOnlyTotal * 0.9) + finalTravelCost
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
