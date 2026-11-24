// Packs de várias peças (dono, 24 Nov): o cliente escolhe peça a peça (tamanho/quantidade + tratamento),
// um só total do bot (botQuote, deslocação incluída), preço cortado = o mesmo pedido em separado,
// ambos a acabar em 9 para cima. Tapetes nunca mostram preço no site: pedem as medidas no WhatsApp.
import { useMemo, useState } from 'react';
import { Check, MessageCircle, Minus, Plus } from 'lucide-react';
import { BEFORE_AFTER_POOL } from '@/data/beforeAfterPool';
import premiumSofa from '@/assets/picker-premium-sofa.webp';
import essencialSofa from '@/assets/picker-essencial-sofa.webp';
import premiumChair from '@/assets/picker-premium-cadeira.webp';
import essencialChair from '@/assets/picker-essencial-cadeira.webp';
import { botQuote } from '@/lib/botQuote';
import { WHATSAPP_BASE } from '@/constants/business';
import { formatEuro } from '@/data/enginePrices';

const up9 = (n: number) => Math.ceil((n + 1) / 10) * 10 - 1;
const pair = (cat: 'sofa' | 'colchao' | 'cadeiras' | 'tapete') => BEFORE_AFTER_POOL[cat].find(p => p.kind === 'pair') as { before: string; after: string } | undefined;

type T = { id: string; label: string; note: string; img?: string; wa: string };
export type PieceKind = 'sofa' | 'mattress' | 'chairs' | 'rug';

const TREATMENTS: Record<Exclude<PieceKind, 'rug'>, T[]> = {
  sofa: [
    { id: 'clean', label: 'Só limpeza', note: 'Limpo a fundo', img: pair('sofa')?.after, wa: 'só limpeza' },
    { id: 'clean+essencial', label: 'Essencial', note: 'Proteção 1 a 2 anos', img: essencialSofa, wa: 'limpeza + impermeabilização Essencial' },
    { id: 'clean+premium', label: 'Premium', note: 'Proteção até 10 anos', img: premiumSofa, wa: 'limpeza + impermeabilização Premium' },
  ],
  chairs: [
    { id: 'clean', label: 'Só limpeza', note: 'Limpas a fundo', img: pair('cadeiras')?.after, wa: 'só limpeza' },
    { id: 'clean+essencial', label: 'Essencial', note: 'Proteção 1 a 2 anos', img: essencialChair, wa: 'limpeza + impermeabilização Essencial' },
    { id: 'clean+premium', label: 'Premium', note: 'Proteção até 10 anos', img: premiumChair, wa: 'limpeza + impermeabilização Premium' },
  ],
  mattress: [
    { id: 'clean', label: 'Só limpeza', note: 'Limpo a fundo', img: pair('colchao')?.after, wa: 'só limpeza' },
    { id: 'clean+anti-acaros', label: 'Anti-ácaros', note: 'Limpeza + desinfeção', img: pair('colchao')?.before, wa: 'limpeza + anti-ácaros' },
  ],
};
const DEFAULT_T: Record<Exclude<PieceKind, 'rug'>, string> = { sofa: 'clean+premium', chairs: 'clean+premium', mattress: 'clean+anti-acaros' };
const MATTRESS = [{ id: 'solteiro', label: 'Solteiro' }, { id: 'casal', label: 'Casal' }, { id: 'king', label: 'King/Queen' }];
const SEATS = [1, 2, 3, 4, 5, 6];

