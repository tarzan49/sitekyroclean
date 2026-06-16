export interface BenefitItem {
  icon?: unknown;
  label: string;
  title: string;
  body: string;
}

const DEFAULT_BENEFITS: BenefitItem[] = [
  {
    label: "Durabilidade",
    title: "Proteja o seu investimento",
    body: "Estofos tratados profissionalmente duram em média 3 vezes mais. A higienização regular previne o desgaste prematuro e preserva as fibras a longo prazo.",
  },
  {
    label: "Saúde",
    title: "Ambiente mais saudável",
    body: "Eliminação de 99,9% de ácaros, bactérias e alergénios. Respirar melhor em casa começa com superfícies realmente limpas, não apenas visualmente.",
  },
  {
    label: "Estética",
    title: "Aparência de novo",
    body: "Cores mais vivas, tecidos sem marcas nem odores. Devolvemos a dignidade visual ao seu espaço no próprio dia da intervenção.",
  },
];

interface ServiceBenefitsBarProps {
  benefits?: BenefitItem[];
  overline?: string;
  heading?: string;
  subtitle?: string;
  variant?: "light" | "dark";
}

const ServiceBenefitsBar = ({
  benefits = DEFAULT_BENEFITS,
  overline = "Benefícios Reais",
  heading = "Três razões que fazem a diferença",
  subtitle = "Limpeza profissional que vai além do visual: protege a saúde, preserva o estofo e valoriza o seu espaço.",
  variant = "dark",
}: ServiceBenefitsBarProps) => {
  const light = variant === "light";
  const textMain = light ? "text-[#111111]" : "text-white";
  const textSub  = light ? "text-[#111111]/65" : "text-white/60";

  const words = heading.trim().split(" ");
  const goldWord = words.pop() ?? "";
  const restHeading = words.join(" ");

  return (
    <section className={`py-14 md:py-20 ${light ? "bg-[#FDFDF9]" : "bg-kyro-green"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

          {/* Editorial header */}
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
                {overline}
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
            {benefits.map((b, i) => (
              <div
                key={i}
                className="relative flex flex-col overflow-hidden"
                style={
                  light
                    ? {
                        background: "#ffffff",
                        borderTop: "2px solid #D4AF37",
                        boxShadow: "0 2px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        borderTop: "2px solid rgba(212,175,55,0.55)",
                        borderRight: "1px solid rgba(255,255,255,0.06)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        borderLeft: "1px solid rgba(255,255,255,0.06)",
                      }
                }
              >
                {/* Background number — decorative */}
                <span
                  className="absolute top-3 right-4 font-playfair font-bold select-none pointer-events-none leading-none"
                  style={{
                    fontSize: "6rem",
                    color: light ? "rgba(212,175,55,0.07)" : "rgba(212,175,55,0.09)",
                    lineHeight: 1,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative flex flex-col gap-4 p-7 md:p-8">
                  {/* Label */}
                  <p
                    className="text-[10px] font-bold tracking-[0.26em] uppercase"
                    style={{ color: "#D4AF37" }}
                  >
                    {b.label}
                  </p>

                  {/* Title */}
                  <h3
                    className={`font-playfair font-bold leading-snug ${textMain}`}
                    style={{ fontSize: "1.25rem" }}
                  >
                    {b.title}
                  </h3>

                  {/* Divider */}
                  <div
                    className="w-8 h-px"
                    style={{
                      background: light
                        ? "linear-gradient(90deg, #D4AF37 0%, rgba(212,175,55,0.2) 100%)"
                        : "linear-gradient(90deg, rgba(212,175,55,0.7) 0%, rgba(212,175,55,0.1) 100%)",
                    }}
                  />

                  {/* Body */}
                  <p
                    className={`leading-relaxed ${textSub}`}
                    style={{ fontSize: "14px" }}
                  >
                    {b.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
      </div>
    </section>
  );
};

export default ServiceBenefitsBar;
