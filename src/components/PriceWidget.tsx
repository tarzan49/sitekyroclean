import QuizEstimate from '@/components/quiz/QuizEstimate';
import QuizFurnitureImage from '@/components/quiz/QuizFurnitureImage';
import { WaterproofingTierPicker } from "@/components/quiz/steps/WaterproofingTierPicker";
import { lazy, Suspense, useState } from "react";
import { useLocation } from "react-router-dom";
import { carpetAllItemsValid } from "@/components/quiz/quizHelpers";
const SofaPackPreview = lazy(() => import("@/components/SofaPackPreview"));
import { Minus, Plus, ChevronRight, MapPin, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePriceWidgetState } from "@/hooks/use-price-widget";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";
import QuizFormLazy from "@/components/QuizFormLazy";
import { locationPrices } from "@/components/quiz/QuizTypes";
import type { PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import {
  widgetWaterproofPrice, calcWidgetTotal, calcChairBracket, calcWidgetPricing,
} from "@/lib/priceWidgetCalc";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG } from "@/data/locationPriceTestimonialsData";

// Shared marketing widget: uses the quiz images and existing pricing engine.
interface Props {
  serviceSlug: string;
  initialLocation?: string;
}

export default function PriceWidget({ serviceSlug, initialLocation }: Props) {
  const { search } = useLocation();
  const isPackPreview = import.meta.env.DEV && new URLSearchParams(search).get('teste') === 'pack' && serviceSlug === 'limpeza-sofas';
  const [showPackPreview, setShowPackPreview] = useState(false);
  const rows = PRICE_TABLE[serviceSlug];
  const { isQuizOpen, openQuiz, closeQuiz } = useQuizLauncher();
  const [activeConfig, setActiveConfig] = useState<PriceRowQuizConfig | null>(null);
  const w = usePriceWidgetState(serviceSlug);

  if (!rows) return null;

  const quizConfigs = PRICE_TABLE_QUIZ_CONFIG[serviceSlug] ?? [];
  const isAlcatifaService = serviceSlug === 'limpeza-alcatifas';
  const isWaterproofService = serviceSlug === 'impermeabilizacao';

  const handleContinue = () => {
    if (isPackPreview) {
      if ((w.rowQuantities[3] ?? 0) === 0) setShowPackPreview(true);
      return;
    }
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
  const pricing = calcWidgetPricing(total, travelFee);
  const incompleteMeasures = Object.values(w.carpetItemsByRow).some(items => !carpetAllItemsValid(items));
  const hasSelection = total > 0 || Object.values(w.rowQuantities).some(q => q > 0) || w.chaiseLongueAddon > 0;

  const hasUnpricedSelection = quizConfigs.some((cfg, i) => cfg && (w.rowQuantities[i] ?? 0) > 0 && (
    cfg.service === 'carpet' || cfg.sofaSizeId === '4+-lugares' ||
    (cfg.service === 'chairs' && calcChairBracket(w.rowQuantities[i], isWaterproofService, w.addonTier) === null)
  ));

  return (
    <div
      className="w-full max-w-lg mx-auto rounded-sm overflow-hidden border border-white/[0.18] bg-checker-modal text-left"
      style={{ boxShadow: "0 8px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)" }}
    >
      <div className="px-5 sm:px-6 py-4 flex items-center justify-between gap-2 border-b border-gold/20">
        <div className="flex items-center gap-2">
          <span className="font-playfair text-[14px] font-bold text-white/90 leading-none">Kyro</span>
          <span className="h-3 w-px bg-white/20" />
          <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-gold/65">Orçamento</span>
        </div>
        {initialLocation && <span className="inline-flex items-center gap-1 text-xs text-white/65"><MapPin className="h-3.5 w-3.5" />{initialLocation}</span>}
      </div>
      {hasSelection && <div className="px-4 sm:px-6">
        <QuizEstimate totalPrice={total > 0 ? pricing.grandTotal : 0} needsQuote={hasUnpricedSelection} travelOnly={false} location={initialLocation ?? ''} travelCost={initialLocation && total > 0 ? travelFee : undefined} />
        {!initialLocation && <p className="pt-2 text-center text-xs text-white/65">Deslocação a confirmar conforme a localidade.</p>}
      </div>}
      <div className="px-4 sm:px-6 pt-5 pb-4 text-center">
        <p className="text-gold text-[11px] font-bold tracking-[0.28em] uppercase mb-3">{isWaterproofService ? 'PROTEÇÃO' : 'QUANTIDADES'}</p>
        <h3 className="font-playfair text-white font-bold text-2xl sm:text-3xl leading-tight">{isWaterproofService ? 'Escolha a sua impermeabilização' : serviceSlug === 'limpeza-sofas' ? 'Detalhes do(s) Sofá(s)' : serviceSlug === 'limpeza-colchoes' ? 'Detalhes do(s) Colchão(ões)' : 'Detalhes do serviço'}</h3>
        <p className="text-sm mt-2 text-white/65">Escolha o tamanho e a quantidade.</p>
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
      <div className="px-3 sm:px-0 pb-4 space-y-2 w-full max-w-sm mx-auto">
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
            <div key={i} className={cn("rounded-sm border-2 transition-all duration-200 overflow-hidden", active ? "border-gold/50 bg-[#1a2a1a] shadow-[0_0_8px_rgba(212,175,55,0.10)]" : "border-dashed border-gold/30 bg-gold/[0.03]")}>
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-3">
                <QuizFurnitureImage service={quizConfig.service as 'sofa' | 'mattress' | 'chairs'} sizeId={quizConfig.sofaSizeId ?? quizConfig.mattressSizeId} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] sm:text-sm font-semibold leading-snug text-white">{row.item}</p>
                  {dynamicPrice !== null && <p className={cn("text-sm font-bold mt-0.5 tabular-nums", active ? "text-white/80" : "text-white/70")}>{dynamicPrice}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => w.adjustQty(i, -1)} disabled={qty === 0} aria-label={`Diminuir ${row.item}`} className="w-11 h-11 sm:w-12 sm:h-12 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white flex items-center justify-center disabled:opacity-35 active:scale-95 transition-all touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"><Minus className="w-4 h-4" /></button>
                  <span className="w-5 text-center text-base font-bold tabular-nums text-white">{qty}</span>
                  <button type="button" onClick={() => w.adjustQty(i, 1)} aria-label={`Aumentar ${row.item}`} className="w-11 h-11 sm:w-12 sm:h-12 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-3 sm:px-0 pb-5 w-full max-w-sm mx-auto">
        {!hasSelection && <p className="text-xs text-white/80 mb-3">{initialLocation ? `Deslocação a ${initialLocation}: ${travelFee} €` : 'Deslocação calculada conforme a localidade.'}</p>}
        <button type="button" onClick={handleContinue} disabled={!hasSelection || incompleteMeasures} className={cn("w-full h-12 flex items-center justify-center gap-3 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold text-base touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_4px_28px_rgba(212,175,55,0.40)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white", !hasSelection && "opacity-60")}>
          Continuar <ChevronRight className="w-5 h-5" />
        </button>
        <p className="flex justify-center items-center gap-2 text-xs mt-3 text-white/80"><ShieldCheck className="w-4 h-4" />Gratuito e sem compromisso</p>
      </div>

      {isPackPreview && showPackPreview && <Suspense fallback={<p className="p-4 text-white">A abrir oferta…</p>}><SofaPackPreview
        base={total} travel={travelFee} city={initialLocation ?? 'Lisboa'}
        items={rows.flatMap((row, index) => (w.rowQuantities[index] ?? 0) > 0 ? [`${w.rowQuantities[index]} × ${row.item}`] : [])}
        onClose={() => setShowPackPreview(false)}
      /></Suspense>}
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
          initialCarpetKind={serviceSlug === 'limpeza-alcatifas' ? 'alcatifa' : 'tapete'}
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
