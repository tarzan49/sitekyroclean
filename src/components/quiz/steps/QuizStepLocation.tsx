import { useRef } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { locationPrices } from '@/components/quiz/QuizTypes';

interface QuizStepLocationProps {
  location: string;
  locationQuery: string;
  setLocationQuery: (q: string) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  /** Called when user selects any city (card or search result). Handles formData update + step advance. */
  onCitySelect: (city: string) => void;
}

const QuizStepLocation = ({
  location,
  locationQuery,
  setLocationQuery,
  scrollContainerRef,
  onCitySelect,
}: QuizStepLocationProps) => {
  const locationInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', textAlign: 'center' }}
      className="flex-1"
    >
      {!locationQuery && (
        <>
          <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1">LOCALIZAÇÃO</p>
          <h2 className="font-playfair text-lg sm:text-2xl font-bold text-white mb-1 leading-tight">
            Onde está localizado?
          </h2>
          <p className="text-[11px] text-white/35 mb-3">
            Para calcular deslocação e disponibilidade.
          </p>
        </>
      )}

      {!location && (
        <div className="w-full max-w-sm flex flex-col gap-2.5">
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Pesquisar outra cidade..."
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setTimeout(() => {
                  if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
                }, 30);
              }}
              onFocus={() => {
                const reset = () => { if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0; };
                reset();
                setTimeout(reset, 100);
                setTimeout(reset, 300);
                setTimeout(reset, 500);
              }}
              autoComplete="off"
              inputMode="search"
              className="w-full h-12 pl-9 pr-4 text-sm bg-[#1a2a1a] border border-gold/20 focus:border-gold focus:outline-none rounded-xl transition-colors text-white placeholder:text-white/30"
            />
          </div>

          {!locationQuery && (
            <div className="flex flex-col gap-2">
              {[
                { city: 'Porto',  img: '/cities/porto.webp'  },
                { city: 'Lisboa', img: '/cities/lisboa.webp' },
                { city: 'Braga',  img: '/cities/braga.webp'  },
              ].map(({ city, img }) => {
                const isSelected = location === city;
                return (
                  <button
                    key={city}
                    onClick={() => {
                      setLocationQuery(city);
                      onCitySelect(city);
                    }}
                    className={cn(
                      'relative w-full h-[64px] sm:h-[72px] rounded-2xl overflow-hidden transition-all duration-200 touch-manipulation active:scale-[0.98]',
                      isSelected
                        ? 'ring-4 ring-gold shadow-[0_0_24px_rgba(212,175,55,0.45)]'
                        : 'hover:ring-2 hover:ring-gold/40 shadow-[0_2px_12px_rgba(0,0,0,0.4)]'
                    )}
                  >
                    <img src={img} alt={city} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/55" />
                    <div className="relative z-10 flex flex-col items-center justify-center h-full gap-0.5">
                      <span className="font-playfair text-xl font-bold text-white drop-shadow-md">{city}</span>
                      <span className="text-xs text-white/80 drop-shadow-sm">
                        {locationPrices[city] === 0 ? 'Deslocação incluída' : `+${locationPrices[city]}€ deslocação`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {locationQuery.length >= 1 && (() => {
            const q = locationQuery.toLowerCase();
            const matches = Object.keys(locationPrices).filter(c => c.toLowerCase().includes(q)).slice(0, 6);
            return matches.length > 0 ? (
              <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#1a2a1a]">
                {matches.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setLocationQuery(city);
                      onCitySelect(city);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gold/10 active:bg-gold/15 border-b border-white/[0.05] last:border-0 transition-colors touch-manipulation"
                  >
                    <span className="font-medium text-white text-sm">{city}</span>
                    <span className="text-[11px] text-gold/60">
                      {locationPrices[city] === 0 ? 'Deslocação grátis' : `+${locationPrices[city]}€`}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/25 text-center py-4">
                Cidade não encontrada. Tente "Porto", "Braga", "Maia"...
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default QuizStepLocation;
