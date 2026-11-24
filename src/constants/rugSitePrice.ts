// Textos de preço de tapetes no site, a partir da taxa do motor do bot (dono, 24 Nov 2026:
// o site deixa de ser sob orçamento para tapetes e volta com os valores). Alcatifas continuam sob orçamento.
import { RUG_RATE_COMMON, RUG_RATE_NATURAL } from './rugRates';

export const RUG_PRICE_FROM = `Desde ${RUG_RATE_COMMON}€/m²`;
export const RUG_PRICE_NOTE = `${RUG_RATE_COMMON}€/m² em tapete comum, com a deslocação incluída; juta e sisal ${RUG_RATE_NATURAL}€/m².`;
