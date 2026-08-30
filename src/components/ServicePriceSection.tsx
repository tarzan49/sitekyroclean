import { useState } from "react";
import { CheckCircle, Minus, Plus, Star, ArrowRight, ExternalLink, ChevronDown } from "lucide-react";
import { GOOGLE_REVIEWS_VIEW_URL } from "@/constants/google";
import { calcWidgetTotal, calcChairBracket, calcCarpetWidget, buildWidgetQuizConfig, WIDGET_DISCOUNT_THRESHOLD } from "@/lib/priceWidgetCalc";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";
import QuizFormLazy from "@/components/QuizFormLazy";
import SectionHeader from "@/components/SectionHeader";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import { PRICE_HEADING_VERB } from "@/constants/problemCardHelpers";
import { cn } from "@/lib/utils";

const SERVICE_POINTS: Record<string, { stat?: string; title: string; desc: string }[]> = {
  'limpeza-sofas': [
    { stat: '2,5 kg', title: 'de sujidade acumulada por ano', desc: 'Células mortas, gordura e suor que o tecido absorve e retém. Invisíveis, mas presentes. O aspirador não os tira.' },
    { stat: '99,9%', title: 'eliminação de patogénicos', desc: 'A temperatura de extração profissional atinge profundidade e eficácia impossíveis para equipamento doméstico.' },
    { title: 'Resultado visível ou voltamos', desc: 'Se a diferença não for clara, repetimos sem custo. É o nosso compromisso, sem letras pequenas, sem condições.' },
  ],
  'limpeza-colchoes': [
    { stat: '2M+', title: 'ácaros num colchão de 5 anos', desc: 'O peso original pode dobrar em matéria orgânica. O que está a respirar todas as noites?' },
    { stat: '40%', title: 'piora na qualidade do sono', desc: 'Alta concentração de ácaros degrada o sono mesmo sem sintomas visíveis. Comprovado em estudos de polissonografia.' },
    { title: 'Seguro essa mesma noite', desc: 'Produtos hipoalergénicos certificados sem resíduos. Pode dormir logo após a intervenção, sem esperar.' },
  ],
  'limpeza-tapetes': [
    { stat: '8×', title: 'mais alérgenos que pavimento liso', desc: 'Tapetes retêm e libertam no ar partículas a cada passo: pólenes, ácaros e poluentes invisíveis.' },
    { stat: '90%', title: 'da aparência original recuperada', desc: 'Tapetes considerados "inutilizáveis" ficam como novos com extração profissional a quente. Sem substituição.' },
    { title: 'Ao domicílio, sem recolha, sem espera', desc: 'Tratado no seu espaço com equipamento profissional. Não precisa sair de casa nem aguardar entrega.' },
  ],
  'limpeza-cadeiras': [
    { stat: '400×', title: 'mais bactérias que a sanita', desc: 'As zonas de contacto de cadeiras de jantar estão entre as superfícies mais contaminadas de uma casa.' },
    { title: 'Protocolo por material, não genérico', desc: 'Veludo, couro, linho: cada tecido tem a sua abordagem. Nunca arriscamos o material errado no tecido errado.' },
    { stat: '3–6h', title: 'e estão prontas', desc: 'Resultado no próprio dia. Sem paralisar a sua sala de jantar ou escritório por dias.' },
  ],
  'limpeza-alcatifas': [
    { stat: '1 kg/m²', title: 'de sujidade invisível acumulada', desc: 'Fibras compactadas retêm o que não se vê mas que respira todos os dias. Nem a aspiração profissional chega.' },
    { stat: '2,5×', title: 'pior qualidade do ar sem limpeza', desc: 'Alcatifas sem manutenção anual degradam significativamente o ar interior. Crítico em escritórios e quartos.' },
    { title: 'Metro a metro, sem exceção', desc: 'Mapeamos o espaço e tratamos tudo: cantos, bordas e zonas sob mobília sem exceção.' },
  ],
  'impermeabilizacao': [
    { stat: '60s', title: 'para uma mancha ser permanente', desc: 'Sem proteção, o tecido absorve o vinho em menos de 60 segundos. Com nano-barreira, rola para o chão.' },
    { stat: '10⁻⁹m', title: 'de proteção molecular', desc: 'Nano-partículas criam uma barreira a nível molecular invisível ao toque. Não altera cor, textura nem respirabilidade do tecido.' },
    { stat: '40%', title: 'mais vida útil para o estofo', desc: 'O custo da impermeabilização amortiza-se em menos de 12 meses face à substituição prematura do estofo.' },
  ],
};

