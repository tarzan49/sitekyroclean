// Cesto da visita (dono, 24 Nov 2026): o questionário novo, em dois ecrãs.
// 1) O cesto: o que veio do widget de preço já lá está; juntam-se sofás, colchões, cadeiras, tapetes e
//    alcatifas na mesma visita, cada um com o seu pack. O total é o do bot (botQuote do pedido inteiro,
//    deslocação incluída), nunca escrito à mão. Tapetes e alcatifas com o preço do bot (24 Nov 2026).
// 2) Contacto: nome e telemóvel. O pedido vai pelo mesmo envio (submit-lead + quiz_order), por isso a
//    mensagem automática e o funil do bot no WhatsApp continuam iguais.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Gift, Minus, Plus, Trash2, X } from 'lucide-react';
import { botQuote, listBotCities } from '@/lib/botQuote';
import { formatEuro } from '@/data/enginePrices';
import { buildQuizOrder, type QuoteItem } from '@/lib/quizOrder';
import { useQuizSubmission } from '@/hooks/use-quiz-submission';
import { type QuizLeadPayload } from '@/services/submissionService';
import { WHATSAPP_BASE } from '@/constants/business';
import { IS_PRODUCTION } from '@/lib/quizTracking';
import QuizFurnitureImage from './QuizFurnitureImage';
import { RUG_PRICE_FROM, CARPET_PRICE_FROM } from '@/constants/rugSitePrice';
import { CHAIR_PRICE_LABEL } from '@/data/enginePrices';
import imperPhoto from '@/assets/picker-premium-sofa.webp';
// Primeiro ecrã: vídeos reais da equipa a limpar em vez de fotografias (dono, 24 Nov: "vídeos de fundo a fazer a
// limpeza, com opacidade mais alta, na horizontal"). Os mesmos da página inicial; o tapete é a máquina de extração.
import sofaClip from '@/assets/sofa-processo/extracao.mp4';
import mattressClip from '@/assets/colchoes-processo/extracao.mp4';
import chairsClip from '@/assets/cadeiras-processo/extracao.mp4';
import rugClip from '@/assets/tapete-processo/maquina.mp4';
import carpetClip from '@/assets/alcatifa-processo/extracao.mp4';
import imperClip from '@/assets/before-after-pool/imper-agua-01.mp4';
// Impermeabilização das cadeiras: a prova do funil (água em gotas numa cadeira), não a escova da limpeza (dono, 25 Nov).
import imperChairsClip from '@/assets/before-after-pool/imper-agua-cadeira-01.mp4';
// Cartões de limpeza com o antes e depois que mais vende (dono, 25 Nov: "a melhor foto antes e depois que vendesse
// instantâneo"; imper continua com o vídeo). Pares do site, metade antes e metade depois do mesmo ângulo.
import baSofa from '@/assets/quiz-antes-depois/sofa.webp';
import baColchao from '@/assets/quiz-antes-depois/colchao.webp';
import baCadeiras from '@/assets/quiz-antes-depois/cadeiras.webp';
import baTapete from '@/assets/quiz-antes-depois/tapete.webp';
import { REVIEW_COUNT, REVIEW_RATING } from '@/constants/business';
import { Star } from 'lucide-react';
import type { QuizOrder } from '@/lib/quizOrder';

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
  odor?: boolean;         // tapete/alcatifa: anti-odor (5€/m², só com a limpeza)
  imperOnly?: boolean;    // sofá/cadeiras: só a impermeabilização, sem limpeza (dono, 25 Nov)
}
// Cartão "Impermeabilização" (dono, 25 Nov): só a impermeabilização (sem limpeza), primeiro a peça, depois Premium ou Essencial.
const IMPER_ONLY: { pack: BasketPack; name: string; note: string }[] = [
  { pack: 'premium', name: 'Premium', note: 'À base de solvente, até 10 anos' },
  { pack: 'essencial', name: 'Essencial', note: 'À base de água, 1 a 2 anos' },
];

const PACKS: { pack: BasketPack; name: string; note: string }[] = [
  { pack: 'premium', name: 'Blindado', note: 'Limpeza + Premium, até 10 anos' },
  { pack: 'essencial', name: 'Protegido', note: 'Limpeza + Essencial, 1 a 2 anos' },
  { pack: 'none', name: 'Renovado', note: 'Só limpeza' },
];
const SOFA_SEATS = [1, 2, 3, 4, 5, 6];
const CHAIR_QTY = [2, 4, 6, 8, 10, 12];
// Tamanhos de um toque (dono, 25 Nov: a janela do tapete "tá muito fraca"): os tapetes mais comuns e divisões
// típicas para a alcatifa; o preço de cada um é o do motor. "Outra medida" abre os campos.
const RUG_SIZES: { label: string; w: string; l: string }[] = [
  { label: 'Pequeno', w: '1,2', l: '1,7' }, { label: 'Médio', w: '1,6', l: '2,3' }, { label: 'Grande', w: '2', l: '3' }, { label: 'Muito grande', w: '2,5', l: '3,5' },
];
const CARPET_SIZES: { label: string; w: string; l: string }[] = [
  { label: 'Quarto', w: '3', l: '4' }, { label: 'Sala', w: '4', l: '6' }, { label: 'Escritório', w: '6', l: '8' }, { label: 'Espaço grande', w: '10', l: '10' },
];
const MATTRESS = [{ id: 'solteiro', label: 'Solteiro' }, { id: 'casal', label: 'Casal' }, { id: 'king', label: 'King / Queen' }];
const KIND_LABEL: Record<BasketKind, string> = { sofa: 'Sofá', mattress: 'Colchão', chairs: 'Cadeiras', rug: 'Tapete', carpet: 'Alcatifa' };
const GOLD = '#D4AF37';
const imgOf = (it: Pick<BasketItem, 'kind' | 'size'>) => <QuizFurnitureImage service={isRug(it.kind) ? 'carpet' : it.kind === 'chairs' ? 'chairs' : it.kind} sizeId={it.size} className="h-14 w-14 sm:h-14 sm:w-14" />;

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
    return w && l ? { kind: it.kind, qty: 1, treatment: 'clean', width: w, length: l, ...(it.odor ? { odor: true } : {}) } : null;
  }
  if (it.kind === 'mattress') return { kind: 'mattress', size: it.size, qty: it.qty, treatment: it.pack === 'premium' ? 'clean+anti-acaros' : 'clean' };
  const treatment = it.imperOnly && !it.leather && it.pack !== 'none' ? it.pack : it.leather || it.pack === 'none' ? 'clean' : it.pack === 'premium' ? 'clean+premium' : 'clean+essencial';
  if (it.kind === 'chairs') return { kind: 'chairs', qty: it.qty, treatment };
  const six = it.seats === 6;
  return { kind: 'sofa', size: six ? '5-lugares' : it.size, qty: it.qty, treatment, ...(six ? { seats: 6, look: 'compacto' } : {}), ...(it.leather ? { leather: true } : {}) };
}

export function itemLabel(it: BasketItem): string {
  if (isRug(it.kind)) return `${KIND_LABEL[it.kind]}${num(it.width) && num(it.length) ? ` ${it.width} × ${it.length} m` : ''}${it.odor ? ' + anti-odor' : ''}`;
  if (it.kind === 'mattress') return `${it.qty > 1 ? `${it.qty} × ` : ''}Colchão ${MATTRESS.find(m => m.id === it.size)?.label ?? ''}${it.pack === 'premium' ? ' + anti-ácaros' : ''}`;
  const pack = it.leather ? 'pele: limpeza + tratamento da pele' : it.imperOnly ? `só impermeabilização ${IMPER_ONLY.find(p => p.pack === it.pack)?.name ?? ''}` : PACKS.find(p => p.pack === it.pack)!.name;
  if (it.kind === 'chairs') return `${it.qty} cadeiras · ${pack}`;
  const seats = it.seats ?? Number(it.size?.split('-')[0]);
  return `${it.qty > 1 ? `${it.qty} × ` : ''}Sofá ${seats} ${seats === 1 ? 'lugar' : 'lugares'} · ${pack}`;
}

type Quote = { ok: boolean; total?: number | null; quote?: boolean; travel?: number | null; lines?: { amount: number | null; quote: boolean }[]; visitGifts?: { withoutGift?: number | null; gifts: { piece: 'mattress' | 'chairs' | 'rug' | 'carpet' | 'sofa'; treatment: 'anti-acaros' | 'anti-odor'; normal: number }[]; usual: number; total: number } | null };
export type BasketGift = NonNullable<Quote['visitGifts']>['gifts'][number];
const GIFT_LABEL: Record<string, string> = { 'sofa:tratamento-pele': 'o tratamento da pele no sofá', 'mattress:anti-acaros': 'o anti-ácaros no colchão', 'chairs:anti-acaros': 'o anti-ácaros nas cadeiras', 'sofa:anti-acaros': 'o anti-ácaros no sofá', 'rug:anti-odor': 'o anti-odor no tapete', 'carpet:anti-odor': 'o anti-odor na alcatifa', 'rug:anti-acaros': 'o anti-ácaros no tapete', 'carpet:anti-acaros': 'o anti-ácaros na alcatifa', 'sofa:anti-odor': 'o anti-odor no sofá' };
export const giftLabel = (g: BasketGift) => GIFT_LABEL[`${g.piece}:${g.treatment}`] ?? g.treatment;
const PLURAL: Record<string, string> = { mattress: 'colchões', rug: 'tapetes', carpet: 'alcatifas', sofa: 'sofás', chairs: 'cadeiras' };
/** Uma linha por oferta igual: duas ofertas de anti-odor em dois tapetes = "o anti-odor nos 2 tapetes", com os valores somados. */
export function groupGifts(gifts: BasketGift[]): { key: string; text: string; normal: number }[] {
  const out = new Map<string, { g: BasketGift; n: number; normal: number }>();
  for (const g of gifts) { const k = `${g.piece}:${g.treatment}`; const o = out.get(k); if (o) { o.n++; o.normal += g.normal; } else out.set(k, { g, n: 1, normal: g.normal }); }
  return [...out.entries()].map(([key, { g, n, normal }]) => {
    const what = g.treatment === 'anti-odor' ? 'o anti-odor' : 'o anti-ácaros';
    return { key, normal: Math.round(normal * 100) / 100, text: n > 1 ? `${what} ${g.piece === 'chairs' ? 'nas' : g.piece === 'carpet' ? 'nas' : 'nos'} ${n} ${PLURAL[g.piece] ?? g.piece}` : giftLabel(g) };
  });
}

