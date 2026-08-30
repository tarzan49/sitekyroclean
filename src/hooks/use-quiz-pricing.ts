import { useMemo } from 'react';
import type { QuizFormData, SofaItem, MattressItem, UpsellItemConfig } from '@/components/quiz';
import { sofaPrices, mattressPrices, locationPrices } from '@/components/quiz';
import { calcCarpetPrice, calcChairClean, calcChairWaterproof, calcChairWaterproofPremium } from '@/components/quiz/quizHelpers';

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
          const isPremium = formData.waterproofingTier === 'premium';
          const waterproofP = isPremium
            ? (typeof opt.waterproofingPremiumPrice === 'number' ? (opt.waterproofingPremiumPrice as number) : 0)
            : (typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : 0);
          const baseP = isWaterproofBase
            ? waterproofP
            : (typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : 0);
          // Pack Premium = pack Essencial + a mesma diferença já aprovada entre
          // Essencial e Premium standalone (não é um combo com preço próprio).
          const tierDelta = isPremium && typeof opt.waterproofingPremiumPrice === 'number' && typeof opt.waterproofingPrice === 'number'
            ? opt.waterproofingPremiumPrice - opt.waterproofingPrice : 0;
          const bothEssencial = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : baseP + 40;
          const bothP = bothEssencial + tierDelta;
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
        const isPremium = formData.waterproofingTier === 'premium';
        const calcWaterproof = isPremium ? calcChairWaterproofPremium : calcChairWaterproof;
        const chairQty = parseInt(formData.chairQuantity);
        if (!isNaN(chairQty) && chairQty > 0) {
          price = formData.serviceType === 'waterproofing'
            ? (calcWaterproof(chairQty) ?? 0)
            : (calcChairClean(chairQty) ?? 0);
        }
        const addonQty = formData.chairWaterproofQty;
        if (addonQty > 0) {
          price += formData.serviceType === 'waterproofing'
            ? (calcChairClean(addonQty) ?? 0)
            : (calcWaterproof(addonQty) ?? 0);
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
  // True when the user has qty>0 of the "4+ lugares" sofa, or a carpet area over 15m²
  // (both have no fixed price → custom quote). Without the carpet check, calculateServicePrice
  // silently fell back to 0 for area>15m² (calcCarpetPrice returns null there), so totalPrice
  // ended up as travel cost alone with nothing flagging it as a custom quote.
  const hasSobOrcamento =
    sofaItems.some(i => i.sizeId === '4+-lugares' && i.qty > 0) ||
    (formData.service === 'carpet' && parseFloat(formData.carpetArea) > 15) ||
    (formData.service === 'chairs' && parseInt(formData.chairQuantity) > 10);
  // Any upsell item with price=0 is a SOB item (chairs ≥10, carpet >15m², sofa 4+ lugares)
  const hasUpsellSobItem = upsellItems.some(i => i.price === 0);
  // Desconto de 10% (2026-08-30): já não depende do total do pedido, depende de o
  // cliente ADICIONAR um segundo serviço (upsell) que sozinho valha mais de 60€ (ex:
  // colchão, 3 cadeiras, tapete de 5m²) — a lógica de negócio é "aproveitar a mesma
  // deslocação para mais serviço". Um item de upsell "sob orçamento" (price=0) conta
  // sempre como qualificado, é implicitamente um pedido grande.
  const MIN_UPSELL_FOR_DISCOUNT = 60;
  const packDiscountActive = upsellItems.some(i => i.price > MIN_UPSELL_FOR_DISCOUNT || i.price === 0);
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