function Choice({ items, value, onChange, label, compact }: { items: T[]; value: string; onChange: (v: string) => void; label: string; compact?: boolean }) {
  return <div className={`grid gap-1.5 ${items.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`} role="radiogroup" aria-label={label}>
    {items.map(t => {
      const active = value === t.id;
      return <button key={t.id} type="button" role="radio" aria-checked={active} onClick={() => onChange(t.id)}
        className={`relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all ${active ? 'border-[#D4AF37] bg-[#FFFBEF] shadow-[0_6px_18px_-8px_rgba(212,175,55,0.6)]' : 'border-[#E5E0D3] bg-white'}`}>
        {!compact && <img src={t.img} alt="" loading="lazy" decoding="async" className="h-[52px] w-full object-cover" />}
        <span className="px-2 py-1.5">
          <span className="block text-[13px] font-bold leading-tight text-[#1A1A1A]">{t.label}</span>
          <span className="block text-[11px] leading-tight text-[#555]">{t.note}</span>
        </span>
        {active && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#D4AF37] text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>}
      </button>;
    })}
  </div>;
}

const sofaBase = (seats: number) => seats === 6 ? { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto' } : { kind: 'sofa', size: `${seats}-${seats === 1 ? 'lugar' : 'lugares'}` };

export default function PackPiecesPicker({ pieces, packName, city, source, compact = false, onMore }: { pieces: PieceKind[]; packName: string; city: string; source: string; compact?: boolean; onMore?: () => void }) {
  const [seats, setSeats] = useState(3);
  const [mattress, setMattress] = useState('casal');
  const [qty, setQty] = useState(6);
  const [rug, setRug] = useState(true);
  const [rugW, setRugW] = useState('2');
  const [rugL, setRugL] = useState('1.6');
  const dim = (v: string) => { const n = Number(v.replace(',', '.')); return n > 0 && n <= 10 ? n : null; };
  const rugItem = rug && pieces.includes('rug') && dim(rugW) && dim(rugL) ? { kind: 'rug', width: dim(rugW), length: dim(rugL), treatment: 'clean' } : null;
  const [t, setT] = useState<Record<string, string>>(DEFAULT_T);
  const setTreat = (k: string) => (v: string) => setT(prev => ({ ...prev, [k]: v }));

  const items = useMemo(() => pieces.filter(p => p !== 'rug').map(p => {
    if (p === 'sofa') return { base: sofaBase(seats), treatment: t.sofa };
    if (p === 'mattress') return { base: { kind: 'mattress', size: mattress }, treatment: t.mattress };
    return { base: { kind: 'chairs', qty }, treatment: t.chairs };
  }), [pieces, seats, mattress, qty, t]);

  const quote = (list: Record<string, unknown>[]) => { const r = botQuote({ city, items: list }) as { ok: boolean; quote?: boolean; total?: number | null }; return r.ok && !r.quote && typeof r.total === 'number' ? r.total : null; };
  // Tapete com o preço do bot (dono, 24 Nov): com outras peças = rugCombo.comboPrice (mesma visita, preço de tabela de cada peça).
  const total = useMemo(() => {
    const list = items.map(i => ({ ...i.base, treatment: i.treatment }));
    if (rugItem) {
      const r = botQuote({ city, items: [...list, rugItem] }) as { ok: boolean; rugCombo?: { ok: boolean; comboPrice?: number } | null };
      return r.ok && r.rugCombo?.ok && typeof r.rugCombo.comboPrice === 'number' ? up9(r.rugCombo.comboPrice) : null;
    }
    const v = quote(list); return v === null ? null : up9(v);
  }, [items, city, rugW, rugL, rug]);
  // Preço cortado = o mesmo pedido em separado (cada serviço com a sua deslocação): a única comparação permitida (dono, 19 Nov).
  // Preço cortado = o separatePrice do motor (o mesmo pedido em separado), o MESMO valor que o bot diz (dono, 24 Nov 2026).
  const separate = useMemo(() => {
    const r = botQuote({ city, items: items.map(i => ({ ...i.base, treatment: i.treatment })) }) as { separatePrice?: { separate: number } | null; chairsWas?: number | null };
    return r.separatePrice?.separate || r.chairsWas || null;
  }, [items, city]);
  const crossed = total !== null && separate !== null && separate > total ? up9(separate) : null;

  const describe = (p: PieceKind) => {
    if (p === 'sofa') return `sofá de ${seats} ${seats === 1 ? 'lugar' : 'lugares'} (${TREATMENTS.sofa.find(x => x.id === t.sofa)!.wa})`;
    if (p === 'mattress') return `colchão ${MATTRESS.find(m => m.id === mattress)!.label.toLowerCase()} (${TREATMENTS.mattress.find(x => x.id === t.mattress)!.wa})`;
    if (p === 'chairs') return `${qty} ${qty === 1 ? 'cadeira' : 'cadeiras'} (${TREATMENTS.chairs.find(x => x.id === t.chairs)!.wa})`;
    return rugItem ? `tapete de ${rugW.replace('.', ',')} × ${rugL.replace('.', ',')} m` : 'um tapete (envio as medidas)';
  };
  const chosen = pieces.filter(p => p !== 'rug' || rug);
  const msg = `Olá! Gostaria de saber o preço e a disponibilidade do ${packName.toLowerCase()} em ${city}: ${chosen.map(describe).join(', ')}${total ? `, por ${formatEuro(total)}` : ''}.`;
  const chip = (active: boolean) => `flex min-h-[36px] items-center justify-center rounded-xl border-2 font-semibold transition-all ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#1A1A1A]' : 'border-[#E5E0D3] bg-white text-[#555]'}`;
  const q = 'mb-1.5 text-base font-semibold text-[#1A1A1A]';

  return (
    <div className={`mx-auto grid w-full max-w-4xl gap-3 md:gap-8 ${pieces.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
      {pieces.map(p => <div key={p}>
        {p === 'sofa' && <>
          <p className={q}>O sofá: quantos lugares?</p>
          <div className="grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Lugares">{SEATS.map(n => <button key={n} type="button" role="radio" aria-checked={seats === n} onClick={() => setSeats(n)} className={`${chip(seats === n)} text-lg`}>{n}</button>)}</div>
          <div className="mt-1.5"><Choice compact={compact} items={TREATMENTS.sofa} value={t.sofa} onChange={setTreat('sofa')} label="Tratamento do sofá" /></div>
        </>}
        {p === 'mattress' && <>
          <p className={q}>O colchão: que tamanho?</p>
          <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Tamanho do colchão">{MATTRESS.map(m => <button key={m.id} type="button" role="radio" aria-checked={mattress === m.id} onClick={() => setMattress(m.id)} className={`${chip(mattress === m.id)} text-sm`}>{m.label}</button>)}</div>
          <div className="mt-1.5"><Choice compact={compact} items={TREATMENTS.mattress} value={t.mattress} onChange={setTreat('mattress')} label="Tratamento do colchão" /></div>
        </>}
        {p === 'chairs' && <>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-base font-semibold text-[#1A1A1A]">As cadeiras: quantas?</p>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Menos uma cadeira" onClick={() => setQty(n => Math.max(1, n - 1))} className="grid h-9 w-9 place-items-center rounded-lg bg-[#F3F0E7]"><Minus className="h-4 w-4" /></button>
              <span className="w-6 text-center text-lg font-semibold">{qty}</span>
              <button type="button" aria-label="Mais uma cadeira" onClick={() => setQty(n => Math.min(20, n + 1))} className="grid h-9 w-9 place-items-center rounded-lg bg-[#F3F0E7]"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <Choice compact={compact} items={TREATMENTS.chairs} value={t.chairs} onChange={setTreat('chairs')} label="Tratamento das cadeiras" />
        </>}
        {p === 'rug' && <>
          <button type="button" role="switch" aria-checked={rug} onClick={() => setRug(r => !r)} className={`flex w-full items-center gap-3 overflow-hidden rounded-xl border-2 text-left ${rug ? 'border-[#D4AF37] bg-[#FFFBEF]' : 'border-[#E5E0D3] bg-white'}`}>
            {!compact && <img src={pair('tapete')?.after} alt="" loading="lazy" decoding="async" className="h-14 w-16 shrink-0 object-cover" />}
            <span className={`flex-1 ${compact ? 'px-3 py-2' : 'py-1.5'}`}>
              <span className="block text-[14px] font-bold text-[#1A1A1A]">Juntar o tapete</span>
              <span className="block text-[11px] leading-tight text-[#555]">Lavagem em casa, pelas medidas</span>
            </span>
            <span className={`mr-3 grid h-5 w-5 place-items-center rounded-full border-2 ${rug ? 'border-[#D4AF37] bg-[#D4AF37] text-white' : 'border-[#CFC8B6]'}`}>{rug && <Check className="h-3 w-3" strokeWidth={3} />}</span>
          </button>
          {rug && <div className="mt-1.5 flex items-center gap-2 text-sm text-[#555]">
            <span>Medidas (m):</span>
            <input aria-label="Largura do tapete em metros" inputMode="decimal" value={rugW} onChange={e => setRugW(e.target.value)} className="h-9 w-16 rounded-lg border-2 border-[#E5E0D3] bg-white text-center font-semibold text-[#1A1A1A]" />
            <span>×</span>
            <input aria-label="Comprimento do tapete em metros" inputMode="decimal" value={rugL} onChange={e => setRugL(e.target.value)} className="h-9 w-16 rounded-lg border-2 border-[#E5E0D3] bg-white text-center font-semibold text-[#1A1A1A]" />
          </div>}
        </>}
      </div>)}
      <div className={pieces.length > 2 ? 'md:col-span-3' : 'md:col-span-2'}>
        <div className="flex items-end justify-between border-t border-[#E5E0D3] pt-2">
          <span className="text-sm text-[#555]">{`Total em ${city}`}<br />
            {crossed !== null && total !== null ? <span className="mt-1 inline-flex items-center rounded-full border border-[#D4AF37]/60 bg-gradient-to-r from-[#F7E7B4] via-[#E9CD72] to-[#D4AF37] px-2.5 py-0.5 text-[12px] font-bold tracking-wide text-[#3A2E08] shadow-[0_4px_12px_-4px_rgba(212,175,55,0.7)]">Poupa {formatEuro(crossed - total)}</span> : <span className="text-xs">deslocação incluída</span>}
          </span>
          <span className="flex items-baseline gap-2">{crossed !== null && <span className="text-xl font-semibold text-[#777] line-through decoration-[#D4AF37] decoration-2">{formatEuro(crossed)}</span>}<span className="text-3xl font-bold text-[#1A1A1A]">{total === null ? <span className="text-sm text-[#D4AF37]">Sob orçamento</span> : formatEuro(total)}</span></span>
        </div>
        <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" data-tracking-source={source}
          className="mt-2 flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-[#16833e] px-3 py-3 text-base font-semibold text-white hover:bg-[#116b32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]">
          <MessageCircle className="h-5 w-5 shrink-0" />Pedir este orçamento no WhatsApp
        </a>
        {onMore && <button type="button" onClick={onMore} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 text-sm font-bold text-[#1A1A1A]"><Plus className="h-4 w-4 text-[#D4AF37]" strokeWidth={3} />Juntar mais artigos à mesma visita</button>}
      </div>
    </div>
  );
}
