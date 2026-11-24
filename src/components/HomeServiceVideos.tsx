// Página inicial: os serviços em vídeos reais da equipa a passar na horizontal (dono, 24 Nov: os cartões
// antigos com imagens "estão demasiado AI, sem presença"). Cada cartão = vídeo real + nome + "desde" do
// motor de preços + link para a página do serviço. No telemóvel os 6 serviços veem-se inteiros num ecrã, em duas colunas, sem faixa a deslizar nem
// cartões cortados (dono, 24 Nov, captura do iPhone).
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

  return (
    <section id="servicos" className="scroll-mt-20 bg-[#FDFDF9] pt-10 pb-[100px] md:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeader heading="O nosso trabalho," goldWord="em vídeo real" />
        <div ref={strip} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {ITEMS.map(item => (
            <Link key={item.link} to={item.link} className="group relative overflow-hidden rounded-2xl bg-black">
              <video src={inView ? item.video : undefined} autoPlay muted loop playsInline preload="none"
                className="h-[112px] w-full sm:h-[260px] object-cover transition-transform duration-500 group-hover:scale-[1.03] lg:h-[380px]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                {/* Título numa só linha e do mesmo tamanho em todos os cartões (dono, 24 Nov: "tudo na mesma linha, alinhado"). */}
                <h3 className="whitespace-nowrap font-playfair text-[15px] font-semibold leading-tight text-white sm:text-base lg:text-[15px] xl:text-base">{item.title}</h3>
                <p className="mt-0.5 text-sm font-semibold text-[#D4AF37]">{item.price}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#888]">Vídeos reais de serviços da nossa equipa.</p>
      </div>
    </section>
  );
}
