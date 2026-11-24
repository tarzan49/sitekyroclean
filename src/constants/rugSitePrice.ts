// Textos de preço de tapetes e alcatifas no site, a partir das taxas do motor do bot (dono, 24 Nov 2026:
// o site deixa de ser sob orçamento e volta com os valores; alcatifas também, 7€/m²).
import { RUG_RATE_COMMON, RUG_RATE_NATURAL, RUG_RATE_CARPET } from './rugRates';

export const RUG_PRICE_FROM = `Desde ${RUG_RATE_COMMON}€/m²`;
export const RUG_PRICE_NOTE = `${RUG_RATE_COMMON}€/m² em tapete comum, com a deslocação incluída; juta e sisal ${RUG_RATE_NATURAL}€/m².`;
export const CARPET_PRICE_FROM = `Desde ${RUG_RATE_CARPET}€/m²`;
export const CARPET_PRICE_NOTE = `${RUG_RATE_CARPET}€/m² de alcatifa, com a deslocação incluída.`;
