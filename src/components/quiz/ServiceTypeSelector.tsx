import { Sparkles, Shield, Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceTypeSelectorProps {
  selectedType: 'cleaning' | 'waterproofing' | 'both' | '';
  onSelect: (type: 'cleaning' | 'waterproofing' | 'both') => void;
  cleaningPrice?: number;
  waterproofingPrice?: number;
  packPrice?: number;
  waterproofingDesc?: string;
}

const ServiceTypeSelector = ({
  selectedType,
  onSelect,
  cleaningPrice,
  waterproofingPrice,
  packPrice,
  waterproofingDesc = 'Ideal para estofos novos ou recém-limpos.',
}: ServiceTypeSelectorProps) => {
  const options = [
    {
      id: 'cleaning' as const,
      icon: Sparkles,
      title: 'Higienização Profunda',
      badge: 'MAIS PEDIDO',
      badgeStyle: 'gold' as const,
      desc: 'Remoção de manchas, odores e ácaros.',
      price: cleaningPrice,
      recommended: false,
    },
    {
      id: 'waterproofing' as const,
      icon: Shield,
      title: 'Impermeabilização Premium',
      badge: 'RECOMENDADO',
      badgeStyle: 'silver' as const,
      desc: waterproofingDesc,
      price: waterproofingPrice,
      recommended: false,
    },
    {
      id: 'both' as const,
      icon: Star,
      title: 'PACK PROTEÇÃO TOTAL',
      badge: undefined,
      badgeStyle: undefined,
      desc: 'Limpeza Profunda + Impermeabilização Premium',
      subdesc: 'A melhor qualidade do mercado com desconto de pack apenas hoje.',
      price: packPrice,
      recommended: true,
    },
  ];

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-sm mx-auto self-center">
      {options.filter(opt => opt.id !== 'both' || packPrice !== undefined).map((opt) => {
        const Icon = opt.icon;
        const isSelected = selectedType === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={cn(
              "relative w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 touch-manipulation active:scale-[0.98]",
              opt.recommended
                ? isSelected
                  ? "border-[#D4AF37] shadow-[0_0_28px_rgba(212,175,55,0.30)] bg-[#1a2a1a]"
                  : "border-[#D4AF37]/50 bg-[#1a2a1a] hover:border-[#D4AF37]/75 ring-1 ring-gold/20"
                : isSelected
                  ? "border-gold bg-[#1a2a1a] shadow-[0_0_16px_rgba(212,175,55,0.16)]"
                  : "border-gold/20 bg-[#1a2a1a] hover:border-gold/45",
              opt.recommended && "mt-2"
            )}
          >
            {/* O MAIS SOLICITADO badge */}
            {opt.recommended && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C9A84C] to-[#F0DC8A] text-[#12121e] text-[8px] font-black px-3 py-0.5 rounded-full tracking-widest uppercase shadow-md whitespace-nowrap">
                O MAIS SOLICITADO
              </span>
            )}

            {/* Icon, only for recommended pack */}
            {opt.recommended && (
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                isSelected ? "bg-gold/20" : "bg-gold/[0.10]"
              )}>
                <Icon className={cn("w-5 h-5", isSelected ? "text-gold" : "text-gold/70")} />
              </div>
            )}

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className={cn(
                  "text-sm font-bold leading-snug",
                  isSelected ? "text-white" : opt.recommended ? "text-white/90" : "text-white/80"
                )}>
                  {opt.title}
                </p>
                {opt.badge && (
                  <span className={cn(
                    "text-[7px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full leading-none flex-shrink-0",
                    opt.badgeStyle === 'gold'
                      ? "bg-gold/15 text-gold/90"
                      : "bg-white/10 text-white/50"
                  )}>
                    {opt.badge}
                  </span>
                )}
              </div>
              <p className={cn(
                "text-[11px] mt-0.5 leading-snug",
                isSelected ? "text-white/65" : "text-white/40"
              )}>
                {opt.desc}
              </p>
              {'subdesc' in opt && opt.subdesc && (
                <p className={cn(
                  "text-[10px] italic mt-0.5 leading-snug",
                  isSelected ? "text-gold/60" : "text-gold/40"
                )}>
                  {opt.subdesc}
                </p>
              )}
            </div>

            {/* Price */}
            {opt.price !== undefined && (
              <div className="flex-shrink-0 text-right ml-1">
                <p className="text-[9px] text-white/30 uppercase leading-none mb-0.5">a partir de</p>
                {opt.recommended ? (
                  <p
                    className="font-playfair text-xl font-bold tabular-nums leading-none text-gold"
                    style={{ textShadow: '0 0 18px rgba(212,175,55,0.75)' }}
                  >
                    {opt.price}€
                  </p>
                ) : (
                  <p className={cn(
                    "font-playfair text-lg font-bold tabular-nums leading-none",
                    isSelected ? "text-gold" : "text-white/55"
                  )}>
                    {opt.price}€
                  </p>
                )}
              </div>
            )}

            {/* Check indicator */}
            {isSelected && (
              <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-[#12121e]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ServiceTypeSelector;
