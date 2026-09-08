import { useEffect, useState } from 'react';
import { ChevronLeft, Shield, Star, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { UpsellItemConfig, CarpetItem } from '@/components/quiz/QuizTypes';
import {
  calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, calcPackPricing,
  carpetAddItem, carpetRemoveItem, carpetUpdateItem, carpetItemArea, carpetTotalArea,
} from '@/components/quiz/quizHelpers';
import { PACK_DISCOUNT_MIN_SERVICE, PACK_DISCOUNT_MIN_UPSELL_ITEM } from '@/lib/priceWidgetCalc';

type WaterproofTier = 'off' | 'essencial' | 'premium';

interface QuizComboUpsellScreenProps {
  upsellItems: UpsellItemConfig[];
  setUpsellItems: (items: UpsellItemConfig[]) => void;
  onContinue: () => void;
  onBack: () => void;
  // Preço já calculado pelo use-quiz-pricing.ts (fonte única de verdade do
  // desconto de 10% sobre o PEDIDO TODO, não só sobre o extra) — permite
  // mostrar a poupança em euros concretos aqui sem duplicar a regra
  // (pedido explícito 2026-09-08: reforço de copy, "o desconto aplica-se a
  // tudo, não só ao extra").
  totalPrice: number;
  packDiscountActive: boolean;
  packDiscountedPrice: number;
}

type View = 'summary' | 'mattress' | 'sofa' | 'chairs' | 'carpet';

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
const QuizComboUpsellScreen = ({ upsellItems, setUpsellItems, onContinue, onBack, totalPrice, packDiscountActive, packDiscountedPrice }: QuizComboUpsellScreenProps) => {
  const [view, setView] = useState<View>('summary');
  const [mattressQty, setMattressQty] = useState<Record<string, number>>({});
  const [sofaQty, setSofaQty] = useState<Record<string, number>>({});
  const [chairsQty, setChairsQty] = useState(0);
  const [sofaWaterproofTier, setSofaWaterproofTier] = useState<WaterproofTier>('off');
  const [chairsWaterproofTier, setChairsWaterproofTier] = useState<WaterproofTier>('off');
  const [carpetItems, setCarpetItems] = useState<CarpetItem[]>([{ id: 'upsell-tapete-1', largura: '', comprimento: '' }]);

  const setMattQty = (id: string, qty: number) => setMattressQty(prev => ({ ...prev, [id]: Math.max(0, Math.min(9, qty)) }));
  const setSofaQtyFor = (id: string, qty: number) => setSofaQty(prev => ({ ...prev, [id]: Math.max(0, Math.min(9, qty)) }));
  // Cadeiras no upsell só compensam a partir de 3un (60€, acima do mínimo de
  // 49€ do artigo extra para o desconto de 10% do pack) — pedido explícito do
  // dono para não deixar escolher 1 ou 2 cadeiras aqui e nunca chegar ao
  // desconto anunciado.
  const decChairs = () => setChairsQty(q => (q <= CHAIRS_MIN_QTY ? 0 : q - 1));
  const incChairs = () => setChairsQty(q => (q <= 0 ? CHAIRS_MIN_QTY : Math.min(9, q + 1)));

  const sofaPack = (opt: (typeof sofaPrices)[number], tier: 'essencial' | 'premium' = 'essencial') => calcPackPricing(opt, true, false, 40, tier);

  const mattressTotal = mattressPrices.reduce((sum, opt) => {
    const q = mattressQty[opt.id] ?? 0;
    return sum + (typeof opt.cleaningPrice === 'number' ? q * opt.cleaningPrice : 0);
  }, 0);
  const sofaTotal = sofaPrices.reduce((sum, opt) => {
    const q = sofaQty[opt.id] ?? 0;
    if (q <= 0 || typeof opt.cleaningPrice !== 'number') return sum;
    const pack = sofaWaterproofTier !== 'off' ? sofaPack(opt, sofaWaterproofTier) : null;
    const unitPrice = pack && typeof pack.packPrice === 'number' ? pack.packPrice : opt.cleaningPrice;
    return sum + q * unitPrice;
  }, 0);
  // Deltas calculados sempre para as duas tiers (independente da seleção atual)
  // para os preços mostrados nos próprios cartões Premium/Essencial — têm de
  // mostrar quanto custaria ligar, não 0€ só porque ainda está desligado.
  const sofaEssencialDeltaTotal = sofaPrices.reduce((sum, opt) => {
    const q = sofaQty[opt.id] ?? 0;
    if (q <= 0 || typeof opt.cleaningPrice !== 'number') return sum;
    return sum + q * (sofaPack(opt, 'essencial').packDelta ?? 0);
  }, 0);
  const sofaPremiumDeltaTotal = sofaPrices.reduce((sum, opt) => {
    const q = sofaQty[opt.id] ?? 0;
    if (q <= 0 || typeof opt.cleaningPrice !== 'number') return sum;
    return sum + q * (sofaPack(opt, 'premium').packDelta ?? 0);
  }, 0);
  const chairsCleanPrice = calcChairClean(chairsQty);
  const chairsWaterproofEssencialDelta = calcChairWaterproof(chairsQty) ?? 0;
  const chairsWaterproofPremiumDelta = calcChairWaterproofPremium(chairsQty) ?? 0;
  const chairsWaterproofDelta = chairsWaterproofTier === 'premium' ? chairsWaterproofPremiumDelta
    : chairsWaterproofTier === 'essencial' ? chairsWaterproofEssencialDelta : 0;
  const chairsTotal = chairsQty > 0 ? (chairsCleanPrice ?? 0) + chairsWaterproofDelta : 0;

  const mattressQtyTotal = Object.values(mattressQty).reduce((a, b) => a + b, 0);
  const sofaQtyTotal = Object.values(sofaQty).reduce((a, b) => a + b, 0);
  const anySelected = mattressQtyTotal > 0 || sofaQtyTotal > 0 || chairsQty > 0;
  const carpetTotalAreaValue = carpetTotalArea(carpetItems);
  const carpetValidCount = carpetItems.filter(it => carpetItemArea(it) !== null).length;

  const tierLabel = (t: WaterproofTier) => t === 'premium' ? ' + Imperm. Premium' : t === 'essencial' ? ' + Imperm. Essencial' : '';

  const mattressSummary = mattressPrices
    .filter(opt => (mattressQty[opt.id] ?? 0) > 0)
    .map(opt => `${mattressQty[opt.id]}x ${opt.label}`)
    .join(', ') || 'Também aproveita? a partir de 59€';
  const sofaSummaryBase = sofaPrices
    .filter(opt => (sofaQty[opt.id] ?? 0) > 0)
    .map(opt => `${sofaQty[opt.id]}x ${opt.label}`)
    .join(', ');
  const sofaSummary = sofaSummaryBase
    ? `${sofaSummaryBase}${tierLabel(sofaWaterproofTier)}`
    : 'Some ao pedido, a partir de 49€';
  const chairsSummary = chairsQty > 0
    ? `${chairsQty} cadeira${chairsQty > 1 ? 's' : ''}${tierLabel(chairsWaterproofTier)}`
    : `Deixe-as como novas, a partir de ${CHAIRS_STARTING_PRICE}€/un.`;
  const carpetSummary = carpetValidCount > 0
    ? `${carpetValidCount} tapete${carpetValidCount > 1 ? 's' : ''} · sob orçamento`
    : 'Sempre sob orçamento, sem compromisso';

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
        const pack = sofaWaterproofTier !== 'off' ? sofaPack(opt, sofaWaterproofTier) : null;
        const unitPrice = pack && typeof pack.packPrice === 'number' ? pack.packPrice : opt.cleaningPrice;
        items.push({
          id: `sofa-${opt.id}`,
          sofaSize: opt.id,
          qty: q,
          price: q * unitPrice,
          label: `${q}x Sofá ${opt.label}${tierLabel(sofaWaterproofTier)}`,
          waterproof: sofaWaterproofTier !== 'off',
          waterproofPrice: pack?.packDelta ?? undefined,
        });
      }
    });
    if (chairsQty > 0) {
      items.push({
        id: 'chairs',
        chairQty: String(chairsQty),
        qty: chairsQty,
        price: (chairsCleanPrice ?? 0) + chairsWaterproofDelta,
        label: `${chairsQty} Cadeira${chairsQty > 1 ? 's' : ''}${tierLabel(chairsWaterproofTier)}`,
        waterproof: chairsWaterproofTier !== 'off',
        waterproofPrice: chairsWaterproofTier !== 'off' ? chairsWaterproofDelta : undefined,
      });
    }
    if (carpetValidCount > 0) {
      items.push({
        id: 'carpet',
        carpetArea: String(Math.round(carpetTotalAreaValue * 100) / 100),
        qty: carpetValidCount,
        price: 0,
        label: `${carpetValidCount} Tapete${carpetValidCount > 1 ? 's' : ''} (sob orçamento)`,
      });
    }
    setUpsellItems(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mattressQty, sofaQty, chairsQty, sofaWaterproofTier, chairsWaterproofTier, carpetItems]);

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

  // Seletor Premium/Essencial de impermeabilização — mesmo padrão (com selo
  // Top) usado no passo principal do quiz, em vez do antigo toggle único que
  // só oferecia a Essencial (pedido explícito: "e só a essencial? péssimo").
  const WaterproofTierPicker = ({ tier, onSelect, essencialDelta, premiumDelta }: { tier: WaterproofTier; onSelect: (t: WaterproofTier) => void; essencialDelta: number; premiumDelta: number }) => {
    const premiumExtra = Math.round((premiumDelta - essencialDelta) * 10) / 10;
    return (
      <div className="w-full grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelect(tier === 'premium' ? 'off' : 'premium')}
          className={cn(
            'relative rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation',
            tier === 'premium' ? 'border-gold bg-gold/[0.10] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : 'border-gold/30 bg-[#1a2a1a] hover:border-gold/55'
          )}
        >
          <span className="absolute -top-2 -right-2 z-10 flex w-8 h-8 flex-col items-center justify-center rounded-sm border-2 border-[#12121e] bg-gold shadow-md">
            <Star className="w-2.5 h-2.5 fill-[#12121e] text-[#12121e]" />
            <span className="text-[5px] font-black uppercase leading-none tracking-tight text-[#12121e]">Top</span>
          </span>
          <div className="flex items-center gap-1 mb-0.5">
            <Shield className={cn('w-3.5 h-3.5 flex-shrink-0', tier === 'premium' ? 'text-gold' : 'text-gold/50')} />
            <p className={cn('text-xs font-bold', tier === 'premium' ? 'text-white' : 'text-white/80')}>Premium</p>
          </div>
          <p className={cn('text-[10px] leading-snug font-semibold', tier === 'premium' ? 'text-gold/75' : 'text-gold/45')}>até 10 anos · +{fmt(premiumExtra)}€</p>
        </button>
        <button
          type="button"
          onClick={() => onSelect(tier === 'essencial' ? 'off' : 'essencial')}
          className={cn(
            'rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation',
            tier === 'essencial' ? 'border-gold/60 bg-gold/[0.08]' : 'border-white/15 bg-[#1a2a1a] hover:border-gold/30'
          )}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <Shield className={cn('w-3.5 h-3.5 flex-shrink-0', tier === 'essencial' ? 'text-gold' : 'text-white/30')} />
            <p className={cn('text-xs font-bold', tier === 'essencial' ? 'text-white' : 'text-white/60')}>Essencial</p>
          </div>
          <p className="text-[10px] text-white/35 leading-snug">1-2 anos · +{fmt(essencialDelta)}€</p>
        </button>
      </div>
    );
  };

  if (view === 'mattress' || view === 'sofa' || view === 'chairs' || view === 'carpet') {
    const label = view === 'mattress' ? 'Colchão' : view === 'sofa' ? 'Sofá(s)' : view === 'chairs' ? 'Cadeiras' : 'Tapete(s)';
    return (
      <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
        <button onClick={() => setView('summary')} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors touch-manipulation self-start ml-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Detalhes do{view === 'sofa' || view === 'carpet' ? '(s)' : ''} {label}</h2>

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
            {sofaQtyTotal > 0 && (
              <WaterproofTierPicker
                tier={sofaWaterproofTier}
                onSelect={setSofaWaterproofTier}
                essencialDelta={sofaEssencialDeltaTotal}
                premiumDelta={sofaPremiumDeltaTotal}
              />
            )}
          </div>
        )}
        {view === 'chairs' && (
          <>
            <div className="flex items-center justify-center gap-6">
              <button onClick={decChairs} disabled={chairsQty <= 0} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
              <span className="text-4xl font-black text-gold w-10 text-center tabular-nums leading-none">{chairsQty}</span>
              <button onClick={incChairs} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
            </div>
            <p className="text-xs text-white/30 text-center leading-snug">Mínimo de {CHAIRS_MIN_QTY} cadeiras</p>
            {chairsQty > 0 && (
              <div className="w-full max-w-xs">
                <WaterproofTierPicker
                  tier={chairsWaterproofTier}
                  onSelect={setChairsWaterproofTier}
                  essencialDelta={chairsWaterproofEssencialDelta}
                  premiumDelta={chairsWaterproofPremiumDelta}
                />
              </div>
            )}
          </>
        )}
        {view === 'carpet' && (
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <p className="text-xs text-white/35 text-center leading-snug -mt-1 mb-1">
              Meça cada tapete e adicione quantos precisar. Sem preço fixo por m², cada peça é sempre orçamentada à parte.
            </p>
            {carpetItems.map((item, i) => {
              const area = carpetItemArea(item);
              return (
                <div key={item.id} className="rounded-sm border border-gold/15 bg-[#1a2a1a] p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Tapete {i + 1}</span>
                    {carpetItems.length > 1 && (
                      <button
                        onClick={() => setCarpetItems(prev => carpetRemoveItem(prev, item.id))}
                        aria-label="Remover tapete"
                        className="w-5 h-5 rounded-sm flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors touch-manipulation"
                      >×</button>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="number" inputMode="decimal" min="0" step="0.1" placeholder="0"
                        value={item.largura}
                        onChange={(e) => setCarpetItems(prev => carpetUpdateItem(prev, item.id, 'largura', e.target.value))}
                        className="w-full h-11 text-center text-base font-bold bg-white/[0.05] text-white placeholder:text-white/25 rounded-sm border-2 border-white/15 focus:border-gold focus:outline-none transition-colors"
                      />
                      <span className="text-[9px] text-center uppercase tracking-wide text-white/30">Largura (m)</span>
                    </div>
                    <span className="text-white/25 text-sm pb-4">×</span>
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="number" inputMode="decimal" min="0" step="0.1" placeholder="0"
                        value={item.comprimento}
                        onChange={(e) => setCarpetItems(prev => carpetUpdateItem(prev, item.id, 'comprimento', e.target.value))}
                        className="w-full h-11 text-center text-base font-bold bg-white/[0.05] text-white placeholder:text-white/25 rounded-sm border-2 border-white/15 focus:border-gold focus:outline-none transition-colors"
                      />
                      <span className="text-[9px] text-center uppercase tracking-wide text-white/30">Comprimento (m)</span>
                    </div>
                  </div>
                  <div className="text-right pt-1 border-t border-white/[0.06]">
                    <span className="text-[10px] text-white/30">Área </span>
                    <span className="text-sm font-bold text-gold tabular-nums">{area !== null ? `${area % 1 === 0 ? area : area.toFixed(2).replace('.', ',')} m²` : '0 m²'}</span>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => setCarpetItems(prev => carpetAddItem(prev))}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border-2 border-dashed border-gold/30 text-gold/80 text-sm font-bold hover:border-gold/60 hover:bg-gold/[0.04] transition-all touch-manipulation"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar outro tapete
            </button>
            <p className="text-xs text-white/30 text-center leading-snug">
              Qualquer tapete é sempre sob orçamento. Confirmamos o preço certo na visita, sem compromisso.
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 w-full max-w-xs mt-1">
          <button
            onClick={() => setView('summary')}
            className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/50 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-sm font-semibold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </button>
          <button
            onClick={() => setView('summary')}
            className="flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-sm tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
          >
            Confirmar
          </button>
        </div>
      </div>
    );
  }

  const rowConfig: { view: View; label: string; summary: string; selected: boolean }[] = [
    { view: 'mattress', label: 'Colchão', summary: mattressSummary, selected: mattressQtyTotal > 0 },
    { view: 'sofa', label: 'Sofá', summary: sofaSummary, selected: sofaQtyTotal > 0 },
    { view: 'chairs', label: 'Cadeiras', summary: chairsSummary, selected: chairsQty > 0 },
    { view: 'carpet', label: 'Tapete', summary: carpetSummary, selected: carpetValidCount > 0 },
  ];

  const savings = packDiscountActive ? Math.max(0, Math.round(totalPrice) - packDiscountedPrice) : 0;

  return (
    <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">UM BÓNUS PARA SI</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Poupe 10% no pedido todo</h2>
      <p className="text-xs text-white/55 text-center max-w-xs leading-relaxed">
        Se juntar mais um serviço, o desconto aplica-se a tudo, não só ao extra. Totalmente opcional.
      </p>

      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        {rowConfig.map(row => (
          <button
            key={row.view}
            onClick={() => setView(row.view)}
            className={cn(
              'w-full min-h-[64px] flex items-center gap-3 px-4 py-3.5 rounded-sm border-2 text-left transition-all duration-200 touch-manipulation active:scale-[0.98]',
              row.selected
                ? 'border-gold bg-[#1a2a1a] shadow-[0_0_14px_rgba(212,175,55,0.20)]'
                : 'border-dashed border-gold/30 bg-gold/[0.03] hover:border-gold/55 hover:bg-gold/[0.05]'
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{row.label}</p>
              <p className={cn('text-xs truncate mt-0.5', row.selected ? 'text-gold/80' : 'text-white/45')}>{row.summary}</p>
            </div>
            <span className={cn(
              'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors duration-200',
              row.selected ? 'border-gold bg-gold' : 'border-gold/50 bg-transparent'
            )}>
              {row.selected
                ? <Check className="w-3.5 h-3.5 text-[#12121e]" strokeWidth={3} />
                : <Plus className="w-3.5 h-3.5 text-gold" strokeWidth={3} />}
            </span>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/25 text-center leading-snug max-w-xs">
        Válido em pedidos a partir de {PACK_DISCOUNT_MIN_SERVICE}€, com um serviço extra de pelo menos {PACK_DISCOUNT_MIN_UPSELL_ITEM}€.
      </p>

      {anySelected && (
        <div className="w-full max-w-xs rounded-sm border border-gold/35 bg-gold/[0.06] px-4 py-3.5 animate-fade-slide-up">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
              {packDiscountActive ? `Poupa ${fmt(savings)}€ no pedido todo` : 'Desconto de 10% ativo'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-white/45">Subtotal do extra</span>
            <span className="font-playfair text-xl font-bold text-gold tabular-nums">{subtotalLabel}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 w-full max-w-xs">
        <button
          onClick={onBack}
          className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/50 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button
          onClick={onContinue}
          className="flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-sm tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
        >
          Finalizar Orçamento
        </button>
      </div>
    </div>
  );
};

export default QuizComboUpsellScreen;
