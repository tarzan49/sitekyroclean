/**
 * The quiz order as data, so the WhatsApp bot knows from the first message
 * everything the client already chose (owner, 10 Oct 2026: "se o cliente já
 * forneceu determinada informação, o chatbot não deve voltar a pedi-la").
 *
 * Until now the bot only had `leads.details`, a text line per item, and only
 * when the model remembered to look the order up. Each reply is a fresh model
 * call, so the second reply of a conversation asked again for the rug sizes
 * the first one had just read (Julia, #2I1PZJUT, 9 Oct).
 *
 * Two halves, one module:
 * - `buildQuizOrder` runs in the browser at submit time and is stored in
 *   `leads.quiz_order` (jsonb, migration 20261010120000);
 * - `describeQuizOrder` runs in the `bot-api` Edge Function (bundled through
 *   `botEngine.ts`) and turns a lead row, new or old, into what the bot reads:
 *   one line per item, the request for its quote tool, what not to ask again
 *   and what to confirm first.
 *
 * No `@/` imports: the bot engine bundle reads this file.
 */
import { rugSide, formatMeters } from '../constants/rugMeasure';
import type { SofaItem, MattressItem, CarpetItem, UpsellItemConfig } from '../components/quiz/QuizTypes';

export const QUIZ_ORDER_VERSION = 1;

/** Same vocabulary as the bot's quote tool (`BOT_TREATMENTS` in botQuote.ts). */
type QuoteTreatment = 'clean' | 'clean+essencial' | 'clean+premium' | 'clean+anti-acaros' | 'essencial' | 'premium';
export interface QuoteItem {
  kind: 'sofa' | 'mattress' | 'chairs' | 'rug' | 'carpet';
  size?: string;
  qty: number;
  treatment: QuoteTreatment;
  width?: number;
  length?: number;
}

export interface QuizOrderRug {
  kind: 'rug' | 'carpet';
  /** As typed in the quiz, e.g. "230 × 160". */
  typed: string;
  width: number;
  length: number;
  areaM2: number;
  fromCm: boolean;
  doubtful: boolean;
}

export interface QuizOrder {
  v: number;
  service: string;
  city: string;
  /** What the client saw on the summary screen, one line per item, travel included. */
  lines: { label: string; qty: number; price: number | null }[];
  /** Ready for the bot's quote tool, main item first (the pack perks depend on it). */
  quote: { items: QuoteItem[]; exact: boolean };
  rugs: QuizOrderRug[];
  rugPickup: boolean | null;
  total: number | null;
  priceText: string;
  sobOrcamento: boolean;
  observations: string | null;
  slot: string | null;
}

export interface QuizOrderInput {
  service: string;
  serviceType: string;
  waterproofingTier: 'essencial' | 'premium';
  sofaItems: SofaItem[];
  mattressItems: MattressItem[];
  upsellItems: UpsellItemConfig[];
  carpetItems: CarpetItem[];
  chairQuantity: string;
  chairWaterproofQty: number;
  chairAntiAcaros: boolean;
  sofaAntiAcaros?: boolean;
  carpetKind?: 'tapete' | 'alcatifa';
  rugPickup?: boolean;
  finalLocation: string;
  totalPrice: number;
  hasSobOrcamento: boolean;
  hasUpsellSobItem: boolean;
  priceText: string;
  slotLabel: string;
  description?: string;
}

const treatedQty = (item: SofaItem | MattressItem) => (item.packEnabled ? Math.max(0, Math.min(item.qty, item.packQty ?? item.qty)) : 0);
const typed = (v: string) => String(v ?? '').trim();

function rugOf(item: CarpetItem, kind: 'rug' | 'carpet'): QuizOrderRug | null {
  const w = rugSide(item.largura), l = rugSide(item.comprimento);
  if (!w || !l) return null;
  return {
    kind, typed: `${typed(item.largura)} × ${typed(item.comprimento)}`,
    width: w.meters, length: l.meters, areaM2: Math.round(w.meters * l.meters * 100) / 100,
    fromCm: w.fromCm || l.fromCm, doubtful: kind === 'rug' && (w.doubtful || l.doubtful),
  };
}

