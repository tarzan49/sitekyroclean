import { useEffect, useRef, useState } from "react";
import { ShieldCheck, HandCoins, Droplets } from "lucide-react";
import QuizButton from "./QuizButton";
import TrustRatingBadge from "@/components/TrustRatingBadge";

const steps = [
  {
    number: "01",
    titleFallback: "Peça orçamento",
    descFallback: "Quiz em 30 segundos. Preço imediato, sem compromisso.",
  },
  {
    number: "02",
    titleFallback: "Agendamos a visita",
    descFallback: "Deslocamo-nos à sua casa na data que escolher.",
  },
  {
    number: "03",
    titleFallback: "Resultados no momento",
    descFallback: "Estofos como novos no próprio dia da visita.",
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    titleFallback: "Satisfação garantida",
    textFallback: "Se não ficou satisfeito, repetimos sem custos.",
  },
  {
    icon: HandCoins,
    titleFallback: "Orçamento transparente",
    textFallback: "O valor apresentado é o valor final. Sem surpresas.",
  },
  {
    icon: Droplets,
    titleFallback: "Proteção duradoura",
    textFallback: "Impermeabilização Premium com proteção real até 5 anos.",
  },
];

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="overflow-hidden scroll-mt-16 bg-kyro-green">

      {/* ── Cabeçalhos das duas colunas ─────────────────────────────────── */}
      <div className="grid lg:grid-cols-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Left header */}
        <div
          className={`px-6 sm:px-10 lg:px-14 py-10 md:py-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <p className="text-[9px] font-bold tracking-[0.30em] uppercase" style={{ color: '#D4AF37', opacity: 0.80 }}>
              O NOSSO PROCESSO
            </p>
          </div>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-[2.6rem] font-bold text-white leading-[1.1]">
            Como{" "}
            <em className="not-italic" style={{ color: '#D4AF37' }}>funciona</em>
          </h2>
        </div>

        {/* Right header — oculto em mobile (os itens aparecem intercalados abaixo) */}
        <div
          className={`hidden lg:block px-6 sm:px-10 lg:px-14 py-10 md:py-14 transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <p className="text-[9px] font-bold tracking-[0.30em] uppercase" style={{ color: '#D4AF37', opacity: 0.80 }}>
              A NOSSA PROMESSA
            </p>
          </div>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-[2.6rem] font-bold text-white leading-[1.1]">
            Qualidade{" "}
            <em className="not-italic" style={{ color: '#D4AF37' }}>garantida</em>
          </h2>
        </div>
      </div>

      {/* ── Linhas partilhadas — garante alinhamento perfeito no desktop ── */}
      {steps.map((step, i) => {
        const g = guarantees[i];
        const Icon = g.icon;
        const isLast = i === steps.length - 1;
        return (
          <div
            key={i}
            className="grid lg:grid-cols-2"
            style={!isLast ? { borderBottom: "1px solid rgba(255,255,255,0.06)" } : undefined}
          >
            {/* LEFT: step */}
            <div
              className={`flex gap-5 px-6 sm:px-10 lg:px-14 py-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}
              style={{
                transitionDelay: `${(i + 1) * 100}ms`,
                borderRight: "1px solid rgba(255,255,255,0.06)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Number badge */}
              <div
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center mt-0.5"
                style={{
                  border: "1px solid rgba(212,175,55,0.20)",
                  background: "rgba(212,175,55,0.06)",
                }}
              >
                <span className="font-mono text-[11px] font-bold" style={{ color: "rgba(212,175,55,0.70)" }}>
                  {step.number}
                </span>
              </div>
              <div>
                <h3 className="font-playfair text-xl font-bold text-white mb-1.5 leading-snug">
                  {step.titleFallback}
                </h3>
                <p className="text-white/50 text-[13px] leading-relaxed">
                  {step.descFallback}
                </p>
              </div>
            </div>

            {/* RIGHT: guarantee */}
            <div
              className={`flex gap-5 px-6 sm:px-10 lg:px-14 py-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'}`}
              style={{
                transitionDelay: `${200 + i * 100}ms`,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Icon badge */}
              <div
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center mt-0.5"
                style={{
                  border: "1px solid rgba(212,175,55,0.22)",
                  background: "rgba(212,175,55,0.07)",
                }}
              >
                <Icon className="w-4 h-4" style={{ color: "#D4AF37" }} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-playfair text-xl font-bold text-white mb-1.5 leading-snug">
                  {g.titleFallback}
                </h3>
                <p className="text-white/50 text-[13px] leading-relaxed">
                  {g.textFallback}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Bottom CTA strip ─────────────────────────────────────────────── */}
      <div
        className={`py-6 px-6 flex flex-col items-center gap-4 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDelay: '500ms', borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <QuizButton />
        <TrustRatingBadge variant="horizontal" />
      </div>

    </section>
  );
};

export default HowItWorks;
