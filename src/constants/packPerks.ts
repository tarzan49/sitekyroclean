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
// A 2026-09-26 a própria regra passou a viver aqui (`priceWithPackPerks`): o
// configurador dava o preço de pack a tudo o que viesse depois da primeira
// linha, incluindo um segundo sofá, enquanto o quiz mantém o serviço
// principal inteiro ao preço de tabela. Sofá 3 lugares + sofá 2 lugares dava
// 134€ num e 148€ no outro.
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

/** Tapete acrescentado: por cada 5 m² medidos, pagam-se 4. O tapete continua
 * sempre sob orçamento; a regalia é sobre o orçamento que vier a ser feito,
 * não um preço por m² (dono, 2026-09-23). */
export const PACK_PERK_RUG_SET_M2 = 5;
export const PACK_PERK_RUG_NOTE = `Limpe ${PACK_PERK_RUG_SET_M2} m², pague ${PACK_PERK_RUG_SET_M2 - 1}`;

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

/** Área de tapete que se paga com a regalia (5 m² medidos, 4 pagos). */
export function perkRugPaidArea(area: number): number {
  return area - Math.floor(area / PACK_PERK_RUG_SET_M2);
}

// ── A regra ──────────────────────────────────────────────────────────────────

export type PerkTreatment = 'none' | 'waterproofing' | 'anti-acaros';

export interface PerkLineInput {
  /** 'sofa' | 'mattress' | 'chairs' | 'rug' | 'carpet', ou o serviço
   * principal quando não é nenhum destes. */
  kind: string;
  /** Tamanho do sofá, para o preço fixo de pack. */
  sizeId?: string;
  qty: number;
  /** Preço de tabela da linha inteira (todas as unidades, já com o
   * tratamento). `null` = sob orçamento. */
  tablePrice: number | null;
  treatment?: PerkTreatment;
}

export interface PerkLineResult {
  /** O que se cobra por esta linha. `null` = sob orçamento. */
  amount: number | null;
  tablePrice: number | null;
  /** Linha do serviço principal: fica sempre ao preço de tabela. */
  isMain: boolean;
  perkApplied: boolean;
  /** "preço de pack", "1 oferecida", ou a regalia do tapete. */
  perkNote: string | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * A regra do pack, a mesma no quiz (ecrã "Aproveite a mesma visita") e no
 * configurador das páginas de pack:
 *
 * - o serviço principal (`mainKind`, por omissão o tipo da primeira linha)
 *   fica ao preço de tabela em todas as unidades e tamanhos;
 * - cada artigo de outro tipo entra com preço de pack, mas só quando o
 *   subtotal de tabela chega a PACK_PERK_MIN_ORDER;
 * - o preço de pack é sobre a limpeza: um sofá ou cadeiras com tratamento
 *   mantêm o preço de tabela; um colchão com anti-ácaros mantém o desconto
 *   (dono, 2026-09-24); o tapete fica sob orçamento com a regalia por m².
 */
export function priceWithPackPerks(lines: PerkLineInput[], mainKind: string | undefined = lines[0]?.kind) {
  const tableSubtotal = round2(lines.reduce((sum, line) => sum + (line.tablePrice ?? 0), 0));
  const eligible = tableSubtotal >= PACK_PERK_MIN_ORDER;
  const results: PerkLineResult[] = lines.map(line => {
    const isMain = line.kind === mainKind;
    const table: PerkLineResult = { amount: line.tablePrice, tablePrice: line.tablePrice, isMain, perkApplied: false, perkNote: null };
    if (isMain || !eligible) return table;
    if (line.kind === 'rug') return { ...table, perkNote: PACK_PERK_RUG_NOTE };
    if (line.tablePrice === null) return table;
    const treatment = line.treatment ?? 'none';
    let amount = line.tablePrice;
    if (line.kind === 'sofa' && treatment === 'none' && line.sizeId && PACK_PERK_SOFA_PRICE[line.sizeId] !== undefined) {
      amount = PACK_PERK_SOFA_PRICE[line.sizeId] * line.qty;
    } else if (line.kind === 'mattress' && (treatment === 'none' || treatment === 'anti-acaros')) {
      amount = line.tablePrice - PACK_PERK_MATTRESS_OFF * line.qty;
    } else if (line.kind === 'chairs' && treatment === 'none') {
      amount = perkChairsPrice(line.tablePrice, line.qty);
    }
    amount = round2(amount);
    const perkApplied = amount < line.tablePrice;
    const free = perkChairsFree(line.qty);
    const perkNote = !perkApplied ? null
      : line.kind === 'chairs' ? `${free} oferecida${free > 1 ? 's' : ''}`
      : 'preço de pack';
    return { ...table, amount, perkApplied, perkNote };
  });
  return { lines: results, tableSubtotal, eligible };
}

// ── O que se diz ao cliente ─────────────────────────────────────────────────

/** A regra numa frase, para a FAQ e para o prerender das páginas de pack. */
export const PACK_PERK_RULE = `A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, o artigo principal fica ao preço de tabela, em todas as unidades e tamanhos, e cada artigo de outro tipo que juntar à mesma visita entra com preço de pack: sofás a partir de ${PACK_PERK_SOFA_PRICE['1-lugar']}€, menos ${PACK_PERK_MATTRESS_OFF}€ em cada colchão, uma cadeira oferecida por cada conjunto de ${PACK_PERK_CHAIRS_SET} e, nos tapetes, ${PACK_PERK_RUG_NOTE.toLowerCase()}.`;

/** Subtítulo curto: quem paga tabela e quem paga preço de pack. */
export const PACK_PERK_SUMMARY = `A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, o artigo principal fica ao preço de tabela e os artigos de outro tipo que acrescentar entram com preço de pack.`;

/** Os preços de pack, sem a condição, para um cartão de regalias. */
export const PACK_PERK_PRICES = `Sofá a partir de ${PACK_PERK_SOFA_PRICE['1-lugar']}€, menos ${PACK_PERK_MATTRESS_OFF}€ em cada colchão, uma cadeira oferecida por cada ${PACK_PERK_CHAIRS_SET} e, nos tapetes, ${PACK_PERK_RUG_NOTE.toLowerCase()}.`;

export const PACK_PERK_BULLETS = [
  `Preço de pack a partir de ${PACK_PERK_MIN_ORDER}€ de subtotal (abaixo disso, preço de tabela normal).`,
  'O artigo principal fica ao preço de tabela, em todas as unidades e tamanhos. O preço de pack é para os artigos de outro tipo.',
  `Sofá acrescentado: ${PACK_PERK_SOFA_PRICE['1-lugar']}€ o de 1 lugar, ${PACK_PERK_SOFA_PRICE['2-lugares']}€ o de 2 lugares, ${PACK_PERK_SOFA_PRICE['3-lugares']}€ o de 3 lugares.`,
  `Colchão acrescentado: menos ${PACK_PERK_MATTRESS_OFF}€ por unidade, em qualquer tamanho.`,
  `Cadeiras acrescentadas: uma oferecida por cada conjunto de ${PACK_PERK_CHAIRS_SET}.`,
  `Tapete acrescentado: ${PACK_PERK_RUG_NOTE.toLowerCase()}, sempre sob orçamento.`,
  'Uma só deslocação para a visita toda, cobrada uma única vez.',
];

/** O limite da regalia, dito pelo nome. Aparece na página, não só no código. */
export const PACK_PERK_LIMIT = 'O preço de pack é para limpeza. Um sofá ou cadeiras acrescentados com impermeabilização ou anti-ácaros mantêm o preço de tabela desse tratamento; um colchão acrescentado com anti-ácaros mantém o desconto de pack.';
