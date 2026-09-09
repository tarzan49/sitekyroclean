import QuizCareIntro from '../QuizCareIntro';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { QuizFormData } from '@/components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium } from '@/components/quiz/quizHelpers';
import { WHATSAPP_BASE } from '@/constants/business';
import { WaterproofingTierPicker } from './WaterproofingTierPicker';

interface Props {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
}

// Extraído de QuizStepConfig.tsx (2026-09-08, thinning do ficheiro monolítico
// de 417 linhas que misturava sofá/colchão/tapete/cadeiras no mesmo
// componente — editar cadeiras arriscava um copy-paste error no bloco quase
// idêntico do sofá, já causou pelo menos um bug real nesta sessão).
const QuizStepConfigChairs = ({ formData, updateFormData }: Props) => {
  // Ver o mesmo padrão em QuizStepConfigSofa.tsx — não precisa de reset
  // manual, trocar de serviço desmonta este componente e volta a montar do
  // zero, o que já reseta este estado sozinho.
  const [tierChosen, setTierChosen] = useState(false);

  const isWaterproofPrimary = formData.serviceType === 'waterproofing';
  const isPremiumTier = formData.waterproofingTier === 'premium';
  const calcWaterproof = isPremiumTier ? calcChairWaterproofPremium : calcChairWaterproof;
  const qty = Math.max(1, parseInt(formData.chairQuantity) || 1);
  const primaryPrice = isWaterproofPrimary ? calcWaterproof(qty) : calcChairClean(qty);
  const addonEnabled = formData.chairWaterproofing;
  const addonPrice = isWaterproofPrimary ? calcChairClean(qty) : calcWaterproof(qty);
  // "Sob orçamento" tem de propagar-se ao total assim que QUALQUER preço
  // ativo (primário ou addon ligado) não tem valor fixo — nunca cair para
  // 0/ignorar o addon em silêncio (bug real: 10 cadeiras Premium dava 160€
  // porque calcChairWaterproofPremium(10) é null e `?? 0` engolia-o,
  // enquanto 9 cadeiras dava 347,5€ — um pedido maior a custar menos).
  const sob = primaryPrice === null || (addonEnabled && addonPrice === null);
  const totalChairPrice = sob ? 0 : (primaryPrice ?? 0) + (addonEnabled ? (addonPrice ?? 0) : 0);

  const setChairQty = (newQty: number) => {
    const clamped = Math.max(1, newQty);
    updateFormData({
      chairQuantity: String(clamped),
      chairType: 'bulk_full',
      ...(addonEnabled ? { chairWaterproofQty: clamped } : {}),
    });
  };

  const chairWhatsappMsg = encodeURIComponent('Olá, tenho cadeiras de um tipo diferente (sem tampo, costas ou braços) e gostava de um orçamento personalizado.');

  return (
    <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">{isWaterproofPrimary ? 'PROTEÇÃO' : 'O QUE PRECISA?'}</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">
        {isWaterproofPrimary ? 'Escolha a sua impermeabilização' : 'Detalhes das Cadeiras'}
      </h2>
      <QuizCareIntro service="chairs">Indique quantas cadeiras pretende tratar. Os cuidados adicionais são escolhidos no passo seguinte.</QuizCareIntro>
      {isWaterproofPrimary && (
        <WaterproofingTierPicker
          formData={formData}
          updateFormData={updateFormData}
          onSelect={() => setTierChosen(true)}
          activeTier={tierChosen ? formData.waterproofingTier : null}
        />
      )}
      {(!isWaterproofPrimary || tierChosen) && (
        <>
          <div className={cn(
            'w-full max-w-xs rounded-sm border px-5 py-4 text-center transition-all duration-300',
            sob ? 'bg-[#1a2a1a] border-white/20' : 'bg-[#1a2a1a] border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.10)]'
          )}>
            <p className="text-[10px] text-white/70 uppercase tracking-wider mb-1">Estimativa total</p>
            <p
              className={cn('font-playfair font-black leading-none mb-1', sob ? 'text-white/60 text-2xl' : 'text-gold text-4xl')}
              style={!sob ? { textShadow: '0 0 28px rgba(212,175,55,0.55)' } : undefined}
            >
              {sob ? 'Sob Orçamento' : `${totalChairPrice % 1 === 0 ? totalChairPrice : totalChairPrice.toFixed(1).replace('.', ',')}€`}
            </p>
            <p className="text-[10px] text-white/65">
              {sob
                ? 'O nosso especialista entra em contacto'
                : `${qty} cadeira${qty > 1 ? 's' : ''}${addonEnabled ? (isWaterproofPrimary ? ' + higienização' : ' + impermeabilização') : ''}`}
            </p>
          </div>
          <p className="text-xs text-white/40 uppercase tracking-wider text-center">Quantidade</p>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setChairQty(qty - 1)}
              disabled={qty <= 1}
              className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all touch-manipulation hover:border-gold/50"
            >−</button>
            <span className="text-4xl font-black text-gold w-10 text-center tabular-nums leading-none">{qty}</span>
            <button
              onClick={() => setChairQty(qty + 1)}
              className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50"
            >+</button>
          </div>
        </>
      )}
      {/* Upsell de Higienização (impermeabilização como serviço primário)
          passou para a página dedicada a seguir às quantidades — mesma
          lógica já aplicada ao sofá (pedido explícito 2026-09-08). */}
      {/* Aviso de tipo de cadeira: discreto de propósito, é uma exceção, não a
          regra — não deve competir visualmente com o preço/opções acima. */}
      <p className="text-[10px] text-white/20 text-center leading-snug px-2">
        Preço para cadeiras com tampo, costas e braços. Cadeira diferente?{' '}
        <a
          href={`${WHATSAPP_BASE}?text=${chairWhatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#25D366]/70 hover:text-[#25D366] underline underline-offset-2 touch-manipulation whitespace-nowrap"
        >
          Pedir no WhatsApp
        </a>
      </p>
    </div>
  );
};

export default QuizStepConfigChairs;
