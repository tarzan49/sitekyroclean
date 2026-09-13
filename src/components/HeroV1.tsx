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
        <div className="relative z-10 mx-auto grid grid-cols-1 gap-5 w-full max-w-[1400px] px-5 md:grid-cols-[minmax(0,52%)_minmax(300px,1fr)] md:gap-4 md:px-8 lg:grid-cols-[minmax(0,610px)_1fr] lg:px-16 xl:px-20">
          <div className="min-w-0 max-w-[610px]">

            {/* Tag */}
            <div className="inline-flex items-start mb-5">
              <div className="flex flex-col gap-1">
                <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                <span
                  className="text-sm font-bold text-gold/90 tracking-[0.08em] uppercase"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
                >
                  KYRO CLEAN SOLUTIONS
                </span>
              </div>
            </div>

            {/* H1 */}
            <h1
              className="type-page-title font-playfair      text-white  mb-4 md:mb-5"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.65)' }}
            >
              Estofos como novos,<br />
              <span style={{ color: '#D4AF37' }}>ao domicílio.</span>
            </h1>

            {/* Short value proposition stays on the dark sofa area, away from the extractor. */}
            <p
              className="mb-5 max-w-[430px] text-base leading-relaxed text-white sm:text-base md:mb-6 md:max-w-[360px] md:text-base lg:max-w-[390px]"
              style={{ textShadow: '0 1px 10px rgba(0,0,0,0.55)' }}
            >
              Especialistas em limpeza de estofos ao domicílio. Cuidado profissional, orçamento transparente e resposta em menos de 10 minutos. Equipas em Braga, Porto, Lisboa e Algarve.
            </p>

            {/* Mobile keeps the service count quiet beside the Google card. */}
            <div className="flex flex-col min-[400px]:flex-row w-full max-w-[430px] items-start min-[400px]:items-center gap-3 md:hidden">
              <div className="flex min-h-[58px] flex-1 items-center gap-2.5 border-l-2 border-[#D4AF37] pl-3">
                <span className="font-playfair text-2xl font-bold leading-none text-[#E7CE73]">{STATS[0].value}</span>
                <span className="max-w-[70px] text-sm font-semibold uppercase leading-[1.25] tracking-[0.1em] text-white/70">{STATS[0].label}</span>
              </div>
              <TrustRatingBadge variant="heroMobile" />
            </div>

          </div>

          {/* Desktop CTAs occupy the clean right side of the sofa, away from the extraction line. */}
          <div className="flex w-full max-w-sm flex-col gap-2.5 md:mb-8 md:w-[92%] md:max-w-[400px] md:self-end md:justify-self-center">

              {/* Price CTA stays primary on mobile and becomes secondary on desktop. */}
              <div className="group relative order-1 md:order-2">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg transition-opacity duration-400 pointer-events-none group-hover:opacity-55 md:opacity-15" />
                <button
                  onClick={handleOpenQuiz}
                  className={[
                    'relative w-full font-bold text-[#12121e] touch-manipulation',
                    'min-h-[58px] md:min-h-[48px] py-3 px-4 text-base md:text-[17px]',
                    'bg-gradient-to-r from-[#C9A84C] via-[#EDD96A] to-[#C9A84C]',
                    'shadow-[0_6px_22px_rgba(201,168,76,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                    'md:border md:border-[#D4AF37]/70 md:bg-none md:bg-black/35 md:text-white md:shadow-[0_8px_24px_rgba(0,0,0,0.22)] md:backdrop-blur-md',
                    'hover:shadow-[0_10px_32px_rgba(201,168,76,0.60),0_4px_10px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.36)]',
                    'hover:scale-[1.025]',
                    'active:scale-[0.95] active:shadow-[0_2px_8px_rgba(201,168,76,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
                    'transition-all duration-150',
                  ].join(' ')}
                >
                  <span className="text-base font-semibold tracking-[0.04em] uppercase">Calcular o meu preço</span>
                </button>
              </div>

              {/* WhatsApp becomes the primary desktop CTA. */}
              <div className="group relative order-2 md:order-1">
                <div className="absolute -inset-2 rounded-full bg-[#25D366]/45 opacity-30 blur-xl transition-opacity duration-400 pointer-events-none group-hover:opacity-65 md:opacity-50" />
                <a
                  href={`${WHATSAPP_BASE}?text=${encodeURIComponent('Olá, gostaria de saber mais sobre os vossos serviços de higienização.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('hero')}
                  className={[
                    'relative flex items-center justify-center gap-2 w-full font-bold text-[#071a12] touch-manipulation',
                    'min-h-[58px] md:min-h-[60px] py-3 px-4 text-base md:text-[17px]',
                    'bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851]',
                    'shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                    'hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)]',
                    'hover:scale-[1.025]',
                    'active:scale-[0.95] active:shadow-[0_2px_8px_rgba(37,211,102,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
                    'transition-all duration-150',
                  ].join(' ')}
                >
                  <MessageCircle className="w-[18px] h-[18px] text-[#071a12] flex-shrink-0" strokeWidth={2} />
                  <span className="text-base font-semibold tracking-[0.04em] uppercase">Falar por WhatsApp</span>
                </a>
              </div>

          </div>
        </div>

        <div className="absolute bottom-[7%] right-8 z-10 hidden md:block 2xl:right-[calc((100vw-1400px)/2+2rem)]">
          <TrustRatingBadge variant="floatingHero" />
        </div>

        <div className="absolute bottom-[7%] left-8 z-10 hidden items-center md:flex lg:left-16 xl:left-20 2xl:left-[calc((100vw-1400px)/2+5rem)]">
          <span className="font-playfair text-[2.6rem] font-bold leading-none text-[#E7CE73] [text-shadow:0_3px_18px_rgba(0,0,0,0.65)]">{STATS[0].value}</span>
          <span className="mx-4 h-10 w-px bg-[#D4AF37]/70" aria-hidden="true" />
          <span className="max-w-[110px] text-sm font-semibold uppercase leading-[1.35] tracking-[0.16em] text-white/80 [text-shadow:0_2px_10px_rgba(0,0,0,0.75)]">{STATS[0].label}</span>
        </div>

        <Suspense fallback={null}>
          <QuizForm isOpen={isQuizOpen} onClose={closeQuiz} />
        </Suspense>
      </section>
    </>
  );
};

export default Hero;
