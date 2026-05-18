import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import QuizForm from './QuizFormLazy';
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
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const openQuiz = () => {
    window.dispatchEvent(new CustomEvent('quizOpened'));
    sessionStorage.setItem('hasClickedQuote', '1');
    setIsQuizOpen(true);
  };

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-kyro-green overflow-hidden">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className={`text-center mb-7 md:mb-9 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-3" style={{ color: '#D4AF37' }}>
            {t('painPoints.badge', 'Sabia que?')}
          </p>
          <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
            {t('painPoints.title', 'O que os seus estofos escondem')}
          </h2>
          <p className="text-white/45 text-sm max-w-lg mx-auto leading-relaxed">
            {t('painPoints.subtitle', 'Problemas invisíveis que afetam a saúde e o conforto da sua família todos os dias.')}
          </p>
          <div className="w-10 h-px mx-auto mt-4" style={{ backgroundColor: '#D4AF37', opacity: 0.4 }} />
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 md:gap-3 max-w-5xl mx-auto">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl group cursor-default ${card.col} ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{
                height: 'clamp(180px, 22vw, 250px)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '600ms',
                transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
                transitionDelay: `${i * 90}ms`,
              }}
            >
              {/* Image */}
              <img
                src={card.image}
                alt={card.alt}
                className="absolute inset-0 w-full h-full object-cover saturate-[0.6] group-hover:saturate-[0.9] group-hover:scale-[1.04] transition-all duration-700 ease-out"
                style={{ objectPosition: card.pos }}
                loading="lazy"
                decoding="async"
                width={800}
                height={534}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#071a12]/95 via-[#071a12]/40 to-[#071a12]/30 pointer-events-none" />

              {/* Top: number badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-block font-mono text-[11px] font-bold tracking-[0.18em] text-white/35 border border-white/15 rounded-full px-2.5 py-0.5 group-hover:text-[#D4AF37]/70 group-hover:border-[#D4AF37]/30 transition-colors duration-400">
                  {card.num}
                </span>
              </div>

              {/* Bottom: title + detail */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-6">
                {/* Gold accent line */}
                <div
                  className="w-6 h-[2px] mb-3 rounded-full opacity-60 group-hover:w-10 group-hover:opacity-100 transition-all duration-400"
                  style={{ backgroundColor: '#D4AF37' }}
                />
                <h3 className="font-playfair font-bold text-white text-[1.05rem] md:text-lg leading-[1.25] mb-2 whitespace-pre-line">
                  {card.title}
                </h3>
                <p className="text-white/55 text-[12px] md:text-[13px] leading-relaxed line-clamp-2 group-hover:text-white/70 transition-colors duration-300">
                  {card.detail}
                </p>
              </div>

              {/* Border ring */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/[0.08] group-hover:ring-[#D4AF37]/30 transition-all duration-400 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div
          className={`mt-7 md:mt-9 max-w-3xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '420ms' }}
        >
          {[
            { value: "99%",   label: "microrganismos eliminados" },
            { value: "+1000", label: "famílias protegidas" },
            { value: "48h",   label: "garantia total" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-playfair text-2xl font-bold" style={{ color: '#D4AF37' }}>{s.value}</p>
              <p className="text-white/40 text-[11px] tracking-wide uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '520ms' }}
        >
          <button
            onClick={openQuiz}
            className="group inline-flex items-center gap-2 text-sm font-medium text-white/55 hover:text-[#D4AF37] transition-colors duration-300 border-b border-transparent hover:border-[#D4AF37]/40 pb-0.5"
          >
            <span className="tracking-wide">
              {t('painPoints.cta', 'Proteja a sua família: Peça Orçamento')}
            </span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </button>
        </div>
      </div>

      <QuizForm isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </section>
  );
};

export default PainPointsSolutions;
