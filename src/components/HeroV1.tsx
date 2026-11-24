import { buildGeneralWaMessage } from "@/lib/whatsappMessages";
import { useEffect, lazy, Suspense } from "react";
import { Calculator, MessageCircle } from "lucide-react";
import { WHATSAPP_BASE } from "@/constants/business";
import HomeHeroTrust from "@/components/HomeHeroTrust";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";

const QuizForm = lazy(() => import('./QuizFormLazy'));

const imgDesktop = '/images/hero-sofa-v1.webp';
const imgMobile = '/images/hero-sofa-mobile-extended.webp';
const imgMobile750 = '/images/hero-sofa-mobile-extended-750.webp';

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
        className="relative bg-[#0B2F2A] min-h-[100svh] flex items-stretch md:items-center z-[1] pt-[76px] md:pt-[100px] pb-7 md:pb-[100px] overflow-hidden"
        aria-label="Kyro Clean Solutions - Higienização de Estofos ao Domicílio"
      >
        {/* One continuous outpainted scene behind all three mobile content rows. */}
        <div className="absolute inset-x-0 bottom-0 top-14 md:hidden" aria-hidden="true">
          <picture className="block h-full w-full">
            <source media="(min-width: 768px)" srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
            <img src={imgMobile} srcSet={`${imgMobile750} 750w, ${imgMobile} 887w`} sizes="100vw" alt="" className="h-full w-full object-cover object-[center_58%]" loading="eager" fetchPriority="high" width={887} height={1774} />
          </picture>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,28,23,.78) 0%, rgba(5,28,23,.55) 18%, transparent 30%, transparent 46%, rgba(5,28,23,.74) 59%, rgba(5,28,23,.92) 72%, rgba(5,28,23,.97) 100%)' }} />
        </div>
        {/* Background */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <picture>
            <source media="(max-width: 767px)" srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
            <img
              src={imgDesktop}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center 30%' }}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              width={1600}
              height={893}
            />
          </picture>
          <div className="absolute inset-0" style={{ background: 'rgba(8, 10, 30, 0.42)' }} />
        </div>

        {/* Left gradient */}
        <div className="hidden md:block absolute inset-0 z-[1] bg-gradient-to-r from-[#0B2F2A]/88 via-[#0B2F2A]/55 to-transparent pointer-events-none" />
        {/* Bottom gradient */}
        <div className="hidden md:block absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col px-5 md:grid md:grid-cols-[minmax(0,52%)_minmax(300px,1fr)] md:gap-4 md:px-8 lg:grid-cols-[minmax(0,610px)_1fr] lg:px-16 xl:px-20">
          <div className="max-w-[610px]">

            {/* H1 */}
            <h1
              className="font-playfair text-[1.75rem] min-[375px]:text-[1.95rem] sm:text-[2.625rem] md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] md:leading-[1.15] tracking-[-0.025em] mb-4 md:mb-5"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.65)' }}
            >
              Os seus estofos como novos,{' '}
              <span style={{ color: '#D4AF37' }}>ainda hoje.</span>
            </h1>

            {/* Sem descrição por agora (dono, 24 Nov): primeiro vê só o título; a descrição volta depois. */}

          </div>

          {/* Keep the cleaning line visible while bringing trust and both CTAs into the first mobile viewport. */}
          <div className="-mx-5 min-h-[clamp(9rem,40vw,11rem)] flex-1 md:hidden" role="img" aria-label="Limpeza de um sofá, com a diferença visível entre o tecido limpo e por limpar" />
          {/* Linha subtil por cima da prova (dono, 24 Nov). */}
          <p className="whitespace-nowrap text-center text-[10px] font-medium uppercase tracking-[0.1em] text-[#D4AF37]/85 md:hidden">Todo Portugal <span className="mx-1.5 text-white/30">|</span> Resposta em menos de 1 minuto</p>
          <div className="py-3 md:hidden">
            <HomeHeroTrust />
          </div>

          {/* Desktop CTAs occupy the clean right side of the sofa, away from the extraction line. */}
          <div className="mx-auto flex w-full max-w-sm flex-col gap-2.5 md:mb-8 md:mt-0 md:w-[92%] md:max-w-[400px] md:self-end md:justify-self-center">

              {/* WhatsApp primeiro, com a mensagem genérica; o questionário volta por baixo, bem visível (dono, 25 Nov:
                  "voltar a meter o CTA no Hero [...] torna o botao acessivel e obvio"). */}
              <div className="group relative order-1">
                <div className="absolute -inset-2 rounded-full bg-[#25D366]/45 opacity-50 blur-xl transition-opacity duration-400 pointer-events-none group-hover:opacity-70" />
                <a
                  href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-tracking-source="hero"
                  className={[
                    'relative flex items-center justify-center gap-2 w-full font-bold text-white touch-manipulation',
                    'h-[56px] md:h-[60px] px-4 md:px-8 text-base md:text-[17px]',
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
              <button
                type="button"
                onClick={handleOpenQuiz}
                aria-haspopup="dialog"
                className={[
                  'order-2 flex h-[56px] w-full items-center justify-center gap-2 rounded-[10px] px-4 text-[#0B2F2A] touch-manipulation md:h-[60px] md:px-8',
                  'bg-gradient-to-r from-[#D4AF37] via-[#E8C964] to-[#D4AF37] shadow-[0_6px_22px_rgba(212,175,55,0.38),inset_0_1px_0_rgba(255,255,255,0.35)]',
                  'hover:scale-[1.025] active:scale-[0.95] transition-all duration-150',
                  'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-white',
                ].join(' ')}
              >
                <Calculator className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={2.25} aria-hidden="true" />
                <span className="text-[15px] font-bold">Calcular o meu preço</span>
              </button>

          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[5%] z-10 hidden md:block">
          <HomeHeroTrust />
        </div>

        <Suspense fallback={null}>
          <QuizForm isOpen={isQuizOpen} onClose={closeQuiz} />
        </Suspense>
      </section>
    </>
  );
};

export default Hero;
