import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ArrowLeft, Check, MessageCircle } from 'lucide-react';
import { mattressPrices } from '@/components/quiz/QuizTypes';
import mattressImage from '@/assets/galeria-colchao-depois.webp';

const money = (value: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
export function previewPackPrice(base: number, extra: number, travel: number) {
  const saving = Math.round((base + extra) * 10) / 100;
  const total = Math.round((base + extra - saving + travel) * 100) / 100;
  return { saving, total, additional: Math.round((total - base - travel) * 100) / 100 };
}

// Interactive local demonstration only. No production pricing or submission.
export default function SofaPackPreview({ base, travel, city, items, onClose }: {
  base: number; travel: number; city: string; items: string[]; onClose: () => void;
}) {
  const [size, setSize] = useState('casal');
  const [step, setStep] = useState<'offer' | 'summary' | 'message'>('offer');
  const [added, setAdded] = useState(false);
  const mattress = mattressPrices.find(item => item.id === size)!;
  const extra = Number(mattress.cleaningPrice);
  const pack = previewPackPrice(base, extra, travel);
  const finalTotal = added ? pack.total : base + travel;
  const message = `Olá! Gostaria de confirmar este orçamento em ${city}:\n\n${items.join(' + ')}: ${money(base)}\n${added ? `Colchão ${mattress.label.toLowerCase()}: ${money(extra)}\nDesconto de 10% nos serviços: −${money(pack.saving)}\n` : ''}Deslocação: ${money(travel)}\nTotal: ${money(finalTotal)}\n\nPosso enviar fotografias e a localização. Qual é a disponibilidade?`;
  const primary = 'w-full min-h-12 rounded-sm bg-gradient-to-r from-[#D4AF37] to-[#edda8c] px-3 py-3 text-[#102117] font-bold text-sm';
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/65 z-[150]" />
    <Dialog.Content className="fixed z-[151] inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-md sm:max-h-[90vh] overflow-y-auto bg-[#071a12] text-white sm:rounded-xl shadow-2xl focus:outline-none">
      <div className="sticky top-0 z-10 bg-[#071a12] border-b border-white/10 px-5 py-3 flex items-center justify-between">
        <span className="text-[10px] tracking-[0.18em] text-[#D4AF37] uppercase">Kyro Clean · Teste de pack</span>
        <Dialog.Close aria-label="Fechar teste" className="w-10 h-10 flex items-center justify-center"><X className="w-5 h-5" /></Dialog.Close>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs text-white/60 mb-2">{city} · {items.join(' + ')} · {money(base + travel)}</p>
          <Dialog.Title className="font-playfair text-[27px] leading-tight">{step === 'offer' ? 'Já que vamos limpar o sofá…' : step === 'summary' ? 'O seu pedido, sem surpresas' : 'A mensagem está pronta'}</Dialog.Title>
          <Dialog.Description className="text-sm leading-relaxed text-white/65 mt-2">{step === 'offer' ? 'Aproveite a mesma visita para limpar também o colchão.' : step === 'summary' ? 'Confira os artigos e o total, com uma única deslocação.' : 'Neste teste, mostramos a mensagem sem abrir nem enviar nada para o WhatsApp.'}</Dialog.Description>
        </div>
        {step === 'offer' ? <>
          <div className="rounded-lg overflow-hidden border border-[#D4AF37]/35 bg-white/[0.04]">
            <img src={mattressImage} alt="Colchão após limpeza Kyro Clean" className="w-full h-24 object-cover" />
            <div className="p-4 space-y-3">
              <label className="block text-xs text-white/75" htmlFor="preview-mattress">Tamanho do colchão</label>
              <select id="preview-mattress" value={size} onChange={event => setSize(event.target.value)} className="w-full h-11 rounded border border-white/25 bg-[#102a1e] px-3 text-sm">
                {mattressPrices.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
              <div><p className="text-xs text-white/65">Acrescente a limpeza por mais</p><p className="font-playfair text-4xl text-[#EDD96A] mt-1">{money(pack.additional)}</p></div>
              <p className="text-sm text-white/80 flex items-center gap-2"><Check className="w-4 h-4 text-[#D4AF37] shrink-0" />Poupa {money(pack.saving)} nos serviços do conjunto</p>
              <div className="pt-3 border-t border-white/15 flex justify-between items-center"><span className="text-sm">Total com deslocação</span><strong className="text-xl">{money(pack.total)}</strong></div>
              <p className="text-[11px] text-white/55">10% nos serviços ao acrescentar o colchão. A deslocação de {money(travel)} é cobrada uma única vez e não tem desconto.</p>
            </div>
          </div>
          <button className={primary} onClick={() => { setAdded(true); setStep('summary'); }}>Adicionar colchão por +{money(pack.additional)}</button>
          <button className="w-full min-h-11 text-sm text-white/75 underline underline-offset-4" onClick={() => { setAdded(false); setStep('summary'); }}>Continuar só com o sofá por {money(base + travel)}</button>
        </> : step === 'summary' ? <>
          <div className="rounded-lg border border-white/15 p-4 space-y-4 text-sm">
            <div className="flex justify-between gap-3"><span>{items.join(' + ')}</span><span>{money(base)}</span></div>
            {added && <><div className="flex justify-between"><span>Colchão {mattress.label.toLowerCase()}</span><span>{money(extra)}</span></div><div className="flex justify-between text-[#EDD96A]"><span>Desconto nos serviços · 10%</span><span>−{money(pack.saving)}</span></div></>}
            <div className="flex justify-between"><span>Deslocação a {city}</span><span>{money(travel)}</span></div>
            <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-xl"><span>Total</span><span>{money(finalTotal)}</span></div>
          </div>
          <button className={primary} onClick={() => setStep('message')}><MessageCircle className="w-4 h-4 inline mr-2" />Ver mensagem para WhatsApp</button>
          <button className="w-full min-h-11 text-sm text-white/70" onClick={() => setStep('offer')}><ArrowLeft className="w-4 h-4 inline mr-1" />Alterar seleção</button>
        </> : <>
          <div className="rounded-xl rounded-tl-none bg-[#123a28] border border-white/10 p-4 whitespace-pre-wrap text-sm leading-relaxed">{message}</div>
          <p className="text-xs text-white/55">Simulação: nenhum contacto, reserva ou mensagem foi enviado.</p>
          <button className={primary} onClick={() => setStep('summary')}>Voltar ao resumo</button>
        </>}
      </div>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}
