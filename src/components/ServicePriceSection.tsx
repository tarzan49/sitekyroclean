import { useState } from "react";
import { CheckCircle, Minus, Plus, Star, ArrowRight } from "lucide-react";
import { calcWidgetTotal, calcChairBracket, calcCarpetWidget, buildWidgetQuizConfig, WIDGET_DISCOUNT_THRESHOLD } from "@/lib/priceWidgetCalc";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";
import QuizFormLazy from "@/components/QuizFormLazy";
import SectionHeader from "@/components/SectionHeader";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import { PRICE_HEADING_VERB } from "@/constants/problemCardHelpers";
import { cn } from "@/lib/utils";

const TRUST_BULLETS = [
  "Preço confirmado antes de qualquer intervenção",
  "Sem deslocações desnecessárias — fazemos tudo ao domicílio",
  "Cancele ou remarque sem custos",
];

function DiscountBar({ total }: { total: number }) {
  const reached = total >= WIDGET_DISCOUNT_THRESHOLD;
  const pct = Math.min(100, (total / WIDGET_DISCOUNT_THRESHOLD) * 100);
  const remaining = Math.ceil(WIDGET_DISCOUNT_THRESHOLD - total);
  return (
    <div className="px-5 py-3 border-t" style={{ borderColor: "rgba(17,17,17,0.07)" }}>
      {reached ? (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: "#D4AF37" }}>10% de desconto ativo</span>
          <span className="text-[10px] px-2 py-0.5 font-bold rounded-sm" style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}>-10%</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px]" style={{ color: "rgba(17,17,17,0.45)" }}>
              {total > 0 ? <><span className="font-semibold" style={{ color: "#111111" }}>Faltam {remaining}€</span> para 10% de desconto</> : 'Adicione 149€+ e poupe 10% em tudo'}
            </span>
            {total > 0 && <span className="text-[11px] font-semibold" style={{ color: "rgba(17,17,17,0.40)" }}>{total}€ / {WIDGET_DISCOUNT_THRESHOLD}€</span>}
          </div>
          <div className="h-1.5 overflow-hidden" style={{ background: "rgba(17,17,17,0.07)" }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${Math.max(pct, total > 0 ? 4 : 0)}%`, background: "linear-gradient(90deg,#B8912A,#EDD96A)" }}
            />
          </div>
        </>
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
    const config = buildWidgetQuizConfig(serviceSlug, rowQuantities, chaiseLongueAddon);
    if (!config) return;
    setActiveConfig(config);
    openQuiz();
  };

  const verbPhrase = PRICE_HEADING_VERB[serviceSlug] ?? "este serviço";
  const verbWords = verbPhrase.trim().split(" ");
  const goldWord = verbWords.pop() ?? "";
  const heading = `Quanto custa ${verbWords.join(" ")}`;

  const total = calcWidgetTotal(serviceSlug, rowQuantities, chaiseLongueAddon);
  const discountActive = total >= WIDGET_DISCOUNT_THRESHOLD;
  const discountedTotal = Math.round(total * 0.9);
  const hasSelection = total > 0;

  return (
    <section className="py-14 md:py-20 bg-[#FDFDF9]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">

          {/* ── Coluna esquerda ── */}
          <div className="lg:pt-4">
            <SectionHeader
              overline="Tabela de Preços"
              heading={heading}
              goldWord={goldWord}
              subtitle="Preços fixos sem surpresas. Orçamento confirmado antes de qualquer intervenção."
            />

            {/* Trust bullets */}
            <ul className="mt-8 space-y-3">
              {TRUST_BULLETS.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#25D366" }} />
                  <span className="text-sm leading-relaxed" style={{ color: "rgba(17,17,17,0.65)" }}>{b}</span>
                </li>
              ))}
            </ul>

            {/* Mini Google rating */}
            <div className="mt-8 inline-flex items-center gap-3 px-4 py-3 border" style={{ borderColor: "rgba(17,17,17,0.10)", background: "white" }}>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />)}
              </div>
              <div className="h-3.5 w-px" style={{ background: "rgba(17,17,17,0.12)" }} />
              <span className="text-sm font-semibold" style={{ color: "#111111" }}>5.0</span>
              <span className="text-xs" style={{ color: "rgba(17,17,17,0.45)" }}>+60 avaliações Google</span>
            </div>
          </div>

          {/* ── Widget ── */}
          <div className="overflow-hidden" style={{ boxShadow: "0 12px 50px rgba(7,26,18,0.16), 0 2px 8px rgba(7,26,18,0.08)" }}>

            {/* Header escuro */}
            <div className="px-6 py-6" style={{ background: "#071a12" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#25D366" }} />
                  <p className="text-[9px] font-bold tracking-[0.28em] uppercase" style={{ color: "rgba(255,255,255,0.40)" }}>Orçamento Gratuito</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5" style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}>Sem compromisso</span>
              </div>
              <h3 className="font-playfair text-xl font-bold text-white leading-snug mb-1">
                Calcule o seu preço agora
              </h3>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
                Resposta em menos de 30 min · Deslocação ao domicílio
              </p>
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.26)" }}>
                  Porto 0€ · Grande Porto +5-10€ · Braga/Aveiro +20€ · Lisboa +35€
                </p>
              </div>
            </div>

            {/* Linhas */}
            <div className="bg-white">
              {rows.map((row, i) => {
                const quizConfig = PRICE_TABLE_QUIZ_CONFIG[serviceSlug]?.[i] ?? null;

                if (!quizConfig) {
                  const active = chaiseLongueAddon > 0;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-5 py-4 border-b transition-all duration-200"
                      style={{
                        borderBottomColor: "rgba(17,17,17,0.06)",
                        borderLeft: active ? "3px solid #D4AF37" : "3px solid transparent",
                        background: active ? "rgba(212,175,55,0.03)" : "transparent",
                      }}
                    >
                      {/* Stepper */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setChaiseLongueAddon(v => Math.max(0, v - 1))}
                          aria-label="Remover"
                          className="w-10 h-10 flex items-center justify-center transition-all active:scale-95"
                          style={{ background: active ? "#071a12" : "#f0f0eb", color: active ? "white" : "rgba(17,17,17,0.40)" }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span
                          className="w-8 text-center font-playfair text-xl font-bold tabular-nums"
                          style={{ color: active ? "#D4AF37" : "rgba(17,17,17,0.20)" }}
                        >{chaiseLongueAddon}</span>
                        <button
                          type="button"
                          onClick={() => setChaiseLongueAddon(v => Math.min(1, v + 1))}
                          aria-label="Adicionar"
                          className="w-10 h-10 flex items-center justify-center transition-all active:scale-95"
                          style={{ background: "#071a12", color: "white" }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="flex-1 text-sm font-medium" style={{ color: active ? "#111111" : "rgba(17,17,17,0.55)" }}>{row.item}</span>
                      <span className="font-playfair text-xl font-bold tabular-nums flex-shrink-0" style={{ color: active ? "#D4AF37" : "rgba(17,17,17,0.25)" }}>{row.price}</span>
                    </div>
                  );
                }

                const qty = rowQuantities[i] ?? 0;
                const active = qty > 0;
                const isCarpet = quizConfig.service === 'carpet';
                const isChair  = quizConfig.service === 'chairs';
                const isAlcatifa = serviceSlug === 'limpeza-alcatifas';
                const isWaterproof = serviceSlug === 'impermeabilizacao';

                const chairP = isChair && qty > 0 ? calcChairBracket(qty, isWaterproof) : undefined;
                const carpetP = isCarpet && qty > 0 ? calcCarpetWidget(qty, isAlcatifa) : undefined;
                const dynamicPrice: string | null = isChair
                  ? (qty <= 0 ? null : chairP === null ? 'Sob orçamento' : `${chairP}€`)
                  : isCarpet
                  ? (qty <= 0 ? (isAlcatifa ? '3€/m²' : '10€/m²') : carpetP == null ? 'Sob orçamento' : `${Math.round(carpetP * 10) / 10}€`)
                  : row.price;

                if (isCarpet) {
                  return (
                    <div
                      key={i}
                      className="px-5 py-4 border-b transition-all duration-200"
                      style={{
                        borderBottomColor: "rgba(17,17,17,0.06)",
                        borderLeft: active ? "3px solid #D4AF37" : "3px solid transparent",
                        background: active ? "rgba(212,175,55,0.03)" : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="number" min={0} max={isAlcatifa ? 50 : 20}
                          value={qty || ''} placeholder="0"
                          onChange={e => {
                            const v = parseFloat(e.target.value) || 0;
                            setRowQuantities(prev => ({ ...prev, [i]: Math.max(0, v) }));
                          }}
                          className="w-20 text-center font-playfair text-xl font-bold outline-none transition-colors"
                          style={{
                            borderBottom: `2px solid ${qty > 0 ? "#D4AF37" : "rgba(17,17,17,0.20)"}`,
                            color: qty > 0 ? "#D4AF37" : "#111111",
                            background: "transparent",
                          }}
                        />
                        <span className="text-sm font-medium" style={{ color: "rgba(17,17,17,0.50)" }}>m²</span>
                        <span className="flex-1" />
                        {dynamicPrice !== null && (
                          <span className="font-playfair text-xl font-bold tabular-nums" style={{ color: active ? "#D4AF37" : "rgba(17,17,17,0.25)" }}>{dynamicPrice}</span>
                        )}
                      </div>
                      <p className="text-[11px] mt-1.5" style={{ color: "rgba(17,17,17,0.35)" }}>
                        {isAlcatifa ? 'até 50m²: 3€/m² · +50m²: sob orçamento' : '≤5m²: 10€/m² · ≤10m²: 8€/m² · ≤15m²: 7€/m² · +15m²: sob orçamento'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-5 py-4 border-b transition-all duration-200"
                    style={{
                      borderBottomColor: "rgba(17,17,17,0.06)",
                      borderLeft: active ? "3px solid #D4AF37" : "3px solid transparent",
                      background: active ? "rgba(212,175,55,0.03)" : "transparent",
                    }}
                  >
                    {/* Stepper */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => adjustQty(i, -1)}
                        disabled={qty === 0}
                        aria-label="Diminuir"
                        className="w-10 h-10 flex items-center justify-center transition-all active:scale-95 disabled:opacity-25"
                        style={{ background: active ? "#071a12" : "#f0f0eb", color: active ? "white" : "rgba(17,17,17,0.40)" }}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span
                        className="w-8 text-center font-playfair text-xl font-bold tabular-nums"
                        style={{ color: active ? "#D4AF37" : "rgba(17,17,17,0.20)" }}
                      >{qty}</span>
                      <button
                        type="button"
                        onClick={() => adjustQty(i, 1)}
                        aria-label="Aumentar"
                        className="w-10 h-10 flex items-center justify-center transition-all active:scale-95"
                        style={{ background: "#071a12", color: "white" }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="flex-1 text-sm font-medium transition-colors" style={{ color: active ? "#111111" : "rgba(17,17,17,0.55)" }}>
                      {row.item}
                    </span>

                    {dynamicPrice !== null && (
                      <span className="font-playfair text-xl font-bold tabular-nums flex-shrink-0 transition-colors" style={{ color: active ? "#D4AF37" : "rgba(17,17,17,0.25)" }}>
                        {dynamicPrice}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Discount bar */}
            <DiscountBar total={total} />

            {/* Total + CTA */}
            <div className="bg-white px-5 pb-5 space-y-3">

              {/* Total block */}
              {hasSelection && (
                <div
                  className="flex items-center justify-between px-5 py-4 transition-all duration-300"
                  style={{
                    background: discountActive ? "rgba(212,175,55,0.08)" : "#071a12",
                  }}
                >
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-0.5" style={{ color: discountActive ? "rgba(17,17,17,0.50)" : "rgba(255,255,255,0.40)" }}>
                      {discountActive ? "Total com desconto" : "Total estimado"}
                    </p>
                    {discountActive && (
                      <p className="text-xs line-through" style={{ color: "rgba(17,17,17,0.35)" }}>{total}€</p>
                    )}
                  </div>
                  <span
                    className="font-playfair font-bold tabular-nums"
                    style={{ fontSize: "2rem", lineHeight: 1, color: "#D4AF37" }}
                  >
                    {discountActive ? discountedTotal : total}€
                  </span>
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                onClick={handleContinue}
                className={cn(
                  "w-full h-14 flex items-center justify-center gap-3 font-bold text-[13px] tracking-[0.18em] uppercase transition-all active:scale-[0.98]",
                  !hasSelection && "opacity-60"
                )}
                style={{
                  background: "linear-gradient(135deg, #B8912A 0%, #EDD96A 50%, #B8912A 100%)",
                  color: "#071a12",
                  boxShadow: hasSelection ? "0 6px 28px rgba(212,175,55,0.45)" : "none",
                }}
              >
                Continuar para o orçamento
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </button>

              <p className="text-center text-[10px]" style={{ color: "rgba(17,17,17,0.35)" }}>
                Sem cartão · Sem compromisso · 100% gratuito
              </p>
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
