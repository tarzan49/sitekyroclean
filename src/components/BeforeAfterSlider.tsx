import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

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
  beforeLabel,
  afterLabel,
  orientation = "vertical",
  noFrame = false,
}: BeforeAfterSliderProps) => {
  const { t } = useTranslation();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const defaultBeforeLabel = beforeLabel || t('slider.before', 'Antes');
  const defaultAfterLabel  = afterLabel  || t('slider.after',  'Depois');

  // Hint animation on mount
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 900;
    const from = 50, to = 32;

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

    const timeout = setTimeout(() => { frame = requestAnimationFrame(animate); }, 900);
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

  // Mouse events (desktop), fine as synthetic
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    calcPosition(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) calcPosition(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Touch events, must be non-passive to call preventDefault and block page scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      isDraggingRef.current = true;
      setIsDragging(true);
      calcPosition(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      // Prevent page scroll while dragging slider
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
      className={`relative ${noFrame ? "w-full h-full" : (isVertical ? "aspect-[4/3]" : "aspect-[16/9]")} overflow-hidden select-none cursor-grab active:cursor-grabbing touch-none`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* After image (background) */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt="Depois da limpeza profissional | Kyro Clean Solutions"
          width={800} height={600}
          loading="lazy" decoding="async"
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-3 right-3 text-[11px] font-semibold tracking-widest uppercase text-white/90 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {defaultAfterLabel}
        </span>
      </div>

      {/* Before image (clipped foreground) */}
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
          width={800} height={600}
          loading="lazy" decoding="async"
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-3 left-3 text-[11px] font-semibold tracking-widest uppercase text-white/90 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {defaultBeforeLabel}
        </span>
      </div>

      {/* Divider line + handle */}
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
            ? "absolute top-0 bottom-0 w-px bg-white/60"
            : "absolute left-0 right-0 h-px bg-white/60"}
          style={{ boxShadow: "0 0 6px rgba(212,175,55,0.45)" }}
        />

        {/* Handle */}
        <div
          className={`relative z-10 flex items-center justify-center rounded-full bg-white border border-[#D4AF37]/50 shadow-[0_2px_16px_rgba(0,0,0,0.22)] transition-transform duration-150 ${
            isDragging ? "scale-110 shadow-[0_4px_20px_rgba(212,175,55,0.35)]" : ""
          }`}
          style={{ width: 44, height: 44 }}
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-[#0B2F2A]">
            <path d="M7 5l-4 5 4 5M13 5l4 5-4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );

  if (noFrame) return sliderInner;

  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/8">
        {sliderInner}
      </div>
      <p className="text-center text-xs text-[#1A1A2E]/40 mt-3 tracking-wide">
        {t('slider.instruction', 'Arraste para comparar')}
      </p>
    </div>
  );
};

export default BeforeAfterSlider;