const SERVICE_SUBTITLE: Record<string, string> = {
  'limpeza-sofas':     'Preço fixo por tamanho e tratamento. Sem avaliação prévia, sem deslocações em vão.',
  'limpeza-colchoes':  'Preço fixo por tamanho de colchão. Orçamento confirmado antes de qualquer intervenção.',
  'limpeza-tapetes':   'Preço por m² calculado na hora. Sem surpresas, sem custos escondidos.',
  'limpeza-cadeiras':  'Preço por cadeira com desconto progressivo em lotes. Confirmado antes de avançar.',
  'limpeza-alcatifas': 'Preço por m² com desconto em grandes superfícies. Orçamento gratuito.',
  'impermeabilizacao': 'Preço fixo, combinável com limpeza ou em separado. Sem compromisso.',
};

function DiscountBar({ total }: { total: number }) {
  const reached = total >= WIDGET_DISCOUNT_THRESHOLD;
  const pct = Math.min(100, (total / WIDGET_DISCOUNT_THRESHOLD) * 100);
  const remaining = Math.ceil(WIDGET_DISCOUNT_THRESHOLD - total);
  return (
    <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t" style={{ borderColor: "rgba(17,17,17,0.07)" }}>
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
  initialLocation?: string;
}

export default function ServicePriceSection({ serviceSlug, initialLocation }: Props) {
  const rows = PRICE_TABLE[serviceSlug];
  const { isQuizOpen, openQuiz, closeQuiz } = useQuizLauncher();
  const [activeConfig, setActiveConfig] = useState<PriceRowQuizConfig | null>(null);
  const [rowQuantities, setRowQuantities] = useState<Record<number, number>>({});
  const [chaiseLongueAddon, setChaiseLongueAddon] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);

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
  const hasSelection = total > 0 || Object.values(rowQuantities).some(q => q > 0) || chaiseLongueAddon > 0;

  const TrustPoints = ({ fullDesc }: { fullDesc: boolean }) => (
    <>
      <div className="flex flex-col gap-0">
        {(SERVICE_POINTS[serviceSlug] ?? []).map((point, i) => (
          <div
            key={i}
            className="flex gap-4 py-4"
            style={{
              borderTop: "1px solid rgba(17,17,17,0.08)",
              borderLeft: "3px solid #D4AF37",
              paddingLeft: "14px",
            }}
          >
            <div className="flex-1 min-w-0">
              {point.stat && (
                <p className="font-playfair text-xl font-bold leading-none mb-1" style={{ color: "#D4AF37" }}>
                  {point.stat}
                </p>
              )}
              <p className="text-sm font-semibold leading-snug mb-0.5" style={{ color: "#111111" }}>
                {point.title}
              </p>
              {fullDesc && (
                <p className="text-[13px] leading-relaxed" style={{ color: "rgba(17,17,17,0.50)" }}>
                  {point.desc}
                </p>
              )}
            </div>
          </div>
        ))}
        <div style={{ borderTop: "1px solid rgba(17,17,17,0.08)" }} />
      </div>
      <a
        href={GOOGLE_REVIEWS_VIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex mt-4 items-center gap-3 px-4 py-3 border transition-all hover:shadow-md group w-full"
        style={{ borderColor: "rgba(17,17,17,0.10)", background: "white" }}
      >
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />)}
        </div>
        <div className="h-3.5 w-px" style={{ background: "rgba(17,17,17,0.12)" }} />
        <span className="text-sm font-semibold" style={{ color: "#111111" }}>5.0</span>
        <span className="text-xs flex-1" style={{ color: "rgba(17,17,17,0.45)" }}>+60 avaliações · Deixar avaliação</span>
        <ExternalLink className="w-3 h-3 opacity-30 group-hover:opacity-60 transition-opacity flex-shrink-0" style={{ color: "#111111" }} />
      </a>
    </>
  );

  return (
    <section className="py-14 md:py-20 bg-[#FDFDF9]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* ── Heading mobile only — acima do widget ── */}
        <div className="lg:hidden mb-8">
          <SectionHeader
            overline="Tabela de Preços"
            heading={heading}
            goldWord={goldWord}
            subtitle={SERVICE_SUBTITLE[serviceSlug] ?? "Preços fixos sem surpresas. Orçamento confirmado antes de qualquer intervenção."}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-start">

          {/* ── Coluna esquerda — desktop: heading + trust + google alinhados com widget ── */}
          <div className="hidden lg:block lg:pt-0">
            <SectionHeader
              overline="Tabela de Preços"
              heading={heading}
              goldWord={goldWord}
              subtitle={SERVICE_SUBTITLE[serviceSlug] ?? "Preços fixos sem surpresas. Orçamento confirmado antes de qualquer intervenção."}
            />
            <TrustPoints fullDesc />
          </div>

          {/* ── Widget ── */}
          <div className="overflow-hidden" style={{ boxShadow: "0 12px 50px rgba(7,26,18,0.16), 0 2px 8px rgba(7,26,18,0.08)" }}>

            {/* Header escuro */}
            <div className="px-5 py-4 sm:px-6 sm:py-6" style={{ background: "#071a12" }}>
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#25D366" }} />
                  <p className="text-[9px] font-bold tracking-[0.28em] uppercase" style={{ color: "rgba(255,255,255,0.40)" }}>Orçamento Gratuito</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5" style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}>Sem compromisso</span>
              </div>
              <h3 className="font-playfair text-lg sm:text-xl font-bold text-white leading-snug mb-1">
                Calcule o seu preço agora
              </h3>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
                Resposta em menos de 30 min · Deslocação ao domicílio
              </p>
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
                      className="flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-5 sm:py-4 border-b transition-all duration-200"
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
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all active:scale-95"
                          style={{ background: "#071a12", color: "white", opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span
                          className="w-7 sm:w-8 text-center font-playfair text-lg sm:text-xl font-bold tabular-nums"
                          style={{ color: active ? "#D4AF37" : "rgba(17,17,17,0.20)" }}
                        >{chaiseLongueAddon}</span>
                        <button
                          type="button"
                          onClick={() => setChaiseLongueAddon(v => v + 1)}
                          aria-label="Adicionar"
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all active:scale-95"
                          style={{ background: "#071a12", color: "white" }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="flex-1 text-sm font-medium" style={{ color: active ? "#111111" : "rgba(17,17,17,0.55)" }}>{row.item}</span>
                      <span className="font-playfair text-lg sm:text-xl font-bold tabular-nums flex-shrink-0" style={{ color: active ? "#D4AF37" : "rgba(17,17,17,0.25)" }}>{row.price}</span>
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
                  ? (qty <= 0 ? (isAlcatifa ? '3€/m²' : '15€/m²') : carpetP == null ? 'Sob orçamento' : `${Math.round(carpetP * 10) / 10}€`)
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
                        {isAlcatifa ? 'até 50m²: 3€/m² · +50m²: sob orçamento' : '≤3m²: 15€/m² · ≤5m²: 12,5€/m² · ≤8m²: 11,5€/m² · ≤10m²: 10,5€/m² · ≤15m²: 10€/m² · +15m²: sob orçamento'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-5 sm:py-4 border-b transition-all duration-200"
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
                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all active:scale-95 disabled:opacity-25"
                        style={{ background: active ? "#071a12" : "#f0f0eb", color: active ? "white" : "rgba(17,17,17,0.40)" }}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span
                        className="w-7 sm:w-8 text-center font-playfair text-lg sm:text-xl font-bold tabular-nums"
                        style={{ color: active ? "#D4AF37" : "rgba(17,17,17,0.20)" }}
                      >{qty}</span>
                      <button
                        type="button"
                        onClick={() => adjustQty(i, 1)}
                        aria-label="Aumentar"
                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all active:scale-95"
                        style={{ background: "#071a12", color: "white" }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="flex-1 text-sm font-medium transition-colors" style={{ color: active ? "#111111" : "rgba(17,17,17,0.55)" }}>
                      {row.item}
                    </span>

                    {dynamicPrice !== null && (
                      <span className="font-playfair text-lg sm:text-xl font-bold tabular-nums flex-shrink-0 transition-colors" style={{ color: active ? "#D4AF37" : "rgba(17,17,17,0.25)" }}>
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
            <div className="bg-white px-4 pb-4 sm:px-5 sm:pb-5 space-y-2.5 sm:space-y-3">

              {/* Total block */}
              {hasSelection && total > 0 && (
                <div
                  className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4"
                  style={{ background: "#071a12" }}
                >
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
                      {discountActive ? "Total com desconto" : "Total estimado"}
                    </p>
                    {discountActive && (
                      <p className="text-xs line-through" style={{ color: "rgba(255,255,255,0.30)" }}>{total}€</p>
                    )}
                  </div>
                  <span
                    className="font-playfair font-bold tabular-nums text-[1.65rem] sm:text-[2rem]"
                    style={{ lineHeight: 1, color: "#D4AF37" }}
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
                  "w-full h-12 sm:h-14 flex items-center justify-center gap-3 font-bold text-[13px] tracking-[0.18em] uppercase transition-all active:scale-[0.98]",
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

        {/* ── Mobile: bloco colapsável abaixo do widget ── */}
        <div className="lg:hidden mt-6">
          <button
            type="button"
            onClick={() => setInfoOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 border transition-all"
            style={{ borderColor: "rgba(17,17,17,0.12)", background: "white" }}
          >
            <span className="text-sm font-semibold" style={{ color: "#111111" }}>Porquê escolher a Kyro Clean?</span>
            <ChevronDown
              className="w-4 h-4 transition-transform duration-200 flex-shrink-0"
              style={{ color: "#D4AF37", transform: infoOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          {infoOpen && (
            <div className="border-x border-b px-4 pt-4 pb-2" style={{ borderColor: "rgba(17,17,17,0.12)" }}>
              <TrustPoints fullDesc={false} />
            </div>
          )}
        </div>

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
          initialChairQty={activeConfig.chairQty}
          initialUpsellItems={activeConfig.initialUpsellItems}
          skipToUpsell
        />
      )}
    </section>
  );
}