export function buildQuizOrder(p: QuizOrderInput, lines: { label: string; qty: number; total: number | null }[]): QuizOrder {
  const tier = p.waterproofingTier === 'premium' ? 'premium' : 'essencial';
  const waterproofMain = p.serviceType === 'waterproofing';
  const items: QuoteItem[] = [];
  const rugs: QuizOrderRug[] = [];
  let exact = true;

  if (p.service === 'sofa') {
    for (const item of p.sofaItems) {
      const treated = treatedQty(item), plain = item.qty - treated;
      const withExtra: QuoteTreatment = waterproofMain ? `clean+${tier}` : p.sofaAntiAcaros ? 'clean+anti-acaros' : `clean+${tier}`;
      if (treated > 0) items.push({ kind: 'sofa', size: item.sizeId, qty: treated, treatment: withExtra });
      if (plain > 0) items.push({ kind: 'sofa', size: item.sizeId, qty: plain, treatment: waterproofMain ? tier : 'clean' });
    }
  } else if (p.service === 'mattress') {
    for (const item of p.mattressItems) {
      const treated = treatedQty(item), plain = item.qty - treated;
      if (treated > 0) items.push({ kind: 'mattress', size: item.sizeId, qty: treated, treatment: 'clean+anti-acaros' });
      // Anti-ácaros without cleaning has no line in the bot's tool: the quiz price stands.
      if (plain > 0) { if (waterproofMain) exact = false; else items.push({ kind: 'mattress', size: item.sizeId, qty: plain, treatment: 'clean' }); }
    }
  } else if (p.service === 'chairs') {
    const qty = parseInt(p.chairQuantity, 10);
    if (qty > 0) {
      // Same sums as the receipt: the main treatment on every chair, the other one on chairWaterproofQty.
      items.push({ kind: 'chairs', qty, treatment: waterproofMain ? tier : 'clean' });
      if (p.chairWaterproofQty > 0) items.push({ kind: 'chairs', qty: p.chairWaterproofQty, treatment: waterproofMain ? 'clean' : tier });
      if (p.chairAntiAcaros && !waterproofMain) {
        if (p.chairWaterproofQty === 0) items[items.length - 1] = { kind: 'chairs', qty, treatment: 'clean+anti-acaros' };
        else exact = false;
      }
    }
  } else if (p.service === 'carpet') {
    const kind = p.carpetKind === 'alcatifa' ? 'carpet' : 'rug';
    for (const c of p.carpetItems) {
      const rug = rugOf(c, kind);
      if (!rug) continue;
      rugs.push(rug);
      items.push({ kind, qty: 1, treatment: 'clean', width: rug.width, length: rug.length });
    }
  }

  for (const up of p.upsellItems) {
    const qty = up.qty ?? 1;
    if (up.mattressSize) items.push({ kind: 'mattress', size: up.mattressSize, qty, treatment: 'clean' });
    else if (up.sofaSize) items.push({ kind: 'sofa', size: up.sofaSize, qty, treatment: 'clean' });
    else if (up.id === 'chairs') items.push({ kind: 'chairs', qty, treatment: up.waterproof ? `clean+${up.waterproofingTier === 'premium' ? 'premium' : 'essencial'}` : 'clean' });
    else if (up.carpetItems?.length) {
      for (const c of up.carpetItems) {
        const rug = rugOf(c, 'rug');
        if (!rug) continue;
        rugs.push(rug);
        items.push({ kind: 'rug', qty: 1, treatment: 'clean', width: rug.width, length: rug.length });
      }
    }
  }

  const observations = typed(p.description ?? '').slice(0, 1000) || null;
  return {
    v: QUIZ_ORDER_VERSION,
    service: p.service,
    city: p.finalLocation,
    lines: lines.map(l => ({ label: l.label, qty: l.qty, price: l.total })),
    quote: { items: items.slice(0, 20), exact: exact && items.length <= 20 },
    rugs,
    rugPickup: rugs.length ? Boolean(p.rugPickup) && p.carpetKind !== 'alcatifa' : null,
    total: p.hasSobOrcamento || p.hasUpsellSobItem || !(p.totalPrice > 0) ? null : p.totalPrice,
    priceText: p.priceText,
    sobOrcamento: p.hasSobOrcamento || p.hasUpsellSobItem,
    observations,
    slot: typed(p.slotLabel) || null,
  };
}

// ── What the bot reads ────────────────────────────────────────────────────────

export interface QuizOrderBrief {
  /** Where the facts came from: the stored order (since 10 Oct 2026) or the old text summary. */
  source: 'quiz_order' | 'details';
  /** One line per item as the client chose it, with the quiz price. */
  items: string[];
  rugs: QuizOrderRug[];
  /** The `calcular_orcamento` request, or null when the items are not known as data. */
  quoteRequest: { items: QuoteItem[]; city: string } | null;
  /** False when one line has no exact match in the tool (the quiz price stands for it). */
  quoteExact: boolean;
  /** Things the client already answered: never ask them again. */
  alreadyKnown: string[];
  /** Real doubts that change the price: confirm these, only these, before quoting. */
  confirmFirst: string[];
  rugPickup: boolean | null;
  quizTotal: number | null;
  quizPriceText: string | null;
  sobOrcamento: boolean;
  observations: string | null;
  slot: string | null;
}

const fmtEuro = (n: number) => (n % 1 === 0 ? `${n}€` : `${n.toFixed(2).replace('.', ',')}€`);
const KIND_WORD: Record<string, string> = { rug: 'Tapete', carpet: 'Alcatifa' };

function rugChecks(rugs: QuizOrderRug[]): string[] {
  const out: string[] = [];
  rugs.forEach((r, i) => {
    const name = `${KIND_WORD[r.kind]} ${i + 1}`;
    if (r.doubtful) out.push(`${name}: escreveu ${r.typed} no questionário (em metros, ${formatMeters(r.areaM2)} m²). É muito grande para um tapete: confirma as medidas antes do preço, numa pergunta curta ("São ${formatMeters(r.width)} × ${formatMeters(r.length)} metros?").`);
  });
  return out;
}

