import { useEffect, useRef, useState } from "react";
import { WHATSAPP_BASE } from "@/constants/business";

const FinalCTA = () => {
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

  const openQuiz = () => {
    window.dispatchEvent(new CustomEvent('openQuiz'));
  };

  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent('Olá, gostaria de pedir um orçamento para limpeza de estofos.')}`;

  return (
    <section
      ref={ref}
      data-section="final-cta"
      className="py-24 md:py-36 bg-[#1A4E30]"
    >
      <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">

        {/* Overline */}
        <div
          className="flex items-center justify-center gap-3 mb-10 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
        >
          <div className="w-7 h-px bg-[#D4AF37]" />
          <p className="text-[9px] font-semibold text-[#D4AF37] tracking-[0.35em] uppercase">
            Porto e todo o País
          </p>
          <div className="w-7 h-px bg-[#D4AF37]" />
        </div>

        {/* Heading */}
        <h2
          className="font-playfair font-light text-white mb-6 transition-all duration-700 delay-75"
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          Os seus estofos<br />
          <em style={{ fontStyle: 'italic' }}>merecem melhor.</em>
        </h2>

        <p
          className="text-white/45 leading-relaxed mb-12 max-w-sm mx-auto transition-all duration-700 delay-150"
          style={{
            fontWeight: 300,
            fontSize: '0.95rem',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          Orçamento gratuito, sem compromisso.<br />Deslocação incluída. Resultados garantidos.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 transition-all duration-700 delay-200"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)' }}
        >
          <button
            onClick={openQuiz}
            className="bg-white text-[#1A4E30] text-[10px] font-semibold tracking-[0.20em] uppercase px-10 py-4 hover:bg-[#F5F4F0] active:bg-[#EBE9E3] transition-colors whitespace-nowrap touch-manipulation w-full sm:w-auto"
          >
            Obter Orçamento
          </button>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/25 text-white text-[10px] font-semibold tracking-[0.20em] uppercase px-10 py-4 hover:border-white/50 transition-colors whitespace-nowrap touch-manipulation w-full sm:w-auto text-center"
          >
            WhatsApp
          </a>
        </div>

        {/* Trust line */}
        <p
          className="text-white/20 text-[8px] tracking-[0.22em] uppercase transition-all duration-700 delay-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          Deslocação gratuita · Sem compromisso · Garantia de satisfação
        </p>

      </div>
    </section>
  );
};

export default FinalCTA;
