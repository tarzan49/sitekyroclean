/**
 * QuizStep0Location.tsx
 * Step 0 of the Kyro quiz: city / location selection.
 * Shows photo cards for Porto / Lisboa / Braga, plus a free-text fallback.
 */

import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { locationPrices } from '@/components/quiz/QuizTypes';

interface QuizStep0LocationProps {
  /** Currently selected location (empty string = nothing selected yet). */
  location: string;
  /** Current free-text query entered by the user. */
  locationQuery: string;
  /** Setter for the free-text query. */
  setLocationQuery: (q: string) => void;
  /** Called when a city is confirmed — updates formData.location. */
  onSelectLocation: (city: string) => void;
  /** Called when a city card is clicked — auto-advances to step 1. */
  onCityCardClick: (city: string) => void;
}

/**
 * Location picker step.
 * Renders three hero city cards and a search-as-you-type fallback list.
 * Auto-advances on card click so the user doesn't need a second tap.
 */
const QuizStep0Location = ({
  location,
  locationQuery,
  setLocationQuery,
  onSelectLocation,
  onCityCardClick,
}: QuizStep0LocationProps) => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', textAlign: 'center' }}
      className="flex-1"
    >
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-3">PASSO 1 DE 3</p>
      <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-1 leading-[1.3]">
        Onde está localizado?
      </h2>
      <p className="text-xs text-white/35 mb-6">
        Para calcular deslocação e disponibilidade da equipa.
      </p>

      {!location && (
        <div className="w-full max-w-sm">
          {/* Hero city cards */}
          <div className="flex flex-col gap-3 mb-5">
            {(
              [
                { city: 'Porto',  img: '/cities/porto.webp'  },
                { city: 'Lisboa', img: '/cities/lisboa.webp' },
                { city: 'Braga',  img: '/cities/braga.webp'  },
              ] as const
            ).map(({ city, img }) => {
              const isSelected = location === city;
              return (
                <button
                  key={city}
                  onClick={() => onCityCardClick(city)}
                  className={cn(
                    'relative w-full h-[88px] rounded-2xl overflow-hidden transition-all duration-200 touch-manipulation active:scale-[0.98]',
                    isSelected
                      ? 'ring-4 ring-gold shadow-[0_0_24px_rgba(212,175,55,0.45)]'
                      : 'hover:ring-2 hover:ring-gold/40 shadow-[0_2px_12px_rgba(0,0,0,0.4)]',
                  )}
                >
                  <img src={img} alt={city} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/55" />
                  <div className="relative z-10 flex flex-col items-center justify-center h-full gap-0.5">
                    <span className="font-playfair text-xl font-bold text-white drop-shadow-md">{city}</span>
                    <span className="text-xs text-white/80 drop-shadow-sm">
                      {locationPrices[city] === 0
                        ? 'Deslocação incluída'
                        : `+${locationPrices[city]}€ deslocação`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-white/30 text-center mb-2">
            Não encontra a sua cidade? Escreva aqui:
          </p>

          <div className="relative mb-3">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Nome da cidade..."
              value={locationQuery}
              onChange={e => setLocationQuery(e.target.value)}
              className="w-full h-12 pl-9 pr-4 text-sm bg-white/[0.06] border border-white/15 focus:border-gold focus:outline-none rounded-xl transition-colors text-white placeholder:text-white/25"
            />
          </div>
        </div>
      )}

      {/* Search results dropdown */}
      {locationQuery.length >= 1 && !location && (() => {
        const q = locationQuery.toLowerCase();
        const matches = Object.keys(locationPrices).filter(c => c.toLowerCase().includes(q)).slice(0, 6);
        return (
          <div className="w-full max-w-sm mx-auto mb-2">
            {matches.length > 0 ? (
              <div className="border border-white/[0.08] rounded-xl overflow-hidden mb-4 bg-[#1A1A2E]">
                {matches.map(city => (
                  <button
                    key={city}
                    onClick={() => onSelectLocation(city)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gold/10 active:bg-gold/15 border-b border-white/[0.05] last:border-0 transition-colors touch-manipulation"
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
                Cidade não encontrada. Tente &quot;Porto&quot;, &quot;Braga&quot;, &quot;Maia&quot;...
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default QuizStep0Location;
