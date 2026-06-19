import { useState } from "react";
import { CheckCircle, Minus, Plus, Sparkles } from "lucide-react";
import { calcWidgetTotal, calcChairBracket, calcCarpetWidget, WIDGET_DISCOUNT_THRESHOLD } from "@/lib/priceWidgetCalc";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";
import QuizFormLazy from "@/components/QuizFormLazy";
import SectionHeader from "@/components/SectionHeader";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import { PRICE_HEADING_VERB } from "@/constants/problemCardHelpers";

function PriceWidgetTotal({ serviceSlug, rowQuantities, chaiseLongueAddon }: {
  serviceSlug: string;
  rowQuantities: Record<number, number>;
  chaiseLongueAddon: number;
}) {
  const total = calcWidgetTotal(serviceSlug, rowQuantities, chaiseLongueAddon);
  const discountActive = total >= WIDGET_DISCOUNT_THRESHOLD;
  const progress = Math.min(100, (total / WIDGET_DISCOUNT_THRESHOLD) * 100);
  const discountedTotal = Math.round(total * 0.9);
  const remaining = Math.ceil(WIDGET_DISCOUNT_THRESHOLD - total);
  return (
    <div className="space-y-2">
      {!discountActive && (
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(17,17,17,0.40)" }}>
            <span>{total > 0 ? `Faltam ${remaining}€ para 10% de desconto` : `A partir de ${WIDGET_DISCOUNT_THRESHOLD}€ tem 10% de desconto`}</span>
            {total > 0 && <span>{total}€ / {WIDGET_DISCOUNT_THRESHOLD}€</span>}
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(17,17,17,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#C9A84C,#EDD96A)" }} />
          </div>
        </div>
      )}
      {total > 0 && (
        <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: discountActive ? "rgba(212,175,55,0.09)" : "rgba(17,17,17,0.03)" }}>
          <div className="flex items-center gap-1.5">
            {discountActive && <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D4AF37" }} />}
            <span className="text-sm font-medium" style={{ color: "#111111" }}>
              {discountActive ? "10% de desconto ativado!" : "Total estimado"}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            {discountActive && <span className="text-xs line-through" style={{ color: "rgba(17,17,17,0.35)" }}>{total}€</span>}
            <span className="font-playfair font-bold text-xl" style={{ color: "#D4AF37" }}>{discountActive ? discountedTotal : total}€</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  serviceSlug: string;
}

export default function ServicePriceSection({ serviceSlug }: Props) {
  const rows = PRICE_TABLE[serviceSlug];
  const { isQuizOpen, openQuiz, closeQuiz } = useQuizLauncher();
  const [activeConfig, setActiveConfig] = useState<PriceRowQuizConfig | null>(null);
  const [rowQuantities, setRowQuantities] = useState<Record<number, number>>({});
  const [chaiseLongueAddon, setChaiseLongueAddon] = useState(0);

  if (!rows) return null;

  const adjustQty = (i: number, delta: number, max?: number) => {
    setRowQuantities(prev => {
      const next = (prev[i] ?? 0) + delta;
      return { ...prev, [i]: Math.min(max ?? 99, Math.max(0, next)) };
    });
  };

  const handleContinue = () => {
    const configs = PRICE_TABLE_QUIZ_CONFIG[serviceSlug] ?? [];
    const svcType = serviceSlug === 'impermeabilizacao' ? 'waterproofing' : 'cleaning';

    if (serviceSlug === 'limpeza-colchoes') {
      const mattressItemsList = configs
        .map((cfg, i) => cfg?.mattressSizeId ? { sizeId: cfg.mattressSizeId, qty: rowQuantities[i] ?? 0 } : null)
        .filter((x): x is { sizeId: string; qty: number } => x !== null && x.qty > 0);
      if (mattressItemsList.length === 0) return;
      setActiveConfig({ service: 'mattress', serviceType: 'cleaning', mattressItems: mattressItemsList });
      openQuiz();
      return;
    }

    if (serviceSlug === 'limpeza-sofas' || serviceSlug === 'impermeabilizacao') {
      const sofaItemsList = configs
        .map((cfg, i) => cfg?.sofaSizeId ? { sizeId: cfg.sofaSizeId, qty: rowQuantities[i] ?? 0, chaiseLongue: false as boolean } : null)
        .filter((x): x is { sizeId: string; qty: number; chaiseLongue: boolean } => x !== null && x.qty > 0);
      if (chaiseLongueAddon > 0 && sofaItemsList.length > 0) sofaItemsList[0].chaiseLongue = true;
      const chairTotalQty = configs.reduce((sum, cfg, i) => cfg?.service === 'chairs' ? sum + (rowQuantities[i] ?? 0) : sum, 0);
      const chairPrice = chairTotalQty > 0
        ? (svcType === 'waterproofing'
          ? (chairTotalQty <= 4 ? chairTotalQty * 17.5 : 4 * 17.5 + (chairTotalQty - 4) * 15)
          : (chairTotalQty <= 3 ? chairTotalQty * 17.5 : chairTotalQty <= 6 ? 52.5 + (chairTotalQty - 3) * 12.5 : 90 + (chairTotalQty - 6) * 10))
        : 0;
      const chairUpsell = chairTotalQty > 0 ? [{
        id: 'chairs', chairQty: String(chairTotalQty), qty: chairTotalQty,
        price: Math.round(chairPrice * 10) / 10,
        label: `${chairTotalQty} cadeira${chairTotalQty > 1 ? 's' : ''}`,
        waterproof: svcType === 'waterproofing', waterproofPrice: 0,
      }] : [];
      if (sofaItemsList.length === 0 && chairTotalQty === 0) return;
      if (sofaItemsList.length > 0) {
        setActiveConfig({ service: 'sofa', serviceType: svcType, sofaItems: sofaItemsList, initialUpsellItems: chairUpsell.length > 0 ? chairUpsell : undefined });
      } else {
        setActiveConfig({ service: 'chairs', serviceType: svcType, chairQty: String(chairTotalQty) });
      }
      openQuiz();
      return;
    }

    const firstSelected = configs.findIndex((cfg, i) => cfg && (rowQuantities[i] ?? 0) > 0);
    const idx = firstSelected >= 0 ? firstSelected : configs.findIndex(c => c !== null);
    if (idx < 0 || !configs[idx]) return;
    const cfg = configs[idx]!;
    const qty = rowQuantities[idx] ?? 1;
    if (qty <= 0) return;
    const resolved: PriceRowQuizConfig = { ...cfg };
    if (cfg.sofaSizeId)    resolved.sofaQty    = qty;
    if (cfg.mattressSizeId) resolved.mattressQty = qty;
    if (cfg.chairQty)      resolved.chairQty   = String(qty);
    if (cfg.service === 'carpet') resolved.carpetArea = String(qty); // qty = m²
    setActiveConfig(resolved);
    openQuiz();
  };

  const verbPhrase = PRICE_HEADING_VERB[serviceSlug] ?? "este serviço";
  const verbWords = verbPhrase.trim().split(" ");
  const goldWord = verbWords.pop() ?? "";
  const heading = `Quanto custa ${verbWords.join(" ")}`;

  return (
    <section className="py-14 md:py-20 bg-[#FDFDF9]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          <div>
            <SectionHeader
              overline="Tabela de Preços"
              heading={heading}
              goldWord={goldWord}
              subtitle="Preços fixos sem surpresas. Orçamento confirmado antes de qualquer intervenção. Deslocação incluída no Porto e Grande Porto."
            />
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(7,26,18,0.18), 0 2px 10px rgba(7,26,18,0.10)" }}>
            {/* Header verde */}
            <div className="px-6 py-5" style={{ background: "#071a12" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#25D366" }} />
                <p className="text-[9px] font-bold tracking-[0.26em] uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>Orçamento Gratuito</p>
              </div>
              <p className="text-white font-semibold text-sm leading-snug">Escolha as quantidades e continue para o orçamento</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>Sem compromisso · Resposta em menos de 30 min</p>
            </div>

            {/* Linhas com steppers */}
            <div className="bg-white px-5 pt-1">
              <div className="divide-y" style={{ borderColor: "rgba(17,17,17,0.06)" }}>
                {rows.map((row, i) => {
                  const quizConfig = PRICE_TABLE_QUIZ_CONFIG[serviceSlug]?.[i] ?? null;

                  if (!quizConfig) {
                    return (
                      <div key={i} className="flex items-center gap-3 py-3.5">
                        <div className="flex items-center gap-0.5 rounded-full border px-1 py-1 flex-shrink-0" style={{ borderColor: "rgba(7,26,18,0.15)" }}>
                          <button type="button" onClick={() => setChaiseLongueAddon(v => Math.max(0, v - 1))} className="w-9 h-9 flex items-center justify-center rounded-full text-[#111111]/40 hover:bg-[rgba(7,26,18,0.08)] transition-colors" aria-label="Remover"><Minus className="w-4 h-4" /></button>
                          <span className="w-7 text-center font-playfair text-lg font-bold tabular-nums text-[#111111]">{chaiseLongueAddon}</span>
                          <button type="button" onClick={() => setChaiseLongueAddon(v => Math.min(1, v + 1))} className="w-9 h-9 flex items-center justify-center rounded-full text-[#111111]/40 hover:bg-[rgba(7,26,18,0.08)] transition-colors" aria-label="Adicionar"><Plus className="w-4 h-4" /></button>
                        </div>
                        <span className="text-[#111111]/70" style={{ fontSize: "14px" }}>{row.item}</span>
                        <span className="flex-1 border-b border-dotted mb-0.5" style={{ borderColor: "rgba(17,17,17,0.12)" }} />
                        <span className="font-playfair font-bold text-xl tabular-nums" style={{ color: "#D4AF37" }}>{row.price}</span>
                      </div>
                    );
                  }

                  const qty = rowQuantities[i] ?? 0;
                  const isCarpet = quizConfig.service === 'carpet';
                  const isChair  = quizConfig.service === 'chairs';
                  const isAlcatifa = serviceSlug === 'limpeza-alcatifas';
                  const isWaterproof = serviceSlug === 'impermeabilizacao';

                  // Preço dinâmico à direita
                  const chairP = isChair && qty > 0 ? calcChairBracket(qty, isWaterproof) : undefined;
                  const carpetP = isCarpet && qty > 0 ? calcCarpetWidget(qty, isAlcatifa) : undefined;
                  const dynamicPrice = chairP !== undefined
                    ? (chairP === null ? 'Sob orçamento' : `${chairP}€`)
                    : carpetP !== undefined
                    ? (carpetP === null ? 'Sob orçamento' : `${Math.round(carpetP * 10) / 10}€`)
                    : row.price;

                  if (isCarpet) {
                    return (
                      <div key={i} className="py-3.5 space-y-1.5">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={0}
                            max={isAlcatifa ? 50 : 20}
                            value={qty || ''}
                            onChange={e => {
                              const v = parseFloat(e.target.value) || 0;
                              setRowQuantities(prev => ({ ...prev, [i]: Math.max(0, v) }));
                            }}
                            placeholder="0"
                            className="w-20 text-center font-playfair text-lg font-bold rounded-xl border px-2 py-1.5 outline-none focus:border-gold transition-colors"
                            style={{ borderColor: qty > 0 ? "rgba(212,175,55,0.5)" : "rgba(7,26,18,0.15)", color: qty > 0 ? "#D4AF37" : "#111111" }}
                          />
                          <span className="text-[#111111]/55 text-sm">m²</span>
                          <span className="flex-1 border-b border-dotted mb-0.5" style={{ borderColor: "rgba(17,17,17,0.12)" }} />
                          <span className="font-playfair font-bold text-xl tabular-nums" style={{ color: "#D4AF37" }}>{dynamicPrice}</span>
                        </div>
                        <p className="text-[11px] ml-1" style={{ color: "rgba(17,17,17,0.38)" }}>
                          {isAlcatifa
                            ? 'até 50m²: 3€/m² · +50m²: sob orçamento'
                            : '≤5m²: 10€/m² · ≤10m²: 8€/m² · ≤15m²: 7€/m² · +15m²: sob orçamento'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div key={i} className="flex items-center gap-3 py-3">
                      <div className="flex items-center gap-0.5 rounded-full border px-1 py-1 flex-shrink-0" style={{ borderColor: qty > 0 ? "rgba(212,175,55,0.5)" : "rgba(7,26,18,0.15)" }}>
                        <button type="button" onClick={() => adjustQty(i, -1)} className="w-9 h-9 flex items-center justify-center rounded-full text-[#111111]/40 hover:bg-[rgba(7,26,18,0.08)] transition-colors" aria-label="Diminuir"><Minus className="w-4 h-4" /></button>
                        <span className="w-7 text-center font-playfair text-lg font-bold tabular-nums" style={{ color: qty > 0 ? "#D4AF37" : "#111111" }}>{qty}</span>
                        <button type="button" onClick={() => adjustQty(i, 1)} className="w-9 h-9 flex items-center justify-center rounded-full text-[#111111]/40 hover:bg-[rgba(7,26,18,0.08)] transition-colors" aria-label="Aumentar"><Plus className="w-4 h-4" /></button>
                      </div>
                      <span className="transition-colors" style={{ fontSize: "14px", color: qty > 0 ? "#111111" : "rgba(17,17,17,0.55)" }}>{row.item}</span>
                      <span className="flex-1 border-b border-dotted mb-0.5" style={{ borderColor: "rgba(17,17,17,0.12)" }} />
                      <span className="font-playfair font-bold text-xl tabular-nums" style={{ color: "#D4AF37" }}>{dynamicPrice}</span>
                    </div>
                  );
                })}
              </div>

              {/* Footer: total + barra + continuar */}
              <div className="pt-3 pb-5 border-t space-y-3" style={{ borderColor: "rgba(17,17,17,0.07)" }}>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#25D366" }} />
                  <span className="text-xs" style={{ color: "rgba(17,17,17,0.45)" }}>Deslocação incluída no Porto e Grande Porto</span>
                </div>
                <PriceWidgetTotal serviceSlug={serviceSlug} rowQuantities={rowQuantities} chaiseLongueAddon={chaiseLongueAddon} />
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full py-3.5 font-semibold text-[13px] tracking-[0.16em] uppercase transition-all active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #C9A84C 0%, #EDD96A 50%, #C9A84C 100%)", color: "#071a12", boxShadow: "0 4px 20px rgba(212,175,55,0.35)" }}
                >
                  Continuar para o orçamento →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeConfig && (
        <QuizFormLazy
          isOpen={isQuizOpen}
          onClose={closeQuiz}
          initialService={activeConfig.service}
          initialServiceType={activeConfig.serviceType}
          initialSofaItems={activeConfig.sofaItems}
          initialSofaSizeId={activeConfig.sofaSizeId}
          initialSofaQty={activeConfig.sofaQty}
          initialMattressItems={activeConfig.mattressItems}
          initialMattressSizeId={activeConfig.mattressSizeId}
          initialMattressQty={activeConfig.mattressQty}
          initialCarpetArea={activeConfig.carpetArea}
          initialChairQty={activeConfig.chairQty}
          initialUpsellItems={activeConfig.initialUpsellItems}
          skipToUpsell
        />
      )}
    </section>
  );
}
