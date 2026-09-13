import { useState, useRef, useCallback, useEffect } from "react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  orientation?: "vertical" | "horizontal";
  noFrame?: boolean;
  // Selo discreto "Efeito ilustrativo" para pares que não são um trabalho
  // real da Kyro (pedido explícito 2026-09-09, depois de o dono confirmar
  // que 3 pares de impermeabilização são gerados por IA: "quero que faças
  // isso mas nao menciones a cena de AI" — o selo avisa que a foto é
  // ilustrativa sem explicar a origem).
  illustrative?: boolean;
  // Usado pela pool rotativa do hero (HeroBeforeAfterPool) para pausar a
  // rotação automática enquanto a pessoa está mesmo a arrastar — sem isto,
  // um par podia ser trocado a meio de uma interação real.
  onDraggingChange?: (dragging: boolean) => void;
}

const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = "Antes",
  afterLabel = "Depois",
  orientation = "vertical",
  noFrame = false,
  illustrative = false,
  onDraggingChange,
}: BeforeAfterSliderProps) => {
  // sliderPosition (state) só é a fonte de verdade para o RENDER inicial e
  // para a animação de dica ao montar — nunca é escrita a cada movimento
  // durante o próprio arrastar (ver applyPosition/setDragPosition). Antes
  // disto, cada pixel de movimento do rato passava por setState → re-render
  // completo do componente, o que em telemóveis mais fracos dava um
  // arrastar visivelmente aos solavancos (pedido explícito 2026-09-09: "o
  // mais smooth possível"). A atualização é direta e síncrona a cada evento
  // — testei também agendar por requestAnimationFrame, mas isso falha em
  // silêncio sempre que a aba/página não está em primeiro plano (o
  // navegador pausa rAF nesse caso), por isso o caminho direto é o seguro.
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const handleWrapRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const positionRef = useRef(50);
  const cancelHintRef = useRef<() => void>(() => {});

  // Escreve a posição diretamente no DOM (clip-path + posição do puxador),
  // sem passar pelo state do React.
  const applyPosition = useCallback((pct: number) => {
    const clamped = Math.min(Math.max(pct, 0), 100);
    positionRef.current = clamped;
    if (clipRef.current) {
      clipRef.current.style.clipPath = orientation === "vertical"
        ? `inset(0 ${100 - clamped}% 0 0)`
        : `inset(0 0 ${100 - clamped}% 0)`;
    }
    if (handleWrapRef.current) {
      if (orientation === "vertical") handleWrapRef.current.style.left = `${clamped}%`;
      else handleWrapRef.current.style.top = `${clamped}%`;
    }
  }, [orientation]);

  const calcPosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = orientation === "vertical"
      ? ((clientX - rect.left) / rect.width) * 100
      : ((clientY - rect.top) / rect.height) * 100;
    return Math.min(Math.max(pct, 0), 100);
  }, [orientation]);

  // Hint animation on mount — para de imediato se a pessoa começar a
  // arrastar a sério a meio (senão ficava a competir com o dedo/rato pelo
  // controlo da posição).
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    let cancelled = false;
    const duration = 800;
    const from = 50, to = 30;

    const animate = (ts: number) => {
      if (cancelled) return;
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      const pos = from + (to - from) * e;
      setSliderPosition(pos);
      applyPosition(pos);
      if (p < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        start = null;
        const reverse = (ts2: number) => {
          if (cancelled) return;
          if (!start) start = ts2;
          const p2 = Math.min((ts2 - start) / duration, 1);
          const e2 = p2 < 0.5 ? 2 * p2 * p2 : -1 + (4 - 2 * p2) * p2;
          const pos2 = to + (from - to) * e2;
          setSliderPosition(pos2);
          applyPosition(pos2);
          if (p2 < 1) frame = requestAnimationFrame(reverse);
        };
        frame = requestAnimationFrame(reverse);
      }
    };

    const timeout = setTimeout(() => { frame = requestAnimationFrame(animate); }, 700);
    cancelHintRef.current = () => { cancelled = true; clearTimeout(timeout); cancelAnimationFrame(frame); };
    return () => cancelHintRef.current();
  }, [applyPosition]);

  useEffect(() => {
    onDraggingChange?.(isDragging);
  }, [isDragging, onDraggingChange]);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    cancelHintRef.current();
    isDraggingRef.current = true;
    setIsDragging(true);
    setHasInteracted(true);
    const pct = calcPosition(clientX, clientY);
    if (pct !== undefined) applyPosition(pct);
  }, [calcPosition, applyPosition]);

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const pct = calcPosition(clientX, clientY);
    if (pct !== undefined) applyPosition(pct);
  }, [calcPosition, applyPosition]);

  const endDrag = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    // Sincroniza o state com a última posição real arrastada — sem isto,
    // um re-render por outro motivo qualquer (ex. o pai a atualizar) fazia
    // a posição "saltar" de volta ao último valor conhecido pelo state.
    setSliderPosition(positionRef.current);
  }, []);

  // Listeners de mousemove/mouseup vivem em `window`, não no próprio
  // elemento — um movimento rápido a sair da área do slider a meio de um
  // arrastar continua a ser seguido, em vez de "largar" a comparação
  // (a versão anterior usava onMouseLeave no próprio elemento, que
  // terminava o arrastar assim que o cursor saía, mesmo por um instante).
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => endDrag();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [moveDrag, endDrag]);

  const handleMouseDown = (e: React.MouseEvent) => startDrag(e.clientX, e.clientY);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => startDrag(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => endDrag();

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [startDrag, moveDrag, endDrag]);

  const isVertical = orientation === "vertical";

  const sliderInner = (
    <div
      ref={containerRef}
      className={`relative select-none touch-none cursor-grab active:cursor-grabbing overflow-hidden ${
        noFrame ? "w-full h-full" : (isVertical ? "aspect-square md:aspect-[4/3]" : "aspect-[3/4] md:aspect-[16/9]")
      }`}
      style={{ WebkitUserDrag: "none" } as React.CSSProperties}
      onMouseDown={handleMouseDown}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* After image */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt="Depois da limpeza profissional | Kyro Clean Solutions"
          width={800} height={800}
          loading="lazy" decoding="async"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-4 right-4 text-sm font-bold tracking-[0.18em] uppercase text-white bg-black/50 backdrop-blur-sm px-3 py-1.5">
          {afterLabel}
        </span>
      </div>

      {/* Before image (clipped) */}
      <div
        ref={clipRef}
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
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-4 left-4 text-sm font-bold tracking-[0.18em] uppercase text-white bg-black/50 backdrop-blur-sm px-3 py-1.5">
          {beforeLabel}
        </span>
      </div>

      {/* Divider + handle */}
      <div
        ref={handleWrapRef}
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

      {illustrative && (
        <span className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-sm font-semibold tracking-[0.12em] uppercase text-white/80 bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-sm">
          Efeito ilustrativo
        </span>
      )}
    </div>
  );

  if (noFrame) return sliderInner;

  return (
    <div className="relative w-full">
      <div className="overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.22)]">
        {sliderInner}
      </div>
      <p className="text-center text-sm font-medium tracking-[0.16em] uppercase text-[#505650] mt-3">
        Arraste para comparar
      </p>
    </div>
  );
};

export default BeforeAfterSlider;
