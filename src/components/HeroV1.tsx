import { PriceCta, WhatsAppCta } from '@/components/Cta';
import { buildGeneralWaMessage } from "@/lib/whatsappMessages";
import { useEffect, useState, lazy, Suspense } from "react";

import { WHATSAPP_BASE } from "@/constants/business";
import HomeHeroTrust from "@/components/HomeHeroTrust";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";

const QuizForm = lazy(() => import('./QuizFormLazy'));

// Vídeo real da equipa no topo do telemóvel (dono, 25 Nov: processo em três passos num só ficheiro, pulverização,
// escovação e extração, com o ciclo sem salto); no computador os três passos lado
// a lado (dono, 25 Nov: "pq e q n ta o video aqui?"), cada um no seu vídeo vertical, sem ampliar. A capa é a primeira imagem do vídeo: carrega primeiro e o vídeo entra por cima sem salto.
const CLIP = '/videos/home/topo-sofa';
function HeroClip() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(min-width: 768px), (prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setOn(true), 600);
    return () => window.clearTimeout(t);
  }, []);
  return on ? <video src={`${CLIP}.mp4`} poster={`${CLIP}.webp`} autoPlay muted loop playsInline preload="auto" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" /> : null;
}

const STEPS = ['pulverizacao', 'escovacao', 'extracao'] as const;
function HeroSteps() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setOn(true), 600);
    return () => window.clearTimeout(t);
  }, []);
  return <div className="absolute inset-y-0 left-[52%] right-0 grid grid-cols-1 gap-1.5 lg:left-[45%] lg:grid-cols-3" aria-hidden="true">
    {STEPS.map(s => <div key={s} className={`relative overflow-hidden bg-[#0B2F2A] ${s === 'extracao' ? '' : 'hidden lg:block'}`}>
      <picture>
        <source media="(max-width: 767px)" srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
        <img src={`/videos/home/topo-${s}.webp`} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="sync" fetchPriority={s === 'extracao' ? 'high' : 'auto'} width={576} height={1024} />
      </picture>
      {on && <video src={`/videos/home/topo-${s}.mp4`} poster={`/videos/home/topo-${s}.webp`} autoPlay muted loop playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover" />}
    </div>)}
  </div>;
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
          <picture className="block h-full w-full">
            <source media="(min-width: 768px)" srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
            <img src={`${CLIP}.webp`} alt="" className="h-full w-full object-cover" loading="eager" fetchPriority="high" width={720} height={1280} />
          </picture>
          <HeroClip />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,28,23,.78) 0%, rgba(5,28,23,.55) 18%, transparent 30%, transparent 46%, rgba(5,28,23,.74) 59%, rgba(5,28,23,.92) 72%, rgba(5,28,23,.97) 100%)' }} />
        </div>
        {/* Computador: os três passos à direita, o texto e os botões sobre o verde à esquerda. */}
        <div className="absolute inset-0 hidden md:block" style={{ background: 'radial-gradient(90% 120% at 20% 40%, #14463b 0%, #0B2F2A 55%, #071f1a 100%)' }}>
          <HeroSteps />
        </div>

        {/* Content */}
        <div className="relative z-10 flex w-full flex-col px-5 md:mr-auto md:max-w-[52%] md:px-8 lg:max-w-[45%] lg:pl-16 lg:pr-8 xl:pl-20 2xl:pl-32">
          <div className="md:max-w-[640px]">

            {/* H1 */}
            <h1
              className="font-playfair text-[1.75rem] min-[375px]:text-[1.95rem] sm:text-[2.625rem] md:text-[34px] lg:text-[36px] xl:text-[46px] min-[1400px]:text-[54px] 2xl:text-[58px] font-semibold text-white leading-[1.1] tracking-[-0.025em] mb-4 md:mb-5"
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

          <div className="mx-auto flex w-full max-w-sm flex-col gap-2.5 md:mx-0 md:mt-3 md:max-w-[420px]">

              {/* WhatsApp primeiro, com a mensagem genérica; o questionário volta por baixo, bem visível (dono, 25 Nov:
                  "voltar a meter o CTA no Hero [...] torna o botao acessivel e obvio"). */}
              <div className="group relative order-1">
                <WhatsAppCta href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage())}`} source="hero" />
              </div>
              <PriceCta onClick={handleOpenQuiz} aria-haspopup="dialog" className="order-2" />

          </div>
          <div className="mt-9 hidden max-w-[420px] md:block"><HomeHeroTrust /></div>
        </div>


        <Suspense fallback={null}>
          <QuizForm isOpen={isQuizOpen} onClose={closeQuiz} />
        </Suspense>
      </section>
    </>
  );
};

export default Hero;
