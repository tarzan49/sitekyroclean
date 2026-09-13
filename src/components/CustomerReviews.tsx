import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, ExternalLink } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import type { PoolReview } from '@/data/reviewsPool';
import { REVIEW_RATING, REVIEW_COUNT } from '@/constants/business';
import { GOOGLE_REVIEWS_VIEW_URL } from '@/constants/google';
import { GoogleG } from '@/components/icons/GoogleG';
import CustomerReviewCard from './CustomerReviewCard';

export default function CustomerReviews({ reviews }: { reviews: PoolReview[] }) {
  const [ref, api] = useEmblaCarousel({loop:true,align:'start'});
  const root = useRef<HTMLDivElement>(null);
  const [selected,setSelected] = useState(0);
  const [height,setHeight] = useState<number>();
  const [paused,setPaused] = useState(false);
  const [visible,setVisible] = useState(false);
  const [hovered,setHovered] = useState(false);
  const [reduced,setReduced] = useState(false);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(media.matches); update();media.addEventListener('change',update);
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:0.25});
    if(root.current)observer.observe(root.current);
    return()=>{observer.disconnect();media.removeEventListener('change',update);};
  },[]);
  useEffect(()=>{
    if(!api)return;
    const select=()=>{setSelected(api.selectedScrollSnap());setHeight(api.slideNodes()[api.selectedScrollSnap()]?.offsetHeight);};
    const stop=()=>setPaused(true);
    api.on('select',select);api.on('reInit',select);api.on('pointerDown',stop);select();
    const observer=new ResizeObserver(select);api.slideNodes().forEach(node=>observer.observe(node));
    return()=>{observer.disconnect();api.off('select',select);api.off('reInit',select);api.off('pointerDown',stop);};
  },[api]);
  useEffect(()=>{
    if(!api||paused||!visible||hovered||reduced||reviews.length<2)return;
    const timer=setInterval(()=>{if(!document.hidden)api.scrollNext();},9000);
    return()=>clearInterval(timer);
  },[api,paused,visible,hovered,reduced,reviews.length]);
  if(!reviews.length)return null;
  return <div ref={root}>
    <a href={GOOGLE_REVIEWS_VIEW_URL} target="_blank" rel="noopener noreferrer" className="inline-flex flex-wrap items-center gap-x-3 gap-y-2 bg-white rounded-sm border border-[#173629]/15 px-4 py-3 mb-5 text-[#173629]">
      <GoogleG className="w-6 h-6" /><span className="text-lg font-bold">{REVIEW_RATING}<span className="text-sm font-normal text-[#617166]"> / 5</span></span><span className="text-sm">{REVIEW_COUNT}+ avaliações no Google</span><ExternalLink className="w-3.5 h-3.5" />
    </a>
    <div ref={ref} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setPaused(true)} style={{'--review-height':height ? `${height}px` : 'auto'} as CSSProperties} className="overflow-hidden h-[var(--review-height)] sm:h-auto transition-[height] duration-300 motion-reduce:transition-none" role="region" aria-label="Testemunhos dos clientes" aria-roledescription="carrossel">
      <div className="flex items-start sm:items-stretch -ml-4">{reviews.map((review,i)=><div key={`${review.name}-${i}`} role="group" aria-roledescription="testemunho" aria-label={`${i+1} de ${reviews.length}`} className="shrink-0 grow-0 basis-[92%] sm:basis-1/2 lg:basis-1/3 pl-4 min-w-0"><CustomerReviewCard review={review} /></div>)}</div>
    </div>
    {reviews.length>1&&<div className="flex items-center justify-between gap-4 mt-5 bg-[#173629] border border-white/15 rounded-sm p-2 text-white">
      <p className="text-sm pl-2 tabular-nums">{selected+1} / {reviews.length}<span className="ml-2 text-white/70">Histórias de clientes</span></p>
      <div className="flex gap-1">
        {!reduced&&<button type="button" aria-label={paused?'Retomar avaliações automáticas':'Pausar avaliações automáticas'} onClick={()=>setPaused(v=>!v)} className="w-11 h-11 flex items-center justify-center hover:bg-white/10">{paused?<Play className="w-4 h-4" />:<Pause className="w-4 h-4" />}</button>}
        <button type="button" aria-label="Avaliação anterior" onClick={()=>{setPaused(true);api?.scrollPrev();}} className="w-11 h-11 flex items-center justify-center border border-white/20 hover:bg-white/10"><ArrowLeft className="w-4 h-4" /></button>
        <button type="button" aria-label="Próxima avaliação" onClick={()=>{setPaused(true);api?.scrollNext();}} className="w-11 h-11 flex items-center justify-center bg-gold text-[#173629]"><ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>}
  </div>;
}
