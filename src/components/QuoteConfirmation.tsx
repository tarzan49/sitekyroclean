import { ArrowUpRight, CalendarDays, Check, Clock, MapPin, MessageCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleG } from '@/components/icons/GoogleG';
import { REVIEW_COUNT, REVIEW_RATING } from '@/constants/business';
import { GOOGLE_REVIEWS_VIEW_URL } from '@/constants/google';
import { RESPONSE_PROMISE } from '@/constants/commercialPolicy';

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
const money = (value: number | null) => value === null ? 'Sob orçamento' : new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);

export default function QuoteConfirmation({ receipt, waUrl }: { receipt: ConfirmationReceipt | null; waUrl: string }) {
  return (
    <div className="min-h-svh bg-[#071a12] px-4 pb-4 text-white sm:px-6">
      <main className="mx-auto w-full max-w-md lg:max-w-6xl">
        <header className="flex h-14 items-center justify-between border-b border-[#D4AF37]/20 lg:h-20">
          <Link to="/" aria-label="Kyro Clean Solutions, página inicial" className="inline-flex min-h-11 items-center gap-2">
            <span className="text-lg font-semibold tracking-[0.17em]">KYRO<span className="text-[#D4AF37]">.</span></span>
            <span className="border-l border-white/20 pl-2 text-[8px] leading-relaxed tracking-[0.16em] text-white/65">CLEAN<br />SOLUTIONS</span>
          </Link>
          <span className="flex items-center gap-1.5 text-[11px] text-[#D4AF37]"><Check className="h-3.5 w-3.5" />{receipt ? 'Pedido recebido' : 'O seu orçamento'}</span>
        </header>

        <div className="lg:grid lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1fr_1.08fr] lg:content-center lg:items-start lg:gap-x-14 lg:gap-y-6 lg:py-10 xl:gap-x-20">
        <h1 className="lg:col-start-1 lg:row-start-1 lg:py-0 lg:text-left lg:text-[44px] xl:text-[50px] py-4 text-center text-[28px] font-semibold leading-[1.12] tracking-[-0.04em]">
          {receipt ? 'Obrigado pela confiança.' : 'O próximo passo é simples.'}
          <span className="mt-1 block text-[#D4AF37]">Falamos no WhatsApp?</span>
        </h1>

        <section aria-labelledby="receipt-title" className="overflow-hidden rounded-2xl border border-[#D4AF37]/35 bg-[#f7f5ef] text-[#132c22] shadow-[0_16px_48px_#00000030] lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:self-center lg:rounded-3xl">
          <div className="h-0.5 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20" />
          <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 lg:px-7 lg:pb-5 lg:pt-7">
            <h2 id="receipt-title" className="text-[11px] lg:text-sm font-bold uppercase tracking-[0.2em]">Resumo do pedido</h2>
            {receipt?.bookingId && <span className="font-mono text-[10px] lg:text-xs tracking-wide text-[#627165]">#{receipt.bookingId}</span>}
          </div>

          {receipt ? (
            <>
              {(receipt.location || (receipt.slot && receipt.slot !== 'Não especificado')) && (
                <div className="mx-4 lg:mx-7 lg:pb-5 lg:text-sm flex flex-wrap gap-x-3 gap-y-1 border-b border-[#132c22]/10 pb-3 text-[11px] leading-relaxed text-[#526458]">
                  {receipt.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" />{receipt.location}</span>}
                  {receipt.slot && receipt.slot !== 'Não especificado' && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3 shrink-0" /><span>{receipt.slot} · a confirmar</span></span>}
                </div>
              )}

              <ul className="divide-y divide-[#132c22]/10 px-4 lg:px-7">
                {receipt.lines.map((line, index) => (
                  <li key={index} className="flex items-center justify-between gap-3 py-3 lg:py-5">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span aria-label={`Quantidade: ${line.qty}`} className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded border border-[#132c22]/15 px-1 text-[10px] font-semibold text-[#526458] lg:h-6 lg:min-w-6 lg:text-xs">{line.qty}×</span>
                      <div className="min-w-0">
                        <p className="text-[13px] lg:text-base font-medium leading-snug">{line.label}</p>
                        {line.qty > 1 && line.unitPrice !== null && <p className="mt-0.5 text-[10px] text-[#627165]">{money(line.unitPrice)} / un.</p>}
                      </div>
                    </div>
                    <span className="shrink-0 text-[13px] lg:text-base font-semibold tabular-nums">{money(line.total)}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-[#132c22]/10 bg-[#eeeee5] px-4 py-3 lg:px-7 lg:py-6">
                {receipt.discountLabel && receipt.discountAmount > 0 && <div className="mb-2 space-y-1 text-xs text-[#526458]"><p className="flex justify-between gap-3"><span>Subtotal</span><span>{money(receipt.subtotal)}</span></p><p className="flex justify-between gap-3"><span>{receipt.discountLabel}</span><span>−{money(receipt.discountAmount)}</span></p></div>}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs lg:text-sm font-medium">{receipt.sobOrcamento ? 'Subtotal conhecido' : 'Total estimado'}</span>
                  <strong className="text-[30px] lg:text-[40px] font-semibold leading-none tracking-[-0.045em] tabular-nums">{money(receipt.total)}</strong>
                </div>
                <p className="mt-2 text-[10px] lg:text-xs leading-relaxed text-[#627165]">{receipt.sobOrcamento ? 'Acrescem os serviços sob orçamento. Valor final a confirmar.' : 'Valor e marcação sujeitos a confirmação.'}</p>
              </div>
            </>
          ) : <p className="px-4 pb-4 text-sm leading-relaxed lg:px-7 lg:pb-8 lg:pt-4 lg:text-base text-[#526458]">Os detalhes do pedido não estão disponíveis nesta sessão. Fale connosco para o localizar.</p>}
        </section>

        <div className="mt-4 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:max-w-sm">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" data-tracking-source="quote_confirmation" className="flex min-h-14 items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-gradient-to-b from-[#39de78] to-[#25D366] px-3 text-[15px] lg:min-h-16 lg:text-base font-bold text-[#071a12] shadow-[0_6px_24px_#25d36620] transition-colors hover:from-[#59e890] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]">
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />Confirmar pelo WhatsApp<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] lg:text-xs text-white/65"><Clock className="h-3 w-3 text-[#D4AF37]" />{RESPONSE_PROMISE}</p>
        </div>

        <a href={GOOGLE_REVIEWS_VIEW_URL} target="_blank" rel="noopener noreferrer" aria-label={`${REVIEW_RATING} de 5 estrelas, mais de ${REVIEW_COUNT} avaliações no Google. Ler avaliações`} className="mx-auto mt-4 lg:col-start-1 lg:row-start-3 lg:mx-0 lg:mt-0 flex min-h-11 w-fit items-center justify-center gap-3 rounded-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]">
          <GoogleG className="h-6 w-6 shrink-0" />
          <strong className="text-[27px] font-semibold leading-none tracking-tight">{REVIEW_RATING}</strong>
          <span className="h-7 w-px bg-white/15" aria-hidden="true" />
          <span>
            <span className="flex gap-1" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />)}</span>
            <span className="mt-1 block text-[10px] lg:text-xs text-white/70">{REVIEW_COUNT}+ avaliações Google</span>
          </span>
        </a>
        </div>
      </main>
    </div>
  );
}
