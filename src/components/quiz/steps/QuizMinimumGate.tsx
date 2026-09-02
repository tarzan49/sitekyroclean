import { ChevronLeft, ChevronRight, Plus, Droplet, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, UpsellItemConfig, SofaItem, MattressItem } from '@/components/quiz/QuizTypes';
import { sofaTogglePack, mattressTogglePack, calcPackPricing, calcChairClean, calcChairWaterproof } from '@/components/quiz/quizHelpers';
import { SOFA_ANTI_ACAROS_PRICE, calcChairAntiAcarosTotal } from '@/lib/priceWidgetCalc';

interface QuizMinimumGateProps {
  formData: QuizFormData;
  updateFormData: (u: Partial<QuizFormData>) => void;
  sofaItems: SofaItem[];
  setSofaItems: React.Dispatch<React.SetStateAction<SofaItem[]>>;
  mattressItems: MattressItem[];
  setMattressItems: React.Dispatch<React.SetStateAction<MattressItem[]>>;
  upsellItems: UpsellItemConfig[];
  setUpsellItems: React.Dispatch<React.SetStateAction<UpsellItemConfig[]>>;
  minOrderValue: number;
  amountToMinimum: number;
  belowMinimum: boolean;
  onOpenFullUpsell: () => void;
  onContinue: () => void;
  onBack: () => void;
}

// Chip clicável de addon rápido (Impermeabilização/Anti Ácaros), mesmo padrão
// visual do mockup aprovado (https://claude.ai/code/artifact/9ba7fff8-7c78-4e4d-95ff-b804754cfbdc):
// card #1a2a1a, borda dourada quando selecionado, icone + titulo + preco.
function AddonChip({ icon: Icon, title, subtitle, priceLabel, active, onClick }: {
  icon: typeof Droplet;
  title: string;
  subtitle: string;
  priceLabel: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full text-left px-4 py-3 rounded-sm border-2 transition-all duration-200 touch-manipulation',
        active ? 'border-gold bg-[#1a2a1a] shadow-[0_0_16px_rgba(212,175,55,0.22)]' : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40'
      )}
    >
      <span className={cn('flex-shrink-0 w-9 h-9 rounded-sm flex items-center justify-center', active ? 'bg-gold/20' : 'bg-gold/10')}>
        <Icon className={cn('w-[18px] h-[18px]', active ? 'text-gold' : 'text-gold/60')} strokeWidth={1.8} />
      </span>
      <span className="flex-1 min-w-0">
        <span className={cn('block text-[13px] font-bold', active ? 'text-white' : 'text-white/85')}>{title}</span>
        <span className="block text-[11px] text-white/40 leading-snug mt-0.5">{subtitle}</span>
      </span>
      <span className={cn('flex-shrink-0 text-xs font-bold tabular-nums', active ? 'text-gold' : 'text-white/50')}>{priceLabel}</span>
    </button>
  );
}

