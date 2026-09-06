import { useEffect, lazy, Suspense } from "react";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_BASE } from "@/constants/business";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";

const QuizForm = lazy(() => import('./QuizFormLazy'));

const imgDesktop = '/images/hero-sofa-v1.jpeg';
const imgMobile  = '/images/hero-sofa-v1.jpeg';

const STATS = [
  { value: '+1200', label: 'serviços realizados' },
];

const SERVICES = [
  { value: '800+',  label: 'sofás' },
  { value: '500+',  label: 'colchões' },
  { value: '1000+', label: 'tapetes' },
  { value: '+1600', label: 'cadeiras' },
];

const Hero = () => {
  const { isQuizOpen, openQuiz: handleOpenQuiz, closeQuiz } = useQuizLauncher();

  useEffect(() => {
    window.addEventListener('openQuiz', handleOpenQuiz);
    return () => window.removeEventListener('openQuiz', handleOpenQuiz);
  }, [handleOpenQuiz]);

  return (
    <>
      <section
        id="orcamento"
        className="relative min-h-[92vh] md:min-h-[95vh] flex items-center z-[1] pt-[56px] sm:pt-[70px] md:pt-[100px] pb-[60px] md:pb-[100px] overflow-hidden"
        aria-label="Kyro Clean Solutions - Higienização de Estofos ao Domicílio"
      >
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(max-width: 767px)" srcSet={imgMobile} type="image/webp" />
            <source srcSet={imgDesktop} type="image/webp" />
            <img
              src={imgDesktop}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center 30%' }}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-0" style={{ background: 'rgba(8, 10, 30, 0.42)' }} />
        </div>

        {/* Left gradient */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0B2F2A]/88 via-[#0B2F2A]/55 to-transparent pointer-events-none" />
        {/* Mobile overlay */}
        <div className="md:hidden absolute inset-0 z-[1] bg-kyro-green/72 pointer-events-none" />
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="container mx-auto px-5 md:px-8 relative z-10">
          <div className="max-w-2xl">

            {/* Tag */}
            <div className="inline-flex items-start mb-5">
              <div className="flex flex-col gap-1">
                <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                <span
                  className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
                >
                  KYRO CLEAN SOLUTIONS
                </span>
              </div>
            </div>

            {/* H1 */}
            <h1
              className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.15] mb-4 md:mb-5"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.65)' }}
            >
              Estofos como novos,<br />
              <span style={{ color: '#D4AF37' }}>ao domicílio.</span>
            </h1>

            {/* Trust row: main stat + Google rating, one compact line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-playfair text-xl md:text-2xl font-bold text-gold leading-none"
                  style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
                >
                  {STATS[0].value}
                </span>
                <span className="text-[10px] text-white/55 font-medium tracking-[0.14em] uppercase">{STATS[0].label}</span>
              </div>
              <span className="w-px h-4 bg-white/15 flex-shrink-0" />
              <TrustRatingBadge variant="mapsLink" />
            </div>

            {/* Services breakdown — desktop only, keeps mobile hero uncluttered */}
            <div className="hidden md:flex flex-wrap gap-x-6 gap-y-3 mb-7">
              {SERVICES.map((s, i) => (
                <div key={i} className="flex-shrink-0">
                  <p className="font-playfair text-lg font-bold text-gold leading-none mb-1">{s.value}</p>
                  <p className="text-[9px] font-medium tracking-[0.14em] uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Subtitle */}
            <p
              className="text-sm sm:text-base md:text-lg text-white leading-relaxed mb-6 md:mb-8 max-w-lg"
              style={{ textShadow: '0 1px 10px rgba(0,0,0,0.55)' }}
            >
              Eliminamos manchas, ácaros e odores com equipamento profissional. Resultado garantido no próprio dia, em qualquer ponto de Portugal.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 w-full max-w-sm">

              {/* Primary — gold */}
              <div className="relative group">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                <button
                  onClick={handleOpenQuiz}
                  className={[
                    'relative w-full font-bold text-[#12121e] touch-manipulation',
                    'h-[58px] md:h-[52px] px-8 text-base md:text-[17px]',
                    'bg-gradient-to-r from-[#C9A84C] via-[#EDD96A] to-[#C9A84C]',
                    'shadow-[0_6px_22px_rgba(201,168,76,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                    'hover:shadow-[0_10px_32px_rgba(201,168,76,0.60),0_4px_10px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.36)]',
                    'hover:scale-[1.025]',
                    'active:scale-[0.95] active:shadow-[0_2px_8px_rgba(201,168,76,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
                    'transition-all duration-150',
                  ].join(' ')}
                >
                  <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Calcular o meu preço</span>
                </button>
              </div>

              {/* Secondary — WhatsApp */}
              <div className="relative group">
                <div className="absolute -inset-1.5 rounded-full bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                <a
                  href={`${WHATSAPP_BASE}?text=${encodeURIComponent('Olá, gostaria de saber mais sobre os vossos serviços de higienização.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('hero')}
                  className={[
                    'relative flex items-center justify-center gap-2 w-full font-bold text-white touch-manipulation',
                    'h-[58px] md:h-[52px] px-8 text-base md:text-[17px]',
                    'bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851]',
                    'shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                    'hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)]',
                    'hover:scale-[1.025]',
                    'active:scale-[0.95] active:shadow-[0_2px_8px_rgba(37,211,102,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
                    'transition-all duration-150',
                  ].join(' ')}
                >
                  <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
                  <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Falar por WhatsApp</span>
                </a>
              </div>

            </div>
          </div>
        </div>

        <Suspense fallback={null}>
          <QuizForm isOpen={isQuizOpen} onClose={closeQuiz} />
        </Suspense>
      </section>
    </>
  );
};

export default Hero;
