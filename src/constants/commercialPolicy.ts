// Regras confirmadas pelo responsável em 10/09/2026. Importável também em Node.
import { locationPrices, TRAVEL_FREE_ABOVE, SMALL_ORDER_FAR_MIN, SMALL_ORDER_FAR_SURCHARGE } from './travel';
import { cities } from '../data/serviceCatalog';
export const RESPONSE_PROMISE = 'Resposta em menos de 1 minuto';
export const DRYING_PROMISE = 'Secagem média de 2 a 5 horas, dependendo da ventilação, do tecido e das condições do espaço.';
// Tudo seca em 2 a 5 horas (dono, 15/10/2026; até aí só os sofás, desde 06/10, e o resto em 3 a 6 horas).
export const SOFA_DRYING_RANGE = '2 a 5 horas';
export const SOFA_DRYING_PROMISE = `Secagem média de ${SOFA_DRYING_RANGE}, dependendo da ventilação, do tecido e das condições do espaço.`;
export const SATISFACTION_PROMISE = 'Se não ficar satisfeito, contacte-nos até 48 horas após o serviço e repetimos a intervenção sem custos. Após esse prazo, esta garantia comercial de repetição deixa de se aplicar, sem prejuízo dos direitos legais.';
// Dono, 20 Nov: a repetição das 48 h pede fotografias das zonas, como diz o certificado de limpeza.
export const SATISFACTION_PHOTOS = 'Para pedir a repetição, envie fotografias das zonas em causa dentro dessas 48 horas.';
export const PRICE_PROMISE = 'A simulação é uma estimativa. Confirmamos o preço com base nos artigos, medidas, tratamento e deslocação antes da marcação. O valor confirmado mantém-se para esse serviço; alterações ao pedido são orçamentadas previamente.';
// Sinal (dono, 22 Nov): reservas para daqui a mais de 2 semanas, qualquer valor; 15% com mínimo de 20€, não reembolsável, desconta no total.
export const DEPOSIT_MIN_DAYS_AHEAD = 14;
export const DEPOSIT_RATE = 0.15;
export const DEPOSIT_MIN_EUR = 20;
/** Sinal em euros (arredondado à dezena, mínimo 20€, nunca acima do total) ou 0 se a data for dentro de 2 semanas. */
export function depositFor(total: number, daysAhead: number): number {
  if (daysAhead <= DEPOSIT_MIN_DAYS_AHEAD || total <= 0) return 0;
  return Math.min(total, Math.max(DEPOSIT_MIN_EUR, Math.round((total * DEPOSIT_RATE) / 10) * 10));
}
export const DEPOSIT_RULE = `Para reservas com mais de 2 semanas de antecedência pedimos um sinal de 15% (mínimo ${DEPOSIT_MIN_EUR}€), pago por MB Way ou transferência, que desconta no total. A data fica reservada quando recebemos o comprovativo. O sinal não é reembolsável; se remarcar, passa para a nova data.`;
export const AVAILABILITY_PROMISE = 'Procuramos realizar o serviço no próprio dia ou no dia seguinte, mediante disponibilidade confirmada pela equipa.';
export const COVERAGE_PROMISE = 'Equipas em Braga, Porto, Coimbra, Lisboa e Algarve, com cobertura regular do litoral entre Viana do Castelo e o Algarve. Outras localidades mediante confirmação.';
export const WEEKLY_REQUESTS = 'Recebemos habitualmente 50 a 60 pedidos de orçamento por semana.';

export const EN_RESPONSE_PROMISE = 'We reply in under 1 minute';
export const EN_AVAILABILITY_PROMISE = 'We aim for same-day or next-day service, subject to availability confirmed by the local team.';
export const EN_COVERAGE_PROMISE = 'Teams in Braga, Porto, Coimbra, Lisbon and the Algarve, with regular coverage along the coast from Viana do Castelo to the Algarve. Aveiro, the Alentejo coast and other locations are subject to availability confirmation.';
export const EN_DRYING_PROMISE = 'Average drying time is 2 to 5 hours, depending on ventilation, fabric and room conditions.';
export const TREATMENT_EXTRAS = 'A limpeza remove sujidade e resíduos das fibras. O tratamento anti-ácaros e a desbacterização são extras opcionais, escolhidos e orçamentados separadamente.';

// Tapetes: abaixo de 3 m² não há recolha, só lavagem em casa (dono,
// 2026-09-30). Conta a soma dos tapetes do pedido, não cada um: dois tapetes
// de 2 m² (4 m² no total) já podem ser recolhidos.
export const RUG_PICKUP_MIN_AREA_M2 = 3;
// Acima de 12 m² somados não há recolha, só lavagem em casa (dono, 2026-11-02: "se for acima de 12 m² não ofereces recolha"; antes 20 m², dono,
// 2026-10-10: "para de oferecer recolha para tapetes que sejam acima de 20 m2";
// "o total dos tapetes").
export const RUG_PICKUP_MAX_AREA_M2 = 12;
// Dono, 17/11/2026: "não estamos a fazer recolhas neste momento"; se houver, só no Porto e até 12 m².
export const RUG_PICKUP_RULE = `Neste momento não estamos a fazer recolhas de tapetes: a lavagem é feita em sua casa. A única exceção é a zona do Porto, com tapetes que somem entre ${RUG_PICKUP_MIN_AREA_M2} e ${RUG_PICKUP_MAX_AREA_M2} m².`;

