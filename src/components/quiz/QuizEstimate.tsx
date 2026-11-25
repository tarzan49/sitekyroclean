import { SMALL_ORDER_FAR_MIN } from '@/constants/travel';
import { useEffect, useRef, useState } from 'react';

interface QuizEstimateProps {
  totalPrice: number;
  needsQuote: boolean;
  travelOnly: boolean;
  location: string;
  travelCost?: number;
  // Tapetes e alcatifas (2026-10-05): com recolha, a linha da deslocação passa a
  // "Recolha e entrega" (até 2026-10-10 "Recolha, entrega e deslocação"); em
  // casa, a deslocação é sob orçamento.
  travelRowLabel?: string;
  travelOnQuote?: boolean;
  // Serviço abaixo de 49€ longe de Odivelas (dono, 23 Nov 2026): já dentro do totalPrice.
  smallOrderSurcharge?: number;
}

export default function QuizEstimate({ totalPrice, needsQuote, travelOnly, location, travelCost, travelRowLabel, travelOnQuote = false, smallOrderSurcharge = 0 }: QuizEstimateProps) {
  // O número grande é o do serviço; a deslocação vem por baixo, discreta (dono, 25 Nov 2026).
  const apart = travelOnly ? 0 : travelCost ?? 0;
  const target = Math.round(totalPrice - apart);
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
        <span className="text-sm text-white/80 font-medium">
          {travelOnly ? `Deslocação (${location})` : 'Estimativa'}
        </span>
        <div className="flex flex-wrap items-baseline justify-end gap-2.5 tabular-nums">
          {totalPrice > 0 && <span className="text-[28px] leading-tight font-bold text-gold" aria-label={`${target} euros`}>
            <span aria-hidden="true">{amount}€</span>
          </span>}
          {needsQuote && <span className="text-sm font-semibold text-gold">{totalPrice > 0 ? '+ Sob orçamento' : 'Sob orçamento'}</span>}
        </div>
      </div>
      {/* Sempre visível, sem precisar de abrir "Ver composição" — sem isto o
          cliente vê só o total e acha que o artigo custa o total todo (bug
          real reportado: "1 cadeira" a 20€ + 10€ deslocação aparecia só como
          "30€", parecendo que a cadeira sozinha custava 30€). */}
      {travelCost !== undefined && travelCost > 0 && !travelOnly && (
        <p className="text-xs text-right text-white/65 -mt-0.5">+ {travelCost}€ {travelRowLabel ? travelRowLabel.toLowerCase() : 'deslocação'}{location ? ` a ${location}` : ''}</p>
      )}
      {smallOrderSurcharge > 0 && !travelOnly && (
        <p className="text-sm text-gold -mt-0.5">Inclui {smallOrderSurcharge}€ por ser um serviço abaixo de {SMALL_ORDER_FAR_MIN}€ nesta zona. Junte outra peça na mesma visita e deixa de ter este acréscimo.</p>
      )}
      {travelOnQuote && !travelOnly && (
        <p className="text-sm text-white/80 -mt-0.5">Deslocação{location ? ` a ${location}` : ''} incluída no preço</p>
      )}
      {travelCost !== undefined && !travelOnly && (
        <details className="mt-2 [@media(max-height:800px)]:mt-1 text-sm text-white/70">
          <summary className="cursor-pointer py-1 text-white/80 hover:text-gold">Ver composição do orçamento</summary>
          <dl className="mt-1 space-y-1 border-t border-white/10 pt-2">
            <div className="flex justify-between gap-3"><dt>Serviços{needsQuote ? ' com preço definido' : ''}</dt><dd>{Math.round(totalPrice - travelCost - smallOrderSurcharge)}€</dd></div>
            <div className="flex justify-between gap-3"><dt>{travelRowLabel ?? 'Deslocação'}{location ? ` · ${location}` : ''}</dt><dd>{travelOnQuote ? 'Incluída' : travelCost === 0 && location ? 'Gratuita' : `${travelCost}€`}</dd></div>
            {smallOrderSurcharge > 0 && <div className="flex justify-between gap-3"><dt>Serviço abaixo de {SMALL_ORDER_FAR_MIN}€</dt><dd>{smallOrderSurcharge}€</dd></div>}
            <div className="flex justify-between gap-3 font-semibold text-white"><dt>Total</dt><dd>{Math.round(totalPrice)}€</dd></div>
            {needsQuote && <div className="text-gold">Acrescem os serviços sob orçamento.</div>}
          </dl>
        </details>
      )}
    </div>
  );
}
