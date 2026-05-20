import { CheckCircle, Award, Leaf } from "lucide-react";

const ITEMS = [
  {
    icon: CheckCircle,
    title: "Satisfação 100%",
    body: "Repetimos o serviço sem custos adicionais se o resultado não ficar completamente perfeito.",
  },
  {
    icon: Award,
    title: "Garantia Kyro",
    body: "Selo de qualidade garantida em todos os tecidos e superfícies que tratamos.",
  },
  {
    icon: Leaf,
    title: "Segurança Total",
    body: "Produtos 100% seguros, certificados e não tóxicos, para crianças, bebés e animais.",
  },
];

interface ServiceEliteGuaranteeProps {
  heading?: string;
  variant?: "light" | "dark";
}

const ServiceEliteGuarantee = ({
  heading = "A nossa promessa em cada visita",
  variant = "light",
}: ServiceEliteGuaranteeProps) => {
  const dark = variant === "dark";
  return (
  <section className={`py-10 md:py-14 ${dark ? "bg-kyro-green" : "bg-[#FDFDF9]"}`}>
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-7 md:mb-9">
          <p
            className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-2"
            style={{ color: "#D4AF37" }}
          >
            Garantia de Elite
          </p>
          <h2 className={`font-playfair text-xl md:text-2xl font-bold leading-snug ${dark ? "text-white" : "text-[#1A1A2E]"}`}>
            {heading}
          </h2>
          <div
            className="w-12 h-px mx-auto mt-3"
            style={{ backgroundColor: "#D4AF37", opacity: 0.4 }}
          />
        </div>

        {/* 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-3 rounded-2xl p-5 md:p-6 md:text-center transition-all duration-300 ${
                  dark
                    ? "bg-white/[0.04] border border-white/10 hover:border-gold/30"
                    : "bg-[#FFFFFF] shadow-sm border border-[rgba(212,175,55,0.12)] hover:border-gold/30 hover:shadow-md"
                }`}
              >
                {/* Gold icon circle */}
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(201,168,76,0.14) 0%, rgba(240,220,138,0.08) 100%)",
                    border: "1px solid rgba(201,168,76,0.30)",
                  }}
                >
                  <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                </div>

                <div>
                  <h3 className={`font-playfair font-bold text-[14px] md:text-[15px] leading-snug mb-1 ${dark ? "text-white" : "text-[#1A1A2E]"}`}>
                    {item.title}
                  </h3>
                  <p className={`text-[12px] leading-relaxed ${dark ? "text-white/50" : "text-[#1A1A2E]/55"}`}>
                    {item.body}
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

export default ServiceEliteGuarantee;
