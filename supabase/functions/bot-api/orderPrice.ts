// O preço que a mensagem automática do questionário leva, sempre pelo motor (botQuote): cada peça com o preço que a
// pessoa viu no cesto (o serviço), a deslocação à parte (dono, 25 Nov 2026), as ofertas da visita e o total (dono, 25 Nov 2026,
// "Sim, corrige": um sofá e um colchão saíam 79€ + 69€ com "Total: 169€" e sem o anti-ácaros oferecido; os tapetes
// saíam sem preço, mesmo quando o site o mostrou). Null quando o pedido é sob orçamento.
import { botQuote, describeQuizOrder, priceSplit, serviceLines } from "../_shared/botEngine.generated.js";
import type { QuotedPrice } from "../_shared/whatsappReply.ts";

type Row = Record<string, unknown>;
type Item = { kind: string; size?: string; qty: number; treatment: string; seats?: number; leather?: boolean; width?: number; length?: number; material?: string; odor?: boolean };
type Gift = { piece: string; treatment: string; normal: number };

const isRug = (i: Item) => i.kind === "rug" || i.kind === "carpet";
const cents = (n: number) => Math.round(n * 100) / 100;

/** The closed total of these items, travel included, or null when any of it is on quote. Rugs: the engine's own rug price. */
// deno-lint-ignore no-explicit-any
function priced(city: string, items: Item[]): { q: any; total: number } | null {
  // deno-lint-ignore no-explicit-any
  const q = botQuote({ city, items, site: true }) as any;
  // Extended-trip cities (Aveiro, Alentejo Litoral) hand the TIME to the owner, never the price.
  if (!q?.ok || (q.handToOwner && !(q.extendedTrip && q.cityKnown))) return null;
  const rugs = items.filter(isRug).length;
  const lines = (q.lines ?? []) as { amount: number | null; quote?: boolean }[];
  if (!rugs) return q.quote || !lines.length || lines.some(l => l.quote || typeof l.amount !== "number") || typeof q.total !== "number" ? null : { q, total: q.total };
  if (rugs === items.length) return q.rugEstimate?.ok && typeof q.rugEstimate.homePrice === "number" ? { q, total: q.rugEstimate.homePrice } : null;
  if (lines.some((l, j) => l.quote && items[j] && !isRug(items[j]))) return null;
  return q.rugCombo?.ok && typeof q.rugCombo.comboPrice === "number" ? { q, total: q.rugCombo.comboPrice } : null;
}

const WATERPROOF: Record<string, string> = { premium: "impermeabilização Premium (até 10 anos)", essencial: "impermeabilização Essencial (1 a 2 anos)" };
const m = (n?: number) => String(n ?? "").replace(".", ",");

/** "Sofá 3 lugares, limpeza", "2 colchões de casal, limpeza + anti-ácaros", "6 cadeiras, limpeza", "Tapete 2 x 3 m, lavagem". */
export function itemText(i: Item): string {
  if (isRug(i)) return `${i.kind === "rug" ? "Tapete" : "Alcatifa"} ${m(i.width)} x ${m(i.length)} m${i.material ? ` (${i.material})` : ""}, lavagem${i.odor ? " + anti-odor" : ""}`;
  const [base, extra] = i.treatment.startsWith("clean") ? ["limpeza", i.treatment.slice(6)] : ["", i.treatment];
  const what = [base, i.leather ? "tratamento da pele" : extra === "anti-acaros" ? "anti-ácaros" : WATERPROOF[extra] ?? ""].filter(Boolean).join(" + ");
  if (i.kind === "mattress") {
    const size = ({ solteiro: "de solteiro", casal: "de casal", king: "king" } as Record<string, string>)[i.size ?? ""] ?? i.size ?? "";
    return `${i.qty > 1 ? `${i.qty} colchões` : "Colchão"} ${size}, ${what}`;
  }
  if (i.kind === "chairs") return `${i.qty} ${i.qty > 1 ? "cadeiras" : "cadeira"}, ${what}`;
  const seats = i.seats ?? (parseInt(i.size ?? "", 10) || null);
  const size = seats ? `${seats} ${seats === 1 ? "lugar" : "lugares"}` : i.size ?? "";
  return `${i.qty > 1 ? `${i.qty} sofás` : "Sofá"} ${i.leather ? "de pele " : ""}${i.qty > 1 ? "de " : ""}${size}, ${what}`;
}

