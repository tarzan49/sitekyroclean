// Símbolo do cesto no menu (dono, 24 Nov 2026: "um símbolo de cesto para os clientes conseguirem aceder sempre").
// Abre o questionário (o cesto da visita); mostra quantos artigos já lá estão. O cesto guarda-se na sessão
// (VisitBasket, chave kyro_visit_basket), por isso volta igual em qualquer página.
import { useEffect, useState } from 'react';
import { ShoppingBasket } from 'lucide-react';

const KEY = 'kyro_visit_basket';
function readCount(): number {
  try { const v = JSON.parse(sessionStorage.getItem(KEY) ?? 'null'); return Array.isArray(v?.items) ? v.items.length : 0; } catch { return 0; }
}

export default function BasketButton({ onOpen, className = '' }: { onOpen: () => void; className?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const tick = () => { if (document.visibilityState === 'visible') setCount(readCount()); };
    tick();
    const t = window.setInterval(tick, 1500);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(t); document.removeEventListener('visibilitychange', tick); };
  }, []);
  return (
    <button type="button" onClick={onOpen} aria-label={count ? `Abrir o cesto (${count} ${count === 1 ? 'artigo' : 'artigos'})` : 'Abrir o cesto'}
      className={`relative grid h-11 w-11 shrink-0 touch-manipulation place-items-center text-[#0B2F2A] active:opacity-70 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0B2F2A] text-[#D4AF37] transition-colors hover:bg-[#123d36]"><ShoppingBasket className="h-[18px] w-[18px]" strokeWidth={2} /></span>
      {count > 0 && <span className="absolute -right-0.5 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[11px] font-bold leading-none text-[#0B2F2A]">{count}</span>}
    </button>
  );
}
