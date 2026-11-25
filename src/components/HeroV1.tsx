import { PriceCta, WhatsAppCta } from '@/components/Cta';
import { buildGeneralWaMessage } from "@/lib/whatsappMessages";
import { useEffect, useState, lazy, Suspense } from "react";

import { WHATSAPP_BASE } from "@/constants/business";
import HomeHeroTrust from "@/components/HomeHeroTrust";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";

const QuizForm = lazy(() => import('./QuizFormLazy'));

// Topo com vídeo real da equipa (dono, 25 Nov: saiu a imagem de IA do técnico). A capa carrega primeiro (é o que conta
// para a rapidez) e o vídeo entra por cima; com "Reduzir movimento" fica só a capa.
const CLIP = { m: '/videos/home/topo-m', d: '/videos/home/topo-d' } as const;
function HeroClip({ kind, className }: { kind: 'm' | 'd'; className: string }) {
  return <>
    <picture className="block h-full w-full">
      <source media={kind === 'm' ? '(min-width: 768px)' : '(max-width: 767px)'} srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
      <img src={`${CLIP[kind]}.webp`} alt="" className={className} loading="eager" decoding="sync" fetchPriority="high" width={kind === 'm' ? 720 : 1280} height={kind === 'm' ? 1280 : 720} />
    </picture>
    <HeroVideo kind={kind} className={`absolute inset-0 motion-reduce:hidden ${className}`} />
  </>;
}
function HeroVideo({ kind, className }: { kind: 'm' | 'd'; className: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (window.matchMedia(kind === 'm' ? '(min-width: 768px)' : '(max-width: 767px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setOn(true), 900);
    return () => window.clearTimeout(t);
  }, [kind]);
  return on ? <video src={`${CLIP[kind]}.mp4`} autoPlay muted loop playsInline preload="auto" aria-hidden="true" className={className} /> : null;
}

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
        className="relative bg-[#0B2F2A] min-h-[var(--app-h,100svh)] flex items-stretch md:items-center z-[1] pt-[76px] md:pt-[100px] pb-7 md:pb-[100px] overflow-hidden"
        aria-label="Kyro Clean Solutions - Higienização de Estofos ao Domicílio"
      >
        {/* One continuous outpainted scene behind all three mobile content rows. */}
        <div className="absolute inset-x-0 bottom-0 top-14 md:hidden" aria-hidden="true">
          <HeroClip kind="m" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,28,23,.78) 0%, rgba(5,28,23,.55) 18%, transparent 30%, transparent 46%, rgba(5,28,23,.74) 59%, rgba(5,28,23,.92) 72%, rgba(5,28,23,.97) 100%)' }} />
        </div>
        {/* Background */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <HeroClip kind="d" className="absolute inset-0 h-full w-full object-cover" />
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
                <WhatsAppCta href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage())}`} source="hero" />
              </div>
              <PriceCta onClick={handleOpenQuiz} aria-haspopup="dialog" className="order-2" />

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
