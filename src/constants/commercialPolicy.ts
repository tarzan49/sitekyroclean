// Regras confirmadas pelo responsável em 10/09/2026. Importável também em Node.
import { locationPrices } from './travel';
export const RESPONSE_PROMISE = 'Resposta em menos de 10 minutos';
export const DRYING_PROMISE = 'Secagem média de 3 a 6 horas, dependendo da ventilação, do tecido e das condições do espaço.';
export const SATISFACTION_PROMISE = 'Se não ficar satisfeito, contacte-nos até 48 horas após o serviço e repetimos a intervenção sem custos. Após esse prazo, esta garantia comercial de repetição deixa de se aplicar, sem prejuízo dos direitos legais.';
export const PRICE_PROMISE = 'A simulação é uma estimativa. Confirmamos o preço com base nos artigos, medidas, tratamento e deslocação antes da marcação. O valor confirmado mantém-se para esse serviço; alterações ao pedido são orçamentadas previamente.';
export const AVAILABILITY_PROMISE = 'Procuramos realizar o serviço no próprio dia ou no dia seguinte, mediante disponibilidade confirmada pela equipa.';
export const COVERAGE_PROMISE = 'Equipas em Braga, Porto, Coimbra, Lisboa e Algarve, com cobertura regular do litoral entre Viana do Castelo e o Algarve. Outras localidades mediante confirmação.';
export const WEEKLY_REQUESTS = 'Recebemos habitualmente 50 a 60 pedidos de orçamento por semana.';

export const EN_RESPONSE_PROMISE = 'We reply in under 10 minutes';
export const EN_AVAILABILITY_PROMISE = 'We aim for same-day or next-day service, subject to availability confirmed by the local team.';
export const EN_COVERAGE_PROMISE = 'Teams in Braga, Porto, Coimbra, Lisbon and the Algarve, with regular coverage along the coast from Viana do Castelo to the Algarve. Aveiro, the Alentejo coast and other locations are subject to availability confirmation.';
export const EN_DRYING_PROMISE = 'Average drying time is 3 to 6 hours, depending on ventilation, fabric and room conditions.';
export const TREATMENT_EXTRAS = 'A limpeza remove sujidade e resíduos das fibras. O tratamento anti-ácaros e a desbacterização são extras opcionais, escolhidos e orçamentados separadamente.';

// Tapetes: abaixo de 3 m² não há recolha, só lavagem em casa (dono,
// 2026-09-30). Conta a soma dos tapetes do pedido, não cada um: dois tapetes
// de 2 m² (4 m² no total) já podem ser recolhidos.
export const RUG_PICKUP_MIN_AREA_M2 = 3;
export const RUG_PICKUP_RULE = `Só fazemos recolha quando os tapetes do pedido somam ${RUG_PICKUP_MIN_AREA_M2} m² ou mais; abaixo disso, a lavagem é sempre feita em sua casa.`;

// Custo da recolha e entrega (dono, 2026-10-05): mais 10€ até 6 m², mais 15€
// acima de 6 m² e mais 20€ a partir de 10 m². Conta a soma dos tapetes do
// pedido, como o mínimo acima. A lavagem continua sob orçamento: este é o
// único valor dos tapetes que o site escreve.
/** Acréscimo da recolha para a área total do pedido, ou null quando não há recolha (abaixo do mínimo). */
export function rugPickupFee(totalAreaM2: number): number | null {
  if (!(totalAreaM2 >= RUG_PICKUP_MIN_AREA_M2)) return null;
  if (totalAreaM2 <= 6) return 10;
  if (totalAreaM2 < 10) return 15;
  return 20;
}

export const RUG_PICKUP_FEE_RULE = 'A recolha e entrega custa mais 10€ até 6 m², mais 15€ acima de 6 m² e mais 20€ a partir de 10 m², somando os tapetes do pedido.';

// Os limites da deslocação saem da tabela de cada cidade, nunca de um número
// escrito à mão: o rodapé chegou a ter um parágrafo só sobre Braga
// ("10€... 15€... 20€... Barcelos: 20€") que não passava por aqui.
const travelFees = Object.values(locationPrices);
export const TRAVEL_FEE_MIN = Math.min(...travelFees);
export const TRAVEL_FEE_MAX = Math.max(...travelFees);
export const TRAVEL_PROMISE = `A deslocação é cobrada à parte, entre ${TRAVEL_FEE_MIN}€ e ${TRAVEL_FEE_MAX}€ conforme a localidade. O valor de cada cidade aparece na respetiva página e a morada concreta é confirmada antes da marcação.`;

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
