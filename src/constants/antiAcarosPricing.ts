// Anti-ácaros: a fonte única dos preços, para sofás, cadeiras e colchões.
//
// Lido pelo quiz (ecrãs de tratamento e totais em use-quiz-pricing.ts), pelo
// configurador de packs (lib/customPack.ts) e pelo recibo do pedido
// (buildReceiptLines em services/submissionService.ts). Antes de 2026-09-26 o
// configurador vendia anti-ácaros no sofá e nas cadeiras e o quiz não, e o
// widget de preços ainda guardava uma terceira tabela (10€ + 7,50€ por
// cadeira) que nunca chegava a correr: a mesma pessoa podia ver três preços
// para o mesmo tratamento.
//
// Em cada artigo o tratamento é uma escolha só: limpeza, impermeabilização
// (Premium ou Essencial) ou anti-ácaros. Anti-ácaros e impermeabilização
// nunca se somam no mesmo artigo.
//
// Ficheiro sem imports com alias `@/`, de propósito: o prerender corre em Node.

/** Sofá: acréscimo por sofá sobre a limpeza, por tamanho. "4+ lugares" não
 * tem preço aqui e fica sob orçamento. */
export const SOFA_ANTI_ACAROS_PRICE: Record<string, number> = {
  '1-lugar': 20,
  '2-lugares': 40,
  '3-lugares': 50,
};

/** Cadeiras: 5€ por cadeira, fixo, sem escalões. Pedido explícito do dono,
 * repetido duas vezes: ao cliente mostra-se sempre a taxa unitária
 * ("5€/un."), nunca um total calculado. */
export const CHAIR_ANTI_ACAROS_UNIT_PRICE = 5;
export const CHAIR_ANTI_ACAROS_UNIT_LABEL = `${CHAIR_ANTI_ACAROS_UNIT_PRICE}€/un.`;

export function sofaAntiAcarosPrice(sizeId: string): number | null {
  return SOFA_ANTI_ACAROS_PRICE[sizeId] ?? null;
}

/** Total interno das cadeiras (entra no subtotal e no recibo). Na interface
 * do tratamento mostra-se CHAIR_ANTI_ACAROS_UNIT_LABEL, nunca este valor. */
export function chairAntiAcarosTotal(qty: number): number | null {
  return Number.isSafeInteger(qty) && qty > 0 ? qty * CHAIR_ANTI_ACAROS_UNIT_PRICE : null;
}

/** Colchão: o preço "limpeza + anti-ácaros" vive em `mattressPrices.bothPrice`
 * (QuizTypes.ts); o acréscimo é a diferença para a limpeza. */
export function mattressAntiAcarosPrice(option: { cleaningPrice: number | string; bothPrice: number | string }): number | null {
  return typeof option.cleaningPrice === 'number' && typeof option.bothPrice === 'number'
    ? option.bothPrice - option.cleaningPrice
    : null;
}
