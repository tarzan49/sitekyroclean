import { useState } from 'react';
import { mattressPrices, type UpsellItemConfig } from '../QuizTypes';
import { previewPackPrice } from '@/components/SofaPackPreview';

const eur = (n: number) => n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

/** Local-only offer rendered inside the real quiz, before its contact step. */
export default function QuizSofaPackTest({ base, travel, items, onChoose, onBack }: {
  base: number; travel: number; items: UpsellItemConfig[];
  onChoose: (item: UpsellItemConfig | null) => void; onBack: () => void;
}) {
  const [size, setSize] = useState(items.find(i => i.mattressSize)?.mattressSize ?? 'casal');
  const mattress = mattressPrices.find(i => i.id === size)!;
  const extra = Number(mattress.cleaningPrice);
  const pack = previewPackPrice(base, extra, travel);
  return <div className="w-full max-w-sm mx-auto space-y-4 py-3">
    <p className="text-gold text-[10px] tracking-[0.28em] uppercase">Teste · Aproveite a mesma visita</p>
    <h2 className="font-playfair text-2xl text-white">Já que vamos limpar o sofá…</h2>
    <p className="text-sm text-white/65">Acrescente um colchão e poupe 10% nos serviços do conjunto.</p>
    <div className="p-4 border border-gold/40 bg-gold/5 rounded-sm space-y-3">
      <label htmlFor="quiz-test-mattress" className="block text-xs text-white/70">Tamanho do colchão</label>
      <select id="quiz-test-mattress" value={size} onChange={e => setSize(e.target.value)} className="w-full h-11 bg-[#0c251a] text-white border border-white/20 rounded-sm px-3">
        {mattressPrices.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
      </select>
      <p className="text-xs text-white/60">Acrescente a limpeza por mais</p>
      <p className="font-playfair text-4xl text-gold">{eur(pack.additional)}</p>
      <p className="text-sm text-white/80">Poupa {eur(pack.saving)} no conjunto.</p>
      <div className="flex justify-between pt-3 border-t border-white/15 text-white"><span>Total com deslocação</span><strong>{eur(pack.total)}</strong></div>
      <p className="text-[11px] text-white/50">Deslocação: {eur(travel)}, cobrada uma única vez, sem desconto.</p>
    </div>
    <button className="w-full min-h-12 bg-gold text-[#071a12] font-bold p-3 rounded-sm" onClick={() => onChoose({id: `mattress-${size}`, mattressSize: size, qty: 1, price: extra, label: `1x Colchão ${mattress.label}`})}>Adicionar colchão por +{eur(pack.additional)}</button>
    <button className="w-full min-h-11 text-sm text-white/75 underline" onClick={() => onChoose(null)}>Continuar só com o sofá por {eur(base + travel)}</button>
    <button className="w-full min-h-11 text-sm text-white/50" onClick={onBack}>Voltar aos tratamentos</button>
  </div>;
}