function rugLine(r: QuizOrderRug, i: number): string {
  const read = `${formatMeters(r.width)} × ${formatMeters(r.length)} m (${formatMeters(r.areaM2)} m²)`;
  return `${KIND_WORD[r.kind]} ${i + 1}: ${read}${r.fromCm ? `, escrito em centímetros no questionário (${r.typed}), já convertido` : ''}`;
}

function knownFrom(service: string, kinds: Set<string>, hasRugs: boolean, city: string, rugPickup: boolean | null): string[] {
  const out: string[] = [];
  if (kinds.has('sofa') || /sof[aá]/i.test(service)) out.push('quantos lugares tem cada sofá e o tratamento escolhido');
  if (kinds.has('mattress') || /colch/i.test(service)) out.push('o tamanho de cada colchão');
  if (kinds.has('chairs') || /cadeira/i.test(service)) out.push('quantas cadeiras são');
  if (hasRugs) out.push('as medidas de cada tapete ou alcatifa');
  if (rugPickup !== null) out.push(rugPickup ? 'que quer recolha e entrega' : 'que quer a lavagem em casa');
  if (city) out.push(`a localidade (${city})`);
  return out;
}

/** Old orders (before `quiz_order`): rugs from the text summary, through the same reading of centimetres. */
function rugsFromDetails(details: string): QuizOrderRug[] {
  const rugs: QuizOrderRug[] = [];
  for (const m of details.matchAll(/(Tapete|Alcatifa) \d+: ([\d.,]+) × ([\d.,]+) m/g)) {
    const rug = rugOf({ id: '', largura: m[2], comprimento: m[3] }, m[1] === 'Alcatifa' ? 'carpet' : 'rug');
    if (rug) rugs.push(rug);
  }
  return rugs;
}

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

export function describeQuizOrder(row: { quiz_order?: unknown; details?: string | null; location?: string | null; value?: string | null; service?: string | null }): QuizOrderBrief {
  const city = typeof row.location === 'string' ? row.location : '';
  const service = typeof row.service === 'string' ? row.service : '';
  const o = isRecord(row.quiz_order) && row.quiz_order.v === QUIZ_ORDER_VERSION ? (row.quiz_order as unknown as QuizOrder) : null;

  if (o) {
    const rugs = Array.isArray(o.rugs) ? o.rugs : [];
    let rugIndex = 0;
    const items = (Array.isArray(o.lines) ? o.lines : [])
      .filter(l => !/^Deslocação:/.test(l.label))
      .map(l => {
        const rug = /^(Tapete|Alcatifa) \d+:/.test(l.label) ? rugs[rugIndex++] : undefined;
        const label = rug ? rugLine(rug, rugIndex - 1) : l.label;
        return `${l.qty}x ${label}: ${l.price === null ? 'sob orçamento' : fmtEuro(l.price)}`;
      });
    const quoteItems = Array.isArray(o.quote?.items) ? o.quote.items : [];
    const kinds = new Set(quoteItems.map(i => i.kind));
    return {
      source: 'quiz_order',
      items,
      rugs,
      quoteRequest: quoteItems.length ? { items: quoteItems, city: o.city || city } : null,
      quoteExact: o.quote?.exact !== false,
      alreadyKnown: knownFrom(service, kinds, rugs.length > 0, o.city || city, o.rugPickup ?? null),
      confirmFirst: rugChecks(rugs),
      rugPickup: o.rugPickup ?? null,
      quizTotal: typeof o.total === 'number' ? o.total : null,
      quizPriceText: o.priceText || row.value || null,
      sobOrcamento: Boolean(o.sobOrcamento),
      observations: o.observations ?? null,
      slot: o.slot ?? null,
    };
  }

  const details = typeof row.details === 'string' ? row.details : '';
  const rugs = rugsFromDetails(details);
  let rugIndex = 0;
  const items = details.split('\n').map(s => s.trim()).filter(Boolean).map(line => {
    if (!/^\d+x (Tapete|Alcatifa) \d+:/.test(line)) return line;
    const rug = rugs[rugIndex++];
    return rug ? `1x ${rugLine(rug, rugIndex - 1)}: sob orçamento` : line;
  });
  const pickup = /Recolha, entrega e deslocação/.test(details);
  return {
    source: 'details',
    items,
    rugs,
    quoteRequest: null,
    quoteExact: false,
    alreadyKnown: knownFrom(service, new Set(), rugs.length > 0, city, rugs.length ? pickup : null),
    confirmFirst: rugChecks(rugs),
    rugPickup: rugs.length ? pickup : null,
    quizTotal: null,
    quizPriceText: row.value ?? null,
    sobOrcamento: /sob orçamento/i.test(`${details} ${row.value ?? ''}`),
    observations: null,
    slot: null,
  };
}
