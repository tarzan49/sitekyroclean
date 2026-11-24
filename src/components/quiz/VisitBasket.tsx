// Cesto da visita (dono, 24 Nov 2026): o questionário novo, em dois ecrãs.
// 1) O cesto: o que veio do widget de preço já lá está; juntam-se sofás, colchões, cadeiras, tapetes e
//    alcatifas na mesma visita, cada um com o seu pack. O total é o do bot (botQuote do pedido inteiro,
//    deslocação incluída), nunca escrito à mão. Tapetes e alcatifas nunca mostram preço: só as medidas.
// 2) Contacto: nome e telemóvel. O pedido vai pelo mesmo envio (submit-lead + quiz_order), por isso a
//    mensagem automática e o funil do bot no WhatsApp continuam iguais.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Minus, Plus, Trash2, X } from 'lucide-react';
import { botQuote, listBotCities } from '@/lib/botQuote';
import { formatEuro } from '@/data/enginePrices';
import { buildQuizOrder, type QuoteItem } from '@/lib/quizOrder';
import { useQuizSubmission } from '@/hooks/use-quiz-submission';
import { buildWaUrl, type QuizLeadPayload } from '@/services/submissionService';

export type BasketPack = 'premium' | 'essencial' | 'none';
export type BasketKind = 'sofa' | 'mattress' | 'chairs' | 'rug' | 'carpet';
export interface BasketItem {
  id: string;
  kind: BasketKind;
  size?: string;          // sofá: 1-lugar..5-lugares (6 = 5-lugares + seats 6); colchão: solteiro/casal/king
  seats?: number;
  qty: number;
  pack: BasketPack;       // sofá e cadeiras: Blindado/Protegido/Renovado; colchão: premium = anti-ácaros
  leather?: boolean;      // sofá de pele: só limpeza + tratamento da pele
  width?: string;         // tapete/alcatifa, em metros
  length?: string;
}

const PACKS: { pack: BasketPack; name: string; note: string }[] = [
  { pack: 'premium', name: 'Blindado', note: 'Limpeza + Premium, até 10 anos' },
  { pack: 'essencial', name: 'Protegido', note: 'Limpeza + Essencial, 1 a 2 anos' },
  { pack: 'none', name: 'Renovado', note: 'Só limpeza' },
];
const SOFA_SEATS = [1, 2, 3, 4, 5, 6];
const MATTRESS = [{ id: 'solteiro', label: 'Solteiro' }, { id: 'casal', label: 'Casal' }, { id: 'king', label: 'King / Queen' }];
const KIND_LABEL: Record<BasketKind, string> = { sofa: 'Sofá', mattress: 'Colchão', chairs: 'Cadeiras', rug: 'Tapete', carpet: 'Alcatifa' };
const GOLD = '#D4AF37';

const num = (v?: string) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return n > 0 ? n : 0; };
const isRug = (k: BasketKind) => k === 'rug' || k === 'carpet';
let seq = 0;
export const newItem = (kind: BasketKind, over: Partial<BasketItem> = {}): BasketItem => ({
  id: `i${Date.now()}${seq++}`, kind, qty: kind === 'chairs' ? 6 : 1,
  size: kind === 'sofa' ? '3-lugares' : kind === 'mattress' ? 'casal' : undefined,
  pack: kind === 'mattress' ? 'none' : isRug(kind) ? 'none' : 'premium', ...over,
});

/** O item como o motor do bot o lê (o mesmo vocabulário do quiz_order). */
function toQuote(it: BasketItem): (QuoteItem & Record<string, unknown>) | null {
  if (isRug(it.kind)) {
    const w = num(it.width), l = num(it.length);
    return w && l ? { kind: it.kind, qty: 1, treatment: 'clean', width: w, length: l } : null;
  }
  if (it.kind === 'mattress') return { kind: 'mattress', size: it.size, qty: it.qty, treatment: it.pack === 'premium' ? 'clean+anti-acaros' : 'clean' };
  const treatment = it.leather || it.pack === 'none' ? 'clean' : it.pack === 'premium' ? 'clean+premium' : 'clean+essencial';
  if (it.kind === 'chairs') return { kind: 'chairs', qty: it.qty, treatment };
  const six = it.seats === 6;
  return { kind: 'sofa', size: six ? '5-lugares' : it.size, qty: it.qty, treatment, ...(six ? { seats: 6, look: 'compacto' } : {}), ...(it.leather ? { leather: true } : {}) };
}

