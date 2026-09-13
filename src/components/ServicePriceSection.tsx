import { ExternalLink, Star, ChevronDown } from "lucide-react";
import { GOOGLE_REVIEWS_VIEW_URL } from "@/constants/google";
import { PRICE_TABLE } from "@/data/locationPriceTestimonialsData";
import { PRICE_HEADING_VERB } from "@/constants/problemCardHelpers";
import { REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import { getTrustPointsForSeed } from "@/constants/serviceTrustPool";
import SectionHeader from "@/components/SectionHeader";
import PriceWidget from "@/components/PriceWidget";
import { useState } from "react";

// Todos os 6 serviços já usam pools de variedade (ver getTrustPointsForSeed
// em serviceTrustPool.ts) — o antigo fallback de pontos fixos por serviço
// (alcatifas, impermeabilização) foi removido por completo em 2026-09-09.

const SERVICE_SUBTITLE: Record<string, string> = {
  'limpeza-sofas':     'Preço por tamanho para a limpeza. Deslocação e tratamentos adicionais à parte. Valor confirmado antes do serviço.',
  'limpeza-colchoes':  'Preço fixo por tamanho de colchão. Orçamento confirmado antes de qualquer intervenção.',
  'limpeza-tapetes':   'Orçamento à medida de cada tapete. Sem surpresas, sem custos escondidos.',
  'limpeza-cadeiras':  'Preço por cadeira com desconto progressivo em lotes. Confirmado antes de avançar.',
  'limpeza-alcatifas': 'Orçamento à medida de cada espaço. Sem preço fixo por m², sem surpresas.',
  'impermeabilizacao': 'Preço fixo, combinável com limpeza ou em separado. Sem compromisso.',
};

interface Props {
  serviceSlug: string;
  initialLocation?: string;
}

export default function ServicePriceSection({ serviceSlug, initialLocation }: Props) {
  const rows = PRICE_TABLE[serviceSlug];
  const [infoOpen, setInfoOpen] = useState(false);

  if (!rows) return null;

  const verbPhrase = PRICE_HEADING_VERB[serviceSlug] ?? "este serviço";
  const verbWords = verbPhrase.trim().split(" ");
  const goldWord = verbWords.pop() ?? "";
  const heading = `Quanto custa ${verbWords.join(" ")}`;

  const trustPoints = getTrustPointsForSeed(serviceSlug, `${serviceSlug}:0:${initialLocation ?? 'default'}`) ?? [];

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
                <p className="font-playfair text-xl font-bold leading-none mb-1" style={{ color: "#1A4E30" }}>
                  {point.stat}
                </p>
              )}
              <p className="text-base font-semibold leading-snug mb-0.5">
                <span style={{ color: "#1A4E30" }}>{point.titleGold}</span>
                {point.titleRest && <span style={{ color: "#111111" }}>{point.titleRest}</span>}
              </p>
              {fullDesc && (
                <p className="text-base leading-relaxed" style={{ color: "#505650" }}>
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
        <span className="text-base font-semibold" style={{ color: "#111111" }}>{REVIEW_RATING}</span>
        <span className="text-sm flex-1" style={{ color: "#505650" }}>+{REVIEW_COUNT} avaliações · Deixar avaliação</span>
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

          <PriceWidget serviceSlug={serviceSlug} initialLocation={initialLocation} />

        </div>

        {/* ── Mobile: bloco colapsável abaixo do widget ── */}
        <div className="lg:hidden mt-6">
          <button
            type="button"
            onClick={() => setInfoOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 border transition-all"
            style={{ borderColor: "rgba(17,17,17,0.12)", background: "white" }}
          >
            <span className="text-base font-semibold" style={{ color: "#111111" }}>Porquê escolher a Kyro Clean?</span>
            <ChevronDown
              className="w-4 h-4 transition-transform duration-200 flex-shrink-0"
              style={{ color: "#1A4E30", transform: infoOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          {infoOpen && (
            <div className="border-x border-b px-4 pt-4 pb-2" style={{ borderColor: "rgba(17,17,17,0.12)" }}>
              <TrustPoints fullDesc={false} />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
