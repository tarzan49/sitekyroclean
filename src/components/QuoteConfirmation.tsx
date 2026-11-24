import { ArrowUpRight, CalendarDays, Check, Clock, MapPin, MessageCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleG } from '@/components/icons/GoogleG';
import { REVIEW_COUNT, REVIEW_RATING } from '@/constants/business';
import { GOOGLE_REVIEWS_VIEW_URL } from '@/constants/google';
import { RESPONSE_PROMISE } from '@/constants/commercialPolicy';
import { QUOTE_CONFIRM_LABEL, QUOTE_EMPTY_H1, QUOTE_EMPTY_TEXT, QUOTE_SUMMARY_TITLE } from '@/data/supportPages';

export interface ConfirmationReceipt {
  lines: { label: string; qty: number; unitPrice: number | null; total: number | null }[];
  subtotal: number;
  discountLabel: string | null;
  discountAmount: number;
  total: number;
  sobOrcamento: boolean;
  location: string;
  slot: string;
  bookingId: string;
  name: string;
}
/**
 * Pedido em que o único valor conhecido é a deslocação ou a recolha (só
 * tapetes, alcatifa, sofá grande): o preço vem por fotografia no WhatsApp.
 * Mostrar "Subtotal conhecido 10€" parecia um preço estranho, e estes pedidos
 * fechavam metade das vezes (dono, 2026-10-06).
 */
export function needsPhotoQuote(receipt: Pick<ConfirmationReceipt, 'sobOrcamento' | 'lines'>): boolean {
  return receipt.sobOrcamento && !receipt.lines.some(l => (l.total ?? 0) > 0 && !/^(Deslocação|Recolha)/.test(l.label));
}

const money = (value: number | null) => value === null ? 'Sob orçamento' : new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);