export function quoteBasket(city: string, items: BasketItem[]) {
  const q = items.map(toQuote);
  const valid = q.filter(Boolean) as QuoteItem[];
  if (!valid.length) return { total: null as number | null, travel: null as number | null, sob: items.some(i => isRug(i.kind)), lines: [] as (number | null)[], gifts: [] as BasketGift[], usual: null as number | null, withoutGift: null as number | null };
  const r = botQuote({ city, items: valid }) as Quote;
  if (!r.ok) return { total: null, travel: null, sob: true, lines: [], gifts: [], usual: null, withoutGift: null };
  // Linhas do motor pela mesma ordem dos itens válidos. Tapetes com valor do bot desde 24 Nov 2026 (dono):
  // só tapetes = rugEstimate.homePrice (deslocação incluída); com outras peças = rugCombo.comboPrice.
  // Alcatifas também, por escalões da área (dono, 24 Nov 2026).
  const rx = r as Quote & { rugEstimate?: { ok: boolean; homePrice?: number } | null; rugCombo?: { ok: boolean; rugsWashing?: number; comboPrice?: number } | null };
  const rugValid = valid.filter(v => v.kind === 'rug' || v.kind === 'carpet');
  const othersValid = valid.length - rugValid.length;
  const rugAlone = rugValid.length > 0 && othersValid === 0 && rx.rugEstimate?.ok && typeof rx.rugEstimate.homePrice === 'number' ? rx.rugEstimate.homePrice : null;
  const rugCombo = rugValid.length > 0 && othersValid > 0 && rx.rugCombo?.ok && typeof rx.rugCombo.comboPrice === 'number' ? rx.rugCombo : null;
  const rugLine = rugAlone ?? rugCombo?.rugsWashing ?? null;
  let k = 0;
  // Vários tapetes: o motor dá um só valor para todos (lavagem somada); fica na linha do primeiro e os outros dizem "incluído".
  let firstRug = true;
  const lines = q.map((x, i) => (x ? (isRug(items[i].kind) ? (k++, firstRug ? (firstRug = false, rugLine) : null) : r.lines?.[k++]?.amount ?? null) : null));
  const missingRug = items.some(i => isRug(i.kind)) && rugAlone === null && !rugCombo;
  if (!missingRug && (rugAlone !== null || rugCombo)) {
    const othersSob = (r.lines ?? []).some((l, j) => l.quote && valid[j]?.kind !== 'rug' && valid[j]?.kind !== 'carpet');
    if (!othersSob) return { total: rugAlone ?? rugCombo!.comboPrice!, travel: rugAlone !== null ? null : 0, sob: false, lines, gifts: r.visitGifts?.gifts ?? [], usual: r.visitGifts?.usual ?? null, withoutGift: r.visitGifts?.withoutGift ?? null };
  }
  const sob = missingRug || !!r.quote;
  const known = sob ? lines.reduce<number>((s, v) => s + (v ?? 0), 0) + (r.travel ?? 0) : null;
  return { total: sob ? (known && known > 0 ? known : null) : (typeof r.total === 'number' ? r.total : null), travel: r.travel ?? null, sob, lines,
    // Escada A (dono, 24 Nov): várias peças = o total nunca desce, oferece-se um tratamento com o preço riscado.
    gifts: !sob && r.visitGifts ? r.visitGifts.gifts : [], usual: !sob && r.visitGifts ? r.visitGifts.usual : null, withoutGift: !sob && r.visitGifts ? r.visitGifts.withoutGift ?? null : null };
}

/** Cada peça pedida sozinha, com a sua deslocação (o motor): é o que cada linha do cesto mostra, por isso as
 *  linhas somadas com as ofertas dão o riscado ("o mesmo pedido em separado", dono 24 Nov). */
export const aloneTotal = (city: string, it: BasketItem) => { const q = quoteBasket(city, [it]); return q.total === null || q.sob ? null : q.total; };
/** O que uma peça a mais faz aparecer na escada A (dono, 25 Nov: "em cada [cartão] estar uma promoção"): as ofertas
 *  novas e quanto valem, pelo motor. */
export function giftsUnlocked(city: string, items: BasketItem[], add: BasketItem | BasketItem[]): { text: string; value: number; normal: number } | null {
  const before = new Map(groupGifts(quoteBasket(city, items).gifts).map(g => [g.key, g.normal]));
  const after = groupGifts(quoteBasket(city, [...items, ...(Array.isArray(add) ? add : [add])]).gifts);
  const fresh = after.filter(g => g.normal > (before.get(g.key) ?? 0));
  const value = fresh.reduce((t, g) => t + g.normal - (before.get(g.key) ?? 0), 0);
  return fresh.length && value > 0 ? { text: fresh.map(g => g.text).join(' e '), value, normal: fresh.reduce((t, g) => t + g.normal, 0) } : null;
}
/** Impermeabilização: a vantagem é a poupança do pack, limpeza + impermeabilização contra os dois em separado
 *  (dono, 25 Nov: "na imper a oferta é de poupança na limpeza"), pelo separatePrice do motor. */
export function packSaving(city: string, it: BasketItem): number | null {
  const q = toQuote(it);
  if (!q) return null;
  const r = botQuote({ city: city || 'Lisboa', items: [q] }) as { separatePrice?: { saving?: number } | null };
  const v = r.separatePrice?.saving;
  return typeof v === 'number' && v > 0 ? v : null;
}
/** O que cada cartão do "Juntar à mesma visita" mostra: a impermeabilização, a poupança do pack; as outras, a oferta que trazem. */
function promoOf(city: string, items: BasketItem[], e: { key: string; kind: BasketKind; over?: Partial<BasketItem> }): { kind: 'save' | 'gift'; value: number; what: string } | null {
  const it = newItem(e.kind, { ...e.over, ...(e.kind === 'rug' ? { width: '2', length: '3' } : e.kind === 'carpet' ? { width: '4', length: '5' } : {}) });
  // Impermeabilização sozinha: a vantagem é a deslocação já paga pelas outras peças (dono, 25 Nov).
  if (e.key === 'imper') {
    if (!items.length) return null;
    const alone = aloneTotal(city, it), q = quoteBasket(city, [...items, it]), line = q.sob ? null : q.lines[items.length] ?? null;
    return alone !== null && line !== null && alone > line ? { kind: 'save', value: Math.round((alone - line) * 100) / 100, what: '+ deslocação oferecida' } : null;
  }
  const g = giftsUnlocked(city, items, it);
  if (!g) return null;
  // O tratamento dito pelo nome (dono, 25 Nov: a oferta tem de ser o gancho do cartão).
  const what = /pele/.test(g.text) ? '+ tratamento da pele oferecido' : /anti-odor/.test(g.text) ? '+ anti-odor oferecido' : '+ anti-ácaros oferecido';
  return { kind: 'gift', value: g.value, what };
}
const JOIN_NAME: Record<string, string> = { sofa: 'um sofá', imper: 'a impermeabilização', mattress: 'um colchão', chairs: 'cadeiras', rug: 'um tapete', carpet: 'uma alcatifa' };
/** A peça pedida sozinha com cada serviço em separado (separatePrice.separate do motor). */
function separateOf(city: string, it: BasketItem | BasketItem[]): number | null {
  const list = (Array.isArray(it) ? it : [it]).map(toQuote);
  if (!list.length || list.some(x => !x)) return null;
  // Colchão com anti-ácaros: o motor dá o riscado em mattressMitePack (limpeza + anti-ácaros à parte, 40€).
  // Cadeiras com impermeabilização: chairsWas (1 cadeira × a quantidade, dono 24 Nov), só nos packs de 5 ou mais.
  const r = botQuote({ city: city || 'Lisboa', items: list as QuoteItem[] }) as { separatePrice?: { separate?: number } | null; mattressMitePack?: { separate?: number } | null; chairsWas?: number | null };
  const v = r.separatePrice?.separate ?? r.mattressMitePack?.separate ?? r.chairsWas;
  return typeof v === 'number' ? v : null;
}
/** Envio falhou (sessão SEO, 25 Nov): a mensagem de WhatsApp leva o pedido inteiro, porque o bot não o encontra no CRM. */
function fallbackMessage(city: string, items: BasketItem[], priceText: string, gifts: BasketGift[]): string {
  const offer = groupGifts(gifts).map(g => `oferecem ${g.text}`).join('; ');
  return `Olá! Gostaria de saber o preço e a disponibilidade para limpar em ${city.trim()}: ${items.map(itemLabel).join(', ')}. No site deu ${priceText}${cityKnown(city) ? ', com a deslocação incluída' : ''}${offer ? ` (${offer})` : ''}. O pedido pelo site deu erro.`;
}
/** Riscado de uma linha (a quantidade real, nunca 1 unidade × quantidade: as cadeiras têm escalões e a deslocação é
 *  uma só): as mesmas peças pedidas sozinhas, sem contar a oferta, mais o que o motor diz que cada unidade pouparia em
 *  separado (limpeza e impermeabilização, anti-ácaros). Cadeiras: o chairsWas do motor. */
