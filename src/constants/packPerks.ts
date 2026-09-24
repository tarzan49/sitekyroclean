// Regalias de pack — fonte única dos preços que um artigo passa a ter quando
// é acrescentado a outro na mesma visita.
//
// Estes números nasceram no ecrã de upsell do quiz (QuizComboUpsellScreen,
// pedido explícito do dono a 2026-09-08/10: nada de desconto sobre o pedido
// todo, cada artigo extra vem com o seu próprio preço reduzido, sempre ao lado
// do preço de tabela). A 2026-09-23 passaram a valer também no configurador de
// packs, e por isso saíram de dentro do componente do quiz para aqui: o quiz e
// as páginas de pack têm de fazer a mesma conta, senão a mesma pessoa vê dois
// preços para o mesmo pedido.
//
// Ficheiro sem imports com alias `@/`, de propósito: o prerender lê-o em Node.

/** Preço de pack só se pratica a partir deste subtotal de tabela (artigo
 * principal + tudo o resto, sempre ao preço de tabela, artigos sob
 * orçamento não contam por não terem preço para somar). Pedido explícito do
 * dono (2026-09-24): quem monta um pack pequeno não pode ficar com vantagem
 * sobre quem pede um orçamento normal do mesmo pedido pequeno — sem isto,
 * qualquer pessoa "ganhava" ao adicionar um segundo artigo mínimo só para
 * destravar o preço reduzido. Abaixo disto, todos os artigos ficam ao preço
 * de tabela, como num orçamento normal. */
export const PACK_PERK_MIN_ORDER = 100;

/** Colchão acrescentado: menos 14€ por unidade sobre o preço de tabela. */
export const PACK_PERK_MATTRESS_OFF = 14;

/** Sofá acrescentado: preço fixo por tamanho. "4+ lugares" fica sob orçamento. */
export const PACK_PERK_SOFA_PRICE: Record<string, number> = { '1-lugar': 35, '2-lugares': 55, '3-lugares': 65 };

/** Cadeiras acrescentadas: uma oferta por cada conjunto de 4. */
export const PACK_PERK_CHAIRS_SET = 4;

export function perkMattressPrice(tablePrice: number): number {
  return tablePrice - PACK_PERK_MATTRESS_OFF;
}

export function perkSofaPrice(sizeId: string, tablePrice: number): number {
  return PACK_PERK_SOFA_PRICE[sizeId] ?? tablePrice;
}

/** Mantém o preço médio por cadeira e desconta as ofertas do conjunto. */
export function perkChairsPrice(tableTotal: number, qty: number): number {
  if (qty <= 0) return 0;
  const free = Math.floor(qty / PACK_PERK_CHAIRS_SET);
  return Math.round(tableTotal * (qty - free) / qty * 100) / 100;
}

export function perkChairsFree(qty: number): number {
  return Math.max(0, Math.floor(qty / PACK_PERK_CHAIRS_SET));
}

export const PACK_PERK_RULE = `A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, o primeiro artigo fica ao preço de tabela e cada artigo que acrescentar à mesma visita entra com preço de pack: sofás a partir de ${PACK_PERK_SOFA_PRICE['1-lugar']}€, menos ${PACK_PERK_MATTRESS_OFF}€ em cada colchão e uma cadeira oferecida por cada conjunto de ${PACK_PERK_CHAIRS_SET}.`;

export const PACK_PERK_BULLETS = [
  `Preço de pack a partir de ${PACK_PERK_MIN_ORDER}€ de subtotal (abaixo disso, preço de tabela normal).`,
  `Sofá acrescentado: ${PACK_PERK_SOFA_PRICE['1-lugar']}€ o de 1 lugar, ${PACK_PERK_SOFA_PRICE['2-lugares']}€ o de 2 lugares, ${PACK_PERK_SOFA_PRICE['3-lugares']}€ o de 3 lugares.`,
  `Colchão acrescentado: menos ${PACK_PERK_MATTRESS_OFF}€ por unidade, em qualquer tamanho.`,
  `Cadeiras acrescentadas: uma oferecida por cada conjunto de ${PACK_PERK_CHAIRS_SET}.`,
  'Uma só deslocação para a visita toda, cobrada uma única vez.',
];

/** O limite da regalia, dito pelo nome. Aparece na página, não só no código. */
export const PACK_PERK_LIMIT = 'O preço de pack é para limpeza. Um sofá ou cadeiras acrescentados com impermeabilização ou anti-ácaros mantêm o preço de tabela desse tratamento; um colchão acrescentado com anti-ácaros mantém o desconto de pack.';
