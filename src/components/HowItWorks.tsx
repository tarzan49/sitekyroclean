import { useEffect, useRef, useState } from "react";
import { ShieldCheck, HandCoins, Clock } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Inspeção",
    desc: "Avaliamos o tipo de tecido, manchas e grau de sujidade para selecionar o protocolo ideal.",
  },
  {
    number: "02",
    title: "Limpeza profunda",
    desc: "Aplicamos produtos profissionais formulados para cada material, sem risco para o estofo.",
  },
  {
    number: "03",
    title: "Extração",
    desc: "Equipamento de alta pressão extrai sujidade, detergente e humidade em profundidade.",
  },
  {
    number: "04",
    title: "Secagem rápida",
    desc: "Técnica acelerada. Os seus estofos ficam prontos a usar no próprio dia da visita.",
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    title: "Satisfação garantida",
    text: "Se não ficou satisfeito, repetimos sem custos.",
  },
  {
    icon: HandCoins,
    title: "Preço transparente",
    text: "O valor apresentado é o final. Sem surpresas.",
  },
  {
    icon: Clock,
    title: "Pontualidade",
    text: "Chegamos na hora marcada. Sempre.",
  },
];

const HowItWorks = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#FAFAF7] scroll-mt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <div
          className="mb-14 md:mb-20 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-px bg-[#D4AF37]" />
            <p className="text-[9px] font-semibold text-[#D4AF37] tracking-[0.35em] uppercase">
              O Nosso Processo
            </p>
          </div>
          <h2
            className="font-playfair font-light text-[#111111]"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', lineHeight: 1.08, letterSpacing: '-0.02em' }}
          >
            Quatro passos.<br />
            <em style={{ fontStyle: 'italic', color: '#1A4E30' }}>Resultados no próprio dia.</em>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative mb-20 md:mb-24">
          {/* Horizontal connector line (desktop only) — sits at center of step boxes */}
          <div
            className="hidden md:block absolute left-0 right-0 h-px bg-[#111111]/8"
            style={{ top: '1.5rem' }}
          />

          <div className="grid md:grid-cols-4 gap-10 md:gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="transition-all duration-700"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(24px)',
                  transitionDelay: `${100 + i * 120}ms`,
                }}
              >
                {/* Step box — sits on the connector line */}
                <div className="relative z-10 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FAFAF7] border border-[#111111]/10">
                    <span className="font-playfair font-light text-[#1A4E30] text-lg leading-none">{step.number}</span>
                  </div>
                </div>

                <h3
                  className="font-playfair font-normal text-[#111111] mb-2"
                  style={{ fontSize: 'clamp(1.05rem, 1.4vw, 1.2rem)', letterSpacing: '-0.01em' }}
                >
                  {step.title}
                </h3>
                <p className="text-[#111111]/45 leading-relaxed text-sm" style={{ fontWeight: 300 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantees */}
        <div
          className="border-t border-[#111111]/6 pt-14 grid md:grid-cols-3 gap-8 md:gap-12 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '580ms' }}
        >
          {guarantees.map((g, i) => {
            const Icon = g.icon;
            return (
              <div key={i} className="flex items-start gap-4">
                <div className="w-9 h-9 border border-[#111111]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-[#1A4E30]" strokeWidth={1.5} />
                </div>
                <div>
                  <p
                    className="font-playfair font-normal text-[#111111] mb-1"
                    style={{ fontSize: '1rem', letterSpacing: '-0.01em' }}
                  >
                    {g.title}
                  </p>
                  <p className="text-[#111111]/40 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                    {g.text}
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

export default HowItWorks;
