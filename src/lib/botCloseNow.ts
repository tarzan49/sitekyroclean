/**
 * "Condição para fechar já" (dono, 2026-10-13: "podes baixar o orçamento 10% se
 * o problema for o preço e vemos como isso resulta, mas cria uma condição para
 * fechar, 10% não pode ser um desconto à toa, eu tenho que ganhar com esse fecho
 * rápido").
 *
 * O desconto deixou de ser 10% no mesmo dia (dono: "quando o preço acaba em 9
 * faz um desconto de 10eur, se for acima de 150 eur faz de 15 eur, se for acima
 * de 200 faz 20 eur e assim sucessivamente, nas impermeabilizacoes faz sempre
 * 5%"): até 150€ são 10€, e cada 50€ acima disso mais 5€ (151-200€ 15€,
 * 201-250€ 20€, 251-300€ 25€…). Um pedido com impermeabilização leva 5% do
 * total.
 *
 * Acima de 200€ a condição é do dono (dono, 2026-10-14: "passa-me a mim"): o
 * bot não recebe valor nenhum e passa a conversa ("pediu desconto, acima de
 * 200€: decides tu").
 *
 * O bot só a usa quando o cliente disse que o problema é o preço, uma vez por
 * conversa, e nunca por iniciativa própria. O que o dono ganha é a condição: a
 * marcação fica feita já, nesta conversa, para um dos dias que temos livres nos
 * próximos 7 dias. Fica de fora o que é sob orçamento.
 *
 * O valor sai daqui e não do bot: o código do bot só deixa passar euros que a
 * ferramenta devolveu.
 */
export const CLOSE_NOW_WATERPROOFING_RATE = 0.05;
export const CLOSE_NOW_DAYS = 7;
/** Acima disto a condição para fechar já é decidida pelo dono, não pelo bot. */
export const CLOSE_NOW_MAX_TOTAL = 200;
const OWNER_DECIDES = `acima de ${CLOSE_NOW_MAX_TOTAL}€: a condição é decidida pelo responsável (handoff "pediu desconto, acima de ${CLOSE_NOW_MAX_TOTAL}€: decides tu")`;
export const CLOSE_NOW_CONDITION =
  `Só se ficar marcado já, nesta conversa, para um dos dias que temos livres nos próximos ${CLOSE_NOW_DAYS} dias.`;

/** Euros off a price: 10€ up to 150€, then 5€ more for every 50€ (or part) above it. */
export const closeNowDiscount = (price: number) =>
  price <= 150 ? 10 : 10 + 5 * Math.ceil((price - 150) / 50);

export const closeNowPrice = (price: number, waterproofing = false) =>
  waterproofing
    ? Math.round(price * (1 - CLOSE_NOW_WATERPROOFING_RATE))
    : Math.max(0, price - closeNowDiscount(price));

export interface CloseNowInput {
  total: number | null;
  handToOwner: boolean;
  /** O pedido tem impermeabilização: 5% em vez dos euros da tabela. */
  waterproofing?: boolean;
  /** Tapetes: os preços do `rugEstimate`, quando a ferramenta o deu. */
  rug?: { homePrice: number; pickupPrice: number | null } | null;
}

export type CloseNow =
  | { ok: true; total: number | null; homePrice: number | null; pickupPrice: number | null; condition: string; rule: string }
  | { ok: false; reason: string };

const RULE = 'Usa só quando o cliente disse que o problema é o preço, uma vez por conversa, e diz sempre a condição.';

export function closeNowOffer(q: CloseNowInput): CloseNow {
  if (q.rug) {
    if (Math.max(q.rug.homePrice, q.rug.pickupPrice ?? 0) > CLOSE_NOW_MAX_TOTAL) return { ok: false, reason: OWNER_DECIDES };
    return {
      ok: true, total: null,
      homePrice: closeNowPrice(q.rug.homePrice),
      pickupPrice: q.rug.pickupPrice === null ? null : closeNowPrice(q.rug.pickupPrice),
      condition: CLOSE_NOW_CONDITION, rule: RULE,
    };
  }
  if (q.handToOwner || q.total === null) return { ok: false, reason: 'sob orçamento: o preço é do responsável' };
  if (q.total > CLOSE_NOW_MAX_TOTAL) return { ok: false, reason: OWNER_DECIDES };
  return { ok: true, total: closeNowPrice(q.total, q.waterproofing), homePrice: null, pickupPrice: null, condition: CLOSE_NOW_CONDITION, rule: RULE };
}
