import { useState } from "react";
import { CheckCircle, Minus, Plus, Star, ArrowRight, ExternalLink, ChevronDown, Check, Shield, Bug } from "lucide-react";
import { GOOGLE_REVIEWS_VIEW_URL } from "@/constants/google";
import { calcWidgetTotal, calcChairBracket, calcCarpetWidget, buildWidgetQuizConfig, calcRowAddonDelta, calcSofaAntiAcarosDelta, calcChairAddonWaterproofTotal, calcChairAntiAcarosTotal, calcWidgetPricing, calcWidgetArticles, PACK_DISCOUNT_MIN_SERVICE, PACK_DISCOUNT_MIN_UPSELL_ITEM, type WidgetTier } from "@/lib/priceWidgetCalc";
import { locationPrices } from "@/components/quiz/QuizTypes";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";
import QuizFormLazy from "@/components/QuizFormLazy";
import SectionHeader from "@/components/SectionHeader";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import { PRICE_HEADING_VERB } from "@/constants/problemCardHelpers";
import { REVIEW_COUNT } from "@/constants/business";
import { getTrustPointsForSeed } from "@/constants/serviceTrustPool";
import { cn } from "@/lib/utils";
import { CarpetTierLegend } from "@/components/CarpetTierLegend";

// Terceiro ponto de cada serviço reescrito para puxar para o upsell/Pack Família
// (mesma visita, mais um estofo) — pedido explícito 2026-08-30, mantém-se
// sincronizado com a variante 0 de src/constants/serviceTrustPool.ts.
// Sofá, colchão, cadeiras e tapetes já não estão aqui — usam pools de várias
// opções por ponto, ver getTrustPointsForSeed em serviceTrustPool.ts.
const SERVICE_POINTS: Record<string, { stat?: string; titleGold: string; titleRest?: string; desc: string }[]> = {
  'limpeza-alcatifas': [
    { stat: '1 kg/m²', titleGold: 'Sujidade invisível', titleRest: ' acumulada em cada m²', desc: 'Fibras compactadas retêm o que não se vê mas que respira todos os dias. Nem a aspiração profissional chega.' },
    { stat: '2,5×', titleGold: 'Pior qualidade do ar', titleRest: ' sem limpeza regular', desc: 'Alcatifas sem manutenção anual degradam significativamente o ar interior. Crítico em escritórios e quartos.' },
    { titleGold: 'Aproveite a visita', titleRest: ' para mais um espaço', desc: 'O técnico já está em sua casa: junte sofás, cadeiras ou tapetes na mesma visita e poupe na deslocação.' },
  ],
  'impermeabilizacao': [
    { stat: '60s', titleGold: '60 segundos', titleRest: ' para uma mancha ficar permanente', desc: 'Sem proteção, o tecido absorve o vinho em menos de 60 segundos. Com nano-barreira, rola para o chão.' },
    { stat: '10⁻⁹m', titleGold: 'Proteção molecular', titleRest: ' a nível nanométrico', desc: 'Nano-partículas criam uma barreira a nível molecular invisível ao toque. Não altera cor, textura nem respirabilidade do tecido.' },
    { titleGold: 'Combine com a limpeza', titleRest: ' e poupe', desc: 'Peça a impermeabilização junto com a limpeza profunda: o Pack Proteção Total tem desconto sobre os dois serviços em separado.' },
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

function DiscountBar({ discountActive }: { discountActive: boolean }) {
  return (
    <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t" style={{ borderColor: "rgba(17,17,17,0.07)" }}>
      {discountActive ? (
        <div
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-sm"
          style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.02))", border: "1px solid rgba(212,175,55,0.35)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #C9A84C, #F0DC8A)", boxShadow: "0 2px 10px rgba(212,175,55,0.45)" }}
          >
            <Check className="w-4 h-4" style={{ color: "#071a12" }} strokeWidth={3.5} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold leading-none" style={{ color: "#111111" }}>10% de desconto ativo</p>
            <p className="text-[10px] mt-1 leading-none" style={{ color: "rgba(17,17,17,0.40)" }}>Aplica-se a todo o pedido</p>
          </div>
          <span className="text-[11px] font-black px-2 py-1 rounded-sm flex-shrink-0" style={{ background: "#D4AF37", color: "white" }}>-10%</span>
        </div>
      ) : (
        <p className="text-[11px] leading-snug" style={{ color: "rgba(17,17,17,0.45)" }}>
          Pedidos de <span className="font-semibold" style={{ color: "#111111" }}>{PACK_DISCOUNT_MIN_SERVICE}€+</span> com um item extra de <span className="font-semibold" style={{ color: "#111111" }}>{PACK_DISCOUNT_MIN_UPSELL_ITEM}€+</span> ganham <span className="font-semibold" style={{ color: "#D4AF37" }}>10% de desconto em tudo</span>.
        </p>
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
  const [addonRows, setAddonRows] = useState<Set<number>>(new Set());
  const [addonTier, setAddonTier] = useState<WidgetTier>('essencial');
  const [antiAcarosRows, setAntiAcarosRows] = useState<Set<number>>(new Set());

  if (!rows) return null;

  const quizConfigs = PRICE_TABLE_QUIZ_CONFIG[serviceSlug] ?? [];

  const adjustQty = (i: number, delta: number, max?: number) => {
    setRowQuantities(prev => {
      const next = (prev[i] ?? 0) + delta;
      const clamped = Math.min(max ?? 99, Math.max(0, next));
      if (clamped === 0) {
        setAddonRows(a => { if (!a.has(i)) return a; const n = new Set(a); n.delete(i); return n; });
        setAntiAcarosRows(a => { if (!a.has(i)) return a; const n = new Set(a); n.delete(i); return n; });
      }
      return { ...prev, [i]: clamped };
    });
  };

  const toggleAddonRow = (i: number) => {
    setAddonRows(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const toggleAntiAcarosRow = (i: number) => {
    setAntiAcarosRows(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const handleContinue = () => {
    const config = buildWidgetQuizConfig(serviceSlug, rowQuantities, chaiseLongueAddon, addonRows, addonTier, antiAcarosRows);
    if (!config) return;
    setActiveConfig(config);
    openQuiz();
  };

  const verbPhrase = PRICE_HEADING_VERB[serviceSlug] ?? "este serviço";
  const verbWords = verbPhrase.trim().split(" ");
  const goldWord = verbWords.pop() ?? "";
  const heading = `Quanto custa ${verbWords.join(" ")}`;

  const total = calcWidgetTotal(serviceSlug, rowQuantities, chaiseLongueAddon, addonRows, addonTier, antiAcarosRows);
  const travelFee = initialLocation ? (locationPrices[initialLocation] ?? 10) : 0;
  const articles = calcWidgetArticles(serviceSlug, rowQuantities, addonRows, addonTier, antiAcarosRows);
  const pricing = calcWidgetPricing(total, travelFee, articles);
  const firstTierAddonRow = Array.from(addonRows).find(i => {
    const svc = quizConfigs[i]?.service;
    return svc === 'sofa' || svc === 'chairs';
  });
  const hasSofaAddon = firstTierAddonRow !== undefined;
  const tierAddonCfg = hasSofaAddon ? quizConfigs[firstTierAddonRow]! : null;
  const tierAddonQty = hasSofaAddon ? (rowQuantities[firstTierAddonRow] ?? 0) : 0;
  const sofaAddonEssencialDelta = tierAddonCfg
    ? (tierAddonCfg.service === 'chairs' ? calcChairAddonWaterproofTotal(tierAddonQty, 'essencial') : calcRowAddonDelta(tierAddonCfg, 'essencial'))
    : null;
  const sofaAddonPremiumDelta = tierAddonCfg
    ? (tierAddonCfg.service === 'chairs' ? calcChairAddonWaterproofTotal(tierAddonQty, 'premium') : calcRowAddonDelta(tierAddonCfg, 'premium'))
    : null;
  const sofaAddonExtraDelta = sofaAddonEssencialDelta !== null && sofaAddonPremiumDelta !== null
    ? Math.round((sofaAddonPremiumDelta - sofaAddonEssencialDelta) * 100) / 100 : null;
  const hasSelection = total > 0 || Object.values(rowQuantities).some(q => q > 0) || chaiseLongueAddon > 0;

  const trustPoints = getTrustPointsForSeed(serviceSlug, `${serviceSlug}:0:${initialLocation ?? 'default'}`) ?? SERVICE_POINTS[serviceSlug] ?? [];

  const TrustPoints = ({ fullDesc }: { fullDesc: boolean }) => (
    <>
      <div className="flex flex-col gap-0">
        {trustPoints.map((point, i) => (
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
              <p className="text-sm font-semibold leading-snug mb-0.5">
                <span style={{ color: "#B8912A" }}>{point.titleGold}</span>
                {point.titleRest && <span style={{ color: "#111111" }}>{point.titleRest}</span>}
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
        <span className="text-xs flex-1" style={{ color: "rgba(17,17,17,0.45)" }}>+{REVIEW_COUNT} avaliações · Deixar avaliação</span>
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

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">

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

            {/* Header verde */}
            <div className="px-5 py-4 sm:px-6 sm:py-5" style={{ background: "#071a12" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#25D366" }} />
                <p className="text-[9px] font-bold tracking-[0.26em] uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>Orçamento Gratuito</p>
              </div>
              <p className="text-white font-semibold text-sm leading-snug">Escolha as quantidades e continue para o orçamento</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>Sem compromisso · Resposta em menos de 30 min</p>
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
                      <CarpetTierLegend isAlcatifa={isAlcatifa} qty={qty} />
                    </div>
                  );
                }

                // Nunca mostrar o addon "Impermeabilizar"/"Anti Ácaros" na própria
                // página de impermeabilização — aí a impermeabilização já É o
                // serviço primário, "adicioná-la" a si mesma não faz sentido.
                const canAddon = !isWaterproof && (quizConfig.service === 'sofa' || quizConfig.service === 'mattress' || isChair);
                const isSofaAddon = quizConfig.service === 'sofa';
                const addonOn = addonRows.has(i);
                const addonDelta = !canAddon || !active ? null
                  : isChair ? calcChairAddonWaterproofTotal(qty, addonTier)
                  : calcRowAddonDelta(quizConfig, addonTier);
                const canAntiAcaros = !isWaterproof && (isSofaAddon || isChair);
                const antiAcarosOn = antiAcarosRows.has(i);
                const antiAcarosDelta = !canAntiAcaros || !active ? null
                  : isChair ? calcChairAntiAcarosTotal(qty)
                  : calcSofaAntiAcarosDelta(quizConfig);

                return (
                  <div
                    key={i}
                    className="border-b transition-all duration-200"
                    style={{
                      borderBottomColor: "rgba(17,17,17,0.06)",
                      borderLeft: active ? "3px solid #D4AF37" : "3px solid transparent",
                      background: active ? "rgba(212,175,55,0.03)" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-5 sm:py-4">
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

                    {canAddon && active && (
                      <button
                        type="button"
                        onClick={() => toggleAddonRow(i)}
                        className="flex items-center gap-2 w-full pl-[76px] pr-4 sm:pl-[88px] sm:pr-5 pb-3 -mt-0.5 text-left touch-manipulation"
                      >
                        <span
                          className="w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ borderColor: addonOn ? "#D4AF37" : "rgba(17,17,17,0.25)", background: addonOn ? "#D4AF37" : "transparent" }}
                        >
                          {addonOn && <Check className="w-3 h-3" style={{ color: "#071a12" }} strokeWidth={3} />}
                        </span>
                        <Shield className="w-3 h-3 flex-shrink-0" style={{ color: addonOn ? "#D4AF37" : "rgba(17,17,17,0.30)" }} />
                        <span className="text-[11px] font-semibold flex-1" style={{ color: addonOn ? "#111111" : "rgba(17,17,17,0.45)" }}>
                          {isSofaAddon || isChair ? 'Impermeabilizar' : 'Anti Ácaros'}
                        </span>
                        {addonDelta !== null && (
                          <span className="text-[11px] font-bold tabular-nums" style={{ color: addonOn ? "#D4AF37" : "rgba(17,17,17,0.35)" }}>
                            +{addonDelta}€{isChair ? '' : '/un.'}
                          </span>
                        )}
                      </button>
                    )}

                    {canAntiAcaros && active && antiAcarosDelta !== null && (
                      <button
                        type="button"
                        onClick={() => toggleAntiAcarosRow(i)}
                        className="flex items-center gap-2 w-full pl-[76px] pr-4 sm:pl-[88px] sm:pr-5 pb-3 -mt-0.5 text-left touch-manipulation"
                      >
                        <span
                          className="w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ borderColor: antiAcarosOn ? "#D4AF37" : "rgba(17,17,17,0.25)", background: antiAcarosOn ? "#D4AF37" : "transparent" }}
                        >
                          {antiAcarosOn && <Check className="w-3 h-3" style={{ color: "#071a12" }} strokeWidth={3} />}
                        </span>
                        <Bug className="w-3 h-3 flex-shrink-0" style={{ color: antiAcarosOn ? "#D4AF37" : "rgba(17,17,17,0.30)" }} />
                        <span className="text-[11px] font-semibold flex-1" style={{ color: antiAcarosOn ? "#111111" : "rgba(17,17,17,0.45)" }}>
                          Anti Ácaros
                        </span>
                        <span className="text-[11px] font-bold tabular-nums" style={{ color: antiAcarosOn ? "#D4AF37" : "rgba(17,17,17,0.35)" }}>
                          +{antiAcarosDelta}€{isChair ? '' : '/un.'}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Nível de proteção — só aparece quando há pelo menos um sofá com impermeabilização activa (colchão/anti-ácaros não tem tiers) */}
              {hasSofaAddon && (
                <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b" style={{ borderBottomColor: "rgba(17,17,17,0.06)", background: "rgba(212,175,55,0.04)" }}>
                  <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-2" style={{ color: "rgba(17,17,17,0.40)" }}>
                    Nível de impermeabilização
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAddonTier('premium')}
                      className="text-left px-3 py-2 border-2 transition-all"
                      style={{
                        borderColor: addonTier === 'premium' ? "#D4AF37" : "rgba(212,175,55,0.35)",
                        background: addonTier === 'premium' ? "white" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        {addonTier === 'premium' && <Check className="w-3 h-3" style={{ color: "#D4AF37" }} strokeWidth={3} />}
                        <p className="text-xs font-bold" style={{ color: "#111111" }}>Premium</p>
                        <span className="text-[8px] font-bold uppercase tracking-wide px-1 py-[1px] rounded-[3px] leading-none" style={{ color: "#B8912A", border: "1px solid rgba(184,145,42,0.45)" }}>
                          Dura mais
                        </span>
                        {sofaAddonExtraDelta !== null && (
                          <span className="text-[9px] font-black leading-none px-1.5 py-[3px] rounded-full whitespace-nowrap" style={{ background: addonTier === 'premium' ? "#D4AF37" : "rgba(212,175,55,0.15)", color: addonTier === 'premium' ? "white" : "#B8912A" }}>
                            só +{sofaAddonExtraDelta}€
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] leading-snug font-semibold" style={{ color: "#B8912A" }}>até 10 anos · até 5 lavagens</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddonTier('essencial')}
                      className="text-left px-3 py-2 border-2 transition-all"
                      style={{
                        borderColor: addonTier === 'essencial' ? "#D4AF37" : "rgba(17,17,17,0.12)",
                        background: addonTier === 'essencial' ? "white" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        {addonTier === 'essencial' && <Check className="w-3 h-3" style={{ color: "#D4AF37" }} strokeWidth={3} />}
                        <p className="text-xs font-bold" style={{ color: "#111111" }}>Essencial</p>
                      </div>
                      <p className="text-[10px] leading-snug" style={{ color: "rgba(17,17,17,0.40)" }}>1-2 anos de proteção</p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Discount bar */}
            <DiscountBar discountActive={pricing.discountActive} />

            {/* Total + CTA */}
            <div className="bg-white px-4 pb-4 sm:px-5 sm:pb-5 space-y-2.5 sm:space-y-3">

              {travelFee > 0 && (
                <div className="flex items-center gap-1.5 pt-3">
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: "rgba(17,17,17,0.25)" }} />
                  <span className="text-xs" style={{ color: "rgba(17,17,17,0.45)" }}>
                    +{travelFee}€ deslocação a {initialLocation}
                  </span>
                </div>
              )}

              {/* Total block */}
              {hasSelection && total > 0 && (
                <div
                  className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4"
                  style={{ background: "#071a12" }}
                >
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
                      {pricing.discountActive ? "Total com desconto" : "Total estimado"}
                    </p>
                    {pricing.discountActive && (
                      <p className="text-xs line-through" style={{ color: "rgba(255,255,255,0.30)" }}>{pricing.grandTotal}€</p>
                    )}
                  </div>
                  <span
                    className="font-playfair font-bold tabular-nums text-[1.65rem] sm:text-[2rem]"
                    style={{ lineHeight: 1, color: "#D4AF37" }}
                  >
                    {pricing.discountActive ? pricing.discountedTotal : pricing.grandTotal}€
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
          initialWaterproofingTier={activeConfig.waterproofingTier}
          initialChairWaterproofing={activeConfig.chairWaterproofing}
          skipToUpsell
        />
      )}
    </section>
  );
}
