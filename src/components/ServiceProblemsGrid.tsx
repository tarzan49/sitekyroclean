import { ArrowRight, Lightbulb } from "lucide-react";

export interface ServiceProblem {
  question: string;
  solution: string;
  blogSlug?: string;
  image?: string;
}

interface ServiceProblemsGridProps {
  problems: ServiceProblem[];
  heading?: string;
  sabiaQue?: string;
}

const ServiceProblemsGrid = ({
  problems,
  heading = "Problemas Comuns & Soluções",
  sabiaQue,
}: ServiceProblemsGridProps) => (
  <section className="py-12 md:py-16 bg-[#FDFDF9]">
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-7 md:mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>
              Problemas que resolvemos
            </p>
            <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
          </div>
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#1A1A2E] leading-snug">
            {heading}
          </h2>
        </div>

        {/* "Sabia que", dark contrast card */}
        {sabiaQue && (
          <div
            className="mb-8 rounded-2xl overflow-hidden"
            style={{ background: "#071a12" }}
          >
            <div className="flex items-start gap-3.5 px-5 py-4">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                style={{
                  background: "rgba(212,175,55,0.15)",
                  border: "1px solid rgba(212,175,55,0.35)",
                }}
              >
                <Lightbulb className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
              </div>
              <p className="text-white/65 text-[12px] md:text-[13px] leading-relaxed italic pt-0.5">
                {sabiaQue}
              </p>
            </div>
          </div>
        )}

        {/* Problem cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          {problems.map((p, i) =>
            p.image ? (
              /* ── Photo card ── */
              <div
                key={i}
                className="group relative flex flex-col overflow-hidden rounded-[20px] shadow-md min-h-[380px] transition-all duration-300 hover:shadow-2xl hover:ring-1 hover:ring-[#D4AF37]/35"
              >
                {/* Background photo, full colour, subtle zoom on hover */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url(${p.image})` }}
                />

                {/* Layered overlay: vignette bottom, slight warm tint */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/38 to-black/8" />

                {/* Numbered index, editorial gold top-right */}
                <div className="absolute top-4 right-4 z-10">
                  <span
                    className="font-mono text-[10px] font-bold tracking-[0.25em]"
                    style={{ color: "#D4AF37", opacity: 0.65 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col flex-1 p-5 pt-10 justify-end">
                  <h3 className="font-playfair font-bold text-white text-[17px] leading-snug mb-2 drop-shadow">
                    {p.question}
                  </h3>

                  <p className="text-white/70 text-[12px] md:text-[13px] leading-relaxed drop-shadow-sm">
                    {p.solution}
                  </p>

                  {p.blogSlug && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <a
                        href={`/blog/${p.blogSlug}`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold group/link transition-colors"
                        style={{ color: "#D4AF37" }}
                        aria-label={`Ler guia completo: ${p.question}`}
                      >
                        <span>Ler guia completo</span>
                        <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform duration-200" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Fallback: branded dark card ── */
              <div
                key={i}
                className="group relative flex flex-col overflow-hidden rounded-[20px] min-h-[380px] transition-all duration-300 hover:shadow-xl hover:ring-1 hover:ring-[#D4AF37]/30"
                style={{ background: "linear-gradient(160deg, #0d3530 0%, #0B2F2A 100%)" }}
              >
                <div className="absolute top-4 right-4">
                  <span
                    className="font-mono text-[10px] font-bold tracking-[0.25em]"
                    style={{ color: "#D4AF37", opacity: 0.45 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-5 pt-10 justify-end">
                  <h3 className="font-playfair font-bold text-white text-[17px] leading-snug mb-2">
                    {p.question}
                  </h3>
                  <p className="text-white/60 text-[12px] md:text-[13px] leading-relaxed">
                    {p.solution}
                  </p>
                  {p.blogSlug && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <a
                        href={`/blog/${p.blogSlug}`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold group/link"
                        style={{ color: "#D4AF37" }}
                      >
                        <span>Ler guia completo</span>
                        <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform duration-200" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  </section>
);

export default ServiceProblemsGrid;
