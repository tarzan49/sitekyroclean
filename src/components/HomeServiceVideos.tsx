// Página inicial: os serviços em vídeos reais da equipa a passar na horizontal (dono, 24 Nov: os cartões
// antigos com imagens "estão demasiado AI, sem presença"). Cada cartão = vídeo real + nome + "desde" do
// motor de preços + link para a página do serviço. Um ecrã no telemóvel; a faixa avança sozinha e pára
// quando a pessoa lhe toca.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from './SectionHeader';
import { CHAIR_PRICE_SHORT, formatEuro, MATTRESS_CLEANING_FROM, SOFA_CLEANING_FROM, SOFA_WATERPROOF_ESSENCIAL_FROM } from '@/data/enginePrices';
import { RUG_PRICE_FROM, CARPET_PRICE_FROM } from '@/constants/rugSitePrice';
import sofaVideo from '@/assets/sofa-processo/extracao.mp4';
import mattressVideo from '@/assets/colchoes-processo/extracao.mp4';
import chairsVideo from '@/assets/cadeiras-processo/extracao.mp4';
import rugVideo from '@/assets/tapetes-processo/extracao.mp4';
import carpetVideo from '@/assets/alcatifa-processo/extracao.mp4';
import waterproofVideo from '@/assets/before-after-pool/imper-agua-01.mp4';

const fromLabel = (v: string) => (/^desde/i.test(v) ? v.replace(/^desde/i, 'Desde') : `Desde ${v}`);

const ITEMS = [
  { title: 'Limpeza de Sofás', price: fromLabel(formatEuro(SOFA_CLEANING_FROM)), video: sofaVideo, link: '/limpeza-sofas' },
  { title: 'Impermeabilização', price: fromLabel(formatEuro(SOFA_WATERPROOF_ESSENCIAL_FROM)), video: waterproofVideo, link: '/impermeabilizacao' },
  { title: 'Limpeza de Colchões', price: fromLabel(formatEuro(MATTRESS_CLEANING_FROM)), video: mattressVideo, link: '/limpeza-colchoes' },
  { title: 'Limpeza de Cadeiras', price: fromLabel(CHAIR_PRICE_SHORT.replace(/^a partir de\s*/i, '')), video: chairsVideo, link: '/limpeza-cadeiras' },
  { title: 'Limpeza de Tapetes', price: fromLabel(RUG_PRICE_FROM), video: rugVideo, link: '/limpeza-tapetes' },
  { title: 'Limpeza de Alcatifas', price: fromLabel(CARPET_PRICE_FROM), video: carpetVideo, link: '/limpeza-alcatifas' },
];

export default function HomeServiceVideos() {
  const strip = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Só carrega e reproduz os vídeos quando a secção está à vista.
  useEffect(() => {
    const el = strip.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el); return () => io.disconnect();
  }, []);

  // Avança um cartão a cada 4 s, em scroll suave; pára de vez quando a pessoa toca na faixa.
  useEffect(() => {
    const el = strip.current; if (!el || !inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stopped = false;
    const stop = () => { stopped = true; };
    el.addEventListener('pointerdown', stop, { passive: true });
    el.addEventListener('touchstart', stop, { passive: true });
    const t = window.setInterval(() => {
      if (stopped || el.scrollWidth <= el.clientWidth + 4) return;
      const card = el.firstElementChild as HTMLElement | null;
      const step = (card?.offsetWidth ?? el.clientWidth) + 12;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: 'smooth' });
    }, 4000);
    return () => { window.clearInterval(t); el.removeEventListener('pointerdown', stop); el.removeEventListener('touchstart', stop); };
  }, [inView]);

  return (
    <section id="servicos" className="scroll-mt-20 bg-[#FDFDF9] pt-10 pb-[100px] md:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeader heading="O nosso trabalho," goldWord="em vídeo real" />
        <div ref={strip} className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:grid lg:grid-cols-6 lg:overflow-visible">
          {ITEMS.map(item => (
            <Link key={item.link} to={item.link} className="group relative w-[62%] shrink-0 snap-start overflow-hidden rounded-2xl bg-black sm:w-[38%] lg:w-auto">
              <video src={inView ? item.video : undefined} autoPlay muted loop playsInline preload="none"
                className="h-[min(50svh,420px)] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] lg:h-[380px]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                {/* Título numa só linha e do mesmo tamanho em todos os cartões (dono, 24 Nov: "tudo na mesma linha, alinhado"). */}
                <h3 className="whitespace-nowrap font-playfair text-[15px] font-semibold leading-tight text-white sm:text-base lg:text-[15px] xl:text-base">{item.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[#D4AF37]">{item.price}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#888]">Vídeos reais de serviços da nossa equipa.</p>
      </div>
    </section>
  );
}
