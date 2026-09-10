import { mattressPrices, type UpsellItemConfig } from '../QuizTypes';

const eur = (n: number) => n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
export const TEST_CASAL_ADDON_PRICE = 55;

/** Local-only proposal: a fixed extra price, without another pack discount. */
export default function QuizSofaPackTest({ base, travel, onChoose, onBack }: {
  base: number; travel: number; items: UpsellItemConfig[];
  onChoose: (item: UpsellItemConfig | null) => void; onBack: () => void;
}) {
  const mattress = mattressPrices.find(i => i.id === 'casal')!;
  const separateVisit = Number(mattress.cleaningPrice) + travel;
  const saving = separateVisit - TEST_CASAL_ADDON_PRICE;
  const total = base + travel + TEST_CASAL_ADDON_PRICE;
  return <div className="w-full max-w-sm mx-auto space-y-3 py-2 text-left">
    <p className="text-gold text-[10px] tracking-[0.22em] uppercase">Aproveite a mesma visita</p>
    <h2 className="font-playfair text-2xl text-white">Limpe também o seu colchão de casal</h2>
    <div className="p-4 border border-gold/40 bg-gold/5 rounded-sm space-y-3">
      <div className="flex justify-between gap-3 text-sm text-white/60"><span>Numa visita separada</span><span className="line-through">{eur(separateVisit)}</span></div>
      <p className="text-[11px] text-white/50">Limpeza {eur(Number(mattress.cleaningPrice))} + deslocação {eur(travel)}</p>
      <div><p className="text-xs text-white/70">Acrescente ao pedido por apenas</p><p className="font-playfair text-5xl text-gold mt-1">+{eur(TEST_CASAL_ADDON_PRICE)}</p></div>
      <p className="inline-block bg-gold/15 text-gold font-bold text-sm px-3 py-2 rounded-sm">Poupa {eur(saving)} face a uma visita separada</p>
      <p className="text-xs text-white/60">Preço especial na mesma visita. Sem uma segunda taxa de deslocação.</p>
      <div className="border-t border-white/15 pt-3 space-y-2 text-sm text-white/80">
        <div className="flex justify-between"><span>Pedido atual, com deslocação</span><span>{eur(base + travel)}</span></div>
        <div className="flex justify-between"><span>Colchão de casal adicional</span><span>+{eur(TEST_CASAL_ADDON_PRICE)}</span></div>
        <div className="flex justify-between text-white font-bold"><span>Novo total</span><span>{eur(total)}</span></div>
      </div>
    </div>
    <button className="w-full min-h-12 bg-gold text-[#071a12] font-bold p-3 rounded-sm" onClick={() => onChoose({id: 'mattress-casal', mattressSize: 'casal', qty: 1, price: TEST_CASAL_ADDON_PRICE, label: '1x Colchão Casal (oferta na mesma visita)'})}>Adicionar colchão por +{eur(TEST_CASAL_ADDON_PRICE)}</button>
    <button className="w-full min-h-11 text-sm text-white/75 underline" onClick={() => onChoose(null)}>Continuar só com o sofá por {eur(base + travel)}</button>
    <button className="w-full min-h-11 text-sm text-white/50" onClick={onBack}>Voltar aos tratamentos</button>
  </div>;
}