const QuizMinimumGate = ({
  formData, updateFormData,
  sofaItems, setSofaItems,
  mattressItems, setMattressItems,
  upsellItems, setUpsellItems,
  minOrderValue, amountToMinimum, belowMinimum,
  onOpenFullUpsell, onContinue, onBack,
}: QuizMinimumGateProps) => {
  const isWaterproofBase = formData.serviceType === 'waterproofing';
  const service = formData.service;

  // ── Sofá ────────────────────────────────────────────────────────────────
  const activeSofaItems = sofaItems.filter(i => i.qty > 0);
  const firstSofa = activeSofaItems[0];
  const sofaOpt = firstSofa ? sofaPrices.find(p => p.id === firstSofa.sizeId) : undefined;
  const sofaPack = sofaOpt ? calcPackPricing(sofaOpt, firstSofa?.packEnabled ?? false, isWaterproofBase, 40, 'essencial') : null;
  const sofaImperOn = firstSofa?.packEnabled ?? false;
  const sofaAntiAcarosOn = upsellItems.some(i => i.id === 'sofa-anti-acaros');
  const sofaAntiAcarosPrice = Math.round(activeSofaItems.reduce((sum, i) => sum + (SOFA_ANTI_ACAROS_PRICE[i.sizeId] ?? 0) * i.qty, 0) * 100) / 100;

  const toggleSofaImper = () => {
    if (!firstSofa) return;
    setSofaItems(sofaTogglePack(sofaItems, firstSofa.sizeId));
  };
  const toggleSofaAntiAcaros = () => {
    setUpsellItems(prev => sofaAntiAcarosOn
      ? prev.filter(i => i.id !== 'sofa-anti-acaros')
      : [...prev, { id: 'sofa-anti-acaros', price: sofaAntiAcarosPrice, label: 'Anti Ácaros (sofá)' }]);
  };

  // ── Cadeiras ────────────────────────────────────────────────────────────
  const chairQtyNum = parseInt(formData.chairQuantity) || 0;
  const chairImperOn = formData.chairWaterproofing;
  const chairImperPriceRaw = isWaterproofBase ? calcChairClean(chairQtyNum) : calcChairWaterproof(chairQtyNum);
  const chairAntiAcarosOn = upsellItems.some(i => i.id === 'chairs-anti-acaros');
  const chairAntiAcarosPriceRaw = calcChairAntiAcarosTotal(chairQtyNum);

  const toggleChairImper = () => {
    updateFormData({
      chairWaterproofing: !chairImperOn,
      chairWaterproofQty: !chairImperOn ? chairQtyNum : 0,
      waterproofingTier: 'essencial',
    });
  };
  const toggleChairAntiAcaros = () => {
    setUpsellItems(prev => chairAntiAcarosOn
      ? prev.filter(i => i.id !== 'chairs-anti-acaros')
      : [...prev, { id: 'chairs-anti-acaros', price: chairAntiAcarosPriceRaw ?? 0, label: 'Anti Ácaros (cadeiras)' }]);
  };

  // ── Colchão ─────────────────────────────────────────────────────────────
  const activeMattressItems = mattressItems.filter(i => i.qty > 0);
  const firstMattress = activeMattressItems[0];
  const mattressOpt = firstMattress ? mattressPrices.find(p => p.id === firstMattress.sizeId) : undefined;
  const mattressPack = mattressOpt ? calcPackPricing(mattressOpt, firstMattress?.packEnabled ?? false, isWaterproofBase, 30) : null;
  const mattressPackOn = firstMattress?.packEnabled ?? false;

  const toggleMattressPack = () => {
    if (!firstMattress) return;
    setMattressItems(mattressTogglePack(mattressItems, firstMattress.sizeId));
  };

  const imperLabel = isWaterproofBase ? 'Higienização' : 'Impermeabilização';

  return (
    <div className="flex flex-col w-full items-center text-center py-2">
      <p className="text-gold text-[11px] font-bold tracking-[0.28em] uppercase mb-2">Quase Lá</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3 leading-[1.15]">
        A um passo dos <span className="text-gold" style={{ textShadow: '0 0 18px rgba(212,175,55,0.55)' }}>{minOrderValue}€</span>
      </h2>
      <p className="text-[13px] text-white/50 max-w-[280px] mx-auto mb-6 leading-relaxed">
        Já vamos estar em sua casa. Junte mais um serviço ao mesmo pedido e aproveite a mesma deslocação.
        {' '}Faltam só <span className="text-gold font-bold">{amountToMinimum % 1 === 0 ? amountToMinimum : amountToMinimum.toFixed(2).replace('.', ',')}€</span>.
      </p>

      <div className="w-full max-w-xs flex flex-col gap-2 mb-4">
        {(service === 'sofa') && sofaOpt && sofaPack && sofaPack.packDelta !== null && (
          <AddonChip
            icon={Droplet}
            title={`Adicionar ${imperLabel}`}
            subtitle="Proteção 2 anos incluída"
            priceLabel={`+${sofaPack.packDelta}€`}
            active={sofaImperOn}
            onClick={toggleSofaImper}
          />
        )}
        {(service === 'sofa') && activeSofaItems.length > 0 && sofaAntiAcarosPrice > 0 && (
          <AddonChip
            icon={Bug}
            title="Adicionar Anti Ácaros"
            subtitle="Elimina ácaros e alergénios"
            priceLabel={`+${sofaAntiAcarosPrice}€`}
            active={sofaAntiAcarosOn}
            onClick={toggleSofaAntiAcaros}
          />
        )}

        {(service === 'chairs') && chairQtyNum > 0 && chairImperPriceRaw !== null && (
          <AddonChip
            icon={Droplet}
            title={`Adicionar ${imperLabel}`}
            subtitle="Proteção Essencial"
            priceLabel={`+${chairImperPriceRaw}€`}
            active={chairImperOn}
            onClick={toggleChairImper}
          />
        )}
        {(service === 'chairs') && chairQtyNum > 0 && chairAntiAcarosPriceRaw !== null && chairAntiAcarosPriceRaw > 0 && (
          <AddonChip
            icon={Bug}
            title="Adicionar Anti Ácaros"
            subtitle="7,5€ por cadeira"
            priceLabel={`+${chairAntiAcarosPriceRaw}€`}
            active={chairAntiAcarosOn}
            onClick={toggleChairAntiAcaros}
          />
        )}

        {(service === 'mattress') && mattressOpt && mattressPack && mattressPack.packDelta !== null && (
          <AddonChip
            icon={Bug}
            title={isWaterproofBase ? 'Adicionar Higienização Profunda' : 'Adicionar Anti Ácaros'}
            subtitle="Tratamento anti ácaros"
            priceLabel={`+${mattressPack.packDelta}€`}
            active={mattressPackOn}
            onClick={toggleMattressPack}
          />
        )}

        {service === 'carpet' && (
          <p className="text-[12px] text-white/35 leading-relaxed px-2">
            Experimente adicionar cadeiras, um colchão ou outro tapete ao mesmo pedido.
          </p>
        )}
      </div>

      <div className="w-full max-w-xs flex items-center gap-3 mb-4">
        <span className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-[10px] tracking-[0.1em] uppercase text-white/25">ou</span>
        <span className="flex-1 h-px bg-white/[0.08]" />
      </div>

      <button
        onClick={onOpenFullUpsell}
        className="w-full max-w-xs h-[50px] flex items-center justify-center gap-2 rounded-sm border-[1.5px] border-gold/50 text-gold text-[12.5px] font-bold uppercase tracking-wider hover:bg-gold/[0.08] hover:border-gold active:scale-[0.98] transition-all touch-manipulation mb-3"
      >
        <Plus className="w-[13px] h-[13px]" strokeWidth={2.6} />
        Adicionar Outro Serviço
      </button>

      <button
        onClick={onContinue}
        disabled={belowMinimum}
        className="w-full max-w-xs h-12 flex items-center justify-center gap-1.5 text-white font-bold transition-all touch-manipulation border border-white/30 bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-25 disabled:pointer-events-none rounded-sm active:scale-[0.98] text-sm mb-2"
      >
        Continuar
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-white/35 hover:text-white/60 active:text-white/60 transition-colors touch-manipulation py-1"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Voltar e alterar quantidades
      </button>
    </div>
  );
};

export default QuizMinimumGate;
