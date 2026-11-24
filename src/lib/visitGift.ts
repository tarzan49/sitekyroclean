// A oferta por juntar peças (escada A do motor). Dono, 25 Nov 2026 ("Sim, como o bot"): o total da limpeza já a
// inclui, como o bot diz no WhatsApp, e a opção diz sempre o que está incluído. Valores só do botQuote.
import { botQuote } from '@/lib/botQuote';

type Gift = { piece: string; treatment: string; normal: number };
const PIECE: Record<string, [string, string]> = { mattress: ['colchão', 'colchões'], sofa: ['sofá', 'sofás'], chairs: ['cadeira', 'cadeiras'], rug: ['tapete', 'tapetes'] };
const TREAT: Record<string, string> = { 'anti-acaros': 'anti-ácaros', premium: 'impermeabilização Premium', essencial: 'impermeabilização Essencial', odor: 'anti-odor' };

export function visitGiftFor(city: string, items: Record<string, unknown>[]) {
  const r = botQuote({ city, items }) as { visitGifts?: { gifts?: Gift[]; total?: number; usual?: number } | null };
  const v = r.visitGifts;
  if (!v?.gifts?.length || typeof v.total !== 'number') return null;
  return { gifts: v.gifts, normal: v.gifts.reduce((a, g) => a + g.normal, 0), usual: v.usual ?? null };
}
export function giftText(gift: NonNullable<ReturnType<typeof visitGiftFor>>) {
  const groups = new Map<string, number>();
  for (const g of gift.gifts) { const k = `${g.treatment}|${g.piece}`; groups.set(k, (groups.get(k) ?? 0) + 1); }
  return [...groups].map(([k, n]) => { const [t, p] = k.split('|'); const names = PIECE[p] ?? [p, p]; return `${TREAT[t] ?? t} em ${n === 1 ? `1 ${names[0]}` : `${n} ${names[1]}`}`; }).join(' e ');
}
