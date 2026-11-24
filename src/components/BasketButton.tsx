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
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center border border-[#D4AF37] bg-[#0B2F2A] text-[#D4AF37] touch-manipulation transition-colors hover:bg-[#123d36] ${className}`}>
      <ShoppingBasket className="h-[18px] w-[18px]" strokeWidth={2} />
      {count > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[11px] font-bold leading-none text-[#0B2F2A]">{count}</span>}
    </button>
  );
}
