import { Shield, CheckCircle, Zap } from "lucide-react";

/**
 * Compact guarantee block with Forest Green Kyro (#0B2F2A) background.
 * Positioned right after the results carousel for maximum conversion impact.
 */
const ServiceGuarantee = () => (
  <section className="py-10 md:py-14 bg-kyro-green">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto relative">
        {/* Outer glow border */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-gold/25 via-transparent to-gold/10 pointer-events-none" />

        <div className="relative bg-kyro-green rounded-3xl border border-gold/20 p-8 md:p-10 text-center overflow-hidden">
          {/* Subtle radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(190,180,125,0.07) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10">
            {/* Shield icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 border border-gold/25 mb-5 mx-auto">
              <Shield className="w-7 h-7 text-gold" />
            </div>

            {/* Badge */}
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>Garantia Kyro</p>

            {/* Headline */}
            <h3 className="font-playfair text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
              Se não ficar satisfeito, não paga.
            </h3>

            {/* Body */}
            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-7">
              Garantia total de 48 horas sobre o serviço realizado. Sem letras
              pequenas, sem desculpas: o seu conforto é a nossa prioridade.
            </p>

            {/* Trust bullets */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-gold" />
                Sem custos ocultos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-gold" />
                Técnicos certificados
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-gold" />
                Resposta em 24h
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ServiceGuarantee;
