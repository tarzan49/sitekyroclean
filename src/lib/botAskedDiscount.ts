/**
 * Descida de preço quando o cliente a pede (dono, 12 Nov 2026: "se for limpeza, baixas uns 10%; se for
 * impermeabilização, baixar desce muito a margem, uns 5%; um pedido de 200€ não é um de 900: num de 900
 * baixas 10%"). Substitui o "acima de 200€ decide o dono" e o closeNow antigo (retirado a 2/11, não volta).
 *
 * - só limpeza: 10%;
 * - com impermeabilização (sozinha ou pack): 5% até 500€ de total, 10% acima de 500€;
 * - total novo arredondado para baixo ao euro, nunca abaixo do mínimo de deslocação do motor;
 * - nunca a juntar a outra condição especial já dada (pedido grande, brinde anti-ácaros): o `quote` dá null.
 *
 * Pura: o `quote` da bot-api chama-a e devolve o resultado em `askedDiscount`.
 */
import { locationPrices } from '../constants/travel';

/** Percentagens da descida a pedido do cliente (dono, 12 Nov 2026). */
export const ASKED_DISCOUNT_PCT = { cleaning: 10, waterproofing: 5, waterproofingAbove: 10 } as const;
/** Acima deste total, um pedido com impermeabilização também desce 10% (dono, 12 Nov 2026). */
export const ASKED_DISCOUNT_WATERPROOFING_BIG_FROM = 500;
/** O total depois da descida nunca fica abaixo do mínimo de deslocação do motor. */
export const ASKED_DISCOUNT_FLOOR = Math.min(...Object.values(locationPrices));
export const ASKED_DISCOUNT_RULE =
  "Só se o preço for a objeção (achou caro, tem orçamento, tem outro orçamento ou pediu melhor preço); uma vez por conversa; diz 'condição especial', nunca 'desconto'.";

export interface AskedDiscount { pct: number; total: number; saving: number; rule: string }

export function askedDiscountFor(total: number, waterproofing: boolean): AskedDiscount | null {
  if (typeof total !== 'number' || !Number.isFinite(total) || total <= 0) return null;
  const pct = !waterproofing
    ? ASKED_DISCOUNT_PCT.cleaning
    : total > ASKED_DISCOUNT_WATERPROOFING_BIG_FROM ? ASKED_DISCOUNT_PCT.waterproofingAbove : ASKED_DISCOUNT_PCT.waterproofing;
  const next = Math.max(ASKED_DISCOUNT_FLOOR, Math.floor((total * (100 - pct)) / 100 + 1e-9));
  const saving = Math.round((total - next) * 100) / 100;
  if (saving <= 0) return null;
  return { pct, total: next, saving, rule: ASKED_DISCOUNT_RULE };
}
