import { useState, useEffect, lazy, Suspense } from "react";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { ArrowRight } from "lucide-react";
import { WHATSAPP_BASE } from "@/constants/business";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";

const QuizForm = lazy(() => import('./QuizFormLazy'));

const imgDesktop = '/images/fotos%20hero/novafotoheropc.webp';
const imgMobile  = '/images/fotos%20hero/imagemiphoneheronova.webp';

const Hero = () => {
  const { isQuizOpen, openQuiz, closeQuiz } = useQuizLauncher();
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [loaded, setLoaded]               = useState(false);

  useEffect(() => {
    window.addEventListener('openQuiz', openQuiz);
    const t = setTimeout(() => setLoaded(true), 80);
    return () => { window.removeEventListener('openQuiz', openQuiz); clearTimeout(t); };
  }, [openQuiz]);

  useEffect(() => {
    const handleScroll = () => {
      const hero    = document.getElementById('orcamento');
      const finalCta = document.querySelector('[data-section="final-cta"]');
      let show = hero ? hero.getBoundingClientRect().bottom < 100 : false;
      if (finalCta) {
        const r = finalCta.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) show = false;
      }
      setShowStickyCTA(show);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToResults = () => {
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' });
  };

  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent('Olá, gostaria de pedir um orçamento para limpeza de estofos.')}`;

  return (
    <>
      <section
        id="orcamento"
        className="relative min-h-[100svh] md:min-h-screen flex flex-col md:flex-row pt-[60px] overflow-hidden bg-white"
        aria-label="Kyro Clean Solutions: Limpeza Profissional de Estofos"
      >

        {/* ── LEFT — content ─────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col justify-center px-7 sm:px-12 md:px-14 lg:px-20 py-16 md:py-0 md:w-[52%] bg-white">

          {/* Overline */}
          <div
            className="flex items-center gap-3 mb-8 md:mb-10 transition-all duration-700"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(12px)' }}
          >
            <div className="w-7 h-px bg-[#D4AF37]" />
            <p className="text-[9px] font-semibold text-[#D4AF37] tracking-[0.35em] uppercase">
              Limpeza Profissional · Porto &amp; Todo o País
            </p>
          </div>

          {/* Heading */}
          <h1
            className="font-playfair font-light text-[#111111] mb-6 md:mb-8 transition-all duration-700 delay-75"
            style={{
              fontSize: 'clamp(2.6rem, 5.5vw, 5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(16px)',
            }}
          >
            Limpeza Profissional<br />
            de Estofos<br />
            <em style={{ fontStyle: 'italic', color: '#1A4E30' }}>ao Domicílio.</em>
          </h1>

          {/* Body */}
          <p
            className="text-[#111111]/50 leading-relaxed mb-10 md:mb-12 max-w-md transition-all duration-700 delay-150"
            style={{
              fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
              fontWeight: 300,
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            Restauramos o conforto, a higiene e a aparência dos seus sofás, colchões e tapetes, com equipamento de extração profissional e resultados visíveis no próprio dia.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-3 sm:items-center mb-10 md:mb-12 transition-all duration-700 delay-200"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(12px)' }}
          >
            <button
              onClick={openQuiz}
              className="bg-[#1A4E30] text-white text-[10px] font-semibold tracking-[0.20em] uppercase px-8 py-4 hover:bg-[#143d24] active:bg-[#0f2e1b] transition-colors whitespace-nowrap touch-manipulation"
            >
              Obter Orçamento
            </button>
            <button
              onClick={scrollToResults}
              className="flex items-center justify-center sm:justify-start gap-2 text-[#111111]/50 text-[10px] font-semibold tracking-[0.20em] uppercase py-4 hover:text-[#111111] transition-colors whitespace-nowrap touch-manipulation"
            >
              Ver Resultados
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trust */}
          <div
            className="flex items-center gap-4 flex-wrap transition-all duration-700 delay-300"
            style={{ opacity: loaded ? 1 : 0 }}
          >
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3 h-3 fill-[#D4AF37]" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-[11px] font-semibold text-[#111111] ml-1">5.0 Google</span>
            </div>
            <span className="w-px h-3 bg-[#111111]/12" />
            <span className="text-[10px] text-[#111111]/40 tracking-wide">+1000 clientes satisfeitos</span>
            <span className="w-px h-3 bg-[#111111]/12" />
            <span className="text-[10px] text-[#111111]/40 tracking-wide">Deslocação incluída</span>
          </div>
        </div>

        {/* ── RIGHT — photo ──────────────────────────────────────────── */}
        <div className="relative md:w-[48%] h-[45vw] md:h-auto order-first md:order-last">
          <picture className="absolute inset-0 w-full h-full">
            <source media="(max-width: 767px)" srcSet={imgMobile} type="image/webp" />
            <source srcSet={imgDesktop} type="image/webp" />
            <img
              src={imgDesktop}
              alt="Sofá limpo pela Kyro Clean Solutions"
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center 30%' }}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
            />
          </picture>
          {/* Very subtle shadow on left edge to blend with content */}
          <div className="hidden md:block absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
        </div>

      </section>

      {/* ── Mobile sticky CTA ── */}
      {!isQuizOpen && (
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white border-t border-[#111111]/8 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 md:hidden transition-transform duration-300 ${
            showStickyCTA ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <button
            onClick={openQuiz}
            className="w-full h-14 bg-[#1A4E30] text-white text-[10px] font-semibold tracking-[0.22em] uppercase hover:bg-[#143d24] transition-colors touch-manipulation"
          >
            Obter Orçamento
          </button>
        </div>
      )}

      <Suspense fallback={null}>
        <QuizForm isOpen={isQuizOpen} onClose={closeQuiz} />
      </Suspense>
    </>
  );
};

export default Hero;
