import { useState, useMemo } from "react";
import { Flame, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizStepCalendarProps {
  selectedSlot: string;
  onSelect: (slot: string) => void;
  cityName?: string;
}

const TIME_SLOTS = ["09:00", "14:00", "17:00"];
const DAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function makeRng(seed: number) {
  let s = seed & 0x7fffffff;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function cityHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
}

const QuizStepCalendar = ({ selectedSlot, onSelect, cityName = "Porto" }: QuizStepCalendarProps) => {
  const [today] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // 7 days starting from today
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, [today]);

  const { occupiedSlots, totalAvailable, urgencyX } = useMemo(() => {
    const now = new Date();
    const seed = cityHash(cityName) + now.getDate() * 13 + now.getMonth() * 31;
    const rand = makeRng(seed);
    const occupied = new Set<string>();

    for (let d = 0; d < 7; d++) {
      for (let t = 0; t < TIME_SLOTS.length; t++) {
        if (rand() < 0.20) {
          occupied.add(`${d}-${t}`);
        }
      }
    }

    const total = 7 * TIME_SLOTS.length - occupied.size;
    const x = 12 + Math.floor(rand() * 7);
    return { occupiedSlots: occupied, totalAvailable: total, urgencyX: x };
  }, [cityName]);

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-white mb-2">
          Escolha a sua vaga
          {cityName && cityName !== "Porto" && (
            <span className="text-sm font-normal text-gold/70 ml-2">— {cityName}</span>
          )}
        </h2>
        <div className="inline-flex items-center gap-1.5 bg-red-900/30 border border-red-500/25 rounded-full px-3 py-1.5">
          <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse flex-shrink-0" />
          <span className="text-xs font-semibold text-red-300/90">
            Alta procura · Apenas {urgencyX} vagas disponíveis
          </span>
        </div>
      </div>

      {/* Calendar grid, 7 cols, no overflow */}
      <div className="w-full">
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, dayIdx) => {
            const isPast = day < today;
            return (
              <div key={dayIdx} className="flex flex-col gap-1">
                {/* Day header */}
                <div className="text-center pb-1 border-b border-white/[0.07]">
                  <div className="text-[9px] sm:text-[10px] font-bold text-white/35 uppercase tracking-wide">
                    {DAY_SHORT[day.getDay()]}
                  </div>
                  <div className={cn(
                    "text-xs sm:text-sm font-bold mt-0.5",
                    isPast ? "text-white/20" : "text-white/80"
                  )}>
                    {day.getDate()}
                  </div>
                </div>

                {/* Time slots */}
                {TIME_SLOTS.map((time, timeIdx) => {
                  const slotKey = `${dayIdx}-${timeIdx}`;
                  const isOccupied = occupiedSlots.has(slotKey) || isPast;
                  const isSelected = selectedSlot === slotKey;

                  return (
                    <button
                      key={timeIdx}
                      onClick={!isOccupied ? () => onSelect(slotKey) : undefined}
                      disabled={isOccupied}
                      className={cn(
                        "rounded-lg py-1.5 px-0.5 text-[8px] sm:text-[9px] font-semibold text-center transition-all duration-200 touch-manipulation leading-tight",
                        isSelected
                          ? "bg-gold text-[#12121e] shadow-md scale-105 ring-1 ring-gold/50"
                          : !isOccupied
                          ? "bg-[#252931] text-gold/80 border border-gold/25 hover:bg-[#252a18] hover:text-gold cursor-pointer hover:scale-[1.04] active:scale-100"
                          : "bg-[#141618] text-white/15 cursor-not-allowed"
                      )}
                    >
                      {isOccupied ? (isPast ? "—" : "Ocup.") : time}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/35">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#252931] border border-gold/25 inline-block flex-shrink-0" />
          Disponível
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#141618] inline-block flex-shrink-0" />
          Ocupado
        </span>
        {selectedSlot && (
          <span className="flex items-center gap-1.5 text-gold font-semibold">
            <span className="w-2.5 h-2.5 rounded bg-gold inline-block flex-shrink-0" />
            Selecionada
          </span>
        )}
      </div>

      {selectedSlot && (
        <p className="text-center text-xs text-green-300/80 bg-green-900/20 border border-green-500/20 rounded-xl px-3 py-2 mt-3 font-medium">
          <Check className="w-3.5 h-3.5 inline mr-1 text-green-300" strokeWidth={2.5} />Vaga reservada, confirme os seus dados no próximo passo
        </p>
      )}

      <p className="text-center text-[10px] text-white/20 mt-2">
        {totalAvailable} vagas disponíveis esta semana
      </p>
    </div>
  );
};

export default QuizStepCalendar;
