export interface GuaranteeItem {
  label: string;
  title: string;
  body: string;
  image?: string;
  mirror?: boolean;
}

const DEFAULT_ITEMS: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "100% ou repetimos",
    body: "Se o resultado não ficar completamente perfeito, repetimos o serviço sem custos adicionais. Sem condições, sem discussão.",
  },
  {
    label: "Qualidade",
    title: "Selo Kyro em cada visita",
    body: "Cada intervenção é executada com os mesmos padrões rigorosos, independentemente do tipo de estofo ou da dimensão do trabalho.",
  },
  {
    label: "Segurança",
    title: "Seguro para toda a família",
    body: "Produtos certificados, não tóxicos e testados. Crianças, bebés e animais podem regressar ao espaço imediatamente após a secagem.",
  },
];

interface ServiceEliteGuaranteeProps {
  heading?: string;
  subtitle?: string;
  variant?: "light" | "dark";
  items?: GuaranteeItem[];
}

const ServiceEliteGuarantee = ({
  heading = "A nossa promessa em cada visita",
  subtitle = "Cada serviço inclui a nossa garantia de satisfação total, sem compromissos nem letra pequena.",
  variant = "light",
  items = DEFAULT_ITEMS,
}: ServiceEliteGuaranteeProps) => {
  const dark = variant === "dark";
  const textMain = dark ? "text-white" : "text-[#111111]";
  const textSub  = dark ? "text-white/60" : "text-[#111111]/65";

  const words = heading.trim().split(" ");
  const goldWord = words.pop() ?? "";
  const restHeading = words.join(" ");

  return (
    <section className={`py-14 md:py-20 ${dark ? "bg-kyro-green" : "bg-[#FDFDF9]"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Editorial header */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
              Garantia de Elite
            </p>
          </div>
          <h2 className={`font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] mb-4 ${textMain}`}>
            {restHeading}{" "}
            <em className="not-italic" style={{ color: '#D4AF37' }}>{goldWord}</em>
          </h2>
          <p className={`text-sm md:text-[15px] leading-relaxed max-w-xl ${textSub}`}>
            {subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {items.map((item, i) => {
            const hasImage = !!item.image;
            const cardTextMain = hasImage ? "text-white" : textMain;
            const cardTextSub  = hasImage ? "text-white/70" : textSub;

            return (
              <div
                key={i}
                className="relative flex flex-col overflow-hidden"
                style={
                  hasImage
                    ? { borderTop: "2px solid rgba(212,175,55,0.7)", minHeight: "320px" }
                    : dark
                    ? {
                        background: "rgba(255,255,255,0.04)",
                        borderTop: "2px solid rgba(212,175,55,0.55)",
                        borderRight: "1px solid rgba(255,255,255,0.06)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        borderLeft: "1px solid rgba(255,255,255,0.06)",
                      }
                    : {
                        background: "#ffffff",
                        borderTop: "2px solid #D4AF37",
                        boxShadow: "0 2px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
                      }
                }
              >
                {/* Background image */}
                {hasImage && (
                  <>
                    <img
                      src={item.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={item.mirror ? { transform: "scaleX(-1)" } : undefined}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.82) 0%, rgba(7,26,18,0.55) 55%, rgba(7,26,18,0.82) 100%)" }}
                    />
                    {item.mirror && (
                      <>
                        <span className="absolute bottom-4 left-4 text-[9px] font-bold tracking-[0.22em] uppercase text-white/50 z-10">Antes</span>
                        <span className="absolute bottom-4 right-4 text-[9px] font-bold tracking-[0.22em] uppercase text-white/50 z-10">Depois</span>
                      </>
                    )}
                  </>
                )}


                <div className="relative flex flex-col gap-4 p-7 md:p-8">
                  <p
                    className="text-[10px] font-bold tracking-[0.26em] uppercase"
                    style={{ color: "#D4AF37" }}
                  >
                    {item.label}
                  </p>

                  <h3
                    className={`font-playfair font-bold leading-snug ${cardTextMain}`}
                    style={{ fontSize: "1.25rem" }}
                  >
                    {item.title}
                  </h3>

                  <div
                    className="w-8 h-px"
                    style={{
                      background: "linear-gradient(90deg, rgba(212,175,55,0.8) 0%, rgba(212,175,55,0.15) 100%)",
                    }}
                  />

                  <p className={`leading-relaxed ${cardTextSub}`} style={{ fontSize: "14px" }}>
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ServiceEliteGuarantee;