// Recolha e entrega: mais 20€ do que a lavagem em casa, em qualquer área em
// que haja recolha (dono, 2026-10-10: "deixa mais 20 euros", "muda também no
// site"; de 2026-10-05 a essa data era 10€ até 6 m², 15€ acima e 20€ a partir
// de 10 m²). Entrega em até 5 dias úteis. A lavagem continua
// sob orçamento, e na lavagem em casa a deslocação também (RUG_TRAVEL_RULE):
// este é o único valor dos tapetes que o site escreve.
/** Acréscimo da recolha para a área total do pedido, ou null quando não há recolha (abaixo do mínimo ou acima do máximo). */
export const RUG_PICKUP_FEE = 20;
// Recolha de tapetes só na zona do Porto; em qualquer outro sítio a opção nem aparece (dono, 17/11/2026:
// "se for um sítio que não seja o Porto, nem coloques essa opção").
export const RUG_PICKUP_AREAS: ReadonlySet<string> = new Set(['porto']);
const foldCity = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const CITY_AREA = new Map(cities.map(c => [foldCity(c.name), c.area] as const));
/** true só quando a localidade fica na zona do Porto; sem localidade ou fora do Porto, false. */
export function rugPickupOffered(city: string | null | undefined): boolean {
  if (!city) return false;
  const area = CITY_AREA.get(foldCity(city));
  return !!area && RUG_PICKUP_AREAS.has(area);
}
export const NO_RUG_PICKUP_RULE = 'Neste momento não estamos a fazer recolhas de tapetes: só na zona do Porto, com tapetes que somem entre 3 e 12 m². Fora da zona do Porto a lavagem é feita em casa do cliente, com o mesmo processo e o mesmo resultado; nunca ofereças nem fales de recolha.';
// Dono, 17/11/2026: "sempre que o cliente pede recolha, tenta mostrar-lhe que o serviço em casa é exatamente igual".
export const RUG_PICKUP_ASKED_RULE = 'Sempre que o cliente pedir recolha, mostra-lhe primeiro que o serviço em casa é exatamente igual: o mesmo equipamento, o mesmo processo e o mesmo resultado, seco em 2 a 5 horas e sem ficar dias sem o tapete.';
export function rugPickupFee(totalAreaM2: number, city?: string | null): number | null {
  if (!(totalAreaM2 >= RUG_PICKUP_MIN_AREA_M2) || totalAreaM2 > RUG_PICKUP_MAX_AREA_M2) return null;
  if (!rugPickupOffered(city)) return null;
  return RUG_PICKUP_FEE;
}

export const RUG_PICKUP_FEE_RULE = `A recolha e entrega tem um custo adicional de ${RUG_PICKUP_FEE}€.`;

// Tapetes e alcatifas: preço do motor, com a deslocação da localidade à parte (dono, 25 Nov 2026).
export const RUG_SERVICE_SLUGS = ['limpeza-tapetes', 'limpeza-alcatifas'];
export const RUG_TRAVEL_RULE = 'Os tapetes e as alcatifas sozinhos pagam sempre a deslocação da localidade.';

// Os limites da deslocação saem da tabela de cada cidade, nunca de um número
// escrito à mão: o rodapé chegou a ter um parágrafo só sobre Braga
// ("10€... 15€... 20€... Barcelos: 20€") que não passava por aqui.
const travelFees = Object.values(locationPrices);
export const TRAVEL_FEE_MIN = Math.min(...travelFees);
export const TRAVEL_FEE_MAX = Math.max(...travelFees);
/** A frase única da deslocação (dono, 25 Nov 2026: o preço mostrado é o do serviço). "Pode ser": a impermeabilização sozinha,
 *  os tapetes e as localidades mais longe seguem regras próprias do motor. */
export const TRAVEL_RULE = `A deslocação é calculada à parte conforme a localidade (a partir de ${TRAVEL_FEE_MIN}€) e pode ser grátis em pedidos acima de certo valor (desde ${Math.min(...Object.values(TRAVEL_FREE_ABOVE))}€, conforme a localidade e o serviço).`;
/** Junto de tabelas com vários preços. */
export const TRAVEL_NOTE = 'Valores do serviço; deslocação à parte, conforme a localidade.';
export const TRAVEL_PROMISE = `A deslocação é cobrada à parte, entre ${TRAVEL_FEE_MIN}€ e ${TRAVEL_FEE_MAX}€ conforme a localidade, e pode ser grátis em pedidos acima de certo valor. O valor de cada cidade aparece na respetiva página e a morada concreta é confirmada antes da marcação. Nas zonas a mais de 20 km da equipa, um serviço abaixo de ${SMALL_ORDER_FAR_MIN}€ tem mais ${SMALL_ORDER_FAR_SURCHARGE}€; juntando outra peça na mesma visita, deixa de ter. ${RUG_TRAVEL_RULE}`;

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
