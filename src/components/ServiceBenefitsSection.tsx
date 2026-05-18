import { CheckCircle, Lightbulb } from "lucide-react";

interface ServiceBenefitsSectionProps {
  /** Left visual: BeforeAfterSlider, image, or any React node */
  visual: React.ReactNode;
  /** "Sabia que" curiosity text */
  introText: string;
}

/**
 * Integrated Transformation & Science block:
 * - Left 60%: visual with premium frame
 * - Right 40%: "Sabia Que" card + "Qualidade Garantida" seal
 */
const ServiceBenefitsSection = ({
  visual,
  introText,
}: ServiceBenefitsSectionProps) => (
  <section className="py-10 md:py-14 bg-[#FDFDF9]">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-[3fr_2fr] gap-5 md:gap-8 items-start max-w-5xl mx-auto">

        {/* Left: visual with premium frame */}
        <div className="order-2 md:order-1 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
          {visual}
        </div>

        {/* Right: Sabia Que + Garantia seal */}
        <div className="order-1 md:order-2 flex flex-col gap-4">

          {/* Sabia Que card */}
          <div className="bg-kyro-green rounded-2xl p-5 border border-gold/20 shadow-[0_4px_24px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
              </div>
              <span className="font-playfair text-base font-bold text-white">
                Sabia que:
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{introText}</p>
          </div>

          {/* Qualidade Garantida seal */}
          <div
            className="rounded-2xl p-5 border border-gold/25"
            style={{
              background:
                "linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(240,220,138,0.05) 50%, rgba(201,168,76,0.08) 100%)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #C9A84C 0%, #F0DC8A 45%, #C9A84C 80%, #A8882A 100%)",
                  boxShadow: "0 2px 8px rgba(201,168,76,0.35)",
                }}
              >
                <CheckCircle className="w-4 h-4 text-[#5a3800]" strokeWidth={2.5} />
              </div>
              <span className="font-playfair font-bold text-[#1A1A2E] text-[15px]">
                Qualidade Garantida
              </span>
            </div>
            <p className="text-[#1A1A2E]/65 text-[13px] leading-relaxed mb-3">
              Se não ficar 100% satisfeito, repetimos o serviço sem custos —
              sem letras pequenas, sem desculpas.
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-[#1A1A2E]/50">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-gold/70" strokeWidth={2} />
                Garantia 48h
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-gold/70" strokeWidth={2} />
                Técnicos certificados
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-gold/70" strokeWidth={2} />
                Produtos seguros
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ServiceBenefitsSection;
