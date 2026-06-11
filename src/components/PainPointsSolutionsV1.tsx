import { useEffect, useRef, useState } from "react";
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
    alt: "Ácaros e bactérias no sofá",
    title: "Ácaros invisíveis\nna sua casa",
    solution: "99% eliminados com higienização antibacteriana",
    pos: "center",
  },
  {
    num: "02",
    image: painpointStains,
    alt: "Mancha de vinho no sofá",
    title: "Manchas que\nficam para sempre",
    solution: "Extração profunda: resultado no próprio dia",
    pos: "center",
  },
  {
    num: "03",
    image: painpointOdour,
    alt: "Odores acumulados no sofá",
    title: "Odores mês\napós mês",
    solution: "Desodorização completa, frescura imediata",
    pos: "center",
  },
  {
    num: "04",
    image: painpointWorn,
    alt: "Desgaste de tecido de sofá",
    title: "Desgaste antes\ndo tempo",
    solution: "Impermeabilização com proteção até 10 anos",
    pos: "top",
  },
];

const PainPointsSolutions = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.06 }
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
    <section ref={sectionRef} className="py-14 md:py-20 bg-kyro-green">
      <div className="container mx-auto">

        {/* ── Header — editorial, left-aligned ── */}
        <div
          className={`px-5 md:px-8 mb-8 md:mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <span className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.8 }}>
              O QUE TRATAMOS
            </span>
          </div>
          <h2 className="font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold text-white leading-[1.1] max-w-xl">
            Os 4 problemas que{' '}
            <em className="not-italic" style={{ color: '#D4AF37' }}>
              resolvemos no próprio dia
            </em>
          </h2>
        </div>

        {/* ── Cards: snap scroll mobile · 2-col md · 4-col lg ── */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-5 pb-2 md:px-8 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:pb-0">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className={`snap-start flex-none w-[78vw] sm:w-[54vw] md:w-auto relative overflow-hidden rounded-2xl group cursor-default ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                height: '340px',
                transitionProperty: 'opacity, transform',
                transitionDuration: '650ms',
                transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
                transitionDelay: `${i * 85}ms`,
              }}
            >
              {/* Image */}
              <img
                src={card.image}
                alt={card.alt}
                className="absolute inset-0 w-full h-full object-cover saturate-[0.50] group-hover:saturate-[0.80] group-hover:scale-[1.05] transition-all duration-700 ease-out"
                style={{ objectPosition: card.pos }}
                loading="lazy"
                decoding="async"
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#071a12] via-[#071a12]/55 to-transparent pointer-events-none" />

              {/* Number */}
              <div className="absolute top-4 left-4 z-10">
                <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-white/25 group-hover:text-gold/55 transition-colors duration-400">
                  {card.num}
                </span>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-6">
                <div
                  className="mb-3 rounded-full opacity-45 group-hover:opacity-90 transition-all duration-400"
                  style={{ width: '20px', height: '1.5px', backgroundColor: '#D4AF37', transition: 'width 400ms ease, opacity 400ms ease' }}
                  onMouseEnter={e => (e.currentTarget.style.width = '32px')}
                  onMouseLeave={e => (e.currentTarget.style.width = '20px')}
                />
                <h3 className="font-playfair font-bold text-white text-[1.05rem] md:text-[1.1rem] leading-[1.2] mb-2.5 whitespace-pre-line">
                  {card.title}
                </h3>
                <p
                  className="text-[11px] md:text-[12px] leading-relaxed font-medium"
                  style={{ color: '#D4AF37', opacity: 0.70 }}
                >
                  {card.solution}
                </p>
              </div>

              {/* Border ring */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/[0.06] group-hover:ring-gold/20 transition-all duration-400 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Swipe hint — mobile only */}
        <p className="text-center text-[9px] text-white/18 tracking-[0.22em] uppercase mt-4 md:hidden">
          deslize para ver mais →
        </p>

        {/* ── CTA ── */}
        <div
          className={`px-5 md:px-8 mt-9 md:mt-11 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '380ms' }}
        >
          <button
            onClick={openQuiz}
            className="group inline-flex items-center gap-2 text-sm font-medium text-white/45 hover:text-gold transition-colors duration-300 border-b border-transparent hover:border-gold/35 pb-0.5"
          >
            <span className="tracking-wide">Proteja a sua família, calcule o preço agora</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </button>
        </div>

      </div>

      <QuizForm isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </section>
  );
};

export default PainPointsSolutions;
