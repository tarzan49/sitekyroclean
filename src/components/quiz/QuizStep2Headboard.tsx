import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { QuizFormData } from './QuizTypes';

interface QuizStep2HeadboardProps {
  formData: QuizFormData;
  onUpdate: (updates: Partial<QuizFormData>) => void;
}

const QuizStep2Headboard = ({ formData, onUpdate }: QuizStep2HeadboardProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col items-center w-full gap-4 overflow-hidden">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
      <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">
        {t('quiz.step2.headboardTitle', 'Detalhes da Cabeceira')}
      </h2>

      <div className="w-full max-w-sm mx-auto space-y-3">
        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider text-center">
          {t('quiz.step2.headboardDesc', 'Descreve o que precisas de limpar:')}
        </label>
        <Textarea
          placeholder={t('quiz.step2.headboardPlaceholder', 'Ex: Cabeceira de tecido cinza, 160cm de largura')}
          value={formData.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="min-h-[100px] text-base bg-white/[0.06] border-white/15 text-white placeholder:text-white/25 focus-visible:ring-gold resize-none"
        />
        <p className="text-xs text-white/35 leading-relaxed text-center">
          {t('quiz.step2.headboardTip', 'Indica o material, cor e dimensões aproximadas para um orçamento mais preciso.')}
        </p>
      </div>

      {/* Waterproofing upsell toggle */}
      <button
        onClick={() => onUpdate({ headboardWaterproofing: !formData.headboardWaterproofing })}
        className={cn(
          "relative w-full max-w-sm mx-auto rounded-xl border-2 px-3.5 py-2.5 text-left transition-all duration-300 touch-manipulation active:scale-[0.99]",
          formData.headboardWaterproofing
            ? "border-gold bg-gold/10 shadow-[0_0_16px_rgba(212,175,55,0.22)]"
            : "border-white/[0.12] bg-white/[0.03] hover:border-gold/40"
        )}
      >
        <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase shadow-md">
          RECOMENDADO
        </span>
        <div className="flex items-center gap-3">
          <Shield className={cn("w-5 h-5 flex-shrink-0", formData.headboardWaterproofing ? "text-gold" : "text-white/30")} />
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-bold leading-snug", formData.headboardWaterproofing ? "text-white" : "text-white/75")}>
              Proteger contra manchas e líquidos?
            </p>
            <p className={cn("text-[10px] mt-0.5", formData.headboardWaterproofing ? "text-white/50" : "text-white/30")}>
              Impermeabilização · +10€ por estrado
            </p>
          </div>
          <div className={cn(
            "w-10 h-5 rounded-full border-2 flex items-center transition-all duration-300 flex-shrink-0 px-0.5",
            formData.headboardWaterproofing ? "border-gold bg-gold/20" : "border-white/20 bg-white/[0.05]"
          )}>
            <div className={cn(
              "w-4 h-4 rounded-full transition-all duration-300",
              formData.headboardWaterproofing ? "bg-gold translate-x-[18px]" : "bg-white/30 translate-x-0"
            )} />
          </div>
        </div>
      </button>
    </div>
  );
};

export default QuizStep2Headboard;
