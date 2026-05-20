import { useTranslation } from 'react-i18next';
import { Sofa, Sparkles, BedDouble, Armchair, LayoutGrid, HelpCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { QuizFormData } from './QuizTypes';

interface QuizStep2OtherProps {
  formData: QuizFormData;
  onUpdate: (updates: Partial<QuizFormData>) => void;
}

const QuizStep2Other = ({ formData, onUpdate }: QuizStep2OtherProps) => {
  const { t } = useTranslation();

  const multiSelectOptions = [
    { id: 'sofa',      label: t('quiz.services.sofa'),      icon: Sofa },
    { id: 'carpet',    label: t('quiz.services.carpet'),    icon: Sparkles },
    { id: 'mattress',  label: t('quiz.services.mattress'),  icon: BedDouble },
    { id: 'chairs',    label: t('quiz.services.chairs'),    icon: Armchair },
    { id: 'headboard', label: t('quiz.services.headboard'), icon: LayoutGrid },
    { id: 'other',     label: t('quiz.services.other'),     icon: HelpCircle },
  ];

  const toggleService = (serviceId: string) => {
    const current = formData.otherServices || [];
    const updated = current.includes(serviceId)
      ? current.filter(s => s !== serviceId)
      : [...current, serviceId];
    onUpdate({ otherServices: updated });
  };

  const hasOtherSelected = (formData.otherServices || []).includes('other');

  const selectedLabels = (formData.otherServices || [])
    .map(id => multiSelectOptions.find(o => o.id === id)?.label)
    .filter(Boolean)
    .join(' + ');

  return (
    <div className="flex-1 flex flex-col items-center w-full gap-3.5 overflow-y-auto">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
      <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">
        {t('quiz.step2.otherTitle', 'Detalhes do Serviço')}
      </h2>

      {/* Multi-select grid */}
      <div className="w-full max-w-sm mx-auto space-y-2">
        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider text-center">
          {t('quiz.step2.selectMultiple', 'Seleciona o que precisas (podes escolher vários):')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {multiSelectOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = (formData.otherServices || []).includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleService(option.id)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all touch-manipulation active:scale-[0.98]",
                  isSelected
                    ? "border-gold bg-gold/10 shadow-[0_0_10px_rgba(212,175,55,0.12)]"
                    : "border-white/[0.09] bg-white/[0.03] hover:border-gold/30"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isSelected ? "text-gold" : "text-white/40"
                )} />
                <span className={cn(
                  "text-xs sm:text-sm font-medium",
                  isSelected ? "text-white" : "text-white/70"
                )}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time selection summary */}
      {selectedLabels && (
        <div className="w-full max-w-sm mx-auto px-3 py-2 bg-gold/[0.07] border border-gold/20 rounded-xl text-center">
          <p className="text-xs text-white/60">
            <span className="inline-flex items-center gap-1 font-semibold text-white/80"><Check className="w-3 h-3 text-gold" strokeWidth={2.5} />{t('quiz.step2.youWantToClean', 'Pretendes limpar:')} </span>
            <span className="text-gold font-semibold">{selectedLabels}</span>
          </p>
        </div>
      )}

      {/* Description, required only when 'other' is checked */}
      {hasOtherSelected && (
        <div className="w-full max-w-sm mx-auto space-y-2">
          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider text-center">
            {t('quiz.step2.describeExactly', 'Descreve exatamente o que precisas de limpar:')} *
          </label>
          <Textarea
            placeholder={t('quiz.step2.otherPlaceholder', 'Ex: 2 sofás de 3 lugares, 1 colchão de casal e 4 cadeiras de sala')}
            value={formData.otherDescription}
            onChange={(e) => onUpdate({ otherDescription: e.target.value })}
            className="min-h-[80px] text-base bg-white/[0.06] border-white/15 text-white placeholder:text-white/25 focus-visible:ring-gold resize-none"
          />
          {formData.otherDescription.trim().length > 0 && formData.otherDescription.trim().length < 3 && (
            <p className="text-xs text-red-400/80 text-center">{t('quiz.step2.minChars', 'Mínimo 3 caracteres')}</p>
          )}
        </div>
      )}

      {/* Always-visible details / quantities field */}
      <div className="w-full max-w-sm mx-auto space-y-2">
        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider text-center">
          Deseja adicionar mais detalhes ou quantidades?
        </label>
        <Textarea
          placeholder="Ex: 3 cadeirinhas de bebé, 1 banco de carro..."
          value={formData.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="min-h-[72px] text-sm bg-white/[0.06] border-white/15 text-white placeholder:text-white/25 focus-visible:ring-gold resize-none"
        />
      </div>
    </div>
  );
};

export default QuizStep2Other;