export function struckOf(city: string, it: BasketItem): number | null {
  const q = quoteBasket(city, [it]);
  if (q.total === null || q.sob) return null;
  if (it.kind === 'chairs') return separateOf(city, it) ?? q.total;
  const one = { ...it, qty: 1 }, oneAlone = separateOf(city, one) ?? aloneTotal(city, one);
  if (oneAlone === null) return q.total;
  const sum = Math.round(oneAlone * it.qty * 100) / 100;
  if (it.qty === 1) return sum;
  // Com quantidade: o valor em separado que o motor dá para o conjunto. Se a quantidade desbloqueia uma oferta, esse
  // valor já conta a oferta (que o cesto mostra numa linha própria), por isso nunca passa de cada uma sozinha.
  const sep = separateOf(city, it);
  return q.gifts.length ? Math.min(sep ?? sum, sum) : sep ?? sum;
}
const capital = (t: string) => t.replace(/^o |^a /, '').replace(/^./, c => c.toUpperCase());

const SAVE_KEY = 'kyro_visit_basket';
function readSaved(): { city: string; items: BasketItem[] } | null {
  try { const v = JSON.parse(sessionStorage.getItem(SAVE_KEY) ?? 'null'); return v && Array.isArray(v.items) ? v : null; } catch { return null; }
}

// Fotografias reais da equipa, as mesmas do questionário antigo (dono gostou destas).
const PHOTO: Record<BasketKind, string> = { sofa: '/images/services/sofa.webp', mattress: '/images/services/colchao.webp', chairs: '/images/services/cadeira.webp', rug: '/images/services/tapete.webp', carpet: '/images/services/process-alcatifas.webp' };
/** "Desde" de cada artigo, pelo motor do bot (o artigo mais pequeno, só limpeza, sem deslocação); tapetes e alcatifas por m². */
function fromPrice(city: string, k: BasketKind): string {
  if (k === 'rug') return RUG_PRICE_FROM.replace(/^Desde/, 'desde');
  if (k === 'carpet') return CARPET_PRICE_FROM.replace(/^Desde/, 'desde');
  if (k === 'chairs') return `${CHAIR_PRICE_LABEL.toLowerCase()}/cadeira`;
  const item = k === 'sofa' ? { kind: 'sofa', size: '1-lugar' } : k === 'mattress' ? { kind: 'mattress', size: 'solteiro' } : { kind: 'chairs', qty: 1 };
  const r = botQuote({ city: city || 'Lisboa', items: [{ ...item, treatment: 'clean' }] }) as Quote;
  const v = r.ok ? r.lines?.[0]?.amount : null;
  return typeof v === 'number' ? `desde ${formatEuro(v)}` : '';
}

// Entrada do cesto (dono, 24 Nov: o questionário inteiro no formato novo): seis escolhas, cada uma com o "desde"
// do motor, o mesmo dos heróis. Impermeabilização = sofá com a proteção (Protegido; o pack escolhe-se na folha).
const ENTRY: { key: string; kind: BasketKind; label: string; short?: string; photo: string; clip: string; ba?: string; over?: Partial<BasketItem>; from: (city: string) => string }[] = [
  { key: 'sofa', kind: 'sofa', label: 'Sofá', photo: PHOTO.sofa, clip: sofaClip, ba: baSofa, over: { pack: 'none' }, from: c => fromPrice(c, 'sofa') },
  { key: 'imper', kind: 'sofa', label: 'Impermeabilização', short: 'Impermea\u00ADbilização', photo: imperPhoto, clip: imperClip, over: { pack: 'premium', imperOnly: true }, from: c => waterproofFrom(c) },
  { key: 'mattress', kind: 'mattress', label: 'Colchão', photo: PHOTO.mattress, clip: mattressClip, ba: baColchao, from: c => fromPrice(c, 'mattress') },
  { key: 'chairs', kind: 'chairs', label: 'Cadeiras', photo: PHOTO.chairs, clip: chairsClip, ba: baCadeiras, over: { pack: 'none' }, from: c => fromPrice(c, 'chairs') },
  { key: 'rug', kind: 'rug', label: 'Tapete', photo: PHOTO.rug, clip: rugClip, ba: baTapete, from: c => fromPrice(c, 'rug') },
  { key: 'carpet', kind: 'carpet', label: 'Alcatifa', photo: PHOTO.carpet, clip: carpetClip, from: c => fromPrice(c, 'carpet') },
];
const CLIP: Record<BasketKind, string> = { sofa: sofaClip, mattress: mattressClip, chairs: chairsClip, rug: rugClip, carpet: carpetClip };
function waterproofFrom(city: string): string {
  const r = botQuote({ city: city || 'Lisboa', items: [{ kind: 'sofa', size: '1-lugar', treatment: 'essencial' }] }) as Quote;
  const v = r.ok ? r.lines?.[0]?.amount : null;
  return typeof v === 'number' ? `desde ${formatEuro(v)}` : '';
}

/** A localidade tem preço fechado no motor? (Sem ela, ou numa que ele não conhece, o preço fica sem a deslocação.) */
export function cityKnown(city: string): boolean {
  if (city.trim().length < 2) return false;
  const r = botQuote({ city, items: [{ kind: 'sofa', size: '3-lugares', qty: 1, treatment: 'clean' }] }) as Quote;
  return r.ok && !r.quote;
}
const plain = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const FIRST_CITIES = ['Lisboa', 'Porto', 'Vila Nova de Gaia', 'Sintra', 'Cascais', 'Braga'];

interface Props { isOpen: boolean; onClose: () => void; initialCity?: string; initialItems?: BasketItem[]; startKind?: BasketKind }

