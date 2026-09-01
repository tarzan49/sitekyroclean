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
  // Calculate total price early for analytics (moved up for hook dependency).
  // Em paralelo, calcula também o "artigo base" de cada item (preço SEM addon,
  // por unidade) — usado só para decidir se o Pack Família qualifica (ver
  // packDiscountActive mais abaixo), nunca para o preço real cobrado.
  const { calculateServicePrice, articleBaseTotal, minQualifyingArticle } = useMemo(() => {
    let price = 0;
    let baseTotal = 0;
    let minQualifying: number | null = null;
    const noteCandidate = (p: number) => {
      if (p >= 60 && (minQualifying === null || p < minQualifying)) minQualifying = p;
    };

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
          // Essencial e Premium standalone (não é um combo com preço próprio) —
          // mas respeita primeiro o override packPremiumDelta (ex: 3-lugares tem
          // 20€ fixo em vez dos 30€ que a diferença standalone daria), exatamente
          // como calcPackPricing em quizHelpers.ts. Sem isto, o pack Premium do
          // sofá de 3 lugares saía 10€ mais caro aqui do que em todo o resto do
          // site (widget, Step 3, upsell), pois usava sempre a diferença bruta.
          const tierDelta = isPremium
            ? (typeof opt.packPremiumDelta === 'number'
                ? opt.packPremiumDelta
                : (typeof opt.waterproofingPremiumPrice === 'number' && typeof opt.waterproofingPrice === 'number'
                    ? opt.waterproofingPremiumPrice - opt.waterproofingPrice : 0))
            : 0;
          const bothEssencial = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : baseP + 40;
          const bothP = bothEssencial + tierDelta;
          // Os addons contam para o artigo (pedido explícito 2026-09-01: o
          // valor do Pack/Proteção ligado tem de entrar na conta do Pack
          // Família, tal como já entra no preço realmente cobrado — antes só
          // o preço base sem addon contava, o que fazia um sofá com uma
          // Proteção 10 anos cara continuar a não qualificar para o desconto).
          const unitPrice = item.packEnabled ? bothP : baseP;
          if (unitPrice > 0) { price += unitPrice * item.qty; baseTotal += unitPrice * item.qty; noteCandidate(unitPrice); }
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
        // Cadeiras (serviço principal + addon de impermeabilização, quando
        // ligado) contam como 1 artigo só, ao preço total do lote incluindo
        // o addon — os addons contam para o Pack Família (2026-09-01).
        const totalChairArticle = primaryChairPrice + addonChairPrice;
        if (totalChairArticle > 0) { baseTotal += totalChairArticle; noteCandidate(totalChairArticle); }
        break;
      }

      case 'carpet': {
        const carpetArea = parseFloat(formData.carpetArea);
        if (!isNaN(carpetArea) && carpetArea > 0) {
          const carpetP = calcCarpetPrice(carpetArea) ?? 0;
          price = carpetP;
          if (carpetP > 0) { baseTotal += carpetP; noteCandidate(carpetP); }
        }
        break;
      }
    }

    return { calculateServicePrice: price, articleBaseTotal: baseTotal, minQualifyingArticle: minQualifying };
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
    sofaItems.some(i => i.sizeId === '4+-lugares' && i.qty > 0) ||
    (formData.service === 'carpet' && parseFloat(formData.carpetArea) > 15) ||
    chairPrimaryNeedsQuote ||
    chairAddonNeedsQuote;
  // Any upsell item with price=0 is a SOB item (chairs ≥10, carpet >15m², sofa 4+ lugares)
  const hasUpsellSobItem = upsellItems.some(i => i.price === 0);
  // Desconto de 10% (2026-08-31, reformulado x4 — confirmado com 3 exemplos
  // concretos): conta-se cada UNIDADE de mobília (sofá, colchão, cadeiras
  // como lote, tapete) como um artigo ao seu preço BASE (sem addon) — tanto
  // as do serviço principal como as adicionadas via upsell (Pack Família).
  // Regra final: soma de todos os artigos > 160€ (100€ de base + 60€ do
  // artigo extra, não sobrepostos) E pelo menos um artigo, sozinho, vale
  // 60€ ou mais. Testado com 3 casos reais: 3 colchões casal de 69€ (207€,
  // >160, um artigo=69≥60) qualifica; 2 colchões casal de 69€ (138€, NÃO
  // passa 160) não qualifica; 2×sofá 1L 49€ + 1×sofá 2L 69€ (167€, >160,
  // artigo de 69≥60) qualifica. Uma tentativa anterior (subtrair o artigo
  // mínimo e exigir que o resto passasse 100€) falhava neste último caso
  // (98€ de resto, por 2€ não chegava aos 100€) — não é assim que funciona.
  // 'sofa-anti-acaros'/'chairs-anti-acaros' no upsellItems são tratamento no
  // mesmo item, não um artigo novo (só lá estão por conveniência de cálculo
  // no widget), por isso ficam de fora. Um artigo de upsell "sob orçamento"
  // conta sempre como qualificado (é implicitamente grande mesmo com 0€).
  const PACK_DISCOUNT_MIN_TOTAL = 160; // 100€ de base + 60€ do artigo extra
  const NON_ARTICLE_UPSELL_IDS = new Set(['sofa-anti-acaros', 'chairs-anti-acaros']);
  const articleUpsellItems = upsellItems.filter(i => !NON_ARTICLE_UPSELL_IDS.has(i.id));
  const upsellArticleTotal = articleUpsellItems.reduce((sum, item) => sum + safePrice(item.price), 0);
  const hasSubstantialUpsellArticle = articleUpsellItems.some(i => i.price >= 60);
  const totalArticleValue = articleBaseTotal + upsellArticleTotal;
  const hasSubstantialArticle = minQualifyingArticle !== null || hasSubstantialUpsellArticle;
  const packDiscountActive = (totalArticleValue > PACK_DISCOUNT_MIN_TOTAL && hasSubstantialArticle) || hasUpsellSobItem;
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
