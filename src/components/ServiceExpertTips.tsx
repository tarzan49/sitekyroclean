interface ExpertTip {
  title: string;
  summary: string;
}

interface ServiceExpertTipsProps {
  tips: ExpertTip[];
  variant?: "light" | "dark";
}

const ServiceExpertTips = ({ tips, variant = "dark" }: ServiceExpertTipsProps) => {
  const light = variant === "light";
  return (
    <section className={`py-12 md:py-16 ${light ? "bg-[#FDFDF9]" : "bg-kyro-green"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-8 md:mb-10">
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-3" style={{ color: "#D4AF37" }}>
              Dicas de Especialista
            </p>
            <h2 className={`font-playfair text-2xl md:text-3xl font-bold leading-snug ${light ? "text-[#1A1A2E]" : "text-white"}`}>
              Guias e Conselhos Profissionais
            </h2>
            <div className="w-12 h-px mx-auto mt-4" style={{ backgroundColor: "#D4AF37", opacity: 0.4 }} />
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            {tips.map((tip, i) => (
              <div
                key={i}
                className={`group relative rounded-2xl p-5 md:p-6 overflow-hidden transition-all duration-300 cursor-default ${
                  light
                    ? "bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:shadow-md"
                    : "bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/[0.07]"
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex items-start gap-4">
                  <span
                    className="font-playfair font-bold text-[13px] tracking-widest flex-shrink-0 mt-0.5 select-none"
                    style={{ color: "#D4AF37" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className={`font-semibold text-[14px] md:text-[15px] leading-snug mb-2 transition-colors duration-200 group-hover:text-[#D4AF37] ${light ? "text-[#1A1A2E]" : "text-white/90"}`}>
                      {tip.title}
                    </h3>
                    <p className={`text-[12px] md:text-[13px] leading-relaxed ${light ? "text-[#1A1A2E]/55" : "text-white/50"}`}>
                      {tip.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServiceExpertTips;
