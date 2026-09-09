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

  // Cadeiras: as fotos reais são muito mais altas que largas (uma cadeira
  // inteira, de cima a baixo) — a caixa 4:3 usada pelas outras categorias
  // cortava a cadeira a meio (pedido explícito 2026-09-09: "elas tem que ter
  // altura para se ver a cadeira toda... e o unico caso em que podes alterar
  // a estrutura"). 9:16 é mais estreito que a proporção da mais larga das
  // fotos atuais — com "cover" isso garante que só se corta a lateral,
  // nunca o topo/base da cadeira.
  //
  // BUG real encontrado 2026-09-09 (dono reportou "completamente
  // desformatadas" depois da 1ª tentativa): tinha "w-full aspect-[9/16]
  // max-h-[680px]" — com a largura fixa em 100% da coluna (~550px) e a
  // altura implícita de 9:16 (~980px) muito maior que o max-h, o browser
  // respeita a largura definida e só recorta a altura ao limite, ficando
  // com uma caixa ~552×680 (proporção ~0.81), não 9:16 (0.5625) — cada foto
  // ficava cortada de forma diferente e inconsistente. Corrigido invertendo
  // qual dimensão manda: aqui é a ALTURA que é fixa e a LARGURA fica "auto",
  // calculada a partir do aspect-ratio — isso sim dá sempre 9:16 exato,
  // independentemente da largura da coluna. Fica mais estreita que a coluna
  // (por design, é um retrato) — daí o "mx-auto" para centrar o espaço à
  // volta em vez de ficar encostada a um lado.
  const isChair = category === "cadeiras";
  const sizeClass = isChair
    ? "w-auto mx-auto h-[420px] sm:h-[480px] md:h-[560px] lg:h-[620px] aspect-[9/16]"
    : "w-full aspect-[4/3] max-h-[440px]";

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
    <div className={cn("relative overflow-hidden", className, sizeClass)}>
      <div className={cn("w-full h-full transition-opacity duration-300 ease-out", visible ? "opacity-100" : "opacity-0")}>
        {item.kind === "pair" ? (
          <BeforeAfterSlider
            key={index}
            beforeImage={item.before}
            afterImage={item.after}
            noFrame
            illustrative={item.illustrative}
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
