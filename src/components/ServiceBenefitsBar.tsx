import { Shield, Heart, Sparkles } from "lucide-react";

export interface BenefitItem {
  icon: typeof Shield;
  label: string;
  title: string;
  body: string;
}

const DEFAULT_BENEFITS: BenefitItem[] = [
  {
    icon: Shield,
    label: "Durabilidade",
    title: "Proteja o seu investimento",
    body: "Estofos tratados profissionalmente duram em média 3× mais. A higienização regular previne o desgaste prematuro e preserva as fibras a longo prazo.",
  },
  {
    icon: Heart,
    label: "Saúde",
    title: "Ambiente mais saudável",
    body: "Eliminação de 99,9% de ácaros, bactérias e alergénios. Respirar melhor em casa começa com superfícies realmente limpas, não apenas visualmente.",
  },
  {
    icon: Sparkles,
    label: "Estética",
    title: "Aparência de novo",
    body: "Cores mais vivas, tecidos sem marcas nem odores. Devolvemos a dignidade visual ao seu espaço no próprio dia da intervenção.",
  },
];

interface ServiceBenefitsBarProps {
  benefits?: BenefitItem[];
  /** H2 keyword-rich heading */
  heading?: string;
  variant?: "light" | "dark";
}

const ServiceBenefitsBar = ({
  benefits = DEFAULT_BENEFITS,
  heading = "Três razões que fazem a diferença",
  variant = "dark",
}: ServiceBenefitsBarProps) => {
  const light = variant === "light";
  return (
  <section className={`py-10 md:py-14 ${light ? "bg-white" : "bg-kyro-green"}`}>
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-7 md:mb-9">
          <p
            className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-2"
            style={{ color: "#D4AF37" }}
          >
            Benefícios Reais
          </p>
          <h2 className={`font-playfair text-xl md:text-2xl font-bold leading-snug ${light ? "text-[#1A1A2E]" : "text-white"}`}>
            {heading}
          </h2>
          <div
            className="w-12 h-px mx-auto mt-3"
            style={{ backgroundColor: "#D4AF37", opacity: 0.4 }}
          />
        </div>

        {/* Benefits: horizontal on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className={`flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-3 rounded-2xl p-5 md:p-6 md:text-center ${
                  light
                    ? "bg-[#F8F8F2] border border-[#1A1A2E]/8"
                    : "bg-white/[0.04] border border-white/10"
                }`}
              >
                {/* Gold icon ring */}
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(240,220,138,0.10) 100%)",
                    border: "1px solid rgba(201,168,76,0.35)",
                    boxShadow: "0 2px 12px rgba(201,168,76,0.15)",
                  }}
                >
                  <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                </div>

                <div>
                  {/* Label */}
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.20em] mb-1"
                    style={{ color: "#D4AF37" }}
                  >
                    {b.label}
                  </p>
                  {/* Title */}
                  <h3 className={`font-playfair font-bold text-[14px] md:text-[15px] leading-snug mb-1.5 ${light ? "text-[#1A1A2E]" : "text-white"}`}>
                    {b.title}
                  </h3>
                  {/* Body */}
                  <p className={`text-[12px] leading-relaxed ${light ? "text-[#1A1A2E]/55" : "text-white/50"}`}>
                    {b.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
  );
};

export default ServiceBenefitsBar;
