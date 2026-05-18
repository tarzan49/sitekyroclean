import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Navigation, X } from "lucide-react";
import { cities } from "@/data/locationSeoData";

type City = (typeof cities)[number];

// Approximate coordinates per city slug for geolocation nearest-match
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  porto: { lat: 41.1579, lng: -8.6291 },
  matosinhos: { lat: 41.1839, lng: -8.6953 },
  maia: { lat: 41.2357, lng: -8.62 },
  "vila-nova-de-gaia": { lat: 41.1239, lng: -8.6096 },
  gondomar: { lat: 41.15, lng: -8.5333 },
  valongo: { lat: 41.1833, lng: -8.4983 },
  "povoa-de-varzim": { lat: 41.3834, lng: -8.7651 },
  "vila-do-conde": { lat: 41.3536, lng: -8.7479 },
  paredes: { lat: 41.2046, lng: -8.3306 },
  penafiel: { lat: 41.2057, lng: -8.2826 },
  lousada: { lat: 41.2802, lng: -8.283 },
  "pacos-de-ferreira": { lat: 41.2758, lng: -8.3832 },
  felgueiras: { lat: 41.3588, lng: -8.1958 },
  "santo-tirso": { lat: 41.343, lng: -8.4749 },
  trofa: { lat: 41.3345, lng: -8.5568 },
  espinho: { lat: 41.0076, lng: -8.6417 },
  arouca: { lat: 40.9313, lng: -8.2454 },
  braga: { lat: 41.5454, lng: -8.4265 },
  guimaraes: { lat: 41.4423, lng: -8.2943 },
  lisboa: { lat: 38.7169, lng: -9.1395 },
  cascais: { lat: 38.6979, lng: -9.4215 },
  oeiras: { lat: 38.6847, lng: -9.3163 },
  sintra: { lat: 38.8029, lng: -9.3817 },
  almada: { lat: 38.6796, lng: -9.1571 },
  setubal: { lat: 38.5243, lng: -8.8882 },
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestCity(lat: number, lng: number): City {
  let nearest: City = cities[0];
  let minDist = Infinity;
  for (const city of cities) {
    const coords = CITY_COORDS[city.slug];
    if (!coords) continue;
    const dist = haversine(lat, lng, coords.lat, coords.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }
  return nearest;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (cityName: string, citySlug: string | null) => void;
  placeholder?: string;
}

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Ex: Porto, Matosinhos, Braga...",
}: LocationAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCities = cities as unknown as City[];

  const openWithAll = () => {
    setSuggestions(allCities);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const filterSuggestions = useCallback(
    (val: string) => {
      if (val.length === 0) {
        setSuggestions(allCities);
        setIsOpen(true);
        return;
      }
      const lower = val.toLowerCase();
      const filtered = allCities.filter((c) =>
        c.name.toLowerCase().includes(lower)
      );
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    },
    [allCities]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setActiveIndex(-1);
    filterSuggestions(val);
    onChange(val, null);
  };

  const handleSelectCity = (city: City) => {
    setInputValue(city.name);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    onChange(city.name, city.slug);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearestCity(
          pos.coords.latitude,
          pos.coords.longitude
        );
        handleSelectCity(nearest);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { timeout: 8000 }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelectCity(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue("");
    onChange("", null);
    setSuggestions(allCities);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-0">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={openWithAll}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          aria-label="Selecionar localidade"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-activedescendant={
            activeIndex >= 0 ? `location-option-${activeIndex}` : undefined
          }
          className="w-full pl-9 pr-16 py-3 text-[#1A1A2E] font-semibold bg-[#f8f6f0] rounded-xl border border-gold/20 hover:border-gold/50 focus:border-gold/60 transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm placeholder:text-[#1A1A2E]/40 placeholder:font-normal"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-[#1A1A2E]/30 hover:text-[#1A1A2E]/60 transition-colors rounded-lg"
              aria-label="Limpar localidade"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            title="Usar localização atual"
            aria-label="Usar localização atual"
            className="p-1.5 text-gold hover:text-[#1A1A2E] disabled:opacity-40 transition-colors rounded-lg"
          >
            <Navigation
              className={`w-4 h-4 ${isLocating ? "animate-pulse" : ""}`}
            />
          </button>
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Localidades disponíveis"
          className="absolute top-full left-0 right-0 mt-1 bg-[#FFFFFF] border border-gold/20 rounded-xl shadow-large z-50 overflow-hidden max-h-52 overflow-y-auto"
        >
          {suggestions.map((city, idx) => (
            <li key={city.slug} id={`location-option-${idx}`} role="option" aria-selected={idx === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectCity(city);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors ${
                  idx === activeIndex
                    ? "bg-gold/15 text-[#1A1A2E]"
                    : "text-[#1A1A2E]/80 hover:bg-gold/10"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span>{city.name}</span>
                <span className="ml-auto text-xs text-[#1A1A2E]/30 font-normal hidden sm:inline">
                  {city.region === "primary" ? "Principal" : "Disponível"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