export default function QuoteConfirmation({ receipt, waUrl }: { receipt: ConfirmationReceipt | null; waUrl: string }) {
  const summary = QUOTE_SUMMARY_TITLE.split(' ');
  const photoQuote = receipt ? needsPhotoQuote(receipt) : false;
  return (
    <div className="min-h-svh bg-kyro-green px-4 pb-4 text-white sm:px-6">
      <main className="mx-auto w-full max-w-md lg:max-w-6xl">
        <header className="flex h-14 items-center justify-between border-b border-[#D4AF37]/20 lg:h-20">
          <Link to="/" aria-label="Kyro Clean Solutions, página inicial" className="inline-flex min-h-11 items-center whitespace-nowrap font-playfair text-[15px] font-bold tracking-[-0.03em] min-[400px]:text-[17px] lg:text-[21px]"><span className="text-[#D4AF37]">KYRO</span>&nbsp;Clean Solutions</Link>
          <span className="flex items-center gap-1.5 text-xs text-[#D4AF37] lg:text-sm"><Check className="h-3.5 w-3.5" />{receipt ? 'Pedido recebido' : 'O seu orçamento'}</span>
        </header>

        <div className="lg:grid lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1fr_1.08fr] lg:content-center lg:items-start lg:gap-x-14 lg:gap-y-6 lg:py-10 xl:gap-x-20">
        <h1 className="font-playfair [text-wrap:balance] lg:col-start-1 lg:row-start-1 lg:py-0 lg:text-left lg:text-5xl py-4 text-center text-[28px] font-semibold leading-[1.15]">
          {receipt ? 'Obrigado pela confiança.' : QUOTE_EMPTY_H1[0]}
          <span className="mt-1 block">{photoQuote ? <>Falta só uma <em className="not-italic text-[#D4AF37]">fotografia.</em></> : <>Falamos no <em className="not-italic text-[#D4AF37]">WhatsApp?</em></>}</span>
        </h1>

        <section aria-labelledby="receipt-title" className="overflow-hidden rounded-2xl border border-[#D4AF37]/35 bg-[#f7f5ef] text-[#132c22] shadow-[0_16px_48px_#00000030] lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:self-center lg:rounded-3xl">
          <div className="h-0.5 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20" />
          <div className="px-4 pb-2 pt-3.5 lg:px-7 lg:pb-3 lg:pt-7">
            <h2 id="receipt-title" className="type-section-title font-playfair text-[#111111]">{summary.slice(0, -1).join(' ')} <em className="not-italic" style={{ color: '#D4AF37' }}>{summary.slice(-1)}</em></h2>
          </div>

          {receipt ? (
            <>
              {(receipt.bookingId || receipt.location || (receipt.slot && receipt.slot !== 'Não especificado')) && (
                <div className="mx-4 lg:mx-7 lg:pb-5 lg:text-sm flex flex-wrap gap-x-3 gap-y-1 border-b border-[#132c22]/10 pb-3 text-[13px] leading-relaxed text-[#526458]">
                  {receipt.bookingId && <span className="font-mono tracking-wide">#{receipt.bookingId}</span>}
                  {receipt.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" />{receipt.location}</span>}
                  {receipt.slot && receipt.slot !== 'Não especificado' && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3 shrink-0" /><span>{receipt.slot} · a confirmar</span></span>}
                </div>
              )}

              <ul className="divide-y divide-[#132c22]/10 px-4 lg:px-7">
                {receipt.lines.map((line, index) => (
                  <li key={index} className="flex items-center justify-between gap-3 py-2.5 lg:py-5">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span aria-label={`Quantidade: ${line.qty}`} className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded border border-[#132c22]/15 px-1 text-xs font-semibold text-[#526458] lg:h-6 lg:min-w-6 lg:text-xs">{line.qty}×</span>
                      <div className="min-w-0">
                        <p className="text-[15px] lg:text-base font-medium leading-snug">{line.label}</p>
                        {line.qty > 1 && line.unitPrice !== null && <p className="mt-0.5 text-xs text-[#627165]">{money(line.unitPrice)} / un.</p>}
                      </div>
                    </div>
                    <span className="shrink-0 text-[15px] lg:text-base font-semibold tabular-nums">{money(line.total)}</span>
                  </li>
                ))}
              </ul>

              {photoQuote ? (
                <div className="border-t border-[#132c22]/10 bg-[#eeeee5] px-4 py-3 lg:px-7 lg:py-6">
                  <p className="text-sm lg:text-base font-semibold">O preço é dado por fotografia</p>
                  <p className="mt-1 text-[13px] lg:text-sm leading-relaxed text-[#526458]">Envie no WhatsApp uma fotografia de cada peça e respondemos com o preço e a disponibilidade.</p>
                </div>
              ) : (
              <div className="border-t border-[#132c22]/10 bg-[#eeeee5] px-4 py-3 lg:px-7 lg:py-6">
                {receipt.discountLabel && receipt.discountAmount > 0 && <div className="mb-2 space-y-1 text-xs text-[#526458]"><p className="flex justify-between gap-3"><span>Subtotal</span><span>{money(receipt.subtotal)}</span></p><p className="flex justify-between gap-3"><span>{receipt.discountLabel}</span><span>−{money(receipt.discountAmount)}</span></p></div>}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">{receipt.sobOrcamento ? 'Subtotal conhecido' : 'Total estimado'}</span>
                  <strong className="text-[30px] lg:text-[40px] font-semibold leading-none tracking-[-0.045em] tabular-nums">{money(receipt.total)}</strong>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#627165]">{receipt.sobOrcamento ? 'Acrescem os serviços sob orçamento: envie fotografias no WhatsApp para fecharmos o valor.' : 'Valor e marcação sujeitos a confirmação.'}</p>
              </div>
              )}
            </>
          ) : <p className="px-4 pb-4 text-sm leading-relaxed lg:px-7 lg:pb-8 lg:pt-4 lg:text-base text-[#526458]">{QUOTE_EMPTY_TEXT}</p>}
        </section>

        <div className="mt-4 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:max-w-sm">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" data-tracking-source="quote_confirmation" className="flex min-h-14 items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-gradient-to-b from-[#39de78] to-[#25D366] px-3 text-[15px] lg:min-h-16 lg:text-base font-bold text-[#071a12] shadow-[0_6px_24px_#25d36620] transition-colors hover:from-[#59e890] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]">
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />{photoQuote ? 'Enviar fotografias no WhatsApp' : QUOTE_CONFIRM_LABEL}<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/75"><Clock className="h-3 w-3 text-[#D4AF37]" />{RESPONSE_PROMISE}</p>
        </div>

        <a href={GOOGLE_REVIEWS_VIEW_URL} target="_blank" rel="noopener noreferrer" aria-label={`${REVIEW_RATING} de 5 estrelas, mais de ${REVIEW_COUNT} avaliações no Google. Ler avaliações`} className="mx-auto mt-4 lg:col-start-1 lg:row-start-3 lg:mx-0 lg:mt-0 flex min-h-11 w-fit items-center justify-center gap-3 rounded-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]">
          <GoogleG className="h-6 w-6 shrink-0" />
          <strong className="text-[27px] font-semibold leading-none tracking-tight">{REVIEW_RATING}</strong>
          <span className="h-7 w-px bg-white/15" aria-hidden="true" />
          <span>
            <span className="flex gap-1" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />)}</span>
            <span className="mt-1 block text-xs text-white/75">{REVIEW_COUNT}+ avaliações Google</span>
          </span>
        </a>
        </div>
      </main>
    </div>
  );
}
