import { useEffect, useRef, useState } from 'react';

interface QuizEstimateProps {
  totalPrice: number;
  needsQuote: boolean;
  travelOnly: boolean;
  location: string;
  travelCost?: number;
}

export default function QuizEstimate({ totalPrice, needsQuote, travelOnly, location, travelCost }: QuizEstimateProps) {
  const target = Math.round(totalPrice);
  const [amount, setAmount] = useState(target);
  const displayed = useRef(target);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      displayed.current = target;
      setAmount(target);
      return;
    }
    const from = displayed.current;
    const started = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - started) / 500));
      const value = Math.round(from + (target - from) * (1 - (1 - progress) ** 3));
      displayed.current = value;
      setAmount(value);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 border-b border-gold/20 bg-[#071a12] px-4 sm:px-6 py-3 [@media(max-height:800px)]:py-2 text-white">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-xs text-white/60 font-medium">
          {travelOnly ? `Deslocação (${location})` : 'Estimativa'}
        </span>
        <div className="flex flex-wrap items-baseline justify-end gap-2.5 tabular-nums">
          {totalPrice > 0 && <span className="text-[28px] leading-tight font-bold text-gold" aria-label={`${target} euros`}>
            <span aria-hidden="true">{amount}€</span>
          </span>}
          {needsQuote && <span className="text-xs font-semibold text-gold">{totalPrice > 0 ? '+ Sob orçamento' : 'Sob orçamento'}</span>}
        </div>
      </div>
      {/* Sempre visível, sem precisar de abrir "Ver composição" — sem isto o
          cliente vê só o total e acha que o artigo custa o total todo (bug
          real reportado: "1 cadeira" a 20€ + 10€ deslocação aparecia só como
          "30€", parecendo que a cadeira sozinha custava 30€). */}
      {travelCost !== undefined && travelCost > 0 && !travelOnly && (
        <p className="text-[11px] text-white/45 -mt-0.5">Inclui {travelCost}€ de deslocação{location ? ` a ${location}` : ''}</p>
      )}
      {travelCost !== undefined && !travelOnly && (
        <details className="mt-2 [@media(max-height:800px)]:mt-1 text-[11px] text-white/70">
          <summary className="cursor-pointer py-1 text-white/65 hover:text-gold">Ver composição do orçamento</summary>
          <dl className="mt-1 space-y-1 border-t border-white/10 pt-2">
            <div className="flex justify-between gap-3"><dt>Serviços{needsQuote ? ' com preço definido' : ''}</dt><dd>{Math.round(totalPrice - travelCost)}€</dd></div>
            <div className="flex justify-between gap-3"><dt>Deslocação{location ? ` · ${location}` : ''}</dt><dd>{travelCost}€</dd></div>
            {needsQuote && <div className="text-gold">Acrescem os serviços sob orçamento.</div>}
          </dl>
        </details>
      )}
    </div>
  );
}
