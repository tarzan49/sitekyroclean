// A oferta por juntar peças (escada A do motor), mostrada à parte e nunca escondida no total da "Só limpeza"
// (dono, 25 Nov: "ok a 1"). Os valores vêm do botQuote (visitGifts): o que se oferece, quanto custaria à parte
// e quanto soma ao total da limpeza.
import { botQuote } from '@/lib/botQuote';
import { formatEuro } from '@/data/enginePrices';

type Gift = { piece: string; treatment: string; normal: number };
const PIECE: Record<string, [string, string]> = { mattress: ['colchão', 'colchões'], sofa: ['sofá', 'sofás'], chairs: ['cadeira', 'cadeiras'], rug: ['tapete', 'tapetes'] };
const TREAT: Record<string, string> = { 'anti-acaros': 'anti-ácaros', premium: 'impermeabilização Premium', essencial: 'impermeabilização Essencial', odor: 'anti-odor' };

export function visitGiftFor(city: string, items: Record<string, unknown>[]) {
  const r = botQuote({ city, items }) as { visitGifts?: { gifts?: Gift[]; total?: number; withoutGift?: number } | null };
  const v = r.visitGifts;
  if (!v?.gifts?.length || typeof v.total !== 'number' || typeof v.withoutGift !== 'number') return null;
  return { gifts: v.gifts, extra: v.total - v.withoutGift, normal: v.gifts.reduce((a, g) => a + g.normal, 0) };
}

export default function VisitGiftLine({ gift }: { gift: ReturnType<typeof visitGiftFor> }) {
  if (!gift) return null;
  const groups = new Map<string, number>();
  for (const g of gift.gifts) { const k = `${g.treatment}|${g.piece}`; groups.set(k, (groups.get(k) ?? 0) + 1); }
  const what = [...groups].map(([k, n]) => { const [t, p] = k.split('|'); const names = PIECE[p] ?? [p, p]; return `${TREAT[t] ?? t} em ${n === 1 ? `1 ${names[0]}` : `${n} ${names[1]}`}`; }).join(' e ');
  return <p className="mt-2 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-3 py-2 text-[12px] leading-snug text-[#1A1A1A] md:text-sm">
    <span className="font-bold">Por juntar peças:</span> {what} por mais {formatEuro(gift.extra)} <span className="text-[#666]">(normalmente {formatEuro(gift.normal)})</span>. Peça no WhatsApp.
  </p>;
}
