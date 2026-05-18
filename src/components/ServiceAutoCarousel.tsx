import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselSlide {
  src?: string;
  node?: React.ReactNode;
  label?: string;
  objectPosition?: string;
}

interface ServiceAutoCarouselProps {
  slides: CarouselSlide[];
  title?: string;
  variant?: "light" | "dark";
}

const INTERVAL_MS = 6000;

const ServiceAutoCarousel = ({
  slides,
  title = "Resultados Reais",
  variant = "dark",
}: ServiceAutoCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, INTERVAL_MS);
  }, [slides.length]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    startTimer();
  }, [startTimer]);

  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);

  return (
    <section className={`py-10 md:py-12 ${variant === "light" ? "bg-[#FDFDF9]" : "bg-kyro-green"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-5">
          <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>{title}</p>
        </div>

        <div
          className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden border border-gold/10"
          style={{
            height: "clamp(220px, 35vw, 380px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.65)",
          }}
        >
          {/* Slides */}
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {slide.node ? (
                <div className="w-full h-full overflow-hidden">
                  {slide.node}
                </div>
              ) : (
                <>
                  <img
                    src={slide.src}
                    alt={slide.label ?? title}
                    className="w-full h-full object-cover"
                    style={slide.objectPosition ? { objectPosition: slide.objectPosition } : undefined}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2F2A]/55 via-transparent to-transparent pointer-events-none" />
                </>
              )}
              {slide.label && !slide.node && (
                <div className="absolute top-4 left-4 z-20 bg-kyro-green/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-gold/30">
                  {slide.label}
                </div>
              )}
            </div>
          ))}

          {/* Arrow buttons */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Imagem anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-sm border border-white/15 text-white transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Próxima imagem"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-sm border border-white/15 text-white transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Progress dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Imagem ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "bg-gold w-7" : "bg-white/30 w-2 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceAutoCarousel;
