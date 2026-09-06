import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { UpsellItemConfig } from '@/components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcPackPricing } from '@/components/quiz/quizHelpers';

interface QuizComboUpsellScreenProps {
  upsellItems: UpsellItemConfig[];
  setUpsellItems: (items: UpsellItemConfig[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

type View = 'summary' | 'mattress' | 'sofa' | 'chairs';

const CHAIRS_STARTING_PRICE = 20;
const CHAIRS_MIN_QTY = 3;

function fmt(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1).replace('.', ',');
}

// Upsell final "estilo companhia aérea": uma única tela com as 3 categorias
// (Colchão, Sofá, Cadeiras), cada uma abre a sua própria página de
// quantidades com os tamanhos/preços reais do negócio, em vez do fluxo
// anterior de escolher um item de cada vez. Substitui QuizUpsellOverlay
// no ponto "antes de finalizar" (pedido explícito, aprovado em mockup).
const QuizComboUpsellScreen = ({ upsellItems, setUpsellItems, onContinue, onBack }: QuizComboUpsellScreenProps) => {
  const [view, setView] = useState<View>('summary');
  const [mattressQty, setMattressQty] = useState<Record<string, number>>({});
  const [sofaQty, setSofaQty] = useState<Record<string, number>>({});
  const [chairsQty, setChairsQty] = useState(0);
  const [sofaWaterproofOn, setSofaWaterproofOn] = useState(false);
  const [chairsWaterproofOn, setChairsWaterproofOn] = useState(false);

  const setMattQty = (id: string, qty: number) => setMattressQty(prev => ({ ...prev, [id]: Math.max(0, Math.min(9, qty)) }));
  const setSofaQtyFor = (id: string, qty: number) => setSofaQty(prev => ({ ...prev, [id]: Math.max(0, Math.min(9, qty)) }));
  // Cadeiras no upsell só compensam a partir de 3un (60€, o mínimo para o
  // desconto de 10% do pack) — pedido explícito do dono para não deixar
  // escolher 1 ou 2 cadeiras aqui e nunca chegar ao desconto anunciado.
  const decChairs = () => setChairsQty(q => (q <= CHAIRS_MIN_QTY ? 0 : q - 1));
  const incChairs = () => setChairsQty(q => (q <= 0 ? CHAIRS_MIN_QTY : Math.min(9, q + 1)));

  const sofaPack = (opt: (typeof sofaPrices)[number]) => calcPackPricing(opt, false, false, 40, 'essencial');

  const mattressTotal = mattressPrices.reduce((sum, opt) => {
    const q = mattressQty[opt.id] ?? 0;
    return sum + (typeof opt.cleaningPrice === 'number' ? q * opt.cleaningPrice : 0);
  }, 0);
  const sofaTotal = sofaPrices.reduce((sum, opt) => {
    const q = sofaQty[opt.id] ?? 0;
    if (q <= 0 || typeof opt.cleaningPrice !== 'number') return sum;
    const pack = sofaPack(opt);
    const unitPrice = sofaWaterproofOn && typeof pack.packPrice === 'number' ? pack.packPrice : opt.cleaningPrice;
    return sum + q * unitPrice;
  }, 0);
  // Delta calculado sempre (independente do toggle) para o preço mostrado no
  // próprio chip "Impermeabilizar" — tem de mostrar quanto custaria ligar,
  // não 0€ só porque ainda está desligado.
  const sofaWaterproofDeltaTotal = sofaPrices.reduce((sum, opt) => {
    const q = sofaQty[opt.id] ?? 0;
    if (q <= 0 || typeof opt.cleaningPrice !== 'number') return sum;
    return sum + q * (sofaPack(opt).packDelta ?? 0);
  }, 0);
  const chairsCleanPrice = calcChairClean(chairsQty);
  const chairsWaterproofDeltaIfOn = calcChairWaterproof(chairsQty) ?? 0;
  const chairsWaterproofDelta = chairsWaterproofOn ? chairsWaterproofDeltaIfOn : 0;
  const chairsTotal = chairsQty > 0 ? (chairsCleanPrice ?? 0) + chairsWaterproofDelta : 0;

  const mattressQtyTotal = Object.values(mattressQty).reduce((a, b) => a + b, 0);
  const sofaQtyTotal = Object.values(sofaQty).reduce((a, b) => a + b, 0);
  const anySelected = mattressQtyTotal > 0 || sofaQtyTotal > 0 || chairsQty > 0;

  const mattressSummary = mattressPrices
    .filter(opt => (mattressQty[opt.id] ?? 0) > 0)
    .map(opt => `${mattressQty[opt.id]}x ${opt.label}`)
    .join(', ') || 'a partir de 59€';
  const sofaSummaryBase = sofaPrices
    .filter(opt => (sofaQty[opt.id] ?? 0) > 0)
    .map(opt => `${sofaQty[opt.id]}x ${opt.label}`)
    .join(', ');
  const sofaSummary = sofaSummaryBase
    ? `${sofaSummaryBase}${sofaWaterproofOn ? ' + Imperm.' : ''}`
    : 'a partir de 49€';
  const chairsSummary = chairsQty > 0
    ? `${chairsQty} cadeira${chairsQty > 1 ? 's' : ''}${chairsWaterproofOn ? ' + Imperm.' : ''}`
    : `a partir de ${CHAIRS_STARTING_PRICE}€/un.`;

  // Sincroniza o subtotal e os itens em tempo real com o formData do quiz —
  // a "Estimativa" no topo do modal tem de acompanhar cada +1/-1 aqui dentro,
  // não só depois de "Confirmar"/"Finalizar Orçamento" (bug real: a pessoa
  // ficava sem feedback nenhum de preço enquanto ajustava quantidades).
  useEffect(() => {
    const items: UpsellItemConfig[] = [];
    mattressPrices.forEach(opt => {
      const q = mattressQty[opt.id] ?? 0;
      if (q > 0 && typeof opt.cleaningPrice === 'number') {
        items.push({ id: `mattress-${opt.id}`, mattressSize: opt.id, qty: q, price: q * opt.cleaningPrice, label: `${q}x Colchão ${opt.label}` });
      }
    });
    sofaPrices.forEach(opt => {
      const q = sofaQty[opt.id] ?? 0;
      if (q > 0 && typeof opt.cleaningPrice === 'number') {
        const pack = sofaPack(opt);
        const unitPrice = sofaWaterproofOn && typeof pack.packPrice === 'number' ? pack.packPrice : opt.cleaningPrice;
        items.push({
          id: `sofa-${opt.id}`,
          sofaSize: opt.id,
          qty: q,
          price: q * unitPrice,
          label: `${q}x Sofá ${opt.label}${sofaWaterproofOn ? ' + Impermeabilização' : ''}`,
          waterproof: sofaWaterproofOn,
        });
      }
    });
    if (chairsQty > 0) {
      items.push({
        id: 'chairs',
        chairQty: String(chairsQty),
        qty: chairsQty,
        price: (chairsCleanPrice ?? 0) + chairsWaterproofDelta,
        label: `${chairsQty} Cadeira${chairsQty > 1 ? 's' : ''}${chairsWaterproofOn ? ' + Impermeabilização' : ''}`,
        waterproof: chairsWaterproofOn,
      });
    }
    setUpsellItems(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mattressQty, sofaQty, chairsQty, sofaWaterproofOn, chairsWaterproofOn]);

  const baseTotal = mattressTotal + sofaTotal + chairsTotal;
  const subtotalLabel = `${fmt(baseTotal)}€`;

  const StepperRow = ({ label, unitLabel, qty, onDec, onInc }: { label: string; unitLabel: string; qty: number; onDec: () => void; onInc: () => void }) => (
    <div className={cn('w-full flex items-center justify-between gap-2 rounded-sm border px-3.5 py-3', qty > 0 ? 'border-gold/40 bg-gold/[0.05]' : 'border-white/10 bg-[#1a2a1a]')}>
      <div className="text-left">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-[11px] text-white/35">{unitLabel}</p>
      </div>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button onClick={onDec} disabled={qty <= 0} className="w-9 h-9 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-lg flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
        <span className="w-5 text-center font-bold text-gold tabular-nums">{qty}</span>
        <button onClick={onInc} className="w-9 h-9 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-lg flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
      </div>
    </div>
  );

  const WaterproofToggle = ({ active, onClick, priceLabel }: { active: boolean; onClick: () => void; priceLabel: string }) => (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 text-left px-3.5 py-3 rounded-sm border-2 transition-all touch-manipulation',
        active ? 'border-gold bg-gold/[0.08]' : 'border-white/10 bg-[#1a2a1a] hover:border-gold/30'
      )}
    >
      <span className={cn('flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center', active ? 'bg-gold/20' : 'bg-white/[0.06]')}>
        <Droplet className={cn('w-4 h-4', active ? 'text-gold' : 'text-white/40')} strokeWidth={1.8} />
      </span>
      <span className="flex-1 min-w-0">
        <span className={cn('block text-sm font-semibold', active ? 'text-white' : 'text-white/80')}>Impermeabilizar</span>
        <span className="block text-[11px] text-white/35">Proteção Essencial incluída</span>
      </span>
      <span className={cn('flex-shrink-0 text-xs font-bold tabular-nums', active ? 'text-gold' : 'text-white/45')}>{priceLabel}</span>
    </button>
  );

  if (view === 'mattress' || view === 'sofa' || view === 'chairs') {
    const label = view === 'mattress' ? 'Colchão' : view === 'sofa' ? 'Sofá(s)' : 'Cadeiras';
    return (
      <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
        <button onClick={() => setView('summary')} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors touch-manipulation self-start ml-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Detalhes do{view === 'sofa' ? '(s)' : ''} {label}</h2>

        {view === 'mattress' && (
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {mattressPrices.map(opt => (
              <StepperRow
                key={opt.id}
                label={opt.label}
                unitLabel={typeof opt.cleaningPrice === 'number' ? `${opt.cleaningPrice}€/un.` : 'Sob orçamento'}
                qty={mattressQty[opt.id] ?? 0}
                onDec={() => setMattQty(opt.id, (mattressQty[opt.id] ?? 0) - 1)}
                onInc={() => setMattQty(opt.id, (mattressQty[opt.id] ?? 0) + 1)}
              />
            ))}
          </div>
        )}
        {view === 'sofa' && (
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {sofaPrices.map(opt => (
              <StepperRow
                key={opt.id}
                label={opt.label}
                unitLabel={typeof opt.cleaningPrice === 'number' ? `${opt.cleaningPrice}€/un.` : 'Sob orçamento'}
                qty={sofaQty[opt.id] ?? 0}
                onDec={() => setSofaQtyFor(opt.id, (sofaQty[opt.id] ?? 0) - 1)}
                onInc={() => setSofaQtyFor(opt.id, (sofaQty[opt.id] ?? 0) + 1)}
              />
            ))}
            <WaterproofToggle
              active={sofaWaterproofOn}
              onClick={() => setSofaWaterproofOn(v => !v)}
              priceLabel={sofaQtyTotal > 0 ? `+${fmt(sofaWaterproofDeltaTotal)}€` : ''}
            />
          </div>
        )}
        {view === 'chairs' && (
          <>
            <div className="flex items-center justify-center gap-6">
              <button onClick={decChairs} disabled={chairsQty <= 0} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
              <span className="text-4xl font-black text-gold w-10 text-center tabular-nums leading-none">{chairsQty}</span>
              <button onClick={incChairs} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
            </div>
            <p className="text-xs text-white/30 text-center leading-snug">Mínimo de {CHAIRS_MIN_QTY} cadeiras · 1ª–4ª: 20€ · 5ª–6ª: 15€ · 7ª–9ª: 12,5€ por cadeira</p>
            <div className="w-full max-w-xs">
              <WaterproofToggle
                active={chairsWaterproofOn}
                onClick={() => setChairsWaterproofOn(v => !v)}
                priceLabel={chairsQty > 0 ? `+${fmt(chairsWaterproofDeltaIfOn)}€` : ''}
              />
            </div>
          </>
        )}

        <button
          onClick={() => setView('summary')}
          className="w-full max-w-xs h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-base tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)] mt-1"
        >
          Confirmar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">ANTES DE FINALIZAR</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Aproveite e poupe 10%</h2>
      <p className="text-xs text-white/40 text-center max-w-xs leading-relaxed">
        Junte mais um serviço a este pedido e o total fica logo com 10% de desconto. Totalmente opcional.
      </p>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button onClick={() => setView('mattress')} className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-sm border-2 transition-all touch-manipulation text-left', mattressQtyTotal > 0 ? 'border-gold bg-gold/[0.08]' : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40')}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Colchão</p>
            <p className="text-xs text-gold/70 truncate">{mattressSummary}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
        </button>
        <button onClick={() => setView('sofa')} className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-sm border-2 transition-all touch-manipulation text-left', sofaQtyTotal > 0 ? 'border-gold bg-gold/[0.08]' : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40')}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Sofá</p>
            <p className="text-xs text-gold/70 truncate">{sofaSummary}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
        </button>
        <button onClick={() => setView('chairs')} className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-sm border-2 transition-all touch-manipulation text-left', chairsQty > 0 ? 'border-gold bg-gold/[0.08]' : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40')}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Cadeiras</p>
            <p className="text-xs text-gold/70 truncate">{chairsSummary}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
        </button>
      </div>

      <div className={cn('w-full max-w-xs rounded-sm border px-4 py-3.5 transition-all', anySelected ? 'border-gold/35 bg-gold/[0.06]' : 'border-white/10 bg-[#1a2a1a]')}>
        {anySelected && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Desconto de 10% ativo</span>
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-white/45">Subtotal do extra</span>
          <span className="font-playfair text-xl font-bold text-gold tabular-nums">{subtotalLabel}</span>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-xs h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-base tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
      >
        Finalizar Orçamento
      </button>
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-white/25 hover:text-white/45 transition-colors touch-manipulation">
        <ChevronLeft className="w-3.5 h-3.5" /> Voltar
      </button>
    </div>
  );
};

export default QuizComboUpsellScreen;
