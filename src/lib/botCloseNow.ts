/**
 * "Condição para fechar já" (dono, 2026-10-13: "podes baixar o orçamento 10% se
 * o problema for o preço e vemos como isso resulta, mas cria uma condição para
 * fechar, 10% não pode ser um desconto à toa, eu tenho que ganhar com esse fecho
 * rápido").
 *
 * O bot só a usa quando o cliente disse que o problema é o preço, uma vez por
 * conversa, e nunca por iniciativa própria. O que o dono ganha é a condição: a
 * marcação fica feita já, nesta conversa, para um dos dias que temos livres nos
 * próximos 7 dias (agenda cheia mais cedo, sem seguimentos nem clientes a
 * comparar durante dias). Fica de fora o que ele decide sempre sozinho: pedidos
 * acima de 200€ e a impermeabilização (regra de desconto de 11/10/2026), e o
 * que é sob orçamento.
 *
 * O valor sai daqui e não do bot: o código do bot só deixa passar euros que a
 * ferramenta devolveu.
 */
export const CLOSE_NOW_RATE = 0.1;
export const CLOSE_NOW_MAX_TOTAL = 200;
export const CLOSE_NOW_DAYS = 7;
export const CLOSE_NOW_CONDITION =
  `Só se ficar marcado já, nesta conversa, para um dos dias que temos livres nos próximos ${CLOSE_NOW_DAYS} dias.`;

export const closeNowPrice = (price: number) => Math.round(price * (1 - CLOSE_NOW_RATE));

export interface CloseNowInput {
  total: number | null;
  handToOwner: boolean;
  hasWaterproofing: boolean;
  /** Tapetes: os preços do `rugEstimate`, quando a ferramenta o deu. */
  rug?: { homePrice: number; pickupPrice: number | null } | null;
}

export type CloseNow =
  | { ok: true; total: number | null; homePrice: number | null; pickupPrice: number | null; condition: string; rule: string }
  | { ok: false; reason: string };

const RULE = 'Usa só quando o cliente disse que o problema é o preço, uma vez por conversa, e diz sempre a condição.';

export function closeNowOffer(q: CloseNowInput): CloseNow {
  if (q.hasWaterproofing) return { ok: false, reason: 'impermeabilização: o desconto é sempre decisão do responsável' };
  if (q.rug) {
    if (q.rug.homePrice > CLOSE_NOW_MAX_TOTAL) return { ok: false, reason: `acima de ${CLOSE_NOW_MAX_TOTAL}€: decide o responsável` };
    return {
      ok: true, total: null,
      homePrice: closeNowPrice(q.rug.homePrice),
      pickupPrice: q.rug.pickupPrice === null ? null : closeNowPrice(q.rug.pickupPrice),
      condition: CLOSE_NOW_CONDITION, rule: RULE,
    };
  }
  if (q.handToOwner || q.total === null) return { ok: false, reason: 'sob orçamento: o preço é do responsável' };
  if (q.total > CLOSE_NOW_MAX_TOTAL) return { ok: false, reason: `acima de ${CLOSE_NOW_MAX_TOTAL}€: decide o responsável` };
  return { ok: true, total: closeNowPrice(q.total), homePrice: null, pickupPrice: null, condition: CLOSE_NOW_CONDITION, rule: RULE };
}
