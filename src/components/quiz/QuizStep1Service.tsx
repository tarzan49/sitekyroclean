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

const QuizStep1Service = ({ onSelect }: QuizStep1ServiceProps) => {
  const serviceOptions = [
    { id: 'sofa',     label: 'Sofá',     sublabel: 'a partir de 49€' },
    { id: 'mattress', label: 'Colchão',  sublabel: 'a partir de 59€' },
    { id: 'carpet',   label: 'Tapete',   sublabel: 'a partir de 15€/m²' },
    { id: 'chairs',   label: 'Cadeiras', sublabel: 'a partir de 20€' },
  ];

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
    >
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1 text-center w-full">SERVIÇO</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3 text-center w-full">
        O que precisa de limpar?
      </h2>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs sm:max-w-sm">
        {serviceOptions.map((option) => {
          const imgPos = IMG_POSITION[option.id] ?? 'object-center';

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="relative h-[148px] sm:h-[164px] rounded-sm overflow-hidden transition-all duration-200 touch-manipulation active:scale-[0.97] hover:ring-2 hover:ring-gold/35 shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
            >
              {/* Background image, dimmed on certain services */}
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
              <div className="absolute inset-0 bg-black/20" />

              {/* Label, anchored to bottom */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center pb-2.5 px-2">
                <span className="font-playfair text-[15px] font-bold text-white text-center leading-tight"
                  style={{ textShadow: '0 1px 8px rgba(0,0,0,0.95)' }}>
                  {option.label}
                </span>
                <span className="text-[11px] text-gold/80 leading-none mt-0.5"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                  {option.sublabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizStep1Service;
