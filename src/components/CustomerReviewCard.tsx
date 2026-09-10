import { Star, Quote } from 'lucide-react';
import type { PoolReview } from '@/data/reviewsPool';
import { GoogleG } from '@/components/icons/GoogleG';

export default function CustomerReviewCard({ review, google = true }: { review: PoolReview; google?: boolean }) {
  const end = review.text.search(/[.!?](?:\s|$)/);
  const split = end >= 35 && end < 150 && review.text.length - end > 15 && !/\b(?:Sr|Sra|Dr|Dra)\.$/.test(review.text.slice(0, end + 1)) ? end + 1 : -1;
  return <figure className="h-full flex flex-col rounded-sm bg-[#faf8f1] border border-[#d5c79d]/60 p-6 sm:p-8 text-[#143426] shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="flex gap-1" aria-label="5 de 5 estrelas">{Array.from({length:5},(_,i)=><Star key={i} aria-hidden="true" className="w-4 h-4 fill-[#aa862b] text-[#aa862b]" />)}</div>
      {google ? <GoogleG className="w-5 h-5" /> : <Quote aria-hidden="true" className="w-5 h-5 text-[#aa862b]" />}
    </div>
    <blockquote className="flex-1 mb-7">
      <span aria-hidden="true" className="block font-playfair text-5xl h-9 text-[#aa862b]">“</span>
      {split > 0 ? <><p className="font-playfair text-[24px] sm:text-[27px] leading-snug font-semibold">{review.text.slice(0,split)}</p><p className="mt-4 text-[15px] leading-7 text-[#465b4e]">{review.text.slice(split).trim()}</p></> : <p className={`font-playfair font-semibold leading-relaxed ${review.text.length > 230 ? 'text-xl' : 'text-[24px] sm:text-[27px]'}`}>{review.text}</p>}
    </blockquote>
    <figcaption className="flex gap-3 items-center border-t border-[#173629]/15 pt-4">
      <span aria-hidden="true" className="w-11 h-11 shrink-0 rounded-full bg-[#173629] text-[#e3cb85] flex items-center justify-center font-semibold">{review.name.charAt(0)}</span>
      <div><p className="text-sm font-semibold">{review.name}</p><p className="text-xs mt-1 text-[#617166]">{review.city ? `${review.city} · ` : ''}{google ? 'Avaliação no Google' : 'Testemunho de cliente'}</p></div>
    </figcaption>
  </figure>;
}
