import QuizFurnitureImage from '@/components/quiz/QuizFurnitureImage';
import { WaterproofingTierPicker } from "@/components/quiz/steps/WaterproofingTierPicker";
import { useState } from "react";
import { Minus, Plus, Check, ChevronRight, MapPin, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePriceWidgetState } from "@/hooks/use-price-widget";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";
import QuizFormLazy from "@/components/QuizFormLazy";
import { locationPrices } from "@/components/quiz/QuizTypes";
import type { PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import {
  widgetWaterproofPrice, calcWidgetTotal, calcChairBracket, calcWidgetPricing, calcWidgetArticles,
} from "@/lib/priceWidgetCalc";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG } from "@/data/locationPriceTestimonialsData";

// Shared marketing widget: uses the quiz images and existing pricing engine.
interface Props {
  serviceSlug: string;
  initialLocation?: string;
}

export default function PriceWidget({ serviceSlug, initialLocation }: Props) {
  const rows = PRICE_TABLE[serviceSlug];
  const { isQuizOpen, openQuiz, closeQuiz } = useQuizLauncher();
  const [activeConfig, setActiveConfig] = useState<PriceRowQuizConfig | null>(null);
  const w = usePriceWidgetState(serviceSlug);

  if (!rows) return null;

  const quizConfigs = PRICE_TABLE_QUIZ_CONFIG[serviceSlug] ?? [];
  const isAlcatifaService = serviceSlug === 'limpeza-alcatifas';
  const isWaterproofService = serviceSlug === 'impermeabilizacao';

  const handleContinue = () => {
    const config = w.buildConfig();
    if (!config) return;
    setActiveConfig(config);
    openQuiz();
  };

  // Impermeabilizar/Anti Ácaros deixaram de se decidir aqui (pedido explícito
  // 2026-09-08): ao clicar "Continuar", essa escolha faz-se no ecrã de upsell
  // dedicado que o próprio quiz já mostra a seguir às quantidades — nunca
  // duplicar a mesma decisão em dois sítios.
  const total = calcWidgetTotal(serviceSlug, w.rowQuantities, w.chaiseLongueAddon, new Set(), w.addonTier);
  const travelFee = initialLocation ? (locationPrices[initialLocation] ?? 10) : 0;
  const articles = calcWidgetArticles(serviceSlug, w.rowQuantities, new Set(), w.addonTier);
  const pricing = calcWidgetPricing(total, travelFee, articles);
  const hasSelection = total > 0 || Object.values(w.rowQuantities).some(q => q > 0) || w.chaiseLongueAddon > 0;

  const hasUnpricedSelection = quizConfigs.some((cfg, i) => cfg && (w.rowQuantities[i] ?? 0) > 0 && (
    cfg.service === 'carpet' || cfg.sofaSizeId === '4+-lugares' ||
    (cfg.service === 'chairs' && calcChairBracket(w.rowQuantities[i], isWaterproofService, w.addonTier) === null)
  ));

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/15 bg-[#0d2a1c] text-left"
      style={{ boxShadow: "0 16px 40px rgba(7,26,18,0.16)" }}
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#e1c477]">Orçamento gratuito</p>
          {initialLocation && <span className="inline-flex items-center gap-1 text-xs text-white/85"><MapPin className="h-3.5 w-3.5" />{initialLocation}</span>}
        </div>
        <h3 className="font-playfair text-white font-bold text-2xl leading-tight">{isWaterproofService ? 'Escolha a sua impermeabilização' : serviceSlug === 'limpeza-sofas' ? 'Quanto custa limpar o seu sofá?' : 'Prepare o seu orçamento'}</h3>
        <p className="text-sm mt-2 text-white/80">Escolha o tamanho e a quantidade.</p>
      </div>

      {isWaterproofService && (
        <div className="px-4 pb-3">
          <WaterproofingTierPicker
            formData={{ waterproofingTier: w.addonTier }}
            activeTier={w.tierChosen ? w.addonTier : null}
            updateFormData={updates => { if (updates.waterproofingTier) w.setAddonTier(updates.waterproofingTier); }}
            onSelect={() => w.setTierChosen(true)}
          />
          <p className="text-xs text-white/60 mt-3">{w.tierChosen ? 'Escolha agora os artigos e as quantidades a proteger.' : 'Selecione uma opção para ver os preços e as quantidades.'}</p>
        </div>
      )}
      {/* Linhas */}
      <div className="px-3 sm:px-4 pb-4 space-y-2">
        {(!isWaterproofService || w.tierChosen) && rows.map((row, i) => {
          const quizConfig = quizConfigs[i] ?? null;

          // Linhas sem quizConfig (ex. chaise longue) não têm equivalente real
          // no quiz — pedido explícito 2026-09-08 para não as mostrar aqui.
          if (!quizConfig) return null;

          const qty = w.rowQuantities[i] ?? 0;
          const active = qty > 0;
          const isCarpet = quizConfig.service === 'carpet';
          const isChair = quizConfig.service === 'chairs';

          const chairP = isChair && qty > 0 ? calcChairBracket(qty, isWaterproofService, w.addonTier) : undefined;
          const dynamicPrice: string | null = isChair
            ? (qty <= 0 ? (isWaterproofService ? `${widgetWaterproofPrice(quizConfig, w.addonTier)}€/cad` : null) : chairP === null ? 'Sob orçamento' : `${chairP}€`)
            : isCarpet
            ? 'Sob orçamento' // tapete e alcatifa: nunca têm preço calculado (2026-09-09)
            : isWaterproofService
            ? (widgetWaterproofPrice(quizConfig, w.addonTier) === null ? 'Sob orçamento' : `${widgetWaterproofPrice(quizConfig, w.addonTier)}€`)
            : row.price;

          // Tapetes E alcatifa: várias peças medidas (largura × comprimento)
          // — mesmo simulador para as duas (pedido explícito 2026-09-09:
          // "o de alcatifa e facil resolver e so replicar o widget de
          // tapetes"), uma alcatifa raramente é um único retângulo (várias
          // divisões, corredores, recortes). Preço: as duas são sempre "sob
          // orçamento" (pedido explícito 2026-09-09: "limpeza de alcatifa e
          // sempre sob orçamento assim como tapete" — alcatifa deixou de ter
          // tabela de preço por m²). A área total de alcatifa mostra-se só a
          // título informativo, não entra em nenhum cálculo.
          if (isCarpet) {
            const items = w.getCarpetItems(i);
            const pieceLabel = isAlcatifaService ? "Divisão" : "Tapete";
            return (
              <div
                key={i}
                className={cn(
                  "px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-sm border-2 transition-all duration-200",
                  active ? "border-gold/50 bg-[#1a2a1a] shadow-[0_0_10px_rgba(212,175,55,0.15)]" : "border-dashed border-white/25 bg-white/[0.02]"
                )}
              >
                <div className="flex flex-col gap-2">
                  {items.map((item, idx) => {
                    const area = w.carpetItemArea(item);
                    return (
                      <div key={item.id} className="rounded-sm border border-white/15 bg-white/[0.03] px-3 py-2.5 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wide text-white/35">{pieceLabel} {idx + 1}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-bold tabular-nums", area > 0 ? "text-gold" : "text-white/25")}>
                              {area > 0 ? `${Math.round(area * 100) / 100} m²` : ''}
                            </span>
                            {items.length > 1 && (
                              <button type="button" onClick={() => w.removeCarpetItem(i, item.id)} aria-label={`Remover ${pieceLabel.toLowerCase()}`} className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-white/30 hover:text-white/70 text-base leading-none">×</button>
                            )}
                          </div>
                        </div>
                        {/* Campos grandes de propósito (pedido explícito 2026-09-09:
                            "as pessoas mais velhas irão ter dificuldade") — sem os
                            spinners nativos do input number, que só ocupavam largura
                            já escassa sem ajudar a legibilidade. */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min={0} step={0.1} inputMode="decimal" placeholder="Larg." value={item.largura}
                            onChange={e => w.updateCarpetItem(i, item.id, 'largura', e.target.value)}
                            className="flex-1 min-w-0 text-center text-lg font-semibold outline-none rounded-sm border border-white/20 bg-white/[0.05] text-white placeholder:text-white/25 px-2 py-2.5 focus:border-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-sm flex-shrink-0 text-white/25">×</span>
                          <input
                            type="number" min={0} step={0.1} inputMode="decimal" placeholder="Compr." value={item.comprimento}
                            onChange={e => w.updateCarpetItem(i, item.id, 'comprimento', e.target.value)}
                            className="flex-1 min-w-0 text-center text-lg font-semibold outline-none rounded-sm border border-white/20 bg-white/[0.05] text-white placeholder:text-white/25 px-2 py-2.5 focus:border-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => w.addCarpetItem(i)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-sm border-2 border-dashed border-gold/30 text-gold/80 text-[11px] font-bold hover:border-gold/60 hover:bg-gold/[0.04] transition-all touch-manipulation"
                  >
                    <Plus className="w-3 h-3" /> Adicionar outra {pieceLabel.toLowerCase()}
                  </button>
                  {isAlcatifaService && (
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] text-white/35">Área total</span>
                      <span className={cn("text-xs font-bold tabular-nums", qty > 0 ? "text-gold" : "text-white/25")}>
                        {qty > 0 ? `${Math.round(qty * 100) / 100} m²` : '—'}
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] text-center text-white/35">
                    Cada {pieceLabel.toLowerCase()} é sempre <span className="text-gold font-bold">sob orçamento</span>
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div key={i} className={cn("rounded-xl border transition-colors", active ? "border-[#d4b563] bg-[#254535]" : "border-dashed border-white/30 bg-white/[0.025]")}>
              <div className="flex items-center gap-2 px-2 py-3">
                <QuizFurnitureImage service={quizConfig.service as 'sofa' | 'mattress' | 'chairs'} sizeId={quizConfig.sofaSizeId ?? quizConfig.mattressSizeId} className="!w-11 !h-11 sm:!w-14 sm:!h-14" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] sm:text-sm font-semibold leading-snug text-white">{row.item}</p>
                  {dynamicPrice !== null && <p className={cn("text-sm mt-1 tabular-nums", active ? "text-[#ecd38d]" : "text-white/85")}>{dynamicPrice}</p>}
                </div>
                <div className="flex items-center shrink-0">
                  <button type="button" onClick={() => w.adjustQty(i, -1)} disabled={qty === 0} aria-label={`Diminuir ${row.item}`} className="w-11 h-11 rounded-full border border-white/35 text-white flex items-center justify-center disabled:opacity-35 active:scale-95 transition-all touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"><Minus className="w-4 h-4" /></button>
                  <span className="w-6 text-center text-base font-semibold tabular-nums text-white">{qty}</span>
                  <button type="button" onClick={() => w.adjustQty(i, 1)} aria-label={`Aumentar ${row.item}`} className={cn("w-11 h-11 rounded-full border flex items-center justify-center active:scale-95 transition-all touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold", active ? "bg-[#d4b563] border-[#d4b563] text-[#071a12]" : "border-white/40 text-white hover:border-gold")}><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 pb-5">
        {hasSelection && <div aria-live="polite" className="border-t border-white/20 pt-4 mb-4 space-y-2">
          <div className="flex justify-between gap-3 text-sm text-white/85"><span>Serviços</span><span className="font-semibold">{total > 0 ? `${total} €` : 'Sob orçamento'}</span></div>
          <div className="flex justify-between gap-3 text-sm text-white/85"><span>Deslocação{initialLocation ? ` a ${initialLocation}` : ''}</span><span className="font-semibold">{initialLocation ? `${travelFee} €` : 'A confirmar'}</span></div>
          {pricing.discountActive && <div className="flex items-center justify-between gap-2 rounded-lg bg-gold/10 p-3 text-[#ecd38d]"><span className="text-sm flex items-center gap-2"><Check className="h-4 w-4" />Poupa 10% nos serviços</span><strong className="whitespace-nowrap">−{pricing.grandTotal - pricing.discountedTotal} €</strong></div>}
          <div className="flex items-center justify-between gap-3 border-t border-white/20 pt-3 !mt-3">
            <span className="font-playfair font-bold text-lg text-white">Total estimado</span>
            <div className="text-right">
              {pricing.discountActive && <p className="text-xs line-through text-white/65">{pricing.grandTotal} €</p>}
              <span className="font-playfair text-2xl font-bold text-[#ecd38d]">{total > 0 ? `${pricing.discountActive ? pricing.discountedTotal : pricing.grandTotal} €` : 'Sob orçamento'}</span>
            </div>
          </div>
          {hasUnpricedSelection && total > 0 && <p className="text-xs text-white/80">Acresce o valor dos artigos sob orçamento.</p>}
          {!initialLocation && total > 0 && <p className="text-xs text-white/80">Deslocação a confirmar no próximo passo.</p>}
        </div>}
        {!hasSelection && <p className="text-xs text-white/80 mb-3">{initialLocation ? `Deslocação a ${initialLocation}: ${travelFee} €` : 'Deslocação calculada conforme a localidade.'}</p>}
        <button type="button" onClick={handleContinue} disabled={!hasSelection} className={cn("w-full h-12 flex items-center justify-center gap-3 bg-[#d4b563] hover:bg-[#e1c477] text-[#071a12] font-bold text-base touch-manipulation active:scale-[0.98] rounded-xl transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white", !hasSelection && "opacity-60")}>
          Continuar <ChevronRight className="w-5 h-5" />
        </button>
        <p className="flex justify-center items-center gap-2 text-xs mt-3 text-white/80"><ShieldCheck className="w-4 h-4" />Gratuito e sem compromisso</p>
      </div>

      {activeConfig && (
        <QuizFormLazy
          isOpen={isQuizOpen}
          onClose={closeQuiz}
          initialLocation={initialLocation}
          initialService={activeConfig.service}
          initialServiceType={activeConfig.serviceType}
          initialSofaItems={activeConfig.sofaItems}
          initialSofaSizeId={activeConfig.sofaSizeId}
          initialSofaQty={activeConfig.sofaQty}
          initialMattressItems={activeConfig.mattressItems}
          initialMattressSizeId={activeConfig.mattressSizeId}
          initialMattressQty={activeConfig.mattressQty}
          initialCarpetArea={activeConfig.carpetArea}
          initialCarpetItems={activeConfig.carpetItems}
          initialChairQty={activeConfig.chairQty}
          initialUpsellItems={activeConfig.initialUpsellItems}
          initialWaterproofingTier={activeConfig.waterproofingTier}
          initialChairWaterproofing={activeConfig.chairWaterproofing}
          skipToUpsell
        />
      )}
    </div>
  );
}
