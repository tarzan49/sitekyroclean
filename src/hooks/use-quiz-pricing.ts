import { endIn9Down } from '@/constants/chairPricing';
import { calculateTravelFee, smallOrderFarSurcharge } from '@/constants/travel';
import { rugPickupFee } from '@/constants/commercialPolicy';
import { splitTreatmentItems } from '@/components/quiz/quizHelpers';
import { useMemo } from 'react';
import type { QuizFormData, SofaItem, MattressItem, CarpetItem, UpsellItemConfig } from '@/components/quiz';
import { sofaPrices, mattressPrices, locationPrices } from '@/components/quiz';
import { calcSofaUnitPrice, calcMattressUnitPrice, calcChairAntiAcaros, calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, carpetHasValidItems, carpetTotalArea } from '@/components/quiz/quizHelpers';
import { siteRugPrice } from '@/lib/siteRugPrice';

export function useQuizPricing(
  formData: QuizFormData,
  sofaItems: SofaItem[],
  mattressItems: MattressItem[],
  upsellItems: UpsellItemConfig[],
  carpetItems: CarpetItem[],
) {
  // Calculate total price early for analytics (moved up for hook dependency).
  // Preço do tapete/alcatifa pelo motor do bot (rugEstimate.homePrice, deslocação incluída); null = sob orçamento.
  const carpetEnginePrice = useMemo(() => formData.service !== 'carpet' ? null : siteRugPrice(
    carpetItems.map(it => ({ width: parseFloat(String(it.largura).replace(',', '.')) || 0, length: parseFloat(String(it.comprimento).replace(',', '.')) || 0 })),
    formData.location, false, formData.carpetKind === 'alcatifa' ? 'carpet' : 'rug',
  ), [formData.service, formData.location, formData.carpetKind, carpetItems]);

  const calculateServicePrice = useMemo(() => {
    let price = 0;

    switch (formData.service) {
      case 'sofa': {
        splitTreatmentItems(sofaItems).forEach(item => {
          if (item.qty <= 0) return;
          const opt = sofaPrices.find(p => p.id === item.sizeId);
          if (!opt) return;
          const unitPrice = calcSofaUnitPrice(opt, item.packEnabled, formData.serviceType, formData.waterproofingTier, formData.sofaAntiAcaros) ?? 0;
          if (unitPrice > 0) price += unitPrice * item.qty;
        });
        break;
      }

      case 'mattress': {
        splitTreatmentItems(mattressItems).forEach(item => {
          if (item.qty <= 0) return;
          const opt = mattressPrices.find(p => p.id === item.sizeId);
          if (!opt) return;
          const unitPrice = calcMattressUnitPrice(opt, item.packEnabled, formData.serviceType) ?? 0;
          if (unitPrice > 0) price += unitPrice * item.qty;
        });
        break;
      }

      case 'chairs': {
        const isPremium = formData.waterproofingTier === 'premium';
        const calcWaterproof = isPremium ? calcChairWaterproofPremium : calcChairWaterproof;
        const chairQty = parseInt(formData.chairQuantity);
        let chairs = 0;
        if (!isNaN(chairQty) && chairQty > 0) {
          chairs += formData.serviceType === 'waterproofing'
            ? (calcWaterproof(chairQty) ?? 0)
            : (calcChairClean(chairQty, Math.min(formData.chairWaterproofQty || 0, chairQty)) ?? 0);
        }
        const addonQty = formData.chairWaterproofQty;
        if (addonQty > 0) {
          chairs += formData.serviceType === 'waterproofing'
            ? (calcChairClean(addonQty, addonQty) ?? 0)
            : (calcWaterproof(addonQty) ?? 0);
          // Limpeza + impermeabilização: total a acabar em 9, para baixo (dono, 24 Nov 2026).
          chairs = endIn9Down(chairs);
        }
        price += chairs;
        // Anti-ácaros das cadeiras: mesma regra e mesmo preço que o recibo
        // (chairAntiAcarosQty), nunca junto com a impermeabilização.
        price += calcChairAntiAcaros(formData);
        break;
      }

      case 'carpet': {
        // Tapetes e alcatifas com o preço do motor do bot, deslocação incluída (dono, 24 Nov 2026).
        price += carpetEnginePrice ?? 0;
        break;
      }
    }

    return price;
  }, [formData, sofaItems, mattressItems, carpetItems, carpetEnginePrice]);

  // Calculate travel cost: uses expanded locationPrices from QuizTypes.
  // Taxa base antes da oferta por valor dos serviços. Antes de escolher localização não há
  // preço nenhum a mostrar (0), evitando um "10€" enganoso logo no 1º passo do quiz.
  // "other" (localização fora da tabela) usa o mínimo garantido do site (10€).
  const travelCost = useMemo(() => {
    if (!formData.location) return 0;
    if (formData.location === 'other') return 10;
    return locationPrices[formData.location] ?? 10;
  }, [formData.location]);


  const safePrice = (n: number) => (isNaN(n) || n == null) ? 0 : n;
  const upsellItemsTotal = upsellItems.reduce((sum, item) => sum + safePrice(item.price), 0);
  // Tapetes e alcatifas (dono, 2026-10-05): na lavagem em casa a deslocação é
  // sob orçamento, por isso não entra no total; com recolha, a recolha e
  // entrega (rugPickupFee) já inclui a deslocação e é o único valor conhecido.
  const isRugService = formData.service === 'carpet';
  const rugPickupCost = isRugService && formData.carpetKind !== 'alcatifa' && formData.rugPickup
    ? rugPickupFee(carpetTotalArea(carpetItems), formData.location) : null;
  const rugTravelOnQuote = isRugService && rugPickupCost === null;
  // Serviço abaixo de 49€ a mais de 20 km de carro de Odivelas = +10€ (dono, 23 Nov 2026), somado à
  // deslocação para o total, o recibo, o email e o CRM baterem certo; o resumo mostra-o numa linha própria.
  const smallOrderSurchargeCost = isRugService ? 0 : smallOrderFarSurcharge(formData.location, formData.locationPlace, safePrice(calculateServicePrice) + upsellItemsTotal);
  const finalTravelCost = isRugService ? 0 : calculateTravelFee(travelCost, safePrice(calculateServicePrice) + upsellItemsTotal) + smallOrderSurchargeCost;
  const totalPrice = safePrice(calculateServicePrice) + safePrice(upsellItemsTotal) + safePrice(finalTravelCost) + (rugPickupCost ?? 0);
  // Sofás: qualquer unidade a que o motor não dá preço (canto, em U ou
  // modular; 5+ lugares com impermeabilização ou anti-ácaros), pela mesma
  // conta que o total, em vez de uma lista de ids escrita à mão.
  const sofaNeedsQuote = formData.service === 'sofa' && splitTreatmentItems(sofaItems).some(item => {
    const opt = sofaPrices.find(p => p.id === item.sizeId);
    return !opt || calcSofaUnitPrice(opt, item.packEnabled, formData.serviceType, formData.waterproofingTier, formData.sofaAntiAcaros) === null;
  });
  // True when a sofa unit has no engine price (above), or any measured
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
    sofaNeedsQuote ||
    (formData.service === 'carpet' && carpetHasValidItems(carpetItems) && carpetEnginePrice === null) ||
    chairPrimaryNeedsQuote ||
    chairAddonNeedsQuote;
  // Any upsell item with price=0 is a SOB item (chairs ≥10, tapetes (sempre), sofá de canto, em U ou modular)
  const hasUpsellSobItem = upsellItems.some(i => i.price === 0);

  return {
    calculateServicePrice,
    travelCost,
    finalTravelCost,
    smallOrderSurchargeCost,
    rugPickupCost,
    rugTravelOnQuote,
    totalPrice,
    hasSobOrcamento,
    hasUpsellSobItem,
  };
}
