import { useState, useRef, useCallback, useEffect } from "react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  orientation?: "vertical" | "horizontal";
  noFrame?: boolean;
}

const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = "Antes",
  afterLabel = "Depois",
  orientation = "vertical",
  noFrame = false,
}: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Hint animation on mount
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 800;
    const from = 50, to = 30;

    const animate = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setSliderPosition(from + (to - from) * e);
      if (p < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        start = null;
        let rf: number;
        const reverse = (ts2: number) => {
          if (!start) start = ts2;
          const p2 = Math.min((ts2 - start) / duration, 1);
          const e2 = p2 < 0.5 ? 2 * p2 * p2 : -1 + (4 - 2 * p2) * p2;
          setSliderPosition(to + (from - to) * e2);
          if (p2 < 1) rf = requestAnimationFrame(reverse);
        };
        rf = requestAnimationFrame(reverse);
        return () => cancelAnimationFrame(rf);
      }
    };

    const timeout = setTimeout(() => { frame = requestAnimationFrame(animate); }, 700);
    return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, []);

  const calcPosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = orientation === "vertical"
      ? ((clientX - rect.left)  / rect.width)  * 100
      : ((clientY - rect.top)   / rect.height) * 100;
    setSliderPosition(Math.min(Math.max(pct, 0), 100));
  }, [orientation]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    setHasInteracted(true);
    calcPosition(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) calcPosition(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      isDraggingRef.current = true;
      setIsDragging(true);
      setHasInteracted(true);
      calcPosition(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      calcPosition(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });
    el.addEventListener('touchcancel',onTouchEnd,   { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
      el.removeEventListener('touchcancel',onTouchEnd);
    };
  }, [calcPosition]);

  const isVertical = orientation === "vertical";

  const sliderInner = (
    <div
      ref={containerRef}
      className={`relative select-none touch-none cursor-grab active:cursor-grabbing overflow-hidden ${
        noFrame ? "w-full h-full" : (isVertical ? "aspect-square md:aspect-[4/3]" : "aspect-[3/4] md:aspect-[16/9]")
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* After image */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt="Depois da limpeza profissional | Kyro Clean Solutions"
          width={800} height={800}
          loading="lazy" decoding="async"
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-4 right-4 text-[11px] font-bold tracking-[0.18em] uppercase text-white bg-black/50 backdrop-blur-sm px-3 py-1.5">
          {afterLabel}
        </span>
      </div>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: isVertical
            ? `inset(0 ${100 - sliderPosition}% 0 0)`
            : `inset(0 0 ${100 - sliderPosition}% 0)`,
          willChange: "clip-path",
        }}
      >
        <img
          src={beforeImage}
          alt="Antes da limpeza profissional | Kyro Clean Solutions"
          width={800} height={800}
          loading="lazy" decoding="async"
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-4 left-4 text-[11px] font-bold tracking-[0.18em] uppercase text-white bg-black/50 backdrop-blur-sm px-3 py-1.5">
          {beforeLabel}
        </span>
      </div>

      {/* Divider + handle */}
      <div
        className="absolute top-0 bottom-0 flex items-center justify-center pointer-events-none"
        style={{
          [isVertical ? "left" : "top"]: `${sliderPosition}%`,
          transform: isVertical ? "translateX(-50%)" : "translateY(-50%)",
          width: isVertical ? undefined : "100%",
          height: isVertical ? "100%" : undefined,
          willChange: "left, top",
        }}
      >
        {/* Line */}
        <div
          className={isVertical
            ? "absolute top-0 bottom-0 w-[2px]"
            : "absolute left-0 right-0 h-[2px]"}
          style={{ background: "rgba(212,175,55,0.7)", boxShadow: "0 0 8px rgba(212,175,55,0.5)" }}
        />

        {/* Handle */}
        <div
          className={`relative z-10 flex items-center justify-center bg-white transition-transform duration-150 ${
            isDragging ? "scale-110" : ""
          }`}
          style={{
            width: 52,
            height: 52,
            border: "2px solid #D4AF37",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 0 0 4px rgba(212,175,55,0.15)",
          }}
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-[#071a12]">
            <path d="M6 5l-4 5 4 5M14 5l4 5-4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Pulse ring — only shows before first interaction */}
        {!hasInteracted && (
          <div
            className="absolute z-0 rounded-full animate-ping"
            style={{
              width: 64,
              height: 64,
              background: "rgba(212,175,55,0.2)",
              animationDuration: "1.8s",
            }}
          />
        )}
      </div>
    </div>
  );

  if (noFrame) return sliderInner;

  return (
    <div className="relative w-full">
      <div className="overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.22)]">
        {sliderInner}
      </div>
      <p className="text-center text-[11px] font-medium tracking-[0.16em] uppercase text-[#111111]/35 mt-3">
        Arraste para comparar
      </p>
    </div>
  );
};

export default BeforeAfterSlider;
