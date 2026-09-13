import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Star, Quote, X } from 'lucide-react';
import type { PoolReview } from '@/data/reviewsPool';
import { GoogleG } from '@/components/icons/GoogleG';

export default function CustomerReviewCard({ review, google = true }: { review: PoolReview; google?: boolean }) {
  const excerpt = useRef<HTMLParagraphElement>(null);
  const [truncated, setTruncated] = useState(false);
  useEffect(() => {
    const node = excerpt.current;
    if (!node) return;
    const measure = () => setTruncated(node.scrollHeight > node.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [review.text]);
  const end = review.text.search(/[.!?](?:\s|$)/);
  const split = end >= 35 && end < 150 && review.text.length - end > 15 && !/\b(?:Sr|Sra|Dr|Dra)\.$/.test(review.text.slice(0, end + 1)) ? end + 1 : -1;
  return <figure className="h-[340px] sm:h-full flex flex-col rounded-sm bg-[#faf8f1] border border-[#d5c79d]/60 p-5 sm:p-8 text-[#143426] shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
    <div className="flex items-center justify-between gap-3 mb-3 sm:mb-5">
      <div className="flex gap-1" aria-label="5 de 5 estrelas">{Array.from({length:5},(_,i)=><Star key={i} aria-hidden="true" className="w-4 h-4 fill-[#aa862b] text-[#aa862b]" />)}</div>
      {google ? <GoogleG className="w-5 h-5" /> : <Quote aria-hidden="true" className="w-5 h-5 text-[#aa862b]" />}
    </div>
    <div className="flex-1 min-h-0 sm:hidden">
      <blockquote><p ref={excerpt} className="line-clamp-6 text-[18px] leading-[26px] font-medium">{review.text}</p></blockquote>
      {truncated && <Dialog.Root>
        <Dialog.Trigger asChild><button type="button" className="min-h-11 text-sm font-semibold underline underline-offset-4">Ler avaliação completa</button></Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#faf8f1] p-6 text-[#143426] shadow-xl">
            <Dialog.Title className="pr-10 text-lg font-semibold">Avaliação de {review.name}</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-[#617166]">{google ? 'Avaliação no Google' : 'Testemunho de cliente'}</Dialog.Description>
            <blockquote className="mt-5 max-h-[60dvh] overflow-y-auto text-lg leading-relaxed">{review.text}</blockquote>
            <Dialog.Close asChild><button type="button" aria-label="Fechar avaliação" className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center"><X className="h-5 w-5" /></button></Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>}
    </div>
    <blockquote className="hidden sm:block flex-1 mb-7">
      <span aria-hidden="true" className="block font-playfair text-5xl h-9 text-[#aa862b]">“</span>
      {split > 0 ? <><p className="font-playfair text-[24px] sm:text-[27px] leading-snug font-semibold">{review.text.slice(0,split)}</p><p className="mt-4 text-[15px] leading-7 text-[#465b4e]">{review.text.slice(split).trim()}</p></> : <p className={`font-playfair font-semibold leading-relaxed ${review.text.length > 230 ? 'text-xl' : 'text-[24px] sm:text-[27px]'}`}>{review.text}</p>}
    </blockquote>
    <figcaption className="flex shrink-0 gap-3 items-center border-t border-[#173629]/15 pt-4">
      <span aria-hidden="true" className="w-11 h-11 shrink-0 rounded-full bg-[#173629] text-[#e3cb85] flex items-center justify-center font-semibold">{review.name.charAt(0)}</span>
      <div className="min-w-0"><p className="text-sm font-semibold">{review.name}</p><p className="text-xs mt-1 text-[#617166]">{review.city ? `${review.city} · ` : ''}{google ? 'Avaliação no Google' : 'Testemunho de cliente'}</p></div>
    </figcaption>
  </figure>;
}
