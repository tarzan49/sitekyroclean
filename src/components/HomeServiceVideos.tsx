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
import sofaPoster from '@/assets/sofa-processo/extracao-poster.jpg';
import mattressVideo from '@/assets/colchoes-processo/extracao.mp4';
import mattressPoster from '@/assets/colchoes-processo/extracao-poster.jpg';
import chairsVideo from '@/assets/cadeiras-processo/extracao.mp4';
import chairsPoster from '@/assets/cadeiras-processo/extracao-poster.jpg';
import rugVideo from '@/assets/tapetes-processo/extracao.mp4';
import rugPoster from '@/assets/tapetes-processo/extracao-poster.jpg';
import carpetVideo from '@/assets/alcatifa-processo/extracao.mp4';
import carpetPoster from '@/assets/alcatifa-processo/extracao-poster.jpg';
import waterproofVideo from '@/assets/before-after-pool/imper-agua-01.mp4';
import waterproofPoster from '@/assets/before-after-pool/imper-agua-01-poster.webp';

const fromLabel = (v: string) => (/^desde/i.test(v) ? v.replace(/^desde/i, 'Desde') : `Desde ${v}`);

const ITEMS = [
  { title: 'Limpeza de Sofás', price: fromLabel(formatEuro(SOFA_CLEANING_FROM)), video: sofaVideo, poster: sofaPoster, link: '/limpeza-sofas' },
  { title: 'Impermeabilização', price: fromLabel(formatEuro(SOFA_WATERPROOF_ESSENCIAL_FROM)), video: waterproofVideo, poster: waterproofPoster, link: '/impermeabilizacao' },
  { title: 'Limpeza de Colchões', price: fromLabel(formatEuro(MATTRESS_CLEANING_FROM)), video: mattressVideo, poster: mattressPoster, link: '/limpeza-colchoes' },
  { title: 'Limpeza de Cadeiras', price: fromLabel(CHAIR_PRICE_SHORT.replace(/^a partir de\s*/i, '')), video: chairsVideo, poster: chairsPoster, link: '/limpeza-cadeiras' },
  { title: 'Limpeza de Tapetes', price: fromLabel(RUG_PRICE_FROM), video: rugVideo, poster: rugPoster, link: '/limpeza-tapetes' },
  { title: 'Limpeza de Alcatifas', price: fromLabel(CARPET_PRICE_FROM), video: carpetVideo, poster: carpetPoster, link: '/limpeza-alcatifas' },
];

export default function HomeServiceVideos() {
  const strip = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  // Nunca um quadrado preto (dono, 25 Nov, vídeo): a fotografia de cada vídeo está sempre por baixo, o vídeo carrega
  // uma vez, logo a seguir ao topo da página, e nunca mais se descarrega; fora do ecrã só fica em pausa.
  useEffect(() => {
    const start = () => setLoad(true);
    const t = window.setTimeout(start, 2500);
    const el = strip.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) start();
      el.querySelectorAll('video').forEach(v => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); });
    });
    io.observe(el); return () => { io.disconnect(); window.clearTimeout(t); };
  }, []);
  useEffect(() => {
    const el = strip.current; if (!load || !el) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) el.querySelectorAll('video').forEach(v => { v.play().catch(() => {}); });
  }, [load]);

  return (
    <section id="servicos" className="scroll-mt-20 bg-[#FDFDF9] pt-10 pb-[100px] md:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeader heading="O nosso trabalho," goldWord="em vídeo real" />
        <div ref={strip} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {ITEMS.map(item => (
            <Link key={item.link} to={item.link} className="group relative overflow-hidden rounded-2xl bg-[#e9e6dc]">
              <img src={item.poster} alt="" aria-hidden="true" decoding="async" data-no-fill className="absolute inset-0 h-full w-full object-cover" />
              <video src={load ? item.video : undefined} poster={item.poster} muted loop playsInline preload="auto"
                className="relative h-[112px] w-full sm:h-[260px] object-cover transition-transform duration-500 group-hover:scale-[1.03] lg:h-[380px]" />
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