export function itemLabel(it: BasketItem): string {
  if (isRug(it.kind)) return `${KIND_LABEL[it.kind]}${num(it.width) && num(it.length) ? ` ${it.width} × ${it.length} m` : ''}`;
  if (it.kind === 'mattress') return `${it.qty > 1 ? `${it.qty} × ` : ''}Colchão ${MATTRESS.find(m => m.id === it.size)?.label ?? ''}${it.pack === 'premium' ? ' + anti-ácaros' : ''}`;
  const pack = it.leather ? 'pele: limpeza + tratamento da pele' : PACKS.find(p => p.pack === it.pack)!.name;
  if (it.kind === 'chairs') return `${it.qty} cadeiras · ${pack}`;
  const seats = it.seats ?? Number(it.size?.split('-')[0]);
  return `${it.qty > 1 ? `${it.qty} × ` : ''}Sofá ${seats} ${seats === 1 ? 'lugar' : 'lugares'} · ${pack}`;
}

type Quote = { ok: boolean; total?: number | null; quote?: boolean; travel?: number | null; lines?: { amount: number | null; quote: boolean }[] };

export function quoteBasket(city: string, items: BasketItem[]) {
  const q = items.map(toQuote);
  const valid = q.filter(Boolean) as QuoteItem[];
  if (!valid.length) return { total: null as number | null, travel: null as number | null, sob: items.some(i => isRug(i.kind)), lines: [] as (number | null)[] };
  const r = botQuote({ city, items: valid }) as Quote;
  if (!r.ok) return { total: null, travel: null, sob: true, lines: [] };
  // Linhas do motor pela mesma ordem dos itens válidos; um tapete é sempre "sob orçamento" no site.
  let k = 0;
  const lines = q.map((x, i) => (x ? (isRug(items[i].kind) ? (k++, null) : r.lines?.[k++]?.amount ?? null) : null));
  const sob = items.some(i => isRug(i.kind)) || !!r.quote;
  const known = sob ? lines.reduce<number>((s, v) => s + (v ?? 0), 0) + (r.travel ?? 0) : null;
  return { total: sob ? (known && known > 0 ? known : null) : (typeof r.total === 'number' ? r.total : null), travel: r.travel ?? null, sob, lines };
}

interface Props { isOpen: boolean; onClose: () => void; initialCity?: string; initialItems?: BasketItem[] }

