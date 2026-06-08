import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import painpointMites from "@/assets/painpoint-mites.webp";
import painpointStains from "@/assets/painpoint-stains.webp";
import painpointOdour from "@/assets/painpoint-odour.webp";
import painpointWorn from "@/assets/painpoint-worn.webp";

const CARDS = [
  {
    num: "01",
    image: painpointMites,
    alt: "Ácaros e bactérias microscópicas no sofá",
    title: "Ácaros e bactérias\ninvisíveis",
    detail: "Eliminamos 99% dos microrganismos com higienização antibacteriana profissional",
    col: "lg:col-span-7",
    pos: "center",
  },
  {
    num: "02",
    image: painpointStains,
    alt: "Mancha de vinho no sofá",
    title: "Manchas que se\ntornam permanentes",
    detail: "Extração profunda remove até as manchas mais difíceis no momento",
    col: "lg:col-span-5",
    pos: "center",
  },
  {
    num: "03",
    image: painpointOdour,
    alt: "Odores acumulados em sofá",
    title: "Odores que se\nacumulam meses a fio",
    detail: "Desodorização completa que devolve frescura real aos seus tecidos",
    col: "lg:col-span-5",
    pos: "center",
  },
  {
    num: "04",
    image: painpointWorn,
    alt: "Desgaste acelerado de tecido de sofá",
    title: "Desgaste acelerado\nsem proteção",
    detail: "Impermeabilização profissional com garantia até 10 anos",
    col: "lg:col-span-7",
    pos: "top",
  },
];

const PainPointsSolutions = () => {
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

  return (
    <section ref={ref} className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <div
          className="mb-12 md:mb-16 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-px bg-[#D4AF37]" />
            <p className="text-[9px] font-semibold text-[#D4AF37] tracking-[0.35em] uppercase">
              Sabia que?
            </p>
          </div>
          <div className="max-w-2xl">
            <h2
              className="font-playfair font-light text-[#1A1A2E] mb-5"
              style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', lineHeight: 1.08, letterSpacing: '-0.02em' }}
            >
              O que os seus estofos<br />
              <em style={{ fontStyle: 'italic', color: '#1A4E30' }}>realmente escondem.</em>
            </h2>
            <p className="text-[#1A1A2E]/45 leading-relaxed max-w-md" style={{ fontWeight: 300, fontSize: '0.95rem' }}>
              Problemas invisíveis que afetam a saúde e o conforto da sua família todos os dias.
            </p>
          </div>
        </div>

        {/* Bento grid — sharp rectangles, no rounded corners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 md:gap-2.5 mb-12">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className={`relative overflow-hidden group cursor-default ${card.col} transition-all duration-700`}
              style={{
                height: 'clamp(200px, 24vw, 280px)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${100 + i * 90}ms`,
              }}
            >
              {/* Image */}
              <img
                src={card.image}
                alt={card.alt}
                className="absolute inset-0 w-full h-full object-cover saturate-[0.55] group-hover:saturate-[0.8] group-hover:scale-[1.04] transition-all duration-700 ease-out"
                style={{ objectPosition: card.pos }}
                loading="lazy"
                decoding="async"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f13]/90 via-[#0d1f13]/30 to-transparent pointer-events-none" />

              {/* Number */}
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[10px] font-semibold text-white/30 tracking-[0.18em] group-hover:text-[#D4AF37]/60 transition-colors duration-400">
                  {card.num}
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-6">
                <div className="w-6 h-px mb-3 bg-[#D4AF37] opacity-50 group-hover:w-10 group-hover:opacity-90 transition-all duration-400" />
                <h3
                  className="font-playfair font-light text-white leading-[1.2] mb-2 whitespace-pre-line"
                  style={{ fontSize: 'clamp(1rem, 1.6vw, 1.2rem)', letterSpacing: '-0.01em' }}
                >
                  {card.title}
                </h3>
                <p className="text-white/50 text-[12px] leading-relaxed group-hover:text-white/68 transition-colors duration-300">
                  {card.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats + CTA */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '460ms' }}
        >
          <div className="flex gap-8 md:gap-12 flex-wrap">
            {[
              { value: "99%",     label: "microrganismos eliminados" },
              { value: "+1000",   label: "famílias protegidas" },
              { value: "10 anos", label: "garantia impermeabilização" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-playfair font-light text-[#1A4E30] text-2xl md:text-3xl leading-none mb-1">
                  {s.value}
                </p>
                <p className="text-[9px] font-medium text-[#1A1A2E]/35 tracking-[0.20em] uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={openQuiz}
            className="inline-flex items-center gap-2.5 border border-[#1A1A2E]/15 text-[#1A1A2E] text-[10px] font-semibold tracking-[0.20em] uppercase px-7 py-4 hover:border-[#1A4E30] hover:text-[#1A4E30] transition-colors self-start md:self-auto whitespace-nowrap touch-manipulation"
          >
            Proteja a sua família
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default PainPointsSolutions;