const GIFT_ON: Record<string, [string, string]> = { sofa: ["no sofá", "nos %n sofás"], mattress: ["no colchão", "nos %n colchões"], chairs: ["nas cadeiras", "nas cadeiras"], rug: ["no tapete", "nos %n tapetes"], carpet: ["na alcatifa", "nas %n alcatifas"] };
const GIFT_WHAT: Record<string, string> = { "anti-acaros": "Anti-ácaros", "anti-odor": "Anti-odor", "tratamento-pele": "Tratamento da pele" };

/** One entry per gift that is the same: "Anti-ácaros nos 2 colchões", with the usual prices added. */
export function giftLines(gifts: Gift[]): { label: string; normal: number }[] {
  const by = new Map<string, { g: Gift; n: number; normal: number }>();
  for (const g of gifts) {
    const k = `${g.piece}:${g.treatment}`, o = by.get(k);
    if (o) { o.n++; o.normal += g.normal; } else by.set(k, { g, n: 1, normal: g.normal });
  }
  return [...by.values()].map(({ g, n, normal }) => {
    const on = GIFT_ON[g.piece] ?? ["", ""];
    return { label: `${GIFT_WHAT[g.treatment] ?? g.treatment} ${(n > 1 ? on[1] : on[0]).replace("%n", String(n))}`.trim(), normal: cents(normal) };
  });
}

export function orderPrice(r: Row): QuotedPrice | null {
  try {
    const brief = describeQuizOrder(r as never);
    if (!brief.quoteRequest || !brief.quoteExact) return null;
    const city = brief.quoteRequest.city, items = brief.quoteRequest.items as Item[];
    // Tapetes: só com o preço que o site mostrou e medidas sem dúvida.
    if (items.some(isRug) && (brief.sobOrcamento || brief.quizTotal === null || brief.rugPickup || brief.confirmFirst.length)) return null;
    const all = priced(city, items);
    if (!all) return null;
    const gifts = giftLines((all.q.visitGifts?.gifts ?? []) as Gift[]);
    const usualTotal = items.length === 1 ? null : all.q.visitGifts?.usual ?? all.q.separatePrice?.separate ?? null;
    // Serviço, deslocação e total, como o site mostra (dono, 25 Nov 2026): a mesma regra, `src/lib/servicePrice.ts`.
    const split = priceSplit(city, items), amounts = split && split.total === all.total ? serviceLines(city, items) : null;
    if (split && amounts) return { lines: items.map((i, k) => ({ label: itemText(i), amount: amounts[k] })), travel: split.travel, total: all.total, gifts, usual: typeof usualTotal === "number" && usualTotal - all.total >= 5 ? usualTotal : null };
    if (items.length === 1) return { lines: [{ label: itemText(items[0]), amount: all.total }], travel: null, total: all.total, gifts, usual: null };
    const usual = all.q.visitGifts?.usual ?? all.q.separatePrice?.separate ?? null;
    const lines = items.map(i => {
      // Vários sofás ou colchões iguais: o preço de cada um, como a linha do cesto.
      const one = priced(city, [i.qty > 1 && (i.kind === "sofa" || i.kind === "mattress") ? { ...i, qty: 1 } : i]);
      return one ? { label: itemText(i), amount: cents(one.total * (i.qty > 1 && (i.kind === "sofa" || i.kind === "mattress") ? i.qty : 1)) } : null;
    });
    if (lines.some(l => l === null)) return null;
    const struck = typeof usual === "number" && usual - all.total >= 5 ? usual : null;
    let shown = lines as { label: string; amount: number }[];
    // As peças em separado somam mais do que a visita (a deslocação é uma só) e não há riscado a explicar: o preço de cada
    // uma na visita, quando o motor o dá peça a peça e bate certo.
    if (!struck && !gifts.length && shown.reduce((t, l) => t + l.amount, 0) - all.total >= 5) {
      const rugs = items.filter(isRug).length;
      const visit = ((all.q.lines ?? []) as { amount: number | null; quote?: boolean }[]).map((l, k) => (rugs === 1 && items[k] && isRug(items[k]) ? (all.q.rugCombo?.rugsWashing ?? null) : l.quote ? null : l.amount));
      const sum = visit.reduce<number>((t, a) => t + (a ?? 0), 0);
      if (rugs <= 1 && visit.length === items.length && visit.every(a => typeof a === "number") && Math.abs(all.total - sum) <= 9) shown = items.map((i, k) => ({ label: itemText(i), amount: visit[k] as number }));
    }
    return { lines: shown, travel: null, total: all.total, gifts, usual: struck };
  } catch { return null; }
}