export default function VisitBasket({ isOpen, onClose, initialCity = '', initialItems = [] }: Props) {
  const navigate = useNavigate();
  const [city, setCity] = useState(initialCity);
  const [items, setItems] = useState<BasketItem[]>(initialItems);
  const [editing, setEditing] = useState<BasketItem | null>(null);
  const [step, setStep] = useState<'basket' | 'contact'>('basket');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [failed, setFailed] = useState(false);

  // Cada abertura a partir do widget traz a escolha dessa altura.
  useEffect(() => {
    if (!isOpen) return;
    setCity(initialCity); setItems(initialItems); setStep('basket'); setFailed(false);
    if (!initialItems.length) setEditing(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [isOpen]);

  const cityNames = useMemo(() => listBotCities().map(c => c.name), []);
  const quote = useMemo(() => quoteBasket(city, items), [city, items]);
  const { isSubmitting, submit } = useQuizSubmission({ trackSubmission: () => {}, resetForm: () => {}, onClose, navigate });

  if (!isOpen) return null;

  const priceText = quote.total === null ? 'Sob orçamento' : quote.sob ? `${formatEuro(quote.total)} + tapetes sob orçamento` : formatEuro(quote.total);
  const phoneOk = phone.replace(/\D/g, '').length >= 9;
  const canContinue = items.length > 0 && city.trim().length > 1;

  const send = async () => {
    const labels = items.map(itemLabel);
    const main = items[0];
    const details = labels.join(' | ');
    const payload: QuizLeadPayload = {
      name: name.trim(), phone: phone.trim(), email: '', photos: [], finalLocation: city.trim(),
      service: main.kind === 'rug' || main.kind === 'carpet' ? 'carpet' : main.kind, serviceType: main.pack === 'none' ? 'cleaning' : 'both',
      waterproofingTier: main.pack === 'essencial' ? 'essencial' : 'premium',
      serviceLabel: KIND_LABEL[main.kind], serviceTypeLabel: 'Cesto da visita', crmServiceLabel: [...new Set(items.map(i => KIND_LABEL[i.kind]))].join(' + '),
      detailsSummary: details, priceText,
      message: `Pedido pelo site (${city.trim()}): ${details}. Total: ${priceText}, deslocação incluída.`,
      sofaItems: [], mattressItems: [], upsellItems: [], carpetItems: [], chairQuantity: '0', chairWaterproofQty: 0, chairAntiAcaros: false,
      calculateServicePrice: quote.total ?? 0, totalPrice: quote.total ?? 0, hasSobOrcamento: quote.sob, hasUpsellSobItem: false,
      finalTravelCost: quote.travel ?? 0, hypoallergenic: null, hypoSurcharge: 0, slotLabel: '',
      carpetKind: items.some(i => i.kind === 'carpet') ? 'alcatifa' : 'tapete',
      basketOrder: {
        ...buildQuizOrder({ service: main.kind === 'rug' || main.kind === 'carpet' ? 'carpet' : main.kind, serviceType: 'both', waterproofingTier: 'premium', sofaItems: [], mattressItems: [], upsellItems: [], carpetItems: [], chairQuantity: '0', chairWaterproofQty: 0, chairAntiAcaros: false, finalLocation: city.trim(), totalPrice: quote.total ?? 0, hasSobOrcamento: quote.sob, hasUpsellSobItem: false, priceText, slotLabel: '' },
          items.map((it, i) => ({ label: labels[i], qty: it.qty, total: quote.lines[i] ?? null }))),
        quote: { items: items.map(toQuote).filter(Boolean) as QuoteItem[], exact: true },
        rugs: items.filter(i => isRug(i.kind) && num(i.width) && num(i.length)).map(i => ({ kind: i.kind as 'rug' | 'carpet', typed: `${i.width} × ${i.length}`, width: num(i.width), length: num(i.length), areaM2: Math.round(num(i.width) * num(i.length) * 100) / 100, fromCm: false, doubtful: false })),
        rugPickup: items.some(i => isRug(i.kind)) ? false : null,
      },
    };
    const r = await submit(payload);
    if (!r.success) setFailed(true);
  };

  const saveEditing = () => {
    if (!editing) return;
    setItems(list => (list.some(i => i.id === editing.id) ? list.map(i => (i.id === editing.id ? editing : i)) : [...list, editing]));
    setEditing(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#FAF8F3]" role="dialog" aria-modal="true" aria-label="Orçamento da visita">
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3">
        {step === 'contact'
          ? <button type="button" onClick={() => setStep('basket')} className="flex min-h-11 items-center gap-1 text-sm font-semibold text-[#1A1A1A]"><ArrowLeft className="h-4 w-4" />Voltar</button>
          : <span className="font-playfair text-lg font-bold text-[#111]">A sua <span style={{ color: GOLD }}>visita</span></span>}
        <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-11 w-11 items-center justify-center rounded-full text-[#1A1A1A] hover:bg-black/5"><X className="h-5 w-5" /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        {step === 'basket' ? (
          <>
            <label className="mb-4 block">
              <span className="mb-1 block text-xs font-semibold text-[#1A1A1A]/70">Localidade</span>
              <input list="basket-cities" value={city} onChange={e => setCity(e.target.value)} placeholder="Ex.: Lisboa" className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-3 text-base text-[#111] outline-none focus:border-[#D4AF37]" />
              <datalist id="basket-cities">{cityNames.map(c => <option key={c} value={c} />)}</datalist>
            </label>

            <ul className="space-y-2">
              {items.map((it, i) => (
                <li key={it.id} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3">
                  <button type="button" onClick={() => setEditing(it)} className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-bold text-[#111]">{itemLabel(it)}</span>
                    <span className="text-xs text-[#1A1A1A]/60">{isRug(it.kind) ? 'Sob orçamento, conforme as medidas' : 'Tocar para alterar'}</span>
                  </button>
                  {!isRug(it.kind) && quote.lines[i] != null && <span className="text-sm font-bold text-[#111]">{formatEuro(quote.lines[i] as number)}</span>}
                  <button type="button" onClick={() => setItems(l => l.filter(x => x.id !== it.id))} aria-label={`Tirar ${itemLabel(it)}`} className="flex h-11 w-11 items-center justify-center rounded-full text-[#1A1A1A]/50 hover:bg-black/5"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>

            <h3 className="mb-2 mt-6 font-playfair text-xl font-bold text-[#111]">Juntar à mesma <span style={{ color: GOLD }}>visita</span></h3>
            <div className="grid grid-cols-2 gap-2">
              {(['sofa', 'mattress', 'chairs', 'rug', 'carpet'] as BasketKind[]).map(k => (
                <button key={k} type="button" onClick={() => setEditing(newItem(k))} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#D4AF37]/60 bg-white px-3 text-sm font-bold text-[#111] hover:bg-[#D4AF37]/10">
                  <Plus className="h-4 w-4" style={{ color: GOLD }} strokeWidth={3} />{KIND_LABEL[k]}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="mb-3 font-playfair text-2xl font-bold text-[#111]">Para onde enviamos as <span style={{ color: GOLD }}>horas</span>?</h3>
            <ul className="mb-4 space-y-1 rounded-2xl border border-black/10 bg-white p-3 text-sm text-[#111]">
              {items.map((it, i) => <li key={it.id} className="flex justify-between gap-2"><span>{itemLabel(it)}</span><span className="font-semibold">{isRug(it.kind) ? 'sob orçamento' : quote.lines[i] != null ? formatEuro(quote.lines[i] as number) : ''}</span></li>)}
              <li className="border-t border-black/10 pt-1 text-xs text-[#1A1A1A]/60">{city}, deslocação incluída no total</li>
            </ul>
            <label className="mb-3 block"><span className="mb-1 block text-xs font-semibold text-[#1A1A1A]/70">Nome</span>
              <input value={name} onChange={e => setName(e.target.value)} autoComplete="name" className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-3 text-base outline-none focus:border-[#D4AF37]" /></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-[#1A1A1A]/70">Telemóvel (WhatsApp)</span>
              <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="912 345 678" className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-3 text-base outline-none focus:border-[#D4AF37]" /></label>
            <p className="mt-3 text-xs text-[#1A1A1A]/60">Recebe o orçamento e as próximas horas livres no WhatsApp em menos de 1 minuto.</p>
            {failed && <a href={buildWaUrl({ hasSobOrcamento: quote.sob, hasUpsellSobItem: false }, 'SITE')} className="mt-3 block rounded-xl bg-[#25D366] p-3 text-center text-sm font-bold text-white">Não conseguimos enviar. Enviar pelo WhatsApp</a>}
          </>
        )}
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm text-[#1A1A1A]/70">Total, deslocação incluída</span>
          <span className="text-right"><span className="block text-xl font-bold text-[#111]">{!items.length ? '-' : quote.total === null ? 'Sob orçamento' : formatEuro(quote.total)}</span>{quote.sob && quote.total !== null && <span className="block text-xs text-[#1A1A1A]/60">+ tapetes sob orçamento</span>}</span>
        </div>
        {step === 'basket'
          ? <button type="button" disabled={!canContinue} onClick={() => setStep('contact')} className="min-h-12 w-full rounded-2xl bg-[#D4AF37] text-base font-bold text-[#111] disabled:opacity-40">Continuar</button>
          : <button type="button" disabled={!name.trim() || !phoneOk || isSubmitting} onClick={send} className="min-h-12 w-full rounded-2xl bg-[#D4AF37] text-base font-bold text-[#111] disabled:opacity-40">{isSubmitting ? 'A enviar…' : 'Receber o preço e as horas no WhatsApp'}</button>}
      </footer>

      {editing && <ItemSheet item={editing} onChange={setEditing} onSave={saveEditing} onCancel={() => setEditing(null)} />}
    </div>
  );
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" aria-label="Menos" onClick={() => onChange(Math.max(min, value - 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15"><Minus className="h-4 w-4" /></button>
      <span className="w-8 text-center text-lg font-bold">{value}</span>
      <button type="button" aria-label="Mais" onClick={() => onChange(Math.min(max, value + 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

function ItemSheet({ item, onChange, onSave, onCancel }: { item: BasketItem; onChange: (i: BasketItem) => void; onSave: () => void; onCancel: () => void }) {
  const set = (p: Partial<BasketItem>) => onChange({ ...item, ...p });
  const rug = isRug(item.kind);
  const seats = item.seats ?? Number(item.size?.split('-')[0]);
  const ok = !rug || (num(item.width) > 0 && num(item.length) > 0);
  const chip = (on: boolean) => `min-h-11 rounded-xl border-2 px-3 text-sm font-bold ${on ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#111]' : 'border-black/10 bg-white text-[#1A1A1A]/80'}`;
  return (
    <div className="fixed inset-0 z-[110] flex items-end bg-black/40" onClick={onCancel}>
      <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 pb-[max(16px,env(safe-area-inset-bottom))]" onClick={e => e.stopPropagation()}>
        <h3 className="mb-3 font-playfair text-xl font-bold text-[#111]">{KIND_LABEL[item.kind]}</h3>

        {item.kind === 'sofa' && <>
          <p className="mb-1 text-xs font-semibold text-[#1A1A1A]/70">Lugares</p>
          <div className="mb-3 grid grid-cols-6 gap-1.5">{SOFA_SEATS.map(s => <button key={s} type="button" className={chip(seats === s)} onClick={() => set(s === 6 ? { size: '5-lugares', seats: 6 } : { size: s === 1 ? '1-lugar' : `${s}-lugares`, seats: undefined })}>{s}</button>)}</div>
          <p className="mb-3 text-xs text-[#1A1A1A]/60">Canto, em U ou mais de 6 lugares: preço pela fotografia no WhatsApp.</p>
          <button type="button" className={`${chip(!!item.leather)} mb-3 w-full`} onClick={() => set({ leather: !item.leather })}>{item.leather ? <Check className="mr-1 inline h-4 w-4" /> : null}Sofá de pele</button>
        </>}
        {item.kind === 'mattress' && <>
          <p className="mb-1 text-xs font-semibold text-[#1A1A1A]/70">Tamanho</p>
          <div className="mb-3 grid grid-cols-3 gap-1.5">{MATTRESS.map(m => <button key={m.id} type="button" className={chip(item.size === m.id)} onClick={() => set({ size: m.id })}>{m.label}</button>)}</div>
          <button type="button" className={`${chip(item.pack === 'premium')} mb-3 w-full`} onClick={() => set({ pack: item.pack === 'premium' ? 'none' : 'premium' })}>{item.pack === 'premium' ? <Check className="mr-1 inline h-4 w-4" /> : null}Com anti-ácaros (produto Bactran)</button>
        </>}
        {(item.kind === 'sofa' || item.kind === 'mattress' || item.kind === 'chairs') && <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#111]">{item.kind === 'chairs' ? 'Cadeiras' : 'Quantidade'}</span>
          <Stepper value={item.qty} min={1} max={item.kind === 'chairs' ? 40 : 6} onChange={qty => set({ qty })} />
        </div>}
        {(item.kind === 'sofa' && !item.leather || item.kind === 'chairs') && <div className="mb-3 space-y-1.5">{PACKS.map(p => (
          <button key={p.pack} type="button" onClick={() => set({ pack: p.pack })} className={`${chip(item.pack === p.pack)} flex w-full items-center justify-between py-2 text-left`}>
            <span><span className="block">{p.name}</span><span className="block text-xs font-normal text-[#1A1A1A]/60">{p.note}</span></span>
            {item.pack === p.pack && <Check className="h-4 w-4" style={{ color: GOLD }} />}
          </button>))}</div>}
        {rug && <>
          <p className="mb-1 text-xs font-semibold text-[#1A1A1A]/70">Medidas em metros</p>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <input inputMode="decimal" placeholder="Largura (2,0)" value={item.width ?? ''} onChange={e => set({ width: e.target.value })} className="min-h-12 rounded-xl border border-black/15 px-3 text-base outline-none focus:border-[#D4AF37]" />
            <input inputMode="decimal" placeholder="Comprimento (3,0)" value={item.length ?? ''} onChange={e => set({ length: e.target.value })} className="min-h-12 rounded-xl border border-black/15 px-3 text-base outline-none focus:border-[#D4AF37]" />
          </div>
          <p className="mb-3 text-xs text-[#1A1A1A]/60">Sob orçamento: enviamos o preço no WhatsApp, conforme as medidas.</p>
        </>}
        <button type="button" disabled={!ok} onClick={onSave} className="min-h-12 w-full rounded-2xl bg-[#D4AF37] text-base font-bold text-[#111] disabled:opacity-40">Juntar à visita</button>
      </div>
    </div>
  );
}
