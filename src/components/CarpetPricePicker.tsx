// Alcatifas: sem preço no site (dono: alcatifas continuam sob orçamento). Uma pergunta (as medidas), o botão de
// WhatsApp com as medidas e o "+ Juntar mais artigos" a abrir o cesto da visita. Mesmo desenho dos outros widgets.
import { lazy, Suspense, useState } from 'react';
import { Minus, Plus, MessageCircle } from 'lucide-react';
import { WHATSAPP_BASE } from '@/constants/business';
import type { BasketItem } from '@/components/quiz/VisitBasket';

const VisitBasketLazy = lazy(() => import('@/components/quiz/VisitBasket'));
const m = (n: number) => String(n).replace('.', ',');

export default function CarpetPricePicker({ city, source }: { city: string; source: string }) {
  const [w, setW] = useState(4);
  const [l, setL] = useState(5);
  const [basket, setBasket] = useState(false);
  const area = Math.round(w * l * 10) / 10;
  const msg = `Olá! Gostaria de saber o preço e a disponibilidade da limpeza de uma alcatifa de mais ou menos ${m(w)} x ${m(l)} m (${m(area)} m²), em ${city}. Envio fotografias.`;
  const item: BasketItem = { id: `c${Date.now()}`, kind: 'carpet', qty: 1, pack: 'none', width: String(w), length: String(l) } as BasketItem;
  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-2 md:gap-10">
      <div>
        <p className="mb-2 text-base font-semibold text-[#1A1A1A]">Medidas aproximadas da alcatifa</p>
        {([['Largura', w, setW], ['Comprimento', l, setL]] as const).map(([label, v, set]) => (
          <div key={label} className="mb-2 flex items-center justify-between rounded-2xl border-2 border-[#E5E0D3] bg-white p-1.5">
            <span className="pl-2 text-sm font-semibold text-[#555]">{label}</span>
            <div className="flex items-center gap-2">
              <button type="button" aria-label={`Menos ${label.toLowerCase()}`} onClick={() => set(x => Math.max(1, Math.round((x - 0.5) * 10) / 10))} className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0E7]"><Minus className="h-4 w-4" /></button>
              <span className="w-16 text-center text-lg font-semibold text-[#1A1A1A]">{m(v)} m</span>
              <button type="button" aria-label={`Mais ${label.toLowerCase()}`} onClick={() => set(x => Math.min(50, Math.round((x + 0.5) * 10) / 10))} className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0E7]"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setBasket(true)} className="mt-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 px-3 text-sm font-bold text-[#1A1A1A] hover:bg-[#D4AF37]/20"><Plus className="h-4 w-4 text-[#D4AF37]" strokeWidth={3} />Juntar mais artigos à mesma visita</button>
      </div>
      <div>
        <div className="rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-br from-[#FFFBEF] to-[#F7EFD6] px-4 py-3">
          <p className="text-lg font-bold text-[#1A1A1A]">Limpeza no local, {m(area)} m²</p>
          <p className="text-[13px] leading-snug text-[#555]">O preço depende da fibra e do estado da alcatifa: envie as medidas e uma fotografia e dizemos-lhe o valor em menos de 1 minuto.</p>
        </div>
        <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" data-tracking-source={source}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#25D366] px-3 text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(37,211,102,0.7)] sm:text-base">
          <MessageCircle className="h-5 w-5" /> Pedir o preço no WhatsApp
        </a>
      </div>
      {basket && <Suspense fallback={null}><VisitBasketLazy isOpen onClose={() => setBasket(false)} initialCity={city} initialItems={[item]} /></Suspense>}
    </div>
  );
}
