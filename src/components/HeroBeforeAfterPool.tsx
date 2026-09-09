import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { BEFORE_AFTER_POOL, type BeforeAfterCategory } from "@/data/beforeAfterPool";

interface Props {
  category: BeforeAfterCategory;
  className?: string;
  intervalMs?: number;
}

// Foto pequena do hero, ao lado do texto — deixou de ser uma foto estática
// única e passou a rodar sozinha por vários pares reais de antes/depois da
// categoria (pedido explícito 2026-09-09: "o antes e depois é o que vende a
// limpeza ao cliente"). Continua a poder arrastar-se cada par (reaproveita
// BeforeAfterSlider tal como já existia em /antes-depois), só a rotação
// automática entre pares é nova. Pausa a rotação enquanto a pessoa está
// mesmo a arrastar, para nunca trocar o par a meio de uma interação real.
const HeroBeforeAfterPool = ({ category, className, intervalMs = 5000 }: Props) => {
  const pool = BEFORE_AFTER_POOL[category];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (pool.length <= 1) return;
    const timer = setInterval(() => {
      if (draggingRef.current) return;
      setVisible(false);
      window.setTimeout(() => {
        setIndex(i => (i + 1) % pool.length);
        setVisible(true);
      }, 300);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [pool.length, intervalMs]);

  const item = pool[index % pool.length];
  if (!item) return null;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className={cn("w-full h-full transition-opacity duration-300 ease-out", visible ? "opacity-100" : "opacity-0")}>
        {item.kind === "pair" ? (
          <BeforeAfterSlider
            key={index}
            beforeImage={item.before}
            afterImage={item.after}
            noFrame
            onDraggingChange={d => { draggingRef.current = d; }}
          />
        ) : (
          <img
            key={index}
            src={item.image}
            alt="Resultado real de limpeza | Kyro Clean Solutions"
            width={800} height={800}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {pool.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-none">
          {pool.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-4 bg-gold" : "w-1.5 bg-white/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBeforeAfterPool;
