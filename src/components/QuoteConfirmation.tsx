import { ArrowLeft, ArrowUpRight, CalendarDays, Camera, Check, Clock, MapPin, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { REVIEW_COUNT, REVIEW_RATING } from '@/constants/business';
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
  const whatsapp = (compact = false) => <a href={waUrl} target="_blank" rel="noopener noreferrer" data-tracking-source="quote_confirmation" className={`flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#25D366] px-4 py-4 text-base font-bold text-[#071a12] transition-colors hover:bg-[#49e382] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37] ${compact ? '' : 'shadow-[0_8px_30px_#25d36620]'}`}>
    <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" /> Continuar no WhatsApp <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
  </a>;
  return <div className="min-h-screen bg-[#071a12] text-white">
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link to="/" aria-label="Kyro Clean Solutions, página inicial" className="flex min-h-11 flex-col justify-center"><span className="text-xl font-semibold tracking-[0.18em]">KYRO<span className="text-[#D4AF37]">.</span></span><span className="text-[10px] tracking-[0.19em] text-white/65">CLEAN SOLUTIONS</span></Link>
        <span className="flex items-center gap-2 text-xs text-white/70"><ShieldCheck className="h-4 w-4 text-[#D4AF37]" /> Ao seu lado, em cada detalhe</span>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-8 sm:pt-14">
      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <section aria-labelledby="confirmation-title">
          <div className="mb-5 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#D4AF37]"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#D4AF37]/40"><Check className="h-4 w-4" /></span>{receipt ? 'Pedido recebido' : 'Vamos tratar dos detalhes'}</div>
          <h1 id="confirmation-title" className="max-w-lg text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl">{receipt ? 'Obrigado pela confiança.' : 'O próximo passo é simples.'}<span className="mt-2 block text-[#D4AF37]">Falamos no WhatsApp?</span></h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">{receipt ? 'O seu pedido já chegou à nossa equipa. ' : ''}Continue a conversa connosco para confirmar o orçamento, esclarecer dúvidas e combinar a melhor data para a visita.</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#102b21] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-white/85"><Clock className="h-4 w-4 text-[#D4AF37]" />{RESPONSE_PROMISE}</div>
            {whatsapp()}
            <p className="mt-3 text-center text-xs leading-relaxed text-white/65">A mensagem abre preparada. Basta tocar em enviar.{receipt?.bookingId ? ' A referência do pedido segue incluída.' : ''}</p>
          </div>
          <div className="mt-7 flex items-center gap-3 border-b border-white/10 pb-7">
            <div className="flex gap-0.5" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />)}</div>
            <p className="text-xs text-white/70"><strong className="text-white">{REVIEW_RATING}/5</strong> · {REVIEW_COUNT}+ avaliações Google</p>
          </div>
          <h2 className="mb-5 mt-7 text-lg font-semibold">Daqui até à sua visita</h2>
          <ol className="space-y-5">
            {[
              { icon: Camera, title: 'Mostre-nos o que precisa de cuidar', text: 'Envie uma fotografia geral e outra dos detalhes ou manchas. Ajuda-nos a avaliar o revestimento e o tratamento adequado.' },
              { icon: MessageCircle, title: 'Confirmamos todos os valores', text: 'Revemos os artigos, os extras e a deslocação consigo. Conhece o orçamento antes de combinar o serviço.' },
              { icon: CalendarDays, title: 'Combinamos a melhor data', text: 'A equipa confirma a disponibilidade e o horário consigo. O pedido, por si só, ainda não é uma marcação.' },
            ].map(({ icon: Icon, title, text }, index) => <li key={title} className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/20 text-[#D4AF37]"><Icon className="h-4 w-4" /></div><div><h3 className="text-sm font-semibold"><span className="mr-2 text-[#D4AF37]">0{index + 1}</span>{title}</h3><p className="mt-1 text-sm leading-relaxed text-white/65">{text}</p></div></li>)}
          </ol>
        </section>
        <section aria-labelledby="receipt-title" className="overflow-hidden rounded-2xl bg-[#f7f5ef] text-[#132c22] shadow-xl">
          <div className="border-b border-[#132c22]/10 p-5 sm:p-7"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#476354]">O seu cuidado começa aqui</span>{receipt?.bookingId && <span className="rounded-md border border-[#132c22]/15 px-2 py-1 font-mono text-xs">#{receipt.bookingId}</span>}</div><h2 id="receipt-title" className="text-2xl font-semibold tracking-tight">{receipt ? 'O seu pedido, em detalhe' : 'Cada detalhe conta.'}</h2><p className="mt-2 text-sm leading-relaxed text-[#476354]">{receipt ? 'Serviços e preferências que enviou à nossa equipa.' : 'No WhatsApp, ajudamos a definir o serviço certo para os seus artigos e a preparar o orçamento.'}</p></div>
          {receipt ? <>
            {(receipt.location || (receipt.slot && receipt.slot !== 'Não especificado')) && <dl className="space-y-3 border-b border-[#132c22]/10 p-5 sm:px-7">
              {receipt.location && <div className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><div><dt className="text-xs text-[#476354]">Localidade</dt><dd className="text-sm font-semibold">{receipt.location}</dd></div></div>}
              {receipt.slot && receipt.slot !== 'Não especificado' && <div className="flex gap-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0" /><div><dt className="text-xs text-[#476354]">Preferência de horário, a confirmar</dt><dd className="text-sm font-semibold">{receipt.slot}</dd></div></div>}
            </dl>}
            <ul className="divide-y divide-[#132c22]/10 px-5 sm:px-7">{receipt.lines.map((line, i) => <li key={i} className="flex items-start justify-between gap-4 py-4"><div className="min-w-0"><p className="text-sm font-semibold leading-relaxed">{line.label}</p><p className="mt-1 text-xs text-[#476354]">Quantidade: {line.qty}{line.qty > 1 && line.unitPrice !== null ? ` · ${money(line.unitPrice)} / un.` : ''}</p></div><span className="shrink-0 pt-0.5 text-sm font-semibold tabular-nums">{money(line.total)}</span></li>)}</ul>
            <div className="m-3 rounded-xl bg-[#e9ede5] p-5 sm:m-5">
              {receipt.discountLabel && receipt.discountAmount > 0 && <div className="mb-4 space-y-2 text-sm"><p className="flex justify-between gap-3"><span>Subtotal</span><span>{money(receipt.subtotal)}</span></p><p className="flex justify-between gap-3"><span>{receipt.discountLabel}</span><span>−{money(receipt.discountAmount)}</span></p></div>}
              <div className="flex flex-wrap items-end justify-between gap-3"><span className="text-sm font-semibold">{receipt.sobOrcamento ? 'Subtotal conhecido' : 'Total estimado'}</span><strong className="text-3xl tracking-tight tabular-nums">{money(receipt.total)}</strong></div>
              <p className="mt-3 text-xs leading-relaxed text-[#476354]">{receipt.sobOrcamento ? 'Acrescem os serviços sob orçamento. O valor final será confirmado após avaliação.' : 'Confirmamos o valor final consigo antes da marcação.'}</p>
            </div>
          </> : <div className="space-y-4 p-5 text-sm leading-relaxed sm:p-7"><p>Tenha à mão a <strong>localidade, o tipo e a quantidade de artigos</strong>. Se possível, envie também fotografias.</p><p className="text-[#476354]">Os detalhes do pedido não estão disponíveis nesta sessão. Se já o enviou, indique à equipa o nome usado no formulário para o localizar.</p></div>}
          <div className="border-t border-[#132c22]/10 p-5 sm:p-7"><p className="mb-3 text-sm font-semibold">Vamos combinar os detalhes?</p>{whatsapp(true)}<p className="mt-3 text-center text-xs text-[#476354]">Conversa direta com a equipa Kyro.</p></div>
        </section>
      </div>
      <footer className="mt-10 border-t border-white/10 pt-5"><Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/65 hover:text-white"><ArrowLeft className="h-4 w-4" />Voltar à página inicial</Link></footer>
    </main>
  </div>;
}
