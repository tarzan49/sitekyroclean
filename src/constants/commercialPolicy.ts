// Regras confirmadas pelo responsável em 10/09/2026. Importável também em Node.
import { locationPrices } from './travel';
export const RESPONSE_PROMISE = 'Resposta em menos de 5 minutos';
export const DRYING_PROMISE = 'Secagem média de 3 a 6 horas, dependendo da ventilação, do tecido e das condições do espaço.';
// Sofás secam mais depressa (dono, 06/10/2026: "a secagem é 2-5 horas"). Os outros artigos ficam em DRYING_PROMISE.
export const SOFA_DRYING_RANGE = '2 a 5 horas';
export const SOFA_DRYING_PROMISE = `Secagem média de ${SOFA_DRYING_RANGE}, dependendo da ventilação, do tecido e das condições do espaço.`;
export const SATISFACTION_PROMISE = 'Se não ficar satisfeito, contacte-nos até 48 horas após o serviço e repetimos a intervenção sem custos. Após esse prazo, esta garantia comercial de repetição deixa de se aplicar, sem prejuízo dos direitos legais.';
export const PRICE_PROMISE = 'A simulação é uma estimativa. Confirmamos o preço com base nos artigos, medidas, tratamento e deslocação antes da marcação. O valor confirmado mantém-se para esse serviço; alterações ao pedido são orçamentadas previamente.';
export const AVAILABILITY_PROMISE = 'Procuramos realizar o serviço no próprio dia ou no dia seguinte, mediante disponibilidade confirmada pela equipa.';
export const COVERAGE_PROMISE = 'Equipas em Braga, Porto, Coimbra, Lisboa e Algarve, com cobertura regular do litoral entre Viana do Castelo e o Algarve. Outras localidades mediante confirmação.';
export const WEEKLY_REQUESTS = 'Recebemos habitualmente 50 a 60 pedidos de orçamento por semana.';

export const EN_RESPONSE_PROMISE = 'We reply in under 5 minutes';
export const EN_AVAILABILITY_PROMISE = 'We aim for same-day or next-day service, subject to availability confirmed by the local team.';
export const EN_COVERAGE_PROMISE = 'Teams in Braga, Porto, Coimbra, Lisbon and the Algarve, with regular coverage along the coast from Viana do Castelo to the Algarve. Aveiro, the Alentejo coast and other locations are subject to availability confirmation.';
export const EN_DRYING_PROMISE = 'Average drying time is 3 to 6 hours, depending on ventilation, fabric and room conditions.';
export const TREATMENT_EXTRAS = 'A limpeza remove sujidade e resíduos das fibras. O tratamento anti-ácaros e a desbacterização são extras opcionais, escolhidos e orçamentados separadamente.';

// Tapetes: abaixo de 3 m² não há recolha, só lavagem em casa (dono,
// 2026-09-30). Conta a soma dos tapetes do pedido, não cada um: dois tapetes
// de 2 m² (4 m² no total) já podem ser recolhidos.
export const RUG_PICKUP_MIN_AREA_M2 = 3;
// Acima de 20 m² somados também não há recolha, só lavagem em casa (dono,
// 2026-10-10: "para de oferecer recolha para tapetes que sejam acima de 20 m2";
// "o total dos tapetes").
export const RUG_PICKUP_MAX_AREA_M2 = 20;
export const RUG_PICKUP_RULE = `Só fazemos recolha quando os tapetes do pedido somam entre ${RUG_PICKUP_MIN_AREA_M2} e ${RUG_PICKUP_MAX_AREA_M2} m²; fora disso, a lavagem é sempre feita em sua casa.`;

// Recolha e entrega: mais 20€ do que a lavagem em casa, em qualquer área em
// que haja recolha (dono, 2026-10-10: "deixa mais 20 euros", "muda também no
// site"; de 2026-10-05 a essa data era 10€ até 6 m², 15€ acima e 20€ a partir
// de 10 m²). Entrega em até 4 dias úteis. A lavagem continua
// sob orçamento, e na lavagem em casa a deslocação também (RUG_TRAVEL_RULE):
// este é o único valor dos tapetes que o site escreve.
/** Acréscimo da recolha para a área total do pedido, ou null quando não há recolha (abaixo do mínimo ou acima do máximo). */
export const RUG_PICKUP_FEE = 20;
export function rugPickupFee(totalAreaM2: number): number | null {
  if (!(totalAreaM2 >= RUG_PICKUP_MIN_AREA_M2) || totalAreaM2 > RUG_PICKUP_MAX_AREA_M2) return null;
  return RUG_PICKUP_FEE;
}

export const RUG_PICKUP_FEE_RULE = `A recolha e entrega tem um custo adicional de ${RUG_PICKUP_FEE}€.`;

// Tapetes e alcatifas: na lavagem em casa a deslocação não tem valor de
// tabela, entra no orçamento (dono, 2026-10-05). Os outros serviços continuam
// com a deslocação de `locationPrices`.
export const RUG_SERVICE_SLUGS = ['limpeza-tapetes', 'limpeza-alcatifas'];
export const RUG_TRAVEL_RULE = 'Em tapetes e alcatifas, a deslocação também é sob orçamento.';

// Os limites da deslocação saem da tabela de cada cidade, nunca de um número
// escrito à mão: o rodapé chegou a ter um parágrafo só sobre Braga
// ("10€... 15€... 20€... Barcelos: 20€") que não passava por aqui.
const travelFees = Object.values(locationPrices);
export const TRAVEL_FEE_MIN = Math.min(...travelFees);
export const TRAVEL_FEE_MAX = Math.max(...travelFees);
export const TRAVEL_PROMISE = `A deslocação é cobrada à parte, entre ${TRAVEL_FEE_MIN}€ e ${TRAVEL_FEE_MAX}€ conforme a localidade. O valor de cada cidade aparece na respetiva página e a morada concreta é confirmada antes da marcação. Em tapetes e alcatifas, a deslocação também é sob orçamento.`;

/**
 * O bloco "Condições do serviço e garantia" que aparece no fundo de todas as
 * páginas. Uma lista só, desenhada pelo `BusinessConditions.tsx` (rodapé React)
 * e pelo `scripts/prerender.ts` e `scripts/landing-page-html.ts` (HTML
 * estático). Antes eram duas listas diferentes: o React tinha as garantias e
 * um parágrafo sobre as deslocações de Braga, o estático tinha a cobertura, o
 * tempo de resposta e "Deslocação a partir de 10€".
 */
export const SERVICE_CONDITIONS: readonly string[] = [
  PRICE_PROMISE,
  TRAVEL_PROMISE,
  SATISFACTION_PROMISE,
  DRYING_PROMISE,
  AVAILABILITY_PROMISE,
  `${RESPONSE_PROMISE}.`,
  COVERAGE_PROMISE,
  TREATMENT_EXTRAS,
];

export const SERVICE_CONDITIONS_LINKS: readonly { href: string; label: string }[] = [
  { href: '/tratamento-anti-acaros', label: 'Tratamento anti-ácaros' },
  { href: '/desbacterizacao', label: 'Desbacterização' },
];
