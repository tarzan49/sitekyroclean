import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export interface ExpertTip {
  title: string;
  summary: string;
  url?: string;
}

interface ServiceExpertTipsProps {
  tips: ExpertTip[];
  variant?: "light" | "dark";
}

const ServiceExpertTips = ({ tips, variant = "dark" }: ServiceExpertTipsProps) => {
  const light = variant === "light";

  return (
    <section
      className="py-14 md:py-20"
      style={{ backgroundColor: light ? "#FDFDF9" : "#071a12" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Editorial header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
            <p
              className="text-[10px] font-bold tracking-[0.28em] uppercase"
              style={{ color: "#D4AF37", opacity: 0.85 }}
            >
              Dicas de Especialista
            </p>
          </div>
          <h2
            className="font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] mb-4"
            style={{ color: light ? "#111111" : "#ffffff" }}
          >
            Guias e conselhos{" "}
            <em className="not-italic" style={{ color: "#D4AF37" }}>profissionais</em>
          </h2>
          <p
            className="text-[15px] leading-relaxed max-w-xl"
            style={{ color: light ? "rgba(17,17,17,0.55)" : "rgba(255,255,255,0.5)" }}
          >
            Informação prática para cuidar dos seus estofos entre limpezas profissionais.
          </p>
        </div>

        {/* Tips grid */}
        <div
          className="grid md:grid-cols-2 gap-px"
          style={{ backgroundColor: light ? "#E8E4DE" : "rgba(255,255,255,0.07)" }}
        >
          {tips.map((tip, i) => {
            const inner = (
              <div
                className="relative overflow-hidden p-6 md:p-8 h-full"
                style={{
                  backgroundColor: light ? "#ffffff" : "#071a12",
                  borderTop: "2px solid #D4AF37",
                }}
              >
                {/* Faded background number */}
                <span
                  className="absolute bottom-2 right-4 font-playfair font-bold leading-none select-none pointer-events-none"
                  style={{
                    fontSize: "7rem",
                    color: light ? "rgba(212,175,55,0.07)" : "rgba(212,175,55,0.09)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Number badge */}
                <p
                  className="font-playfair font-bold tracking-[0.18em] mb-5 select-none"
                  style={{ fontSize: "11px", color: "#D4AF37" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>

                {/* Title */}
                <h3
                  className="font-playfair font-bold leading-snug mb-3"
                  style={{
                    fontSize: "1.15rem",
                    color: light ? "#111111" : "#ffffff",
                  }}
                >
                  {tip.title}
                </h3>

                {/* Gold divider */}
                <div
                  className="mb-4"
                  style={{
                    height: "1px",
                    background: "linear-gradient(to right, #D4AF37 0%, transparent 65%)",
                    opacity: 0.35,
                  }}
                />

                {/* Summary */}
                <p
                  className="leading-relaxed mb-4"
                  style={{
                    fontSize: "14px",
                    color: light ? "rgba(17,17,17,0.6)" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {tip.summary}
                </p>

                {/* Read more link */}
                {tip.url && (
                  <span
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.12em] uppercase"
                    style={{ color: "#D4AF37" }}
                  >
                    Ler artigo
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            );

            return tip.url ? (
              <Link key={i} to={tip.url} className="block group">
                {inner}
              </Link>
            ) : (
              <div key={i}>{inner}</div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ServiceExpertTips;