export default function VisitBasket({ isOpen, onClose, initialCity = '', initialItems = [], startKind }: Props) {
  const navigate = useNavigate();
  const [city, setCity] = useState(initialCity);
  const [items, setItems] = useState<BasketItem[]>(initialItems);
  const [editing, setEditing] = useState<BasketItem | null>(null);
  const [imperPick, setImperPick] = useState(false);
  // Localidade antes da peça (dono, 25 Nov): sem ela as opções ficavam sem preço. Fica guardado o que se ia abrir.
  const [askCity, setAskCity] = useState<BasketItem | 'imper' | null>(null);
  const [cityAccepted, setCityAccepted] = useState('');
  const cityReady = (c: string) => cityKnown(c) || (c.trim().length > 1 && plain(c) === plain(cityAccepted));
  const go = (what: BasketItem | 'imper') => (what === 'imper' ? setImperPick(true) : setEditing(what));
  const open = (what: BasketItem | 'imper') => (cityReady(city) ? go(what) : setAskCity(what));
  const pick = (e: (typeof ENTRY)[number]) => open(e.key === 'imper' ? 'imper' : newItem(e.kind, e.over));
  const answerCity = (c: string) => { const what = askCity; setCity(c); setCityAccepted(c); setAskCity(null); if (what) go(what); };
  const [step, setStep] = useState<'basket' | 'contact'>('basket');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [failed, setFailed] = useState(false);
  // Fora de produção nada é enviado: mostra-se o pedido tal como o bot o vai ler, para testar.
  const [testOrder, setTestOrder] = useState<QuizOrder | null>(null);

  // Cada abertura a partir do widget traz a escolha dessa altura.
  useEffect(() => {
    if (!isOpen) return;
    // O cesto guardado na sessão volta se a página se refizer (recarregar, voltar atrás): nunca se perde um artigo.
    const saved = readSaved();
    const same = saved && (!initialItems.length || saved.items[0] && initialItems[0] && ['kind', 'size', 'seats', 'pack', 'qty'].every(k => (saved.items[0] as unknown as Record<string, unknown>)[k] === (initialItems[0] as unknown as Record<string, unknown>)[k]));
    setCity(same ? saved.city : initialCity); setItems(same ? saved.items : initialItems); setStep('basket'); setFailed(false); setTestOrder(null);
    // Aberto numa página de um serviço (tapetes, colchões…) sem artigo escolhido: abre logo esse artigo.
    const first = !initialItems.length && startKind && !(saved && saved.items.length) ? newItem(startKind) : null;
    const firstCity = same ? saved.city : initialCity;
    setImperPick(false); setEditing(first && cityKnown(firstCity) ? first : null); setAskCity(first && !cityKnown(firstCity) ? first : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  useEffect(() => { if (isOpen && items !== initialItems) try { sessionStorage.setItem(SAVE_KEY, JSON.stringify({ city, items })); } catch { /* sem armazenamento */ } }, [isOpen, city, items]);
  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [isOpen]);

  // Voltar atrás (dono, 25 Nov: "não consegues voltar para trás nunca"): cada ecrã é um passo no histórico do
  // navegador, por isso o voltar do telemóvel faz o mesmo que o botão Voltar (fecha a peça, volta do contacto ao
  // cesto e, por fim, fecha o questionário) em vez de sair do site.
  const level = isOpen ? 1 + (editing || imperPick || askCity ? 1 : 0) + (step === 'contact' ? 1 : 0) : 0;
  const live = useRef({ level, editing, imperPick, askCity, step, onClose });
  live.current = { level, editing, imperPick, askCity, step, onClose };
  const hist = useRef({ depth: 0, skip: 0, leaving: false, timer: 0 });
  useEffect(() => {
    const h = hist.current;
    if (h.timer) { clearTimeout(h.timer); h.timer = 0; }
    const onPop = () => {
      // Um passo que nós mesmos recuámos (Voltar do ecrã, fechar): a conta já foi acertada, não se desconta outra vez.
      if (h.skip > 0) { h.skip -= 1; return; }
      h.depth = Math.max(0, h.depth - 1);
      const s = live.current;
      if (s.level <= h.depth) return;
      if (s.editing) { if (s.editing.imperOnly) setImperPick(true); setEditing(null); } else if (s.imperPick) setImperPick(false); else if (s.askCity) setAskCity(null); else if (s.step === 'contact') setStep('basket'); else s.onClose();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      h.timer = window.setTimeout(() => { h.timer = 0; if (h.depth > 0 && !h.leaving) { const d = h.depth; h.depth = 0; window.history.go(-d); } }, 0);
    };
  }, []);
  useEffect(() => {
    const h = hist.current;
    if (h.leaving) { h.depth = level; if (!level) h.leaving = false; return; }
    while (h.depth < level) { h.depth += 1; window.history.pushState({ ...(window.history.state ?? {}), kyroQuiz: h.depth }, ''); }
    if (level < h.depth) { const d = h.depth - level; h.depth = level; h.skip += 1; window.history.go(-d); }
  }, [level]);
  const leave = () => { hist.current.leaving = true; onClose(); };

  const cityNames = useMemo(() => listBotCities().map(c => c.name), []);
  const quote = useMemo(() => quoteBasket(city, items), [city, items]);
  const { isSubmitting, submit } = useQuizSubmission({ trackSubmission: () => {}, resetForm: () => {}, onClose: leave, navigate });

  if (!isOpen) return null;

  const priceText = quote.total === null ? 'Sob orçamento' : !cityKnown(city) ? `${formatEuro(quote.total)} sem a deslocação, a confirmar` : quote.sob ? `${formatEuro(quote.total)} + artigos sob orçamento` : formatEuro(quote.total);
  const phoneOk = phone.replace(/\D/g, '').length >= 9;
  const canContinue = items.length > 0 && city.trim().length > 1;

  const send = async () => {
    const labels = items.map(itemLabel);
    const main = items[0];
    const giftText = groupGifts(quote.gifts).map(g => `oferecemos ${g.text} (normalmente ${formatEuro(g.normal)})`).join('; ');
    const details = [labels.join(' | '), giftText].filter(Boolean).join(' | ');
    const payload: QuizLeadPayload = {
      name: name.trim(), phone: phone.trim(), email: '', photos: [], finalLocation: city.trim(),
      service: main.kind === 'rug' || main.kind === 'carpet' ? 'carpet' : main.kind, serviceType: main.pack === 'none' ? 'cleaning' : 'both',
      waterproofingTier: main.pack === 'essencial' ? 'essencial' : 'premium',
      serviceLabel: KIND_LABEL[main.kind], serviceTypeLabel: 'Cesto da visita', crmServiceLabel: [...new Set(items.map(i => KIND_LABEL[i.kind]))].join(' + '),
      detailsSummary: details, priceText,
      message: `Pedido pelo site (${city.trim()}): ${details}. Total: ${priceText}${quote.usual !== null && quote.usual > (quote.total ?? 0) ? ` (em vez de ${formatEuro(quote.usual)})` : ''}${cityKnown(city) ? ', deslocação incluída' : ''}.`,
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
    if (!IS_PRODUCTION) { setTestOrder(payload.basketOrder ?? null); return; }
    const r = await submit(payload);
    if (!r.success) setFailed(true);
  };

  // Uma janela pode juntar várias peças de uma vez (dono, 25 Nov: "2 sofás de 2 lugares e 1 de 3"): substituem a que se editava.
  const saveEditing = (group: BasketItem[]) => {
    if (!editing) return;
    setItems(list => { const at = list.findIndex(i => i.id === editing.id); const rest = list.filter(i => i.id !== editing.id); return at < 0 ? [...rest, ...group] : [...rest.slice(0, at), ...group, ...rest.slice(at)]; });
    // Impermeabilização: volta a "O que vamos impermeabilizar?" para poder juntar a outra peça (dono, 25 Nov).
    if (editing.imperOnly) setImperPick(true);
    setEditing(null);
  };

  if (testOrder) {
    // O mesmo cálculo que o bot faz quando recebe o pedido (botQuote dos itens do quiz_order).
    const bot = botQuote({ city: testOrder.city, items: testOrder.quote.items }) as Quote;
    const botTotal = bot.ok && !bot.quote && typeof bot.total === 'number' ? bot.total : null;
    const same = testOrder.total === null ? botTotal === null || testOrder.sobOrcamento : botTotal === testOrder.total;
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0B2F2A] bg-gradient-to-b from-[#0B2F2A] to-[#071a12] text-white p-4" role="dialog" aria-modal="true" aria-label="Teste do pedido">
        <p className="mb-2 text-xs font-bold uppercase text-white/60">Teste (não foi enviado)</p>
        <h3 className={`mb-3 text-2xl font-bold ${same ? 'text-[#7BD8A6]' : 'text-[#FF8A80]'}`}>{same ? 'Pedido aceite' : 'Pedido com diferença'}</h3>
        <ul className="mb-3 space-y-1 rounded-2xl border border-[#D4AF37]/25 bg-white/[0.05] p-3 text-sm">
          <li><b>Nome:</b> {name} · <b>Telemóvel:</b> {phone}</li>
          <li><b>Localidade:</b> {testOrder.city}</li>
          {testOrder.lines.map((l, i) => <li key={i}>{l.label}: {l.price === null ? 'sob orçamento' : formatEuro(l.price)}</li>)}
          <li><b>Total no site:</b> {testOrder.priceText}</li>
          <li><b>Total que o bot calcula:</b> {botTotal === null ? 'sob orçamento' : formatEuro(botTotal)}</li>
          <li><b>Itens para o bot:</b> {testOrder.quote.items.length}{testOrder.rugs.length ? ` (${testOrder.rugs.length} tapete/alcatifa com medidas)` : ''}</li>
        </ul>
        <p className="mb-4 text-xs text-white/60">Em produção, este pedido vai para o CRM e o cliente recebe no WhatsApp a mensagem automática do questionário.</p>
        <button type="button" onClick={() => setTestOrder(null)} className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E8C964] font-bold text-[#0B2F2A] shadow-[0_8px_24px_-8px_rgba(212,175,55,0.6)]">Voltar ao cesto</button>
      </div>
    );
  }

  return (
    // Computador (dono, 24 Nov: "no PC está horrível, super confuso"): cartão centrado da largura de um telemóvel,
    // por cima da página escurecida; no telemóvel continua a ocupar o ecrã todo.
    <div className="fixed inset-0 z-[100] md:flex md:items-center md:justify-center md:bg-black/60 md:p-6" onClick={e => { if (e.target === e.currentTarget && window.matchMedia('(min-width: 768px)').matches) onClose(); }}>
    <div className="relative flex h-full w-full flex-col bg-[#0B2F2A] bg-gradient-to-b from-[#0B2F2A] to-[#071a12] text-white md:h-[min(760px,92vh)] md:max-w-[520px] md:overflow-hidden md:rounded-3xl md:border md:border-[#D4AF37]/30 md:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]" role="dialog" aria-modal="true" aria-label="Orçamento da visita">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        {step === 'contact'
          ? <button type="button" onClick={() => setStep('basket')} className="flex min-h-11 items-center gap-1 text-sm font-semibold text-white"><ArrowLeft className="h-4 w-4" />Voltar</button>
          : <span className="flex flex-col"><span className="font-playfair text-xl font-semibold text-white">A sua <span style={{ color: GOLD }}>visita</span></span><span className="flex items-center gap-1 text-[11px] text-white/60"><Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />{REVIEW_RATING} em {REVIEW_COUNT}+ avaliações Google</span></span>}
        <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10"><X className="h-5 w-5" /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        {step === 'basket' ? (
          <>
            {items.length === 0 ? (
              <>
                <h2 className="type-section-title font-playfair mb-2 text-white">O que vamos <em className="not-italic" style={{ color: GOLD }}>limpar?</em></h2>
                <p className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-[#E8C964]"><Gift className="h-4 w-4 shrink-0" />2 peças ou mais: um tratamento oferecido</p>
                <label className="mb-3 flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3">
              <span className="text-xs font-semibold text-white/60">Localidade</span>
              <input list="basket-cities" value={city} onChange={e => setCity(e.target.value)} placeholder="Onde é o serviço?" className="h-11 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/35" />
              <datalist id="basket-cities">{cityNames.map(c => <option key={c} value={c} />)}</datalist>
            </label>
                <div className="grid grid-cols-2 gap-2">
                  {ENTRY.map(e => (
                    <button key={e.key} type="button" onClick={() => pick(e)} className="group relative h-[104px] overflow-hidden rounded-2xl border border-[#D4AF37]/30 text-left active:scale-[0.98]">
                      {e.ba ? <><img src={e.ba} alt={`${e.label}: antes e depois da limpeza`} className="absolute inset-0 h-full w-full object-cover" style={e.kind === 'chairs' ? { objectPosition: '50% 85%' } : undefined} /></> : <video src={e.clip} poster={e.photo} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />}
                      <span className="absolute inset-0 bg-gradient-to-t from-[#071a12]/90 via-[#071a12]/25 to-transparent" />
                      <span className="absolute inset-x-2.5 bottom-2">
                        <span className="block text-[15px] font-bold leading-tight text-white">{e.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
            <>
            {/* Cesto com peças (dono, 25 Nov): as peças primeiro, depois a localidade e, por baixo, as seis escolhas para
                juntar em grelha de 3 + 3 com os vídeos (a fila de botões em cima era pouco esclarecedora). */}
            <ul className="mb-3 divide-y divide-white/10 overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-white/[0.04]">
              {items.map((it, i) => (
                <li key={it.id} className="flex min-h-[64px] items-center gap-2 pl-2">
                  <button type="button" onClick={() => open(it)} className="flex min-w-0 flex-1 items-center gap-2.5 py-2 text-left" aria-label={`Alterar ${itemLabel(it)}`}>
                    <QuizFurnitureImage service={isRug(it.kind) ? 'carpet' : it.kind} sizeId={it.size} className="h-12 w-12 sm:h-12 sm:w-12" />
                    <span className="min-w-0"><span className="block text-sm font-semibold leading-snug text-white">{itemLabel(it)}</span><span className="block text-xs font-semibold text-[#D4AF37]">Alterar</span></span>
                  </button>
                  <span className="shrink-0 text-sm font-bold text-white">{(() => { const v = aloneTotal(city, it); return v != null ? formatEuro(v) : null; })()}</span>
                  <button type="button" onClick={() => setItems(l => l.filter(x => x.id !== it.id))} aria-label={`Tirar ${itemLabel(it)}`} className="flex h-11 w-10 shrink-0 items-center justify-center text-white/45 hover:text-white"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
              {/* A oferta da escada A como linha própria (dono, 25 Nov: "só mais colchão e anti-ácaros está oferecido, isso é top"). */}
              {groupGifts(quote.gifts).map(g => (
                <li key={g.key} className="flex min-h-[60px] items-center gap-2.5 border-l-4 border-[#D4AF37] bg-gradient-to-r from-[#D4AF37]/25 to-[#D4AF37]/5 px-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-[#0B2F2A]"><Gift className="h-5 w-5" strokeWidth={2.5} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-bold leading-snug text-white">{capital(g.text)}</span><span className="block text-xs font-semibold text-[#E8C964]">Por juntar na mesma visita</span></span>
                  <span className="shrink-0 pr-1 text-right"><span className="block text-xs text-white/55 line-through">{formatEuro(g.normal)}</span><span className="mt-0.5 inline-block rounded-md bg-[#D4AF37] px-1.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#0B2F2A]">Oferecido</span></span>
                </li>
              ))}
            </ul>
            <label className="mb-4 flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3">
              <span className="text-xs font-semibold text-white/60">Localidade</span>
              <input list="basket-cities" value={city} onChange={e => setCity(e.target.value)} placeholder="Onde é o serviço?" className="h-11 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/35" />
              <datalist id="basket-cities">{cityNames.map(c => <option key={c} value={c} />)}</datalist>
            </label>
            <p className="mb-1 text-base font-semibold text-white">Quanto mais junta, mais <span style={{ color: GOLD }}>poupa</span></p>
            {(() => {
              // "Se juntar X, poupa Y" (dono, 25 Nov): a peça que mais dá, pelo motor; sem nenhuma, a frase geral.
              const best = ENTRY.map(e => ({ e, p: promoOf(city, items, e) })).filter(x => x.p).sort((x, y) => y.p!.value - x.p!.value)[0];
              return <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#E8C964]"><Gift className="h-4 w-4 shrink-0" />{best ? <>Se juntar {JOIN_NAME[best.e.key]}, poupa {formatEuro(best.p!.value)}</> : 'Cada peça a mais traz um tratamento oferecido'}</p>;
            })()}
            <div className="grid grid-cols-2 gap-2">
              {ENTRY.map(e => {
                const promo = promoOf(city, items, e);
                return (
                <button key={e.key} type="button" onClick={() => pick(e)} aria-label={`Juntar ${e.label}`} className={`group relative h-[118px] overflow-hidden rounded-2xl border text-left active:scale-[0.98] ${promo ? 'border-[#D4AF37]/70' : 'border-white/15'}`}>
                  {e.ba ? <><img src={e.ba} alt={`${e.label}: antes e depois da limpeza`} className="absolute inset-0 h-full w-full object-cover" style={e.kind === 'chairs' ? { objectPosition: '50% 85%' } : undefined} /></> : <video src={e.clip} poster={e.photo} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />}
                  {/* Vidro neutro só atrás do texto, com o vídeo a ver-se através (dono, 25 Nov: "não tornas verde"). */}
                  <span className="absolute inset-x-0 bottom-0 flex items-end gap-1 bg-black/45 px-1.5 pb-1.5 pt-1 backdrop-blur-md">
                    <span className="min-w-0 flex-1">
                      <span className="block whitespace-nowrap text-sm font-bold leading-tight text-white drop-shadow">{e.label}</span>
                      {/* Só "+ oferta" / "+ poupa", sem o tratamento nem o valor (dono, 25 Nov): o valor aparece depois de escolher. */}
                      {promo && <span className="mt-0.5 block whitespace-nowrap text-xs font-bold leading-tight text-[#E8C964] drop-shadow">{promo.kind === 'save' ? '+ poupa' : '+ oferta'}</span>}
                    </span>
                  </span>
                </button>
                );
              })}
            </div>
            </>
            )}

          </>
        ) : (
          <>
            <h2 className="type-section-title font-playfair mb-4 text-white">Para onde enviamos as <em className="not-italic" style={{ color: GOLD }}>horas?</em></h2>
            <ul className="mb-4 space-y-1 rounded-2xl border border-[#D4AF37]/25 bg-white/[0.05] p-3 text-sm text-white">
              {items.map(it => <li key={it.id} className="flex justify-between gap-2"><span>{itemLabel(it)}</span><span className="font-semibold">{(() => { const v = aloneTotal(city, it); return v != null ? formatEuro(v) : ''; })()}</span></li>)}
              {groupGifts(quote.gifts).map(g => <li key={g.key} className="flex justify-between gap-2 text-[#E8C964]"><span>{capital(g.text)}</span><span className="font-semibold"><span className="mr-1.5 text-white/45 line-through">{formatEuro(g.normal)}</span>Oferecido</span></li>)}
              <li className="border-t border-white/10 pt-1 text-xs text-white/60">{cityKnown(city) ? `${city}, deslocação incluída no total` : `${city}, deslocação a confirmar no WhatsApp`}</li>
            </ul>
            <label className="mb-3 block"><span className="mb-1 block text-xs font-semibold text-white/70">Nome</span>
              <input value={name} onChange={e => setName(e.target.value)} autoComplete="name" className="min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 text-white placeholder:text-white/35 text-base outline-none focus:border-[#D4AF37]" /></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-white/70">Telemóvel (WhatsApp)</span>
              <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="912 345 678" className="min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 text-white placeholder:text-white/35 text-base outline-none focus:border-[#D4AF37]" /></label>
            <p className="mt-3 text-xs text-white/60">Recebe o orçamento e as próximas horas livres no WhatsApp em menos de 1 minuto.</p>
            {failed && <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(fallbackMessage(city, items, priceText, quote.gifts))}`} data-tracking-source="basket_fallback" target="_blank" rel="noopener noreferrer" className="mt-3 block rounded-xl bg-[#25D366] p-3 text-center text-sm font-bold text-white">Não conseguimos enviar. Enviar pelo WhatsApp</a>}
          </>
        )}
      </div>

      <footer className="fixed inset-x-0 bottom-0 md:absolute border-t border-[#D4AF37]/25 bg-[#071a12]/95 backdrop-blur px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm text-white/70">{items.length > 0 && !cityKnown(city) ? 'Subtotal, sem a deslocação' : 'Total, deslocação incluída'}</span>
          <span className="text-right">{quote.usual !== null && quote.total !== null && quote.usual > quote.total && <span className="mr-2 text-sm text-white/50 line-through">{formatEuro(quote.usual)}</span>}<span className="inline-block text-xl font-bold text-white">{!items.length ? '-' : quote.total === null ? 'Sob orçamento' : formatEuro(quote.total)}</span>{quote.sob && quote.total !== null && <span className="block text-xs text-white/60">{!city.trim() ? 'falta a localidade' : !cityKnown(city) ? 'deslocação a confirmar no WhatsApp' : items.some(i => isRug(i.kind)) ? '+ tapetes sob orçamento' : 'a confirmar no WhatsApp'}</span>}{quote.usual !== null && quote.total !== null && quote.usual > quote.total && <span className="block text-xs font-bold text-[#E8C964]">Poupa {formatEuro(quote.usual - quote.total)}</span>}</span>
        </div>
        {step === 'basket'
          ? <button type="button" disabled={!canContinue} onClick={() => setStep('contact')} className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E8C964] text-base font-bold text-[#0B2F2A] shadow-[0_8px_24px_-8px_rgba(212,175,55,0.6)] disabled:opacity-40">Continuar</button>
          : <button type="button" disabled={!name.trim() || !phoneOk || isSubmitting} onClick={send} className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E8C964] text-base font-bold text-[#0B2F2A] shadow-[0_8px_24px_-8px_rgba(212,175,55,0.6)] disabled:opacity-40">{isSubmitting ? 'A enviar…' : 'Receber o preço e as horas no WhatsApp'}</button>}
      </footer>

      {askCity && !editing && (() => {
        const q = plain(city), known = cityKnown(city);
        const options = (q ? cityNames.filter(c => plain(c).startsWith(q)).concat(cityNames.filter(c => !plain(c).startsWith(q) && plain(c).includes(q))) : FIRST_CITIES.filter(c => cityNames.includes(c))).slice(0, 6);
        return <div className="absolute inset-0 z-20 flex flex-col bg-[#0B2F2A] bg-gradient-to-b from-[#0B2F2A] to-[#071a12] text-white" role="dialog" aria-modal="true" aria-label="Localidade">
          <header className="flex items-center border-b border-white/10 px-2 py-2">
            <button type="button" onClick={() => setAskCity(null)} className="flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-white hover:bg-white/10"><ArrowLeft className="h-5 w-5" />Voltar</button>
          </header>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={e => { e.preventDefault(); if (city.trim().length > 1) answerCity(!known && options.length === 1 ? options[0] : city.trim()); }}>
            <div className="flex-1 overflow-y-auto px-4 pt-4">
              <h2 className="type-section-title font-playfair mb-4 text-white">Onde é o <em className="not-italic" style={{ color: GOLD }}>serviço?</em></h2>
              <input autoFocus value={city} onChange={e => setCity(e.target.value)} aria-label="Localidade do serviço" autoComplete="address-level2" placeholder="Escreva a localidade" className="min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 text-base text-white outline-none placeholder:text-white/35 focus:border-[#D4AF37]" />
              {options.length > 0 && !(known && options.length === 1 && plain(options[0]) === q) && <div className="mt-3 grid grid-cols-2 gap-2">{options.map(c => <button key={c} type="button" onClick={() => answerCity(c)} className="min-h-12 rounded-xl border border-[#D4AF37]/40 bg-white/[0.04] px-2 text-sm font-semibold text-white">{c}</button>)}</div>}
              {!known && q.length > 1 && !options.length && <p className="mt-3 text-sm text-white/70">Nesta localidade a deslocação é confirmada no WhatsApp.</p>}
            </div>
            <footer className="border-t border-[#D4AF37]/25 bg-[#071a12]/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
              <button type="submit" disabled={city.trim().length < 2} className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E8C964] text-base font-bold text-[#0B2F2A] shadow-[0_8px_24px_-8px_rgba(212,175,55,0.6)] disabled:opacity-40">{known || options.length === 1 || city.trim().length < 2 ? 'Ver os preços' : `Continuar com ${city.trim()}`}</button>
            </footer>
          </form>
        </div>;
      })()}
      {imperPick && !editing && (
        <div className="absolute inset-0 z-20 flex flex-col bg-[#0B2F2A] bg-gradient-to-b from-[#0B2F2A] to-[#071a12] text-white" role="dialog" aria-modal="true" aria-label="Impermeabilização">
          <header className="flex items-center border-b border-white/10 px-2 py-2">
            <button type="button" onClick={() => setImperPick(false)} className="flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-white hover:bg-white/10"><ArrowLeft className="h-5 w-5" />Voltar</button>
          </header>
          <div className="flex-1 overflow-y-auto px-4 pt-4">
            <h2 className="type-section-title font-playfair mb-4 text-white">O que vamos <em className="not-italic" style={{ color: GOLD }}>impermeabilizar?</em></h2>
            <div className="grid grid-cols-2 gap-3">
              {([{ kind: 'sofa', label: 'Sofá', clip: imperClip, photo: imperPhoto }, { kind: 'chairs', label: 'Cadeiras', clip: imperChairsClip, photo: PHOTO.chairs }] as const).map(o => (
                <button key={o.kind} type="button" onClick={() => { setImperPick(false); setEditing(newItem(o.kind, { pack: 'premium', imperOnly: true })); }} className="group relative h-40 overflow-hidden rounded-2xl border border-[#D4AF37]/50 text-left active:scale-[0.98]">
                  <video src={o.clip} poster={o.photo} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 px-3 py-2 backdrop-blur-md"><span className="text-lg font-bold text-white">{o.label}</span><Plus className="h-5 w-5" style={{ color: GOLD }} strokeWidth={3} /></span>
                </button>
              ))}
            </div>
            {(() => {
              const done = items.filter(i => i.imperOnly);
              if (!done.length) return <p className="mt-3 text-xs text-white/60">Só em tecido. Para limpar e impermeabilizar na mesma visita, escolha o sofá ou as cadeiras no ecrã anterior.</p>;
              const has = (k: BasketKind) => done.some(i => i.kind === k);
              return <div className="mt-4 rounded-2xl border border-[#D4AF37]/30 bg-white/[0.04] p-3">
                <ul className="mb-2 space-y-1">{done.map(i => <li key={i.id} className="flex items-center gap-2 text-sm font-semibold text-white"><Check className="h-4 w-4 shrink-0" style={{ color: GOLD }} />{itemLabel(i)}</li>)}</ul>
                <p className="mb-3 text-sm text-[#E8C964]">{has('sofa') && has('chairs') ? 'Sofá e cadeiras impermeabilizados na mesma visita.' : has('chairs') ? 'Junte também o sofá e deixe tudo impermeabilizado.' : 'Junte também as cadeiras e deixe tudo impermeabilizado.'}</p>
                <button type="button" onClick={() => setImperPick(false)} className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E8C964] text-base font-bold text-[#0B2F2A]">Seguir para o cesto</button>
              </div>;
            })()}
          </div>
        </div>
      )}
      {editing && <ItemSheet item={editing} fresh={!items.some(i => i.id === editing.id)} city={city} others={items.filter(i => i.id !== editing.id)} onChange={setEditing} onSave={saveEditing} onCancel={() => { if (editing.imperOnly && !items.some(i => i.id === editing.id)) setImperPick(true); setEditing(null); }} />}
    </div>
    </div>
  );
}

// Riscado + "Poupa X€" em todas as opções (dono, 25 Nov: "isto é que é o desconto que a pessoa está à procura";
// "vale para todos os upsells"). Valores só do motor.
function PriceTag({ shown, struck: rawStruck }: { shown: number | null; struck: number | null; note?: string }) {
  if (shown === null) return null;
  // Poupança de trocos não se mostra (dono, 25 Nov: "poupa 1€ na deslocação [...] isso é demais"): só a partir de 5€.
  const struck = rawStruck !== null && rawStruck - shown >= 5 ? rawStruck : null;
  // O mesmo riscado do resto do site (dono, 25 Nov: "os preços riscados não estão como no site inteiro"): pequeno e
  // neutro por cima do preço, o preço em branco forte e a poupança em texto fino dourado, nunca num selo.
  return <span className="flex shrink-0 flex-col items-end leading-tight">
    {struck !== null && <span className="text-[11px] text-white/45 line-through">{formatEuro(struck)}</span>}
    <span className="whitespace-nowrap text-lg font-bold text-white">{formatEuro(shown)}</span>
    {struck !== null && <span className="whitespace-nowrap text-[11px] font-medium text-[#E8C964]">Poupa {formatEuro(Math.round((struck - shown) * 100) / 100)}</span>}
  </span>;
}
/** Um extra (anti-ácaros, anti-odor): quanto acrescenta, riscado o que custaria em separado, ou "Oferecido". */
function AddOnTag({ plus, normal }: { plus: number | null; normal: number | null }) {
  if (plus === null) return null;
  const was = normal !== null && normal - plus >= 5 ? normal : null;
  return <span className="flex shrink-0 flex-col items-end leading-tight">
    {was !== null && <span className="text-[11px] text-white/45 line-through">+{formatEuro(was)}</span>}
    {plus > 0 ? <span className="whitespace-nowrap text-lg font-bold text-white">+{formatEuro(plus)}</span> : <span className="whitespace-nowrap text-base font-bold text-[#E8C964]">Oferecido</span>}
  </span>;
}

/** Quadrado com imagem e contador próprio: toca para juntar 1, depois − e + (vários tamanhos na mesma janela). */
function CountTile({ count, onBump, cls, children }: { count: number; onBump: (d: number) => void; cls: (on: boolean) => string; children: React.ReactNode }) {
  return (
    <div role="button" tabIndex={0} aria-pressed={count > 0} onClick={() => { if (!count) onBump(1); }} onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !count) { e.preventDefault(); onBump(1); } }} className={`${cls(count > 0)} cursor-pointer select-none`}>
      {children}
      {count > 0
        ? <span className="mt-0.5 flex items-center gap-1">
            <button type="button" aria-label="Menos" onClick={e => { e.stopPropagation(); onBump(-1); }} className="flex h-8 w-8 !min-h-0 !min-w-0 items-center justify-center rounded-full bg-white/10 text-white"><Minus className="h-3.5 w-3.5" /></button>
            <span className="w-4 text-center text-base font-extrabold text-[#E8C964]">{count}</span>
            <button type="button" aria-label="Mais" onClick={e => { e.stopPropagation(); onBump(1); }} className="flex h-8 w-8 !min-h-0 !min-w-0 items-center justify-center rounded-full bg-[#D4AF37] text-[#0B2F2A]"><Plus className="h-3.5 w-3.5" strokeWidth={3} /></button>
          </span>
        : <span className="mt-0.5 flex h-8 items-center text-[11px] font-semibold text-white/45"><Plus className="mr-0.5 h-3 w-3" />Juntar</span>}
    </div>
  );
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" aria-label="Menos" onClick={() => onChange(Math.max(min, value - 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white"><Minus className="h-4 w-4" /></button>
      <span className="w-8 text-center text-lg font-bold">{value}</span>
      <button type="button" aria-label="Mais" onClick={() => onChange(Math.min(max, value + 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

function ItemSheet({ item, fresh, city, others, onChange, onSave, onCancel }: { item: BasketItem; fresh: boolean; city: string; others: BasketItem[]; onChange: (i: BasketItem) => void; onSave: (group: BasketItem[]) => void; onCancel: () => void }) {
  const set = (p: Partial<BasketItem>) => onChange({ ...item, ...p });
  const rug = isRug(item.kind);
  // Sofás e colchões: cada tamanho com o seu contador, tudo a zero ao abrir (dono, 25 Nov: "não faz sentido já estar
  // selecionado [...] 2 sofás de 2 lugares e 2 de 3 lugares"). As opções (pack, pele, anti-ácaros) valem para todos.
  const multi = item.kind === 'sofa' || item.kind === 'mattress';
  const keyOf = (it: BasketItem) => (it.kind === 'sofa' ? String(it.seats ?? Number(it.size?.split('-')[0])) : it.size ?? '');
  const sizeOf = (k: string): Partial<BasketItem> => (item.kind === 'mattress' ? { size: k } : k === '6' ? { size: '5-lugares', seats: 6 } : { size: k === '1' ? '1-lugar' : `${k}-lugares`, seats: undefined });
  const [counts, setCounts] = useState<Record<string, number>>(() => (multi && !fresh ? { [keyOf(item)]: item.qty } : {}));
  const group = (p: Partial<BasketItem> = {}): BasketItem[] => (multi
    ? Object.entries(counts).filter(([, n]) => n > 0).map(([k, n], i) => ({ ...item, ...p, ...sizeOf(k), qty: n, id: i === 0 ? item.id : `${item.id}-${k}` }))
    : [{ ...item, ...p }]);
  const totalOf = (list: BasketItem[]) => { const q = quoteBasket(city, list); return !list.length || q.total === null || q.sob ? null : q.total; };
  // Total da visita com estas peças (dono, 17 Nov: o preço impossível de ler mal).
  const totalWith = (p: Partial<BasketItem>) => totalOf([...others, ...group(p)]);
  // Preço de cada opção (dono, 25 Nov: "tens que meter os preços riscados [...] tudo direitinho"): com outras peças
  // a deslocação já está paga, por isso mostra-se a linha destas peças na visita (sem a 2.ª deslocação); riscado =
  // as mesmas peças pedidas sozinhas (Blindado/Protegido: limpeza e impermeabilização em separado, separatePrice).
  // Riscado = cada peça pedida sozinha, com a sua deslocação (e, no pack, limpeza e impermeabilização em separado), somado.
  const sepUnits = (g: BasketItem[]) => { let t = 0; for (const x of g) { const v = struckOf(city, x); if (v === null) return null; t += v; } return g.length ? Math.round(t * 100) / 100 : null; };
  const packPrice = (p: Partial<BasketItem>): { shown: number | null; struck: number | null } => {
    // Pele: o motor põe o tratamento numa linha à parte, por isso soma-se à linha da limpeza na visita.
    if (p.leather && others.length) {
      const clean = packPrice({ ...p, leather: false, pack: 'none' }).shown, a = totalOf(group(p)), b = totalOf(group({ ...p, leather: false, pack: 'none' }));
      const shown = clean !== null && a !== null && b !== null ? Math.round((clean + a - b) * 100) / 100 : null;
      return { shown, struck: a !== null && shown !== null && a > shown ? a : null };
    }
    const g = group(p);
    const alone = totalOf(g);
    const shown = !others.length ? alone : (() => { const q = quoteBasket(city, [...others, ...g]); if (q.sob) return null; const ls = q.lines.slice(others.length); return ls.length && ls.every(v => v != null) ? Math.round(ls.reduce<number>((t, v) => t + (v as number), 0) * 100) / 100 : null; })();
    const sep = sepUnits(g);
    return { shown, struck: sep !== null && shown !== null && sep > shown ? sep : null };
  };
  const addOn = (on: Partial<BasketItem>, off: Partial<BasketItem>) => {
    // O que a visita sobe de facto com o extra (com a escada A pode ser 0: "Oferecido").
    const tot = (p: Partial<BasketItem>) => (others.length ? totalWith(p) : totalOf(group(p)));
    const a = tot(on), b = tot(off);
    const withAlone = sepUnits(group(on)), offAlone = sepUnits(group(off));
    return { plus: a !== null && b !== null ? Math.max(0, a - b) : null, normal: withAlone !== null && offAlone !== null ? Math.round((withAlone - offAlone) * 100) / 100 : null };
  };
  // Primeiro só a escolha (lugares, tamanho, quantidade), sem preços; as opções com o riscado e o "Poupa" aparecem
  // depois de escolher e a folha desce até elas (dono, 25 Nov: "o poupa aparece quando a pessoa clica").
  const [picked, setPicked] = useState(!fresh);
  const optionsRef = useRef<HTMLDivElement>(null);
  const reveal = () => { if (!picked && rug) window.setTimeout(() => optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); setPicked(true); };
  const choose = (p: Partial<BasketItem>) => { set(p); reveal(); };
  const bump = (k: string, d: number) => { setCounts(c => ({ ...c, [k]: Math.max(0, Math.min(9, (c[k] ?? 0) + d)) })); if (d > 0) reveal(); };
  const sized = !rug || (num(item.width) > 0 && num(item.length) > 0);
  // Pele ou tecido pergunta-se logo no menu do sofá (dono, 25 Nov): pele avança para o preço, tecido escolhe o pack.
  const asksMaterial = item.kind === 'sofa' && !item.imperOnly;
  const [material, setMaterial] = useState<'tecido' | 'pele' | null>(() => (!asksMaterial ? 'tecido' : fresh ? null : item.leather ? 'pele' : 'tecido'));
  const ok = multi ? group().length > 0 && material !== null : sized && (picked || rug);
  // Nenhuma opção vem escolhida (dono, 25 Nov): a pessoa escolhe Blindado, Protegido, Renovado ou pele.
  const needsPack = item.kind === 'sofa' || item.kind === 'chairs';
  const [packPicked, setPackPicked] = useState(!fresh);
  const ready = ok && (!needsPack || packPicked || material === 'pele');
  const chooseMaterial = (m: 'tecido' | 'pele') => { if (m === material) return; setMaterial(m); setPackPicked(false); set({ leather: m === 'pele', ...(m === 'pele' ? { pack: 'none' as const } : {}) }); };
  // Desce até ao preço quando a escolha fica completa (nos tapetes só ao tocar num tamanho, nunca a meio de escrever).
  const wasOk = useRef(ok);
  useEffect(() => { if (ok && !wasOk.current && !rug) window.setTimeout(() => optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); wasOk.current = ok; }, [ok, rug]);
  useEffect(() => { if (material && ok && asksMaterial && fresh) window.setTimeout(() => optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [material]);
  const chip = (on: boolean) => `min-h-11 rounded-xl border-2 px-3 text-sm font-bold ${on ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white' : 'border-white/10 bg-white/[0.04] text-white/80'}`;
  // Ecrã inteiro dentro do questionário (dono, 25 Nov: a janela por cima não deixava ver nada e não havia
  // como voltar): "Voltar" em cima, o vídeo da peça, as escolhas em quadrados com imagem e o botão fixo em baixo.
  // O vídeo fica o da escolha com que se abriu (a impermeabilização mostra a água), sem trocar a cada toque.
  const [clip] = useState(() => (item.imperOnly && item.kind === 'chairs' ? imperChairsClip : item.kind === 'sofa' && item.pack !== 'none' ? imperClip : CLIP[item.kind]));
  const tile = (on: boolean) => `flex flex-col items-center justify-center gap-1 rounded-2xl border-2 px-1 py-2 text-sm font-bold ${on ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white' : 'border-white/10 bg-white/[0.04] text-white/80'}`;
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#0B2F2A] bg-gradient-to-b from-[#0B2F2A] to-[#071a12] text-white" role="dialog" aria-modal="true" aria-label={KIND_LABEL[item.kind]}>
      <header className="flex items-center border-b border-white/10 px-2 py-2">
        <button type="button" onClick={onCancel} className="flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-white hover:bg-white/10"><ArrowLeft className="h-5 w-5" />Voltar</button>
      </header>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className={`relative -mx-4 mb-4 overflow-hidden ${asksMaterial ? 'h-28' : 'h-40'}`}>
          <video src={clip} poster={PHOTO[item.kind]} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" className="h-full w-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-[#0B2F2A] via-[#0B2F2A]/20 to-transparent" />
          <h3 className="absolute bottom-2 left-4 font-playfair text-3xl font-semibold text-white">{item.imperOnly ? <>Impermeabilização <span className="block text-lg" style={{ color: GOLD }}>{item.kind === 'chairs' ? 'das cadeiras' : 'do sofá'}</span></> : KIND_LABEL[item.kind]}</h3>
        </div>

        {item.kind === 'sofa' && <>
          {asksMaterial && <>
            <p className="mb-2 text-sm font-semibold text-white">É de pele ou couro?</p>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {([['tecido', 'Não, é de tecido'], ['pele', 'Sim, pele ou couro']] as const).map(([m, label]) => <button key={m} type="button" aria-pressed={material === m} onClick={() => chooseMaterial(m)} className={`${tile(material === m)} min-h-12`}>{label}</button>)}
            </div>
          </>}
          <p className="mb-2 text-sm font-semibold text-white">Quantos lugares? <span className="font-normal text-white/60">Pode juntar vários</span></p>
          <div className="mb-2 grid grid-cols-3 gap-2">{SOFA_SEATS.map(n => <CountTile key={n} count={counts[String(n)] ?? 0} onBump={d => bump(String(n), d)} cls={tile}>
            <QuizFurnitureImage service="sofa" sizeId={n >= 4 ? '4-lugares' : n === 1 ? '1-lugar' : `${n}-lugares`} className="h-12 w-12 sm:h-12 sm:w-12" />{n === 1 ? '1 lugar' : `${n} lugares`}</CountTile>)}</div>
          <p className="mb-3 text-xs text-white/60">Canto, em U ou mais de 6 lugares: preço pela fotografia no WhatsApp.</p>
        </>}
        {item.kind === 'mattress' && <>
          <p className="mb-2 text-sm font-semibold text-white">Que tamanho? <span className="font-normal text-white/60">Pode juntar vários</span></p>
          <div className="mb-3 grid grid-cols-3 gap-2">{MATTRESS.map(m => <CountTile key={m.id} count={counts[m.id] ?? 0} onBump={d => bump(m.id, d)} cls={tile}>
            <QuizFurnitureImage service="mattress" sizeId={m.id} className="h-12 w-14 sm:h-12 sm:w-14" />{m.label}</CountTile>)}</div>
        </>}
        {item.kind === 'chairs' && <>
          <p className="mb-2 text-sm font-semibold text-white">Quantas cadeiras?</p>
          <div className="mb-3 grid grid-cols-3 gap-2">{CHAIR_QTY.map(n => <button key={n} type="button" className={`${tile(picked && item.qty === n)} min-h-[56px] text-base`} onClick={() => choose({ qty: n })}>{n} cadeiras</button>)}</div>
        </>}
        {rug && (() => {
          const sizes = item.kind === 'carpet' ? CARPET_SIZES : RUG_SIZES;
          const preset = sizes.find(z => z.w === item.width && z.l === item.length);
          return <>
            <ul className="mb-4 flex flex-wrap gap-1.5 text-xs font-semibold text-white/85">
              {[item.kind === 'carpet' ? 'Lavagem no local' : 'Lavagem em sua casa', 'Deslocação incluída', 'Seca em 2 a 5 h'].map(t => <li key={t} className="flex items-center gap-1 rounded-full border border-[#D4AF37]/30 bg-white/[0.05] px-2.5 py-1"><Check className="h-3.5 w-3.5" style={{ color: GOLD }} />{t}</li>)}
            </ul>
            <p className="mb-2 text-sm font-semibold text-white">{item.kind === 'carpet' ? 'Qual é o espaço?' : 'Que tamanho tem?'}</p>
            <div className="mb-2 grid grid-cols-2 gap-2">
              {sizes.map(z => {
                const w = num(z.w), l = num(z.l), max = Math.max(...sizes.map(x => num(x.l)));
                return <button key={z.label} type="button" onClick={() => choose({ width: z.w, length: z.l })} className={`${tile(preset === z)} !items-stretch !justify-start gap-2 !px-2.5 text-left`}>
                  <span className="flex h-12 items-center justify-center"><span className="rounded-[3px] border-2 border-[#D4AF37]/70 bg-[repeating-linear-gradient(45deg,rgba(212,175,55,0.18)_0_3px,transparent_3px_7px)]" style={{ width: `${Math.max(14, (l / max) * 64)}px`, height: `${Math.max(10, (w / max) * 44)}px` }} /></span>
                  <span className="block leading-tight">{z.label}</span>
                  <span className="block text-xs font-semibold text-white/60">{z.w} × {z.l} m</span>
                </button>;
              })}
            </div>
            <p className="mb-1 mt-3 text-xs font-semibold text-white/70">{preset ? 'Ou escreva a medida certa, em metros' : 'Medida em metros (de uma ponta à outra)'}</p>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <input inputMode="decimal" placeholder="Largura (2,0)" value={item.width ?? ''} onChange={e => set({ width: e.target.value })} className="min-h-12 rounded-xl border border-white/15 bg-white/[0.06] px-3 text-white placeholder:text-white/35 text-base outline-none focus:border-[#D4AF37]" />
              <input inputMode="decimal" placeholder="Comprimento (3,0)" value={item.length ?? ''} onChange={e => set({ length: e.target.value })} className="min-h-12 rounded-xl border border-white/15 bg-white/[0.06] px-3 text-white placeholder:text-white/35 text-base outline-none focus:border-[#D4AF37]" />
            </div>
          </>;
        })()}

        {ok && <div ref={optionsRef} className="scroll-mt-2">
          {!cityKnown(city) && <p className="mb-3 rounded-xl border border-[#D4AF37]/30 bg-white/[0.04] px-3 py-2 text-sm text-white/80">Em {city.trim() || 'sua casa'} confirmamos o preço com a deslocação no WhatsApp.</p>}
          {item.kind === 'mattress' && <button type="button" className={`${chip(item.pack === 'premium')} mb-3 flex w-full items-center justify-between gap-2 py-2 text-left`} onClick={() => set({ pack: item.pack === 'premium' ? 'none' : 'premium' })}>
            <span><span className="block">{item.pack === 'premium' ? <Check className="mr-1 inline h-4 w-4" /> : null}Com anti-ácaros</span><span className="block text-xs font-normal text-white/60">Produto Bactran, desinfeta o colchão</span></span>
            <AddOnTag {...addOn({ pack: 'premium' }, { pack: 'none' })} />
          </button>}
          {item.kind === 'chairs' && <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">{item.kind === 'chairs' ? 'Cadeiras' : 'Quantidade'}</span>
            <Stepper value={item.qty} min={1} max={item.kind === 'chairs' ? 40 : 6} onChange={qty => set({ qty })} />
          </div>}
          {(item.kind === 'sofa' || item.kind === 'chairs') && <div className="mb-3 space-y-1.5">{(material === 'pele' ? [] : item.imperOnly ? IMPER_ONLY : PACKS).map(p => {
            const on = packPicked && item.pack === p.pack && !item.leather;
            return <button key={p.pack} type="button" onClick={() => { set({ pack: p.pack, leather: false }); setPackPicked(true); }} className={`${chip(on)} flex w-full items-center justify-between gap-2 py-2 text-left`}>
              <span><span className="block">{p.name}</span><span className="block text-xs font-normal text-white/60">{p.note}</span></span>
              <span className="flex items-center gap-2"><PriceTag {...packPrice({ pack: p.pack, leather: false })} note={item.imperOnly || p.pack === 'none' ? 'na deslocação' : 'na limpeza'} />{on ? <Check className="h-4 w-4" style={{ color: GOLD }} /> : <span className="h-4 w-4" />}</span>
            </button>;
          })}
          {/* Pele: um só preço, limpeza + tratamento da pele; nunca leva impermeabilização. */}
          {material === 'pele' && <div className={`${chip(true)} flex w-full items-center justify-between gap-2 py-2 text-left`}>
            <span><span className="block">Limpeza + tratamento da pele</span><span className="block text-xs font-normal text-white/60">Limpeza e hidratação</span></span>
            <PriceTag {...packPrice({ leather: true, pack: 'none' })} />
          </div>}
          </div>}
          {rug && <>
            <p className="mb-3 flex items-center justify-between rounded-xl bg-[#D4AF37]/10 px-3 py-2 text-sm text-white"><span>{(Math.round(num(item.width) * num(item.length) * 100) / 100).toLocaleString('pt-PT')} m², deslocação incluída</span><PriceTag {...packPrice({})} /></p>
            <button type="button" className={`${chip(!!item.odor)} mb-1 flex w-full items-center justify-between py-2 text-left`} onClick={() => set({ odor: !item.odor })}>
              <span><span className="block">{item.odor ? <Check className="mr-1 inline h-4 w-4" /> : null}Com anti-odor</span><span className="block text-xs font-normal text-white/60">Para o cheiro de animais ou de urina</span></span>
              <AddOnTag {...addOn({ odor: true }, { odor: false })} />
            </button>
          </>}
        </div>}
      </div>
      <footer className="border-t border-[#D4AF37]/25 bg-[#071a12]/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        {ready && (() => { const g = giftsUnlocked(city, others, group()); return g ? <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#E8C964]"><Gift className="h-4 w-4 shrink-0" />Na mesma visita oferecemos {g.text}, normalmente {formatEuro(g.normal)}</p> : null; })()}
        <button type="button" disabled={!ready} onClick={() => onSave(group())} className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E8C964] text-base font-bold text-[#0B2F2A] shadow-[0_8px_24px_-8px_rgba(212,175,55,0.6)] disabled:opacity-40">{(() => { const v = !ok ? null : others.length ? totalWith({}) : totalOf(group()); return !ok ? (rug ? 'Escolha ou escreva a medida' : item.kind === 'chairs' ? 'Escolha quantas cadeiras' : item.kind === 'sofa' ? (material === null ? 'Diga se é de pele ou tecido' : 'Escolha os lugares e quantos') : 'Escolha o tamanho e quantos') : !ready ? 'Escolha uma opção' : v === null ? 'Juntar à visita' : others.length ? `Juntar à visita · total ${formatEuro(v)}` : `Juntar à visita · ${formatEuro(v)}`; })()}</button></footer>
    </div>
  );
}
