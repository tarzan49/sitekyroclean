import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

interface QuizEstimateProps {
  totalPrice: number;
  discountedPrice: number;
  discountActive: boolean;
  needsQuote: boolean;
  travelOnly: boolean;
  location: string;
  travelCost?: number;
}

export default function QuizEstimate({ totalPrice, discountedPrice, discountActive, needsQuote, travelOnly, location, travelCost }: QuizEstimateProps) {
  const target = discountActive ? discountedPrice : Math.round(totalPrice);
  const [amount, setAmount] = useState(target);
  const displayed = useRef(target);
  const wasDiscounted = useRef(discountActive);
  const savings = Math.max(0, Math.round(totalPrice) - discountedPrice);

  useEffect(() => {
    const activated = discountActive && !wasDiscounted.current;
    wasDiscounted.current = discountActive;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      displayed.current = target;
      setAmount(target);
      return;
    }
    // On activation compare the SAME basket before and after its discount.
    const from = activated ? Math.round(totalPrice) : displayed.current;
    displayed.current = from;
    setAmount(from);
    const started = performance.now() + (activated ? 180 : 0);
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
  }, [target, discountActive, totalPrice]);

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 border-b border-gold/20 bg-[#071a12] px-4 sm:px-6 py-3 text-white">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-xs text-white/60 font-medium">
          {travelOnly ? `Deslocação (${location})` : 'Estimativa'}
        </span>
        <div className="flex flex-wrap items-baseline justify-end gap-2.5 tabular-nums">
          {discountActive && savings > 0 && <s className="text-sm text-white/40">{Math.round(totalPrice)}€</s>}
          {totalPrice > 0 && <span className="text-[28px] leading-tight font-bold text-gold" aria-label={`${target} euros`}>
            <span aria-hidden="true">{amount}€</span>
          </span>}
          {needsQuote && <span className="text-xs font-semibold text-gold">{totalPrice > 0 ? '+ Sob orçamento' : 'Sob orçamento'}</span>}
        </div>
      </div>
      {discountActive && savings > 0 && (
        <div role="status" className="mt-2 flex items-center gap-2 border-t border-gold/15 pt-2 text-[11px] leading-relaxed">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-[#071a12]"><Check className="h-3 w-3" strokeWidth={3} /></span>
          <p><span className="font-semibold text-gold">Poupa {savings}€ nesta visita</span><span className="text-white/50"> · 10% aplicado{needsQuote ? ' aos valores estimados' : ''}</span></p>
        </div>
      )}
      {travelCost !== undefined && !travelOnly && (
        <details className="mt-2 text-[11px] text-white/70">
          <summary className="cursor-pointer py-1 text-white/65 hover:text-gold">Ver composição do orçamento</summary>
          <dl className="mt-1 space-y-1 border-t border-white/10 pt-2">
            <div className="flex justify-between gap-3"><dt>Serviços{needsQuote ? ' com preço definido' : ''}</dt><dd>{Math.round(totalPrice - travelCost)}€</dd></div>
            {discountActive && savings > 0 && <div className="flex justify-between gap-3 text-gold"><dt>Desconto de 10%</dt><dd>−{savings}€</dd></div>}
            <div className="flex justify-between gap-3"><dt>Deslocação{location ? ` · ${location}` : ''}</dt><dd>{travelCost}€</dd></div>
            {needsQuote && <div className="text-gold">Acrescem os serviços sob orçamento.</div>}
          </dl>
        </details>
      )}
    </div>
  );
}
