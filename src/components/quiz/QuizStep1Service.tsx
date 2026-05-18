import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizStep1ServiceProps {
  selectedService: string;
  onSelect: (service: string) => void;
}

const SERVICE_IMAGES: Record<string, string> = {
  sofa:     '/images/services/sofa.webp',
  carpet:   '/images/services/tapete.webp',
  mattress: '/images/services/colchao.webp',
  chairs:   '/images/services/cadeira.webp',
};

// object-position overrides
const IMG_POSITION: Record<string, string> = {};

const QuizStep1Service = ({ selectedService, onSelect }: QuizStep1ServiceProps) => {
  const { t } = useTranslation();

  const serviceOptions = [
    { id: 'sofa',     label: t('quiz.services.sofa') },
    { id: 'mattress', label: t('quiz.services.mattress') },
    { id: 'carpet',   label: t('quiz.services.carpet') },
    { id: 'chairs',   label: t('quiz.services.chairs') },
  ];

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
    >
      <h2 className="font-playfair text-lg sm:text-xl font-bold text-white mb-3 text-center w-full uppercase tracking-wide">
        O que precisas de limpar?
      </h2>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs sm:max-w-sm">
        {serviceOptions.map((option) => {
          const isSelected = selectedService === option.id;
          const imgPos = IMG_POSITION[option.id] ?? 'object-center';

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                "relative h-[120px] rounded-2xl overflow-hidden transition-all duration-200 touch-manipulation active:scale-[0.97]",
                isSelected
                  ? "ring-[3px] ring-gold shadow-[0_0_22px_rgba(212,175,55,0.45)]"
                  : "hover:ring-2 hover:ring-gold/35 shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
              )}
            >
              {/* Background image — dimmed on certain services */}
              <picture>
                <source srcSet={SERVICE_IMAGES[option.id]} type="image/webp" />
                <img
                  src={SERVICE_IMAGES[option.id].replace('.webp', '.png')}
                  alt={option.label}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover",
                    imgPos,
                    "opacity-100"
                  )}
                  loading="lazy"
                />
              </picture>

              {/* Gradient overlay: transparent top → deep black bottom */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80" />

              {/* Extra darkening when not selected */}
              {!isSelected && <div className="absolute inset-0 bg-black/20" />}

              {/* Gold shimmer line on top edge when selected */}
              {isSelected && (
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
              )}

              {/* Label — anchored to bottom */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center pb-2.5 px-2">
                <span className="font-playfair text-sm font-bold text-white text-center leading-tight"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                  {option.label}
                </span>
                {isSelected && (
                  <span className="text-[9px] font-black text-gold uppercase tracking-widest mt-0.5"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                    <Check className="w-3 h-3 inline mr-0.5" strokeWidth={2.5} />Selecionado
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizStep1Service;
