import { useState } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";
import QuizFormLazy from "@/components/QuizFormLazy";
import SectionHeader from "@/components/SectionHeader";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import { PRICE_HEADING_VERB } from "@/constants/problemCardHelpers";

interface Props {
  serviceSlug: string;
}

export default function ServicePriceSection({ serviceSlug }: Props) {
  const rows = PRICE_TABLE[serviceSlug];
  const { isQuizOpen, openQuiz, closeQuiz } = useQuizLauncher();
  const [activeConfig, setActiveConfig] = useState<PriceRowQuizConfig | null>(null);

  if (!rows) return null;

  const handleRowClick = (config: PriceRowQuizConfig) => {
    setActiveConfig(config);
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
            <div className="px-6 py-5 flex items-start justify-between gap-4" style={{ background: "#071a12" }}>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#25D366" }} />
                  <p className="text-[9px] font-bold tracking-[0.26em] uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>Orçamento Gratuito</p>
                </div>
                <p className="text-white font-semibold text-sm leading-snug">Toque para ver o preço exacto</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>Sem compromisso · Resposta em menos de 30 min</p>
              </div>
              {rows[0] && (
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>Desde</p>
                  <p className="font-playfair font-bold text-2xl leading-none" style={{ color: "#D4AF37" }}>{rows[0].price}</p>
                </div>
              )}
            </div>

            <div className="bg-white px-5 pt-1">
              <div className="divide-y" style={{ borderColor: "rgba(17,17,17,0.06)" }}>
                {rows.map((row, i) => {
                  const quizConfig = PRICE_TABLE_QUIZ_CONFIG[serviceSlug]?.[i] ?? null;
                  if (!quizConfig) {
                    return (
                      <div key={i} className="flex items-center gap-3 py-3.5">
                        <span className="text-[#111111]/70" style={{ fontSize: "14px" }}>{row.item}</span>
                        <span className="flex-1 border-b border-dotted mb-0.5" style={{ borderColor: "rgba(17,17,17,0.12)" }} />
                        <span className="font-playfair font-bold text-xl tabular-nums" style={{ color: "#D4AF37" }}>{row.price}</span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={i}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleRowClick(quizConfig)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRowClick(quizConfig);
                        }
                      }}
                      className="group flex items-center gap-3 py-3 rounded-xl cursor-pointer transition-colors hover:bg-[rgba(7,26,18,0.04)]"
                    >
                      <span className="text-[#111111]/70" style={{ fontSize: "14px" }}>{row.item}</span>
                      <span className="flex-1 border-b border-dotted mb-0.5" style={{ borderColor: "rgba(17,17,17,0.12)" }} />
                      <span className="font-playfair font-bold text-xl tabular-nums" style={{ color: "#D4AF37" }}>{row.price}</span>
                      <ArrowRight className="w-4 h-4 flex-shrink-0 text-[#111111]/20 group-hover:text-[#1DA851] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-1.5 py-4 border-t" style={{ borderColor: "rgba(17,17,17,0.07)" }}>
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#25D366" }} />
                <span className="text-xs" style={{ color: "rgba(17,17,17,0.45)" }}>Deslocação incluída no Porto e Grande Porto</span>
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
          initialSofaSizeId={activeConfig.sofaSizeId}
          initialMattressSizeId={activeConfig.mattressSizeId}
          initialCarpetArea={activeConfig.carpetArea}
          initialChairQty={activeConfig.chairQty}
        />
      )}
    </section>
  );
}
