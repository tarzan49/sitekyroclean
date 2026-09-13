import type { SofaItem, MattressItem } from './QuizTypes';
import { sofaPrices, mattressPrices } from './QuizTypes';
import { treatmentQty } from './quizHelpers';

export default function QuizTreatmentQuantities({ items, service, onChange }: {
  items: (SofaItem | MattressItem)[];
  service: 'sofa' | 'mattress';
  onChange: (sizeId: string, qty: number) => void;
}) {
  if (items.reduce((sum, i) => sum + i.qty, 0) <= 1) return null;
  const prices = service === 'sofa' ? sofaPrices : mattressPrices;
  return <div className="w-full max-w-sm border-t border-gold/20 pt-3 space-y-2">
    <p className="text-sm text-white/75 text-left">Em quantos pretende aplicar o tratamento?</p>
    {items.filter(i => i.qty > 0).map(item => {
      const label = prices.find(p => p.id === item.sizeId)?.label ?? item.sizeId;
      const qty = treatmentQty(item);
      return <div key={item.sizeId} className="flex items-center justify-between gap-2">
        <span className="text-base text-white/85">{label}</span>
        <div className="flex items-center gap-2">
          <button type="button" aria-label={`Retirar tratamento: ${label}`} disabled={qty === 0} onClick={() => onChange(item.sizeId, qty - 1)} className="w-11 h-11 rounded-sm border border-white/20 text-white disabled:opacity-25">−</button>
          <span className="text-base font-semibold text-gold min-w-12 text-center">{qty} de {item.qty}</span>
          <button type="button" aria-label={`Adicionar tratamento: ${label}`} disabled={qty === item.qty} onClick={() => onChange(item.sizeId, qty + 1)} className="w-11 h-11 rounded-sm border border-white/20 text-white disabled:opacity-25">+</button>
        </div>
      </div>;
    })}
  </div>;
}
