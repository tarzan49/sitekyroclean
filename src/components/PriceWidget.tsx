import { useState } from "react";
import { Minus, Plus, Check, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePriceWidgetState } from "@/hooks/use-price-widget";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";
import QuizFormLazy from "@/components/QuizFormLazy";
import { CarpetTierLegend } from "@/components/CarpetTierLegend";
import { locationPrices } from "@/components/quiz/QuizTypes";
import type { PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import {
  calcWidgetTotal, calcChairBracket, calcCarpetWidget, calcWidgetPricing, calcWidgetArticles,
  PACK_DISCOUNT_MIN_SERVICE, PACK_DISCOUNT_MIN_UPSELL_ITEM,
} from "@/lib/priceWidgetCalc";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG } from "@/data/locationPriceTestimonialsData";

// Card único do widget de preços — mesma linguagem visual do quiz (QuizForm.tsx
// e QuizStepConfig*.tsx): fundo escuro #12121e/#1a2a1a, dourado (#D4AF37/"gold"),
// font-playfair nos números, cantos rounded-sm, borda tracejada nos itens ainda
// não escolhidos. Mas em escala compacta de LISTA (várias linhas visíveis de
// uma vez, embutido numa página) — o quiz usa steppers grandes (w-14 h-14)
// porque mostra um de cada vez a ecrã inteiro; aqui isso ficava enorme e vazio
// com 5-6 linhas (pedido explícito 2026-09-08: "ta muito grande, quero algo
// igual ao quiz mas proporcional").
//
// Usado pelas 3 páginas que mostram esta tabela de preços (ver "terceira
// armadilha" no CLAUDE.md) — qualquer alteração visual faz-se só aqui.
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
  const total = calcWidgetTotal(serviceSlug, w.rowQuantities, w.chaiseLongueAddon);
  const travelFee = initialLocation ? (locationPrices[initialLocation] ?? 10) : 0;
  const articles = calcWidgetArticles(serviceSlug, w.rowQuantities);
  const pricing = calcWidgetPricing(total, travelFee, articles);
  const hasSelection = total > 0 || Object.values(w.rowQuantities).some(q => q > 0) || w.chaiseLongueAddon > 0;

  return (
    <div
      className="rounded-sm overflow-hidden border border-white/[0.10] bg-checker-modal"
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)" }}
    >
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-white/[0.06]" style={{ background: "linear-gradient(135deg, #0d2a1c 0%, #071a12 100%)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] flex-shrink-0 animate-pulse" />
          <p className="text-[9px] font-bold tracking-[0.24em] uppercase text-gold/70">Orçamento Gratuito</p>
        </div>
        <p className="font-playfair text-white font-bold text-sm sm:text-base leading-snug">Escolha as quantidades e continue</p>
        <p className="text-[11px] mt-0.5 text-white/35">Sem compromisso · Resposta em menos de 30 min</p>
      </div>

      {/* Linhas */}
      <div className="py-2 px-2 space-y-1.5">
        {rows.map((row, i) => {
          const quizConfig = quizConfigs[i] ?? null;

          // Linhas sem quizConfig (ex. chaise longue) não têm equivalente real
          // no quiz — pedido explícito 2026-09-08 para não as mostrar aqui.
          if (!quizConfig) return null;

          const qty = w.rowQuantities[i] ?? 0;
          const active = qty > 0;
          const isCarpet = quizConfig.service === 'carpet';
          const isChair = quizConfig.service === 'chairs';

          const chairP = isChair && qty > 0 ? calcChairBracket(qty, isWaterproofService) : undefined;
          const carpetP = isCarpet && qty > 0 ? calcCarpetWidget(qty, isAlcatifaService) : undefined;
          const dynamicPrice: string | null = isChair
            ? (qty <= 0 ? null : chairP === null ? 'Sob orçamento' : `${chairP}€`)
            : isCarpet
            ? (qty <= 0 ? (isAlcatifaService ? '3€/m²' : 'Sob orçamento') : carpetP == null ? 'Sob orçamento' : `${Math.round(carpetP * 10) / 10}€`)
            : row.price;

          // Alcatifa: input numérico de m²
          if (isCarpet && isAlcatifaService) {
            return (
              <div
                key={i}
                className={cn(
                  "px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-sm border-2 transition-all duration-200",
                  active ? "border-gold/50 bg-[#1a2a1a] shadow-[0_0_10px_rgba(212,175,55,0.15)]" : "border-dashed border-white/25 bg-white/[0.02]"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Campo grande de propósito, igual ao dos tapetes (pedido
                      explícito 2026-09-09) — sem spinners nativos. */}
                  <input
                    type="number" min={0} max={50} inputMode="decimal"
                    value={qty || ''} placeholder="0"
                    onChange={e => w.setAlcatifaQty(i, parseFloat(e.target.value) || 0)}
                    className="w-24 text-center text-lg font-semibold outline-none rounded-sm border border-white/20 bg-white/[0.05] text-white placeholder:text-white/25 px-2 py-2.5 focus:border-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-sm font-medium text-white/40">m²</span>
                  <span className="flex-1" />
                  {dynamicPrice !== null && (
                    <span className={cn("font-playfair text-lg font-bold tabular-nums", active ? "text-gold" : "text-white")}>{dynamicPrice}</span>
                  )}
                </div>
                <CarpetTierLegend isAlcatifa={isAlcatifaService} qty={qty} />
              </div>
            );
          }

          // Tapetes: várias peças medidas (largura × comprimento)
          if (isCarpet) {
            const items = w.getCarpetItems(i);
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
                          <span className="text-[9px] font-bold uppercase tracking-wide text-white/35">Tapete {idx + 1}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-bold tabular-nums", area > 0 ? "text-gold" : "text-white/25")}>
                              {area > 0 ? `${Math.round(area * 100) / 100} m²` : ''}
                            </span>
                            {items.length > 1 && (
                              <button type="button" onClick={() => w.removeCarpetItem(i, item.id)} aria-label="Remover tapete" className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-white/30 hover:text-white/70 text-base leading-none">×</button>
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
                    <Plus className="w-3 h-3" /> Adicionar outro tapete
                  </button>
                  <p className="text-[10px] text-center text-white/35">Cada tapete é sempre <span className="text-gold font-bold">sob orçamento</span></p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={i}
              className={cn(
                "rounded-sm border-2 overflow-hidden transition-all duration-200",
                active ? "border-gold/50 bg-[#1a2a1a] shadow-[0_0_10px_rgba(212,175,55,0.15)]" : "border-dashed border-white/25 bg-white/[0.02]"
              )}
            >
              <div className="flex items-center gap-2.5 px-3 py-2.5 sm:px-3.5 sm:py-3">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => w.adjustQty(i, -1)}
                    disabled={qty === 0}
                    aria-label="Diminuir"
                    className="w-9 h-9 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white flex items-center justify-center disabled:opacity-20 disabled:border-transparent disabled:bg-transparent active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  {/* Não usar font-playfair aqui: o "0" desse tipo de letra a
                      este tamanho lê-se facilmente como "o" (achado real ao
                      rever o widget) — algarismos pequenos ficam no tipo de
                      letra base, só os preços grandes usam Playfair. */}
                  <span className={cn("w-6 text-center text-base font-bold tabular-nums", active ? "text-gold" : "text-white/25")}>{qty}</span>
                  <button
                    type="button"
                    onClick={() => w.adjustQty(i, 1)}
                    aria-label="Aumentar"
                    className="w-9 h-9 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Nome+preço partilham uma sub-linha que pode quebrar (achado
                    real ao testar em 375px): nome e preço a competir em pé de
                    igualdade cortava o nome por completo em linhas com preço
                    comprido ("Sofá de 4+ lugares" + "Sob orçamento" ficava só
                    "Sob orçamento", sem nome nenhum visível). Com min-w no
                    nome, se os dois não cabem lado a lado o preço desce para
                    uma 2ª linha em vez de o nome desaparecer. */}
                <div className="flex-1 min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className={cn("min-w-[72px] flex-1 truncate text-[13px] font-medium transition-colors", active ? "text-white" : "text-white/45")}>{row.item}</span>
                  <span className="hidden sm:block flex-1 min-w-[8px] border-b border-dotted border-white/[0.15] mb-0.5" />
                  {dynamicPrice !== null && (
                    <span className={cn("font-playfair text-base font-bold tabular-nums flex-shrink-0 transition-colors", active ? "text-gold" : "text-white")}>
                      {dynamicPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discount bar */}
      <div className="px-3.5 sm:px-4 pb-1.5">
        {pricing.discountActive ? (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-sm" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.30)" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-gold">
              <Check className="w-3 h-3 text-[#12121e]" strokeWidth={3.5} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[11px] font-bold leading-none text-white">10% de desconto ativo</p>
              <p className="text-[9px] mt-1 leading-none text-white/40">Aplica-se a todo o pedido</p>
            </div>
            <span className="text-[9px] font-black px-1.5 py-1 rounded-sm bg-gold text-[#12121e] flex-shrink-0">-10%</span>
          </div>
        ) : (
          <p className="text-[10px] leading-snug text-white/35">
            Adicione um colchão, sofá, tapete, alcatifa ou algumas cadeiras a mais (desde <span className="text-white/70 font-semibold">{PACK_DISCOUNT_MIN_UPSELL_ITEM}€</span>) num pedido de <span className="text-white/70 font-semibold">{PACK_DISCOUNT_MIN_SERVICE}€+</span> e ganhe <span className="text-gold font-semibold">10% de desconto em tudo</span>.
          </p>
        )}
      </div>

      {/* Total + CTA */}
      <div className="px-3.5 sm:px-4 pb-4 pt-1 space-y-2">
        {travelFee > 0 && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-white/25" />
            <span className="text-[11px] text-white/40">+{travelFee}€ deslocação a {initialLocation}</span>
          </div>
        )}

        {hasSelection && total > 0 && (
          <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-sm" style={{ background: "linear-gradient(135deg, #0d2a1c 0%, #071a12 100%)" }}>
            <div>
              <p className="text-[9px] font-bold tracking-[0.16em] uppercase mb-0.5 text-white/40">
                {pricing.discountActive ? "Total com desconto" : "Total estimado"}
              </p>
              {pricing.discountActive && (
                <p className="text-[11px] line-through text-white/30">{pricing.grandTotal}€</p>
              )}
            </div>
            <span className="font-playfair font-bold tabular-nums text-xl sm:text-2xl leading-none text-gold">
              {pricing.discountActive ? pricing.discountedTotal : pricing.grandTotal}€
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!hasSelection}
          className={cn(
            "w-full h-11 sm:h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-xs sm:text-sm tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_24px_rgba(212,175,55,0.30)] transition-all",
            !hasSelection && "opacity-50"
          )}
        >
          Continuar para o Orçamento
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        </button>

        <p className="text-center text-[9px] text-white/30">Sem cartão · Sem compromisso · 100% gratuito</p>
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
